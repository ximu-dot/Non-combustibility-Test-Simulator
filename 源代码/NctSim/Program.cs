using NctSim.Forms;
using Serilog;

namespace NctSim;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        // 初始化 Serilog 日志
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.File("logs/nctsim-.log", rollingInterval: RollingInterval.Day,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        Log.Information("NCT-Sim 应用程序启动");

        try
        {
            ApplicationConfiguration.Initialize();

            // 初始化全局上下文
            var context = Global.AppSession.Instance;
            context.Initialize();

            // 显示登录窗体
            var loginForm = new LoginForm();
            if (loginForm.ShowDialog() == DialogResult.OK)
            {
                Application.Run(new MainForm());
            }
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "应用程序未处理的异常");
            MessageBox.Show($"程序发生严重错误：{ex.Message}", "错误",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            Log.Information("NCT-Sim 应用程序关闭");
            Log.CloseAndFlush();
        }
    }
}
