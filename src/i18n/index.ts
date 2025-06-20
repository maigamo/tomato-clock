/**
 * 多语言支持主模块
 */

import { zh } from './zh';
import { en } from './en';
import { ja } from './ja';

// 全局声明Obsidian应用对象
declare global {
  interface Window {
    app: any;
  }
}

export type Locale = 'zh' | 'en' | 'ja';

// 定义所有翻译字符串的类型
export interface Translation {
  // 通用
  plugin: {
    name: string;
    loading: string;
    unloading: string;
  };
  
  // 命令
  commands: {
    startWork: string;
    startShortBreak: string;
    startLongBreak: string;
    pausePomodoro: string;
    resumePomodoro: string;
    stopPomodoro: string;
    skipPomodoro: string;
    resetCycle: string;
    startFocus: string;
    pauseFocus: string;
    resumeFocus: string;
    endFocus: string;
    openStats: string;
  };
  
  // 通知
  notifications: {
    workStarted: string;
    shortBreakStarted: string;
    longBreakStarted: string;
    pomodoroPaused: string;
    pomodoroResumed: string;
    pomodoroStopped: string;
    phaseSkipped: string;
    cycleReset: string;
    workCompleted: string;
    shortBreakCompleted: string;
    longBreakCompleted: string;
    focusStarted: string;
    focusPaused: string;
    focusResumed: string;
    focusEnded: string;
    focusEndedWithDuration: string;
    focusTooShort: string;
    languageChanged: string;
    openSettings: string;
  };
  
  // 状态文本
  statusBar: {
    working: string;
    shortBreak: string;
    longBreak: string;
    paused: string;
    idle: string;
    focusing: string;
    focusPaused: string;
  };
  
  // 设置面板
  settings: {
    // 标题
    pomodoroSettings: string;
    focusSettings: string;
    notificationSettings: string;
    uiSettings: string;
    languageSettings: string;
    
    // 番茄钟设置
    workDuration: string;
    workDurationDesc: string;
    shortBreakDuration: string;
    shortBreakDurationDesc: string;
    longBreakDuration: string;
    longBreakDurationDesc: string;
    longBreakInterval: string;
    longBreakIntervalDesc: string;
    autoStartBreak: string;
    autoStartBreakDesc: string;
    autoStartWork: string;
    autoStartWorkDesc: string;
    
    // 专注模式设置
    focusMode: string;
    focusModeDesc: string;
    inactivityTimeout: string;
    inactivityTimeoutDesc: string;
    minimumFocusDuration: string;
    minimumFocusDurationDesc: string;
    
    // 通知设置
    soundEnabled: string;
    soundEnabledDesc: string;
    notificationEnabled: string;
    notificationEnabledDesc: string;
    
    // UI设置
    showInStatusBar: string;
    showInStatusBarDesc: string;
    
    // 语言设置
    language: string;
    languageDesc: string;
    useSystemLanguage: string;
    useSystemLanguageDesc: string;
  };
  
  // 统计视图
  stats: {
    title: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    thisYear: string;
    total: string;
    workSessions: string;
    workDuration: string;
    focusDuration: string;
    focusMode: string;
    noData: string;
    exportData: string;
    dateRange: string;
    from: string;
    to: string;
    apply: string;
    reset: string;
    howToView: string;
    completed: string;
    totalSessions: string;
    dailyAverage: string;
    date: string;
    startTime: string;
    duration: string;
    type: string;
    note: string;
    work: string;
    shortBreak: string;
    longBreak: string;
    timeDistribution: string;
    sessionTypes: string;
    hours: string;
    minutes: string;
    page: string;
    confirmCleanup: string;
    cleanupComplete: string;
    loading: string;
    loadingError: string;
    largeDataWarning: string;
    totalData: string;
    pomodoroRecords: string;
    focusRecords: string;
  };
}

// 语言映射
const translations: Record<Locale, Translation> = {
  zh,
  en,
  ja
};

// 当前语言
let currentLocale: Locale = 'zh';

/**
 * 设置当前语言
 */
export function setLocale(locale: Locale) {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * 获取翻译
 */
export function t(): Translation {
  return translations[currentLocale];
}

/**
 * 从系统语言自动设置插件语言
 * 使用Obsidian API获取系统语言
 */
export function detectLocale(): Locale {
  try {
    // 尝试使用Obsidian API获取语言设置
    if (window.app && window.app.i18n) {
      const obsidianLang = window.app.i18n.getLanguage().toLowerCase();
      
      // 匹配语言
      if (obsidianLang.startsWith('zh')) {
        return 'zh';
      } else if (obsidianLang.startsWith('ja')) {
        return 'ja';
      }
    }
  } catch (e) {
    // 忽略错误，使用浏览器语言作为备选
    console.error('无法获取Obsidian语言设置，使用浏览器语言作为备选', e);
  }
  
  // 获取浏览器语言作为备选
  const systemLang = window.navigator.language.toLowerCase();
  
  // 匹配语言
  if (systemLang.startsWith('zh')) {
    return 'zh';
  } else if (systemLang.startsWith('ja')) {
    return 'ja';
  }
  
  // 默认使用英文
  return 'en';
} 