using NctSim.Global;
using NctSim.Models;
using Serilog;

namespace NctSim.Services;

/// <summary>
/// 数据采集工作线程 - 每 800ms 运行一次
/// 负责调用仿真引擎、写入 CSV、广播数据到 UI
/// </summary>
public class DaqWorker
{
    private readonly SimulationConfig _simConfig;
    private readonly FileStorageConfig _fileConfig;
    private readonly SensorSimulator _simulator;
    private readonly TemperatureAnalyzer _analyzer;
    private CsvWriter? _csvWriter;
    private Thread? _workerThread;
    private volatile bool _isRunning;
    private readonly object _lock = new();

    // 当前试验信息
    private string _currentProductId = string.Empty;
    private string _currentTestId = string.Empty;
    private int _elapsedSeconds;
    private int _testDurationSeconds = 3600; // 默认 60 分钟
    private TestMode _testMode = TestMode.Standard60Min;

    // 温度历史
    private readonly List<double> _tf1History = new();
    private readonly List<double> _tf2History = new();

    // 最大值追踪
    private double _maxTf1, _maxTf2, _maxTs, _maxTc;
    private int _maxTf1Time, _maxTf2Time, _maxTsTime, _maxTcTime;

    // Recording 结束时的温度快照（避免 Complete 状态下 TS/TC 骤降影响判定）
    private double[]? _snapshotTemps;
    private int _snapshotTime;

    /// <summary>
    /// 数据广播事件（在后台线程触发）
    /// </summary>
    public event EventHandler<DataBroadcastEventArgs>? DataBroadcast;

    public DaqWorker(SimulationConfig simConfig, FileStorageConfig fileConfig)
    {
        _simConfig = simConfig;
        _fileConfig = fileConfig;
        _simulator = new SensorSimulator(simConfig);
        _analyzer = new TemperatureAnalyzer(simConfig.MaxTemperatureDriftPerTenMinutes);
    }

    /// <summary>
    /// 启动数据采集
    /// </summary>
    public void Start()
    {
        lock (_lock)
        {
            if (_isRunning) return;
            _isRunning = true;
            _workerThread = new Thread(DoWork)
            {
                IsBackground = true,
                Name = "DaqWorker"
            };
            _workerThread.Start();
            Log.Information("DaqWorker 已启动");
        }
    }

    /// <summary>
    /// 停止数据采集
    /// </summary>
    public void Stop()
    {
        lock (_lock)
        {
            _isRunning = false;
        }
        _workerThread?.Join(2000);
        _csvWriter?.Dispose();
        _csvWriter = null;
        Log.Information("DaqWorker 已停止");
    }

    /// <summary>
    /// 停止记录（保存温度快照、关闭 CSV，释放文件句柄）
    /// </summary>
    public void EndRecording()
    {
        // 保存 Recording 最后一帧的温度快照，防止 Complete 状态 TS/TC 骤降
        _snapshotTemps = _simulator.GetAllTemps().Take(4).ToArray();
        _snapshotTime = _elapsedSeconds;

        _csvWriter?.Dispose();
        _csvWriter = null;
        Log.Information("试验记录已结束，温度快照: TF1={Tf1:F1}, TF2={Tf2:F1}, TS={Ts:F1}, TC={Tc:F1}",
            _snapshotTemps[0], _snapshotTemps[1], _snapshotTemps[2], _snapshotTemps[3]);
    }

    /// <summary>
    /// 开始记录（初始化 CSV 写入）
    /// </summary>
    public void BeginRecording(string productId, string testId, int durationSeconds, TestMode mode)
    {
        _currentProductId = productId;
        _currentTestId = testId;
        _testDurationSeconds = durationSeconds;
        _testMode = mode;
        _elapsedSeconds = 0;
        _snapshotTemps = null; // 清除旧快照
        _tf1History.Clear();
        _tf2History.Clear();
        ResetMaxTracking();

        var csvDir = Path.Combine(_fileConfig.TestDataDirectory, productId, testId);
        var csvPath = Path.Combine(csvDir, "sensor_data.csv");
        _csvWriter = new CsvWriter(csvPath);
        _csvWriter.Initialize();

        Log.Information("开始记录试验：{ProductId}/{TestId}, 时长={Duration}s", productId, testId, durationSeconds);
    }

