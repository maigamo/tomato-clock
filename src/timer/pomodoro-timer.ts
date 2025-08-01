import { Notice } from 'obsidian';
import TomatoClockPlugin from '../main';
import { PomodoroSession } from '../data/storage';
import { t } from '../i18n';

export type TimerState = 'idle' | 'work' | 'shortBreak' | 'longBreak' | 'paused';
export type TimerType = 'work' | 'shortBreak' | 'longBreak';

// 添加WebKit AudioContext类型声明
interface WebKitWindow extends Window {
  webkitAudioContext: typeof AudioContext;
}

/**
 * 番茄钟计时器类
 */
export class PomodoroTimer {
  private plugin: TomatoClockPlugin;
  private state: TimerState = 'idle';
  private currentSession: PomodoroSession | null = null;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private pausedDuration: number = 0;
  private timerInterval: number | null = null;
  private endTime: number = 0;
  private completedWorkSessions: number = 0;

  constructor(plugin: TomatoClockPlugin) {
    this.plugin = plugin;
  }

  /**
   * 获取当前状态
   */
  public getState(): TimerState {
    return this.state;
  }

  /**
   * 获取剩余时间（毫秒）
   */
  public getRemainingTime(): number {
    if (this.state === 'idle') return 0;
    if (this.state === 'paused') {
      return this.endTime - this.startTime - this.pausedDuration;
    }
    return Math.max(0, this.endTime - Date.now());
  }

