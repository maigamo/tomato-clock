/**
 * 图表组件
 * 用于显示番茄钟和专注会话的统计数据
 */

import { Chart, registerables } from 'chart.js';
import { t } from '../../i18n';
import { PomodoroSession, FocusSession } from '../../data/storage';
import { Notice, setIcon } from 'obsidian';

// 注册所有Chart.js组件
Chart.register(...registerables);

/**
 * 图表颜色配置
 */
const CHART_COLORS = {
  work: {
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgba(255, 99, 132, 1)',
  },
  shortBreak: {
    backgroundColor: 'rgba(54, 162, 235, 0.2)',
    borderColor: 'rgba(54, 162, 235, 1)',
  },
  longBreak: {
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    borderColor: 'rgba(153, 102, 255, 1)',
  },
  focus: {
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
  }
};

/**
 * 创建每日番茄钟统计图表
 * @param container 容器元素
 * @param sessions 番茄钟会话数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function createDailyPomodoroChart(
  container: HTMLElement,
  sessions: PomodoroSession[],
  startDate: Date,
  endDate: Date
): Chart | null {
  // 清空容器
  container.empty();
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  container.append(canvas);
  
  if (sessions.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = t().stats.noData;
    emptyMessage.className = 'tomato-clock-empty-chart-message';
    container.append(emptyMessage);
    return null;
  }
  
  // 准备日期标签和数据
  const dateLabels: string[] = [];
  const workData: number[] = [];
  
  // 创建从开始日期到结束日期的日期范围
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // 添加日期标签 (MM-DD格式)
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    dateLabels.push(`${month}-${day}`);
    
    // 初始化数据为0
    workData.push(0);
    
    // 前进一天
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 统计每日番茄钟工作时段数量
  for (const session of sessions) {
    if (session.type === 'work' && session.completed) {
      const sessionDate = new Date(session.startTime);
      // 计算日期在数组中的索引
      const timeDiff = Math.floor((sessionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (timeDiff >= 0 && timeDiff < dateLabels.length) {
        workData[timeDiff]++;
      }
    }
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dateLabels,
      datasets: [{
        label: t().stats.workSessions,
        data: workData,
        backgroundColor: CHART_COLORS.work.backgroundColor,
        borderColor: CHART_COLORS.work.borderColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          },
          title: {
            display: true,
            text: t().stats.workSessions
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: t().stats.workSessions
        }
      }
    }
  });
}

/**
 * 创建每日专注时间统计图表
 * @param container 容器元素
 * @param sessions 专注会话数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function createDailyFocusChart(
  container: HTMLElement,
  sessions: FocusSession[],
  startDate: Date,
  endDate: Date
): Chart | null {
  // 清空容器
  container.empty();
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  container.append(canvas);
  
  if (sessions.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = t().stats.noData;
    emptyMessage.className = 'tomato-clock-empty-chart-message';
    container.append(emptyMessage);
    return null;
  }
  
  // 准备日期标签和数据
  const dateLabels: string[] = [];
  const focusData: number[] = [];
  
  // 创建从开始日期到结束日期的日期范围
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // 添加日期标签 (MM-DD格式)
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    dateLabels.push(`${month}-${day}`);
    
    // 初始化数据为0
    focusData.push(0);
    
    // 前进一天
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 统计每日专注时间（小时）
  for (const session of sessions) {
    const sessionDate = new Date(session.startTime);
    // 计算日期在数组中的索引
    const timeDiff = Math.floor((sessionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (timeDiff >= 0 && timeDiff < dateLabels.length) {
      // 累加专注时间（小时）
      focusData[timeDiff] += session.duration / (1000 * 60 * 60);
    }
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dateLabels,
      datasets: [{
        label: t().stats.focusDuration,
        data: focusData,
        backgroundColor: CHART_COLORS.focus.backgroundColor,
        borderColor: CHART_COLORS.focus.borderColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '小时'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: t().stats.focusDuration
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw as number;
              return `${value.toFixed(1)} 小时`;
            }
          }
        }
      }
    }
  });
}

/**
 * 创建番茄钟类型分布饼图
 * @param container 容器元素
 * @param sessions 番茄钟会话数据
 */
export function createPomodoroTypeChart(
  container: HTMLElement,
  sessions: PomodoroSession[]
): Chart | null {
  // 清空容器
  container.empty();
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  container.append(canvas);
  
  if (sessions.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = t().stats.noData;
    emptyMessage.className = 'tomato-clock-empty-chart-message';
    container.append(emptyMessage);
    return null;
  }
  
  // 准备数据
  let workCount = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;
  
  for (const session of sessions) {
    if (session.completed) {
      if (session.type === 'work') {
        workCount++;
      } else if (session.type === 'shortBreak') {
        shortBreakCount++;
      } else if (session.type === 'longBreak') {
        longBreakCount++;
      }
    }
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [
        t().stats.work || '工作',
        t().stats.shortBreak || '短休息',
        t().stats.longBreak || '长休息'
      ],
      datasets: [{
        data: [workCount, shortBreakCount, longBreakCount],
        backgroundColor: [
          CHART_COLORS.work.backgroundColor,
          CHART_COLORS.shortBreak.backgroundColor,
          CHART_COLORS.longBreak.backgroundColor
        ],
        borderColor: [
          CHART_COLORS.work.borderColor,
          CHART_COLORS.shortBreak.borderColor,
          CHART_COLORS.longBreak.borderColor
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: t().stats.sessionTypes
        }
      }
    }
  });
}

