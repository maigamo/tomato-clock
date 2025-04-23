import { Notice, WorkspaceLeaf } from 'obsidian';
import TomatoClockPlugin from '../main';
import { FocusSession } from '../data/storage';
import { debounce } from '../utils/debounce';
import { t } from '../i18n';

export class FocusTracker {
  private plugin: TomatoClockPlugin;
  private active: boolean = false;
  private paused: boolean = false;
  private lastActivityTime: number = 0;
  private currentSession: FocusSession | null = null;
  private inactivityCheckInterval: NodeJS.Timeout | null = null;
  private activeLeaf: WorkspaceLeaf | null = null;

  constructor(plugin: TomatoClockPlugin) {
    this.plugin = plugin;
  }

  /**
   * 初始化专注追踪器
   */
  public init(): void {
    // 如果未启用专注模式，则不进行初始化
    if (!this.plugin.settings.focusMode) {
      return;
    }

    // 监听活动事件
    this.registerActivityListeners();

    // 设置不活动检查定时器
    this.setupInactivityCheck();
  }

  /**
   * 注册活动监听器
   */
  private registerActivityListeners(): void {
    const { workspace } = this.plugin.app;

    // 监听键盘输入
    document.addEventListener('keydown', this.handleActivity);

    // 监听鼠标点击和按下
    document.addEventListener('click', this.handleActivity);
    document.addEventListener('mousedown', this.handleActivity);

    // 监听鼠标滚动，使用节流防止频繁触发
    document.addEventListener('scroll', this.handleScrollActivity);

    // 监听文本选择
    document.addEventListener('selectstart', this.handleActivity);
    document.addEventListener('selectionchange', this.handleActivity);

    // 监听鼠标移动，使用防抖
    document.addEventListener('mousemove', this.handleMouseMoveActivity);

    // 监听笔记操作
    workspace.on('active-leaf-change', this.handleLeafChange);
    workspace.on('file-open', this.handleActivity);
  }

  /**
   * 处理活动事件
   */
  private handleActivity = (): void => {
    if (!this.plugin.settings.focusMode || this.paused) {
      return;
    }

    this.lastActivityTime = Date.now();

    // 如果当前没有活跃的会话，则开始一个新会话
    if (!this.active) {
      this.startSession();
    }
  };

  /**
   * 处理滚动活动，使用节流以减少事件处理频率
   */
  private handleScrollActivity = debounce((): void => {
    this.handleActivity();
  }, 500);

  /**
   * 处理鼠标移动活动，使用防抖以减少事件处理频率
   */
  private handleMouseMoveActivity = debounce((): void => {
    this.handleActivity();
  }, 1000);

  /**
   * 处理激活的叶子变化
   */
  private handleLeafChange = (leaf: WorkspaceLeaf): void => {
    this.activeLeaf = leaf;
    this.handleActivity();
  };

  /**
   * 设置不活动检查定时器
   */
  private setupInactivityCheck(): void {
    // 如果已经有定时器，先清除
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
    }

    // 每秒检查一次是否不活动
    this.inactivityCheckInterval = setInterval(() => {
      if (!this.active || this.paused) {
        return;
      }

      const now = Date.now();
      const inactivityTime = now - this.lastActivityTime;
      const inactivityThreshold = this.plugin.settings.inactivityTimeout * 1000;

      // 如果不活动时间超过阈值，结束会话
      if (inactivityTime >= inactivityThreshold) {
        this.endSession();
      }
    }, 1000);
  }

  /**
   * 开始专注会话
   */
  public startSession(): void {
    if (this.active) {
      return;
    }

    this.active = true;
    this.paused = false;
    this.lastActivityTime = Date.now();

    // 创建新会话
    this.currentSession = {
      id: this.plugin.dataStorage.generateId(),
      startTime: this.lastActivityTime,
      endTime: 0,
      duration: 0
    };

    // 如果有活跃的叶子，记录关联笔记
    if (this.activeLeaf) {
      const file = this.plugin.app.workspace.getActiveFile();
      if (file) {
        this.currentSession.noteId = file.path;
      }
    }

    // 更新状态栏图标
    this.updateStatusBar();

    new Notice(t().notifications.focusStarted);
  }

  /**
   * 暂停专注会话
   */
  public pauseSession(): void {
    if (!this.active || this.paused) {
      return;
    }

    this.paused = true;
    this.updateStatusBar();

    new Notice(t().notifications.focusPaused);
  }

  /**
   * 继续专注会话
   */
  public resumeSession(): void {
    if (!this.active || !this.paused) {
      return;
    }

    this.paused = false;
    this.lastActivityTime = Date.now();
    this.updateStatusBar();

    new Notice(t().notifications.focusResumed);
  }

  /**
   * 结束专注会话
   */
  public endSession(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.paused = false;

    if (this.currentSession) {
      const now = Date.now();
      this.currentSession.endTime = now;
      this.currentSession.duration = now - this.currentSession.startTime;

      // 检查会话时长是否达到最短专注时长
      const minimumDuration = this.plugin.settings.minimumFocusDuration * 1000;
      if (this.currentSession.duration >= minimumDuration) {
        // 记录会话
        this.plugin.dataStorage.addFocusSession(this.currentSession);
        
        // 使用格式化的时间
        const formattedDuration = this.formatDuration(this.currentSession.duration);
        const message = t().notifications.focusEndedWithDuration.replace('{duration}', formattedDuration);
        new Notice(message);
      } else {
        // 格式化时间并显示通知
        const formattedDuration = this.formatDuration(this.currentSession.duration);
        const message = t().notifications.focusTooShort.replace('{duration}', formattedDuration);
        new Notice(message);
      }

      this.currentSession = null;
    }

    this.updateStatusBar();
  }

  /**
   * 格式化持续时间（毫秒转为可读格式）
   */
  private formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 更新状态栏
   */
  private updateStatusBar(): void {
    const { statusBar } = this.plugin;
    if (!statusBar) return;

    // 在番茄钟计时器空闲时才显示专注状态
    if (this.plugin.pomodoroTimer.getState() === 'idle') {
      if (this.active) {
        if (this.paused) {
          statusBar.updateStatusText(t().statusBar.focusPaused);
          statusBar.updateIcon('eye-off');
        } else {
          statusBar.updateStatusText(t().statusBar.focusing);
          statusBar.updateIcon('eye');
        }
      } else {
        statusBar.updateStatusText(t().statusBar.idle);
        statusBar.updateIcon('clock');
      }
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    // 移除所有事件监听器
    document.removeEventListener('keydown', this.handleActivity);
    document.removeEventListener('click', this.handleActivity);
    document.removeEventListener('mousedown', this.handleActivity);
    document.removeEventListener('scroll', this.handleScrollActivity);
    document.removeEventListener('selectstart', this.handleActivity);
    document.removeEventListener('selectionchange', this.handleActivity);
    document.removeEventListener('mousemove', this.handleMouseMoveActivity);

    const { workspace } = this.plugin.app;
    workspace.off('active-leaf-change', this.handleLeafChange);
    workspace.off('file-open', this.handleActivity);

    // 清除定时器
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
      this.inactivityCheckInterval = null;
    }

    // 结束当前会话（如果有）
    if (this.active) {
      this.endSession();
    }
  }
} 