import TomatoClockPlugin from '../main';

export type PomodoroSessionType = 'work' | 'shortBreak' | 'longBreak';

/**
 * 番茄钟会话数据
 */
export interface PomodoroSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: PomodoroSessionType;
  completed: boolean;
}

/**
 * 专注会话数据
 */
export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  noteId?: string;
}

/**
 * 存储的插件数据
 */
export interface StorageData {
  pomodoroSessions: PomodoroSession[];
  focusSessions: FocusSession[];
}

/**
 * 调试日志函数，仅在开发环境中输出
 */
function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}

/**
 * 数据存储管理
 */
export class DataStorage {
  private plugin: TomatoClockPlugin;
  private data: StorageData;
  private isDataLoaded: boolean = false;
  private readonly DATA_FILE_NAME = 'tomato-clock-data.json';
  // 缓存按日期范围查询的结果
  private sessionCache: {
    pomodoroCache: Map<string, PomodoroSession[]>;
    focusCache: Map<string, FocusSession[]>;
  } = {
    pomodoroCache: new Map(),
    focusCache: new Map()
  };
  
  // 缓存过期时间（毫秒）
  private readonly CACHE_EXPIRY = 60 * 1000; // 1分钟
  private lastCacheClear: number = Date.now();

  constructor(plugin: TomatoClockPlugin) {
    this.plugin = plugin;
    this.data = {
      pomodoroSessions: [],
      focusSessions: []
    };
  }
  
  /**
   * 初始化数据存储
   */
  async init(): Promise<void> {
    await this.load();
  }

  /**
   * 加载已保存的数据
   */
  async load(): Promise<void> {
    try {
      // 从单独的数据文件加载会话数据
      const adapter = this.plugin.app.vault.adapter;
      const dataPath = `${this.plugin.app.vault.configDir}/plugins/tomato-clock/${this.DATA_FILE_NAME}`;
      
      if (await adapter.exists(dataPath)) {
        const dataJson = await adapter.read(dataPath);
        const savedData = JSON.parse(dataJson);
        
        if (savedData) {
          this.data = {
            pomodoroSessions: savedData.pomodoroSessions || [],
            focusSessions: savedData.focusSessions || []
          };
          debugLog('番茄钟数据已从单独文件加载', this.data.pomodoroSessions.length, '条番茄钟记录和', this.data.focusSessions.length, '条专注记录');
          this.isDataLoaded = true;
          return;
        }
      }
      
      // 如果单独的数据文件不存在，尝试从旧格式加载
      const oldData = await this.plugin.loadData();
      if (oldData && (oldData.pomodoroSessions || oldData.focusSessions)) {
        this.data = {
          pomodoroSessions: oldData.pomodoroSessions || [],
          focusSessions: oldData.focusSessions || []
        };
        
        // 迁移完成后，将数据保存到新文件
        await this.save();
        debugLog('番茄钟数据已从旧格式迁移到单独文件');
        this.isDataLoaded = true;
      }
    } catch (error) {
      debugLog('加载番茄钟数据失败:', error);
      // 初始化为空数据
      this.data = {
        pomodoroSessions: [],
        focusSessions: []
      };
      this.isDataLoaded = true;
    }
  }

