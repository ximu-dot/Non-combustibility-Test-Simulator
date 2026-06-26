using NctSim.Global;
using NctSim.Models;
using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using PdfSharp.Fonts;
using Serilog;

namespace NctSim.Services;

/// <summary>
/// 报告导出服务 - 生成 Excel 和 PDF 报告
/// </summary>
public class ExportService
{
    private readonly FileStorageConfig _config;
    private static bool _fontResolverRegistered = false;
    private static readonly object _lock = new();

    public ExportService(FileStorageConfig config)
    {
        _config = config;
        OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
        EnsureFontResolver();
    }

    /// <summary>
    /// 确保系统字体解析器已注册（只注册一次）
    /// </summary>
    private static void EnsureFontResolver()
    {
        if (_fontResolverRegistered) return;
        lock (_lock)
        {
            if (_fontResolverRegistered) return;
            GlobalFontSettings.FontResolver = new SystemFontResolver();
            _fontResolverRegistered = true;
        }
    }

    /// <summary>
    /// 生成 Excel 报告
    /// </summary>
    public string GenerateExcel(TestRecord record)
    {
        var reportDir = _config.ReportDirectory;
        if (!Directory.Exists(reportDir))
            Directory.CreateDirectory(reportDir);

        var fileName = Path.Combine(reportDir, $"{record.TestId}_报告.xlsx");

        using var package = new ExcelPackage();

        // Sheet1: 试验信息
        var sheet1 = package.Workbook.Worksheets.Add("试验信息");
        WriteTestInfoSheet(sheet1, record);

        // Sheet2: 温度数据
        var sheet2 = package.Workbook.Worksheets.Add("温度数据");
        WriteTemperatureDataSheet(sheet2, record);

        // Sheet3: 温度曲线
        var sheet3 = package.Workbook.Worksheets.Add("温度曲线");
        WriteChartSheet(sheet3, record);

        package.SaveAs(new FileInfo(fileName));
        Log.Information("Excel 报告已生成：{Path}", fileName);
        return fileName;
    }

    private void WriteTestInfoSheet(ExcelWorksheet sheet, TestRecord record)
    {
        sheet.Cells["A1"].Value = "建筑材料不燃性试验报告";
        sheet.Cells["A1"].Style.Font.Size = 18;
        sheet.Cells["A1"].Style.Font.Bold = true;

        int row = 3;
        WriteInfoRow(sheet, ref row, "报告编号", record.RptNo);
        WriteInfoRow(sheet, ref row, "试验日期", record.TestDate.ToString("yyyy-MM-dd"));
        WriteInfoRow(sheet, ref row, "试验依据", record.According);
        WriteInfoRow(sheet, ref row, "操作员", record.Operator);
        WriteInfoRow(sheet, ref row, "设备名称", record.ApparatusName);
        WriteInfoRow(sheet, ref row, "设备编号", record.ApparatusId);
        row++;

        WriteInfoRow(sheet, ref row, "样品编号", record.ProductId);
        WriteInfoRow(sheet, ref row, "环境温度", $"{record.AmbTemp:F1} °C");
        WriteInfoRow(sheet, ref row, "环境湿度", $"{record.AmbHumi:F1} %");
        row++;

        WriteInfoRow(sheet, ref row, "试验前质量", $"{record.PreWeight:F1} g");
        WriteInfoRow(sheet, ref row, "试验后质量", $"{record.PostWeight:F1} g");
        WriteInfoRow(sheet, ref row, "失重量", $"{record.LostWeight:F1} g");
        WriteInfoRow(sheet, ref row, "失重率", $"{record.LostWeightPercent:F1} %");
        row++;

        WriteInfoRow(sheet, ref row, "炉温1温升", $"{record.DeltaTf1:F1} °C");
        WriteInfoRow(sheet, ref row, "炉温2温升", $"{record.DeltaTf2:F1} °C");
        WriteInfoRow(sheet, ref row, "表面温升", $"{record.DeltaTs:F1} °C");
        WriteInfoRow(sheet, ref row, "中心温升", $"{record.DeltaTc:F1} °C");
        WriteInfoRow(sheet, ref row, "综合温升", $"{record.DeltaTf:F1} °C");
        row++;

        WriteInfoRow(sheet, ref row, "试验时长", $"{record.TotalTestTime} 秒");
        WriteInfoRow(sheet, ref row, "火焰发生时刻", record.FlameTime > 0 ? $"{record.FlameTime} 秒" : "无");
        WriteInfoRow(sheet, ref row, "火焰持续时间", record.FlameDuration > 0 ? $"{record.FlameDuration} 秒" : "无");

        row += 2;
        var analyzer = new TemperatureAnalyzer();
        var (passed, reason) = analyzer.EvaluateResult(record.DeltaTf, record.LostWeightPercent, record.FlameDuration);
        sheet.Cells[$"A{row}"].Value = "判定结论：";
        sheet.Cells[$"A{row}"].Style.Font.Bold = true;
        sheet.Cells[$"B{row}"].Value = reason;
        sheet.Cells[$"B{row}"].Style.Font.Color.SetColor(passed ? System.Drawing.Color.Green : System.Drawing.Color.Red);

        sheet.Column(1).Width = 20;
        sheet.Column(2).Width = 40;
    }