  /**
   * 获取格式化的剩余时间
   */
  public getFormattedTime(): string {
    const remainingMs = this.getRemainingTime();
    const minutes = Math.floor(remainingMs / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 获取当前会话类型的时长（分钟）
   */
  private getDurationForType(type: TimerType): number {
    switch (type) {
      case 'work':
        return this.plugin.settings.workDuration;
      case 'shortBreak':
        return this.plugin.settings.shortBreakDuration;
      case 'longBreak':
        return this.plugin.settings.longBreakDuration;
    }
  }

  /**
   * 开始计时
   */
  public start(type: TimerType = 'work'): void {
    // 如果已经在计时，先停止
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const now = Date.now();
    const durationMinutes = this.getDurationForType(type);
    const durationMs = durationMinutes * 60 * 1000;

    this.state = type;
    this.startTime = now;
    this.endTime = now + durationMs;
    this.pausedDuration = 0;

    // 创建新会话
    this.currentSession = {
      id: this.plugin.dataStorage.generateId(),
      startTime: now,
      endTime: this.endTime,
      duration: durationMs,
      type: type,
      completed: false
    };

    // 更新状态栏
    this.updateStatusBar();

    // 设置计时器
    this.timerInterval = window.setInterval(() => this.tick(), 1000);
  }

  /**
   * 暂停计时
   */
  public pause(): void {
    if (this.state === 'work' || this.state === 'shortBreak' || this.state === 'longBreak') {
      // 保存当前状态，用于恢复
      const currentType = this.state;
      
      // 记录暂停开始时间和暂停时的剩余时间
      this.pauseStartTime = Date.now();
      const remainingTime = this.endTime - Date.now();
      
      // 更改状态为暂停
      this.state = 'paused';
      
      // 清除定时器
      if (this.timerInterval) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // 更新状态栏 - 显示暂停状态和剩余时间
      this.updateStatusBar();
    }
  }

  /**
   * 继续计时
   */
  public resume(): void {
    if (this.state === 'paused') {
      // 计算暂停的时长
      const pauseDuration = Date.now() - this.pauseStartTime;
      this.pausedDuration += pauseDuration;
      
      // 更新结束时间，考虑暂停时长
      this.endTime += pauseDuration;
      
      // 恢复原来的状态
      if (this.currentSession) {
        this.state = this.currentSession.type;
      } else {
        this.state = 'work';
      }
      
      // 设置计时器
      this.timerInterval = window.setInterval(() => this.tick(), 1000);
      
      // 更新状态栏
      this.updateStatusBar();
    }
  }

  /**
   * 停止计时
   */
  public stop(): void {
    // 清除定时器
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // 重置状态
    this.state = 'idle';
    this.currentSession = null;
    this.updateStatusBar();
  }

  /**
   * 跳过当前阶段
   */
  public skip(): void {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // 直接触发完成逻辑
    this.handleCompletion();
  }

  /**
   * 重置番茄钟循环
   */
  public resetCycle(): void {
    this.stop();
    this.completedWorkSessions = 0;
  }

  /**
   * 计时器滴答
   */
  private tick(): void {
    // 更新状态栏
    this.updateStatusBar();
    
    // 检查是否结束
    if (Date.now() >= this.endTime) {
      // 清除定时器
      if (this.timerInterval) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // 处理完成逻辑
      this.handleCompletion();
    }
  }

  /**
   * 处理完成逻辑
   */
  private handleCompletion(): void {
    if (!this.currentSession) return;
    
    // 播放声音和显示通知
    this.playSound();
    this.showNotification();
    
    // 记录会话
    this.currentSession.completed = true;
    this.currentSession.endTime = Date.now();
    
    // 如果是工作时段，增加计数
    if (this.currentSession.type === 'work') {
      this.plugin.dataStorage.addPomodoroSession(this.currentSession);
      this.completedWorkSessions++;
    }
    
    // 确定下一个阶段
    this.determineNextPhase();
  }

  /**
   * 确定下一个阶段
   */
  private determineNextPhase(): void {
    const { autoStartBreak, autoStartWork, longBreakInterval } = this.plugin.settings;
    
    // 根据当前状态确定下一个状态
    if (this.state === 'work') {
      // 检查是否需要长休息
      if (this.completedWorkSessions % longBreakInterval === 0) {
        if (autoStartBreak) {
          this.start('longBreak');
        } else {
          this.state = 'idle';
          this.updateStatusBar();
        }
      } else {
        if (autoStartBreak) {
          this.start('shortBreak');
        } else {
          this.state = 'idle';
          this.updateStatusBar();
        }
      }
    } else if (this.state === 'shortBreak' || this.state === 'longBreak') {
      if (autoStartWork) {
        this.start('work');
      } else {
        this.state = 'idle';
        this.updateStatusBar();
      }
    }
  }

  /**
   * 播放声音
   */
  private playSound(): void {
    if (!this.plugin.settings.soundEnabled) return;
    
    try {
      // 使用更明确的类型转换
      const AudioContextClass = window.AudioContext || 
        (('webkitAudioContext' in window) ? (window as unknown as WebKitWindow).webkitAudioContext : null);
      
      if (!AudioContextClass) {
        console.error('AudioContext 不可用');
        return;
      }
      
      const audioContext = new AudioContextClass();
      
      // 创建振荡器
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 设置音量
      gainNode.gain.value = this.plugin.settings.soundVolume;
      
      // 设置音色（根据当前状态）
      if (this.state === 'work') {
        // 工作结束：较高音调
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
      } else {
        // 休息结束：较低音调
        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
      }
      
      // 播放声音
      oscillator.start();
      
      // 0.5秒后停止
      setTimeout(() => {
        oscillator.stop();
        // 释放资源
        oscillator.disconnect();
        gainNode.disconnect();
      }, 500);
    } catch (error) {
      console.error('播放声音失败:', error);
    }
  }

  /**
   * 显示通知
   */
  private showNotification(): void {
    if (!this.plugin.settings.notificationEnabled) return;
    
    let message = '';
    switch (this.state) {
      case 'work':
        message = t().notifications.workCompleted;
        break;
      case 'shortBreak':
        message = t().notifications.shortBreakCompleted;
        break;
      case 'longBreak':
        message = t().notifications.longBreakCompleted;
        break;
    }
    
    if (message) {
      new Notice(message, 5000);
    }
  }

  /**
   * 更新状态栏显示
   */
  private updateStatusBar(): void {
    const { statusBar } = this.plugin;
    if (!statusBar) return;
    
    let statusText: string;
    
    switch (this.state) {
      case 'work':
        statusText = t().statusBar.working;
        break;
      case 'shortBreak':
        statusText = t().statusBar.shortBreak;
        break;
      case 'longBreak':
        statusText = t().statusBar.longBreak;
        break;
      case 'paused':
        statusText = t().statusBar.paused;
        break;
      default:
        statusText = t().statusBar.idle;
        break;
    }
    
    // 当正在计时或暂停时，添加时间信息
    if (this.state !== 'idle') {
      statusBar.updateStatusText(statusText, this.getFormattedTime());
    } else {
      statusBar.updateStatusText(statusText);
    }
  }
} 