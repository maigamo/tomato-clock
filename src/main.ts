import { App, Plugin, PluginSettingTab, Setting, Notice, WorkspaceLeaf, DropdownComponent, setIcon } from 'obsidian';
import { TomatoClockSettings, DEFAULT_SETTINGS } from './settings';
import { StatusBar } from './ui/status-bar';
import { DataStorage } from './data/storage';
import { PomodoroTimer } from './timer/pomodoro-timer';
import { FocusTracker } from './tracker/focus-tracker';
import { StatsView, STATS_VIEW_TYPE } from './ui/views/stats-view';
import { t, setLocale, detectLocale, Locale } from './i18n';

export default class TomatoClockPlugin extends Plugin {
  settings: TomatoClockSettings;
  statusBar: StatusBar;
  dataStorage: DataStorage;
  pomodoroTimer: PomodoroTimer;
  focusTracker: FocusTracker;

  async onload() {
    // 加载设置
    await this.loadSettings();
    
    // 初始化语言
    this.initializeLanguage();
    
    // 初始化数据存储
    this.dataStorage = new DataStorage(this);
    await this.dataStorage.init();
    
    // 初始化番茄钟计时器
    this.pomodoroTimer = new PomodoroTimer(this);
    
    // 初始化专注追踪器
    this.focusTracker = new FocusTracker(this);
    this.focusTracker.init();
    
    // 添加设置选项卡
    this.addSettingTab(new TomatoClockSettingTab(this.app, this));
    
    // 初始化状态栏
    this.statusBar = new StatusBar(this);
    this.statusBar.init();
    
    // 注册视图
    this.registerView(
      STATS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new StatsView(leaf, this)
    );
    
    // 注册命令
    this.registerCommands();
  }

  onunload() {
    // 确保计时器被清理
    if (this.pomodoroTimer) {
      this.pomodoroTimer.stop();
    }
    
    // 清理专注追踪器
    if (this.focusTracker) {
      this.focusTracker.dispose();
    }
    
    this.statusBar.dispose();
  }

  // 初始化语言设置
  private initializeLanguage() {
    // 如果语言为空或未定义，则自动检测系统语言
    if (!this.settings.language) {
      this.settings.language = detectLocale();
    }
    
    // 设置当前语言
    setLocale(this.settings.language);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateStatsView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    
    // 检查现有叶子中是否已经有统计视图
    const leaves = workspace.getLeavesOfType(STATS_VIEW_TYPE);
    
    if (leaves.length > 0) {
      // 如果已经存在，激活它
      leaf = leaves[0];
    } else {
      // 如果不存在，创建一个新的
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: STATS_VIEW_TYPE,
          active: true
        });
      }
    }
    
    // 显示叶子
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  private registerCommands() {
    // 番茄钟命令
    this.addCommand({
      id: 'start-pomodoro-work',
      name: t().commands.startWork,
      callback: () => {
        this.pomodoroTimer.start('work');
        new Notice(t().notifications.workStarted);
      }
    });

    this.addCommand({
      id: 'start-pomodoro-short-break',
      name: t().commands.startShortBreak,
      callback: () => {
        this.pomodoroTimer.start('shortBreak');
        new Notice(t().notifications.shortBreakStarted);
      }
    });

    this.addCommand({
      id: 'start-pomodoro-long-break',
      name: t().commands.startLongBreak,
      callback: () => {
        this.pomodoroTimer.start('longBreak');
        new Notice(t().notifications.longBreakStarted);
      }
    });

    this.addCommand({
      id: 'pause-pomodoro',
      name: t().commands.pausePomodoro,
      callback: () => {
        this.pomodoroTimer.pause();
        new Notice(t().notifications.pomodoroPaused);
      }
    });

    this.addCommand({
      id: 'resume-pomodoro',
      name: t().commands.resumePomodoro,
      callback: () => {
        this.pomodoroTimer.resume();
        new Notice(t().notifications.pomodoroResumed);
      }
    });

    this.addCommand({
      id: 'stop-pomodoro',
      name: t().commands.stopPomodoro,
      callback: () => {
        this.pomodoroTimer.stop();
        new Notice(t().notifications.pomodoroStopped);
      }
    });

    this.addCommand({
      id: 'skip-pomodoro',
      name: t().commands.skipPomodoro,
      callback: () => {
        this.pomodoroTimer.skip();
        new Notice(t().notifications.phaseSkipped);
      }
    });

    this.addCommand({
      id: 'reset-pomodoro-cycle',
      name: t().commands.resetCycle,
      callback: () => {
        this.pomodoroTimer.resetCycle();
        new Notice(t().notifications.cycleReset);
      }
    });

    // 专注模式命令
    this.addCommand({
      id: 'start-focus-session',
      name: t().commands.startFocus,
      callback: () => {
        this.focusTracker.startSession();
      }
    });

    this.addCommand({
      id: 'pause-focus-session',
      name: t().commands.pauseFocus,
      callback: () => {
        this.focusTracker.pauseSession();
      }
    });

    this.addCommand({
      id: 'resume-focus-session',
      name: t().commands.resumeFocus,
      callback: () => {
        this.focusTracker.resumeSession();
      }
    });

    this.addCommand({
      id: 'end-focus-session',
      name: t().commands.endFocus,
      callback: () => {
        this.focusTracker.endSession();
      }
    });
    
    // 统计视图命令
    this.addCommand({
      id: 'open-tomato-stats',
      name: t().commands.openStats,
      callback: () => {
        this.activateStatsView();
      }
    });
  }
}