    private void WriteInfoRow(ExcelWorksheet sheet, ref int row, string label, string value)
    {
        sheet.Cells[$"A{row}"].Value = label;
        sheet.Cells[$"A{row}"].Style.Font.Bold = true;
        sheet.Cells[$"B{row}"].Value = value;
        row++;
    }

    private void WriteTemperatureDataSheet(ExcelWorksheet sheet, TestRecord record)
    {
        var csvPath = Path.Combine(_config.TestDataDirectory, record.ProductId, record.TestId, "sensor_data.csv");
        if (!File.Exists(csvPath))
        {
            sheet.Cells["A1"].Value = "温度数据文件不存在";
            return;
        }

        var lines = File.ReadAllLines(csvPath);
        sheet.Cells["A1"].Value = "时间(秒)";
        sheet.Cells["B1"].Value = "炉温1(°C)";
        sheet.Cells["C1"].Value = "炉温2(°C)";
        sheet.Cells["D1"].Value = "表面温(°C)";
        sheet.Cells["E1"].Value = "中心温(°C)";
        sheet.Cells["F1"].Value = "校准温(°C)";

        for (int i = 0; i < lines.Length - 1; i++) // skip header
        {
            var parts = lines[i + 1].Split(',');
            for (int j = 0; j < parts.Length && j < 6; j++)
            {
                sheet.Cells[i + 2, j + 1].Value = parts[j];
            }
        }
    }

    private void WriteChartSheet(ExcelWorksheet sheet, TestRecord record)
    {
        var csvPath = Path.Combine(_config.TestDataDirectory, record.ProductId, record.TestId, "sensor_data.csv");
        if (!File.Exists(csvPath)) return;

        var data = CsvWriter.ReadData(csvPath);
        if (data.Count == 0) return;

        // Write data for chart
        sheet.Cells["A1"].Value = "时间";
        sheet.Cells["B1"].Value = "炉温1";
        sheet.Cells["C1"].Value = "炉温2";
        sheet.Cells["D1"].Value = "表面温";
        sheet.Cells["E1"].Value = "中心温";

        for (int i = 0; i < data.Count; i++)
        {
            sheet.Cells[i + 2, 1].Value = data[i].Time;
            sheet.Cells[i + 2, 2].Value = data[i].Temps[0];
            sheet.Cells[i + 2, 3].Value = data[i].Temps[1];
            sheet.Cells[i + 2, 4].Value = data[i].Temps[2];
            sheet.Cells[i + 2, 5].Value = data[i].Temps[3];
        }

        var chart = sheet.Drawings.AddChart("TemperatureChart", eChartType.Line);
        chart.Title.Text = "温度变化曲线";
        chart.SetPosition(1, 0, 6, 0);
        chart.SetSize(800, 500);

        for (int col = 1; col <= 4; col++)
        {
            var series = chart.Series.Add(
                sheet.Cells[2, col + 1, data.Count + 1, col + 1],
                sheet.Cells[2, 1, data.Count + 1, 1]
            );
            series.Header = sheet.Cells[1, col + 1].Value?.ToString();
        }

        chart.YAxis.Title.Text = "温度 (°C)";
        chart.XAxis.Title.Text = "时间 (秒)";
    }