/**
 * 创建时间分布图表
 * @param container 容器元素
 * @param pomodoroSessions 番茄钟会话数据
 * @param focusSessions 专注会话数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 */
export function createTimeDistributionChart(
  container: HTMLElement,
  pomodoroSessions: PomodoroSession[],
  focusSessions: FocusSession[],
  startDate: Date,
  endDate: Date
): Chart | null {
  // 清空容器
  container.empty();
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  container.append(canvas);
  
  if (pomodoroSessions.length === 0 && focusSessions.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = t().stats.noData;
    emptyMessage.className = 'tomato-clock-empty-chart-message';
    container.append(emptyMessage);
    return null;
  }
  
  // 准备数据
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const pomodoroData = Array(24).fill(0);
  const focusData = Array(24).fill(0);
  
  // 统计番茄钟分布
  for (const session of pomodoroSessions) {
    if (session.completed && session.type === 'work') {
      const sessionDate = new Date(session.startTime);
      const hour = sessionDate.getHours();
      pomodoroData[hour]++;
    }
  }
  
  // 统计专注会话分布（小时）
  for (const session of focusSessions) {
    const sessionDate = new Date(session.startTime);
    const hour = sessionDate.getHours();
    // 累加专注时间（小时）
    focusData[hour] += session.duration / (1000 * 60 * 60);
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hourLabels,
      datasets: [
        {
          label: t().stats.workSessions,
          data: pomodoroData,
          backgroundColor: CHART_COLORS.work.backgroundColor,
          borderColor: CHART_COLORS.work.borderColor,
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: t().stats.focusDuration,
          data: focusData,
          backgroundColor: CHART_COLORS.focus.backgroundColor,
          borderColor: CHART_COLORS.focus.borderColor,
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: t().stats.workSessions
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: t().stats.focusDuration
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: t().stats.timeDistribution
        }
      }
    }
  });
}

/**
 * 创建导出按钮
 * @param container 容器元素
 * @param pomodoroSessions 番茄钟会话数据
 * @param focusSessions 专注会话数据
 */
export function createExportButton(
  container: HTMLElement,
  pomodoroSessions: PomodoroSession[],
  focusSessions: FocusSession[]
): void {
  // 清空容器
  container.empty();
  
  // 如果没有数据，则不显示导出按钮
  if (pomodoroSessions.length === 0 && focusSessions.length === 0) {
    return;
  }
  
  // 创建导出按钮
  const exportBtn = document.createElement('button');
  exportBtn.className = 'tomato-clock-export-btn';
  exportBtn.textContent = t().stats.exportData;
  setIcon(exportBtn.createSpan({ cls: 'tomato-clock-btn-icon' }), 'download');
  container.append(exportBtn);
  
  // 导出按钮点击事件
  exportBtn.addEventListener('click', () => {
    // 生成CSV内容
    const pomodoroCSV = convertToCSV(pomodoroSessions, true);
    const focusCSV = convertToCSV(focusSessions, false);
    
    // 创建Blob对象
    const blob = new Blob([pomodoroCSV, '\n\n', focusCSV], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tomato-clock-data-${new Date().toISOString().slice(0, 10)}.csv`);
    link.classList.add('tomato-clock-hidden');
    container.append(link);
    
    // 触发下载
    link.click();
    
    // 清理URL对象
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 100);
    
    // 显示通知
    new Notice('数据导出成功');
  });
}

/**
 * 将数据转换为CSV格式
 * @param data 数据
 * @param isPomodoro 是否为番茄钟数据
 * @returns CSV格式的字符串
 */
function convertToCSV(data: PomodoroSession[] | FocusSession[], isPomodoro: boolean): string {
  if (data.length === 0) return '';
  
  // 设置CSV标题行
  let csvContent = isPomodoro
    ? `${t().stats.type},${t().stats.startTime},${'结束时间'},${t().stats.duration},${t().stats.completed}\n`
    : `${t().stats.startTime},${'结束时间'},${t().stats.duration}\n`;
  
  // 添加数据行
  for (const item of data) {
    if (isPomodoro) {
      const session = item as PomodoroSession;
      const endTimeStr = session.endTime ? new Date(session.endTime).toISOString() : '';
      csvContent += `${session.type},${new Date(session.startTime).toISOString()},${endTimeStr},${session.duration},${session.completed}\n`;
    } else {
      const session = item as FocusSession;
      const endTime = new Date(session.startTime + session.duration);
      csvContent += `${new Date(session.startTime).toISOString()},${endTime.toISOString()},${session.duration}\n`;
    }
  }
  
  return csvContent;
} 