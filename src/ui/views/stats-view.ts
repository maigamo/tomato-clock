import { ItemView, WorkspaceLeaf, setIcon, Notice } from 'obsidian';
import TomatoClockPlugin from '../../main';
import { PomodoroSession, FocusSession } from '../../data/storage';
import { t } from '../../i18n';
import { createDailyPomodoroChart, createDailyFocusChart, createPomodoroTypeChart, createTimeDistributionChart, createExportButton } from '../components/charts';

export const STATS_VIEW_TYPE = 'tomato-clock-stats';

export class StatsView extends ItemView {
  private plugin: TomatoClockPlugin;
  contentEl: HTMLElement;
  private statsContainer: HTMLElement; // 新增属性
  private dateRangeEl: HTMLElement;
  private statsEl: HTMLElement;
  private startDate: Date;
  private endDate: Date;
  private chartContainers: {
    dailyPomodoro?: HTMLElement;
    dailyFocus?: HTMLElement;
    pomodoroType?: HTMLElement;
    timeDistribution?: HTMLElement;
  } = {};
  private currentPage: number = 1;
  private readonly PAGE_SIZE: number = 20;
  private isLoading: boolean = false;

  constructor(leaf: WorkspaceLeaf, plugin: TomatoClockPlugin) {
    super(leaf);
    this.plugin = plugin;
    
    // 默认显示过去7天的数据
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 7);
  }

  getViewType(): string {
    return STATS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return t().stats.title;
  }

  async onOpen(): Promise<void> {
    // 使用CSS类代替内联样式
    this.containerEl.addClass('tomato-clock-view');
    
    // 清空contentEl现有内容
    this.contentEl.empty();
    
    // 创建标准视图内容容器
    const viewContent = this.contentEl.createDiv({ cls: 'view-content' });
    
    // 在view-content中创建统计容器
    this.statsContainer = viewContent.createDiv({ cls: 'tomato-clock-stats-container' });
    
    // 创建顶部栏，包含标题和关闭按钮
    this.createHeaderWithCloseButton();
    
    // 创建数据统计摘要
    this.createDataStats();
    
    // 创建日期范围选择器
    this.createDateRangeSelector();
    
    // 加载统计数据
    await this.refreshStats();
    
    // 添加ESC键监听，按ESC键关闭视图
    this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') {
        this.leaf.detach();
      }
    });
    
    // 添加滚动事件监听
    this.statsContainer.addEventListener('scroll', this.handleScroll.bind(this));
  }
  
  /**
   * 创建顶部栏，包含标题
   */
  private createHeaderWithCloseButton(): void {
    const headerContainer = this.statsContainer.createDiv({ cls: 'tomato-clock-header' });
    
    // 标题
    const titleContainer = headerContainer.createDiv({ cls: 'tomato-clock-header-title' });
    setIcon(titleContainer.createSpan({ cls: 'tomato-clock-header-icon' }), 'bar-chart-2');
    titleContainer.createSpan({ text: t().stats.title });
  }
  
  /**
   * 创建数据统计摘要
   */
  private createDataStats(): void {
    const statsInfo = this.plugin.dataStorage.getDataStats();
    const statsContainer = this.statsContainer.createDiv({ cls: 'tomato-clock-data-stats' });
    
    const infoText = statsContainer.createDiv({ cls: 'tomato-clock-data-stats-info' });
    setIcon(infoText.createSpan({ cls: 'tomato-clock-data-stats-icon' }), 'database');
    infoText.appendText(` ${t().stats.totalData || '总数据'}: ${statsInfo.pomodoroCount} ${t().stats.pomodoroRecords || '番茄钟记录'}, ${statsInfo.focusCount} ${t().stats.focusRecords || '专注记录'} (${statsInfo.dataSize})`);
  }

  /**
   * 创建日期范围选择器
   */
  private createDateRangeSelector(): void {
    this.dateRangeEl = this.statsContainer.createDiv({ cls: 'tomato-clock-date-range' });
    
    // 标题
    const dateRangeHeader = this.dateRangeEl.createEl('h2');
    dateRangeHeader.setText(t().stats.dateRange);
    
    // 添加图标到标题
    const titleContainer = dateRangeHeader.createSpan({ cls: 'tomato-clock-title-with-icon' });
    setIcon(titleContainer, 'calendar');
    
    // 日期选择器容器
    const datePickerContainer = this.dateRangeEl.createDiv({ cls: 'tomato-clock-date-picker-container' });
    
    // 开始日期选择器
    const startDateContainer = datePickerContainer.createDiv({ cls: 'tomato-clock-date-picker' });
    startDateContainer.createEl('span', { text: `${t().stats.from}: ` });
    const startDatePicker = startDateContainer.createEl('input', { 
      type: 'date',
      attr: {
        value: this.formatDateForInput(this.startDate)
      }
    });
    
    // 结束日期选择器
    const endDateContainer = datePickerContainer.createDiv({ cls: 'tomato-clock-date-picker' });
    endDateContainer.createEl('span', { text: `${t().stats.to}: ` });
    const endDatePicker = endDateContainer.createEl('input', { 
      type: 'date',
      attr: {
        value: this.formatDateForInput(this.endDate)
      }
    });
    
    // 快捷选择按钮
    const quickSelectContainer = this.dateRangeEl.createDiv({ cls: 'tomato-clock-quick-select' });
    
    const todayBtn = quickSelectContainer.createEl('button', { text: t().stats.today, cls: 'tomato-clock-button' });
    setIcon(todayBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'calendar-clock');
    todayBtn.addEventListener('click', () => {
      this.setDateRange(0, 0);
      startDatePicker.value = this.formatDateForInput(this.startDate);
      endDatePicker.value = this.formatDateForInput(this.endDate);
      this.refreshStats();
    });
    
    const yesterdayBtn = quickSelectContainer.createEl('button', { text: t().stats.yesterday || '昨天', cls: 'tomato-clock-button' });
    setIcon(yesterdayBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'calendar-minus');
    yesterdayBtn.addEventListener('click', () => {
      this.setDateRange(-1, -1);
      startDatePicker.value = this.formatDateForInput(this.startDate);
      endDatePicker.value = this.formatDateForInput(this.endDate);
      this.refreshStats();
    });
    
    const weekBtn = quickSelectContainer.createEl('button', { text: t().stats.thisWeek, cls: 'tomato-clock-button' });
    setIcon(weekBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'calendar-days');
    weekBtn.addEventListener('click', () => {
      this.setDateRange(-7, 0);
      startDatePicker.value = this.formatDateForInput(this.startDate);
      endDatePicker.value = this.formatDateForInput(this.endDate);
      this.refreshStats();
    });
    
    const monthBtn = quickSelectContainer.createEl('button', { text: t().stats.thisMonth, cls: 'tomato-clock-button' });
    setIcon(monthBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'calendar-range');
    monthBtn.addEventListener('click', () => {
      this.setDateRange(-30, 0);
      startDatePicker.value = this.formatDateForInput(this.startDate);
      endDatePicker.value = this.formatDateForInput(this.endDate);
      this.refreshStats();
    });
    
    // 应用按钮
    const applyBtn = this.dateRangeEl.createEl('button', { text: t().stats.apply, cls: 'tomato-clock-button tomato-primary-btn' });
    setIcon(applyBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'check');
    applyBtn.addEventListener('click', () => {
      this.startDate = new Date(startDatePicker.value);
      this.endDate = new Date(endDatePicker.value);
      // 确保结束日期包含整天
      this.endDate.setHours(23, 59, 59, 999);
      this.refreshStats();
    });
    
    // 日期选择器事件处理
    startDatePicker.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value) {
        const date = new Date(target.value);
        if (!isNaN(date.getTime())) {
          this.startDate = date;
        }
      }
    });
    
    endDatePicker.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value) {
        const date = new Date(target.value);
        if (!isNaN(date.getTime())) {
          this.endDate = date;
          // 确保结束日期包含整天
          this.endDate.setHours(23, 59, 59, 999);
        }
      }
    });
  }

  /**
   * 显示加载指示器
   */
  private showLoading(): void {
    this.isLoading = true;
    const loadingEl = this.statsContainer.createDiv({ cls: 'tomato-clock-loading' });
    const spinner = loadingEl.createDiv({ cls: 'tomato-clock-spinner' });
    loadingEl.createDiv({ text: t().stats.loading || '加载中...', cls: 'tomato-clock-loading-text' });
  }
  
  /**
   * 隐藏加载指示器
   */
  private hideLoading(): void {
    this.isLoading = false;
    const loadingEls = this.statsContainer.querySelectorAll('.tomato-clock-loading');
    loadingEls.forEach(el => el.remove());
  }

  /**
   * 设置日期范围
   * @param startDaysOffset 开始日期偏移（相对于今天）
   * @param endDaysOffset 结束日期偏移（相对于今天）
   */
  private setDateRange(startDaysOffset: number, endDaysOffset: number): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.startDate = new Date(today);
    this.startDate.setDate(today.getDate() + startDaysOffset);
    
    this.endDate = new Date(today);
    this.endDate.setDate(today.getDate() + endDaysOffset);
    this.endDate.setHours(23, 59, 59, 999);
  }

  /**
   * 格式化日期为HTML日期输入框格式 (YYYY-MM-DD)
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 刷新统计数据
   */
  async refreshStats(): Promise<void> {
    // 防止重复加载
    if (this.isLoading) return;
    
    // 显示加载指示器
    this.showLoading();
    
    // 重置当前页码
    this.currentPage = 1;
    
    try {
      // 清空现有统计
      if (this.statsEl) {
        this.statsEl.remove();
      }
      
      // 创建统计容器
      this.statsEl = this.statsContainer.createDiv({ cls: 'tomato-clock-stats' });

      // 显示日期范围
      const dateRangeTitle = this.statsEl.createEl('h2', { 
        text: `${t().stats.title} (${this.formatDate(this.startDate)} ${t().stats.to} ${this.formatDate(this.endDate)})` 
      });
      
      // 获取数据
      const pomodoroSessions = this.plugin.dataStorage.getPomodoroSessionsByDateRange(this.startDate, this.endDate);
      const focusSessions = this.plugin.dataStorage.getFocusSessionsByDateRange(this.startDate, this.endDate);
      
      // 为大数据集显示警告
      if (pomodoroSessions.length > 500 || focusSessions.length > 500) {
        const warningEl = this.statsEl.createDiv({ cls: 'tomato-clock-data-warning' });
        setIcon(warningEl.createSpan({ cls: 'tomato-clock-warning-icon' }), 'alert-triangle');
        warningEl.appendText(` ${t().stats.largeDataWarning || '大量数据可能导致性能问题，建议缩小日期范围。'}`);
      }
      
      // 创建图表容器
      const chartsContainer = this.statsEl.createDiv({ cls: 'tomato-clock-charts-container' });
      
      // 每日番茄钟图表
      const dailyPomodoroChartContainer = chartsContainer.createDiv({ cls: 'tomato-clock-chart' });
      const dailyPomodoroHeader = dailyPomodoroChartContainer.createEl('h3');
      setIcon(dailyPomodoroHeader.createSpan({ cls: 'tomato-clock-chart-icon' }), 'activity');
      dailyPomodoroHeader.appendText(t().stats.workSessions);
      this.chartContainers.dailyPomodoro = dailyPomodoroChartContainer.createDiv({ cls: 'chart-canvas-container' });
      createDailyPomodoroChart(this.chartContainers.dailyPomodoro, pomodoroSessions, this.startDate, this.endDate);
      
      // 每日专注时间图表
      const dailyFocusChartContainer = chartsContainer.createDiv({ cls: 'tomato-clock-chart' });
      const dailyFocusHeader = dailyFocusChartContainer.createEl('h3');
      setIcon(dailyFocusHeader.createSpan({ cls: 'tomato-clock-chart-icon' }), 'hourglass');
      dailyFocusHeader.appendText(t().stats.focusDuration);
      this.chartContainers.dailyFocus = dailyFocusChartContainer.createDiv({ cls: 'chart-canvas-container' });
      createDailyFocusChart(this.chartContainers.dailyFocus, focusSessions, this.startDate, this.endDate);
      
      // 时间分布图表
      const timeDistChartContainer = chartsContainer.createDiv({ cls: 'tomato-clock-chart' });
      const timeDistHeader = timeDistChartContainer.createEl('h3');
      setIcon(timeDistHeader.createSpan({ cls: 'tomato-clock-chart-icon' }), 'scatter-chart');
      timeDistHeader.appendText(t().stats.timeDistribution || '时段分布');
      this.chartContainers.timeDistribution = timeDistChartContainer.createDiv({ cls: 'chart-canvas-container' });
      createTimeDistributionChart(this.chartContainers.timeDistribution, pomodoroSessions, focusSessions, this.startDate, this.endDate);
      
      // 番茄钟类型分布图表
      const typeChartContainer = chartsContainer.createDiv({ cls: 'tomato-clock-chart' });
      const typeHeader = typeChartContainer.createEl('h3');
      setIcon(typeHeader.createSpan({ cls: 'tomato-clock-chart-icon' }), 'pie-chart');
      typeHeader.appendText(t().stats.sessionTypes || '番茄钟类型分布');
      this.chartContainers.pomodoroType = typeChartContainer.createDiv({ cls: 'chart-canvas-container' });
      createPomodoroTypeChart(this.chartContainers.pomodoroType, pomodoroSessions);
      
      // 创建工具区域容器
      const toolsContainer = this.statsEl.createDiv({ cls: 'tomato-clock-tools-container' });
      
      // 创建导出按钮
      const exportContainer = toolsContainer.createDiv({ cls: 'tomato-clock-export-container' });
      createExportButton(exportContainer, pomodoroSessions, focusSessions);
      
      // 创建清理数据按钮（从顶部移到这里）
      const cleanupContainer = toolsContainer.createDiv({ cls: 'tomato-clock-cleanup-container' });
      
      const cleanupButton = cleanupContainer.createEl('button', { 
        cls: 'tomato-clock-button tomato-clock-cleanup-button',
        text: t().stats.confirmCleanup?.split('?')[0] || '清理旧数据' 
      });
      
      setIcon(cleanupButton.createSpan({ cls: 'tomato-clock-btn-icon' }), 'trash-2');
      cleanupButton.addEventListener('click', async () => {
        if (confirm(t().stats.confirmCleanup || '确定要清理超过12个月的旧数据吗？')) {
          await this.plugin.dataStorage.cleanupOldData(12);
          new Notice(t().stats.cleanupComplete || '数据清理完成');
          this.refreshStats();
        }
      });
      
      // 创建番茄钟统计
      this.createPomodoroStats(pomodoroSessions);
      
      // 创建专注模式统计
      this.createFocusStats(focusSessions);
    } catch (error) {
      console.error('刷新统计数据失败:', error);
      const errorEl = this.statsEl.createDiv({ cls: 'tomato-clock-error' });
      setIcon(errorEl.createSpan(), 'alert-circle');
      errorEl.appendText(` ${t().stats.loadingError || '加载数据时出错'}: ${error.message}`);
    } finally {
      // 隐藏加载指示器
      this.hideLoading();
    }
  }

  /**
   * 创建番茄钟统计
   */
  private createPomodoroStats(sessions: PomodoroSession[]): void {
    const pomodoroContainer = this.statsEl.createDiv({ cls: 'tomato-clock-stat-section' });
    
    // 使用带图标的标题
    const pomodoroHeader = pomodoroContainer.createEl('h3');
    setIcon(pomodoroHeader.createSpan({ cls: 'tomato-clock-section-icon' }), 'clock');
    pomodoroHeader.appendText(t().stats.workSessions);
    
    // 计算总计数据
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const totalTimeMs = sessions.reduce((total, session) => total + session.duration, 0);
    const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
    
    // 创建摘要
    const summaryEl = pomodoroContainer.createDiv({ cls: 'tomato-clock-summary' });
    
    const totalSessionsEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
    setIcon(totalSessionsEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'hash');
    totalSessionsEl.createDiv({ text: t().stats.total, cls: 'tomato-clock-stat-label' });
    totalSessionsEl.createDiv({ text: `${totalSessions}`, cls: 'tomato-clock-stat-value' });
    
    const completedSessionsEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
    setIcon(completedSessionsEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'check-circle');
    completedSessionsEl.createDiv({ text: t().stats.completed || '已完成', cls: 'tomato-clock-stat-label' });
    completedSessionsEl.createDiv({ text: `${completedSessions}`, cls: 'tomato-clock-stat-value' });
    
    const totalTimeEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
    setIcon(totalTimeEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'clock');
    totalTimeEl.createDiv({ text: t().stats.workDuration, cls: 'tomato-clock-stat-label' });
    totalTimeEl.createDiv({ text: `${totalTimeHours.toFixed(1)}${t().stats.hours || '小时'}`, cls: 'tomato-clock-stat-value' });
    
    // 显示会话列表
    if (totalSessions > 0) {
      const tableContainer = pomodoroContainer.createDiv({ cls: 'tomato-clock-table-container' });
      
      // 创建表格
      const table = tableContainer.createEl('table', { cls: 'tomato-clock-table' });
      
      // 表头
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      headerRow.createEl('th', { text: t().stats.date || '日期' });
      headerRow.createEl('th', { text: t().stats.startTime || '开始时间' });
      headerRow.createEl('th', { text: t().stats.duration || '时长' });
      headerRow.createEl('th', { text: t().stats.type || '类型' });
      
      // 表身
      const tbody = table.createEl('tbody');
      
      // 按开始时间降序排序
      sessions.sort((a, b) => b.startTime - a.startTime);
      
      // 计算分页
      const totalPages = Math.ceil(sessions.length / this.PAGE_SIZE);
      const startIdx = (this.currentPage - 1) * this.PAGE_SIZE;
      const endIdx = Math.min(startIdx + this.PAGE_SIZE, sessions.length);
      
      // 显示当前页的记录
      const currentPageSessions = sessions.slice(startIdx, endIdx);
      
      for (const session of currentPageSessions) {
        const row = tbody.createEl('tr');
        
        // 日期
        const startDate = new Date(session.startTime);
        row.createEl('td', { text: this.formatDate(startDate) });
        
        // 开始时间
        row.createEl('td', { text: this.formatTime(startDate) });
        
        // 时长
        const durationMinutes = session.duration / (1000 * 60);
        row.createEl('td', { text: `${durationMinutes.toFixed(0)}${t().stats.minutes || '分钟'}` });
        
        // 类型
        let typeText = '';
        let typeIcon = '';
        
        switch (session.type) {
          case 'work':
            typeText = t().stats.work || '工作';
            typeIcon = 'edit';
            break;
          case 'shortBreak':
            typeText = t().stats.shortBreak || '短休息';
            typeIcon = 'coffee';
            break;
          case 'longBreak':
            typeText = t().stats.longBreak || '长休息';
            typeIcon = 'palm-tree';
            break;
        }
        
        const typeCell = row.createEl('td');
        const typeSpan = typeCell.createSpan();
        setIcon(typeSpan, typeIcon);
        typeSpan.appendText(` ${typeText}`);
      }
      
      // 如果有多页，添加分页控件
      if (totalPages > 1) {
        this.createPaginationControls(tableContainer, sessions.length, this.PAGE_SIZE, this.currentPage, (newPage) => {
          this.currentPage = newPage;
          this.refreshStats();
        });
      }
    } else {
      pomodoroContainer.createEl('p', { 
        text: t().stats.noData, 
        cls: 'tomato-clock-empty-message' 
      });
    }
  }

  /**
   * 创建专注模式统计
   */
  private createFocusStats(sessions: FocusSession[]): void {
    const focusContainer = this.statsEl.createDiv({ cls: 'tomato-clock-stat-section' });
    
    // 使用带图标的标题
    const focusHeader = focusContainer.createEl('h3');
    setIcon(focusHeader.createSpan({ cls: 'tomato-clock-section-icon' }), 'eye');
    focusHeader.appendText(t().stats.focusMode || '专注模式统计');
    
    // 计算总计数据
    const totalSessions = sessions.length;
    const totalTimeMs = sessions.reduce((total, session) => total + session.duration, 0);
    const totalTimeHours = totalTimeMs / (1000 * 60 * 60);
    
    // 创建摘要
    const summaryEl = focusContainer.createDiv({ cls: 'tomato-clock-summary' });
    
    const totalSessionsEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
    setIcon(totalSessionsEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'hash');
    totalSessionsEl.createDiv({ text: t().stats.totalSessions || '总会话', cls: 'tomato-clock-stat-label' });
    totalSessionsEl.createDiv({ text: `${totalSessions}`, cls: 'tomato-clock-stat-value' });
    
    const totalTimeEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
    setIcon(totalTimeEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'hourglass');
    totalTimeEl.createDiv({ text: t().stats.focusDuration, cls: 'tomato-clock-stat-label' });
    totalTimeEl.createDiv({ text: `${totalTimeHours.toFixed(1)}${t().stats.hours || '小时'}`, cls: 'tomato-clock-stat-value' });
    
    // 计算每天平均专注时间
    if (totalSessions > 0) {
      // 按日期分组
      const sessionsByDate = new Map<string, FocusSession[]>();
      
      for (const session of sessions) {
        const date = this.formatDate(new Date(session.startTime));
        
        if (!sessionsByDate.has(date)) {
          sessionsByDate.set(date, []);
        }
        
        sessionsByDate.get(date)?.push(session);
      }
      
      const avgTimeEl = summaryEl.createDiv({ cls: 'tomato-clock-stat-item' });
      setIcon(avgTimeEl.createDiv({ cls: 'tomato-clock-stat-icon' }), 'bar-chart-2');
      avgTimeEl.createDiv({ text: t().stats.dailyAverage || '日均专注', cls: 'tomato-clock-stat-label' });
      avgTimeEl.createDiv({ 
        text: `${(totalTimeHours / sessionsByDate.size).toFixed(1)}${t().stats.hours || '小时'}`, 
        cls: 'tomato-clock-stat-value' 
      });
      
      // 显示会话列表
      const tableContainer = focusContainer.createDiv({ cls: 'tomato-clock-table-container' });
      
      // 创建表格
      const table = tableContainer.createEl('table', { cls: 'tomato-clock-table' });
      
      // 表头
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      headerRow.createEl('th', { text: t().stats.date || '日期' });
      headerRow.createEl('th', { text: t().stats.startTime || '开始时间' });
      headerRow.createEl('th', { text: t().stats.duration || '时长' });
      headerRow.createEl('th', { text: t().stats.note || '笔记' });
      
      // 表身
      const tbody = table.createEl('tbody');
      
      // 按开始时间降序排序
      sessions.sort((a, b) => b.startTime - a.startTime);
      
      // 计算分页
      const totalPages = Math.ceil(sessions.length / this.PAGE_SIZE);
      const startIdx = (this.currentPage - 1) * this.PAGE_SIZE;
      const endIdx = Math.min(startIdx + this.PAGE_SIZE, sessions.length);
      
      // 显示当前页的记录
      const currentPageSessions = sessions.slice(startIdx, endIdx);
      
      for (const session of currentPageSessions) {
        const row = tbody.createEl('tr');
        
        // 日期
        const startDate = new Date(session.startTime);
        row.createEl('td', { text: this.formatDate(startDate) });
        
        // 开始时间
        row.createEl('td', { text: this.formatTime(startDate) });
        
        // 时长
        const durationMinutes = session.duration / (1000 * 60);
        row.createEl('td', { text: `${durationMinutes.toFixed(0)}${t().stats.minutes || '分钟'}` });
        
        // 笔记
        const noteCell = row.createEl('td');
        if (session.noteId) {
          const noteSpan = noteCell.createSpan();
          setIcon(noteSpan, 'file-text');
          noteSpan.appendText(` ${session.noteId}`);
        } else {
          noteCell.setText('-');
        }
      }
      
      // 如果有多页，添加分页控件
      if (totalPages > 1) {
        this.createPaginationControls(tableContainer, sessions.length, this.PAGE_SIZE, this.currentPage, (newPage) => {
          this.currentPage = newPage;
          this.refreshStats();
        });
      }
    } else {
      focusContainer.createEl('p', { 
        text: t().stats.noData, 
        cls: 'tomato-clock-empty-message' 
      });
    }
  }
  
  /**
   * 创建分页控件
   */
  private createPaginationControls(container: HTMLElement, totalItems: number, pageSize: number, currentPage: number, callback: (page: number) => void): void {
    const paginationContainer = container.createDiv({ cls: 'tomato-clock-pagination' });
    
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // 如果数据特别多，添加跳转到第一页和最后一页的按钮
    if (totalPages > 5) {
      const firstPageButton = paginationContainer.createEl('button', { cls: 'tomato-clock-pagination-btn' });
      setIcon(firstPageButton, 'chevrons-left');
      firstPageButton.disabled = currentPage <= 1;
      firstPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
          callback(1);
        }
      });
    }
    
    // 上一页按钮
    const prevButton = paginationContainer.createEl('button', { cls: 'tomato-clock-pagination-btn' });
    setIcon(prevButton, 'chevron-left');
    prevButton.disabled = currentPage <= 1;
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        callback(currentPage - 1);
      }
    });
    
    // 页码信息
    paginationContainer.createSpan({ 
      text: `${t().stats.page || '页码'} ${currentPage}/${totalPages}`, 
      cls: 'tomato-clock-pagination-info' 
    });
    
    // 下一页按钮
    const nextButton = paginationContainer.createEl('button', { cls: 'tomato-clock-pagination-btn' });
    setIcon(nextButton, 'chevron-right');
    nextButton.disabled = currentPage >= totalPages;
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        callback(currentPage + 1);
      }
    });
    
    // 如果数据特别多，添加跳转到第一页和最后一页的按钮
    if (totalPages > 5) {
      const lastPageButton = paginationContainer.createEl('button', { cls: 'tomato-clock-pagination-btn' });
      setIcon(lastPageButton, 'chevrons-right');
      lastPageButton.disabled = currentPage >= totalPages;
      lastPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
          callback(totalPages);
        }
      });
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * 格式化时间为 HH:MM
   */
  private formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * 处理滚动事件，控制顶部栏样式
   */
  private handleScroll(): void {
    const header = this.contentEl.querySelector('.tomato-clock-header') as HTMLElement;
    if (!header) return;
    
    if (this.contentEl.scrollTop > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
} 