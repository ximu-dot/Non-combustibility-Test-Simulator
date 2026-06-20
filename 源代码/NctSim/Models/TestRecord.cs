namespace NctSim.Models;

/// <summary>
/// 试验记录数据模型
/// </summary>
public class TestRecord
{
    public string ProductId { get; set; } = string.Empty;
    public string TestId { get; set; } = string.Empty;
    public DateTime TestDate { get; set; }
    public double AmbTemp { get; set; }
    public double AmbHumi { get; set; }
    public string According { get; set; } = "ISO 11820:2022";
    public string Operator { get; set; } = string.Empty;
    public string ApparatusId { get; set; } = string.Empty;
    public string ApparatusName { get; set; } = string.Empty;
    public DateTime ApparatusChkDate { get; set; }
    public string RptNo { get; set; } = string.Empty;

    public double PreWeight { get; set; }
    public double PostWeight { get; set; }
    public double LostWeight { get; set; }
    public double LostWeightPercent { get; set; }

    public int TotalTestTime { get; set; }
    public int ConstPower { get; set; }
    public string PhenoCode { get; set; } = string.Empty;
    public int FlameTime { get; set; }
    public int FlameDuration { get; set; }

    public double MaxTf1 { get; set; }
    public double MaxTf2 { get; set; }
    public double MaxTs { get; set; }
    public double MaxTc { get; set; }
    public int MaxTf1Time { get; set; }
    public int MaxTf2Time { get; set; }
    public int MaxTsTime { get; set; }
    public int MaxTcTime { get; set; }

    public double FinalTf1 { get; set; }
    public double FinalTf2 { get; set; }
    public double FinalTs { get; set; }
    public double FinalTc { get; set; }
    public int FinalTf1Time { get; set; }
    public int FinalTf2Time { get; set; }
    public int FinalTsTime { get; set; }
    public int FinalTcTime { get; set; }

    public double DeltaTf1 { get; set; }
    public double DeltaTf2 { get; set; }
    public double DeltaTf { get; set; }
    public double DeltaTs { get; set; }
    public double DeltaTc { get; set; }

    public string Memo { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;

    /// <summary>
    /// 检查试验是否已保存
    /// </summary>
    public bool IsSaved => Flag == "10000000";

    /// <summary>
    /// 检查是否有已完成的试验记录
    /// </summary>
    public bool HasRecorded => TotalTestTime > 0;
}

/// <summary>
/// 传感器数据模型
/// </summary>
public class Sensor
{
    public int SensorId { get; set; }
    public string SensorName { get; set; } = string.Empty;
    public string DispName { get; set; } = string.Empty;
    public string SensorGroup { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public double SignalZero { get; set; }
    public double SignalSpan { get; set; }
    public double OutputZero { get; set; }
    public double OutputSpan { get; set; }
    public double OutputValue { get; set; }
    public double InputValue { get; set; }
    public int SignalType { get; set; }
}

/// <summary>
/// 设备模型
/// </summary>
public class Apparatus
{
    public int ApparatusId { get; set; }
    public string InnerNumber { get; set; } = string.Empty;
    public string ApparatusName { get; set; } = string.Empty;
    public DateTime CheckDateFrom { get; set; }
    public DateTime CheckDateTo { get; set; }
    public string PidPort { get; set; } = string.Empty;
    public string PowerPort { get; set; } = string.Empty;
    public int? ConstPower { get; set; }
}

/// <summary>
/// 样品模型
/// </summary>
public class Product
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Specific { get; set; } = string.Empty;
    public double Diameter { get; set; }
    public double Height { get; set; }
    public string? Flag { get; set; }
}

/// <summary>
/// 校准记录模型
/// </summary>
public class CalibrationRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CalibrationDate { get; set; } = DateTime.Now.ToString("O");
    public string CalibrationType { get; set; } = "Surface";
    public int ApparatusId { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string TemperatureData { get; set; } = "[]";
    public double? UniformityResult { get; set; }
    public double? MaxDeviation { get; set; }
    public double? AverageTemperature { get; set; }
    public int PassedCriteria { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.Now.ToString("O");
}

/// <summary>
/// 系统消息模型
/// </summary>
public class MasterMessage
{
    public string Time { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// 数据广播事件参数
/// </summary>
public class DataBroadcastEventArgs : EventArgs
{
    public double[] Temperatures { get; set; } = new double[5];
    public int ElapsedSeconds { get; set; }
    public double TemperatureDrift { get; set; }
    public TestState CurrentState { get; set; }
    public List<MasterMessage> Messages { get; set; } = new();
    public bool IsStable { get; set; }
}

/// <summary>
/// 试验状态枚举
/// </summary>
public enum TestState
{
    Idle,
    Preparing,
    Ready,
    Recording,
    Complete
}

/// <summary>
/// 试验时长模式
/// </summary>
public enum TestMode
{
    Standard60Min,
    FixedDuration
}
