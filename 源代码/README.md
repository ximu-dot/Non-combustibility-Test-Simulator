# NCT-Sim: 建筑材料不燃性试验仿真系统

## 项目简介

基于 ISO 11820:2022 标准的建筑材料不燃性试验仿真系统。通过软件仿真完整模拟不燃性试验的全流程，包括温度仿真、状态机管理、实时曲线显示和报告生成。

## 技术栈

- **C# / .NET 8** - 开发语言与框架
- **Windows Forms** - 桌面 UI
- **SQLite** - 本地数据库
- **OxyPlot** - 实时温度曲线
- **EPPlus** - Excel 报告生成
- **PDFsharp-MigraDoc** - PDF 报告生成
- **Serilog** - 结构化日志
- **MathNet.Numerics** - 温漂线性回归

## 项目结构

```
NctSim/
├── Models/           # 数据模型
│   └── TestRecord.cs
├── Core/             # 核心逻辑
│   └── TestController.cs
├── Services/         # 服务层
│   ├── DaqWorker.cs
│   ├── SensorSimulator.cs
│   ├── TemperatureAnalyzer.cs
│   ├── CsvWriter.cs
│   └── ExportService.cs
├── Data/             # 数据层
│   └── DbHelper.cs
├── Forms/            # 界面层
│   ├── LoginForm.cs
│   ├── MainForm.cs
│   ├── NewTestDialog.cs
│   └── TestRecordDialog.cs
├── Global/           # 全局
│   └── AppContext.cs
├── Program.cs
└── appsettings.json
```

## 运行要求

- Windows 10/11
- .NET 8 Runtime
- 无需联网，无需硬件

## 构建与运行

```bash
cd NctSim
dotnet restore
dotnet run
```

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 试验员 | experimenter | 123456 |

## 功能列表

- ✅ 用户登录（管理员/试验员）
- ✅ 新建试验
- ✅ 5 通道温度仿真
- ✅ 5 状态试验状态机
- ✅ 实时温度显示与曲线图
- ✅ 系统消息日志
- ✅ 试验现象记录
- ✅ CSV/Excel/PDF 报告导出
- ✅ 历史记录查询
- ✅ 设备校准管理

## 仓库

github.com/ximu-dot/Non-combustibility-Test-Simulator
