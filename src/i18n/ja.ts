import { Translation } from './index';

/**
 * 日本語翻訳
 */
export const ja: Translation = {
  plugin: {
    name: 'トマトクロック',
    loading: 'トマトクロックプラグインを読み込み中',
    unloading: 'トマトクロックプラグインを終了中'
  },
  
  commands: {
    startWork: 'ポモドーロ作業開始',
    startShortBreak: '短い休憩開始',
    startLongBreak: '長い休憩開始',
    pausePomodoro: 'ポモドーロ一時停止',
    resumePomodoro: 'ポモドーロ再開',
    stopPomodoro: 'ポモドーロ停止',
    skipPomodoro: '現在のポモドーロフェーズをスキップ',
    resetCycle: 'ポモドーロサイクルリセット',
    startFocus: '集中セッション開始',
    pauseFocus: '集中セッション一時停止',
    resumeFocus: '集中セッション再開',
    endFocus: '集中セッション終了',
    openStats: 'トマトクロック統計を開く'
  },
  
  notifications: {
    workStarted: 'ポモドーロ作業セッションが開始されました',
    shortBreakStarted: '短い休憩が開始されました',
    longBreakStarted: '長い休憩が開始されました',
    pomodoroPaused: 'ポモドーロが一時停止されました',
    pomodoroResumed: 'ポモドーロが再開されました',
    pomodoroStopped: 'ポモドーロが停止されました',
    phaseSkipped: '現在のフェーズがスキップされました',
    cycleReset: 'ポモドーロサイクルがリセットされました',
    workCompleted: '作業セッションが完了しました。短い休憩の時間です！',
    shortBreakCompleted: '休憩が完了しました。次の作業セッションの時間です！',
    longBreakCompleted: '長い休憩が完了しました。新しい作業サイクルの準備ができました！',
    focusStarted: '集中モードが開始されました',
    focusPaused: '集中モードが一時停止されました',
    focusResumed: '集中モードが再開されました',
    focusEnded: '集中セッションが終了しました',
    focusEndedWithDuration: '集中セッションが終了しました、{duration}続きました',
    focusTooShort: '集中セッションが短すぎます（{duration}）、記録されません',
    languageChanged: '言語設定が変更されました。変更を完全に適用するにはObsidianを再起動してください。',
    openSettings: 'コマンドパレット（Ctrl/Cmd+P）で「トマトクロック設定」を検索してください'
  },
  
  statusBar: {
    working: '作業中',
    shortBreak: '短い休憩',
    longBreak: '長い休憩',
    paused: '一時停止',
    idle: 'アイドル',
    focusing: '集中中',
    focusPaused: '集中一時停止'
  },
  
  settings: {
    pomodoroSettings: 'ポモドーロ設定',
    focusSettings: '集中モード設定',
    notificationSettings: '通知設定',
    uiSettings: 'UI設定',
    languageSettings: '言語設定',
    
    workDuration: '作業時間（分）',
    workDurationDesc: 'ポモドーロ作業セッションの長さ',
    shortBreakDuration: '短い休憩時間（分）',
    shortBreakDurationDesc: '1つの作業セッションを完了した後の休憩時間',
    longBreakDuration: '長い休憩時間（分）',
    longBreakDurationDesc: '複数の作業セッションを完了した後の長い休憩時間',
    longBreakInterval: '長い休憩間隔',
    longBreakIntervalDesc: '長い休憩までの作業セッション数',
    autoStartBreak: '自動休憩開始',
    autoStartBreakDesc: '作業セッション後に自動的に休憩を開始する',
    autoStartWork: '自動作業開始',
    autoStartWorkDesc: '休憩後に自動的に次の作業セッションを開始する',
    
    focusMode: '集中モードを有効にする',
    focusModeDesc: 'Obsidianでのアクティブな時間を自動的に追跡する',
    inactivityTimeout: '非アクティビティタイムアウト（秒）',
    inactivityTimeoutDesc: 'アクティビティがない状態がこの時間続くと集中セッションを終了する',
    minimumFocusDuration: '最小集中時間（秒）',
    minimumFocusDurationDesc: 'この期間より長い集中セッションのみを記録する',
    
    soundEnabled: 'サウンドを有効にする',
    soundEnabledDesc: 'セッション終了時にサウンドアラートを再生する',
    notificationEnabled: 'システム通知を有効にする',
    notificationEnabledDesc: 'セッション終了時にシステム通知を表示する',
    
    showInStatusBar: 'ステータスバーに表示',
    showInStatusBarDesc: 'Obsidianステータスバーにトマトクロックの状態を表示する',
    
    language: 'プラグイン言語',
    languageDesc: 'プラグインインターフェースの表示言語を選択する',
    useSystemLanguage: 'システム言語を使用',
    useSystemLanguageDesc: 'システム設定に基づいて自動的にプラグイン言語を設定する'
  },
  
  stats: {
    title: 'トマトクロック統計',
    today: '今日',
    yesterday: '昨日',
    thisWeek: '過去7日間',
    thisMonth: '過去30日間',
    thisYear: '今年',
    total: '合計',
    workSessions: '作業セッション',
    workDuration: '作業時間',
    focusDuration: '集中時間',
    focusMode: '集中モード統計',
    noData: '選択した期間内にレコードがありません。',
    exportData: 'データをエクスポート',
    dateRange: '日付範囲',
    from: '開始日',
    to: '終了日',
    apply: '適用',
    reset: 'リセット',
    howToView: 'ヒント：左側のタブをクリックして詳細を表示',
    completed: '完了',
    totalSessions: '総セッション',
    dailyAverage: '1日平均',
    date: '日付',
    startTime: '開始時間',
    duration: '時間',
    type: 'タイプ',
    note: 'ノート',
    work: '作業',
    shortBreak: '短休憩',
    longBreak: '長休憩',
    timeDistribution: '時間帯分布',
    sessionTypes: 'セッションタイプ',
    hours: '時間',
    minutes: '分',
    page: 'ページ',
    confirmCleanup: '12ヶ月以上経過したデータを削除してもよろしいですか？',
    cleanupComplete: 'データのクリーンアップが完了しました',
    loading: '読み込み中...',
    loadingError: 'データの読み込みエラー',
    largeDataWarning: '大量のデータはパフォーマンスに影響を与える可能性があります。日付範囲を狭めることを検討してください。',
    totalData: '総データ',
    pomodoroRecords: 'ポモドーロ記録',
    focusRecords: '集中記録'
  }
}; 