    /// <summary>
    /// 生成 PDF 报告（紧凑详细版，参考 ISO 11820 标准格式）
    /// </summary>
    public string GeneratePdf(TestRecord record)
    {
        var reportDir = _config.ReportDirectory;
        if (!Directory.Exists(reportDir))
            Directory.CreateDirectory(reportDir);

        var fileName = Path.Combine(reportDir, $"{record.TestId}_报告.pdf");

        var pdfOptions = new XPdfFontOptions(PdfFontEncoding.Unicode);
        var cnFontFamily = GetChineseFontFamily();

        using var document = new PdfDocument();
        document.Info.Title = $"不燃性试验报告 - {record.TestId}";
        document.Info.Author = record.Operator;
        document.Options.NoCompression = false;

        var fontTitle = new XFont(cnFontFamily, 20, XFontStyleEx.Bold, pdfOptions);
        var fontSection = new XFont(cnFontFamily, 14, XFontStyleEx.Bold, pdfOptions);
        var fontNormal = new XFont(cnFontFamily, 10, XFontStyleEx.Regular, pdfOptions);
        var fontBold = new XFont(cnFontFamily, 10, XFontStyleEx.Bold, pdfOptions);
        var fontSmall = new XFont(cnFontFamily, 9, XFontStyleEx.Regular, pdfOptions);
        var fontResult = new XFont(cnFontFamily, 12, XFontStyleEx.Bold, pdfOptions);
        var fontTableHeader = new XFont(cnFontFamily, 9, XFontStyleEx.Bold, pdfOptions);

        var page = document.AddPage();
        using var gfx = XGraphics.FromPdfPage(page);
        double pw = page.Width.Point;
        double ph = page.Height.Point;

        double y = 40;
        double leftMargin = 50;
        double rightMargin = 50;
        double colWidth = (pw - leftMargin - rightMargin) / 2;
        double lineHeight = 20;

        // ========== 标题 ==========
        gfx.DrawString("ISO 11820 建筑材料不燃性试验报告", fontTitle, XBrushes.Black,
            new XRect(0, y, pw, 30), XStringFormats.TopCenter);
        y += 40;

        var analyzer = new TemperatureAnalyzer();
        var (passed, reason) = analyzer.EvaluateResult(record.DeltaTf, record.LostWeightPercent, record.FlameDuration);

        // ========== 分隔线 ==========
        void DrawSeparator(double yPos)
        {
            gfx.DrawLine(new XPen(XColor.FromArgb(180, 180, 180), 0.8),
                XUnitPt.FromPoint(leftMargin), XUnitPt.FromPoint(yPos),
                XUnitPt.FromPoint(pw - rightMargin), XUnitPt.FromPoint(yPos));
        }

        // ========== 一、试验概要（双列布局） ==========
        gfx.DrawString("一、试验概要", fontSection, XBrushes.Black,
            new XRect(leftMargin, y, colWidth * 2, lineHeight + 5), XStringFormats.TopLeft);
        y += 28;

        // 双列布局辅助方法
        void DrawInfoRow(string label1, string value1, string label2, string value2)
        {
            // 左列
            gfx.DrawString(label1, fontBold, XBrushes.Black,
                new XRect(leftMargin, y, 100, lineHeight), XStringFormats.TopLeft);
            gfx.DrawString(value1, fontNormal, XBrushes.Black,
                new XRect(leftMargin + 100, y, colWidth - 100, lineHeight), XStringFormats.TopLeft);
            // 右列
            gfx.DrawString(label2, fontBold, XBrushes.Black,
                new XRect(leftMargin + colWidth, y, 100, lineHeight), XStringFormats.TopLeft);
            gfx.DrawString(value2, fontNormal, XBrushes.Black,
                new XRect(leftMargin + colWidth + 100, y, colWidth - 100, lineHeight), XStringFormats.TopLeft);
            y += lineHeight;
        }

        DrawInfoRow("样品编号：", record.ProductId, "试验前质量：", $"{record.PreWeight:F1} g");
        DrawInfoRow("试验ID：", record.TestId, "试验后质量：", $"{record.PostWeight:F1} g");
        DrawInfoRow("试验日期：", record.TestDate.ToString("yyyy-MM-dd"), "失重量：", $"{record.LostWeight:F1} g");
        DrawInfoRow("操作员：", record.Operator, "失重率：", $"{record.LostWeightPercent:F1} %");
        DrawInfoRow("环境温度：", $"{record.AmbTemp:F1} °C", "火焰发生时刻：", record.FlameTime > 0 ? $"{record.FlameTime} 秒" : "无");
        DrawInfoRow("环境湿度：", $"{record.AmbHumi:F1} %", "火焰持续时间：", record.FlameDuration > 0 ? $"{record.FlameDuration} 秒" : "无");
        DrawInfoRow("试验依据：", record.According, "设备名称：", record.ApparatusName);
        DrawInfoRow("试验时长：", $"{record.TotalTestTime} 秒", "设备编号：", record.ApparatusId);
        DrawInfoRow("报告编号：", record.RptNo, "操作员：", record.Operator);

        y += 8;
        DrawSeparator(y);
        y += 16;

        // ========== 二、温度数据汇总 ==========
        gfx.DrawString("二、温度数据汇总", fontSection, XBrushes.Black,
            new XRect(leftMargin, y, colWidth * 2, lineHeight + 5), XStringFormats.TopLeft);
        y += 30;

        // 表格：4列 × 3行（最大值、最终值、温升）
        double tableX = leftMargin;
        double tableWidth = pw - leftMargin - rightMargin;
        double colW = tableWidth / 5; // 5列：标签 + 4通道
        double rowH = 22;

        // 表头
        string[] headers = { "项目", "炉温1 (TF1)", "炉温2 (TF2)", "表面温 (TS)", "中心温 (TC)" };
        for (int i = 0; i < headers.Length; i++)
        {
            double cx = tableX + i * colW;
            var headerFont = i == 0 ? fontTableHeader : fontTableHeader;
            gfx.DrawString(headers[i], headerFont, XBrushes.Black,
                new XRect(cx, y, colW, rowH), XStringFormats.CenterLeft);
        }
        y += rowH;

        // 表格线（表头下方）
        gfx.DrawLine(new XPen(XColor.FromArgb(120, 120, 120), 1.2),
            XUnitPt.FromPoint(tableX), XUnitPt.FromPoint(y),
            XUnitPt.FromPoint(tableX + tableWidth), XUnitPt.FromPoint(y));

        // 最大值行
        DrawTableRow(gfx, fontTableHeader, fontNormal, tableX, colW, y, rowH,
            "最大值 (°C)",
            $"{record.MaxTf1:F1}", $"{record.MaxTf2:F1}", $"{record.MaxTs:F1}", $"{record.MaxTc:F1}");
        y += rowH;
        DrawTableGridLine(gfx, tableX, tableWidth, y);

        // 最终值行
        DrawTableRow(gfx, fontTableHeader, fontNormal, tableX, colW, y, rowH,
            "最终值 (°C)",
            $"{record.FinalTf1:F1}", $"{record.FinalTf2:F1}", $"{record.FinalTs:F1}", $"{record.FinalTc:F1}");
        y += rowH;
        DrawTableGridLine(gfx, tableX, tableWidth, y);

        // 温升行
        DrawTableRow(gfx, fontTableHeader, fontNormal, tableX, colW, y, rowH,
            "温升 (°C)",
            $"{record.DeltaTf1:F1}", $"{record.DeltaTf2:F1}", $"{record.DeltaTs:F1}", $"{record.DeltaTc:F1}");
        y += rowH;
        DrawTableGridLine(gfx, tableX, tableWidth, y);

        // 综合判定温升行（重点标注）
        var highlightColor = record.DeltaTf <= 50 ? XColor.FromArgb(0, 140, 0) : XColor.FromArgb(200, 30, 30);
        DrawTableRow(gfx, fontTableHeader, new XFont(cnFontFamily, 9, XFontStyleEx.Bold, pdfOptions),
            tableX, colW, y, rowH,
            "样品温升 ΔT (°C)", "", "", $"{record.DeltaTf:F1} ★", "");
        y += rowH + 4;

        // 表格底部线
        gfx.DrawLine(new XPen(XColor.FromArgb(120, 120, 120), 1.2),
            XUnitPt.FromPoint(tableX), XUnitPt.FromPoint(y - 4),
            XUnitPt.FromPoint(tableX + tableWidth), XUnitPt.FromPoint(y - 4));

        y += 12;

        // 补充说明
        gfx.DrawString($"※ 样品温升 ΔT = |表面温度 - 炉温1|，反映样品自身是否显著放热。判定标准：ΔT ≤ 50°C",
            fontSmall, XBrushes.Gray,
            new XRect(leftMargin, y, tableWidth, lineHeight), XStringFormats.TopLeft);
        y += 16;

        // 恒功率值
        gfx.DrawString($"恒功率值：{record.ConstPower:F0}", fontNormal, XBrushes.Black,
            new XRect(leftMargin, y, tableWidth, lineHeight), XStringFormats.TopLeft);
        y += 22;

        DrawSeparator(y);
        y += 16;

        // ========== 三、温度曲线图 ==========
        gfx.DrawString("三、温度曲线图", fontSection, XBrushes.Black,
            new XRect(leftMargin, y, colWidth * 2, lineHeight + 5), XStringFormats.TopLeft);
        y += 10;

        // 在页面剩余空间绘制图表
        double chartTop = y + 10;
        double chartBottom = ph - 90; // 给判定结论留空间
        DrawTemperatureChartInline(gfx, record, chartTop, chartBottom, pdfOptions, cnFontFamily);

        // ========== 判定结论 ==========
        y = chartBottom + 10;
        DrawSeparator(y);
        y += 16;

        string resultText = passed ? "✔ 通  过" : "✘ 不通过";
        var resultColor = passed ? XColor.FromArgb(0, 150, 0) : XColor.FromArgb(200, 30, 30);

        gfx.DrawString("判 定 结 论", fontSection, XBrushes.Black,
            new XRect(leftMargin, y, 120, lineHeight + 5), XStringFormats.TopLeft);
        gfx.DrawString(resultText, fontResult, new XSolidBrush(resultColor),
            new XRect(leftMargin + 120, y, 200, lineHeight + 5), XStringFormats.CenterLeft);
        y += 28;

        gfx.DrawString($"判定依据：{reason}", fontNormal, XBrushes.Black,
            new XRect(leftMargin, y, tableWidth, lineHeight), XStringFormats.TopLeft);
        y += lineHeight + 4;

        gfx.DrawString($"判定标准：温升 ≤ 50°C  且  失重率 ≤ 50%  且  火焰持续时间 < 5 秒  (ISO 11820:2022)",
            fontSmall, XBrushes.Gray,
            new XRect(leftMargin, y, tableWidth, lineHeight), XStringFormats.TopLeft);
        y += 20;

        // ========== 报告生成时间 ==========
        gfx.DrawString($"报告生成时间：{DateTime.Now:yyyy-MM-dd HH:mm:ss}", fontSmall, XBrushes.Gray,
            new XRect(leftMargin, ph - 30, tableWidth, 16), XStringFormats.CenterLeft);

        document.Save(fileName);
        Log.Information("PDF 报告已生成：{Path}", fileName);
        return fileName;
    }

