using NctSim.Core;
using NctSim.Global;
using NctSim.Models;
using NctSim.Services;
using OxyPlot;
using OxyPlot.Axes;
using OxyPlot.Series;
using OxyPlot.WindowsForms;
using Serilog;

namespace NctSim.Forms;

/// <summary>
/// 主窗体 - 试验控制、实时显示、记录查询、设备校准
/// </summary>
public partial class MainForm : Form
{
    // 核心对象
    private readonly TestController _controller;
    private readonly DaqWorker _daqWorker;
    private readonly ExportService _exportService;

    // 曲线图
    private PlotView _plotView = null!;
    private PlotModel _plotModel = null!;
    private readonly List<LineSeries> _chartSeries = new();
    private readonly List<DataPoint>[] _chartData = new List<DataPoint>[4];
    private int _chartDataCount = 0;

    // 温度显示 Label
    private Label[] _tempLabels = new Label[5];
    private Label _lblTimer = null!;
    private Label _lblStatus = null!;
    private Label _lblDrift = null!;
    private Label _lblProductId = null!;

    // 按钮
    private Button _btnNewTest = null!;
    private Button _btnStartHeat = null!;
    private Button _btnStopHeat = null!;
    private Button _btnStartRecord = null!;
    private Button _btnStopRecord = null!;
    private Button _btnSaveRecord = null!;
    private Button _btnExportExcel = null!;
    private Button _btnExportPdf = null!;

    // 消息日志
    private RichTextBox _rtbLog = null!;

    // 记录查询
    private DataGridView _dgvHistory = null!;
    private DateTimePicker _dtpFrom = null!;
    private DateTimePicker _dtpTo = null!;
    private TextBox _txtSearchPid = null!;
    private Button _btnSearch = null!;

    // 曲线图缩放相关
    private OxyPlot.Axes.LinearAxis _xAxis = null!;
    private OxyPlot.Axes.LinearAxis _yAxis = null!;

    // 当前选中试验
    private string _selectedProductId = string.Empty;
    private string _selectedTestId = string.Empty;

    public MainForm()
    {
        _controller = AppSession.Instance.TestController;
        _daqWorker = AppSession.Instance.DaqWorker;
        _exportService = AppSession.Instance.ExportService;

        InitializeComponent();
        InitializeChart();
        InitializeEventHandlers();
        UpdateButtonStates();

        // 写入初始欢迎消息到日志区域（首行留空，防止WinForms截断第一行文字）
        _rtbLog.AppendText("\n");
        _rtbLog.SelectionColor = Color.FromArgb(16, 185, 129);
        _rtbLog.AppendText($"══ NCT-Sim 建筑材料不燃性试验仿真系统 ══\n");
        _rtbLog.SelectionColor = Color.FromArgb(220, 220, 220);
        _rtbLog.AppendText($"  操作员：{AppSession.Instance.CurrentUser}\n");
        _rtbLog.AppendText($"  启动时间：{DateTime.Now:yyyy-MM-dd HH:mm:ss}\n");
        _rtbLog.AppendText($"  系统就绪，请新建试验开始操作。\n\n");

        // 启动数据采集
        _daqWorker.Start();

        Log.Information("主窗体初始化完成，操作员：{User}", AppSession.Instance.CurrentUser);
    }

    private void InitializeComponent()
    {
        this.Text = $"NCT-Sim 不燃性试验仿真 - {AppSession.Instance.CurrentUser}";
        this.Size = new Size(1440, 1300);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.MinimumSize = new Size(1200, 1100);
        this.BackColor = Color.FromArgb(245, 246, 250);

        var tabControl = new TabControl
        {
            Dock = DockStyle.Fill,
            Font = new Font("Arial", 10)
        };

        // Tab 1: 试验控制
        var tabTest = new TabPage("试验控制");
        BuildTestControlTab(tabTest);
        tabControl.TabPages.Add(tabTest);

        // Tab 2: 记录查询
        var tabHistory = new TabPage("记录查询");
        BuildHistoryTab(tabHistory);
        tabControl.TabPages.Add(tabHistory);

        // Tab 3: 设备校准
        var tabCalibration = new TabPage("设备校准");
        BuildCalibrationTab(tabCalibration);
        tabControl.TabPages.Add(tabCalibration);

        this.Controls.Add(tabControl);
    }

    // ==================== Tab 1: 试验控制 ====================

