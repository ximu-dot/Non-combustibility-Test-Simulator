const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ============================================================
// Icon rendering utilities
// ============================================================
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  // Load icons
  const { 
    FaProjectDiagram, FaClipboardCheck, FaCogs, FaChartLine, 
    FaFileAlt, FaLightbulb, FaRocket, FaShieldAlt, 
    FaDesktop, FaDatabase, FaFlask, FaCheckCircle,
    FaArrowRight, FaStar, FaUsers, FaLayerGroup,
    FaExclamationTriangle, FaCode, FaChartBar, FaBug
  } = require("react-icons/fa");
  
  const { 
    MdArchitecture, MdDevices, MdCloudDone 
  } = require("react-icons/md");
  
  const { 
    HiOutlineLightningBolt, HiOutlineDocumentReport 
  } = require("react-icons/hi");

  // Pre-render all icons
  const icons = {};
  const iconMap = {
    project: [FaProjectDiagram, "FFFFFF"],
    req: [FaClipboardCheck, "FFFFFF"],
    design: [MdArchitecture, "FFFFFF"],
    tech: [FaCogs, "FFFFFF"],
    chart: [FaChartLine, "FFFFFF"],
    doc: [FaFileAlt, "FFFFFF"],
    idea: [FaLightbulb, "FFFFFF"],
    rocket: [FaRocket, "FFFFFF"],
    shield: [FaShieldAlt, "FFFFFF"],
    desktop: [FaDesktop, "FFFFFF"],
    db: [FaDatabase, "FFFFFF"],
    flask: [FaFlask, "FFFFFF"],
    check: [FaCheckCircle, "0D9488"],
    arrow: [FaArrowRight, "0D9488"],
    star: [FaStar, "FFFFFF"],
    users: [FaUsers, "FFFFFF"],
    layer: [FaLayerGroup, "FFFFFF"],
    warn: [FaExclamationTriangle, "FFFFFF"],
    code: [FaCode, "FFFFFF"],
    bar: [FaChartBar, "FFFFFF"],
    bug: [FaBug, "FFFFFF"],
    lightning: [HiOutlineLightningBolt, "FFFFFF"],
    report: [HiOutlineDocumentReport, "FFFFFF"],
    device: [MdDevices, "FFFFFF"],
    cloud: [MdCloudDone, "FFFFFF"],
  };

  for (const [key, [component, color]] of Object.entries(iconMap)) {
    icons[key] = await iconToBase64Png(component, "#" + color);
  }

  // ============================================================
  // Presentation setup
  // ============================================================
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "ximu-dot";
  pres.title = "NCT-Sim 建筑材料不燃性试验仿真系统 - 答辩演示";

  // Color palette - Teal Trust
  const C = {
    teal: "0D9488",
    tealDark: "0F766E",
    tealLight: "14B8A6",
    mint: "5EEAD4",
    navy: "134E4A",
    darkBg: "042F2E",
    white: "FFFFFF",
    offWhite: "F0FDFA",
    gray: "64748B",
    darkText: "1E293B",
    lightText: "CBD5E1",
    accent: "F59E0B",
    red: "EF4444",
    green: "10B981",
  };

  // Helper: create shadow factory
  const shadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.10 });

  // ============================================================
  // Slide 1: Title Slide
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkBg };

    // Decorative gradient-like shapes
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.darkBg } });
    slide.addShape(pres.shapes.OVAL, { x: -1.5, y: -1.5, w: 5, h: 5, fill: { color: C.navy, transparency: 70 } });
    slide.addShape(pres.shapes.OVAL, { x: 7.5, y: 3.5, w: 4, h: 4, fill: { color: C.navy, transparency: 70 } });
    slide.addShape(pres.shapes.OVAL, { x: 8.5, y: -1, w: 3, h: 3, fill: { color: C.teal, transparency: 85 } });

    // Icon
    slide.addImage({ data: icons.project, x: 4.45, y: 0.6, w: 1.1, h: 1.1 });

    // Title
    slide.addText("NCT-Sim", {
      x: 1, y: 1.8, w: 8, h: 0.8,
      fontSize: 48, fontFace: "Arial Black", color: C.white,
      align: "center", bold: true, charSpacing: 6,
    });

    slide.addText("建筑材料不燃性试验仿真系统", {
      x: 1, y: 2.6, w: 8, h: 0.5,
      fontSize: 22, fontFace: "Microsoft YaHei", color: C.mint,
      align: "center",
    });

    // Divider
    slide.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.3, w: 3, h: 0.04, fill: { color: C.teal } });

    // Subtitle
    slide.addText([
      { text: "基于 ISO 11820:2022 国际标准  |  .NET 8 + WinForms + SQLite", options: { breakLine: true } },
      { text: "AI 智能体驱动  ·  软件全流程开发  ·  人机协同实践", options: {} },
    ], {
      x: 1, y: 3.6, w: 8, h: 0.7,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.lightText,
      align: "center",
    });

    // Bottom info
    slide.addText("2026年6月  |  ximu-dot", {
      x: 1, y: 4.8, w: 8, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.gray,
      align: "center",
    });
  }

  // ============================================================
  // Slide 2: Table of Contents
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    // Header
    slide.addText("答辩内容概览", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    const items = [
      { num: "01", title: "项目背景与目标", desc: "为什么做这个项目？解决什么问题？" },
      { num: "02", title: "需求分析", desc: "功能需求、非功能需求、可行性分析" },
      { num: "03", title: "系统设计", desc: "架构设计、模块划分、数据库设计" },
      { num: "04", title: "AI 智能体全流程协作", desc: "Claude Code 在各阶段的角色与贡献" },
      { num: "05", title: "核心技术实现", desc: "仿真引擎、状态机、实时曲线" },
      { num: "06", title: "测试与验证", desc: "功能测试、性能测试、缺陷分析" },
      { num: "07", title: "创新亮点", desc: "AI 驱动开发 + 技术突破" },
      { num: "08", title: "成果展示", desc: "系统功能矩阵与关键数据" },
      { num: "09", title: "总结与展望", desc: "经验总结、改进方向、AI 协作心得" },
    ];

    const startY = 1.3;
    const itemH = 0.46;
    const gap = 0.06;

    items.forEach((item, i) => {
      const y = startY + i * (itemH + gap);
      
      // Number circle
      slide.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.02, w: 0.4, h: 0.4, fill: { color: C.teal } });
      slide.addText(item.num, {
        x: 0.7, y: y + 0.02, w: 0.4, h: 0.4,
        fontSize: 14, fontFace: "Arial", color: C.white, bold: true,
        align: "center", valign: "middle",
      });

      // Title
      slide.addText(item.title, {
        x: 1.3, y: y - 0.02, w: 3, h: 0.25,
        fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
      });

      // Description
      slide.addText(item.desc, {
        x: 1.3, y: y + 0.22, w: 4, h: 0.2,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.gray,
      });
    });

    // Right side decoration
    slide.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0.5, w: 3, h: 4.6, fill: { color: C.offWhite }, shadow: shadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0.5, w: 0.06, h: 4.6, fill: { color: C.teal } });
    
    slide.addImage({ data: icons.project, x: 7.3, y: 1.2, w: 1.4, h: 1.4, transparency: 70 });
    
    slide.addText("ISO 11820:2022", {
      x: 6.8, y: 2.8, w: 2.4, h: 0.3,
      fontSize: 16, fontFace: "Arial", color: C.teal, bold: true, align: "center",
    });
    slide.addText("国际标准\n建筑材料不燃性试验", {
      x: 6.8, y: 3.1, w: 2.4, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.gray, align: "center",
    });

    slide.addText([
      { text: "核心指标", options: { bold: true, breakLine: true, fontSize: 12, color: C.darkText } },
      { text: "炉温 750°C  |  试验 60分钟", options: { breakLine: true, fontSize: 10, color: C.gray } },
      { text: "温升 ≤ 50°C  |  失重率 ≤ 50%", options: { fontSize: 10, color: C.gray } },
    ], { x: 6.8, y: 3.9, w: 2.4, h: 0.8, align: "center" });
  }

  // ============================================================
  // Slide 3: Project Background & Problem
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("项目背景与目标", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Pain Points - left
    slide.addText("真实试验的痛点", {
      x: 0.7, y: 1.3, w: 4.3, h: 0.35,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.teal, bold: true,
    });

    const painPoints = [
      { icon: icons.warn, text: "设备昂贵：单套 50-80 万元" },
      { icon: icons.lightning, text: "耗电量大：单次试验约 20 kWh" },
      { icon: icons.shield, text: "安全风险：高温烫伤、火灾隐患" },
      { icon: icons.users, text: "教学受限：1组/套，无法并行" },
      { icon: icons.flask, text: "耗时漫长：单次约 2 小时" },
    ];

    painPoints.forEach((p, i) => {
      const y = 1.8 + i * 0.55;
      slide.addImage({ data: p.icon, x: 0.7, y: y + 0.05, w: 0.32, h: 0.32 });
      slide.addText(p.text, {
        x: 1.15, y: y, w: 3.8, h: 0.4,
        fontSize: 13, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });

    // Solution - right
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.3, w: 4, h: 4, fill: { color: C.offWhite }, shadow: shadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.3, w: 4, h: 0.06, fill: { color: C.teal } });

    slide.addText("我们的解决方案", {
      x: 5.8, y: 1.55, w: 3.4, h: 0.35,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true,
    });

    slide.addImage({ data: icons.desktop, x: 6.8, y: 2.1, w: 1.4, h: 1.4, transparency: 80 });

    slide.addText([
      { text: "NCT-Sim 仿真系统", options: { bold: true, breakLine: true, fontSize: 15, color: C.darkText } },
      { text: "", options: { breakLine: true, fontSize: 6 } },
      { text: "零成本", options: { bold: true, color: C.teal, breakLine: true, fontSize: 13 } },
      { text: "全部使用开源免费技术栈", options: { breakLine: true, fontSize: 11, color: C.gray } },
      { text: "", options: { breakLine: true, fontSize: 6 } },
      { text: "零风险", options: { bold: true, color: C.teal, breakLine: true, fontSize: 13 } },
      { text: "纯软件仿真，无高温/触电隐患", options: { breakLine: true, fontSize: 11, color: C.gray } },
      { text: "", options: { breakLine: true, fontSize: 6 } },
      { text: "高效率", options: { bold: true, color: C.teal, breakLine: true, fontSize: 13 } },
      { text: "支持无限并行教学，可加速演示", options: { fontSize: 11, color: C.gray } },
    ], { x: 5.8, y: 2.1, w: 3.4, h: 3 });

    // Goal
    slide.addText("项目目标：完整模拟 ISO 11820 不燃性试验全流程的 Windows 桌面仿真软件", {
      x: 0.7, y: 4.8, w: 8.5, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true,
    });
  }

  // ============================================================
  // Slide 4: Requirements Analysis
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("需求分析", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Five feasibility dimensions - 5 cards
    const feasItems = [
      { title: "技术可行性", items: "全栈技术成熟\n.NET 8 LTS + WinForms\n开源库生态完善", color: C.teal },
      { title: "经济可行性", items: "零预算项目\n全部开源免费许可\n节省硬件50万+", color: C.tealDark },
      { title: "操作可行性", items: "学习成本 < 30分钟\n向导式流程引导\n标准Windows交互", color: C.tealLight },
      { title: "法律可行性", items: "MIT/Apache 2.0许可\n数据完全本地化\nISO标准合规引用", color: "0F766E" },
      { title: "时间可行性", items: "4周开发周期\n25%应急缓冲\n里程碑明确", color: "115E59" },
    ];

    feasItems.forEach((item, i) => {
      const x = 0.5 + i * 1.85;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: 1.7, h: 2.5, fill: { color: item.color }, shadow: shadow() });
      slide.addText(item.title, {
        x, y: 1.4, w: 1.7, h: 0.35,
        fontSize: 14, fontFace: "Microsoft YaHei", color: C.white, bold: true, align: "center",
      });
      slide.addText(item.items, {
        x: x + 0.1, y: 1.85, w: 1.5, h: 1.8,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.white, align: "center", valign: "top",
      });
    });

    // MoSCoW priority
    slide.addText("需求优先级 (MoSCoW)", {
      x: 0.7, y: 4.1, w: 4, h: 0.35,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const priorityData = [
      { label: "Must Have", desc: "登录、仿真、状态机、实时显示、曲线图、CSV导出", pct: 55, color: C.teal },
      { label: "Should Have", desc: "Excel/PDF报告、历史查询、消息日志", pct: 25, color: C.tealLight },
      { label: "Could Have", desc: "设备校准、参数配置", pct: 15, color: C.mint },
      { label: "Won't Have", desc: "真实硬件通信、多语言", pct: 5, color: C.gray },
    ];

    // Simple stacked bar
    let barX = 0.7;
    priorityData.forEach((p) => {
      const w = p.pct / 100 * 8.5;
      slide.addShape(pres.shapes.RECTANGLE, { x: barX, y: 4.55, w, h: 0.35, fill: { color: p.color } });
      if (w > 1.5) {
        slide.addText(p.label, {
          x: barX + 0.1, y: 4.55, w: w - 0.2, h: 0.35,
          fontSize: 9, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
        });
      }
      barX += w;
    });

    // Legend
    priorityData.forEach((p, i) => {
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7 + i * 2.2, y: 5.0, w: 0.15, h: 0.15, fill: { color: p.color } });
      slide.addText(`${p.label}: ${p.desc}`, {
        x: 0.9 + i * 2.2, y: 4.97, w: 2, h: 0.2,
        fontSize: 8, fontFace: "Microsoft YaHei", color: C.gray,
      });
    });
  }

  // ============================================================
  // Slide 5: System Architecture
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("系统架构设计", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Architecture layers - visual stack
    const layers = [
      { name: "UI 层 (Forms)", color: C.teal, desc: "LoginForm, MainForm, NewTestDialog, RealTimePanel, ChartPanel...", y: 1.3 },
      { name: "业务核心层 (Core)", color: C.tealDark, desc: "TestController — 状态机 + 业务逻辑协调", y: 2.1 },
      { name: "服务层 (Services)", color: "0F766E", desc: "DaqWorker, SensorSimulator, ExportService, TemperatureAnalyzer", y: 2.9 },
      { name: "数据层 (Data)", color: "115E59", desc: "DbHelper (SQLite), CsvWriter (时序数据)", y: 3.7 },
      { name: "全局层 (Global)", color: C.navy, desc: "AppContext — 单例，持有所有核心对象引用", y: 4.5 },
    ];

    layers.forEach((layer) => {
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: layer.y, w: 5.5, h: 0.6, fill: { color: layer.color }, shadow: shadow() });
      slide.addText(layer.name, {
        x: 0.9, y: layer.y, w: 2.2, h: 0.6,
        fontSize: 14, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
      });
      slide.addText(layer.desc, {
        x: 3.2, y: layer.y, w: 2.9, h: 0.6,
        fontSize: 9, fontFace: "Microsoft YaHei", color: C.white, valign: "middle",
      });
    });

    // Arrows between layers
    for (let i = 0; i < layers.length - 1; i++) {
      slide.addText("▼", {
        x: 3.2, y: layers[i].y + 0.58, w: 0.5, h: 0.22,
        fontSize: 14, color: C.teal, align: "center",
      });
    }

    // Right side - key design principles
    slide.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.3, w: 3, h: 3.8, fill: { color: C.offWhite }, shadow: shadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.3, w: 3, h: 0.06, fill: { color: C.teal } });

    slide.addText("设计原则", {
      x: 6.8, y: 1.5, w: 2.4, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true,
    });

    const principles = [
      "单向依赖：上层依赖下层",
      "事件驱动：DataBroadcast",
      "UI线程安全：Control.Invoke()",
      "配置驱动：appsettings.json",
      "仿真/硬件双模式切换",
      "6种设计模式应用",
    ];

    principles.forEach((p, i) => {
      slide.addImage({ data: icons.check, x: 6.8, y: 2.0 + i * 0.45, w: 0.22, h: 0.22 });
      slide.addText(p, {
        x: 7.15, y: 1.95 + i * 0.45, w: 2.2, h: 0.32,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });
  }

  // ============================================================
  // Slide: AI 智能体全流程协作
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("AI 智能体全流程协作", {
      x: 0.7, y: 0.25, w: 8, h: 0.6,
      fontSize: 28, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.8, w: 1.2, h: 0.04, fill: { color: C.teal } });
    slide.addText("Claude Code 智能体在软件全流程各阶段的具体贡献", {
      x: 0.7, y: 0.9, w: 8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.gray,
    });

    // 7个阶段的流程卡片
    const phases = [
      { phase: "选题与方向", icon: icons.lightning, tasks: "分析ISO 11820标准\n建议不燃性试验仿真\n评估技术可行性" },
      { phase: "需求分析", icon: icons.req, tasks: "五维可行性分析\nMoSCoW优先级排序\n功能需求矩阵" },
      { phase: "架构设计", icon: icons.design, tasks: "5层架构设计\n18模块划分\n6张数据库表设计" },
      { phase: "编码实现", icon: icons.code, tasks: "~5000行C#代码\n19个源文件\n6种设计模式" },
      { phase: "测试验证", icon: icons.bug, tasks: "13项功能测试\n6项性能测试\n5个缺陷发现与修复" },
      { phase: "文档报告", icon: icons.report, tasks: "6份技术文档\nPPT答辩材料\nExcel/PDF报告" },
      { phase: "问题修复", icon: icons.warn, tasks: "编译错误修复\n命名冲突解决\nPDF曲线图补充" },
    ];

    const cardW = 1.2;
    const startX = 0.25;
    const gap = 0.08;
    phases.forEach((p, i) => {
      const x = startX + i * (cardW + gap);
      const y = 1.5;

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: cardW, h: 3.5, fill: { color: C.offWhite }, shadow: shadow() });

      // 顶部色条
      const colors = ["0D9488", "0F766E", "14B8A6", "134E4A", "0D9488", "0F766E", "14B8A6"];
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: cardW, h: 0.06, fill: { color: colors[i] } });

      // 图标
      slide.addImage({ data: p.icon, x: x + cardW / 2 - 0.2, y: y + 0.2, w: 0.4, h: 0.4, transparency: 30 });

      // 阶段名
      slide.addText(p.phase, {
        x: x + 0.05, y: y + 0.7, w: cardW - 0.1, h: 0.35,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, align: "center", valign: "middle",
      });

      // 分隔线
      slide.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: y + 1.1, w: cardW - 0.4, h: 0.02, fill: { color: C.tealLight, transparency: 50 } });

      // 任务列表
      slide.addText(p.tasks, {
        x: x + 0.08, y: y + 1.25, w: cardW - 0.16, h: 2.1,
        fontSize: 8.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "top", align: "center",
        lineSpacingMultiple: 1.5,
      });
    });

    // 底部总结
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.15, w: 8.6, h: 0.35, fill: { color: C.teal, transparency: 90 } });
    slide.addText("1 个学生 + 1 个智能体 = 1 个完整软件工程团队 —— 覆盖需求→设计→编码→测试→文档全流程", {
      x: 0.7, y: 5.15, w: 8.6, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, align: "center", valign: "middle",
    });
  }

  // ============================================================
  // Slide: 人机协作模式
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("人机协作模式：智能体做什么 vs 我做什么", {
      x: 0.7, y: 0.25, w: 8.5, h: 0.6,
      fontSize: 28, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.8, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // 两列对比
    // 左侧：智能体做的
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.2, h: 0.5, fill: { color: C.teal } });
    slide.addImage({ data: icons.cloud, x: 0.7, y: 1.17, w: 0.35, h: 0.35 });
    slide.addText("Claude Code 智能体负责", {
      x: 1.15, y: 1.1, w: 3.3, h: 0.5,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
    });

    const aiTasks = [
      "生成代码框架和样板代码（~80%代码量）",
      "编写技术文档初稿（6份报告）",
      "设计数据库表结构和字段",
      "分析ISO标准文本并提取关键参数",
      "设计测试用例和性能指标",
      "自动修复编译错误和命名冲突",
      "生成PPT大纲和答辩材料结构",
    ];
    aiTasks.forEach((t, i) => {
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.7 + i * 0.44, w: 4.2, h: 0.38, fill: { color: C.offWhite } });
      slide.addText(t, {
        x: 0.7, y: 1.7 + i * 0.44, w: 3.8, h: 0.38,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });

    // 右侧：我做的
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.1, w: 4.2, h: 0.5, fill: { color: C.navy } });
    slide.addImage({ data: icons.users, x: 5.5, y: 1.17, w: 0.35, h: 0.35 });
    slide.addText("我（开发者）负责", {
      x: 5.95, y: 1.1, w: 3.3, h: 0.5,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.white, bold: true, valign: "middle",
    });

    const myTasks = [
      "确定技术方向（WinForms vs WPF）",
      "审查验证AI生成的代码逻辑",
      "运行测试、发现Bug、反馈修正",
      "关键算法验证（仿真引擎3阶段）",
      "架构决策（5层架构、事件驱动）",
      "人工测试边界条件和异常场景",
      "整合各部分、确保整体一致性",
    ];
    myTasks.forEach((t, i) => {
      slide.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.7 + i * 0.44, w: 4.2, h: 0.38, fill: { color: C.offWhite } });
      slide.addText(t, {
        x: 5.5, y: 1.7 + i * 0.44, w: 3.8, h: 0.38,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });

    // 底部协作模式
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.85, w: 9, h: 0.6, fill: { color: C.teal, transparency: 92 } });

    // 流程图：我 → 智能体 → 审查 → 迭代
    const flowSteps = [
      { label: "我描述需求", w: 1.5 },
      { label: "→", w: 0.4, isArrow: true },
      { label: "AI生成初稿", w: 1.5 },
      { label: "→", w: 0.4, isArrow: true },
      { label: "我审查验证", w: 1.5 },
      { label: "→", w: 0.4, isArrow: true },
      { label: "反馈修正", w: 1.3 },
      { label: "→", w: 0.4, isArrow: true },
      { label: "最终交付", w: 1.3 },
    ];
    let fx = 0.6;
    flowSteps.forEach((s) => {
      if (s.isArrow) {
        slide.addText("→", {
          x: fx, y: 4.92, w: s.w, h: 0.45,
          fontSize: 18, fontFace: "Arial", color: C.teal, bold: true, align: "center", valign: "middle",
        });
      } else {
        slide.addShape(pres.shapes.RECTANGLE, { x: fx, y: 4.92, w: s.w, h: 0.45, fill: { color: C.tealDark } });
        slide.addText(s.label, {
          x: fx, y: 4.92, w: s.w, h: 0.45,
          fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.white, bold: true, align: "center", valign: "middle",
        });
      }
      fx += s.w;
    });
  }

  // ============================================================
  // Slide 6: Module Design & Database
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("模块划分与数据库设计", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Module grid - 18 modules in a compact table
    slide.addText("18个功能模块", {
      x: 0.7, y: 1.2, w: 4.3, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const moduleTable = [
      [
        { text: "ID", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
        { text: "模块", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
        { text: "层", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
        { text: "职责", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
      ],
      ["M01", "LoginModule", "UI", "角色选择、密码验证"],
      ["M03", "NewTestDialog", "UI", "新建试验信息录入"],
      ["M04", "RealTimePanel", "UI", "5通道温度实时显示"],
      ["M05", "ChartPanel", "UI", "OxyPlot温度曲线图"],
      ["M11", "TestController", "Core", "状态机管理、业务协调"],
      ["M12", "DaqWorker", "Service", "数据采集线程(每800ms)"],
      ["M13", "SensorSimulator", "Service", "5通道温度仿真引擎"],
      ["M14", "ExportService", "Service", "CSV/Excel/PDF报告"],
      ["M16", "DbHelper", "Data", "SQLite数据库操作"],
    ];

    slide.addTable(moduleTable, {
      x: 0.7, y: 1.6, w: 5.3,
      colW: [0.5, 1.6, 0.9, 2.3],
      border: { pt: 0.5, color: "E2E8F0" },
      rowH: [0.25, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22],
      fontSize: 8,
      fontFace: "Microsoft YaHei",
      color: C.darkText,
    });

    // Database - right side
    slide.addText("6张数据库表", {
      x: 6.3, y: 1.2, w: 3.2, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const dbTables = [
      { name: "operators", desc: "用户账号 (admin/experimenter)" },
      { name: "apparatus", desc: "试验设备信息" },
      { name: "productmaster", desc: "样品信息" },
      { name: "testmaster ★", desc: "试验记录核心表 (40+字段)" },
      { name: "sensors", desc: "传感器通道配置 (17通道)" },
      { name: "CalibrationRecords", desc: "设备校准历史" },
    ];

    dbTables.forEach((t, i) => {
      const y = 1.6 + i * 0.55;
      slide.addShape(pres.shapes.RECTANGLE, { x: 6.3, y, w: 3.2, h: 0.48, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 6.3, y, w: 0.05, h: 0.48, fill: { color: C.teal } });
      slide.addText(t.name, {
        x: 6.5, y: y + 0.02, w: 1.8, h: 0.22,
        fontSize: 11, fontFace: "Consolas", color: C.tealDark, bold: true,
      });
      slide.addText(t.desc, {
        x: 6.5, y: y + 0.24, w: 2.8, h: 0.2,
        fontSize: 9, fontFace: "Microsoft YaHei", color: C.gray,
      });
    });

    // Key note
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.0, w: 8.8, h: 0.4, fill: { color: C.offWhite } });
    slide.addText("💡 温度时序数据不入库，存为独立CSV文件 — 减少数据库压力，便于数据交换", {
      x: 0.9, y: 5.0, w: 8.4, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, valign: "middle",
    });
  }

  // ============================================================
  // Slide 7: Core Tech - Simulation Engine
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("核心技术：温度仿真引擎", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // 5 channels display
    const channels = [
      { name: "炉温1 TF1", temp: "750.0", unit: "°C", color: C.teal },
      { name: "炉温2 TF2", temp: "749.8", unit: "°C", color: C.tealDark },
      { name: "表面温 TS", temp: "620.5", unit: "°C", color: C.tealLight },
      { name: "中心温 TC", temp: "480.1", unit: "°C", color: "0F766E" },
      { name: "校准温 TCal", temp: "751.0", unit: "°C", color: "115E59" },
    ];

    channels.forEach((ch, i) => {
      const x = 0.5 + i * 1.85;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.7, h: 1.1, fill: { color: ch.color }, shadow: shadow() });
      slide.addText(ch.name, {
        x, y: 1.25, w: 1.7, h: 0.3,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.white, align: "center",
      });
      slide.addText(ch.temp, {
        x, y: 1.5, w: 1.7, h: 0.5,
        fontSize: 28, fontFace: "Consolas", color: C.white, bold: true, align: "center",
      });
      slide.addText(ch.unit, {
        x, y: 1.95, w: 1.7, h: 0.25,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.white, align: "center",
      });
    });

    // Phase algorithm description
    slide.addText("分阶段仿真算法", {
      x: 0.7, y: 2.55, w: 4, h: 0.35,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const phases = [
      { phase: "升温阶段", desc: "线性升温 + 高斯噪声\nTF1/2同步上升(独立噪声)\nTS/TC低比例跟随", color: C.teal },
      { phase: "稳定阶段", desc: "钳位到750°C + 微小波动\n稳定计数器判定(连续4 tick)\n745~755°C范围内", color: C.tealDark },
      { phase: "记录阶段", desc: "炉温保持750°C\nTS→TF1×0.95 指数逼近\nTC→TF1×0.85 指数逼近", color: "0F766E" },
    ];

    phases.forEach((p, i) => {
      const x = 0.7 + i * 3.1;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 3.0, w: 2.85, h: 1.7, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 3.0, w: 2.85, h: 0.06, fill: { color: p.color } });
      slide.addText(p.phase, {
        x: x + 0.15, y: 3.15, w: 2.55, h: 0.3,
        fontSize: 13, fontFace: "Microsoft YaHei", color: p.color, bold: true,
      });
      slide.addText(p.desc, {
        x: x + 0.15, y: 3.5, w: 2.55, h: 1.1,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "top",
      });
    });

    // Key params
    slide.addText("关键参数：采样间隔 800ms | 目标温度 750°C | 升温速率 40°C/s | 温度波动 ±0.5°C | 稳定阈值 3°C", {
      x: 0.7, y: 4.9, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.gray,
    });
  }

  // ============================================================
  // Slide 8: Core Tech - State Machine
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("核心技术：试验状态机", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // State machine flow - 5 states
    const states = [
      { name: "Idle\n空闲", x: 0.7, color: C.gray },
      { name: "Preparing\n升温中", x: 2.2, color: C.accent },
      { name: "Ready\n就绪", x: 3.7, color: C.teal },
      { name: "Recording\n记录中", x: 5.2, color: C.tealDark },
      { name: "Complete\n完成", x: 6.7, color: C.navy },
    ];

    states.forEach((s) => {
      slide.addShape(pres.shapes.OVAL, { x: s.x, y: 1.3, w: 1.2, h: 1.2, fill: { color: s.color }, shadow: shadow() });
      slide.addText(s.name, {
        x: s.x, y: 1.3, w: 1.2, h: 1.2,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.white, bold: true, align: "center", valign: "middle",
      });
    });

    // Arrows
    const arrowPositions = [
      { x: 1.9, text: "开始升温" },
      { x: 3.4, text: "温度稳定" },
      { x: 4.9, text: "开始记录" },
      { x: 6.4, text: "停止/超时" },
    ];
    arrowPositions.forEach((a) => {
      slide.addText("→", {
        x: a.x, y: 1.55, w: 0.3, h: 0.7,
        fontSize: 28, color: C.teal, align: "center", valign: "middle",
      });
    });

    // Button state table
    slide.addText("按钮状态控制表", {
      x: 0.7, y: 2.8, w: 4, h: 0.35,
      fontSize: 16, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const btnTable = [
      [
        { text: "按钮", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "Idle", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "Preparing", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "Ready", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "Recording", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "Complete", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
      ],
      ["新建试验", "✅", "*", "❌", "❌", "*"],
      ["开始升温", "✅", "❌", "❌", "❌", "❌"],
      ["停止升温", "❌", "✅", "✅", "❌", "✅"],
      ["开始记录", "❌", "❌", "✅", "❌", "❌"],
      ["停止记录", "❌", "❌", "❌", "✅", "❌"],
      ["参数设置", "✅", "✅", "✅", "❌", "✅"],
    ];

    slide.addTable(btnTable, {
      x: 0.7, y: 3.2, w: 6,
      colW: [1.2, 0.8, 1.0, 0.8, 1.0, 1.0],
      border: { pt: 0.5, color: "E2E8F0" },
      rowH: [0.3, 0.28, 0.28, 0.28, 0.28, 0.28],
      fontSize: 9,
      fontFace: "Microsoft YaHei",
      color: C.darkText,
    });

    // Safety mechanisms - right
    slide.addShape(pres.shapes.RECTANGLE, { x: 7, y: 2.8, w: 2.5, h: 2.5, fill: { color: C.offWhite }, shadow: shadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 7, y: 2.8, w: 2.5, h: 0.06, fill: { color: C.teal } });

    slide.addText("安全保护机制", {
      x: 7.2, y: 2.95, w: 2.1, h: 0.3,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true,
    });

    const safetyItems = [
      "未保存试验阻止新建",
      "按钮自动跟随状态机",
      "温度回退自动处理",
      "lock同步跨线程操作",
      "非法转换直接忽略",
    ];
    safetyItems.forEach((s, i) => {
      slide.addImage({ data: icons.check, x: 7.2, y: 3.35 + i * 0.35, w: 0.18, h: 0.18 });
      slide.addText(s, {
        x: 7.5, y: 3.3 + i * 0.35, w: 1.8, h: 0.28,
        fontSize: 9, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });
  }

  // ============================================================
  // Slide 9: Core Tech - Data Flow & Report
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("数据流与报告生成", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Temperature data flow diagram - left
    slide.addText("温度数据流", {
      x: 0.7, y: 1.2, w: 4, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const flowSteps = [
      { text: "SensorSimulator", sub: "仿真算法生成温度", color: C.teal },
      { text: "DaqWorker (后台线程)", sub: "每800ms采集 + 事件广播", color: C.tealDark },
      { text: "CsvWriter → CSV文件", sub: "Recording状态逐秒写入", color: "0F766E" },
      { text: "UI层 (Invoke封送)", sub: "实时面板 + 曲线图 + 消息日志", color: "115E59" },
    ];

    flowSteps.forEach((step, i) => {
      const y = 1.6 + i * 0.85;
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 4.2, h: 0.7, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.7, fill: { color: step.color } });
      slide.addText(step.text, {
        x: 0.95, y: y + 0.05, w: 3.8, h: 0.28,
        fontSize: 12, fontFace: "Microsoft YaHei", color: step.color, bold: true,
      });
      slide.addText(step.sub, {
        x: 0.95, y: y + 0.35, w: 3.8, h: 0.25,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.gray,
      });
      if (i < flowSteps.length - 1) {
        slide.addText("▼", {
          x: 2.5, y: y + 0.68, w: 0.5, h: 0.2,
          fontSize: 14, color: C.teal, align: "center",
        });
      }
    });

    // Report generation - right
    slide.addText("三种报告格式", {
      x: 5.3, y: 1.2, w: 4.2, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const reports = [
      { format: "CSV", desc: "逐秒温度数据\n标准逗号分隔\nTestData目录", color: C.teal, icon: icons.code },
      { format: "Excel", desc: "Sheet1: 试验信息表\nSheet2: 温度数据表\nSheet3: 温度曲线图", color: C.tealDark, icon: icons.bar },
      { format: "PDF", desc: "报告封面\n试验概要 + 曲线图\n判定结论", color: "0F766E", icon: icons.doc },
    ];

    reports.forEach((r, i) => {
      const y = 1.7 + i * 1.3;
      slide.addShape(pres.shapes.RECTANGLE, { x: 5.3, y, w: 4.2, h: 1.15, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 5.3, y, w: 4.2, h: 0.06, fill: { color: r.color } });
      slide.addImage({ data: r.icon, x: 5.5, y: y + 0.15, w: 0.5, h: 0.5, transparency: 60 });
      slide.addText(r.format, {
        x: 6.2, y: y + 0.1, w: 3.1, h: 0.3,
        fontSize: 16, fontFace: "Arial Black", color: r.color, bold: true,
      });
      slide.addText(r.desc, {
        x: 6.2, y: y + 0.4, w: 3.1, h: 0.7,
        fontSize: 9, fontFace: "Microsoft YaHei", color: C.gray, valign: "top",
      });
    });
  }

  // ============================================================
  // Slide 10: Testing & Validation
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("测试与验证", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Big stat callouts
    const stats = [
      { num: "13", label: "功能测试项", sub: "全部通过" },
      { num: "6", label: "性能测试项", sub: "指标达标" },
      { num: "5", label: "缺陷发现", sub: "0严重/3一般/2轻微" },
      { num: "100%", label: "P0-P2完成率", sub: "16/18功能" },
    ];

    stats.forEach((s, i) => {
      const x = 0.5 + i * 2.35;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.1, h: 1.4, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addText(s.num, {
        x, y: 1.3, w: 2.1, h: 0.7,
        fontSize: 36, fontFace: "Arial Black", color: C.teal, bold: true, align: "center",
      });
      slide.addText(s.label, {
        x, y: 2.0, w: 2.1, h: 0.3,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.darkText, align: "center", bold: true,
      });
      slide.addText(s.sub, {
        x, y: 2.3, w: 2.1, h: 0.25,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.gray, align: "center",
      });
    });

    // Test items table
    slide.addText("核心功能测试结果", {
      x: 0.7, y: 2.9, w: 4, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const testItems = [
      ["登录验证", "✅", "CSV导出", "✅"],
      ["新建试验", "✅", "Excel报告", "✅"],
      ["升温过程", "✅", "PDF报告", "✅"],
      ["稳定检测", "✅", "历史查询", "✅"],
      ["记录过程", "✅", "按钮保护", "✅"],
      ["停止记录", "✅", "温度回退", "✅"],
    ];

    slide.addTable(
      testItems.map((row, ri) => 
        row.map((cell, ci) => ({
          text: cell,
          options: ci % 2 === 0 ? { fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText } : { fontSize: 10, color: C.green, align: "center" },
        }))
      ),
      {
        x: 0.7, y: 3.3, w: 4.8,
        colW: [1.3, 0.5, 1.3, 0.5],
        border: { pt: 0.5, color: "E2E8F0" },
        rowH: [0.28, 0.28, 0.28, 0.28, 0.28, 0.28],
      }
    );

    // Performance test - right
    slide.addText("性能测试", {
      x: 5.8, y: 2.9, w: 3.7, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const perfChart = [
      { name: "UI响应时间", value: "< 100ms" },
      { name: "内存占用", value: "~150MB" },
      { name: "连续运行", value: "> 2h 无崩溃" },
      { name: "曲线渲染", value: "10min窗口无卡顿" },
      { name: "CSV写入", value: "1行/秒稳定" },
      { name: "Excel生成", value: "1-3秒" },
    ];

    // Horizontal bars
    perfChart.forEach((p, i) => {
      const y = 3.3 + i * 0.42;
      slide.addShape(pres.shapes.RECTANGLE, { x: 5.8, y, w: 3.7, h: 0.35, fill: { color: C.offWhite } });
      slide.addText(p.name, {
        x: 5.9, y, w: 2, h: 0.35,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
      slide.addText(p.value, {
        x: 8, y, w: 1.4, h: 0.35,
        fontSize: 11, fontFace: "Consolas", color: C.teal, bold: true, valign: "middle", align: "right",
      });
    });

    // Bug summary
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.05, w: 8.8, h: 0.4, fill: { color: C.offWhite } });
    slide.addText("缺陷分布：🔴 严重 0 | 🟡 一般 3 (密码明文、无主键、JSON序列化) | 🟢 轻微 2 (表名大小写、登录字段) — 全部已记录闭环", {
      x: 0.9, y: 5.05, w: 8.4, h: 0.4,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
    });
  }

  // ============================================================
  // Slide 11: Innovation Highlights
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("创新亮点", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // 5 innovation cards
    const innovations = [
      {
        title: "AI 智能体全流程驱动",
        desc: "Claude Code 智能体覆盖需求分析→架构设计→编码→测试→文档全流程，1人+1AI完成传统5-6人团队工作量，掌握AI协同开发核心技能",
        icon: icons.idea,
      },
      {
        title: "分阶段仿真模型",
        desc: "升温/稳定/记录三个阶段使用不同算法，升温线性+噪声，稳定钳位+波动，记录指数逼近热传导延迟，模拟真实热力学过程",
        icon: icons.flask,
      },
      {
        title: "指数逼近算法",
        desc: "记录阶段样品温度使用 TS→TF1×0.95、TC→TF1×0.85 指数逼近模型，TC比TS更慢，真实模拟材料内外温差和热传导延迟效应",
        icon: icons.chart,
      },
      {
        title: "配置驱动架构",
        desc: "所有仿真参数通过 appsettings.json 控制（升温速率、目标温度、噪声幅度等），无需重新编译即可调整行为，支持仿真/硬件双模式切换",
        icon: icons.layer,
      },
      {
        title: "事件驱动数据流",
        desc: "DataBroadcast事件将数据从后台线程传至UI层，结合 Invoke 封送解决跨线程问题，实现松耦合、可扩展的数据分发机制",
        icon: icons.rocket,
      },
    ];

    innovations.forEach((inv, i) => {
      let x, y;
      if (i < 3) {
        x = 0.35 + i * 3.15;
        y = 1.2;
      } else {
        // Center last 2 cards on second row
        x = 1.9 + (i - 3) * 3.15;
        y = 3.2;
      }
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 1.85, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 0.06, fill: { color: C.teal } });

      slide.addImage({ data: inv.icon, x: x + 0.15, y: y + 0.15, w: 0.35, h: 0.35, transparency: 50 });

      slide.addText(inv.title, {
        x: x + 0.6, y: y + 0.12, w: 2.2, h: 0.35,
        fontSize: 13, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, valign: "middle",
      });

      slide.addText(inv.desc, {
        x: x + 0.15, y: y + 0.55, w: 2.65, h: 1.2,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "top",
      });
    });
  }

  // ============================================================
  // Slide 12: Results & Metrics
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("成果展示", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Big metrics
    const metrics = [
      { num: "~30", label: "代码文件" },
      { num: "~5000", label: "代码行数" },
      { num: "6", label: "数据库表" },
      { num: "5", label: "温度通道" },
      { num: "5", label: "状态机状态" },
      { num: "3", label: "报告格式" },
      { num: "9", label: "第三方库" },
      { num: "6", label: "设计模式" },
    ];

    metrics.forEach((m, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 0.5 + col * 2.35;
      const y = 1.2 + row * 1.5;

      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.1, h: 1.3, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.1, h: 0.05, fill: { color: C.teal } });
      slide.addText(m.num, {
        x, y: y + 0.15, w: 2.1, h: 0.6,
        fontSize: 32, fontFace: "Arial Black", color: C.teal, bold: true, align: "center",
      });
      slide.addText(m.label, {
        x, y: y + 0.75, w: 2.1, h: 0.35,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.darkText, align: "center",
      });
    });

    // Completion rate bar
    slide.addText("功能完成率", {
      x: 0.7, y: 4.3, w: 3, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const rates = [
      { label: "P0 核心功能", pct: 100, color: C.teal },
      { label: "P1 增强功能", pct: 100, color: C.tealDark },
      { label: "P2 扩展功能", pct: 100, color: "0F766E" },
    ];

    rates.forEach((r, i) => {
      const y = 4.7 + i * 0.32;
      slide.addText(r.label, {
        x: 0.7, y, w: 1.5, h: 0.28,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
      slide.addShape(pres.shapes.RECTANGLE, { x: 2.3, y: y + 0.04, w: 4.5, h: 0.2, fill: { color: "E2E8F0" } });
      slide.addShape(pres.shapes.RECTANGLE, { x: 2.3, y: y + 0.04, w: 4.5 * r.pct / 100, h: 0.2, fill: { color: r.color } });
      slide.addText(`${r.pct}%`, {
        x: 6.9, y, w: 0.6, h: 0.28,
        fontSize: 10, fontFace: "Arial", color: r.color, bold: true, valign: "middle",
      });
    });
  }

  // ============================================================
  // Slide 13: Challenges & Solutions
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("技术难点与解决方案", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    const challenges = [
      {
        problem: "温度仿真真实性",
        solution: "分阶段仿真算法：升温线性+噪声，稳定钳位，记录指数逼近热传导模型",
        result: "5通道温度行为符合物理规律",
      },
      {
        problem: "实时曲线渲染",
        solution: "OxyPlot增量更新 + X轴滚动窗口（10分钟），避免全量重绘",
        result: "4条折线流畅刷新，无卡顿",
      },
      {
        problem: "跨线程UI更新",
        solution: "事件驱动DataBroadcast + Control.Invoke()封送至UI线程",
        result: "零跨线程崩溃",
      },
      {
        problem: "PDF中文乱码",
        solution: "实现IFontResolver接口，扫描系统字体，注册中文字体(SimHei)",
        result: "中文完美显示",
      },
      {
        problem: "Excel图表嵌入",
        solution: "EPPlus内嵌图表API + OxyPlot导出为图片",
        result: "3 Sheet含图表的专业报告",
      },
      {
        problem: "状态机并发安全",
        solution: "集中式TestController + lock同步 + 非法转换忽略+日志",
        result: "多线程下状态一致",
      },
    ];

    challenges.forEach((c, i) => {
      const y = 1.25 + i * 0.72;
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.8, h: 0.64, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.64, fill: { color: C.teal } });

      slide.addText(c.problem, {
        x: 0.95, y: y + 0.02, w: 2, h: 0.28,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.red, bold: true, valign: "middle",
      });
      slide.addText("→", {
        x: 2.8, y: y + 0.02, w: 0.4, h: 0.28,
        fontSize: 14, color: C.teal, valign: "middle", align: "center",
      });
      slide.addText(c.solution, {
        x: 3.1, y: y + 0.02, w: 4, h: 0.28,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
      slide.addText(c.result, {
        x: 7.2, y: y + 0.02, w: 2.2, h: 0.28,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.green, valign: "middle", align: "right", bold: true,
      });

      // Result tag
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.95, y: y + 0.36, w: 8.3, h: 0.22, fill: { color: "F0FDFA" } });
      slide.addText(`✅ 已解决`, {
        x: 0.95, y: y + 0.36, w: 8.3, h: 0.22,
        fontSize: 8, fontFace: "Microsoft YaHei", color: C.teal, valign: "middle",
      });
    });
  }

  // ============================================================
  // Slide 14: Risk Assessment
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("风险评估与应对", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Risk matrix as table
    const riskTable = [
      [
        { text: "风险", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "概率", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "影响", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "风险值", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
        { text: "应对措施", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
      ],
      ["温度仿真不真实", "30%", "中", "中", "参考真实物理模型调参，加入合理随机噪声"],
      ["实时曲线渲染卡顿", "15%", "高", "中", "滚动窗口 + 增量更新，预验证性能"],
      ["跨线程UI崩溃", "25%", "高", "高", "强制Invoke封装，代码审查检查点"],
      ["Excel图表兼容性", "20%", "中", "中", "测试多种Excel版本，备选方案CSV"],
      ["PDF中文乱码", "30%", "中", "中", "嵌入中文字体，预测试验证"],
      ["第三方库版本冲突", "10%", "高", "低", "锁定NuGet版本，定期检查兼容性"],
    ];

    slide.addTable(riskTable, {
      x: 0.5, y: 1.2, w: 9,
      colW: [1.8, 0.7, 0.7, 0.7, 5.1],
      border: { pt: 0.5, color: "E2E8F0" },
      rowH: [0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32],
      fontSize: 9,
      fontFace: "Microsoft YaHei",
      color: C.darkText,
    });

    // Monitoring mechanism
    slide.addText("风险监控机制", {
      x: 0.7, y: 3.7, w: 4, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const monitoring = [
      { phase: "开发过程", action: "每日检查 → Git提交 + 功能测试 → 问题及时修复" },
      { phase: "集成阶段", action: "全流程跑通测试 → 记录问题清单 → 逐项修复验证" },
      { phase: "发布前", action: "干净环境部署测试 → 完整功能验收 → 文档一致性检查" },
    ];

    monitoring.forEach((m, i) => {
      const y = 4.15 + i * 0.45;
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.8, h: 0.38, fill: { color: C.offWhite } });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.38, fill: { color: C.teal } });
      slide.addText(m.phase, {
        x: 0.95, y, w: 1.3, h: 0.38,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, valign: "middle",
      });
      slide.addText(m.action, {
        x: 2.35, y, w: 7, h: 0.38,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });
  }

  // ============================================================
  // Slide 15: Technology Stack
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("技术栈总览", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    const techStack = [
      { category: "运行时", tech: ".NET 8", version: "8.0.x LTS", reason: "LTS长期支持，性能优秀" },
      { category: "UI框架", tech: "Windows Forms", version: "—", reason: "原生支持，学习成本低" },
      { category: "数据库", tech: "SQLite", version: "3.x", reason: "零配置，文件即数据库" },
      { category: "数据访问", tech: "Microsoft.Data.Sqlite", version: "8.x", reason: "微软官方，轻量级" },
      { category: "图表", tech: "OxyPlot", version: "2.x", reason: "开源免费，支持实时更新" },
      { category: "Excel", tech: "EPPlus", version: "7.x", reason: "支持图表嵌入" },
      { category: "PDF", tech: "PDFsharp-MigraDoc", version: "6.x", reason: "开源，支持中文" },
      { category: "配置", tech: "Microsoft.Extensions.Configuration", version: "8.x", reason: "标准JSON配置" },
      { category: "日志", tech: "Serilog", version: "4.x", reason: "结构化日志，滚动文件" },
      { category: "数值计算", tech: "MathNet.Numerics", version: "5.x", reason: "线性回归温漂计算" },
    ];

    const techHeader = [
      { text: "层次", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
      { text: "技术", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
      { text: "版本", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
      { text: "选型理由", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 10 } },
    ];

    const techRows = techStack.map(t => [
      t.category, t.tech, t.version, t.reason
    ]);

    slide.addTable([techHeader, ...techRows], {
      x: 0.5, y: 1.2, w: 9,
      colW: [1.4, 2.8, 1.0, 3.8],
      border: { pt: 0.5, color: "E2E8F0" },
      rowH: Array(11).fill(0.32),
      fontSize: 10,
      fontFace: "Microsoft YaHei",
      color: C.darkText,
      autoPage: false,
    });

    // Bottom summary
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.85, w: 9, h: 0.5, fill: { color: C.offWhite } });
    slide.addText("全部组件均为纯托管代码或系统原生支持 | 无需额外安装运行环境 | Windows 10/11 可直接运行 | 总成本 ¥0", {
      x: 0.7, y: 4.85, w: 8.6, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, valign: "middle", align: "center",
    });
  }

  // ============================================================
  // Slide 16: Experience & Lessons Learned
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("经验总结", {
      x: 0.7, y: 0.15, w: 8, h: 0.5,
      fontSize: 28, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.6, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // AI协作心得 - 上半部分（全宽）
    slide.addText("AI 智能体协作核心心得", {
      x: 0.7, y: 0.8, w: 8, h: 0.3,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true,
    });

    const aiLessons = [
      { title: "智能体是放大器，不是替代品", desc: "AI放大执行力（1人完成团队级工作量），但判断力靠人——所有架构决策、算法验证、安全检查都是人做的" },
      { title: "迭代式协作最高效", desc: "最佳模式：人描述需求 → AI出初稿 → 人审查验证 → 反馈修正 → 最终交付。不要期待AI一次完美，快速迭代才是关键" },
      { title: "提示词是核心技能", desc: "同样的问题，描述质量决定AI输出质量。说清上下文（'参照ISO 11820标准'）、分步骤提问、给具体反馈，是必须掌握的能力" },
      { title: "AI生成必须验证", desc: "本项目发现5个AI生成的缺陷：稳定阶段误判、PDF曲线图缺失、中文乱码、命名冲突等。AI会犯错，人工审查不可省略" },
    ];

    aiLessons.forEach((a, i) => {
      const x = 0.5 + i * 2.35;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.2, h: 1.55, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.2, h: 0.05, fill: { color: i === 0 ? C.teal : i === 1 ? C.tealLight : i === 2 ? C.navy : C.accent } });
      slide.addText(a.title, {
        x: x + 0.1, y: 1.32, w: 2, h: 0.3,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.tealDark, bold: true, valign: "middle",
      });
      slide.addText(a.desc, {
        x: x + 0.1, y: 1.65, w: 2, h: 1.0,
        fontSize: 8.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "top",
      });
    });

    // 软件全流程技能 - 左
    slide.addText("软件全流程技能收获", {
      x: 0.7, y: 2.9, w: 4.3, h: 0.3,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const gains = [
      "需求分析：五维可行性分析、MoSCoW优先级排序",
      "系统设计：5层架构、18模块、6张数据库表",
      "编码实现：~5000行C#、事件驱动、6种设计模式",
      "测试交付：13项功能测试、6项性能测试、3种报告",
    ];

    gains.forEach((g, i) => {
      const y = 3.25 + i * 0.38;
      slide.addImage({ data: icons.check, x: 0.7, y: y + 0.03, w: 0.2, h: 0.2 });
      slide.addText(g, {
        x: 1.0, y, w: 4, h: 0.35,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
      });
    });

    // 关键决策回顾 - 右
    slide.addText("关键决策回顾", {
      x: 5.3, y: 2.9, w: 4.2, h: 0.3,
      fontSize: 15, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });

    const decisionTable = [
      [
        { text: "决策", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
        { text: "选择", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
        { text: "理由", options: { bold: true, fill: { color: C.teal }, color: C.white, fontSize: 9 } },
      ],
      ["UI框架", "WinForms", "学习成本低，4周可交付"],
      ["数据库", "SQLite", "零配置，文件即数据库"],
      ["图表库", "OxyPlot", "成熟稳定，实时渲染好"],
      ["开发模式", "AI智能体驱动", "1人完成5-6人工作量"],
      ["文档策略", "AI生成+人工审查", "效率高但必须验证"],
    ];

    slide.addTable(decisionTable, {
      x: 5.3, y: 3.25, w: 4.2,
      colW: [1.1, 1.4, 1.7],
      border: { pt: 0.5, color: "E2E8F0" },
      rowH: [0.28, 0.25, 0.25, 0.25, 0.25, 0.25],
      fontSize: 10,
      fontFace: "Microsoft YaHei",
      color: C.darkText,
    });
  }

  // ============================================================
  // Slide 17: Future Improvements
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addText("改进方向与展望", {
      x: 0.7, y: 0.3, w: 8, h: 0.7,
      fontSize: 32, fontFace: "Microsoft YaHei", color: C.darkText, bold: true,
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.teal } });

    // Three columns for short/mid/long term
    const plans = [
      {
        title: "短期改进",
        subtitle: "1-2周",
        color: C.teal,
        items: [
          "密码改为BCrypt哈希存储",
          "operators表添加主键约束",
          "统一数据库表名大小写",
          "添加试验进度条显示",
          "Excel报告增加统计图表",
        ],
      },
      {
        title: "中期改进",
        subtitle: "1-2月",
        color: C.tealDark,
        items: [
          "支持中英文界面切换",
          "添加数据备份/恢复功能",
          "试验模板功能(预设参数)",
          "温度仿真参数可视化调节",
          "曲线图支持缩放和平移",
        ],
      },
      {
        title: "长期改进",
        subtitle: "3-6月",
        color: "115E59",
        items: [
          "迁移到WPF/Avalonia UI",
          "引入MVVM架构模式",
          "引入依赖注入容器",
          "单元测试覆盖(目标80%)",
          "接入真实Modbus协议",
        ],
      },
    ];

    plans.forEach((plan, i) => {
      const x = 0.5 + i * 3.15;
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.95, h: 4.1, fill: { color: C.offWhite }, shadow: shadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.95, h: 0.6, fill: { color: plan.color } });

      slide.addText(plan.title, {
        x, y: 1.2, w: 2.95, h: 0.35,
        fontSize: 16, fontFace: "Microsoft YaHei", color: C.white, bold: true, align: "center", valign: "middle",
      });
      slide.addText(plan.subtitle, {
        x, y: 1.52, w: 2.95, h: 0.25,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.mint, align: "center",
      });

      plan.items.forEach((item, j) => {
        slide.addText(item, {
          x: x + 0.2, y: 2.0 + j * 0.5, w: 2.55, h: 0.4,
          fontSize: 10, fontFace: "Microsoft YaHei", color: C.darkText, valign: "middle",
          bullet: true,
        });
      });
    });
  }

  // ============================================================
  // Slide 18: Summary & Q&A
  // ============================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkBg };

    // Decorative elements
    slide.addShape(pres.shapes.OVAL, { x: -1.5, y: -1.5, w: 5, h: 5, fill: { color: C.navy, transparency: 70 } });
    slide.addShape(pres.shapes.OVAL, { x: 7.5, y: 3.5, w: 4, h: 4, fill: { color: C.navy, transparency: 70 } });

    slide.addText("总结", {
      x: 1, y: 0.3, w: 8, h: 0.6,
      fontSize: 36, fontFace: "Microsoft YaHei", color: C.white, bold: true, align: "center",
    });

    slide.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 0.85, w: 3, h: 0.04, fill: { color: C.teal } });

    // Key summary points
    const summaryPoints = [
      { icon: icons.idea, text: "AI 智能体全流程驱动：1人+1AI完成传统团队级工作量" },
      { icon: icons.desktop, text: "完整ISO 11820不燃性试验仿真系统，覆盖全流程" },
      { icon: icons.layer, text: "掌握软件全流程：需求→设计→编码→测试→交付" },
      { icon: icons.flask, text: "分阶段温度仿真引擎，模拟真实热力学过程" },
      { icon: icons.check, text: "P0-P2功能100%完成，13项功能测试全部通过" },
      { icon: icons.rocket, text: "零预算、零风险，AI协同开发模式验证可行" },
    ];

    summaryPoints.forEach((p, i) => {
      const y = 1.1 + i * 0.52;
      slide.addImage({ data: p.icon, x: 1.5, y: y + 0.03, w: 0.35, h: 0.35 });
      slide.addText(p.text, {
        x: 2.05, y, w: 6.5, h: 0.42,
        fontSize: 13, fontFace: "Microsoft YaHei", color: C.white, valign: "middle",
      });
    });

    // Q&A section
    slide.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 4.35, w: 5, h: 0.04, fill: { color: C.teal } });

    slide.addText("掌握AI工具 · 协同开发 · 软件全流程", {
      x: 1, y: 4.5, w: 8, h: 0.4,
      fontSize: 18, fontFace: "Microsoft YaHei", color: C.accent, align: "center", bold: true,
    });

    slide.addText("感谢各位评委老师，请批评指正！", {
      x: 1, y: 4.9, w: 8, h: 0.45,
      fontSize: 20, fontFace: "Microsoft YaHei", color: C.mint, align: "center",
    });

    slide.addText("github.com/ximu-dot/Non-combustibility-Test-Simulator", {
      x: 1, y: 5.25, w: 8, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.gray, align: "center",
    });
  }

  // ============================================================
  // Save
  // ============================================================
  await pres.writeFile({ fileName: "d:/java_workspace/技能实训/答辩PPT.pptx" });
  console.log("PPT saved successfully!");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