    /// <summary>
    /// 绘制表格行
    /// </summary>
    private void DrawTableRow(XGraphics gfx, XFont labelFont, XFont valueFont,
        double x, double colW, double y, double rowH,
        string label, string v1, string v2, string v3, string v4)
    {
        double cx = x;
        gfx.DrawString(label, labelFont, XBrushes.Black,
            new XRect(cx, y, colW, rowH), XStringFormats.CenterLeft);
        cx += colW;
        gfx.DrawString(v1, valueFont, XBrushes.Black,
            new XRect(cx, y, colW, rowH), XStringFormats.Center);
        cx += colW;
        gfx.DrawString(v2, valueFont, XBrushes.Black,
            new XRect(cx, y, colW, rowH), XStringFormats.Center);
        cx += colW;
        gfx.DrawString(v3, valueFont, XBrushes.Black,
            new XRect(cx, y, colW, rowH), XStringFormats.Center);
        cx += colW;
        gfx.DrawString(v4, valueFont, XBrushes.Black,
            new XRect(cx, y, colW, rowH), XStringFormats.Center);
    }

    /// <summary>
    /// 绘制表格网格线
    /// </summary>
    private void DrawTableGridLine(XGraphics gfx, double x, double width, double y)
    {
        gfx.DrawLine(new XPen(XColor.FromArgb(200, 200, 200), 0.5),
            XUnitPt.FromPoint(x), XUnitPt.FromPoint(y),
            XUnitPt.FromPoint(x + width), XUnitPt.FromPoint(y));
    }

