import { Translation } from './index';

/**
 * 中文翻译
 */
export const zh: Translation = {
  plugin: {
    name: '番茄钟',
    loading: '加载番茄钟插件',
    unloading: '卸载番茄钟插件'
  },
  
  commands: {
    startWork: '开始番茄钟工作时段',
    startShortBreak: '开始短休息',
    startLongBreak: '开始长休息',
    pausePomodoro: '暂停番茄钟',
    resumePomodoro: '继续番茄钟',
    stopPomodoro: '停止番茄钟',
    skipPomodoro: '跳过当前番茄钟时段',
    resetCycle: '重置番茄钟循环',
    startFocus: '开始专注会话',
    pauseFocus: '暂停专注会话',
    resumeFocus: '继续专注会话',
    endFocus: '结束专注会话',
    openStats: '打开番茄钟统计'
  },
  
  notifications: {
    workStarted: '番茄钟工作时段已开始',
    shortBreakStarted: '短休息已开始',
    longBreakStarted: '长休息已开始',
    pomodoroPaused: '番茄钟已暂停',
    pomodoroResumed: '番茄钟已继续',
    pomodoroStopped: '番茄钟已停止',
    phaseSkipped: '已跳过当前时段',
    cycleReset: '番茄钟循环已重置',
    workCompleted: '工作时段完成。可以开始短休息了！',
    shortBreakCompleted: '休息时段完成。可以开始下一个工作时段了！',
    longBreakCompleted: '长休息完成。可以开始新的工作循环了！',
    focusStarted: '专注模式已开始',
    focusPaused: '专注模式已暂停',
    focusResumed: '专注模式已继续',
    focusEnded: '专注会话已结束',
    focusEndedWithDuration: '专注会话已结束，持续了 {duration}',
    focusTooShort: '专注会话太短（{duration}），未记录',
    languageChanged: '语言设置已更改，请重新启动Obsidian以完全应用更改',
    openSettings: '请通过命令面板(Ctrl/Cmd+P)搜索"番茄钟设置"打开设置'
  },
  
  statusBar: {
    working: '工作中',
    shortBreak: '短休息',
    longBreak: '长休息',
    paused: '已暂停',
    idle: '空闲',
    focusing: '专注中',
    focusPaused: '专注已暂停'
  },
  
  settings: {
    pomodoroSettings: '番茄钟设置',
    focusSettings: '专注模式设置',
    notificationSettings: '通知设置',
    uiSettings: 'UI设置',
    languageSettings: '语言设置',
    
    workDuration: '工作时长（分钟）',
    workDurationDesc: '番茄钟工作时段的时长',
    shortBreakDuration: '短休息时长（分钟）',
    shortBreakDurationDesc: '完成一个工作时段后的休息时长',
    longBreakDuration: '长休息时长（分钟）',
    longBreakDurationDesc: '完成多个工作时段后的长休息时长',
    longBreakInterval: '长休息间隔',
    longBreakIntervalDesc: '完成多少个工作时段后触发一次长休息',
    autoStartBreak: '自动开始休息',
    autoStartBreakDesc: '工作时段结束后自动开始休息',
    autoStartWork: '自动开始工作',
    autoStartWorkDesc: '休息结束后自动开始下一个工作时段',
    
    focusMode: '启用专注模式',
    focusModeDesc: '自动追踪您在Obsidian中的活动时间',
    inactivityTimeout: '不活动超时（秒）',
    inactivityTimeoutDesc: '多长时间没有活动后结束专注会话',
    minimumFocusDuration: '最短专注时长（秒）',
    minimumFocusDurationDesc: '只记录超过此时长的专注会话',
    
    soundEnabled: '启用声音',
    soundEnabledDesc: '时段结束时播放声音提醒',
    notificationEnabled: '启用系统通知',
    notificationEnabledDesc: '时段结束时显示系统通知',
    
    showInStatusBar: '在状态栏显示',
    showInStatusBarDesc: '在Obsidian状态栏显示番茄钟状态',
    
    language: '插件语言',
    languageDesc: '选择插件界面的显示语言',
    useSystemLanguage: '使用系统语言',
    useSystemLanguageDesc: '自动根据系统语言设置插件界面语言'
  },
  
  stats: {
    title: '番茄钟统计',
    today: '今天',
    yesterday: '昨天',
    thisWeek: '过去7天',
    thisMonth: '过去30天',
    thisYear: '今年',
    total: '总计',
    workSessions: '工作会话',
    workDuration: '工作时长',
    focusDuration: '专注时长',
    focusMode: '专注模式统计',
    noData: '在选定的时间范围内没有记录。',
    exportData: '导出数据',
    dateRange: '时间范围',
    from: '开始日期',
    to: '结束日期',
    apply: '应用',
    reset: '重置',
    howToView: '提示：点击左侧标签查看详细信息',
    completed: '已完成',
    totalSessions: '总会话',
    dailyAverage: '日均专注',
    date: '日期',
    startTime: '开始时间',
    duration: '时长',
    type: '类型',
    note: '笔记',
    work: '工作',
    shortBreak: '短休息',
    longBreak: '长休息',
    timeDistribution: '时段分布',
    sessionTypes: '番茄钟类型分布',
    hours: '小时',
    minutes: '分钟',
    page: '页码',
    confirmCleanup: '确定要清理超过12个月的旧数据吗？',
    cleanupComplete: '数据清理完成',
    loading: '加载中...',
    loadingError: '加载数据时出错',
    largeDataWarning: '大量数据可能导致性能问题，建议缩小日期范围。',
    totalData: '总数据',
    pomodoroRecords: '番茄钟记录',
    focusRecords: '专注记录'
  }
}; 