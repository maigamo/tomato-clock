import { Translation } from './index';

/**
 * English translation
 */
export const en: Translation = {
  plugin: {
    name: 'Tomato Clock',
    loading: 'Loading Tomato Clock plugin',
    unloading: 'Unloading Tomato Clock plugin'
  },
  
  commands: {
    startWork: 'Start Pomodoro Work',
    startShortBreak: 'Start Short Break',
    startLongBreak: 'Start Long Break',
    pausePomodoro: 'Pause Pomodoro',
    resumePomodoro: 'Resume Pomodoro',
    stopPomodoro: 'Stop Pomodoro',
    skipPomodoro: 'Skip Current Pomodoro Phase',
    resetCycle: 'Reset Pomodoro Cycle',
    startFocus: 'Start Focus Session',
    pauseFocus: 'Pause Focus Session',
    resumeFocus: 'Resume Focus Session',
    endFocus: 'End Focus Session',
    openStats: 'Open Tomato Clock Statistics'
  },
  
  notifications: {
    workStarted: 'Pomodoro work session started',
    shortBreakStarted: 'Short break started',
    longBreakStarted: 'Long break started',
    pomodoroPaused: 'Pomodoro paused',
    pomodoroResumed: 'Pomodoro resumed',
    pomodoroStopped: 'Pomodoro stopped',
    phaseSkipped: 'Current phase skipped',
    cycleReset: 'Pomodoro cycle reset',
    workCompleted: 'Work session completed. Time for a short break!',
    shortBreakCompleted: 'Break completed. Time for the next work session!',
    longBreakCompleted: 'Long break completed. Ready for a new work cycle!',
    focusStarted: 'Focus mode started',
    focusPaused: 'Focus mode paused',
    focusResumed: 'Focus mode resumed',
    focusEnded: 'Focus session ended',
    focusEndedWithDuration: 'Focus session ended, lasted {duration}',
    focusTooShort: 'Focus session too short ({duration}), not recorded',
    languageChanged: 'Language setting changed. Please restart Obsidian to fully apply changes.',
    openSettings: 'Please use the command palette (Ctrl/Cmd+P) to search for "Tomato Clock Settings"'
  },
  
  statusBar: {
    working: 'Working',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    paused: 'Paused',
    idle: 'Idle',
    focusing: 'Focusing',
    focusPaused: 'Focus Paused'
  },
  
  settings: {
    pomodoroSettings: 'Pomodoro Settings',
    focusSettings: 'Focus Mode Settings',
    notificationSettings: 'Notification Settings',
    uiSettings: 'UI Settings',
    languageSettings: 'Language Settings',
    
    workDuration: 'Work Duration (minutes)',
    workDurationDesc: 'Length of Pomodoro work sessions',
    shortBreakDuration: 'Short Break Duration (minutes)',
    shortBreakDurationDesc: 'Length of breaks after completing one work session',
    longBreakDuration: 'Long Break Duration (minutes)',
    longBreakDurationDesc: 'Length of long breaks after completing multiple work sessions',
    longBreakInterval: 'Long Break Interval',
    longBreakIntervalDesc: 'Number of work sessions before a long break',
    autoStartBreak: 'Auto-start Breaks',
    autoStartBreakDesc: 'Automatically start breaks after work sessions',
    autoStartWork: 'Auto-start Work',
    autoStartWorkDesc: 'Automatically start next work session after breaks',
    
    focusMode: 'Enable Focus Mode',
    focusModeDesc: 'Automatically track your active time in Obsidian',
    inactivityTimeout: 'Inactivity Timeout (seconds)',
    inactivityTimeoutDesc: 'End focus session after this much time without activity',
    minimumFocusDuration: 'Minimum Focus Duration (seconds)',
    minimumFocusDurationDesc: 'Only record focus sessions longer than this duration',
    
    soundEnabled: 'Enable Sound',
    soundEnabledDesc: 'Play sound alert when session ends',
    notificationEnabled: 'Enable System Notifications',
    notificationEnabledDesc: 'Show system notification when session ends',
    
    showInStatusBar: 'Show in Status Bar',
    showInStatusBarDesc: 'Display Tomato Clock status in Obsidian status bar',
    
    language: 'Plugin Language',
    languageDesc: 'Select display language for the plugin interface',
    useSystemLanguage: 'Use System Language',
    useSystemLanguageDesc: 'Automatically set plugin language based on system settings'
  },
  
  stats: {
    title: 'Tomato Clock Statistics',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'Last 7 Days',
    thisMonth: 'Last 30 Days',
    thisYear: 'This Year',
    total: 'Total',
    workSessions: 'Work Sessions',
    workDuration: 'Work Duration',
    focusDuration: 'Focus Duration',
    focusMode: 'Focus Mode Stats',
    noData: 'No records in the selected time range.',
    exportData: 'Export Data',
    dateRange: 'Date Range',
    from: 'From',
    to: 'To',
    apply: 'Apply',
    reset: 'Reset',
    howToView: 'Tip: Click on the tab on the left to view details',
    completed: 'Completed',
    totalSessions: 'Total Sessions',
    dailyAverage: 'Daily Average',
    date: 'Date',
    startTime: 'Start Time',
    duration: 'Duration',
    type: 'Type',
    note: 'Note',
    work: 'Work',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    timeDistribution: 'Time Distribution',
    sessionTypes: 'Session Types',
    hours: ' hours',
    minutes: ' min',
    page: 'Page',
    confirmCleanup: 'Are you sure you want to clean up data older than 12 months?',
    cleanupComplete: 'Data cleanup completed',
    loading: 'Loading...',
    loadingError: 'Error loading data',
    largeDataWarning: 'Large data set may cause performance issues. Consider narrowing the date range.',
    totalData: 'Total data',
    pomodoroRecords: 'pomodoro records',
    focusRecords: 'focus records'
  }
}; 