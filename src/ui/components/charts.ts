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
  container.innerHTML = '';
  
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
  container.innerHTML = '';
  
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
  container.innerHTML = '';
  
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
  
  // 统计各类型会话数量
  let workCount = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;
  
  for (const session of sessions) {
    if (session.completed) {
      switch (session.type) {
        case 'work':
          workCount++;
          break;
        case 'shortBreak':
          shortBreakCount++;
          break;
        case 'longBreak':
          longBreakCount++;
          break;
      }
    }
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [t().stats.work, t().stats.shortBreak, t().stats.longBreak],
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
 * 创建时间分布图
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
  container.innerHTML = '';
  
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
  
  // 准备小时标签和数据
  const hourLabels = Array.from(Array(24).keys()).map(hour => `${hour}:00`);
  const workData = Array(24).fill(0);
  const focusData = Array(24).fill(0);
  
  // 统计番茄钟工作时段分布
  for (const session of pomodoroSessions) {
    if (session.type === 'work' && session.completed) {
      const sessionDate = new Date(session.startTime);
      const hour = sessionDate.getHours();
      workData[hour]++;
    }
  }
  
  // 统计专注时段分布
  for (const session of focusSessions) {
    const sessionDate = new Date(session.startTime);
    const hour = sessionDate.getHours();
    // 使用时长的分数表示（小时）
    focusData[hour] += session.duration / (1000 * 60 * 60);
  }
  
  // 创建图表
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourLabels,
      datasets: [
        {
          label: t().stats.workSessions,
          data: workData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: t().stats.focusDuration,
          data: focusData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
          tension: 0.1,
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
          title: {
            display: true,
            text: t().stats.workSessions
          },
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: t().stats.focusDuration
          },
          beginAtZero: true,
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
  container.innerHTML = '';
  
  // 创建导出CSV按钮
  const exportButton = document.createElement('button');
  exportButton.className = 'tomato-clock-export-btn';
  setIcon(exportButton, 'download');
  exportButton.append(document.createTextNode(t().stats.exportData));
  
  exportButton.addEventListener('click', () => {
    try {
      // 生成数据
      const lines = [];
      
      // 添加标题行
      lines.push(`${t().stats.type},${t().stats.date},${t().stats.startTime},${t().stats.duration},${t().stats.note}`);
      
      // 添加番茄钟数据
      for (const session of pomodoroSessions) {
        const startDate = new Date(session.startTime);
        const endDate = new Date(session.endTime);
        
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        
        const durationMinutes = session.duration / (1000 * 60);
        
        lines.push(`${t().plugin.name}-${t().stats[session.type]},${dateStr},${startTimeStr},${endTimeStr},${durationMinutes.toFixed(1)},${session.completed ? t().stats.completed : ''}`);
      }
      
      // 添加专注会话数据
      for (const session of focusSessions) {
        const startDate = new Date(session.startTime);
        const endDate = new Date(session.endTime);
        
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
        
        const durationMinutes = session.duration / (1000 * 60);
        
        lines.push(`${t().stats.focusMode},${dateStr},${startTimeStr},${endTimeStr},${durationMinutes.toFixed(1)},${session.noteId || ''}`);
      }
      
      // 生成CSV内容
      const csvContent = lines.join('\n');
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 创建下载链接
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // 当前日期作为文件名
      const today = new Date();
      const fileName = `tomato_clock_stats_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      // 添加到文档并点击
      document.body.append(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      new Notice('数据导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      new Notice('导出数据失败');
    }
  });
  
  container.append(exportButton);
} 