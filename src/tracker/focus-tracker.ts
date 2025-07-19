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
  private inactivityCheckInterval: number | null = null;
  private activeLeaf: WorkspaceLeaf | null = null;

  constructor(plugin: TomatoClockPlugin) {
    this.plugin = plugin;
  }

  /**
   * 初始化专注追踪器
   */
  public init(): void {
    if (!this.plugin.settings.focusMode) {
      return;
    }

    // 监听各种活动事件
    document.addEventListener('keydown', this.handleActivity);
    document.addEventListener('click', this.handleActivity);
    document.addEventListener('mousedown', this.handleActivity);
    document.addEventListener('scroll', this.handleScrollActivity);
    document.addEventListener('selectstart', this.handleActivity);
    document.addEventListener('selectionchange', this.handleActivity);
    document.addEventListener('mousemove', this.handleMouseMoveActivity);

    // 监听Obsidian特定事件
    const { workspace } = this.plugin.app;
    workspace.on('active-leaf-change', this.handleLeafChange);
    workspace.on('file-open', this.handleActivity);

    // 设置不活动检查
    this.setupInactivityCheck();
  }

  /**
   * 开始专注会话
   */
  public startSession(): void {
    if (this.active) {
      return; // 已经在专注状态
    }

    const now = Date.now();
    this.active = true;
    this.paused = false;
    this.lastActivityTime = now;

    // 获取当前活跃文件的路径
    const activeFile = this.plugin.app.workspace.getActiveFile();
    const noteId = activeFile ? activeFile.path : '';

    this.currentSession = {
      id: this.plugin.dataStorage.generateId(),
      startTime: now,
      endTime: 0,
      duration: 0,
      noteId: noteId
    };

    // 更新状态栏
    this.updateStatusBar();

    new Notice(t().notifications.focusStarted);
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
      window.clearInterval(this.inactivityCheckInterval);
    }

    // 每秒检查一次是否不活动
    this.inactivityCheckInterval = window.setInterval(() => {
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
    this.lastActivityTime = Date.now(); // 重置活动时间
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
   * 格式化时长
   * @param duration 时长（毫秒）
   * @returns 格式化的时长字符串
   */
  private formatDuration(duration: number): string {
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 获取当前专注状态
   */
  public getStatus(): { active: boolean; paused: boolean; duration?: number } {
    if (!this.active) {
      return { active: false, paused: false };
    }

    const duration = this.currentSession 
      ? Date.now() - this.currentSession.startTime 
      : 0;
      
    return { 
      active: this.active, 
      paused: this.paused, 
      duration 
    };
  }

  /**
   * 更新状态栏显示
   */
  private updateStatusBar(): void {
    // 由于专注追踪器不直接控制状态栏，这里可以触发插件的状态更新
    // 实际的状态栏更新由番茄钟计时器控制
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
      window.clearInterval(this.inactivityCheckInterval);
      this.inactivityCheckInterval = null;
    }

    // 结束当前会话（如果有）
    if (this.active) {
      this.endSession();
    }
  }
} 