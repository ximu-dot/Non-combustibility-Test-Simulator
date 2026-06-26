using Serilog;

namespace NctSim.Services;

/// <summary>
/// CSV 温度数据写入器
/// </summary>
public class CsvWriter : IDisposable
{
    private StreamWriter? _writer;
    private readonly string _filePath;
    private int _rowCount;

    public CsvWriter(string filePath)
    {
        _filePath = filePath;
    }

    /// <summary>
    /// 初始化 CSV 文件（写入表头）
    /// </summary>
    public void Initialize()
    {
        var dir = Path.GetDirectoryName(_filePath)!;
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);

        _writer = new StreamWriter(_filePath, false);
        _writer.WriteLine("Time,Temp1,Temp2,TempSurface,TempCenter,TempCalibration");
        _writer.Flush();
        _rowCount = 0;
        Log.Information("CSV 文件初始化：{Path}", _filePath);
    }

    /// <summary>
    /// 写入一行温度数据
    /// </summary>
    public void WriteRow(int timeSeconds, double[] temps)
    {
        if (_writer == null) return;

        _writer.WriteLine($"{timeSeconds},{temps[0]:F1},{temps[1]:F1},{temps[2]:F1},{temps[3]:F1},{temps[4]:F1}");
        _rowCount++;

        // 每 10 行刷一次缓冲区
        if (_rowCount % 10 == 0)
            _writer.Flush();
    }

    /// <summary>
    /// 读取 CSV 文件的所有数据
    /// </summary>
    public static List<(int Time, double[] Temps)> ReadData(string filePath)
    {
        var data = new List<(int Time, double[] Temps)>();
        if (!File.Exists(filePath)) return data;

        var lines = File.ReadAllLines(filePath);
        for (int i = 1; i < lines.Length; i++) // 跳过表头
        {
            var parts = lines[i].Split(',');
            if (parts.Length >= 5)
            {
                int time = int.Parse(parts[0]);
                var temps = new double[5];
                for (int j = 0; j < 5 && j + 1 < parts.Length; j++)
                    temps[j] = double.Parse(parts[j + 1]);
                data.Add((time, temps));
            }
        }
        return data;
    }

    public void Dispose()
    {
        _writer?.Flush();
        _writer?.Close();
        _writer?.Dispose();
        _writer = null;
    }
}