    /// <summary>
    /// 在页面内联绘制温度曲线图（紧凑版）
    /// </summary>
    private void DrawTemperatureChartInline(XGraphics gfx, TestRecord record,
        double topY, double bottomY, XPdfFontOptions pdfOptions, string cnFontFamily)
    {
        var csvPath = Path.Combine(_config.TestDataDirectory, record.ProductId, record.TestId, "sensor_data.csv");
        var data = CsvWriter.ReadData(csvPath);
        if (data.Count == 0) return;

        var fontAxis = new XFont(cnFontFamily, 7, XFontStyleEx.Regular, pdfOptions);
        var fontLegend = new XFont(cnFontFamily, 8, XFontStyleEx.Regular, pdfOptions);

        double marginLeft = 55;
        double marginRight = 25;
        double marginTop = topY + 5;
        double marginBottom = bottomY - 10;
        double chartWidth = XUnitPt.FromPoint(595 - marginLeft - marginRight).Point; // A4 width
        double chartHeight = marginBottom - marginTop;

        var penGrid = new XPen(XColor.FromArgb(210, 210, 210), 0.4);
        var penAxis = new XPen(XColor.FromArgb(100, 100, 100), 1.0);

        // 计算数据范围
        double minTemp = 0;
        double maxTemp = 800;
        double maxTime = data[data.Count - 1].Time;

        foreach (var d in data)
        {
            for (int i = 0; i < 4; i++)
            {
                if (d.Temps[i] > maxTemp) maxTemp = d.Temps[i];
            }
        }
        maxTemp = Math.Ceiling(maxTemp / 100) * 100 + 50;
        if (maxTemp < 800) maxTemp = 800;

        // Y轴网格线和标签
        double ySteps = 6;
        for (int i = 0; i <= ySteps; i++)
        {
            double temp = minTemp + (maxTemp - minTemp) * i / ySteps;
            double yPos = marginTop + chartHeight * (1 - i / ySteps);

            gfx.DrawLine(penGrid,
                XUnitPt.FromPoint(marginLeft), XUnitPt.FromPoint(yPos),
                XUnitPt.FromPoint(marginLeft + chartWidth), XUnitPt.FromPoint(yPos));

            gfx.DrawString($"{temp:F0}", fontAxis, XBrushes.Black,
                new XRect(0, yPos - 7, marginLeft - 4, 14), XStringFormats.CenterRight);
        }

        // X轴网格线和标签
        double xSteps = Math.Min(6, Math.Max(3, maxTime / 60));
        double xStepInterval = maxTime > 0 ? maxTime / xSteps : 60;

        for (int i = 0; i <= xSteps; i++)
        {
            double t = i * xStepInterval;
            double xPos = marginLeft + chartWidth * (t / (maxTime > 0 ? maxTime : 1));

            gfx.DrawLine(penGrid,
                XUnitPt.FromPoint(xPos), XUnitPt.FromPoint(marginTop),
                XUnitPt.FromPoint(xPos), XUnitPt.FromPoint(marginTop + chartHeight));

            gfx.DrawString($"{t:F0}s", fontAxis, XBrushes.Black,
                new XRect(xPos - 20, marginTop + chartHeight + 3, 40, 14), XStringFormats.TopCenter);
        }

        // 坐标轴
        gfx.DrawLine(penAxis,
            XUnitPt.FromPoint(marginLeft), XUnitPt.FromPoint(marginTop),
            XUnitPt.FromPoint(marginLeft), XUnitPt.FromPoint(marginTop + chartHeight));
        gfx.DrawLine(penAxis,
            XUnitPt.FromPoint(marginLeft), XUnitPt.FromPoint(marginTop + chartHeight),
            XUnitPt.FromPoint(marginLeft + chartWidth), XUnitPt.FromPoint(marginTop + chartHeight));

        // Y轴标题
        gfx.Save();
        gfx.RotateAtTransform(-90, new XPoint(XUnitPt.FromPoint(12), XUnitPt.FromPoint(marginTop + chartHeight / 2)));
        gfx.DrawString("温度(°C)", fontAxis, XBrushes.Black,
            new XRect(-60, 0, 120, 12), XStringFormats.Center);
        gfx.Restore();

        // X轴标题
        gfx.DrawString("时间(秒)", fontAxis, XBrushes.Black,
            new XRect(marginLeft, marginTop + chartHeight + 18, chartWidth, 12), XStringFormats.TopCenter);

        // 曲线颜色
        var seriesInfo = new[]
        {
            (Name: "炉温1", Color: XColor.FromArgb(220, 50, 50)),
            (Name: "炉温2", Color: XColor.FromArgb(230, 140, 30)),
            (Name: "表面温", Color: XColor.FromArgb(30, 160, 180)),
            (Name: "中心温", Color: XColor.FromArgb(40, 100, 220)),
        };

        // 绘制4条曲线
        for (int s = 0; s < 4; s++)
        {
            if (data.Count < 2) continue;
            var pen = new XPen(seriesInfo[s].Color, 1.2);

            for (int i = 1; i < data.Count; i++)
            {
                double x1 = marginLeft + chartWidth * (data[i - 1].Time / (maxTime > 0 ? maxTime : 1));
                double y1 = marginTop + chartHeight * (1 - (data[i - 1].Temps[s] - minTemp) / (maxTemp - minTemp));
                double x2 = marginLeft + chartWidth * (data[i].Time / (maxTime > 0 ? maxTime : 1));
                double y2 = marginTop + chartHeight * (1 - (data[i].Temps[s] - minTemp) / (maxTemp - minTemp));

                gfx.DrawLine(pen,
                    XUnitPt.FromPoint(x1), XUnitPt.FromPoint(y1),
                    XUnitPt.FromPoint(x2), XUnitPt.FromPoint(y2));
            }
        }

        // 图例（横向排列在图表右上角）
        double legendStartX = marginLeft + chartWidth - 260;
        double legendY = marginTop + 3;
        for (int s = 0; s < 4; s++)
        {
            double lx = legendStartX + s * 65;
            gfx.DrawLine(new XPen(seriesInfo[s].Color, 2.5),
                XUnitPt.FromPoint(lx), XUnitPt.FromPoint(legendY + 6),
                XUnitPt.FromPoint(lx + 16), XUnitPt.FromPoint(legendY + 6));
            gfx.DrawString(seriesInfo[s].Name, fontLegend, XBrushes.Black,
                new XRect(lx + 20, legendY, 40, 14), XStringFormats.CenterLeft);
        }
    }

    /// <summary>
    /// 获取系统上可用的中文字体名称，优先选择常用中文字体
    /// </summary>
    private static string GetChineseFontFamily()
    {
        // 按优先级排列的常用中文字体（Windows 实际字体名）
        var candidates = new[]
        {
            "SimSun",            // 宋体 (simsun.ttc)
            "SimHei",            // 黑体 (simhei.ttf)
            "KaiTi",             // 楷体 (simkai.ttf)
            "FangSong",          // 仿宋 (simfang.ttf)
            "Microsoft YaHei",   // 微软雅黑
            "NSimSun",           // 新宋体
        };

        foreach (var fontName in candidates)
        {
            try
            {
                var testFont = new XFont(fontName, 12, XFontStyleEx.Regular,
                    new XPdfFontOptions(PdfFontEncoding.Unicode));
                return fontName;
            }
            catch
            {
                // 字体不可用，尝试下一个
            }
        }

        Log.Warning("未找到可用的中文字体，PDF 报告中文可能无法正确显示");
        return "Arial";
    }
}
