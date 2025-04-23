/**
 * 番茄钟插件设置
 */
import { Locale } from './i18n';

export interface TomatoClockSettings {
  // 番茄钟设置
  workDuration: number;         // 工作时段时长（分钟）
  shortBreakDuration: number;   // 短休息时长（分钟）
  longBreakDuration: number;    // 长休息时长（分钟）
  longBreakInterval: number;    // 长休息间隔（完成多少个工作时段后触发）
  autoStartBreak: boolean;      // 工作时段结束后自动开始休息
  autoStartWork: boolean;       // 休息结束后自动开始工作

  // 专注模式设置
  focusMode: boolean;           // 是否启用专注模式
  inactivityTimeout: number;    // 不活动超时（秒）
  minimumFocusDuration: number; // 最短专注时长（秒）

  // 通知设置
  soundEnabled: boolean;        // 是否启用声音
  soundVolume: number;          // 声音音量（0-1）
  soundFile: string;            // 声音文件
  notificationEnabled: boolean; // 是否启用系统通知

  // UI设置
  showInStatusBar: boolean;     // 是否在状态栏显示
  
  // 语言设置
  language: Locale;             // 插件语言
  useSystemLanguage: boolean;   // 是否使用系统语言
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: TomatoClockSettings = {
  // 番茄钟设置
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartWork: false,

  // 专注模式设置
  focusMode: false,
  inactivityTimeout: 120,
  minimumFocusDuration: 60,

  // 通知设置
  soundEnabled: true,
  soundVolume: 0.6,
  soundFile: 'bell',
  notificationEnabled: true,

  // UI设置
  showInStatusBar: true,
  
  // 语言设置
  language: 'zh',
  useSystemLanguage: true,
} 