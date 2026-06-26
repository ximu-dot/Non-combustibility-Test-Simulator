using NctSim.Models;
using Serilog;

namespace NctSim.Core;

/// <summary>
/// 试验状态机控制器
/// 管理 5 状态流转：Idle → Preparing → Ready → Recording → Complete
/// </summary>
public class TestController
{
    private readonly object _lock = new();
    private readonly List<MasterMessage> _pendingMessages = new();

    public TestState CurrentState { get; private set; } = TestState.Idle;
    public bool HasPendingMessages => _pendingMessages.Count > 0;

    // 当前试验信息
    public string CurrentProductId { get; set; } = string.Empty;
    public string CurrentTestId { get; set; } = string.Empty;
    public double AmbientTemp { get; set; } = 25.0;
    public double AmbientHumi { get; set; } = 55.0;
    public double PreWeight { get; set; }

    /// <summary>
    /// 开始升温
    /// </summary>
    public bool StartHeating()
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Idle) return false;

            CurrentState = TestState.Preparing;
            AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "开始升温，系统升温中"
            });
            Log.Information("状态切换：Idle → Preparing");
            return true;
        }
    }

    /// <summary>
    /// 停止升温
    /// </summary>
    public bool StopHeating()
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Preparing && CurrentState != TestState.Ready && CurrentState != TestState.Complete)
                return false;

            CurrentState = TestState.Idle;
            AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "停止升温，系统冷却中"
            });
            Log.Information("状态切换：→ Idle（停止升温）");
            return true;
        }
    }

    /// <summary>
    /// 开始记录
    /// </summary>
    public bool StartRecording()
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Ready) return false;

            CurrentState = TestState.Recording;
            AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "开始记录，计时开始"
            });
            Log.Information("状态切换：Ready → Recording");
            return true;
        }
    }

    /// <summary>
    /// 停止记录
    /// </summary>
    public bool StopRecording()
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Recording) return false;

            CurrentState = TestState.Complete;
            AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "记录停止，试验完成"
            });
            Log.Information("状态切换：Recording → Complete");
            return true;
        }
    }

    /// <summary>
    /// 检测到温度稳定（由 DaqWorker 调用）
    /// </summary>
    public bool CheckAndTransitionToReady(bool isStable)
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Preparing) return false;

            if (isStable)
            {
                CurrentState = TestState.Ready;
                AddMessage(new MasterMessage
                {
                    Time = DateTime.Now.ToString("HH:mm:ss"),
                    Message = "温度已稳定，可以开始记录"
                });
                Log.Information("状态切换：Preparing → Ready（温度已稳定）");
                return true;
            }
            return false;
        }
    }

    /// <summary>
    /// Ready 状态温度回退检测
    /// </summary>
    public bool CheckAndTransitionBackToPreparing(bool isStable)
    {
        lock (_lock)
        {
            if (CurrentState != TestState.Ready) return false;

            if (!isStable)
            {
                CurrentState = TestState.Preparing;
                AddMessage(new MasterMessage
                {
                    Time = DateTime.Now.ToString("HH:mm:ss"),
                    Message = "温度偏离稳定范围，继续升温"
                });
                Log.Information("状态切换：Ready → Preparing（温度回退）");
                return true;
            }
            return false;
        }
    }

    /// <summary>
    /// 保存试验记录后重置
    /// </summary>
    public void OnTestRecordSaved()
    {
        lock (_lock)
        {
            CurrentState = TestState.Preparing; // 保持炉温
            AddMessage(new MasterMessage
            {
                Time = DateTime.Now.ToString("HH:mm:ss"),
                Message = "试验记录已保存"
            });
            Log.Information("试验记录已保存，状态回到 Preparing");
        }
    }

    /// <summary>
    /// 添加系统消息
    /// </summary>
    public void AddMessage(MasterMessage message)
    {
        lock (_lock)
        {
            _pendingMessages.Add(message);
        }
    }

    /// <summary>
    /// 获取并清除待处理消息
    /// </summary>
    public List<MasterMessage> GetPendingMessages()
    {
        lock (_lock)
        {
            var messages = new List<MasterMessage>(_pendingMessages);
            _pendingMessages.Clear();
            return messages;
        }
    }

    /// <summary>
    /// 重置控制器
    /// </summary>
    public void Reset()
    {
        lock (_lock)
        {
            CurrentState = TestState.Idle;
            _pendingMessages.Clear();
            CurrentProductId = string.Empty;
            CurrentTestId = string.Empty;
            Log.Information("TestController 已重置");
        }
    }
}