    private void BuildTestControlTab(TabPage tab)
    {
        // ====== 布局方案：TableLayoutPanel 精确布局 ======
        //  rootPanel(TableLayoutPanel, 2列): 左侧固定 | 右侧自适应
        //  左侧内部: TableLayoutPanel, 温度行+按钮行

        var rootLayout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            RowCount = 1,
            ColumnCount = 2,
            Padding = new Padding(0),
            CellBorderStyle = TableLayoutPanelCellBorderStyle.None,
        };
        rootLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 265F));   // 左侧固定 265px
        rootLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));     // 右侧填充
        rootLayout.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));

        // ==================== 左侧面板（TableLayoutPanel）====================
        var leftLayout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            RowCount = 3,   // 0:温度区  1:Info区(分离)  2:按钮区
            ColumnCount = 1,
            Padding = new Padding(0),
            Margin = new Padding(0),
            CellBorderStyle = TableLayoutPanelCellBorderStyle.None,
            BackColor = Color.FromArgb(245, 247, 250),
        };
        // 上部：温度区，固定高度
        leftLayout.RowStyles.Add(new RowStyle(SizeType.Absolute, 200F));
        // 中部：Info状态栏（独立行！），固定高度80px
        leftLayout.RowStyles.Add(new RowStyle(SizeType.Absolute, 80F));
        // 下部：按钮区，填充剩余空间
        leftLayout.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
        leftLayout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

        // --- 温度区域（TableLayoutPanel: 5行，只有温度标签）---
        var tempArea = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            RowCount = 5,   // 只放5行温度，不再嵌套info
            ColumnCount = 1,
            Padding = new Padding(6, 4, 6, 4),
            Margin = new Padding(0),
            CellBorderStyle = TableLayoutPanelCellBorderStyle.None,
            BackColor = Color.FromArgb(30, 30, 50),
        };
        for (int r = 0; r < 5; r++)
            tempArea.RowStyles.Add(new RowStyle(SizeType.Percent, 100F / 5F));
        tempArea.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

        string[] tempNames = { "炉温1 TF1", "炉温2 TF2", "表面温 TS", "中心温 TC", "校准温 TCal" };
        Color[] tempColors = { Color.FromArgb(233, 69, 96), Color.FromArgb(243, 156, 18),
                               Color.FromArgb(13, 148, 136), Color.FromArgb(59, 130, 246),
                               Color.FromArgb(142, 155, 174) };

        for (int i = 0; i < 5; i++)
        {
            var rowPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                RowCount = 1,
                ColumnCount = 2,
                Margin = new Padding(0),
                Padding = new Padding(0),
                CellBorderStyle = TableLayoutPanelCellBorderStyle.None,
            };
            rowPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42F));   // 名称
            rowPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 58F));   // 数值
            rowPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));

            var nameLbl = new Label
            {
                Text = tempNames[i],
                Font = new Font("Microsoft YaHei UI", 8.5f, FontStyle.Bold),
                ForeColor = tempColors[i],
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft,
                AutoSize = false,
            };
            _tempLabels[i] = new Label
            {
                Text = "0.0 °C",
                Font = new Font("Consolas", 11, FontStyle.Bold),
                ForeColor = Color.White,
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleRight,
            };
            rowPanel.Controls.Add(nameLbl, 0, 0);
            rowPanel.Controls.Add(_tempLabels[i], 1, 0);
            tempArea.Controls.Add(rowPanel, 0, i);
        }

        // --- Info 状态栏区域（Panel + 绝对定位，彻底避免 TLP 嵌套 bug）---
        var infoPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.White,
            Margin = new Padding(4, 0, 4, 0),
            Padding = new Padding(0),
        };

        _lblTimer = new Label
        {
            Text = "00:00:00",
            Font = new Font("Consolas", 10f, FontStyle.Bold),
            ForeColor = Color.FromArgb(30, 30, 50),
            Location = new Point(10, 8),
            Size = new Size(100, 24),
            TextAlign = ContentAlignment.MiddleLeft,
        };
        _lblStatus = new Label
        {
            Text = "空闲",
            Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold),
            ForeColor = Color.FromArgb(59, 130, 246),
            Location = new Point(115, 8),
            Size = new Size(60, 24),
            TextAlign = ContentAlignment.MiddleLeft,
        };
        _lblDrift = new Label
        {
            Text = "温漂: --",
            Font = new Font("Microsoft YaHei UI", 8.5f),
            ForeColor = Color.FromArgb(120, 120, 140),
            Location = new Point(10, 40),
            Size = new Size(120, 22),
            TextAlign = ContentAlignment.MiddleLeft,
        };
        _lblProductId = new Label
        {
            Text = "样品: --",
            Font = new Font("Microsoft YaHei UI", 8.5f),
            ForeColor = Color.FromArgb(120, 120, 140),
            Location = new Point(135, 40),
            Size = new Size(120, 22),
            TextAlign = ContentAlignment.MiddleLeft,
        };

        infoPanel.Controls.AddRange(new Control[] { _lblTimer, _lblStatus, _lblDrift, _lblProductId });

        leftLayout.Controls.Add(tempArea, 0, 0);       // 温度区 → leftLayout[0,0]
        leftLayout.Controls.Add(infoPanel, 0, 1);     // 状态栏 → leftLayout[0,1] (独立行！)

        // --- 按钮区域 ---
        var btnArea = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            AutoScroll = true,
            BackColor = Color.FromArgb(240, 242, 245),
            Padding = new Padding(8, 10, 8, 10),
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
        };

        int btnW = 245, btnH = 36;

        _btnNewTest = MakeBtn("新建试验", btnW, btnH, Color.FromArgb(59, 130, 246));
        _btnStartHeat = MakeBtn("开始升温", btnW, btnH, Color.FromArgb(233, 69, 96));
        _btnStopHeat = MakeBtn("停止升温", btnW, btnH, Color.FromArgb(150, 155, 165));
        _btnStartRecord = MakeBtn("开始记录", btnW, btnH, Color.FromArgb(13, 148, 136));
        _btnStopRecord = MakeBtn("停止记录", btnW, btnH, Color.FromArgb(150, 155, 165));
        _btnSaveRecord = MakeBtn("试验记录", btnW, btnH, Color.FromArgb(243, 156, 18));
        _btnExportExcel = MakeBtn("导出 Excel", btnW, btnH, Color.FromArgb(16, 185, 129));
        _btnExportPdf = MakeBtn("导出 PDF", btnW, btnH, Color.FromArgb(233, 69, 96));

        btnArea.Controls.AddRange(new Control[] {
            _btnNewTest, _btnStartHeat, _btnStopHeat, _btnStartRecord,
            _btnStopRecord, _btnSaveRecord, _btnExportExcel, _btnExportPdf,
        });
        leftLayout.Controls.Add(btnArea, 0, 2);   // 按钮区 → leftLayout[0,2] (第3行)

        rootLayout.Controls.Add(leftLayout, 0, 0);

        // ==================== 右侧面板 ====================
        var rightPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            RowCount = 2,
            ColumnCount = 1,
            Padding = new Padding(0),
            CellBorderStyle = TableLayoutPanelCellBorderStyle.None,
        };
        rightPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));   // 图表区填充
        rightPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 280F));   // 日志区固定280px
        rightPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));

        // 曲线图外层
        var chartOuter = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(12, 10, 16, 10),
            BackColor = Color.FromArgb(252, 252, 254),
        };

        // 缩放工具栏
        var zoomBar = new Panel
        {
            Dock = DockStyle.Top,
            Height = 28,
            Padding = new Padding(4, 2, 4, 2),
        };
        var btnZoomIn = new Button
        {
            Text = "+ 放大",
            Size = new Size(70, 24),
            Location = new Point(4, 2),
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Microsoft YaHei UI", 7.5f, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(59, 130, 246),
            Cursor = Cursors.Hand,
        };
        btnZoomIn.FlatAppearance.BorderSize = 0;
        btnZoomIn.Click += (s, ev) =>
        {
            double cx = (_xAxis.ActualMinimum + _xAxis.ActualMaximum) / 2;
            double cy = (_yAxis.ActualMinimum + _yAxis.ActualMaximum) / 2;
            double halfW = (_xAxis.ActualMaximum - _xAxis.ActualMinimum) * 0.3;
            double halfH = (_yAxis.ActualMaximum - _yAxis.ActualMinimum) * 0.3;
            _xAxis.Zoom(cx - halfW, cx + halfW);
            _yAxis.Zoom(cy - halfH, cy + halfH);
            _plotModel.InvalidatePlot(true);
        };

        var btnZoomOut = new Button
        {
            Text = "- 缩小",
            Size = new Size(70, 24),
            Location = new Point(78, 2),
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Microsoft YaHei UI", 7.5f, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(13, 148, 136),
            Cursor = Cursors.Hand,
        };
        btnZoomOut.FlatAppearance.BorderSize = 0;
        btnZoomOut.Click += (s, ev) =>
        {
            double cx = (_xAxis.ActualMinimum + _xAxis.ActualMaximum) / 2;
            double cy = (_yAxis.ActualMinimum + _yAxis.ActualMaximum) / 2;
            double halfW = (_xAxis.ActualMaximum - _xAxis.ActualMinimum) * 0.7;
            double halfH = (_yAxis.ActualMaximum - _yAxis.ActualMinimum) * 0.7;
            double newMinX = Math.Max(0, cx - halfW);
            double newMaxX = cx + halfW;
            double newMinY = Math.Max(0, cy - halfH);
            double newMaxY = Math.Min(850, cy + halfH);
            _xAxis.Zoom(newMinX, newMaxX);
            _yAxis.Zoom(newMinY, newMaxY);
            _plotModel.InvalidatePlot(true);
        };

        var btnZoomReset = new Button
        {
            Text = "R 重置",
            Size = new Size(70, 24),
            Location = new Point(152, 2),
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Microsoft YaHei UI", 7.5f, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(142, 155, 174),
            Cursor = Cursors.Hand,
        };
        btnZoomReset.FlatAppearance.BorderSize = 0;
        btnZoomReset.Click += (s, ev) =>
        {
            if (_chartData[0].Count > 0)
            {
                double lastX = _chartData[0][^1].X;
                _xAxis.Zoom(Math.Max(0, lastX - 60), Math.Max(60, lastX + 5));
            }
            else
            {
                _xAxis.Zoom(0, 60);
            }
            _yAxis.Zoom(0, 850);
            _plotModel.InvalidatePlot(true);
        };

        var lblZoomTip = new Label
        {
            Text = "滚轮缩放 | 右键拖拽平移 | 双击重置",
            Font = new Font("Microsoft YaHei UI", 7f),
            ForeColor = Color.FromArgb(160, 170, 185),
            Location = new Point(230, 5),
            Size = new Size(240, 18),
            TextAlign = ContentAlignment.MiddleLeft,
        };

        zoomBar.Controls.AddRange(new Control[] { btnZoomIn, btnZoomOut, btnZoomReset, lblZoomTip });

        var chartWrapper = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(1),
            BackColor = Color.FromArgb(200, 210, 230),
        };
        _plotView = new PlotView { Dock = DockStyle.Fill };
        _plotView.MouseWheel += PlotView_MouseWheel;
        chartWrapper.Controls.Add(_plotView);
        chartOuter.Controls.Add(chartWrapper);
        chartOuter.Controls.Add(zoomBar);

        // 日志面板
        var logPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(20, 20, 32),
            Padding = new Padding(0),
        };
        logPanel.Controls.Add(new Label
        {
            Text = "系统消息日志",
            Font = new Font("Microsoft YaHei UI", 9, FontStyle.Bold),
            ForeColor = Color.FromArgb(140, 180, 255),
            Dock = DockStyle.Top,
            Height = 24,
            Padding = new Padding(8, 2, 0, 0),
            BackColor = Color.FromArgb(20, 20, 32),
        });
        _rtbLog = new RichTextBox
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(28, 28, 40),
            ForeColor = Color.FromArgb(210, 220, 230),
            Font = new Font("Consolas", 10),
            BorderStyle = BorderStyle.None,
            ReadOnly = true,
            WordWrap = false,
            ScrollBars = RichTextBoxScrollBars.Vertical,
            Margin = new Padding(6, 2, 4, 4),
        };
        logPanel.Controls.Add(_rtbLog);

        rightPanel.Controls.Add(chartOuter, 0, 0);
        rightPanel.Controls.Add(logPanel, 0, 1);
        rootLayout.Controls.Add(rightPanel, 1, 0);

        tab.Controls.Add(rootLayout);

        // 绑定按钮事件
        _btnNewTest.Click += BtnNewTest_Click;
        _btnStartHeat.Click += BtnStartHeat_Click;
        _btnStopHeat.Click += BtnStopHeat_Click;
        _btnStartRecord.Click += BtnStartRecord_Click;
        _btnStopRecord.Click += BtnStopRecord_Click;
        _btnSaveRecord.Click += BtnSaveRecord_Click;
        _btnExportExcel.Click += BtnExportExcel_Click;
        _btnExportPdf.Click += BtnExportPdf_Click;
    }

    private Button MakeBtn(string text, int w, int h, Color backColor)
    {
        return new Button
        {
            Text = text,
            Size = new Size(w, h),
            Margin = new Padding(0),
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = backColor,
            Cursor = Cursors.Hand,
            FlatAppearance = { BorderSize = 0 },
        };
    }

    // ==================== Tab 2: 记录查询 ====================

    private void BuildHistoryTab(TabPage tab)
    {
        var titleBar = new Panel
        {
            Dock = DockStyle.Top,
            Height = 40,
            BackColor = Color.FromArgb(26, 26, 46)
        };
        var lblTitle = new Label
        {
            Text = "  ◆ 历史记录查询",
            Font = new Font("Arial", 13, FontStyle.Bold),
            ForeColor = Color.White,
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleLeft
        };
        titleBar.Controls.Add(lblTitle);
        tab.Controls.Add(titleBar);

        // 查询条件 - 使用 FlowLayoutPanel 自适应
        var searchPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 46,
            BackColor = Color.White,
            Padding = new Padding(8, 10, 8, 4),
            AutoSize = false,
            WrapContents = false
        };

        searchPanel.Controls.Add(new Label { Text = "开始日期：", Size = new Size(60, 25), TextAlign = ContentAlignment.MiddleLeft });
        _dtpFrom = new DateTimePicker { Size = new Size(120, 25), Format = DateTimePickerFormat.Short };
        searchPanel.Controls.Add(_dtpFrom);

        searchPanel.Controls.Add(new Label { Text = "结束日期：", Size = new Size(60, 25), TextAlign = ContentAlignment.MiddleLeft });
        _dtpTo = new DateTimePicker { Size = new Size(120, 25), Format = DateTimePickerFormat.Short };
        searchPanel.Controls.Add(_dtpTo);

        searchPanel.Controls.Add(new Label { Text = "样品编号：", Size = new Size(60, 25), TextAlign = ContentAlignment.MiddleLeft });
        _txtSearchPid = new TextBox { Size = new Size(100, 25) };
        searchPanel.Controls.Add(_txtSearchPid);

        _btnSearch = new Button
        {
            Text = "查询",
            Size = new Size(70, 28),
            BackColor = Color.FromArgb(59, 130, 246),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat
        };
        _btnSearch.FlatAppearance.BorderSize = 0;
        _btnSearch.Click += BtnSearch_Click;
        searchPanel.Controls.Add(_btnSearch);

        _dtpFrom.Value = DateTime.Now.AddMonths(-1);
        _dtpTo.Value = DateTime.Now;

        tab.Controls.Add(searchPanel);

        // 数据表格
        _dgvHistory = new DataGridView
        {
            Dock = DockStyle.Fill,
            AllowUserToAddRows = false,
            AllowUserToDeleteRows = false,
            ReadOnly = true,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
            SelectionMode = DataGridViewSelectionMode.FullRowSelect
        };
        _dgvHistory.DoubleClick += DgvHistory_DoubleClick;
        tab.Controls.Add(_dgvHistory);
    }

    // ==================== Tab 3: 设备校准 ====================

    private void BuildCalibrationTab(TabPage tab)
    {
        var titleBar = new Panel
        {
            Dock = DockStyle.Top,
            Height = 40,
            BackColor = Color.FromArgb(26, 26, 46)
        };
        var lblTitle = new Label
        {
            Text = "  ◆ 设备校准管理",
            Font = new Font("Arial", 13, FontStyle.Bold),
            ForeColor = Color.White,
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleLeft
        };
        titleBar.Controls.Add(lblTitle);
        tab.Controls.Add(titleBar);

        var contentPanel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(20) };

        var infoLabel = new Label
        {
            Text = "设备校准功能用于记录和管理加热炉的温度校准数据。\n\n"
                 + "校准类型：\n"
                 + "  • 表面温度校准 (Surface) - 炉壁 9 点温度测量\n"
                 + "  • 中心温度校准 (Center) - 中心轴温度测量\n\n"
                 + "校准温度通道 (TCal) 实时显示在试验控制面板中。",
            Font = new Font("Arial", 11),
            ForeColor = Color.FromArgb(90, 108, 125),
            Location = new Point(20, 20),
            Size = new Size(600, 250)
        };

        var btnCalibrate = new Button
        {
            Text = "开始校准",
            Font = new Font("Arial", 12, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(13, 148, 136),
            FlatStyle = FlatStyle.Flat,
            Location = new Point(20, 280),
            Size = new Size(150, 40)
        };
        btnCalibrate.FlatAppearance.BorderSize = 0;
        btnCalibrate.Click += (s, e) =>
        {
            var calTemp = _daqWorker.CurrentTemperatures[4];
            MessageBox.Show($"当前校准温度：{calTemp:F1} °C\n\n校准功能需要配合标准温度计使用。",
                "设备校准", MessageBoxButtons.OK, MessageBoxIcon.Information);
        };

        contentPanel.Controls.Add(infoLabel);
        contentPanel.Controls.Add(btnCalibrate);
        tab.Controls.Add(contentPanel);
    }

    // ==================== 曲线图初始化 ====================

    private void InitializeChart()
    {
        _plotModel = new PlotModel
        {
            Title = "温度变化曲线",
            TitleFontSize = 12,
            Background = OxyColors.White,
            PlotAreaBorderColor = OxyColor.FromRgb(226, 232, 240),
            PlotAreaBorderThickness = new OxyThickness(1),
        };

        // Y轴：温度（启用缩放，范围 0~850°C）
        _yAxis = new OxyPlot.Axes.LinearAxis
        {
            Position = OxyPlot.Axes.AxisPosition.Left,
            Title = "温度 (°C)",
            Minimum = 0,
            Maximum = 850,
            TitleFontSize = 10,
            IsZoomEnabled = true,
            MinimumRange = 10,       // 最小缩放范围 10°C
            MaximumRange = 900,      // 最大缩放范围 900°C
        };
        _plotModel.Axes.Add(_yAxis);

        // X轴：时间（秒），启用缩放
        _xAxis = new OxyPlot.Axes.LinearAxis
        {
            Position = OxyPlot.Axes.AxisPosition.Bottom,
            Title = "时间 (秒)",
            TitleFontSize = 10,
            Minimum = 0,
            Maximum = 60,
            IsZoomEnabled = true,
            MinimumRange = 5,        // 最小缩放范围 5 秒
            MaximumRange = 800,      // 最大缩放范围 800 秒
        };
        _plotModel.Axes.Add(_xAxis);

        string[] seriesNames = { "炉温1", "炉温2", "表面温", "中心温" };
        OxyColor[] seriesColors = {
            OxyColor.FromRgb(233, 69, 96),
            OxyColor.FromRgb(243, 156, 18),
            OxyColor.FromRgb(13, 148, 136),
            OxyColor.FromRgb(59, 130, 246)
        };

        for (int i = 0; i < 4; i++)
        {
            var series = new LineSeries
            {
                Title = seriesNames[i],
                Color = seriesColors[i],
                StrokeThickness = 1.8,
                MarkerType = MarkerType.None,
                CanTrackerInterpolatePoints = false,
            };
            _plotModel.Series.Add(series);
            _chartSeries.Add(series);
            _chartData[i] = new List<DataPoint>();
        }

        // 图例设置
        _plotModel.IsLegendVisible = true;

        _plotView.Model = _plotModel;

        // 设置 PlotView 控制器以支持缩放和平移
        var controller = new PlotController();
        controller.UnbindAll();
        // 右键拖拽 = 平移
        controller.BindMouseDown(OxyMouseButton.Right, PlotCommands.PanAt);
        // 滚轮 = 缩放（以鼠标位置为中心）
        controller.BindMouseWheel(PlotCommands.ZoomWheel);
        // 左键 = 轨迹跟踪
        controller.BindMouseDown(OxyMouseButton.Left, PlotCommands.Track);
        // 双击左键 = 重置视图
        controller.BindMouseDown(OxyMouseButton.Left, OxyModifierKeys.None, 2, PlotCommands.ResetAt);
        // Ctrl+左键 = 区域重置
        controller.BindMouseDown(OxyMouseButton.Left, OxyModifierKeys.Control, PlotCommands.ResetAt);
        // Ctrl+R = 重置视图
        controller.BindKeyDown(OxyKey.R, OxyModifierKeys.Control, PlotCommands.Reset);
        // 鼠标中键 = 重置视图
        controller.BindMouseDown(OxyMouseButton.Middle, PlotCommands.ResetAt);
        _plotView.Controller = controller;
    }

    /// <summary>
    /// 鼠标滚轮缩放事件处理 - 在非 Recording 状态下也允许缩放
    /// </summary>
    private void PlotView_MouseWheel(object? sender, MouseEventArgs e)
    {
        // OxyPlot 的 PlotController 已处理滚轮缩放，此方法作为备用
        // 主要确保焦点在 PlotView 上时能正常响应
        if (!_plotView.Focused)
            _plotView.Focus();
    }

    // ==================== 事件处理 ====================

    private void InitializeEventHandlers()
    {
        _daqWorker.DataBroadcast += OnDataBroadcast;
        this.FormClosing += (s, e) =>
        {
            _daqWorker.DataBroadcast -= OnDataBroadcast;
            _daqWorker.Stop();
        };
    }

    private void OnDataBroadcast(object? sender, DataBroadcastEventArgs e)
    {
        if (this.InvokeRequired)
        {
            this.Invoke(() => OnDataBroadcast(sender, e));
            return;
        }

        // 更新温度显示
        for (int i = 0; i < 5; i++)
        {
            _tempLabels[i].Text = $"{e.Temperatures[i]:F1} °C";
        }

        // 更新计时器
        int hours = e.ElapsedSeconds / 3600;
        int minutes = (e.ElapsedSeconds % 3600) / 60;
        int seconds = e.ElapsedSeconds % 60;
        _lblTimer.Text = $"{hours:D2}:{minutes:D2}:{seconds:D2}";

        // 更新状态
        _lblStatus.Text = e.CurrentState switch
        {
            TestState.Idle => "空闲",
            TestState.Preparing => "升温中",
            TestState.Ready => "就绪",
            TestState.Recording => "记录中",
            TestState.Complete => "完成",
            _ => "未知"
        };

        Color statusColor = e.CurrentState switch
        {
            TestState.Idle => Color.FromArgb(142, 155, 174),
            TestState.Preparing => Color.FromArgb(243, 156, 18),
            TestState.Ready => Color.FromArgb(13, 148, 136),
            TestState.Recording => Color.FromArgb(59, 130, 246),
            TestState.Complete => Color.FromArgb(16, 185, 129),
            _ => Color.Gray
        };
        _lblStatus.ForeColor = statusColor;

        // 更新温漂
        _lblDrift.Text = $"温漂: {e.TemperatureDrift:F1}";

        // 更新样品编号
        _lblProductId.Text = string.IsNullOrEmpty(_controller.CurrentProductId)
            ? "样品: --"
            : $"样品: {_controller.CurrentProductId.Substring(0, Math.Min(8, _controller.CurrentProductId.Length))}";

        // 更新曲线图
        UpdateChart(e);

        // 更新消息日志
        foreach (var msg in e.Messages)
        {
            Color msgColor = msg.Message.Contains("终止") ? Color.FromArgb(243, 156, 18) : Color.White;
            _rtbLog.SelectionColor = msgColor;
            _rtbLog.AppendText($"{msg.Time}  {msg.Message}\n");
            _rtbLog.ScrollToCaret();
        }

        // 自动状态转换
        if (e.CurrentState == TestState.Preparing && e.IsStable)
        {
            _controller.CheckAndTransitionToReady(true);
        }
        else if (e.CurrentState == TestState.Ready && !e.IsStable)
        {
            _controller.CheckAndTransitionBackToPreparing(false);
        }

        // 更新按钮状态
        UpdateButtonStates();
    }

    private void UpdateChart(DataBroadcastEventArgs e)
    {
        if (e.CurrentState != TestState.Recording && e.CurrentState != TestState.Ready
            && e.CurrentState != TestState.Preparing) return;

        // 使用递增计数器作为X值
        int x = _chartDataCount++;

        // 滚动窗口：保留最近 750 个点（约 10 分钟 @800ms采样）
        if (_chartData[0].Count >= 750)
        {
            for (int i = 0; i < 4; i++)
                _chartData[i].RemoveAt(0);
        }

        // 数据校验：过滤异常温度值（合理范围 -50 ~ 1000 °C）
        for (int i = 0; i < 4; i++)
        {
            double temp = e.Temperatures[i];
            if (temp < -50 || temp > 1000 || double.IsNaN(temp) || double.IsInfinity(temp))
                temp = 0; // 异常值归零
            _chartData[i].Add(new DataPoint(x, temp));
            _chartSeries[i].ItemsSource = _chartData[i];
        }

        // 自动滚动 X 轴范围：显示最近 60 秒的窗口
        if (_chartData[0].Count > 0)
        {
            double lastX = _chartData[0][^1].X;
            double viewMin = Math.Max(0, lastX - 60);
            double viewMax = Math.Max(60, lastX + 5);

            // 检测用户是否手动操作了视图（缩放或平移）
            double currentMin = _xAxis.ActualMinimum;
            double currentMax = _xAxis.ActualMaximum;
            double currentRange = currentMax - currentMin;
            double expectedRange = viewMax - viewMin;

            // 如果当前视图范围与期望范围偏差超过10%，认为用户在手动浏览
            bool isUserZooming = Math.Abs(currentRange - expectedRange) > expectedRange * 0.1
                               || Math.Abs(currentMax - viewMax) > expectedRange * 0.15;

            if (!isUserZooming)
            {
                _xAxis.Zoom(viewMin, viewMax);
            }
        }

        _plotModel.InvalidatePlot(true);
    }

    /// <summary>
    /// 重置图表数据和视图（新建试验时调用）
    /// </summary>
    private void ResetChart()
    {
        _chartDataCount = 0;
        for (int i = 0; i < 4; i++)
        {
            _chartData[i].Clear();
            _chartSeries[i].ItemsSource = _chartData[i];
        }
        _xAxis.Zoom(0, 60);
        _yAxis.Zoom(0, 850);
        _plotModel.InvalidatePlot(true);
    }

    // ==================== 按钮事件 ====================

    private void BtnNewTest_Click(object? sender, EventArgs e)
    {
        using var dialog = new NewTestDialog();
        if (dialog.ShowDialog() == DialogResult.OK)
        {
            // 重置图表数据，防止残留
            ResetChart();

            _controller.CurrentProductId = dialog.ProductId;
            _controller.CurrentTestId = dialog.TestId;
            _controller.AmbientTemp = dialog.AmbientTemp;
            _controller.AmbientHumi = dialog.AmbientHumi;
            _controller.PreWeight = dialog.PreWeight;

            // 插入数据库
            var apparatus = AppSession.Instance.Db.GetApparatus();
            AppSession.Instance.Db.InsertProduct(dialog.ProductId, dialog.ProductName, dialog.Specific, dialog.Diameter, dialog.Height);
            AppSession.Instance.Db.InsertTest(dialog.ProductId, dialog.TestId,
                AppSession.Instance.CurrentUser, dialog.PreWeight,
                dialog.AmbientTemp, dialog.AmbientHumi,
                apparatus?.InnerNumber ?? "FURNACE-01",
                apparatus?.ApparatusName ?? "一号试验炉");

            _controller.AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = $"新建试验：{dialog.ProductId} / {dialog.TestId}"
            });

            UpdateButtonStates();
        }
    }

    private void BtnStartHeat_Click(object? sender, EventArgs e)
    {
        if (string.IsNullOrEmpty(_controller.CurrentProductId))
        {
            MessageBox.Show("请先新建试验！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        _controller.StartHeating();
        UpdateButtonStates();
    }

    private void BtnStopHeat_Click(object? sender, EventArgs e)
    {
        _controller.StopHeating();
        _daqWorker.Simulator.StartCooling();
        UpdateButtonStates();
    }

    private void BtnStartRecord_Click(object? sender, EventArgs e)
    {
        _controller.StartRecording();
        _daqWorker.BeginRecording(_controller.CurrentProductId, _controller.CurrentTestId, 3600, TestMode.Standard60Min);
        UpdateButtonStates();
    }

    private void BtnStopRecord_Click(object? sender, EventArgs e)
    {
        _controller.StopRecording();
        _daqWorker.EndRecording();
        UpdateButtonStates();
    }

    private void BtnSaveRecord_Click(object? sender, EventArgs e)
    {
        if (_controller.CurrentState != TestState.Complete || _daqWorker.ElapsedSeconds <= 0)
        {
            MessageBox.Show("请先完成试验记录！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        using var dialog = new TestRecordDialog(_controller.PreWeight);
        if (dialog.ShowDialog() == DialogResult.OK)
        {
            double lostPer = (dialog.PostWeight > 0) ? (1 - dialog.PostWeight / _controller.PreWeight) * 100 : 0;
            var deltas = _daqWorker.GetDeltaTemps(_controller.AmbientTemp);
            double deltaTf = deltas[2]; // 样品温升 = |表面温度 - 炉温1| (符合ISO 1182标准)

            AppSession.Instance.Db.UpdateTestResult(
                _controller.CurrentProductId, _controller.CurrentTestId,
                _controller.PreWeight, dialog.PostWeight, lostPer, deltaTf,
                _daqWorker.ElapsedSeconds, dialog.PhenoCode, dialog.FlameTime,
                dialog.FlameDuration, dialog.Memo,
                _daqWorker.MaxTemps, _daqWorker.MaxTempTimes,
                _daqWorker.FinalTemps, _daqWorker.FinalTempTimes, deltas
            );

            // 自动生成报告
            try
            {
                var record = AppSession.Instance.Db.GetTestRecord(_controller.CurrentProductId, _controller.CurrentTestId);
                if (record != null)
                {
                    _exportService.GenerateExcel(record);
                    _exportService.GeneratePdf(record);
                    MessageBox.Show("试验记录已保存，Excel 和 PDF 报告已自动生成。", "保存成功",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "报告生成失败");
                MessageBox.Show("试验记录已保存，但报告生成失败：" + ex.Message, "提示",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }

            _controller.OnTestRecordSaved();
            UpdateButtonStates();
        }
    }

    private void BtnExportExcel_Click(object? sender, EventArgs e)
    {
        ExportReport("excel");
    }

    private void BtnExportPdf_Click(object? sender, EventArgs e)
    {
        ExportReport("pdf");
    }

    private void ExportReport(string type)
    {
        string pid, tid;

        if (!string.IsNullOrEmpty(_selectedProductId) && !string.IsNullOrEmpty(_selectedTestId))
        {
            pid = _selectedProductId;
            tid = _selectedTestId;
        }
        else if (!string.IsNullOrEmpty(_controller.CurrentProductId) && !string.IsNullOrEmpty(_controller.CurrentTestId))
        {
            pid = _controller.CurrentProductId;
            tid = _controller.CurrentTestId;
        }
        else
        {
            MessageBox.Show("请先在记录查询中选择一条试验记录！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var record = AppSession.Instance.Db.GetTestRecord(pid, tid);
        if (record == null || !record.IsSaved)
        {
            MessageBox.Show("该试验记录尚未保存，无法导出报告！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        try
        {
            string path = type == "excel" ? _exportService.GenerateExcel(record) : _exportService.GeneratePdf(record);
            MessageBox.Show($"报告已生成：\n{path}", "导出成功", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"导出失败：{ex.Message}", "错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    // ==================== 按钮状态管理 ====================

    private void UpdateButtonStates()
    {
        var state = _controller.CurrentState;
        bool hasUnsaved = AppSession.Instance.Db.HasUnsavedTest(_controller.CurrentProductId);

        _btnNewTest.Enabled = state == TestState.Idle ||
            ((state == TestState.Preparing || state == TestState.Complete) && !hasUnsaved);
        _btnStartHeat.Enabled = state == TestState.Idle;
        _btnStopHeat.Enabled = state == TestState.Preparing || state == TestState.Ready || state == TestState.Complete;
        _btnStartRecord.Enabled = state == TestState.Ready;
        _btnStopRecord.Enabled = state == TestState.Recording;
        _btnSaveRecord.Enabled = state == TestState.Complete && _daqWorker.ElapsedSeconds > 0;
        _btnExportExcel.Enabled = true;
        _btnExportPdf.Enabled = true;
    }

    // ==================== 记录查询 ====================

    private void BtnSearch_Click(object? sender, EventArgs e)
    {
        var records = AppSession.Instance.Db.QueryTests(
            _dtpFrom.Value, _dtpTo.Value, _txtSearchPid.Text);

        _dgvHistory.DataSource = null;
        _dgvHistory.Columns.Clear();

        _dgvHistory.DataSource = records.Select(r => new
        {
            r.ProductId,
            r.TestId,
            试验日期 = r.TestDate.ToString("yyyy-MM-dd"),
            r.Operator,
            失重率 = $"{r.LostWeightPercent:F1}%",
            温升 = $"{r.DeltaTf:F1}°C",
            时长 = $"{r.TotalTestTime}s",
            状态 = r.IsSaved ? "已保存" : "未保存"
        }).ToList();

        _dgvHistory.AutoResizeColumns();
    }

    private void DgvHistory_DoubleClick(object? sender, EventArgs e)
    {
        if (_dgvHistory.SelectedRows.Count == 0) return;
        var row = _dgvHistory.SelectedRows[0];
        _selectedProductId = row.Cells["ProductId"].Value?.ToString() ?? "";
        _selectedTestId = row.Cells["TestId"].Value?.ToString() ?? "";

        var record = AppSession.Instance.Db.GetTestRecord(_selectedProductId, _selectedTestId);
        if (record == null) return;

        var info = $"样品编号：{record.ProductId}\n"
                 + $"试验ID：{record.TestId}\n"
                 + $"试验日期：{record.TestDate:yyyy-MM-dd}\n"
                 + $"操作员：{record.Operator}\n"
                 + $"设备：{record.ApparatusName}\n\n"
                 + $"试验前质量：{record.PreWeight:F1} g\n"
                 + $"试验后质量：{record.PostWeight:F1} g\n"
                 + $"失重率：{record.LostWeightPercent:F1} %\n"
                 + $"综合温升：{record.DeltaTf:F1} °C\n"
                 + $"试验时长：{record.TotalTestTime} 秒\n"
                 + $"火焰持续时间：{record.FlameDuration} 秒\n\n"
                 + $"备注：{record.Memo}";

        MessageBox.Show(info, "试验详情", MessageBoxButtons.OK, MessageBoxIcon.Information);
    }

    // ==================== 辅助方法 ====================

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        _daqWorker.Stop();
        base.OnFormClosed(e);
    }
}
