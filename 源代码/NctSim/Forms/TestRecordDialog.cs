namespace NctSim.Forms;

/// <summary>
/// 试验记录对话框 - 填写火焰现象和试验后质量
/// </summary>
public partial class TestRecordDialog : Form
{
    private readonly double _preWeight;
    private CheckBox _chkFlame = null!;
    private NumericUpDown _numFlameTime = null!;
    private NumericUpDown _numFlameDuration = null!;
    private NumericUpDown _numPostWeight = null!;
    private TextBox _txtMemo = null!;
    private Label _lblLostWeight = null!;
    private Label _lblLostPercent = null!;

    public double PostWeight => (double)_numPostWeight.Value;
    public int FlameTime => _chkFlame.Checked ? (int)_numFlameTime.Value : 0;
    public int FlameDuration => _chkFlame.Checked ? (int)_numFlameDuration.Value : 0;
    public string PhenoCode => _chkFlame.Checked ? "FLAME" : "";
    public string Memo => _txtMemo.Text.Trim();

    public TestRecordDialog(double preWeight)
    {
        _preWeight = preWeight;
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        this.Text = "试验现象记录";
        this.Size = new Size(420, 450);
        this.StartPosition = FormStartPosition.CenterParent;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.MinimizeBox = false;
        this.BackColor = Color.White;

        int y = 15;

        // 火焰现象
        _chkFlame = new CheckBox
        {
            Text = "是否出现持续火焰",
            Font = new Font("Arial", 10, FontStyle.Bold),
            Location = new Point(20, y),
            Size = new Size(200, 30)
        };
        _chkFlame.CheckedChanged += (s, e) => UpdateFlameControls();
        this.Controls.Add(_chkFlame);
        y += 40;

        // 火焰发生时刻
        AddLabel("火焰发生时刻 (秒)：", 40, y);
        _numFlameTime = AddNumeric(200, y, 150, 0, 3600, 0);
        _numFlameTime.Enabled = false;
        y += 40;

        // 火焰持续时间
        AddLabel("火焰持续时间 (秒)：", 40, y);
        _numFlameDuration = AddNumeric(200, y, 150, 0, 3600, 0);
        _numFlameDuration.Enabled = false;
        y += 50;

        // 分隔线
        var sep = new Label
        {
            BorderStyle = BorderStyle.Fixed3D,
            Location = new Point(20, y),
            Size = new Size(370, 2)
        };
        this.Controls.Add(sep);
        y += 15;

        // 试验后质量（必填）
        var lblPostWeight = new Label
        {
            Text = "试验后质量 (g)：*",
            Font = new Font("Arial", 10, FontStyle.Bold),
            ForeColor = Color.FromArgb(233, 69, 96),
            Location = new Point(20, y),
            Size = new Size(150, 25)
        };
        _numPostWeight = AddNumeric(180, y, 150, 0, 1000, (decimal)_preWeight, 1);
        _numPostWeight.ValueChanged += (s, e) => UpdateCalculation();
        this.Controls.Add(lblPostWeight);
        y += 40;

        // 失重量
        _lblLostWeight = new Label
        {
            Text = "失重量：-- g",
            Font = new Font("Arial", 10),
            Location = new Point(20, y),
            Size = new Size(200, 25)
        };
        this.Controls.Add(_lblLostWeight);
        y += 30;

        // 失重率
        _lblLostPercent = new Label
        {
            Text = "失重率：-- %",
            Font = new Font("Arial", 10, FontStyle.Bold),
            Location = new Point(20, y),
            Size = new Size(200, 25)
        };
        this.Controls.Add(_lblLostPercent);
        y += 40;

        // 备注
        AddLabel("备注：", 20, y);
        _txtMemo = new TextBox
        {
            Font = new Font("Arial", 10),
            Location = new Point(80, y + 3),
            Size = new Size(300, 50),
            Multiline = true,
            ScrollBars = ScrollBars.Vertical
        };
        this.Controls.Add(_txtMemo);
        y += 65;

        // 按钮
        var btnOk = new Button
        {
            Text = "保存记录",
            Font = new Font("Arial", 11, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(16, 185, 129),
            FlatStyle = FlatStyle.Flat,
            Location = new Point(140, y),
            Size = new Size(120, 36)
        };
        btnOk.FlatAppearance.BorderSize = 0;
        btnOk.Click += BtnOk_Click;

        var btnCancel = new Button
        {
            Text = "取消",
            Font = new Font("Arial", 11),
            Location = new Point(270, y),
            Size = new Size(80, 36)
        };
        btnCancel.Click += (s, e) => { this.DialogResult = DialogResult.Cancel; this.Close(); };

        this.Controls.Add(btnOk);
        this.Controls.Add(btnCancel);

        UpdateCalculation();
    }

    private void AddLabel(string text, int x, int y)
    {
        var label = new Label
        {
            Text = text,
            Font = new Font("Arial", 10),
            Location = new Point(x, y + 5),
            Size = new Size(160, 25)
        };
        this.Controls.Add(label);
    }

    private NumericUpDown AddNumeric(int x, int y, int width, decimal min, decimal max, decimal value, int decimals = 0)
    {
        var num = new NumericUpDown
        {
            Font = new Font("Arial", 10),
            Location = new Point(x, y + 3),
            Size = new Size(width, 28),
            Minimum = min,
            Maximum = max,
            Value = value,
            DecimalPlaces = decimals
        };
        this.Controls.Add(num);
        return num;
    }

    private void UpdateFlameControls()
    {
        _numFlameTime.Enabled = _chkFlame.Checked;
        _numFlameDuration.Enabled = _chkFlame.Checked;
    }

    private void UpdateCalculation()
    {
        double postWeight = (double)_numPostWeight.Value;
        double lostWeight = _preWeight - postWeight;
        double lostPercent = _preWeight > 0 ? (lostWeight / _preWeight) * 100 : 0;

        _lblLostWeight.Text = $"失重量：{lostWeight:F1} g";
        _lblLostPercent.Text = $"失重率：{lostPercent:F1} %";

        if (lostPercent > 50)
            _lblLostPercent.ForeColor = Color.FromArgb(233, 69, 96);
        else
            _lblLostPercent.ForeColor = Color.FromArgb(16, 185, 129);
    }

    private void BtnOk_Click(object? sender, EventArgs e)
    {
        if (_numPostWeight.Value <= 0)
        {
            MessageBox.Show("请输入试验后质量！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        this.DialogResult = DialogResult.OK;
        this.Close();
    }
}
