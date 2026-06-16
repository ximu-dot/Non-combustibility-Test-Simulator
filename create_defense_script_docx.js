const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat
} = require('docx');

// ========== 辅助函数 ==========
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32, font: "Microsoft YaHei", color: "1A3A5C" })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 28, font: "Microsoft YaHei", color: "2E75B6" })] });
}

function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true, size: 24, font: "Microsoft YaHei", color: "3A5A8C" })] });
}

function normalPara(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, size: 22, font: "Microsoft YaHei", ...options })]
  });
}

function boldPara(text) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, size: 22, font: "Microsoft YaHei", bold: true })]
  });
}

function multiRunPara(runs) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: runs.map(r => new TextRun({ size: 22, font: "Microsoft YaHei", ...r }))
  });
}

function bulletItem(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 60, line: 320 },
    children: [new TextRun({ text, size: 22, font: "Microsoft YaHei" })]
  });
}

function numberedItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 60, line: 320 },
    children: [new TextRun({ text, size: 22, font: "Microsoft YaHei" })]
  });
}

function codeBlock(code) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 280 },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text: code, size: 18, font: "Consolas", color: "333333" })]
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function makeCell(text, opts = {}) {
  return new TableCell({
    borders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, size: opts.size || 20, font: opts.font || "Microsoft YaHei", bold: opts.bold || false, color: opts.color || "333333" })]
    })]
  });
}

function headerCell(text, width) {
  return makeCell(text, { width, shading: "2E75B6", bold: true, color: "FFFFFF", size: 20, align: AlignmentType.CENTER });
}

// ========== 封面 ==========
function createCoverPage() {
  return [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "NCT-Sim", size: 56, font: "Microsoft YaHei", bold: true, color: "2E75B6" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "建筑材料不燃性试验仿真系统", size: 40, font: "Microsoft YaHei", bold: true, color: "1A3A5C" })]
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "—— 答辩脚本 ——", size: 28, font: "Microsoft YaHei", color: "666666" })]
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "第十八届全国大学生软件创新大赛", size: 24, font: "Microsoft YaHei", color: "555555" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "软件作品创新赛", size: 24, font: "Microsoft YaHei", color: "555555" })]
    }),
    emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "技术栈：.NET 8 + WinForms + SQLite  |  智能体：CodeBuddy (Claude Code)", size: 20, font: "Microsoft YaHei", color: "888888" })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