  /**
   * 保存数据
   * 对于大型数据集，使用增量保存策略
   */
  async save(): Promise<void> {
    try {
      // 保存到单独的数据文件
      const adapter = this.plugin.app.vault.adapter;
      const pluginDir = `${this.plugin.app.vault.configDir}/plugins/tomato-clock`;
      const dataPath = `${pluginDir}/${this.DATA_FILE_NAME}`;
      
      // 确保目录存在
      if (!(await adapter.exists(pluginDir))) {
        await adapter.mkdir(pluginDir);
      }
      
      // 将数据保存为JSON
      const dataJson = JSON.stringify(this.data);
      await adapter.write(dataPath, dataJson);
      debugLog('番茄钟数据已保存到单独文件');
    } catch (error) {
      debugLog('保存番茄钟数据失败:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    
    // 如果缓存没有过期，直接返回
    if (now - this.lastCacheClear < this.CACHE_EXPIRY) {
      return;
    }
    
    // 清空缓存
    this.sessionCache.pomodoroCache.clear();
    this.sessionCache.focusCache.clear();
    this.lastCacheClear = now;
    debugLog('缓存已清理');
  }

  /**
   * 添加番茄钟会话
   */
  async addPomodoroSession(session: PomodoroSession): Promise<void> {
    this.data.pomodoroSessions.push(session);
    
    // 清空缓存，确保下次查询能获取到最新数据
    this.clearExpiredCache();
    
    await this.save();
  }

  /**
   * 添加专注会话
   */
  async addFocusSession(session: FocusSession): Promise<void> {
    this.data.focusSessions.push(session);
    
    // 清空缓存，确保下次查询能获取到最新数据
    this.clearExpiredCache();
    
    await this.save();
  }

  /**
   * 获取所有番茄钟会话
   * 对于大型数据集，可能需要分页
   */
  getAllPomodoroSessions(offset = 0, limit = 1000): PomodoroSession[] {
    return [...this.data.pomodoroSessions].slice(offset, offset + limit);
  }

  /**
   * 获取所有专注会话
   * 对于大型数据集，可能需要分页
   */
  getAllFocusSessions(offset = 0, limit = 1000): FocusSession[] {
    return [...this.data.focusSessions].slice(offset, offset + limit);
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(startTime: number, endTime: number): string {
    return `${startTime}_${endTime}`;
  }

  /**
   * 根据日期范围获取番茄钟会话
   * 使用缓存提高性能
   */
  getPomodoroSessionsByDateRange(startDate: Date, endDate: Date): PomodoroSession[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const cacheKey = this.getCacheKey(startTime, endTime);
    
    // 检查缓存
    if (this.sessionCache.pomodoroCache.has(cacheKey)) {
      return this.sessionCache.pomodoroCache.get(cacheKey) || [];
    }
    
    // 没有缓存，进行过滤
    const sessions = this.data.pomodoroSessions.filter(session => {
      return session.startTime >= startTime && session.startTime <= endTime;
    });
    
    // 缓存结果
    this.sessionCache.pomodoroCache.set(cacheKey, sessions);
    
    return sessions;
  }

  /**
   * 根据日期范围获取专注会话
   * 使用缓存提高性能
   */
  getFocusSessionsByDateRange(startDate: Date, endDate: Date): FocusSession[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const cacheKey = this.getCacheKey(startTime, endTime);
    
    // 检查缓存
    if (this.sessionCache.focusCache.has(cacheKey)) {
      return this.sessionCache.focusCache.get(cacheKey) || [];
    }
    
    // 没有缓存，进行过滤
    const sessions = this.data.focusSessions.filter(session => {
      return session.startTime >= startTime && session.startTime <= endTime;
    });
    
    // 缓存结果
    this.sessionCache.focusCache.set(cacheKey, sessions);
    
    return sessions;
  }

  /**
   * 根据类型获取番茄钟会话
   */
  getPomodoroSessionsByType(type: PomodoroSessionType): PomodoroSession[] {
    return this.data.pomodoroSessions.filter(session => session.type === type);
  }

  /**
   * 获取当天的番茄钟会话
   */
  getTodayPomodoroSessions(): PomodoroSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getPomodoroSessionsByDateRange(today, tomorrow);
  }

  /**
   * 获取当天的专注会话
   */
  getTodayFocusSessions(): FocusSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getFocusSessionsByDateRange(today, tomorrow);
  }

  /**
   * 生成唯一ID
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    this.data = {
      pomodoroSessions: [],
      focusSessions: []
    };
    this.clearExpiredCache();
    await this.save();
  }

  /**
   * 按月清理旧数据，保留最近N个月的数据
   * @param monthsToKeep 保留的月数
   */
  async cleanupOldData(monthsToKeep: number = 12): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffTime = cutoffDate.getTime();
    
    const originalPomodoroCount = this.data.pomodoroSessions.length;
    const originalFocusCount = this.data.focusSessions.length;
    
    this.data.pomodoroSessions = this.data.pomodoroSessions.filter(
      session => session.startTime >= cutoffTime
    );
    
    this.data.focusSessions = this.data.focusSessions.filter(
      session => session.startTime >= cutoffTime
    );
    
    const removedPomodoros = originalPomodoroCount - this.data.pomodoroSessions.length;
    const removedFocus = originalFocusCount - this.data.focusSessions.length;
    
    if (removedPomodoros > 0 || removedFocus > 0) {
      this.clearExpiredCache();
      await this.save();
      debugLog(`清理了 ${removedPomodoros} 条番茄钟记录和 ${removedFocus} 条专注记录`);
    }
  }

  /**
   * 导出数据为JSON字符串
   */
  exportDataAsJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * 从JSON字符串导入数据
   */
  async importDataFromJson(jsonStr: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(jsonStr) as StorageData;
      
      if (!importedData.pomodoroSessions || !importedData.focusSessions) {
        return false;
      }
      
      this.data = importedData;
      this.clearExpiredCache();
      await this.save();
      return true;
    } catch (error) {
      debugLog('导入数据失败:', error);
      return false;
    }
  }
  
  /**
   * 获取数据统计信息
   */
  getDataStats(): { pomodoroCount: number, focusCount: number, dataSize: string } {
    const dataStr = JSON.stringify(this.data);
    const dataSize = Math.round(dataStr.length / 1024);
    
    return {
      pomodoroCount: this.data.pomodoroSessions.length,
      focusCount: this.data.focusSessions.length,
      dataSize: `${dataSize} KB`
    };
  }
} 