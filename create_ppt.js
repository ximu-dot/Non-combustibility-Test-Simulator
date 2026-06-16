const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icons
const { FaFlask, FaFire, FaChartLine, FaCogs, FaDatabase, FaFileAlt, FaCheckCircle, FaLayerGroup, FaProjectDiagram, FaLightbulb, FaGithub } = require("react-icons/fa");

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
  // Color palette: Fire & Industry theme
  const C = {
    darkBg: "1A1A2E",       // Deep navy
    darkAccent: "16213E",   // Dark blue
    fire: "E94560",         // Coral red - accent
    orange: "F39C12",       // Warm orange
    gold: "E67E22",         // Golden orange
    lightBg: "F5F6FA",      // Light gray bg
    white: "FFFFFF",
    textDark: "1A1A2E",
    textGray: "5A6C7D",
    textMuted: "8E9BAE",
    cardBg: "FFFFFF",
    border: "E2E8F0",
    success: "10B981",
    teal: "0D9488",
    blue: "3B82F6"
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "ximu-dot";
  pres.title = "NCT-Sim 建筑材料不燃性试验仿真系统";

  // Preload icons
  const iconFlask = await iconToBase64Png(FaFlask, `#${C.white}`, 256);
  const iconFire = await iconToBase64Png(FaFire, `#${C.fire}`, 256);
  const iconChart = await iconToBase64Png(FaChartLine, `#${C.white}`, 256);
  const iconCogs = await iconToBase64Png(FaCogs, `#${C.white}`, 256);
  const iconDb = await iconToBase64Png(FaDatabase, `#${C.white}`, 256);
  const iconFile = await iconToBase64Png(FaFileAlt, `#${C.white}`, 256);
  const iconCheck = await iconToBase64Png(FaCheckCircle, `#${C.success}`, 256);
  const iconLayer = await iconToBase64Png(FaLayerGroup, `#${C.white}`, 256);
  const iconProj = await iconToBase64Png(FaProjectDiagram, `#${C.white}`, 256);
  const iconBulb = await iconToBase64Png(FaLightbulb, `#${C.gold}`, 256);
  const iconGh = await iconToBase64Png(FaGithub, `#${C.white}`, 256);

  const iconFireDark = await iconToBase64Png(FaFire, `#${C.fire}`, 256);
  const iconChartDark = await iconToBase64Png(FaChartLine, `#${C.teal}`, 256);
  const iconCogsDark = await iconToBase64Png(FaCogs, `#${C.textGray}`, 256);
  const iconDbDark = await iconToBase64Png(FaDatabase, `#${C.blue}`, 256);
  const iconFileDark = await iconToBase64Png(FaFileAlt, `#${C.orange}`, 256);
  const iconLayerDark = await iconToBase64Png(FaLayerGroup, `#${C.textGray}`, 256);

  const mkShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.12 });

  // ============================================================
  // SLIDE 1: Title Slide
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };

    // Decorative shapes
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.fire } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.fire } });

    // Fire icon
    s.addImage({ data: iconFire, x: 4.5, y: 0.7, w: 1, h: 1 });

    // Title
    s.addText("NCT-Sim", {
      x: 0.5, y: 1.8, w: 9, h: 0.8, fontSize: 44, fontFace: "Arial Black",
      color: C.white, bold: true, align: "center", charSpacing: 4
    });

    // Subtitle
    s.addText("建筑材料不燃性试验仿真系统", {
      x: 0.5, y: 2.6, w: 9, h: 0.6, fontSize: 24, fontFace: "Arial",
      color: C.fire, align: "center"
    });

    s.addText("Simulation System for Non-combustibility Test of Building Materials", {
      x: 1, y: 3.2, w: 8, h: 0.5, fontSize: 12, fontFace: "Arial",
      color: C.textMuted, align: "center", italic: true
    });

    // Info line
    s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 4.1, w: 5, h: 0.01, fill: { color: C.darkAccent } });
    s.addText([
      { text: "C# / .NET 8  |  WinForms  |  SQLite  |  OxyPlot", options: { fontSize: 11, color: C.textMuted } }
    ], { x: 1, y: 4.3, w: 8, h: 0.4, align: "center", fontFace: "Arial" });

    s.addText("github.com/ximu-dot/Non-combustibility-Test-Simulator", {
      x: 1, y: 4.8, w: 8, h: 0.4, fontSize: 10, fontFace: "Consolas",
      color: C.textMuted, align: "center"
    });
  }

  // ============================================================
  // SLIDE 2: 项目背景
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    // Title bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("项目背景与问题定义", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // Left: Problem
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.5, w: 4.4, h: 3.5, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.5, w: 4.4, h: 0.06, fill: { color: C.fire } });

    s.addImage({ data: iconFireDark, x: 0.65, y: 1.7, w: 0.45, h: 0.45 });
    s.addText("真实试验的痛点", {
      x: 1.2, y: 1.7, w: 3, h: 0.45, fontSize: 18, fontFace: "Arial", bold: true, color: C.textDark
    });

    s.addText([
      { text: "设备昂贵", options: { bold: true, color: C.fire, breakLine: true } },
      { text: "单套加热炉 50-80 万元人民币", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "耗时长", options: { bold: true, color: C.fire, breakLine: true } },
      { text: "单次试验约 2 小时（升温+保温）", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "教学受限", options: { bold: true, color: C.fire, breakLine: true } },
      { text: "一套设备只能一组学生操作", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "安全风险", options: { bold: true, color: C.fire, breakLine: true } },
      { text: "750°C 高温，存在烫伤和火灾隐患", options: { color: C.textGray } }
    ], { x: 0.7, y: 2.3, w: 3.8, h: 2.5, fontSize: 12, fontFace: "Arial", valign: "top" });

    // Right: Solution
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.4, h: 3.5, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.5, w: 4.4, h: 0.06, fill: { color: C.success } });

    s.addImage({ data: iconCheck, x: 5.45, y: 1.7, w: 0.45, h: 0.45 });
    s.addText("我们的解决方案", {
      x: 6.0, y: 1.7, w: 3, h: 0.45, fontSize: 18, fontFace: "Arial", bold: true, color: C.textDark
    });

    s.addText([
      { text: "零成本", options: { bold: true, color: C.success, breakLine: true } },
      { text: "纯软件仿真，无需购买硬件", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "高效率", options: { bold: true, color: C.success, breakLine: true } },
      { text: "可加速至数分钟完成一次试验", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "大规模教学", options: { bold: true, color: C.success, breakLine: true } },
      { text: "每台 PC 独立运行，不限组数", options: { breakLine: true, color: C.textGray } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "零风险", options: { bold: true, color: C.success, breakLine: true } },
      { text: "无高温、无火灾隐患", options: { color: C.textGray } }
    ], { x: 5.45, y: 2.3, w: 3.8, h: 2.5, fontSize: 12, fontFace: "Arial", valign: "top" });
  }

  // ============================================================
  // SLIDE 3: 系统架构
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("系统架构设计", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // Architecture layers - 5 layers
    const layers = [
      { label: "UI 层 (Forms)", desc: "LoginForm · MainForm · 实时面板 · 曲线图", color: C.fire, icon: iconLayer },
      { label: "核心层 (Core)", desc: "TestController 状态机 · 业务逻辑协调", color: C.orange, icon: iconProj },
      { label: "服务层 (Services)", desc: "仿真引擎 · 数据采集 · 报告生成", color: C.teal, icon: iconCogs },
      { label: "数据层 (Data)", desc: "DbHelper · CsvWriter · SQLite", color: C.blue, icon: iconDb },
      { label: "全局层 (Global)", desc: "AppContext 单例 · 配置管理", color: C.textGray, icon: iconLayerDark },
    ];

    layers.forEach((layer, i) => {
      const yPos = 1.5 + i * 0.78;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yPos, w: 9, h: 0.65, fill: { color: C.cardBg }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: yPos, w: 0.08, h: 0.65, fill: { color: layer.color } });
      s.addImage({ data: layer.icon, x: 0.8, y: yPos + 0.1, w: 0.45, h: 0.45 });
      s.addText(layer.label, {
        x: 1.4, y: yPos + 0.02, w: 2.5, h: 0.3, fontSize: 14, fontFace: "Arial",
        bold: true, color: C.textDark
      });
      s.addText(layer.desc, {
        x: 1.4, y: yPos + 0.32, w: 7, h: 0.28, fontSize: 10, fontFace: "Arial",
        color: C.textGray
      });
    });

    // Dependency arrows (using simple text)
    s.addText("↓ 依赖方向：上层依赖下层，下层通过事件通知上层", {
      x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 9, fontFace: "Arial",
      color: C.textMuted, align: "center", italic: true
    });
  }

  // ============================================================
  // SLIDE 4: 技术栈
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("技术栈与选型", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    const techs = [
      { name: "C# / .NET 8", desc: "开发语言与框架", tag: "核心", color: C.fire },
      { name: "Windows Forms", desc: "桌面 UI 框架", tag: "UI", color: C.orange },
      { name: "SQLite", desc: "嵌入式数据库", tag: "存储", color: C.teal },
      { name: "OxyPlot", desc: "实时温度曲线图", tag: "图表", color: C.blue },
      { name: "EPPlus 7.x", desc: "Excel 报告生成", tag: "导出", color: C.success },
      { name: "PDFsharp-MigraDoc", desc: "PDF 报告生成", tag: "导出", color: C.gold },
      { name: "Serilog", desc: "结构化日志记录", tag: "日志", color: C.textGray },
      { name: "MathNet.Numerics", desc: "温漂线性回归计算", tag: "算法", color: C.textGray },
    ];

    techs.forEach((tech, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const xPos = 0.5 + col * 2.3;
      const yPos = 1.5 + row * 1.9;

      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 2.1, h: 1.65, fill: { color: C.cardBg }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 2.1, h: 0.05, fill: { color: tech.color } });

      // Tag
      s.addShape(pres.shapes.RECTANGLE, {
        x: xPos + 1.35, y: yPos + 0.2, w: 0.6, h: 0.25,
        fill: { color: tech.color, transparency: 85 }
      });
      s.addText(tech.tag, {
        x: xPos + 1.35, y: yPos + 0.2, w: 0.6, h: 0.25,
        fontSize: 8, fontFace: "Arial", color: tech.color, align: "center", bold: true
      });

      s.addText(tech.name, {
        x: xPos + 0.15, y: yPos + 0.55, w: 1.8, h: 0.4,
        fontSize: 14, fontFace: "Arial", bold: true, color: C.textDark
      });
      s.addText(tech.desc, {
        x: xPos + 0.15, y: yPos + 1.0, w: 1.8, h: 0.5,
        fontSize: 10, fontFace: "Arial", color: C.textGray
      });
    });
  }

  // ============================================================
  // SLIDE 5: 核心功能 - 温度仿真
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("核心功能：温度仿真引擎", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // Left: 5 channels
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.45, w: 4.5, h: 3.8, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.45, w: 4.5, h: 0.05, fill: { color: C.fire } });

    s.addImage({ data: iconFireDark, x: 0.6, y: 1.65, w: 0.4, h: 0.4 });
    s.addText("5 通道温度仿真", {
      x: 1.1, y: 1.65, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: C.textDark
    });

    const channels = [
      ["TF1 炉温1", "加热炉主温度 → 750°C", C.fire],
      ["TF2 炉温2", "加热炉副温度（独立噪声）", C.orange],
      ["TS 表面温", "样品表面（指数逼近 TF1×0.95）", C.teal],
      ["TC 中心温", "样品中心（指数逼近 TF1×0.85）", C.blue],
      ["TCal 校准温", "标定用温度（TF1+波动×2）", C.textGray],
    ];

    channels.forEach((ch, i) => {
      const yPos = 2.2 + i * 0.58;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: yPos, w: 0.06, h: 0.4, fill: { color: ch[2] } });
      s.addText(ch[0], {
        x: 0.8, y: yPos, w: 1.6, h: 0.4, fontSize: 12, fontFace: "Arial", bold: true, color: ch[2]
      });
      s.addText(ch[1], {
        x: 2.4, y: yPos, w: 2.3, h: 0.4, fontSize: 10, fontFace: "Arial", color: C.textGray
      });
    });

    // Right: Algorithm phases
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.4, h: 3.8, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.4, h: 0.05, fill: { color: C.teal } });

    s.addImage({ data: iconCogsDark, x: 5.4, y: 1.65, w: 0.4, h: 0.4 });
    s.addText("分阶段仿真算法", {
      x: 5.9, y: 1.65, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: C.textDark
    });

    const phases = [
      ["🔥 升温阶段", "线性升温 + 高斯噪声\n每 800ms 更新一次"],
      ["✅ 稳定阶段", "钳位 750°C ± 0.5°C\n连续 4 tick → Ready"],
      ["📊 记录阶段", "指数逼近模型\nTS→TF1×0.95, TC→TF1×0.85"],
    ];

    phases.forEach((ph, i) => {
      const yPos = 2.25 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x: 5.4, y: yPos, w: 3.9, h: 0.8, fill: { color: C.lightBg } });
      s.addText(ph[0], {
        x: 5.55, y: yPos + 0.02, w: 3.6, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: C.textDark
      });
      s.addText(ph[1], {
        x: 5.55, y: yPos + 0.32, w: 3.6, h: 0.42, fontSize: 9, fontFace: "Arial", color: C.textGray
      });
    });
  }

  // ============================================================
  // SLIDE 6: 状态机
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("试验状态机设计", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // State flow diagram - 5 states in a row
    const states = [
      { name: "Idle", cn: "空闲", color: C.textGray },
      { name: "Preparing", cn: "升温中", color: C.orange },
      { name: "Ready", cn: "就绪", color: C.teal },
      { name: "Recording", cn: "记录中", color: C.blue },
      { name: "Complete", cn: "完成", color: C.success },
    ];

    const boxW = 1.6;
    const startX = 0.5;
    const gap = 0.35;

    states.forEach((st, i) => {
      const xPos = startX + i * (boxW + gap);
      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.7, w: boxW, h: 1.1, fill: { color: st.color }, shadow: mkShadow() });
      s.addText(st.name, {
        x: xPos, y: 1.78, w: boxW, h: 0.55, fontSize: 14, fontFace: "Arial Black",
        color: C.white, align: "center", bold: true
      });
      s.addText(st.cn, {
        x: xPos, y: 2.35, w: boxW, h: 0.35, fontSize: 12, fontFace: "Arial",
        color: C.white, align: "center"
      });

      // Arrow between states
      if (i < states.length - 1) {
        s.addText("→", {
          x: xPos + boxW, y: 1.95, w: gap, h: 0.5, fontSize: 18,
          color: C.textMuted, align: "center", fontFace: "Arial"
        });
      }
    });

    // Transition details
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 3.1, w: 9.2, h: 2.3, fill: { color: C.cardBg }, shadow: mkShadow() });

    s.addText("状态转换规则", {
      x: 0.7, y: 3.2, w: 4, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: C.textDark
    });

    const transitions = [
      ["Idle → Preparing", "用户点击「开始升温」", C.orange],
      ["Preparing → Ready", "温度 745~755°C 且稳定 ≥ 3.2s", C.teal],
      ["Ready → Recording", "用户点击「开始记录」", C.blue],
      ["Recording → Complete", "到达 60 分钟 / 终止条件 / 手动停止", C.success],
      ["Complete → Preparing", "保存试验记录后，保持炉温", C.textGray],
    ];

    transitions.forEach((tr, i) => {
      const yPos = 3.65 + i * 0.35;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: yPos + 0.05, w: 0.06, h: 0.22, fill: { color: tr[2] } });
      s.addText(tr[0], {
        x: 0.9, y: yPos, w: 2.5, h: 0.3, fontSize: 11, fontFace: "Consolas", bold: true, color: tr[2]
      });
      s.addText(tr[1], {
        x: 3.5, y: yPos, w: 5.5, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textGray
      });
    });
  }

  // ============================================================
  // SLIDE 7: 数据库设计
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("数据库设计", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // 6 tables as cards
    const tables = [
      { name: "operators", desc: "操作员账号\nadmin / experimenter", color: C.fire },
      { name: "apparatus", desc: "试验设备\nFURNACE-01", color: C.orange },
      { name: "productmaster", desc: "样品信息\n编号·规格·尺寸", color: C.teal },
      { name: "testmaster ⭐", desc: "试验记录（核心）\n联合主键·40+字段", color: C.blue },
      { name: "sensors", desc: "传感器配置\n17 通道·量程参数", color: C.textGray },
      { name: "CalibrationRecords", desc: "校准记录\nJSON数据·统计", color: C.textGray },
    ];

    tables.forEach((t, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const xPos = 0.4 + col * 3.15;
      const yPos = 1.5 + row * 1.95;

      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 2.95, h: 1.7, fill: { color: C.cardBg }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: yPos, w: 2.95, h: 0.05, fill: { color: t.color } });

      s.addImage({ data: iconDbDark, x: xPos + 0.15, y: yPos + 0.2, w: 0.35, h: 0.35 });
      s.addText(t.name, {
        x: xPos + 0.6, y: yPos + 0.18, w: 2.2, h: 0.4, fontSize: 14,
        fontFace: "Consolas", bold: true, color: C.textDark
      });
      s.addText(t.desc, {
        x: xPos + 0.15, y: yPos + 0.7, w: 2.65, h: 0.85, fontSize: 10,
        fontFace: "Arial", color: C.textGray
      });
    });

    // CSV note
    s.addText("💡 温度时序数据不入库，存储为独立 CSV 文件：TestData/{productid}/{testid}/sensor_data.csv", {
      x: 0.5, y: 5.1, w: 9, h: 0.3, fontSize: 10, fontFace: "Arial",
      color: C.orange, align: "center"
    });
  }

  // ============================================================
  // SLIDE 8: 数据导出
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("多格式报告生成", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // 3 export formats
    const formats = [
      { name: "CSV", icon: iconFileDark, color: C.teal,
        desc: "逐秒温度数据\n标准逗号分隔格式\n试验完成后自动生成",
        sheet: "Time,Temp1,Temp2,TempSurface,..." },
      { name: "Excel", icon: iconFileDark, color: C.success,
        desc: "Sheet1：试验信息表\nSheet2：温度数据表\nSheet3：温度曲线图",
        sheet: "EPPlus 7.x 内嵌图表" },
      { name: "PDF", icon: iconFileDark, color: C.fire,
        desc: "报告封面 + 试验概要\n温度曲线图片\n判定结论",
        sheet: "PDFsharp-MigraDoc" },
    ];

    formats.forEach((fmt, i) => {
      const xPos = 0.4 + i * 3.15;
      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.5, w: 2.95, h: 3.8, fill: { color: C.cardBg }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.5, w: 2.95, h: 0.05, fill: { color: fmt.color } });

      s.addImage({ data: fmt.icon, x: xPos + 0.2, y: 1.7, w: 0.4, h: 0.4 });
      s.addText(fmt.name, {
        x: xPos + 0.7, y: 1.7, w: 2, h: 0.4, fontSize: 20, fontFace: "Arial Black", bold: true, color: fmt.color
      });

      s.addText(fmt.desc, {
        x: xPos + 0.2, y: 2.3, w: 2.55, h: 1.6, fontSize: 11, fontFace: "Arial", color: C.textGray
      });

      s.addShape(pres.shapes.RECTANGLE, { x: xPos + 0.2, y: 4.1, w: 2.55, h: 0.01, fill: { color: C.border } });
      s.addText(fmt.sheet, {
        x: xPos + 0.2, y: 4.25, w: 2.55, h: 0.8, fontSize: 9, fontFace: "Consolas", color: C.textMuted, italic: true
      });
    });
  }

  // ============================================================
  // SLIDE 9: 功能完成矩阵
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("功能完成情况", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // Large stat callouts
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.5, w: 2.8, h: 1.3, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addText("16/18", {
      x: 0.5, y: 1.55, w: 2.8, h: 0.7, fontSize: 42, fontFace: "Arial Black",
      color: C.success, align: "center", bold: true
    });
    s.addText("功能模块完成", {
      x: 0.5, y: 2.25, w: 2.8, h: 0.35, fontSize: 11, fontFace: "Arial",
      color: C.textGray, align: "center"
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 3.6, y: 1.5, w: 2.8, h: 1.3, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addText("100%", {
      x: 3.6, y: 1.55, w: 2.8, h: 0.7, fontSize: 42, fontFace: "Arial Black",
      color: C.fire, align: "center", bold: true
    });
    s.addText("核心功能完成率", {
      x: 3.6, y: 2.25, w: 2.8, h: 0.35, fontSize: 11, fontFace: "Arial",
      color: C.textGray, align: "center"
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 6.7, y: 1.5, w: 2.8, h: 1.3, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addText("~5000", {
      x: 6.7, y: 1.55, w: 2.8, h: 0.7, fontSize: 42, fontFace: "Arial Black",
      color: C.blue, align: "center", bold: true
    });
    s.addText("代码行数", {
      x: 6.7, y: 2.25, w: 2.8, h: 0.35, fontSize: 11, fontFace: "Arial",
      color: C.textGray, align: "center"
    });

    // Feature table
    const features = [
      ["用户登录", "✅", "✅", "✅", "✅"],
      ["新建试验", "✅", "✅", "✅", "✅"],
      ["温度仿真 (5通道)", "✅", "✅", "✅", "✅"],
      ["状态机 (5状态)", "✅", "✅", "✅", "✅"],
      ["实时曲线图", "✅", "✅", "✅", "✅"],
      ["CSV 导出", "✅", "✅", "✅", "✅"],
      ["系统消息日志", "✅", "✅", "✅", "✅"],
      ["Excel 报告", "✅", "✅", "✅", "✅"],
      ["PDF 报告", "✅", "✅", "✅", "✅"],
      ["历史记录查询", "✅", "✅", "✅", "✅"],
      ["设备校准", "✅", "✅", "✅", "✅"],
    ];

    const tableData = [
      [
        { text: "功能模块", options: { bold: true, color: C.white, fill: { color: C.darkBg }, fontSize: 10 } },
        { text: "完成", options: { bold: true, color: C.white, fill: { color: C.darkBg }, align: "center", fontSize: 10 } },
        { text: "P0", options: { bold: true, color: C.white, fill: { color: C.darkBg }, align: "center", fontSize: 10 } },
        { text: "P1", options: { bold: true, color: C.white, fill: { color: C.darkBg }, align: "center", fontSize: 10 } },
        { text: "P2", options: { bold: true, color: C.white, fill: { color: C.darkBg }, align: "center", fontSize: 10 } },
      ],
      ...features.map(f => f.map((cell, ci) => ({
        text: cell,
        options: {
          fontSize: 10, align: ci === 0 ? "left" : "center",
          fill: { color: ci === 0 ? C.lightBg : C.white },
          color: ci === 0 ? C.textDark : C.success,
          bold: ci > 0
        }
      })))
    ];

    s.addTable(tableData, {
      x: 0.5, y: 3.1, w: 9, colW: [3.6, 1.2, 1.2, 1.2, 1.2],
      border: { pt: 0.5, color: C.border },
      rowH: [0.35, ...features.map(() => 0.28)]
    });
  }

  // ============================================================
  // SLIDE 10: 技术创新
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("技术创新与亮点", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    const innovations = [
      { title: "分阶段物理仿真模型", desc: "升温/稳定/记录三阶段使用不同算法，模拟真实热力学过程。升温阶段线性+噪声，稳定阶段钳位到目标温度，记录阶段使用指数逼近模型模拟热传导延迟。", color: C.fire },
      { title: "配置驱动架构", desc: "所有仿真参数（升温速率、目标温度、噪声幅度等）通过 appsettings.json 配置，无需重新编译即可调整系统行为，极大提高灵活性和可维护性。", color: C.teal },
      { title: "仿真/硬件双模式预留", desc: "通过 ISensorProvider 接口实现策略模式，同一套代码可无缝切换仿真模式或真实 Modbus 硬件模式，为未来接入真实设备预留了扩展能力。", color: C.blue },
      { title: "AI 辅助全流程开发", desc: "使用 CodeBuddy AI 编程助手辅助需求分析、架构设计、代码生成、文档撰写，验证了 AI 辅助软件工程方法的可行性和效率提升效果。", color: C.gold },
    ];

    innovations.forEach((inv, i) => {
      const yPos = 1.5 + i * 0.95;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: yPos, w: 9.2, h: 0.8, fill: { color: C.cardBg }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: yPos, w: 0.06, h: 0.8, fill: { color: inv.color } });

      s.addText(inv.title, {
        x: 0.7, y: yPos + 0.03, w: 8.5, h: 0.3, fontSize: 14, fontFace: "Arial",
        bold: true, color: inv.color
      });
      s.addText(inv.desc, {
        x: 0.7, y: yPos + 0.33, w: 8.5, h: 0.42, fontSize: 9.5, fontFace: "Arial",
        color: C.textGray
      });
    });

    // Bottom: Tech summary
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 5.1, w: 9.2, h: 0.4, fill: { color: C.darkBg } });
    s.addText("分层架构 · 事件驱动 · 状态模式 · 策略模式 · 单例模式 · 观察者模式", {
      x: 0.4, y: 5.1, w: 9.2, h: 0.4, fontSize: 11, fontFace: "Arial",
      color: C.white, align: "center", bold: true
    });
  }

  // ============================================================
  // SLIDE 11: 项目总结
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.lightBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.darkBg } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.1, w: 10, h: 0.04, fill: { color: C.fire } });
    s.addText("项目总结与展望", {
      x: 0.6, y: 0.25, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black",
      color: C.white, bold: true
    });

    // Left: Achievements
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.45, w: 4.5, h: 3.8, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.45, w: 4.5, h: 0.05, fill: { color: C.success } });

    s.addImage({ data: iconCheck, x: 0.6, y: 1.65, w: 0.4, h: 0.4 });
    s.addText("项目成果", {
      x: 1.1, y: 1.65, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: C.textDark
    });

    const achievements = [
      "✅ 完整仿真 ISO 11820 试验流程",
      "✅ 5 通道温度实时仿真与显示",
      "✅ 5 状态试验状态机控制",
      "✅ CSV / Excel / PDF 三格式报告",
      "✅ 试验记录历史查询系统",
      "✅ 6 份完整项目文档",
      "✅ 零预算完成全栈开发",
      "✅ 代码结构清晰，可维护性强",
    ];

    achievements.forEach((ach, i) => {
      s.addText(ach, {
        x: 0.6, y: 2.2 + i * 0.36, w: 4.1, h: 0.32, fontSize: 11, fontFace: "Arial", color: C.textDark
      });
    });

    // Right: Future
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.4, h: 3.8, fill: { color: C.cardBg }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.45, w: 4.4, h: 0.05, fill: { color: C.blue } });

    s.addImage({ data: iconBulb, x: 5.4, y: 1.65, w: 0.4, h: 0.4 });
    s.addText("未来展望", {
      x: 5.9, y: 1.65, w: 3, h: 0.4, fontSize: 16, fontFace: "Arial", bold: true, color: C.textDark
    });

    const futures = [
      ["🔐 密码加密", "BCrypt 哈希替代明文存储"],
      ["🌐 中英文切换", "国际化支持"],
      ["📊 更多图表", "缩放、平移、统计分析"],
      ["🔌 真实硬件", "接入 Modbus 串口通信"],
      ["🧪 单元测试", "xUnit + Moq 覆盖率 80%"],
      ["🖥️ WPF 迁移", "现代化 UI 框架"],
    ];

    futures.forEach((f, i) => {
      const yPos = 2.25 + i * 0.48;
      s.addText(f[0], {
        x: 5.4, y: yPos, w: 1.6, h: 0.35, fontSize: 11, fontFace: "Arial", bold: true, color: C.textDark
      });
      s.addText(f[1], {
        x: 7.0, y: yPos, w: 2.4, h: 0.35, fontSize: 9.5, fontFace: "Arial", color: C.textGray
      });
    });
  }

  // ============================================================
  // SLIDE 12: Thank You
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.fire } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.fire } });

    s.addImage({ data: iconFlask, x: 4.5, y: 0.8, w: 1, h: 1 });

    s.addText("感谢聆听", {
      x: 0.5, y: 2.0, w: 9, h: 0.8, fontSize: 44, fontFace: "Arial Black",
      color: C.white, align: "center", bold: true, charSpacing: 6
    });

    s.addText("NCT-Sim · 建筑材料不燃性试验仿真系统", {
      x: 1, y: 2.9, w: 8, h: 0.5, fontSize: 16, fontFace: "Arial",
      color: C.fire, align: "center"
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 3, y: 3.6, w: 4, h: 0.01, fill: { color: C.darkAccent } });

    s.addText([
      { text: "GitHub: ", options: { color: C.textMuted } },
      { text: "github.com/ximu-dot/Non-combustibility-Test-Simulator", options: { color: C.teal } }
    ], { x: 1, y: 3.8, w: 8, h: 0.4, fontSize: 11, fontFace: "Consolas", align: "center" });

    s.addText("C# · .NET 8 · WinForms · SQLite · OxyPlot · EPPlus · PDFsharp", {
      x: 1, y: 4.5, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial",
      color: C.textMuted, align: "center"
    });
  }

  // Save
  await pres.writeFile({ fileName: "D:/java_workspace/技能实训/答辩PPT.pptx" });
  console.log("PPT created successfully!");
}

main().catch(console.error);