    /// <summary>
    /// 后台工作循环
    /// </summary>
    private void DoWork()
    {
        while (_isRunning)
        {
            try
            {
                var state = AppSession.Instance.TestController.CurrentState;
                _simulator.Update(state);

                // 记录中写入 CSV
                if (state == TestState.Recording && _csvWriter != null)
                {
                    _csvWriter.WriteRow(_elapsedSeconds, _simulator.GetAllTemps());
                    _elapsedSeconds++;

                    // 更新最大值
                    UpdateMaxTracking(_elapsedSeconds);

                    // 检查终止条件
                    CheckTermination(state);
                }

                // 广播数据
                BroadcastData(state);

                Thread.Sleep(800);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "DaqWorker 工作循环异常");
            }
        }
    }

    /// <summary>
    /// 广播数据到 UI
    /// </summary>
    private void BroadcastData(TestState state)
    {
        var messages = new List<MasterMessage>();

        // 状态变化检测
        var controller = AppSession.Instance.TestController;
        if (controller.HasPendingMessages)
        {
            messages.AddRange(controller.GetPendingMessages());
        }

        var drift = _analyzer.CalculateDrift(_tf1History);

        var args = new DataBroadcastEventArgs
        {
            Temperatures = _simulator.GetAllTemps(),
            ElapsedSeconds = state == TestState.Recording ? _elapsedSeconds : 0,
            TemperatureDrift = drift,
            CurrentState = state,
            Messages = messages,
            IsStable = _simulator.IsStable
        };

        DataBroadcast?.Invoke(this, args);
    }

    /// <summary>
    /// 检查终止条件
    /// </summary>
    private void CheckTermination(TestState state)
    {
        if (state != TestState.Recording) return;

        bool shouldStop = false;
        string reason = "";

        if (_testMode == TestMode.Standard60Min)
        {
            // 标准模式：60 分钟无条件终止
            if (_elapsedSeconds >= 3600)
            {
                shouldStop = true;
                reason = "记录时间到达 3600 秒，试验自动结束";
            }
            // 提前终止检查
            else if (_elapsedSeconds >= 1800 && _elapsedSeconds % 300 == 0)
            {
                if (_analyzer.CanEarlyTerminate(_elapsedSeconds, _tf1History, _tf2History))
                {
                    shouldStop = true;
                    reason = "满足终止条件，试验结束";
                }
            }
        }
        else // FixedDuration
        {
            if (_elapsedSeconds >= _testDurationSeconds)
            {
                shouldStop = true;
                reason = $"记录时间到达 {_testDurationSeconds} 秒，试验自动结束";
            }
        }

        if (shouldStop)
        {
            var controller = AppSession.Instance.TestController;
            controller.AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = reason
            });
            // 自动停止记录，切换到 Complete
            controller.StopRecording();
            EndRecording();
            // 广播一条特殊消息，提示用户保存
            controller.AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "试验自动完成，请点击「保存记录」保存试验数据"
            });
        }
    }

    /// <summary>
    /// 更新最大值追踪
    /// </summary>
    private void UpdateMaxTracking(int currentSecond)
    {
        var temps = _simulator.GetAllTemps();
        _tf1History.Add(temps[0]);
        _tf2History.Add(temps[1]);

        if (temps[0] > _maxTf1) { _maxTf1 = temps[0]; _maxTf1Time = currentSecond; }
        if (temps[1] > _maxTf2) { _maxTf2 = temps[1]; _maxTf2Time = currentSecond; }
        if (temps[2] > _maxTs) { _maxTs = temps[2]; _maxTsTime = currentSecond; }
        if (temps[3] > _maxTc) { _maxTc = temps[3]; _maxTcTime = currentSecond; }
    }

    private void ResetMaxTracking()
    {
        _maxTf1 = _maxTf2 = _maxTs = _maxTc = 0;
        _maxTf1Time = _maxTf2Time = _maxTsTime = _maxTcTime = 0;
    }

    // ============ 公共属性 ============

    public double[] CurrentTemperatures => _simulator.GetAllTemps();
    public bool IsSimulatorStable => _simulator.IsStable;
    public int ElapsedSeconds => _elapsedSeconds;
    public double CalculatedConstPower => _simulator.CalculateConstPower();

    public double[] MaxTemps => new[] { _maxTf1, _maxTf2, _maxTs, _maxTc };
    public int[] MaxTempTimes => new[] { _maxTf1Time, _maxTf2Time, _maxTsTime, _maxTcTime };

    /// <summary>
    /// Recording 结束时各通道的最终温度（优先取快照，避免 Complete 状态骤降）
    /// </summary>
    public double[] FinalTemps => _snapshotTemps ?? _simulator.GetAllTemps().Take(4).ToArray();

    /// <summary>
    /// Recording 结束时的时间（优先取快照时间）
    /// </summary>
    public int[] FinalTempTimes
    {
        get
        {
            int t = _snapshotTemps != null ? _snapshotTime : _elapsedSeconds;
            return new[] { t, t, t, t };
        }
    }

    /// <summary>
    /// 获取各通道温升值
    /// [0] DeltaTf1: 炉温1温升 (TF1 - 环境温度)
    /// [1] DeltaTf2: 炉温2温升 (TF2 - 环境温度)
    /// [2] DeltaTs:  样品表面温升 = |TS - TF1| (表面温度与炉温1的差值，符合ISO 1182标准)
    /// [3] DeltaTc:  中心温升 = |TC - TF1| (中心温度与炉温1的差值)
    /// </summary>
    public double[] GetDeltaTemps(double ambientTemp)
    {
        var finals = FinalTemps;
        double tf1 = finals[0]; // 炉温1 (最终值)
        return new double[]
        {
            finals[0] - ambientTemp,           // DeltaTf1: 炉温1 - 环境温度
            finals[1] - ambientTemp,           // DeltaTf2: 炉温2 - 环境温度
            Math.Abs(finals[2] - tf1),          // DeltaTs:  |表面温度 - 炉温1| (样品温升)
            Math.Abs(finals[3] - tf1)           // DeltaTc:  |中心温度 - 炉温1|
        };
    }

    public SensorSimulator Simulator => _simulator;

    public string GetCsvFilePath()
    {
        return Path.Combine(_fileConfig.TestDataDirectory, _currentProductId, _currentTestId, "sensor_data.csv");
    }
}