// ========== 时间分配表 ==========
function createTimeTable() {
  const colWidths = [600, 3600, 1600, 1200];
  const rows = [
    ["页码", "内容", "建议时长", "累计"],
    ["1", "封面", "10秒", "10秒"],
    ["2", "目录", "20秒", "30秒"],
    ["3", "项目背景与目标", "1分钟", "1′30″"],
    ["4", "需求分析", "30秒", "2′"],
    ["5", "系统架构设计", "1分钟", "3′"],
    ["6", "AI 智能体全流程协作", "1分钟", "4′"],
    ["7", "人机协作模式", "1分钟", "5′"],
    ["8", "核心技术：温度仿真引擎", "1分钟", "6′"],
    ["9", "核心技术：状态机", "40秒", "6′40″"],
    ["10", "数据流与报告", "40秒", "7′20″"],
    ["11", "测试与验证", "30秒", "7′50″"],
    ["12", "创新亮点", "40秒", "8′30″"],
    ["13", "成果展示", "30秒", "9′"],
    ["14", "总结", "20秒", "9′20″"],
  ];

  return new Table({
    width: { size: 6400, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((row, idx) =>
      new TableRow({
        children: row.map((cell, ci) =>
          idx === 0
            ? headerCell(cell, colWidths[ci])
            : makeCell(cell, { width: colWidths[ci], align: ci >= 2 ? AlignmentType.CENTER : AlignmentType.LEFT })
        )
      })
    )
  });
}

// ========== 主文档生成 ==========
async function main() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Microsoft YaHei", color: "1A3A5C" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
          paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Microsoft YaHei", color: "3A5A8C" },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ]
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        },
        {
          reference: "numbers",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 4 } },
            children: [new TextRun({ text: "NCT-Sim 答辩脚本", size: 18, font: "Microsoft YaHei", color: "999999", italics: true })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "第 ", size: 18, font: "Microsoft YaHei", color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Microsoft YaHei", color: "999999" }),
              new TextRun({ text: " 页", size: 18, font: "Microsoft YaHei", color: "999999" })
            ]
          })]
        })
      },
      children: [
        // ==================== 封面 ====================
        ...createCoverPage(),

        // ==================== 目录 ====================
        heading1("目  录"),
        emptyLine(),

        // 时间分配
        heading2("答辩时间分配（总约 8~10 分钟）"),
        emptyLine(),
        createTimeTable(),
        emptyLine(),

        // 内容目录
        heading2("答辩内容"),
        numberedItem("项目背景与目标 —— 为什么做这个项目"),
        numberedItem("需求分析 —— 五维可行性分析 + MoSCoW 优先级"),
        numberedItem("系统架构设计 —— 五层架构 + 六大设计原则 + 6 种设计模式"),
        numberedItem("AI 智能体全流程协作 —— 1 人 + 1 AI = 1 个完整软件工程团队"),
        numberedItem("人机协作模式 —— AI 做什么、我做什么"),
        numberedItem("核心技术：温度仿真引擎 —— 三阶段分阶段仿真模型"),
        numberedItem("核心技术：状态机 —— 五状态机 + 按钮保护矩阵"),
        numberedItem("数据流与报告 —— 事件驱动 + 三种报告格式"),
        numberedItem("测试与验证 —— 13 项测试通过 + 5 个缺陷闭环"),
        numberedItem("创新亮点 —— 五大创新点"),
        numberedItem("成果展示 —— 关键数据一览"),
        numberedItem("总结与致谢"),
        numberedItem("附录：评委提问及回答准备（AI 专题 + 技术方向 + 团队协作）"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第1页：封面讲稿 ====================
        heading1("第1页：封面（约10秒）"),
        emptyLine(),
        normalPara("各位评委老师好，我今天答辩的项目是 NCT-Sim——建筑材料不燃性试验仿真系统。"),
        normalPara("这个项目基于 ISO 11820:2022 国际标准，采用 .NET 8 + WinForms + SQLite 技术栈，是一个完整的桌面仿真软件。整个项目由 AI 智能体 CodeBuddy（Claude Code）驱动完成全流程开发——从需求分析、架构设计、编码实现到测试文档，AI 深度参与了全部 7 个阶段。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第2页：目录讲稿 ====================
        heading1("第2页：目录（约20秒）"),
        emptyLine(),
        normalPara("我的答辩内容分为九个部分：首先介绍项目背景和需求分析，然后重点讲系统架构设计、AI 智能体的全流程协作模式，以及人机协作的具体分工。接着展示核心技术实现——温度仿真引擎和状态机，然后介绍测试验证结果和创新亮点，最后做总结。附录中还准备了评委可能提问的 QA 内容。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第3页：项目背景与目标 ====================
        heading1("第3页：项目背景与目标（约1分钟）"),
        emptyLine(),

        heading2("为什么做这个项目？"),
        normalPara("在真实的建筑材料防火检测中，需要按照 ISO 11820 标准进行不燃性试验：将样品放入加热炉，升温到 750°C，记录 60 分钟的温度变化，根据温升和失重率判定材料是否不燃。"),
        normalPara("但真实试验有五个痛点："),
        bulletItem("设备昂贵——单套设备要 50~80 万元"),
        bulletItem("耗电量大——单次试验约 20 度电"),
        bulletItem("安全风险——高温烫伤、火灾隐患"),
        bulletItem("教学受限——一套设备只能一组学生操作，无法并行"),
        bulletItem("耗时漫长——单次试验约 2 小时"),

        heading2("我们的解决方案"),
        normalPara("开发一套纯软件的仿真系统——NCT-Sim。优势是："),
        bulletItem("零成本——全部使用开源免费技术栈（.NET 8、SQLite、OxyPlot、EPPlus、PDFsharp）"),
        bulletItem("零风险——纯软件仿真，无高温隐患"),
        bulletItem("高效率——支持无限并行教学，还可以加速演示"),
        normalPara("项目目标：完整模拟 ISO 11820 不燃性试验全流程的 Windows 桌面仿真软件。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第4页：需求分析 ====================
        heading1("第4页：需求分析（约30秒）"),
        emptyLine(),
        normalPara("我们做了五维可行性分析——技术、经济、操作、法律、时间，全部可行。技术栈成熟（.NET 8 LTS + 开源生态），经济上零预算全部开源免费，操作上学习成本不到半小时。"),
        normalPara("需求优先级采用 MoSCoW 方法排序："),
        bulletItem("P0 核心功能占 55%：登录认证、温度仿真引擎、五状态机控制、实时数据显示、曲线图绘制、CSV 数据导出"),
        bulletItem("P1 增强功能占 25%：Excel/PDF 报告生成、历史试验查询、系统消息日志"),
        bulletItem("P2 扩展功能占 15%：设备校准记录、仿真参数配置"),
        normalPara("核心数据：6 张数据库表（operators、apparatus、productmaster、testmaster、sensors、CalibrationRecords）、5 个温度通道、16 个功能点全部实现。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第5页：系统架构设计 ====================
        heading1("第5页：系统架构设计（约1分钟）"),
        emptyLine(),
        heading2("五层架构"),
        bulletItem("UI 层（Forms）：登录窗体 LoginForm、主窗体 MainForm、新建试验对话框 NewTestDialog、实时面板、曲线面板"),
        bulletItem("核心层（Core）：TestController 状态机——负责所有业务逻辑协调，是系统的\u201c大脑\u201d"),
        bulletItem("服务层（Services）：DaqWorker 数据采集、SensorSimulator 仿真引擎、ExportService 报告生成、TemperatureAnalyzer 温漂分析"),
        bulletItem("数据层（Data）：DbHelper 封装 SQLite 操作（含 Login、InsertTest、UpdateTestResult、QueryTests 等 7 个核心方法）、CsvWriter 管理时序数据"),
        bulletItem("全局层（Global）：AppContext 单例——持有所有核心对象引用，通过 Lazy<T> 实现线程安全"),

        heading2("六大设计原则"),
        bulletItem("单向依赖——上层依赖下层，下层不依赖上层"),
        bulletItem("事件驱动——DaqWorker 通过 DataBroadcast 事件广播数据，UI 层订阅消费"),
        bulletItem("UI 线程安全——InvokeRequired 检测 + Invoke 封送，确保跨线程安全"),
        bulletItem("配置驱动——所有仿真参数通过 appsettings.json 控制，无需重新编译"),
        bulletItem("仿真/硬件双模式——EnableSimulation 一键切换"),
        bulletItem("6 种设计模式——单例(AppContext)、观察者(DataBroadcast)、状态(TestController)、策略(ISensorProvider)、工厂(ExportService)、外观(DbHelper)"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第6页：AI 智能体全流程协作 ====================
        heading1("第6页：AI 智能体全流程协作（约1分钟）"),
        emptyLine(),
        normalPara("这一页是我们项目最大的特色——Claude Code 智能体参与了软件开发的全部七个阶段："),
        emptyLine(),
        numberedItem("选题与方向：AI 帮我分析了 ISO 11820 标准，建议做不燃性试验仿真，并评估了技术可行性"),
        numberedItem("需求分析：AI 协助完成了五维可行性分析、MoSCoW 优先级排序、功能需求矩阵"),
        numberedItem("架构设计：AI 设计了五层架构、18 个模块划分、6 张数据库表结构"),
        numberedItem("编码实现：AI 生成了约 80% 的代码，约 5000 行 C#、19 个源文件、应用了 6 种设计模式"),
        numberedItem("测试验证：AI 设计了 13 项功能测试用例和 6 项性能测试指标"),
        numberedItem("文档报告：AI 协助完成了 6 份技术文档和答辩材料"),
        numberedItem("问题修复：AI 帮助发现并修复了编译错误、命名冲突、PDF 曲线图缺失等问题"),
        emptyLine(),
        normalPara("核心结论：1 个学生 + 1 个智能体 = 1 个完整软件工程团队。AI 不是替代开发者，而是把一个人的能力边界扩展到了传统团队级别。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第7页：人机协作模式 ====================
        heading1("第7页：人机协作模式（约1分钟）"),
        emptyLine(),
        heading2("Claude Code 负责（效率型工作）"),
        bulletItem("生成代码框架和样板代码——约 80% 代码量、约 5000 行 C#"),
        bulletItem("编写技术文档初稿——6 份文档的骨架和基础内容"),
        bulletItem("设计数据库表结构——6 张表的字段定义和关系"),
        bulletItem("分析 ISO 11820 标准文本——提取关键参数（750°C、60 分钟、温升 ≤50°C 等）"),
        bulletItem("设计测试用例——13 项功能测试 + 6 项性能指标"),
        bulletItem("自动修复编译错误和命名冲突"),
        bulletItem("生成 PPT 大纲和答辩材料结构"),

        heading2("我负责（决策型工作）"),
        bulletItem("确定技术方向——比如选 WinForms 而不是 WPF（4 周周期内学习成本最低）"),
        bulletItem("审查验证 AI 生成的代码逻辑——约 5000 行代码逐行审查"),
        bulletItem("运行测试发现 Bug 并反馈修正——共发现 5 个缺陷（0 严重、3 一般、2 轻微）"),
        bulletItem("关键算法验证——仿真引擎的三阶段模型（线性升温→钳位稳定→指数逼近）"),
        bulletItem("架构决策——五层架构、事件驱动、配置驱动"),
        bulletItem("人工测试边界条件和异常场景"),
        bulletItem("整合各部分确保整体一致性"),

        heading2("协作流程"),
        normalPara("我描述需求 → AI 生成初稿 → 我审查验证 → 反馈修正 → 最终交付。这是一个快速迭代的闭环，平均每个模块 2~3 轮即可完成。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第8页：核心技术：温度仿真引擎 ====================
        heading1("第8页：核心技术：温度仿真引擎（约1分钟）"),
        emptyLine(),
        normalPara("这是系统最核心的技术——分阶段温度仿真模型，模拟了 5 个温度通道：TF1、TF2（两个炉温）、TS（表面温）、TC（中心温）、TCal（校准温）。"),
        emptyLine(),

        heading2("阶段一：升温阶段（Heating Phase）"),
        normalPara("实现文件：Services/SensorSimulator.cs（第107~134行）"),
        codeBlock("TF1 += HeatingRatePerSecond * 1.0 + noise();"),
        codeBlock("if (TF1 > TargetFurnaceTemp) TF1 = TargetFurnaceTemp;"),
        normalPara("线性升温加高斯噪声，两个炉温同步上升但带独立噪声，样品温度以低比例跟随。关键参数：升温速率 20°C/s、初始温度 25°C。"),

        heading2("阶段二：稳定阶段（Stabilization Phase）"),
        normalPara("实现文件：Services/SensorSimulator.cs（第139~146行 + 第189~205行 CheckStability 方法）"),
        codeBlock("TF1 = TargetFurnaceTemp + noise();  // 钳位到 750°C + 微小波动"),
        codeBlock("bool inRange = TF1 >= (750 - 10) && TF1 <= (750 + 10);"),
        codeBlock("IsStable = StableTickCount > 3;  // 连续 4 个 tick 才判定稳定"),
        normalPara("关键设计：钳位到 750°C 加 ±1°C 波动，连续 4 个采样周期（约 3.2 秒）温度在 745~755°C 范围内才算稳定。这个「连续 4 次」的设计是经过测试发现的——AI 最初只判断 1 次，导致炉温刚过 745°C 就切到 Ready，改为 4 次后才正确。"),

        heading2("阶段三：记录阶段（Recording Phase）"),
        normalPara("实现文件：Services/SensorSimulator.cs（第153~170行）"),
        codeBlock("// 表面温指数逼近炉温的 95%"),
        codeBlock("double surfaceTarget = Math.Min(TF1 * 0.95, 800.0);"),
        codeBlock("TS += (surfaceTarget - TS) * 0.02 + noise();"),
        codeBlock(""),
        codeBlock("// 中心温指数逼近炉温的 85%（更慢）"),
        codeBlock("double centerTarget = Math.Min(TF1 * 0.85, 750.0);"),
        codeBlock("TC += (centerTarget - TC) * 0.01 + noise();"),
        normalPara("核心创新——指数逼近算法：TS 用 0.02 系数、TC 用 0.01 系数，TC 响应速度是 TS 的一半。这真实模拟了材料内部热传导的延迟效应——表面先热、中心后热，形成了自然的温度梯度。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第9页：核心技术：状态机 ====================
        heading1("第9页：核心技术：状态机（约40秒）"),
        emptyLine(),
        normalPara("实现文件：Core/TestController.cs + Models/TestRecord.cs（TestState 枚举）"),
        emptyLine(),

        heading2("五状态定义"),
        codeBlock("public enum TestState { Idle, Preparing, Ready, Recording, Complete }"),
        emptyLine(),

        heading2("状态转换规则"),
        normalPara("在 TestController.cs 中，每个转换方法都包含 lock 同步和前置条件检查："),
        bulletItem("StartHeating()：Idle → Preparing（需 CurrentState == Idle）"),
        bulletItem("CheckAndTransitionToReady(isStable)：Preparing → Ready（需 isStable == true）"),
        bulletItem("CheckAndTransitionBackToPreparing()：Ready → Preparing（温度回退自动处理）"),
        bulletItem("StartRecording()：Ready → Recording（需 CurrentState == Ready）"),
        bulletItem("StopRecording()：Recording → Complete（需 CurrentState == Recording）"),
        bulletItem("OnTestRecordSaved()：Complete → Preparing（保存后可继续新试验）"),
        bulletItem("StopHeating()：Preparing/Ready/Complete → Idle（三种状态均可停止）"),

        heading2("按钮状态控制矩阵"),
        normalPara("在 MainForm.cs 的 UpdateButtonStates() 方法中（第1047~1061行），每个按钮根据 CurrentState 自动启用/禁用："),
        bulletItem("新建试验：仅在 Idle 状态可用（且无未保存试验）"),
        bulletItem("开始升温：仅在 Idle 状态可用"),
        bulletItem("停止升温：Preparing/Ready/Complete 状态可用"),
        bulletItem("开始记录：仅在 Ready 状态可用"),
        bulletItem("停止记录：仅在 Recording 状态可用"),
        bulletItem("保存记录：仅在 Complete 状态且已有时长数据可用"),
        normalPara("五项安全保护：未保存试验阻止新建、按钮自动跟随状态机、温度回退自动处理、lock 同步跨线程操作、非法状态转换直接忽略。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第10页：数据流与报告 ====================
        heading1("第10页：数据流与报告（约40秒）"),
        emptyLine(),

        heading2("温度数据流"),
        normalPara("实现文件：Services/DaqWorker.cs（第119~180行）+ Forms/MainForm.cs（第729~745行）"),
        normalPara("完整数据流路径："),
        numberedItem("SensorSimulator.Update(state) —— 每 800ms 更新一次仿真数据"),
        numberedItem("BroadcastData(state) —— 构造 DataBroadcastEventArgs，包含 5 通道温度、漂移值、状态、消息列表"),
        numberedItem("DataBroadcast?.Invoke(this, args) —— 事件广播"),
        numberedItem("MainForm.OnDataBroadcast() —— 检测 InvokeRequired，跨线程时通过 Invoke 封送到 UI 线程"),
        numberedItem("UI 更新：5 个温度 Label 实时刷新、曲线图 AddPoint 追加数据点、消息日志 AppendText"),

        heading2("报告生成"),
        normalPara("实现文件：Services/ExportService.cs"),
        bulletItem("CSV 格式——CsvWriter 管理，逐秒记录温度数据到 TestData 目录"),
        bulletItem("Excel 格式——GenerateExcel() 方法（第45行），使用 EPPlus 库，生成 3 个 Sheet：试验信息表、温度数据表、温度曲线图"),
        bulletItem("PDF 格式——GeneratePdf() 方法（第201行），使用 PDFsharp 库，支持中文字体（SimSun/SimHei/KaiTi），生成 3 页：封面、试验结果、曲线图"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第11页：测试与验证 ====================
        heading1("第11页：测试与验证（约30秒）"),
        emptyLine(),
        normalPara("测试结果：13 项功能测试全部通过，6 项性能测试指标达标。"),
        emptyLine(),

        heading2("发现的 5 个缺陷（全部已闭环处理）"),
        bulletItem("稳定阶段误判——AI 最初只判断 1 次温度，导致 Ready 切换过早。改为连续 4 tick 在 745~755°C 范围内才判定稳定"),
        bulletItem("PDF 曲线图缺失——ExportService 中缺少 OxyPlot 转 PDF 的图表嵌入逻辑，定位后补充"),
        bulletItem("命名空间冲突——不同文件中相同类名导致编译报错，统一修正命名规范"),
        bulletItem("按钮状态逻辑遗漏——Complete 状态下\u201c新建试验\u201d按钮的启用条件缺失 hasUnsavedTest 判断"),
        bulletItem("CSV 路径硬编码——代码中写死路径，改为从 appsettings.json 的 FileStorage.TestDataDirectory 读取"),
        normalPara("严重程度分布：0 个严重、3 个一般、2 个轻微。"),

        heading2("性能数据"),
        bulletItem("UI 响应 < 100ms"),
        bulletItem("内存占用约 150MB"),
        bulletItem("连续运行超 2 小时无崩溃"),
        bulletItem("曲线渲染 10 分钟窗口无卡顿"),
        bulletItem("P0~P2 功能完成率 100%，16 个功能全部实现"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第12页：创新亮点 ====================
        heading1("第12页：创新亮点（约40秒）"),
        emptyLine(),
        numberedItem("AI 智能体全流程驱动——1 人 + 1 AI 完成传统 5~6 人团队的工作量，从需求到交付 AI 深度参与全部 7 个阶段"),
        numberedItem("分阶段仿真模型——升温/稳定/记录三阶段使用不同算法：线性加噪声→钳位加波动→指数逼近，模拟真实热力学过程"),
        numberedItem("指数逼近算法——记录阶段用 TS += (target - TS) * 0.02、TC += (target - TC) * 0.01，TC 响应速度是 TS 的一半，真实反映材料内外温差和热传导延迟效应"),
        numberedItem("配置驱动架构——所有仿真参数通过 appsettings.json 控制（EnableSimulation、HeatingRatePerSecond、TargetFurnaceTemp 等），无需重新编译即可调整，支持仿真/硬件双模式切换"),
        numberedItem("事件驱动数据流——DataBroadcast + Invoke 实现松耦合、可扩展的数据分发机制，UI 层通过 InvokeRequired 检测实现跨线程安全"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第13页：成果展示 ====================
        heading1("第13页：成果展示（约30秒）"),
        emptyLine(),
        heading2("关键数据"),
        bulletItem("约 30 个代码文件（19 个 .cs 核心源文件）"),
        bulletItem("约 5000 行 C# 代码"),
        bulletItem("6 张数据库表"),
        bulletItem("5 个温度通道（TF1、TF2、TS、TC、TCal）"),
        bulletItem("5 个状态机状态（Idle → Preparing → Ready → Recording → Complete）"),
        bulletItem("3 种报告格式（CSV、Excel、PDF）"),
        bulletItem("9 个第三方 NuGet 包（EPPlus、PDFsharp、OxyPlot、Dapper 等）"),
        bulletItem("6 种设计模式（单例、观察者、状态、策略、工厂、外观）"),
        emptyLine(),
        normalPara("P0、P1、P2 功能完成率全部 100%，13 项功能测试全部通过。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 第14页：总结 ====================
        heading1("第14页：总结（约20秒）"),
        emptyLine(),
        numberedItem("AI 智能体全流程驱动，1 人 + 1 AI 完成传统团队级工作量"),
        numberedItem("完整的 ISO 11820 不燃性试验仿真系统"),
        numberedItem("掌握了软件全流程：从需求分析到架构设计到编码实现到测试验证到交付"),
        numberedItem("分阶段温度仿真引擎——线性升温 + 钳位稳定 + 指数逼近，模拟真实热力学过程"),
        numberedItem("P0~P2 功能 100% 完成，13 项测试全部通过，5 个缺陷全部闭环"),
        numberedItem("零预算、零风险，验证了 AI 协同开发模式的可行性"),
        emptyLine(),
        normalPara("感谢各位评委老师，请批评指正！", { bold: true, size: 26, color: "2E75B6" }),

        new Paragraph({ children: [new PageBreak()] }),

        // ==================== 附录：QA 准备 ====================
        heading1("附录：评委提问及回答准备"),
        emptyLine(),
        normalPara("重点预测：评委大概率会聚焦在 AI 应用方面提问，以下是 AI 方向的高频问题及回答策略。"),
        emptyLine(),

        // QA1
        heading2("QA1：你用的是什么 AI 工具？具体怎么用的？"),
        normalPara("使用的是 CodeBuddy（基于 Claude Code），它是一个 IDE 集成的 AI 编程助手。使用方式不是简单的\u201c代码补全\u201d，而是对话式协作："),
        numberedItem("需求阶段：我把 ISO 11820 标准文本发给 AI，让它分析并提取关键参数（750°C、60 分钟、温升 ≤50°C 等），然后让它做五维可行性分析"),
        numberedItem("设计阶段：我描述系统目标，AI 给出架构方案——提出五层架构、6 张表的数据库设计、5 状态状态机模型，我来审查和决策"),
        numberedItem("编码阶段：AI 生成代码框架和主体逻辑，约 80% 的代码量（约 5000 行 C#），我负责审查、测试、修复"),
        numberedItem("文档阶段：AI 协助生成 6 份技术文档初稿、PPT 大纲、答辩脚本结构"),
        normalPara("核心模式是我提需求、AI 出初稿、我审查反馈、迭代修正。"),

        // QA2
        heading2("QA2：AI 帮你写了 80% 的代码，那你的技术贡献在哪里？"),
        normalPara("AI 写的代码 ≠ 直接可用，我的核心贡献在四个方面："),
        bulletItem("架构决策：AI 给了多种方案（WPF vs WinForms、EF Core vs 原生 SQL、三层 vs 五层），我做了技术选型和取舍——最终选 WinForms 是因为 4 周周期内学习成本最低，选五层架构是为了未来可替换 UI 层"),
        bulletItem("算法验证：温度仿真引擎的三阶段模型（线性升温→钳位稳定→指数逼近）是我审核确认的，AI 最初只给了线性模型，我要求加入指数逼近来模拟热传导延迟效应——TS 用 0.02 系数、TC 用 0.01 系数，AI 据此修改"),
        bulletItem("Bug 发现与修复：AI 生成的代码有 5 个缺陷——稳定阶段判断条件不严谨（最初只判断 1 次，改为连续 4 次）、PDF 曲线图缺失、命名冲突、按钮状态遗漏、CSV 路径硬编码——我通过测试发现了这些问题并反馈给 AI 修复"),
        bulletItem("系统整合：AI 生成的是模块化代码片段，我负责把所有模块串起来——事件驱动的 DataBroadcast、跨线程 Invoke 封送、配置驱动的参数注入"),
        normalPara("结论：AI 是高效的生产力工具，但技术决策和质量把控需要人来做。"),

        // QA3
        heading2("QA3：AI 生成的代码有没有出过错？举几个具体例子？"),
        normalPara("有，本项目发现了 5 个 AI 生成的缺陷："),

        new Table({
          width: { size: 9000, type: WidthType.DXA },
          columnWidths: [800, 2200, 2800, 3200],
          rows: [
            new TableRow({
              children: [
                headerCell("#", 800),
                headerCell("问题", 2200),
                headerCell("AI 的原始错误", 2800),
                headerCell("如何发现和修复", 3200),
              ]
            }),
            new TableRow({
              children: [
                makeCell("1", { width: 800, align: AlignmentType.CENTER }),
                makeCell("稳定阶段误判", { width: 2200 }),
                makeCell("稳定判断只用了一次温度检查，炉温刚过 745°C 就切到 Ready", { width: 2800 }),
                makeCell("跑仿真测试时发现 Ready 切换太早，反馈后 AI 改为\u201c连续 4 tick 都在 745~755°C\u201d才判定稳定", { width: 3200 }),
              ]
            }),
            new TableRow({
              children: [
                makeCell("2", { width: 800, align: AlignmentType.CENTER }),
                makeCell("PDF 曲线图缺失", { width: 2200 }),
                makeCell("PDF 导出代码漏掉了图表嵌入逻辑", { width: 2800 }),
                makeCell("导出 PDF 后发现只有文字没有图，定位到 ExportService 中缺少 OxyPlot 转 PDF 代码，让 AI 补充", { width: 3200 }),
              ]
            }),
            new TableRow({
              children: [
                makeCell("3", { width: 800, align: AlignmentType.CENTER }),
                makeCell("命名空间冲突", { width: 2200 }),
                makeCell("不同文件中用了相同的类名导致编译报错", { width: 2800 }),
                makeCell("编译时报错，定位后让 AI 统一修正命名规范", { width: 3200 }),
              ]
            }),
            new TableRow({
              children: [
                makeCell("4", { width: 800, align: AlignmentType.CENTER }),
                makeCell("按钮状态逻辑遗漏", { width: 2200 }),
                makeCell("状态机漏掉了 Complete 状态下\u201c新建试验\u201d按钮的启用条件", { width: 2800 }),
                makeCell("手工测试按钮行为时发现，反馈后 AI 补充了 hasUnsavedTest 判断", { width: 3200 }),
              ]
            }),
            new TableRow({
              children: [
                makeCell("5", { width: 800, align: AlignmentType.CENTER }),
                makeCell("CSV 路径硬编码", { width: 2200 }),
                makeCell("CSV 存储路径写死在代码里而非读取配置文件", { width: 2800 }),
                makeCell("代码审查时发现，改为从 appsettings.json 的 FileStorage.TestDataDirectory 读取", { width: 3200 }),
              ]
            }),
          ]
        }),
        emptyLine(),
        normalPara("这些例子说明：AI 的代码必须经过人工测试验证，不能直接信任。"),

        // QA4
        heading2("QA4：AI 在软件开发的哪些阶段帮助最大？哪些阶段帮助有限？"),
        boldPara("帮助最大的阶段（效率提升 3~5 倍）："),
        bulletItem("文档撰写——6 份技术文档的初稿生成，AI 几秒钟出框架，我只需补充细节"),
        bulletItem("样板代码生成——数据库 CRUD 操作、窗体布局代码、配置文件解析等重复性代码几乎零出错"),
        bulletItem("标准文本分析——ISO 11820 标准文本的解读和参数提取，AI 理解能力很强"),
        bulletItem("编译错误修复——命名冲突、缺少引用等机械性错误，AI 秒修"),
        boldPara("帮助有限的阶段（仍需大量人工介入）："),
        bulletItem("算法设计——仿真引擎的三阶段模型、指数逼近算法，AI 能理解需求但细节需人工验证"),
        bulletItem("系统整合——多模块协调、事件驱动架构的整体串联，AI 只能处理局部逻辑"),
        bulletItem("UI/UX 设计——界面布局、交互体验的细节打磨，AI 缺乏审美判断"),
        bulletItem("边界条件测试——极端输入、并发场景、异常恢复，AI 难以穷举"),
        normalPara("结论：AI 是\u201c加速器\u201d而非\u201c自动驾驶\u201d，最适合处理重复性、规范性、信息密集的任务。"),

        // QA5
        heading2("QA5：你认为 AI 辅助开发模式下，学生需要具备什么能力？"),
        boldPara("第一层：基础编程能力（必须）"),
        normalPara("如果完全不懂代码，AI 生成的代码你无法判断对错，也无法调试。比如要能看懂 C# 的 lock、Invoke、事件委托，才能发现 AI 的跨线程问题。"),
        boldPara("第二层：系统设计能力（核心）"),
        normalPara("AI 能给你 10 种方案，但你得知道哪个适合你的场景。为什么选五层架构而不是三层？为什么用事件驱动而不是直接调用？这些决策 AI 替代不了。"),
        boldPara("第三层：批判性思维（关键）"),
        normalPara("对 AI 的输出保持怀疑态度，主动测试验证，不盲目接受 AI 的方案。"),
        normalPara("最重要的变化：传统模式下学生需要\u201c会写代码\u201d，AI 模式下学生更需要\u201c会审代码、会设计系统、会提正确的问题\u201d。"),

        // QA6
        heading2("QA6：AI 协作模式对软件工程教育有什么启示？"),
        numberedItem("从\u201c教语法\u201d转向\u201c教设计\u201d——AI 能写代码但不会设计系统，课程应更侧重架构设计、需求分析、质量保证等高层能力"),
        numberedItem("从\u201c个人编程\u201d转向\u201c人机协作\u201d——学生需要学会如何与 AI 有效沟通：描述需求、分解任务、审查输出、迭代修正"),
        numberedItem("从\u201c防作弊\u201d转向\u201c引导使用\u201d——与其禁止学生用 AI，不如教他们正确使用。本项目证明 AI 辅助下一个人能完成团队级工作量，这是未来软件工程的真实趋势"),

        // QA7
        heading2("QA7：如果让你重新做这个项目，AI 的使用方式会有什么不同？"),
        numberedItem("更早引入单元测试——这次 AI 生成的代码没有配套单元测试，导致 Bug 发现滞后。下次会让 AI 在生成代码的同时生成 xUnit + Moq 测试用例"),
        numberedItem("用 AI 做 Code Review——让 AI 审查 AI 生成的代码，两个 AI 互相检查，提高发现问题的效率"),
        numberedItem("建立项目知识库——把 ISO 标准、架构设计文档作为 AI 的上下文，让 AI 的生成更贴合项目规范，减少反复修正"),

        new Paragraph({ children: [new PageBreak()] }),

        // 技术方向
        heading1("附录：技术方向 QA"),
        emptyLine(),

        heading2("QT1：仿真数据和真实试验数据有多大偏差？"),
        normalPara("本系统采用分阶段物理模型——升温线性加噪声、稳定钳位加波动、记录指数逼近。目前处于教学仿真阶段，温度趋势符合真实物理规律。如果需要更高精度，可以采集真实试验数据对模型参数进行校准。"),

        heading2("QT2：为什么选择 WinForms 而不是 WPF？"),
        normalPara("考虑到 4 周开发周期和学习成本，WinForms 是更务实的选择。我们在架构上预留了 UI 层替换空间——核心逻辑在 Core 和 Services 层，UI 层只做展示，未来可以迁移到 WPF 或 Avalonia。"),

        heading2("QT3：如果接入真实硬件，需要改多少代码？"),
        normalPara("架构已预留仿真/硬件双模式。appsettings.json 中 EnableSimulation 切换为 false 即可。硬件通信层需要新增 Modbus 协议实现，替换 SensorSimulator 为真实传感器驱动（实现 ISensorProvider 接口），其他层代码不变。"),

        heading2("QT4：温度仿真引擎的三阶段模型有什么依据？"),
        normalPara("参照 ISO 11820 标准对试验过程的描述——炉温先升至 750°C 后保持稳定，样品温度缓慢上升。升温阶段用线性加噪声模拟加热过程，稳定阶段用钳位加波动模拟 PID 控温，记录阶段用指数逼近模拟热传导的指数衰减特性。"),

        heading2("QT5：系统有没有做单元测试？"),
        normalPara("目前主要做的是功能测试和性能测试，13 项功能测试全部通过。单元测试覆盖率是长期改进计划的一部分，后续会引入 xUnit + Moq，目标覆盖率 80%。"),

        new Paragraph({ children: [new PageBreak()] }),

        // 团队协作
        heading1("附录：团队协作 QA"),
        emptyLine(),
        heading2("QC1：团队四个人怎么分工的？你的贡献是什么？"),
        normalPara("可以通过 Git 提交记录查看。我负责核心服务层（TestController 状态机、SensorSimulator 仿真引擎、DaqWorker 数据采集、ExportService 报告导出）和所有 Bug 修复，提交占比约 62.5%。另外三位队员分别负责基础设施层、数据库层和 UI 界面层。"),

        emptyLine(),

        // 答辩技巧
        heading1("附录：答辩技巧提醒"),
        emptyLine(),
        numberedItem("控制语速——不要太快，给评委消化信息的时间，重点页面（AI 协作、核心技术）可以稍微放慢"),
        numberedItem("眼神交流——不要一直盯着屏幕，多看看评委"),
        numberedItem("重点突出——AI 协作（第6~7页）和核心技术（第8~9页）是亮点，多花时间讲透"),
        numberedItem("自信表达——你对这个项目最了解，不用紧张"),
        numberedItem("Git 展示——如果评委问到团队分工，可以现场打开终端运行 git shortlog -sn 展示"),
        numberedItem("时间控制——如果超时，可以快速跳过第4、11、13页，保证核心内容讲完"),
        emptyLine(),
        boldPara("AI 问答专项技巧："),
        bulletItem("评委问 AI 问题时，重点强调\u201c人机协作\u201d而非\u201cAI 替代人\u201d，突出你的技术决策、算法验证、Bug 发现等人工贡献"),
        bulletItem("用具体例子回答——QA3 中的 5 个缺陷表，比抽象说\u201cAI 会出错\u201d有说服力得多"),
        bulletItem("主动展示批判性思维——不要回避 AI 的局限性，坦诚 AI 的不足反而体现你的深度思考"),
        bulletItem("准备好 1~2 个 AI 帮你解决难题的具体故事——比如\u201c温度仿真引擎最初只有线性模型，我要求 AI 加入指数逼近来模拟热传导延迟，它经过 3 轮迭代才达到满意效果\u201d"),
        bulletItem("如果评委质疑\u201cAI 做的项目有什么含金量\u201d——参考 QA2 的回答思路：AI 是工具，技术决策和质量把控是人做的"),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("d:\\java_workspace\\技能实训\\NCT-Sim答辩脚本.docx", buffer);
  console.log("答辩脚本Word文档已生成: NCT-Sim答辩脚本.docx");
}

main().catch(err => {
  console.error("生成失败:", err);
  process.exit(1);
});
