import { setIcon, Menu, Notice } from 'obsidian';
import TomatoClockPlugin from '../main';
import { t } from '../i18n';

export class StatusBar {
  private statusBarEl: HTMLElement;
  private iconEl: HTMLElement;
  private textEl: HTMLElement;
  private plugin: TomatoClockPlugin;

  constructor(plugin: TomatoClockPlugin) {
    this.plugin = plugin;
  }

  public init(): void {
    // 只有在设置中启用了状态栏显示时才创建
    if (!this.plugin.settings.showInStatusBar) {
      return;
    }

    // 创建状态栏元素
    this.statusBarEl = this.plugin.addStatusBarItem();
    this.statusBarEl.addClass('tomato-clock-status');
    
    // 添加点击事件
    this.statusBarEl.addEventListener('click', this.handleStatusBarClick.bind(this));
    
    // 创建图标元素
    this.iconEl = this.statusBarEl.createDiv({ cls: 'tomato-clock-status-icon' });
    setIcon(this.iconEl, 'clock');
    this.iconEl.addClass('tomato-clock-icon');
    
    // 创建文本元素
    this.textEl = this.statusBarEl.createDiv({ cls: 'tomato-clock-status-text' });
    this.updateStatusText(t().statusBar.idle);
  }

  /**
   * 更新状态栏文本
   * @param status 状态文�?
   * @param time 可选的时间文本
   */
  public updateStatusText(status: string, time?: string): void {
    if (!this.textEl) return;
    
    let text = status;
    if (time) {
      text += ` ${time}`;
    }
    
    this.textEl.setText(text);
  }

  /**
   * 更新状态栏UI
   * 当语言改变时调用，确保状态栏文本使用新语言
   */
  public updateUI(): void {
    if (!this.textEl) return;
    
    const timerState = this.plugin.pomodoroTimer.getState();
    let statusText: string;
    
    switch (timerState) {
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
    
    // 当正在计时时，添加时间信�?
    if (timerState !== 'idle') {
      this.updateStatusText(statusText, this.plugin.pomodoroTimer.getFormattedTime());
    } else {
      this.updateStatusText(statusText);
    }
  }

  /**
   * 更新状态栏图标
   * @param iconName 图标名称
   */
  public updateIcon(iconName: string): void {
    if (!this.iconEl) return;
    setIcon(this.iconEl, iconName);
  }

  /**
   * 处理状态栏点击事件
   * @param event 点击事件
   */
  private handleStatusBarClick(event: MouseEvent): void {
    const menu = new Menu();
    const timerState = this.plugin.pomodoroTimer.getState();
    
    // 根据当前计时器状态动态添加菜单项
    if (timerState === 'idle') {
      // 空闲状�?
      menu.addItem(item => {
        item
          .setTitle(t().commands.startWork)
          .setIcon('play')
          .onClick(() => {
            this.plugin.pomodoroTimer.start('work');
          });
      });
      
      menu.addItem(item => {
        item
          .setTitle(t().commands.startShortBreak)
          .setIcon('coffee')
          .onClick(() => {
            this.plugin.pomodoroTimer.start('shortBreak');
          });
      });
      
      menu.addItem(item => {
        item
          .setTitle(t().commands.startLongBreak)
          .setIcon('coffee')
          .onClick(() => {
            this.plugin.pomodoroTimer.start('longBreak');
          });
      });
    } else if (timerState === 'paused') {
      // 暂停状�?
      menu.addItem(item => {
        item
          .setTitle(t().commands.resumePomodoro)
          .setIcon('play')
          .onClick(() => {
            this.plugin.pomodoroTimer.resume();
          });
      });
      
      menu.addItem(item => {
        item
          .setTitle(t().commands.stopPomodoro)
          .setIcon('square')
          .onClick(() => {
            this.plugin.pomodoroTimer.stop();
          });
      });
    } else {
      // 计时中状�?
      menu.addItem(item => {
        item
          .setTitle(t().commands.pausePomodoro)
          .setIcon('pause')
          .onClick(() => {
            this.plugin.pomodoroTimer.pause();
          });
      });
      
      menu.addItem(item => {
        item
          .setTitle(t().commands.stopPomodoro)
          .setIcon('square')
          .onClick(() => {
            this.plugin.pomodoroTimer.stop();
          });
      });
      
      menu.addItem(item => {
        item
          .setTitle(t().commands.skipPomodoro)
          .setIcon('fast-forward')
          .onClick(() => {
            this.plugin.pomodoroTimer.skip();
          });
      });
    }
    
    // 通用菜单�?
    menu.addSeparator();
    
    menu.addItem(item => {
      item
        .setTitle(t().commands.resetCycle)
        .setIcon('refresh-cw')
        .onClick(() => {
          this.plugin.pomodoroTimer.resetCycle();
        });
    });
    
    menu.addItem(item => {
      item
        .setTitle(t().commands.openStats)
        .setIcon('bar-chart-2')
        .onClick(() => {
          this.plugin.activateStatsView();
        });
    });
    
    menu.addItem(item => {
      item
        .setTitle('设置')
        .setIcon('settings')
        .onClick(() => {
          // 显示通知提醒用户使用命令面板打开设置
          new Notice(t().notifications.openSettings || '请通过命令面板(Ctrl/Cmd+P)搜索"番茄钟设�?打开设置');
        });
    });
    
    // 显示菜单
    menu.showAtMouseEvent(event);
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (!this.statusBarEl) return;
    
    this.statusBarEl.removeEventListener('click', this.handleStatusBarClick.bind(this));
    this.statusBarEl.remove();
  }
} 
