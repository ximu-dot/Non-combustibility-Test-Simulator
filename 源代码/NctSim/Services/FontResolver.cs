using PdfSharp.Fonts;

namespace NctSim.Services;

/// <summary>
/// PDFsharp 6.1 自定义字体解析器，从 Windows 系统字体目录加载中文字体
/// </summary>
public class SystemFontResolver : IFontResolver
{
    private readonly Dictionary<string, string> _fontPaths = new(StringComparer.OrdinalIgnoreCase);

    public SystemFontResolver()
    {
        RegisterSystemFonts();
    }

    private void RegisterSystemFonts()
    {
        var fontDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts));
        if (!Directory.Exists(fontDir))
            fontDir = @"C:\Windows\Fonts";
        if (!Directory.Exists(fontDir))
            return;

        // 遍历所有 TTF 文件
        foreach (var file in Directory.GetFiles(fontDir, "*.ttf"))
        {
            try
            {
                var family = ReadFamilyName(file);
                if (!string.IsNullOrEmpty(family) && !_fontPaths.ContainsKey(family))
                    _fontPaths[family] = file;
            }
            catch { }
        }

        // 遍历所有 TTC 文件
        foreach (var file in Directory.GetFiles(fontDir, "*.ttc"))
        {
            try
            {
                var families = ReadTtcFamilyNames(file);
                foreach (var family in families)
                {
                    if (!string.IsNullOrEmpty(family) && !_fontPaths.ContainsKey(family))
                        _fontPaths[family] = file;
                }
            }
            catch { }
        }

        // 日志输出已注册的字体（调试用）
        if (_fontPaths.Count > 0)
        {
            var cnFonts = _fontPaths.Keys.Where(k =>
                k.Contains("Sim") || k.Contains("Hei") || k.Contains("Song") ||
                k.Contains("Kai") || k.Contains("Fang") || k.Contains("YaHei") ||
                k.Contains("Ming")).ToList();
            if (cnFonts.Count > 0)
                Serilog.Log.Information("已注册中文字体: {Fonts}", string.Join(", ", cnFonts));
        }
    }

    /// <summary>
    /// 从 TTF/OTF 文件读取字体家族名称
    /// </summary>
    private static string? ReadFamilyName(string ttfPath)
    {
        using var fs = new FileStream(ttfPath, FileMode.Open, FileAccess.Read);
        return ReadNameTableFamily(fs, 0);
    }

    /// <summary>
    /// 从 TTC 文件读取所有子字体的家族名称
    /// </summary>
    private static string[] ReadTtcFamilyNames(string ttcPath)
    {
        var families = new List<string>();
        using var fs = new FileStream(ttcPath, FileMode.Open, FileAccess.Read);

        // Read TTC header
        var header = new byte[12];
        if (fs.Read(header, 0, 12) != 12) return Array.Empty<string>();

        // Check 'ttcf' tag
        if (header[0] != 't' || header[1] != 't' || header[2] != 'c' || header[3] != 'f')
            return Array.Empty<string>();

        uint numFonts = ((uint)header[8] << 24) | ((uint)header[9] << 16) | ((uint)header[10] << 8) | header[11];

        // Read offset table (starts at byte 12)
        var offsets = new List<uint>();
        for (int i = 0; i < numFonts; i++)
        {
            var offBytes = new byte[4];
            if (fs.Read(offBytes, 0, 4) != 4) break;
            uint off = ((uint)offBytes[0] << 24) | ((uint)offBytes[1] << 16) | ((uint)offBytes[2] << 8) | offBytes[3];
            offsets.Add(off);
        }

        foreach (var off in offsets)
        {
            var family = ReadNameTableFamily(fs, off);
            if (!string.IsNullOrEmpty(family))
                families.Add(family);
        }

        return families.ToArray();
    }

    /// <summary>
    /// 从 OpenType/TrueType 的 name 表读取 Family Name (nameID=1)
    /// </summary>
    private static string? ReadNameTableFamily(FileStream fs, long tableBase)
    {
        fs.Seek(tableBase, SeekOrigin.Begin);

        // Read sfVersion (4 bytes) - skip validation
        var b4 = new byte[4];
        if (fs.Read(b4, 0, 4) != 4) return null;

        // Read numTables (2 bytes, big-endian)
        var b2 = new byte[2];
        if (fs.Read(b2, 0, 2) != 2) return null;
        int numTables = (b2[0] << 8) | b2[1];

        // Skip searchRange(2) + entrySelector(2) + rangeShift(2) = 6 bytes
        fs.Seek(6, SeekOrigin.Current);

        // Find 'name' table offset
        long nameOffset = -1;
        for (int i = 0; i < numTables; i++)
        {
            var record = new byte[16];
            if (fs.Read(record, 0, 16) != 16) return null;

            var tag = System.Text.Encoding.ASCII.GetString(record, 0, 4);
            if (tag == "name")
            {
                nameOffset = tableBase + ((uint)record[8] << 24 | (uint)record[9] << 16 | (uint)record[10] << 8 | record[11]);
                break;
            }
        }

        if (nameOffset < 0) return null;

        // Read name table header
        fs.Seek(nameOffset, SeekOrigin.Begin);
        var nameHeader = new byte[6];
        if (fs.Read(nameHeader, 0, 6) != 6) return null;

        int recordCount = (nameHeader[2] << 8) | nameHeader[3];
        int stringStorageOffset = (nameHeader[4] << 8) | nameHeader[5];

        // Search for nameID=1 (Family Name), prefer Windows platform (3)
        string? fallback = null;
        for (int i = 0; i < recordCount; i++)
        {
            var nameRecord = new byte[12];
            if (fs.Read(nameRecord, 0, 12) != 12) break;

            int platformId = (nameRecord[0] << 8) | nameRecord[1];
            int nameId = (nameRecord[6] << 8) | nameRecord[7];
            int length = (nameRecord[8] << 8) | nameRecord[9];
            int strOffset = (nameRecord[10] << 8) | nameRecord[11];

            if (nameId != 1) continue;

            var savedPos = fs.Position;
            fs.Seek(nameOffset + stringStorageOffset + strOffset, SeekOrigin.Begin);
            var strBytes = new byte[length];
            fs.Read(strBytes, 0, length);

            string name;
            if (platformId == 3) // Windows UTF-16BE
                name = System.Text.Encoding.BigEndianUnicode.GetString(strBytes);
            else
                name = System.Text.Encoding.ASCII.GetString(strBytes);

            fs.Seek(savedPos, SeekOrigin.Begin);

            if (platformId == 3) return name;
            fallback ??= name;
        }

        return fallback;
    }

    public FontResolverInfo? ResolveTypeface(string familyName, bool isBold, bool isItalic)
    {
        if (_fontPaths.TryGetValue(familyName, out _))
            return new FontResolverInfo(familyName);
        return null;
    }

    public byte[]? GetFont(string faceName)
    {
        if (_fontPaths.TryGetValue(faceName, out var path))
            return File.ReadAllBytes(path);
        return null;
    }
}
