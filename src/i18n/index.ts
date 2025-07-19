/**
 * 多语言支持主模块
 */

import { App } from 'obsidian';
import { zh } from './zh';
import { en } from './en';
import { ja } from './ja';

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
    
    // 语言设置（已弃用，但保留用于兼容性）
    language: string;
    languageDesc: string;
    useSystemLanguage: string;
    useSystemLanguageDesc: string;
  };
  
  // 统计面板
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
let currentLocale: Locale = 'en';

/**
 * 初始化语言系统
 * @param app Obsidian App实例（保留参数用于兼容性）
 */
export function initializeLanguage(app: App) {
  // 使用localStorage获取Obsidian的语言设置
  const obsidianLanguage = getObsidianLanguage();
  currentLocale = mapObsidianLanguageToLocale(obsidianLanguage);
}

/**
 * 获取Obsidian的语言设置
 */
function getObsidianLanguage(): string {
  // 从localStorage获取语言设置
  const lang = window.localStorage.getItem('language');
  // 如果为null，则默认为英文
  return lang || 'en';
}

/**
 * 将Obsidian的语言代码映射到插件的语言代码
 */
function mapObsidianLanguageToLocale(obsidianLang: string): Locale {
  // Obsidian的语言代码映射
  if (obsidianLang.startsWith('zh')) {
    return 'zh';
  } else if (obsidianLang.startsWith('ja')) {
    return 'ja';
  } else {
    // 默认使用英文
    return 'en';
  }
}

/**
 * 设置当前语言（已弃用，保留用于向后兼容）
 * @deprecated 使用Obsidian的语言设置
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
  // 始终从Obsidian获取最新的语言设置
  const obsidianLanguage = getObsidianLanguage();
  currentLocale = mapObsidianLanguageToLocale(obsidianLanguage);
  return currentLocale;
}

/**
 * 获取翻译
 */
export function t(): Translation {
  // 确保使用最新的语言设置
  const obsidianLanguage = getObsidianLanguage();
  currentLocale = mapObsidianLanguageToLocale(obsidianLanguage);
  return translations[currentLocale];
}

/**
 * 从系统语言自动设置插件语言（已弃用）
 * @deprecated 使用Obsidian的语言设置
 */
export function detectLocale(): Locale {
  // 获取系统语言
  const systemLang = window.navigator.language.toLowerCase();
  
  // 简单匹配语言
  if (systemLang.startsWith('zh')) {
    return 'zh';
  } else if (systemLang.startsWith('ja')) {
    return 'ja';
  } else {
    // 默认使用英文
    return 'en';
  }
} 