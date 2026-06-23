using NctSim.Global;

namespace NctSim.Forms;

/// <summary>
/// 新建试验对话框
/// </summary>
public partial class NewTestDialog : Form
{
    private TextBox _txtProductId = null!;
    private TextBox _txtProductName = null!;
    private TextBox _txtSpecific = null!;
    private NumericUpDown _numDiameter = null!;
    private NumericUpDown _numHeight = null!;
    private NumericUpDown _numAmbTemp = null!;
    private NumericUpDown _numAmbHumi = null!;
    private NumericUpDown _numPreWeight = null!;
    private Button _btnOk = null!;
    private Button _btnCancel = null!;

    public string ProductId => _txtProductId.Text.Trim();
    public string TestId { get; private set; } = string.Empty;
    public new string ProductName => _txtProductName.Text.Trim();
    public string Specific => _txtSpecific.Text.Trim();
    public double Diameter => (double)_numDiameter.Value;
    public new double Height => (double)_numHeight.Value;
    public double AmbientTemp => (double)_numAmbTemp.Value;
    public double AmbientHumi => (double)_numAmbHumi.Value;
    public double PreWeight => (double)_numPreWeight.Value;

    public NewTestDialog()
    {
        TestId = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        this.Text = "新建试验";
        this.Size = new Size(420, 520);
        this.StartPosition = FormStartPosition.CenterParent;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.MinimizeBox = false;
        this.BackColor = Color.White;

        int y = 15;
        int leftX = 15;
        int rightX = 140;
        int fieldWidth = 250;

        // 样品编号
        AddLabel("样品编号：", leftX, y);
        _txtProductId = AddTextBox(rightX, y, fieldWidth);
        _txtProductId.Text = DateTime.Now.ToString("yyyyMMdd") + "-001";
        y += 40;

        // 试验ID（自动生成）
        AddLabel("试验ID：", leftX, y);
        var txtTestId = AddTextBox(rightX, y, fieldWidth);
        txtTestId.Text = TestId;
        txtTestId.ReadOnly = true;
        txtTestId.BackColor = Color.FromArgb(240, 240, 240);
        y += 40;

        // 样品名称
        AddLabel("样品名称：", leftX, y);
        _txtProductName = AddTextBox(rightX, y, fieldWidth);
        _txtProductName.Text = "岩棉隔热板";
        y += 40;

        // 规格型号
        AddLabel("规格型号：", leftX, y);
        _txtSpecific = AddTextBox(rightX, y, fieldWidth);
        _txtSpecific.Text = "100×50×25mm";
        y += 40;

        // 直径
        AddLabel("直径 (mm)：", leftX, y);
        _numDiameter = AddNumeric(rightX, y, fieldWidth, 10, 500, 100);
        y += 40;

        // 高度
        AddLabel("高度 (mm)：", leftX, y);
        _numHeight = AddNumeric(rightX, y, fieldWidth, 5, 200, 50);
        y += 40;

        // 环境温度
        AddLabel("环境温度 (°C)：", leftX, y);
        _numAmbTemp = AddNumeric(rightX, y, fieldWidth, 0, 50, 25, 1);
        y += 40;

        // 环境湿度
        AddLabel("环境湿度 (%)：", leftX, y);
        _numAmbHumi = AddNumeric(rightX, y, fieldWidth, 0, 100, 55, 1);
        y += 40;

        // 试验前质量
        AddLabel("试验前质量 (g)：", leftX, y);
        _numPreWeight = AddNumeric(rightX, y, fieldWidth, 0, 1000, 50, 1);
        y += 50;

        // 按钮
        _btnOk = new Button
        {
            Text = "创建试验",
            Font = new Font("Arial", 11, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(59, 130, 246),
            FlatStyle = FlatStyle.Flat,
            Location = new Point(140, y),
            Size = new Size(120, 36)
        };
        _btnOk.FlatAppearance.BorderSize = 0;
        _btnOk.Click += BtnOk_Click;

        _btnCancel = new Button
        {
            Text = "取消",
            Font = new Font("Arial", 11),
            Location = new Point(270, y),
            Size = new Size(80, 36)
        };
        _btnCancel.Click += (s, e) => { this.DialogResult = DialogResult.Cancel; this.Close(); };

        this.Controls.Add(_btnOk);
        this.Controls.Add(_btnCancel);
    }

    private Label AddLabel(string text, int x, int y)
    {
        var label = new Label
        {
            Text = text,
            Font = new Font("Arial", 10),
            Location = new Point(x, y + 5),
            Size = new Size(120, 25),
            TextAlign = ContentAlignment.MiddleRight
        };
        this.Controls.Add(label);
        return label;
    }

    private TextBox AddTextBox(int x, int y, int width)
    {
        var tb = new TextBox
        {
            Font = new Font("Arial", 10),
            Location = new Point(x, y + 3),
            Size = new Size(width, 28)
        };
        this.Controls.Add(tb);
        return tb;
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

    private void BtnOk_Click(object? sender, EventArgs e)
    {
        if (string.IsNullOrWhiteSpace(ProductId))
        {
            MessageBox.Show("请输入样品编号！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }
        if (string.IsNullOrWhiteSpace(ProductName))
        {
            MessageBox.Show("请输入样品名称！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        this.DialogResult = DialogResult.OK;
        this.Close();
    }
}
