/**
 * 防抖函数
 * 在指定时间段内多次调用时，只执行最后一次调用
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * 在指定时间段内多次调用时，按照指定的时间间隔执行
 * 
 * @param func 要节流的函数
 * @param limit 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();
    
    if (!lastRan) {
      func.apply(context, args);
      lastRan = now;
      return;
    }
    
    if (lastFunc) {
      clearTimeout(lastFunc);
    }
    
    const remaining = limit - (now - lastRan);
    
    if (remaining <= 0) {
      func.apply(context, args);
      lastRan = now;
    } else {
      lastFunc = setTimeout(() => {
        func.apply(context, args);
        lastRan = Date.now();
      }, remaining);
    }
  };
} 