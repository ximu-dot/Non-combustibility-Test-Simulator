using NctSim.Global;
using NctSim.Models;
using Serilog;

namespace NctSim.Services;

/// <summary>
/// 温度仿真引擎 - 生成 5 通道温度数据
/// 分阶段算法：升温、稳定、记录、降温
/// </summary>
public class SensorSimulator
{
    private readonly SimulationConfig _config;
    private readonly Random _random = new();

    // 当前温度值
    public double TF1 { get; private set; }
    public double TF2 { get; private set; }
    public double TS { get; private set; }
    public double TC { get; private set; }
    public double TCal { get; private set; }

    // 稳定性
    public bool IsStable { get; private set; }
    public int StableTickCount { get; private set; }

    // PID 输出队列（用于计算恒功率）
    private readonly Queue<double> _pidOutputQueue = new();
    private const int MaxPidQueueSize = 600;

    // 温漂历史
    private readonly List<double> _tf1History = new();
    private const int DriftWindow = 600;

    public SensorSimulator(SimulationConfig config)
    {
        _config = config;
        Reset();
    }

    /// <summary>
    /// 重置仿真引擎到初始状态
    /// </summary>
    public void Reset()
    {
        TF1 = _config.InitialFurnaceTemp;
        TF2 = _config.InitialFurnaceTemp;
        TS = _config.InitialFurnaceTemp * 0.3;
        TC = _config.InitialFurnaceTemp * 0.25;
        TCal = _config.InitialFurnaceTemp;
        IsStable = false;
        StableTickCount = 0;
        _recordingDriftAccum = 0;
        _pidOutputQueue.Clear();
        _tf1History.Clear();
    }

    /// <summary>
    /// 每 800ms 执行一次仿真更新
    /// </summary>
    public void Update(TestState state)
    {
        double noise()
        {
            return (_random.NextDouble() * 2 - 1) * _config.TempFluctuation;
        }

        switch (state)
        {
            case TestState.Idle:
                UpdateCoolingPhase(noise);
                break;

            case TestState.Preparing:
                UpdateHeatingPhase(noise);
                CheckStability();
                break;

            case TestState.Ready:
                UpdateStablePhase(noise);
                CheckStability();
                break;

            case TestState.Recording:
                UpdateRecordingPhase(noise);
                break;

            case TestState.Complete:
                UpdateStablePhase(noise);
                break;
        }

        // 更新温漂历史
        _tf1History.Add(TF1);
        if (_tf1History.Count > DriftWindow)
            _tf1History.RemoveAt(0);

        // 记录 PID 输出
        _pidOutputQueue.Enqueue(TF1);
        if (_pidOutputQueue.Count > MaxPidQueueSize)
            _pidOutputQueue.Dequeue();
    }

    /// <summary>
    /// 升温阶段
    /// </summary>
    private void UpdateHeatingPhase(Func<double> noise)
    {
        double rate = _config.HeatingRatePerSecond * 0.8;
        // 钳位到目标温度，避免超过后永远无法稳定
        if (TF1 < _config.TargetFurnaceTemp)
        {
            TF1 += rate + noise();
            if (TF1 > _config.TargetFurnaceTemp) TF1 = _config.TargetFurnaceTemp;
        }
        else
        {
            TF1 = _config.TargetFurnaceTemp + noise();
        }
        if (TF2 < _config.TargetFurnaceTemp)
        {
            TF2 += rate + noise();
            if (TF2 > _config.TargetFurnaceTemp) TF2 = _config.TargetFurnaceTemp;
        }
        else
        {
            TF2 = _config.TargetFurnaceTemp + noise();
        }
        TS = TF1 * 0.3 + noise();
        TC = TF1 * 0.25 + noise();
        TCal = TF1 + noise() * 2;
    }

    /// <summary>
    /// 稳定阶段（钳位到目标温度）
    /// </summary>
    private void UpdateStablePhase(Func<double> noise)
    {
        TF1 = _config.TargetFurnaceTemp + noise();
        TF2 = _config.TargetFurnaceTemp + noise();
        TS = TF1 * 0.3 + noise();
        TC = TF1 * 0.25 + noise();
        TCal = TF1 + noise() * 2;
    }

    private double _recordingDriftAccum = 0;  // 记录阶段漂移累积

    /// <summary>
    /// 记录阶段（样品温度指数逼近）
    /// </summary>
    private void UpdateRecordingPhase(Func<double> noise)
    {
        // 炉温保持 + 微小漂移（模拟真实炉温波动）
        _recordingDriftAccum += (_random.NextDouble() - 0.5) * 0.02;
        _recordingDriftAccum = Math.Clamp(_recordingDriftAccum, -1.5, 1.5);
        TF1 = _config.TargetFurnaceTemp + _recordingDriftAccum + noise();
        TF2 = _config.TargetFurnaceTemp + _recordingDriftAccum + noise();

        // 表面温指数逼近
        double surfaceTarget = Math.Min(TF1 * 0.95, 800.0);
        TS += (surfaceTarget - TS) * 0.02 + noise();

        // 中心温指数逼近（更慢）
        double centerTarget = Math.Min(TF1 * 0.85, 750.0);
        TC += (centerTarget - TC) * 0.01 + noise();

        TCal = TF1 + noise() * 2;
    }

    /// <summary>
    /// 降温阶段
    /// </summary>
    private void UpdateCoolingPhase(Func<double> noise)
    {
        TF1 -= 0.5 + noise() * 0.1;
        TF2 -= 0.5 + noise() * 0.1;
        if (TF1 < 25) TF1 = 25;
        if (TF2 < 25) TF2 = 25;
        TS = TF1 * 0.3 + noise();
        TC = TF1 * 0.25 + noise();
        TCal = TF1 + noise() * 2;
    }

    /// <summary>
    /// 检查温度稳定性
    /// </summary>
    private void CheckStability()
    {
        bool inRange = TF1 >= (_config.TargetFurnaceTemp - _config.StableThreshold) &&
                       TF1 <= (_config.TargetFurnaceTemp + _config.StableThreshold);

        if (inRange)
        {
            StableTickCount++;
        }
        else
        {
            StableTickCount = 0;
        }

        // 连续 4 次 tick（约 3.2 秒）在范围内认为稳定
        IsStable = StableTickCount > 3;
    }

    /// <summary>
    /// 获取 5 通道温度值
    /// </summary>
    public double[] GetAllTemps()
    {
        return new[] { TF1, TF2, TS, TC, TCal };
    }

    /// <summary>
    /// 获取指定通道温度
    /// </summary>
    public double GetTemp(int channel)
    {
        return channel switch
        {
            0 => TF1,
            1 => TF2,
            2 => TS,
            3 => TC,
            4 => TCal,
            _ => 0
        };
    }

    /// <summary>
    /// 计算恒功率值（PID 队列平均值）
    /// </summary>
    public double CalculateConstPower()
    {
        if (_pidOutputQueue.Count == 0) return 0;
        return _pidOutputQueue.Average();
    }

    /// <summary>
    /// 获取最近 N 个炉温1 值用于温漂计算
    /// </summary>
    public List<double> GetRecentTF1History(int count)
    {
        count = Math.Min(count, _tf1History.Count);
        return _tf1History.Skip(_tf1History.Count - count).ToList();
    }

    /// <summary>
    /// 开始降温
    /// </summary>
    public void StartCooling()
    {
        IsStable = false;
        StableTickCount = 0;
        Log.Information("仿真引擎：开始降温");
    }
}
