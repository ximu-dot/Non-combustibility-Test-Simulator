using MathNet.Numerics;
using Serilog;

namespace NctSim.Services;

/// <summary>
/// 温度分析器 - 温漂计算、终止条件判断
/// </summary>
public class TemperatureAnalyzer
{
    private readonly double _maxDriftPerTenMinutes;

    public TemperatureAnalyzer(double maxDriftPerTenMinutes = 2.0)
    {
        _maxDriftPerTenMinutes = maxDriftPerTenMinutes;
    }

    /// <summary>
    /// 计算最近 N 个数据点的温漂（°C/10min）
    /// 使用线性回归计算斜率
    /// </summary>
    public double CalculateDrift(List<double> temperatures, int windowSize = 600)
    {
        if (temperatures.Count < 10)
            return 0;

        int count = Math.Min(windowSize, temperatures.Count);
        var data = temperatures.Skip(temperatures.Count - count).ToList();

        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = data.Count;

        for (int i = 0; i < n; i++)
        {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        // 转换为 °C/10min (每 tick 800ms)
        double ticksPerTenMin = 10 * 60 / 0.8;
        return slope * ticksPerTenMin;
    }

    /// <summary>
    /// 判断温漂是否在允许范围内
    /// </summary>
    public bool IsDriftStable(List<double> temperatures)
    {
        double drift = CalculateDrift(temperatures);
        return Math.Abs(drift) < _maxDriftPerTenMinutes;
    }

    /// <summary>
    /// 检查是否可以提前终止试验（标准 60 分钟模式）
    /// 在第 30, 35, 40, 45, 50, 55 分钟检查
    /// </summary>
    public bool CanEarlyTerminate(int elapsedSeconds, List<double> tf1History, List<double> tf2History)
    {
        // 只在特定时间点检查
        if (elapsedSeconds < 1800) return false; // < 30 分钟
        if (elapsedSeconds % 300 != 0) return false; // 非 5 分钟整点

        bool tf1Stable = IsDriftStable(tf1History);
        bool tf2Stable = IsDriftStable(tf2History);

        Log.Information("提前终止检查 @{Seconds}s: TF1稳定={Tf1Stable}, TF2稳定={Tf2Stable}",
            elapsedSeconds, tf1Stable, tf2Stable);

        return tf1Stable && tf2Stable;
    }

    /// <summary>
    /// 计算判定结论（依据 ISO 1182:2022 不燃性试验标准）
    /// deltaTf: 样品温升 = |表面温度 - 炉温1|，反映样品自身是否显著放热
    /// lostWeightPercent: 质量损失百分比
    /// flameDuration: 持续火焰时间(秒)
    /// </summary>
    public (bool Passed, string Reason) EvaluateResult(double deltaTf, double lostWeightPercent, int flameDuration)
    {
        var reasons = new List<string>();

        bool tempOk = deltaTf <= 50;       // 样品温升不超过 50°C
        bool weightOk = lostWeightPercent <= 50;  // 失重率不超过 50%
        bool flameOk = flameDuration < 5;   // 火焰持续时间小于 5 秒

        if (!tempOk) reasons.Add($"温升超标 ({deltaTf:F1}°C > 50°C)");
        if (!weightOk) reasons.Add($"失重率超标 ({lostWeightPercent:F1}% > 50%)");
        if (!flameOk) reasons.Add($"火焰持续时间超标 ({flameDuration}s ≥ 5s)");

        bool passed = tempOk && weightOk && flameOk;
        string reason = passed ? "样品判定为不燃材料，试验通过" : string.Join("；", reasons);

        return (passed, reason);
    }
}
