using Microsoft.Extensions.Configuration;
using NctSim.Core;
using NctSim.Data;
using NctSim.Services;
using Serilog;

namespace NctSim.Global;

/// <summary>
/// 全局应用上下文（单例模式），持有所有核心服务对象的引用
/// </summary>
public class AppSession
{
    private static readonly Lazy<AppSession> _instance = new(() => new AppSession());
    public static AppSession Instance => _instance.Value;

    public IConfiguration Configuration { get; private set; } = null!;
    public DbHelper Db { get; private set; } = null!;
    public TestController TestController { get; private set; } = null!;
    public DaqWorker DaqWorker { get; private set; } = null!;
    public ExportService ExportService { get; private set; } = null!;

    public string CurrentUser { get; set; } = string.Empty;
    public string CurrentUserType { get; set; } = string.Empty;
    public string CurrentUserId { get; set; } = string.Empty;

    private AppSession() { }

    public void Initialize()
    {
        // 加载配置
        Configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .Build();

        // 初始化数据库
        var dbPath = Configuration["Database:SqlitePath"] ?? "Data\\ISO11820.db";
        var fullDbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, dbPath);
        var dbDir = Path.GetDirectoryName(fullDbPath)!;
        if (!Directory.Exists(dbDir))
            Directory.CreateDirectory(dbDir);

        Db = new DbHelper(fullDbPath);
        Db.InitializeDatabase();

        // 初始化服务
        var simulationConfig = new SimulationConfig
        {
            EnableSimulation = bool.Parse(Configuration["Simulation:EnableSimulation"] ?? "true"),
            InitialFurnaceTemp = double.Parse(Configuration["Simulation:InitialFurnaceTemp"] ?? "720"),
            TargetFurnaceTemp = double.Parse(Configuration["Simulation:TargetFurnaceTemp"] ?? "750"),
            HeatingRatePerSecond = double.Parse(Configuration["Simulation:HeatingRatePerSecond"] ?? "40"),
            TempFluctuation = double.Parse(Configuration["Simulation:TempFluctuation"] ?? "0.5"),
            StableThreshold = double.Parse(Configuration["Simulation:StableThreshold"] ?? "3"),
            MaxTemperatureDriftPerTenMinutes = double.Parse(Configuration["Simulation:MaxTemperatureDriftPerTenMinutes"] ?? "2.0")
        };

        var fileStorageConfig = new FileStorageConfig
        {
            BaseDirectory = Configuration["FileStorage:BaseDirectory"] ?? "D:\\ISO11820",
            TestDataDirectory = Configuration["FileStorage:TestDataDirectory"] ?? "D:\\ISO11820\\TestData",
            ReportDirectory = Configuration["Report:OutputDirectory"] ?? "D:\\ISO11820\\Reports"
        };

        TestController = new TestController();
        DaqWorker = new DaqWorker(simulationConfig, fileStorageConfig);
        ExportService = new ExportService(fileStorageConfig);

        Log.Information("AppSession 初始化完成");
    }
}

public class SimulationConfig
{
    public bool EnableSimulation { get; set; } = true;
    public double InitialFurnaceTemp { get; set; } = 720.0;
    public double TargetFurnaceTemp { get; set; } = 750.0;
    public double HeatingRatePerSecond { get; set; } = 40.0;
    public double TempFluctuation { get; set; } = 0.5;
    public double StableThreshold { get; set; } = 3.0;
    public double MaxTemperatureDriftPerTenMinutes { get; set; } = 2.0;
}

public class FileStorageConfig
{
    public string BaseDirectory { get; set; } = "D:\\ISO11820";
    public string TestDataDirectory { get; set; } = "D:\\ISO11820\\TestData";
    public string ReportDirectory { get; set; } = "D:\\ISO11820\\Reports";
}
