using Microsoft.Data.Sqlite;
using NctSim.Models;
using Serilog;

namespace NctSim.Data;

/// <summary>
/// SQLite 数据库操作封装类
/// </summary>
public class DbHelper
{
    private readonly string _connectionString;

    public DbHelper(string dbPath)
    {
        _connectionString = $"Data Source={dbPath}";
    }

    /// <summary>
    /// 首次运行时初始化数据库表结构和初始数据
    /// </summary>
    public void InitializeDatabase()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        // 创建表
        ExecuteCreateTables(conn);

        // 插入初始数据
        ExecuteSeedData(conn);

        Log.Information("数据库初始化完成");
    }

    private void ExecuteCreateTables(SqliteConnection conn)
    {
        var sqls = new[]
        {
            // operators
            @"CREATE TABLE IF NOT EXISTS operators (
                userid TEXT NOT NULL,
                username TEXT NOT NULL,
                pwd TEXT NOT NULL,
                usertype TEXT NOT NULL
            )",

            // apparatus
            @"CREATE TABLE IF NOT EXISTS apparatus (
                apparatusid INTEGER NOT NULL PRIMARY KEY,
                innernumber TEXT NOT NULL,
                apparatusname TEXT NOT NULL,
                checkdatef TEXT NOT NULL,
                checkdatet TEXT NOT NULL,
                pidport TEXT NOT NULL,
                powerport TEXT NOT NULL,
                constpower INTEGER
            )",

            // productmaster
            @"CREATE TABLE IF NOT EXISTS productmaster (
                productid TEXT NOT NULL PRIMARY KEY,
                productname TEXT NOT NULL,
                specific TEXT NOT NULL,
                diameter REAL NOT NULL,
                height REAL NOT NULL,
                flag TEXT
            )",

            // testmaster (核心表)
            @"CREATE TABLE IF NOT EXISTS testmaster (
                productid TEXT NOT NULL,
                testid TEXT NOT NULL,
                testdate TEXT NOT NULL,
                ambtemp REAL NOT NULL,
                ambhumi REAL NOT NULL,
                according TEXT NOT NULL,
                operator TEXT NOT NULL,
                apparatusid TEXT NOT NULL,
                apparatusname TEXT NOT NULL,
                apparatuschkdate TEXT NOT NULL,
                rptno TEXT NOT NULL,
                preweight REAL NOT NULL,
                postweight REAL NOT NULL,
                lostweight REAL NOT NULL,
                lostweight_per REAL NOT NULL,
                totaltesttime INTEGER NOT NULL,
                constpower INTEGER NOT NULL,
                phenocode TEXT NOT NULL,
                flametime INTEGER NOT NULL,
                flameduration INTEGER NOT NULL,
                maxtf1 REAL NOT NULL,
                maxtf2 REAL NOT NULL,
                maxts REAL NOT NULL,
                maxtc REAL NOT NULL,
                maxtf1_time INTEGER NOT NULL,
                maxtf2_time INTEGER NOT NULL,
                maxts_time INTEGER NOT NULL,
                maxtc_time INTEGER NOT NULL,
                finaltf1 REAL NOT NULL,
                finaltf2 REAL NOT NULL,
                finalts REAL NOT NULL,
                finaltc REAL NOT NULL,
                finaltf1_time INTEGER NOT NULL,
                finaltf2_time INTEGER NOT NULL,
                finalts_time INTEGER NOT NULL,
                finaltc_time INTEGER NOT NULL,
                deltatf1 REAL NOT NULL,
                deltatf2 REAL NOT NULL,
                deltatf REAL NOT NULL,
                deltats REAL NOT NULL,
                deltatc REAL NOT NULL,
                memo TEXT,
                flag TEXT,
                PRIMARY KEY (productid, testid),
                FOREIGN KEY (productid) REFERENCES productmaster(productid)
            )",

            // sensors
            @"CREATE TABLE IF NOT EXISTS sensors (
                sensorid INTEGER NOT NULL PRIMARY KEY,
                sensorname TEXT NOT NULL,
                dispname TEXT NOT NULL,
                sensorgroup TEXT NOT NULL,
                unit TEXT NOT NULL,
                discription TEXT NOT NULL,
                flag TEXT NOT NULL,
                signalzero REAL NOT NULL,
                signalspan REAL NOT NULL,
                outputzero REAL NOT NULL,
                outputspan REAL NOT NULL,
                outputvalue REAL NOT NULL,
                inputvalue REAL NOT NULL,
                signaltype INTEGER NOT NULL
            )",

            // CalibrationRecords
            @"CREATE TABLE IF NOT EXISTS CalibrationRecords (
                Id TEXT NOT NULL PRIMARY KEY,
                CalibrationDate TEXT NOT NULL,
                CalibrationType TEXT NOT NULL,
                ApparatusId INTEGER NOT NULL,
                Operator TEXT NOT NULL,
                TemperatureData TEXT NOT NULL,
                UniformityResult REAL,
                MaxDeviation REAL,
                AverageTemperature REAL,
                PassedCriteria INTEGER NOT NULL,
                Remarks TEXT NOT NULL,
                CreatedAt TEXT NOT NULL,
                TempA1 REAL, TempA2 REAL, TempA3 REAL,
                TempB1 REAL, TempB2 REAL, TempB3 REAL,
                TempC1 REAL, TempC2 REAL, TempC3 REAL,
                TAvg REAL, TAvgAxis1 REAL, TAvgAxis2 REAL, TAvgAxis3 REAL,
                TAvgLevela REAL, TAvgLevelb REAL, TAvgLevelc REAL,
                TDevAxis1 REAL, TDevAxis2 REAL, TDevAxis3 REAL,
                TDevLevela REAL, TDevLevelb REAL, TDevLevelc REAL,
                TAvgDevAxis REAL, TAvgDevLevel REAL,
                CenterTempData TEXT,
                Memo TEXT
            )",

            // 索引
            "CREATE INDEX IF NOT EXISTS IX_Testmaster_Testdate ON testmaster (testdate)",
            "CREATE INDEX IF NOT EXISTS IX_Testmaster_Operator ON testmaster (operator)",
            "CREATE INDEX IF NOT EXISTS IX_Testmaster_Testdate_Productid ON testmaster (testdate, productid)",
            "CREATE INDEX IF NOT EXISTS IX_CalibrationRecord_Date ON CalibrationRecords (CalibrationDate)",
            "CREATE INDEX IF NOT EXISTS IX_CalibrationRecord_Operator ON CalibrationRecords (Operator)"
        };

        foreach (var sql in sqls)
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.ExecuteNonQuery();
        }
    }

    private void ExecuteSeedData(SqliteConnection conn)
    {
        // 操作员
        InsertOrIgnore(conn,
            "INSERT OR IGNORE INTO operators (userid, username, pwd, usertype) VALUES ('1', 'admin', '123456', 'admin')");

        InsertOrIgnore(conn,
            "INSERT OR IGNORE INTO operators (userid, username, pwd, usertype) VALUES ('2', 'experimenter', '123456', 'operator')");

        // 设备
        InsertOrIgnore(conn,
            "INSERT OR IGNORE INTO apparatus VALUES (0, 'FURNACE-01', '一号试验炉', date('now'), date('now','+1 year'), 'COM9', 'COM9', 2048)");

        // 传感器
        InsertOrIgnore(conn, "INSERT OR IGNORE INTO sensors VALUES (0,'Sensor0','炉温1','采集','℃','炉温1','启用',0,0,0,1000,0,0,4)");
        InsertOrIgnore(conn, "INSERT OR IGNORE INTO sensors VALUES (1,'Sensor1','炉温2','采集','℃','炉温2','启用',0,0,0,1000,0,0,4)");
        InsertOrIgnore(conn, "INSERT OR IGNORE INTO sensors VALUES (2,'Sensor2','表面温度','采集','℃','表面温度','启用',0,0,0,1000,0,0,4)");
        InsertOrIgnore(conn, "INSERT OR IGNORE INTO sensors VALUES (3,'Sensor3','中心温度','采集','℃','中心温度','启用',0,0,0,1000,0,0,4)");
        InsertOrIgnore(conn, "INSERT OR IGNORE INTO sensors VALUES (16,'Sensor16','校准温度','校准','℃','校准温度','启用',0,0,0,1000,0,0,4)");

        // 备用通道 4-15
        for (int i = 4; i <= 15; i++)
        {
            InsertOrIgnore(conn,
                $"INSERT OR IGNORE INTO sensors VALUES ({i},'Sensor{i}','备用通道{i+1}','备用','℃','备用通道','禁用',0,0,0,1000,0,0,4)");
        }
    }

    private void InsertOrIgnore(SqliteConnection conn, string sql)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    // ==================== 用户认证 ====================

    public bool Login(string username, string pwd, out string userid, out string usertype)
    {
        userid = string.Empty;
        usertype = string.Empty;

        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT userid, usertype FROM operators WHERE username=$name AND pwd=$pwd";
        cmd.Parameters.AddWithValue("$name", username);
        cmd.Parameters.AddWithValue("$pwd", pwd);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            userid = reader.GetString(0);
            usertype = reader.GetString(1);
            Log.Information("用户登录成功：{Username} ({UserType})", username, usertype);
            return true;
        }

        Log.Warning("用户登录失败：{Username}", username);
        return false;
    }

    // ==================== 设备操作 ====================

    public Apparatus? GetApparatus(int apparatusId = 0)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM apparatus WHERE apparatusid=$id";
        cmd.Parameters.AddWithValue("$id", apparatusId);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new Apparatus
            {
                ApparatusId = reader.GetInt32(0),
                InnerNumber = reader.GetString(1),
                ApparatusName = reader.GetString(2),
                CheckDateFrom = DateTime.Parse(reader.GetString(3)),
                CheckDateTo = DateTime.Parse(reader.GetString(4)),
                PidPort = reader.GetString(5),
                PowerPort = reader.GetString(6),
                ConstPower = reader.IsDBNull(7) ? null : reader.GetInt32(7)
            };
        }
        return null;
    }

    public void UpdateConstPower(int apparatusId, int constPower)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE apparatus SET constpower=$power WHERE apparatusid=$id";
        cmd.Parameters.AddWithValue("$power", constPower);
        cmd.Parameters.AddWithValue("$id", apparatusId);
        cmd.ExecuteNonQuery();
    }

    // ==================== 试验记录操作 ====================

    public void InsertTest(string productId, string testId, string operatorName,
                           double preWeight, double ambTemp, double ambHumi,
                           string apparatusId, string apparatusName)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO testmaster
                (productid, testid, testdate, operator, ambtemp, ambhumi,
                 according, apparatusid, apparatusname, apparatuschkdate, rptno,
                 preweight, postweight, lostweight, lostweight_per,
                 totaltesttime, constpower, phenocode, flametime, flameduration,
                 maxtf1,maxtf2,maxts,maxtc,
                 maxtf1_time,maxtf2_time,maxts_time,maxtc_time,
                 finaltf1,finaltf2,finalts,finaltc,
                 finaltf1_time,finaltf2_time,finalts_time,finaltc_time,
                 deltatf1,deltatf2,deltatf,deltats,deltatc, memo, flag)
            VALUES
                ($pid, $tid, date('now'), $op, $ambt, $ambh,
                 'ISO 11820:2022', $apid, $apname, date('now'), $rptno,
                 $prewt, 0, 0, 0,
                 0, 0, '', 0, 0,
                 0,0,0,0, 0,0,0,0,
                 0,0,0,0, 0,0,0,0,
                 0,0,0,0,0, '', '')";

        cmd.Parameters.AddWithValue("$pid", productId);
        cmd.Parameters.AddWithValue("$tid", testId);
        cmd.Parameters.AddWithValue("$op", operatorName);
        cmd.Parameters.AddWithValue("$ambt", ambTemp);
        cmd.Parameters.AddWithValue("$ambh", ambHumi);
        cmd.Parameters.AddWithValue("$apid", apparatusId);
        cmd.Parameters.AddWithValue("$apname", apparatusName);
        cmd.Parameters.AddWithValue("$rptno", productId);
        cmd.Parameters.AddWithValue("$prewt", preWeight);
        cmd.ExecuteNonQuery();

        Log.Information("新建试验记录：{ProductId}/{TestId}", productId, testId);
    }

    public void InsertProduct(string productId, string productName, string specific,
                              double diameter, double height)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT OR REPLACE INTO productmaster
            (productid, productname, specific, diameter, height)
            VALUES ($pid, $pname, $spec, $dia, $h)";
        cmd.Parameters.AddWithValue("$pid", productId);
        cmd.Parameters.AddWithValue("$pname", productName);
        cmd.Parameters.AddWithValue("$spec", specific);
        cmd.Parameters.AddWithValue("$dia", diameter);
        cmd.Parameters.AddWithValue("$h", height);
        cmd.ExecuteNonQuery();
    }

    public void UpdateTestResult(string productId, string testId, double preWeight,
                                 double postWeight, double lostPer, double deltaTf,
                                 int totalTime, string phenoCode, int flameTime,
                                 int flameDuration, string memo,
                                 double[] maxTemps, int[] maxTimes,
                                 double[] finalTemps, int[] finalTimes,
                                 double[] deltas)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE testmaster SET
                postweight = $post,
                lostweight = $lost,
                lostweight_per = $lostper,
                deltatf = $dtf,
                deltatf1 = $dtf1,
                deltatf2 = $dtf2,
                deltats = $dts,
                deltatc = $dtc,
                totaltesttime = $time,
                phenocode = $pheno,
                flametime = $ftime,
                flameduration = $fdur,
                memo = $memo,
                maxtf1 = $mt1, maxtf2 = $mt2, maxts = $mt3, maxtc = $mt4,
                maxtf1_time = $mt1t, maxtf2_time = $mt2t, maxts_time = $mt3t, maxtc_time = $mt4t,
                finaltf1 = $ft1, finaltf2 = $ft2, finalts = $ft3, finaltc = $ft4,
                finaltf1_time = $ft1t, finaltf2_time = $ft2t, finalts_time = $ft3t, finaltc_time = $ft4t,
                flag = '10000000'
            WHERE productid=$pid AND testid=$tid";

        cmd.Parameters.AddWithValue("$post", postWeight);
        cmd.Parameters.AddWithValue("$lost", preWeight - postWeight);
        cmd.Parameters.AddWithValue("$lostper", lostPer);
        cmd.Parameters.AddWithValue("$dtf", deltaTf);
        cmd.Parameters.AddWithValue("$dtf1", deltas[0]);
        cmd.Parameters.AddWithValue("$dtf2", deltas[1]);
        cmd.Parameters.AddWithValue("$dts", deltas[2]);
        cmd.Parameters.AddWithValue("$dtc", deltas[3]);
        cmd.Parameters.AddWithValue("$time", totalTime);
        cmd.Parameters.AddWithValue("$pheno", phenoCode);
        cmd.Parameters.AddWithValue("$ftime", flameTime);
        cmd.Parameters.AddWithValue("$fdur", flameDuration);
        cmd.Parameters.AddWithValue("$memo", memo);
        cmd.Parameters.AddWithValue("$mt1", maxTemps[0]);
        cmd.Parameters.AddWithValue("$mt2", maxTemps[1]);
        cmd.Parameters.AddWithValue("$mt3", maxTemps[2]);
        cmd.Parameters.AddWithValue("$mt4", maxTemps[3]);
        cmd.Parameters.AddWithValue("$mt1t", maxTimes[0]);
        cmd.Parameters.AddWithValue("$mt2t", maxTimes[1]);
        cmd.Parameters.AddWithValue("$mt3t", maxTimes[2]);
        cmd.Parameters.AddWithValue("$mt4t", maxTimes[3]);
        cmd.Parameters.AddWithValue("$ft1", finalTemps[0]);
        cmd.Parameters.AddWithValue("$ft2", finalTemps[1]);
        cmd.Parameters.AddWithValue("$ft3", finalTemps[2]);
        cmd.Parameters.AddWithValue("$ft4", finalTemps[3]);
        cmd.Parameters.AddWithValue("$ft1t", finalTimes[0]);
        cmd.Parameters.AddWithValue("$ft2t", finalTimes[1]);
        cmd.Parameters.AddWithValue("$ft3t", finalTimes[2]);
        cmd.Parameters.AddWithValue("$ft4t", finalTimes[3]);
        cmd.Parameters.AddWithValue("$pid", productId);
        cmd.Parameters.AddWithValue("$tid", testId);
        cmd.ExecuteNonQuery();

        Log.Information("更新试验结果：{ProductId}/{TestId}, 失重率={LostPer}%, 温升={DeltaTf}°C",
            productId, testId, lostPer, deltaTf);
    }

    public TestRecord? GetTestRecord(string productId, string testId)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM testmaster WHERE productid=$pid AND testid=$tid";
        cmd.Parameters.AddWithValue("$pid", productId);
        cmd.Parameters.AddWithValue("$tid", testId);

        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return ReadTestRecord(reader);
        }
        return null;
    }

    public List<TestRecord> QueryTests(DateTime from, DateTime to, string? productId = null, string? operatorName = null)
    {
        var result = new List<TestRecord>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();

        var where = new List<string> { "testdate BETWEEN $from AND $to" };
        cmd.Parameters.AddWithValue("$from", from.ToString("yyyy-MM-dd"));
        cmd.Parameters.AddWithValue("$to", to.ToString("yyyy-MM-dd"));

        if (!string.IsNullOrEmpty(productId))
        {
            where.Add("productid LIKE '%' || $pid || '%'");
            cmd.Parameters.AddWithValue("$pid", productId);
        }
        if (!string.IsNullOrEmpty(operatorName))
        {
            where.Add("operator = $op");
            cmd.Parameters.AddWithValue("$op", operatorName);
        }

        cmd.CommandText = $"SELECT * FROM testmaster WHERE {string.Join(" AND ", where)} ORDER BY testdate DESC, testid DESC";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            result.Add(ReadTestRecord(reader));
        }
        return result;
    }

    public bool HasUnsavedTest(string productId)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT COUNT(*) FROM testmaster
            WHERE productid=$pid AND totaltesttime > 0 AND flag != '10000000'";
        cmd.Parameters.AddWithValue("$pid", productId);
        var count = (long)cmd.ExecuteScalar()!;
        return count > 0;
    }

    private TestRecord ReadTestRecord(SqliteDataReader reader)
    {
        return new TestRecord
        {
            ProductId = reader.GetString(0),
            TestId = reader.GetString(1),
            TestDate = DateTime.Parse(reader.GetString(2)),
            AmbTemp = reader.GetDouble(3),
            AmbHumi = reader.GetDouble(4),
            According = reader.GetString(5),
            Operator = reader.GetString(6),
            ApparatusId = reader.GetString(7),
            ApparatusName = reader.GetString(8),
            ApparatusChkDate = DateTime.Parse(reader.GetString(9)),
            RptNo = reader.GetString(10),
            PreWeight = reader.GetDouble(11),
            PostWeight = reader.GetDouble(12),
            LostWeight = reader.GetDouble(13),
            LostWeightPercent = reader.GetDouble(14),
            TotalTestTime = reader.GetInt32(15),
            ConstPower = reader.GetInt32(16),
            PhenoCode = reader.GetString(17),
            FlameTime = reader.GetInt32(18),
            FlameDuration = reader.GetInt32(19),
            MaxTf1 = reader.GetDouble(20),
            MaxTf2 = reader.GetDouble(21),
            MaxTs = reader.GetDouble(22),
            MaxTc = reader.GetDouble(23),
            MaxTf1Time = reader.GetInt32(24),
            MaxTf2Time = reader.GetInt32(25),
            MaxTsTime = reader.GetInt32(26),
            MaxTcTime = reader.GetInt32(27),
            FinalTf1 = reader.GetDouble(28),
            FinalTf2 = reader.GetDouble(29),
            FinalTs = reader.GetDouble(30),
            FinalTc = reader.GetDouble(31),
            FinalTf1Time = reader.GetInt32(32),
            FinalTf2Time = reader.GetInt32(33),
            FinalTsTime = reader.GetInt32(34),
            FinalTcTime = reader.GetInt32(35),
            DeltaTf1 = reader.GetDouble(36),
            DeltaTf2 = reader.GetDouble(37),
            DeltaTf = reader.GetDouble(38),
            DeltaTs = reader.GetDouble(39),
            DeltaTc = reader.GetDouble(40),
            Memo = reader.IsDBNull(41) ? "" : reader.GetString(41),
            Flag = reader.IsDBNull(42) ? "" : reader.GetString(42)
        };
    }

    // ==================== 传感器操作 ====================

    public List<Sensor> GetAllSensors()
    {
        var sensors = new List<Sensor>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM sensors WHERE flag='启用' ORDER BY sensorid";

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            sensors.Add(new Sensor
            {
                SensorId = reader.GetInt32(0),
                SensorName = reader.GetString(1),
                DispName = reader.GetString(2),
                SensorGroup = reader.GetString(3),
                Unit = reader.GetString(4),
                Description = reader.GetString(5),
                Flag = reader.GetString(6),
                SignalZero = reader.GetDouble(7),
                SignalSpan = reader.GetDouble(8),
                OutputZero = reader.GetDouble(9),
                OutputSpan = reader.GetDouble(10),
                OutputValue = reader.GetDouble(11),
                InputValue = reader.GetDouble(12),
                SignalType = reader.GetInt32(13)
            });
        }
        return sensors;
    }

    public void UpdateSensorValue(int sensorId, double outputValue, double inputValue)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "UPDATE sensors SET outputvalue=$ov, inputvalue=$iv WHERE sensorid=$id";
        cmd.Parameters.AddWithValue("$ov", outputValue);
        cmd.Parameters.AddWithValue("$iv", inputValue);
        cmd.Parameters.AddWithValue("$id", sensorId);
        cmd.ExecuteNonQuery();
    }

    // ==================== 校准记录操作 ====================

    public void InsertCalibration(CalibrationRecord record)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"INSERT INTO CalibrationRecords
            (Id, CalibrationDate, CalibrationType, ApparatusId, Operator,
             TemperatureData, PassedCriteria, Remarks, CreatedAt)
            VALUES ($id, $date, $type, $apid, $op, $data, $pass, $remarks, $created)";
        cmd.Parameters.AddWithValue("$id", record.Id);
        cmd.Parameters.AddWithValue("$date", record.CalibrationDate);
        cmd.Parameters.AddWithValue("$type", record.CalibrationType);
        cmd.Parameters.AddWithValue("$apid", record.ApparatusId);
        cmd.Parameters.AddWithValue("$op", record.Operator);
        cmd.Parameters.AddWithValue("$data", record.TemperatureData);
        cmd.Parameters.AddWithValue("$pass", record.PassedCriteria);
        cmd.Parameters.AddWithValue("$remarks", record.Remarks);
        cmd.Parameters.AddWithValue("$created", record.CreatedAt);
        cmd.ExecuteNonQuery();
    }

    public List<CalibrationRecord> QueryCalibrations(DateTime from, DateTime to)
    {
        var records = new List<CalibrationRecord>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"SELECT Id, CalibrationDate, CalibrationType, ApparatusId, Operator,
            TemperatureData, PassedCriteria, Remarks, CreatedAt
            FROM CalibrationRecords
            WHERE CalibrationDate BETWEEN $from AND $to
            ORDER BY CalibrationDate DESC";
        cmd.Parameters.AddWithValue("$from", from.ToString("yyyy-MM-dd"));
        cmd.Parameters.AddWithValue("$to", to.ToString("yyyy-MM-dd") + "T23:59:59");

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            records.Add(new CalibrationRecord
            {
                Id = reader.GetString(0),
                CalibrationDate = reader.GetString(1),
                CalibrationType = reader.GetString(2),
                ApparatusId = reader.GetInt32(3),
                Operator = reader.GetString(4),
                TemperatureData = reader.GetString(5),
                PassedCriteria = reader.GetInt32(6),
                Remarks = reader.GetString(7),
                CreatedAt = reader.GetString(8)
            });
        }
        return records;
    }

    // ==================== 操作员列表 ====================

    public List<(string Username, string UserType)> GetOperators()
    {
        var ops = new List<(string, string)>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT username, usertype FROM operators ORDER BY userid";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            ops.Add((reader.GetString(0), reader.GetString(1)));
        }
        return ops;
    }
}
