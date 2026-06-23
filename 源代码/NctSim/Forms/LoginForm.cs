using NctSim.Global;

namespace NctSim.Forms;

/// <summary>
/// 登录窗体 - 角色选择 + 密码验证
/// </summary>
public partial class LoginForm : Form
{
    private TextBox txtPassword = null!;
    private RadioButton rbAdmin = null!;
    private RadioButton rbExperimenter = null!;
    private Button btnLogin = null!;
    private Label lblStatus = null!;

    public LoginForm()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        this.Text = "NCT-Sim 系统登录";
        this.Size = new Size(420, 320);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.BackColor = Color.FromArgb(26, 26, 46);

        var title = new Label
        {
            Text = "NCT-Sim",
            Font = new Font("Arial Black", 24, FontStyle.Bold),
            ForeColor = Color.White,
            Location = new Point(60, 20),
            Size = new Size(300, 40),
            TextAlign = ContentAlignment.MiddleCenter
        };

        var subtitle = new Label
        {
            Text = "建筑材料不燃性试验仿真系统",
            Font = new Font("Arial", 10, FontStyle.Regular),
            ForeColor = Color.FromArgb(233, 69, 96),
            Location = new Point(60, 60),
            Size = new Size(300, 25),
            TextAlign = ContentAlignment.MiddleCenter
        };

        // 角色选择
        var groupBox = new GroupBox
        {
            Text = "选择角色",
            Font = new Font("Arial", 10, FontStyle.Bold),
            ForeColor = Color.White,
            Location = new Point(60, 95),
            Size = new Size(280, 50)
        };

        rbAdmin = new RadioButton
        {
            Text = "管理员 (admin)",
            Font = new Font("Arial", 10),
            ForeColor = Color.White,
            Location = new Point(20, 20),
            Size = new Size(120, 25),
            Checked = true
        };

        rbExperimenter = new RadioButton
        {
            Text = "试验员 (experimenter)",
            Font = new Font("Arial", 10),
            ForeColor = Color.White,
            Location = new Point(150, 20),
            Size = new Size(130, 25)
        };

        groupBox.Controls.Add(rbAdmin);
        groupBox.Controls.Add(rbExperimenter);

        // 密码输入
        var lblPwd = new Label
        {
            Text = "访问口令：",
            Font = new Font("Arial", 10),
            ForeColor = Color.White,
            Location = new Point(60, 155),
            Size = new Size(80, 25),
            TextAlign = ContentAlignment.MiddleLeft
        };

        txtPassword = new TextBox
        {
            Font = new Font("Arial", 12),
            Location = new Point(145, 155),
            Size = new Size(195, 30),
            PasswordChar = '●',
            UseSystemPasswordChar = true
        };
        txtPassword.KeyDown += (s, e) => { if (e.KeyCode == Keys.Enter) DoLogin(); };

        // 登录按钮
        btnLogin = new Button
        {
            Text = "登  录",
            Font = new Font("Arial", 12, FontStyle.Bold),
            ForeColor = Color.White,
            BackColor = Color.FromArgb(233, 69, 96),
            FlatStyle = FlatStyle.Flat,
            Location = new Point(60, 200),
            Size = new Size(280, 40)
        };
        btnLogin.FlatAppearance.BorderSize = 0;
        btnLogin.Click += (s, e) => DoLogin();

        // 状态提示
        lblStatus = new Label
        {
            Text = "默认密码：123456",
            Font = new Font("Arial", 9),
            ForeColor = Color.FromArgb(142, 155, 174),
            Location = new Point(60, 250),
            Size = new Size(280, 20),
            TextAlign = ContentAlignment.MiddleCenter
        };

        this.Controls.Add(title);
        this.Controls.Add(subtitle);
        this.Controls.Add(groupBox);
        this.Controls.Add(lblPwd);
        this.Controls.Add(txtPassword);
        this.Controls.Add(btnLogin);
        this.Controls.Add(lblStatus);
    }

    private void DoLogin()
    {
        string username = rbAdmin.Checked ? "admin" : "experimenter";
        string password = txtPassword.Text.Trim();

        if (string.IsNullOrEmpty(password))
        {
            lblStatus.Text = "请输入密码";
            lblStatus.ForeColor = Color.FromArgb(233, 69, 96);
            return;
        }

        var db = AppSession.Instance.Db;
        if (db.Login(username, password, out string userId, out string userType))
        {
            AppSession.Instance.CurrentUser = username;
            AppSession.Instance.CurrentUserType = userType;
            AppSession.Instance.CurrentUserId = userId;
            this.DialogResult = DialogResult.OK;
            this.Close();
        }
        else
        {
            lblStatus.Text = "密码错误，请重新输入";
            lblStatus.ForeColor = Color.FromArgb(233, 69, 96);
            txtPassword.SelectAll();
            txtPassword.Focus();
        }
    }
}