class TomatoClockSettingTab extends PluginSettingTab {
  plugin: TomatoClockPlugin;

  constructor(app: App, plugin: TomatoClockPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('tomato-clock-settings');

    // 番茄钟设置标题
    new Setting(containerEl)
      .setName(t().settings.pomodoroSettings)
      .setHeading()
      .setClass('tomato-clock-setting-header');
    
    // 番茄钟工作时长设置
    new Setting(containerEl)
      .setName(t().settings.workDuration)
      .setDesc(t().settings.workDurationDesc)
      .addSlider(slider => slider
        .setLimits(1, 120, 1)
        .setValue(this.plugin.settings.workDuration)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.workDuration = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'timer');
        setIcon(span, 'timer');
      });
    
    // 短休息时长设置
    new Setting(containerEl)
      .setName(t().settings.shortBreakDuration)
      .setDesc(t().settings.shortBreakDurationDesc)
      .addSlider(slider => slider
        .setLimits(1, 30, 1)
        .setValue(this.plugin.settings.shortBreakDuration)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.shortBreakDuration = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'coffee');
        setIcon(span, 'coffee');
      });
    
    // 长休息时长设置
    new Setting(containerEl)
      .setName(t().settings.longBreakDuration)
      .setDesc(t().settings.longBreakDurationDesc)
      .addSlider(slider => slider
        .setLimits(1, 60, 1)
        .setValue(this.plugin.settings.longBreakDuration)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.longBreakDuration = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'couch');
        setIcon(span, 'couch');
      });
    
    // 长休息间隔设置
    new Setting(containerEl)
      .setName(t().settings.longBreakInterval)
      .setDesc(t().settings.longBreakIntervalDesc)
      .addSlider(slider => slider
        .setLimits(1, 10, 1)
        .setValue(this.plugin.settings.longBreakInterval)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.longBreakInterval = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'repeat');
        setIcon(span, 'repeat');
      });
    
    // 自动开始休息设置
    new Setting(containerEl)
      .setName(t().settings.autoStartBreak)
      .setDesc(t().settings.autoStartBreakDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoStartBreak)
        .onChange(async (value) => {
          this.plugin.settings.autoStartBreak = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'play-circle');
        setIcon(span, 'play-circle');
      });
    
    // 自动开始工作设置
    new Setting(containerEl)
      .setName(t().settings.autoStartWork)
      .setDesc(t().settings.autoStartWorkDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoStartWork)
        .onChange(async (value) => {
          this.plugin.settings.autoStartWork = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'rotate-ccw');
        setIcon(span, 'rotate-ccw');
      });

    // 专注模式设置标题
    new Setting(containerEl)
      .setName(t().settings.focusSettings)
      .setHeading()
      .setClass('tomato-clock-setting-header');
    
    // 启用专注模式设置
    new Setting(containerEl)
      .setName(t().settings.focusMode)
      .setDesc(t().settings.focusModeDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.focusMode)
        .onChange(async (value) => {
          this.plugin.settings.focusMode = value;
          await this.plugin.saveSettings();
          // 重新初始化专注追踪器
          this.plugin.focusTracker.dispose();
          this.plugin.focusTracker.init();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'eye');
        setIcon(span, 'eye');
      });

    // 不活动超时设置
    new Setting(containerEl)
      .setName(t().settings.inactivityTimeout)
      .setDesc(t().settings.inactivityTimeoutDesc)
      .addSlider(slider => slider
        .setLimits(15, 300, 5)
        .setValue(this.plugin.settings.inactivityTimeout)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.inactivityTimeout = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'hourglass');
        setIcon(span, 'hourglass');
      });

    // 最短专注时长设置
    new Setting(containerEl)
      .setName(t().settings.minimumFocusDuration)
      .setDesc(t().settings.minimumFocusDurationDesc)
      .addSlider(slider => slider
        .setLimits(15, 300, 5)
        .setValue(this.plugin.settings.minimumFocusDuration)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.minimumFocusDuration = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'stopwatch');
        setIcon(span, 'stopwatch');
      });
    
    // 通知设置标题
    new Setting(containerEl)
      .setName(t().settings.notificationSettings)
      .setHeading()
      .setClass('tomato-clock-setting-header');
    
    // 声音通知设置
    new Setting(containerEl)
      .setName(t().settings.soundEnabled)
      .setDesc(t().settings.soundEnabledDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.soundEnabled)
        .onChange(async (value) => {
          this.plugin.settings.soundEnabled = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'volume-2');
        setIcon(span, 'volume-2');
      });
    
    // 系统通知设置
    new Setting(containerEl)
      .setName(t().settings.notificationEnabled)
      .setDesc(t().settings.notificationEnabledDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.notificationEnabled)
        .onChange(async (value) => {
          this.plugin.settings.notificationEnabled = value;
          await this.plugin.saveSettings();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'message-square');
        setIcon(span, 'message-square');
      });
    
    // UI设置标题
    new Setting(containerEl)
      .setName(t().settings.uiSettings)
      .setHeading()
      .setClass('tomato-clock-setting-header');
    
    // 状态栏显示设置
    new Setting(containerEl)
      .setName(t().settings.showInStatusBar)
      .setDesc(t().settings.showInStatusBarDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showInStatusBar)
        .onChange(async (value) => {
          this.plugin.settings.showInStatusBar = value;
          await this.plugin.saveSettings();
          // 重新加载状态栏
          this.plugin.statusBar.dispose();
          this.plugin.statusBar.init();
        }))
      .setClass('tomato-clock-setting-item')
      .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
        span.setAttribute('data-icon', 'bar-chart-horizontal');
        setIcon(span, 'bar-chart-horizontal');
      });
        
    // 语言设置标题
    new Setting(containerEl)
      .setName(t().settings.languageSettings || '语言')
      .setHeading()
      .setClass('tomato-clock-setting-header');
    
      // 语言选择
      new Setting(containerEl)
        .setName(t().settings.language || '插件语言')
        .setDesc(t().settings.languageDesc || '选择插件界面的显示语言')
        .addDropdown(dropdown => {
          dropdown
            .addOption('zh', '中文')
            .addOption('en', 'English')
            .addOption('ja', '日本語')
            .setValue(this.plugin.settings.language)
            .onChange(async (value: Locale) => {
              this.plugin.settings.language = value;
              setLocale(value);
              
              // 更新UI元素
              this.updateSettingsUI();
              this.plugin.statusBar.updateUI();
              
              await this.plugin.saveSettings();
              // 提示需要重新加载
              new Notice(t().notifications.languageChanged || '语言设置已更改，请重新启动Obsidian以完全应用更改');
              // 刷新设置界面
              this.display();
            });
        })
        .setClass('tomato-clock-setting-item')
        .nameEl.createSpan({ cls: 'tomato-clock-setting-icon' }, (span) => {
          span.setAttribute('data-icon', 'flag');
          setIcon(span, 'flag');
        });
  }
  
  /**
   * 更新设置界面的UI文本
   * 当语言改变时调用此方法
   */
  private updateSettingsUI(): void {
    const { containerEl } = this;
    
    // 更新所有标题
    const settingHeaders = containerEl.querySelectorAll('.setting-item-heading .setting-item-name');
    settingHeaders.forEach(header => {
      const text = header.textContent;
      if (text === t().settings.pomodoroSettings || 
          text?.includes('Pomodoro') || 
          text?.includes('番茄')) {
        header.textContent = t().settings.pomodoroSettings;
      } else if (text === t().settings.focusSettings || 
                text?.includes('Focus') || 
                text?.includes('专注')) {
        header.textContent = t().settings.focusSettings;
      } else if (text === t().settings.notificationSettings || 
                text?.includes('Notification') || 
                text?.includes('通知')) {
        header.textContent = t().settings.notificationSettings;
      } else if (text === t().settings.uiSettings || 
                text?.includes('UI')) {
        header.textContent = t().settings.uiSettings;
      } else if (text === t().settings.languageSettings || 
                text?.includes('Language') || 
                text?.includes('语言')) {
        header.textContent = t().settings.languageSettings;
    }
    });
  }
} 