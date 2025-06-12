/**
 * 前端调试工具与技巧
 * 
 * 本文件展示了各种前端调试工具和技巧
 * 包括浏览器开发者工具、调试库、性能分析等
 */

// 1. 自定义调试工具类
class DebugTool {
  constructor(options = {}) {
    this.options = {
      enabled: process.env.NODE_ENV === 'development',
      logLevel: 'info', // debug, info, warn, error
      showTimestamp: true,
      showStackTrace: false,
      maxLogs: 1000,
      ...options
    };
    
    this.logs = [];
    this.timers = new Map();
    this.counters = new Map();
    this.groups = [];
    
    if (this.options.enabled) {
      this.init();
    }
  }
  
  init() {
    // 添加全局调试方法
    window.debug = this;
    
    // 监听未捕获的错误
    window.addEventListener('error', (event) => {
      this.error('Uncaught Error:', event.error);
    });
    
    // 监听未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection:', event.reason);
    });
  }
  
  // 日志级别检查
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.options.logLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }
  
  // 格式化日志消息
  formatMessage(level, args) {
    const timestamp = this.options.showTimestamp 
      ? `[${new Date().toISOString()}]` 
      : '';
    
    const levelTag = `[${level.toUpperCase()}]`;
    const groupIndent = '  '.repeat(this.groups.length);
    
    return {
      prefix: `${timestamp}${levelTag}${groupIndent}`,
      args: Array.from(args)
    };
  }
  
  // 基础日志方法
  log(level, ...args) {
    if (!this.options.enabled || !this.shouldLog(level)) {
      return;
    }
    
    const formatted = this.formatMessage(level, args);
    const logEntry = {
      level,
      timestamp: Date.now(),
      message: formatted.args.join(' '),
      args: formatted.args,
      stack: this.options.showStackTrace ? new Error().stack : null
    };
    
    // 存储日志
    this.logs.push(logEntry);
    if (this.logs.length > this.options.maxLogs) {
      this.logs.shift();
    }
    
    // 输出到控制台
    const consoleMethod = console[level] || console.log;
    consoleMethod(formatted.prefix, ...formatted.args);
    
    if (this.options.showStackTrace && logEntry.stack) {
      console.trace();
    }
  }
  
  // 各级别日志方法
  debug(...args) {
    this.log('debug', ...args);
  }
  
  info(...args) {
    this.log('info', ...args);
  }
  
  warn(...args) {
    this.log('warn', ...args);
  }
  
  error(...args) {
    this.log('error', ...args);
  }
  
  // 分组日志
  group(label) {
    this.groups.push(label);
    console.group(label);
  }
  
  groupCollapsed(label) {
    this.groups.push(label);
    console.groupCollapsed(label);
  }
  
  groupEnd() {
    this.groups.pop();
    console.groupEnd();
  }
  
  // 计时器
  time(label) {
    this.timers.set(label, performance.now());
    console.time(label);
  }
  
  timeEnd(label) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.timers.delete(label);
      this.info(`Timer ${label}: ${duration.toFixed(2)}ms`);
      console.timeEnd(label);
      return duration;
    }
  }
  
  timeLog(label) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.info(`Timer ${label}: ${duration.toFixed(2)}ms`);
      console.timeLog(label);
      return duration;
    }
  }
  
  // 计数器
  count(label = 'default') {
    const current = this.counters.get(label) || 0;
    const newCount = current + 1;
    this.counters.set(label, newCount);
    this.info(`Count ${label}: ${newCount}`);
    console.count(label);
    return newCount;
  }
  
  countReset(label = 'default') {
    this.counters.set(label, 0);
    console.countReset(label);
  }
  
  // 表格显示
  table(data) {
    console.table(data);
  }
  
  // 断言
  assert(condition, ...args) {
    if (!condition) {
      this.error('Assertion failed:', ...args);
      console.assert(condition, ...args);
    }
  }
  
  // 清空日志
  clear() {
    this.logs = [];
    console.clear();
  }
  
  // 获取日志历史
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }
  
  // 导出日志
  exportLogs() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// 2. 性能分析工具
class PerformanceProfiler {
  constructor() {
    this.profiles = new Map();
    this.marks = new Map();
  }
  
  // 开始性能分析
  startProfile(name) {
    const profile = {
      name,
      startTime: performance.now(),
      marks: [],
      measures: []
    };
    
    this.profiles.set(name, profile);
    performance.mark(`${name}-start`);
    
    return {
      mark: (label) => this.mark(name, label),
      measure: (label, startMark) => this.measure(name, label, startMark),
      end: () => this.endProfile(name)
    };
  }
  
  // 添加标记
  mark(profileName, label) {
    const markName = `${profileName}-${label}`;
    const timestamp = performance.now();
    
    performance.mark(markName);
    
    const profile = this.profiles.get(profileName);
    if (profile) {
      profile.marks.push({
        label,
        timestamp,
        relativeTime: timestamp - profile.startTime
      });
    }
    
    return markName;
  }
  
  // 测量时间间隔
  measure(profileName, label, startMark) {
    const measureName = `${profileName}-${label}`;
    const startMarkName = startMark || `${profileName}-start`;
    
    performance.measure(measureName, startMarkName);
    
    const entries = performance.getEntriesByName(measureName, 'measure');
    const entry = entries[entries.length - 1];
    
    const profile = this.profiles.get(profileName);
    if (profile && entry) {
      profile.measures.push({
        label,
        duration: entry.duration,
        startTime: entry.startTime
      });
    }
    
    return entry ? entry.duration : 0;
  }
  
  // 结束性能分析
  endProfile(name) {
    const profile = this.profiles.get(name);
    if (!profile) return null;
    
    const endTime = performance.now();
    profile.endTime = endTime;
    profile.totalDuration = endTime - profile.startTime;
    
    performance.mark(`${name}-end`);
    performance.measure(`${name}-total`, `${name}-start`, `${name}-end`);
    
    // 生成报告
    const report = this.generateReport(profile);
    console.group(`Performance Profile: ${name}`);
    console.log('Total Duration:', `${profile.totalDuration.toFixed(2)}ms`);
    console.table(profile.marks);
    console.table(profile.measures);
    console.groupEnd();
    
    return report;
  }
  
  // 生成性能报告
  generateReport(profile) {
    return {
      name: profile.name,
      totalDuration: profile.totalDuration,
      marks: profile.marks,
      measures: profile.measures,
      summary: {
        totalMarks: profile.marks.length,
        totalMeasures: profile.measures.length,
        longestMeasure: profile.measures.reduce((max, measure) => 
          measure.duration > max.duration ? measure : max, 
          { duration: 0 }
        )
      }
    };
  }
  
  // 获取所有性能条目
  getAllEntries() {
    return {
      navigation: performance.getEntriesByType('navigation'),
      resource: performance.getEntriesByType('resource'),
      measure: performance.getEntriesByType('measure'),
      mark: performance.getEntriesByType('mark'),
      paint: performance.getEntriesByType('paint')
    };
  }
  
  // 分析资源加载
  analyzeResources() {
    const resources = performance.getEntriesByType('resource');
    const analysis = {
      total: resources.length,
      byType: {},
      slowest: [],
      largest: [],
      failed: []
    };
    
    resources.forEach(resource => {
      // 按类型分组
      const type = this.getResourceType(resource.name);
      if (!analysis.byType[type]) {
        analysis.byType[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        };
      }
      
      analysis.byType[type].count++;
      analysis.byType[type].totalSize += resource.transferSize || 0;
      analysis.byType[type].totalDuration += resource.duration;
      
      // 记录慢资源
      if (resource.duration > 1000) {
        analysis.slowest.push({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize
        });
      }
      
      // 记录大资源
      if (resource.transferSize > 100000) {
        analysis.largest.push({
          name: resource.name,
          size: resource.transferSize,
          duration: resource.duration
        });
      }
    });
    
    // 排序
    analysis.slowest.sort((a, b) => b.duration - a.duration);
    analysis.largest.sort((a, b) => b.size - a.size);
    
    return analysis;
  }
  
  // 获取资源类型
  getResourceType(url) {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }
}

// 3. 内存分析工具
class MemoryAnalyzer {
  constructor() {
    this.snapshots = [];
  }
  
  // 获取内存信息
  getMemoryInfo() {
    if (!performance.memory) {
      console.warn('Memory API not available');
      return null;
    }
    
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };
  }
  
  // 创建内存快照
  takeSnapshot(label = '') {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return null;
    
    const snapshot = {
      label,
      ...memoryInfo,
      id: this.snapshots.length
    };
    
    this.snapshots.push(snapshot);
    console.log(`Memory Snapshot ${snapshot.id} (${label}):`, snapshot);
    
    return snapshot;
  }
  
  // 比较内存快照
  compareSnapshots(snapshot1Id, snapshot2Id) {
    const snapshot1 = this.snapshots[snapshot1Id];
    const snapshot2 = this.snapshots[snapshot2Id];
    
    if (!snapshot1 || !snapshot2) {
      console.error('Invalid snapshot IDs');
      return null;
    }
    
    const comparison = {
      usedJSHeapSizeDiff: snapshot2.usedJSHeapSize - snapshot1.usedJSHeapSize,
      totalJSHeapSizeDiff: snapshot2.totalJSHeapSize - snapshot1.totalJSHeapSize,
      timeDiff: snapshot2.timestamp - snapshot1.timestamp
    };
    
    console.group(`Memory Comparison: ${snapshot1.label} vs ${snapshot2.label}`);
    console.log('Used Heap Size Change:', this.formatBytes(comparison.usedJSHeapSizeDiff));
    console.log('Total Heap Size Change:', this.formatBytes(comparison.totalJSHeapSizeDiff));
    console.log('Time Difference:', `${comparison.timeDiff}ms`);
    console.groupEnd();
    
    return comparison;
  }
  
  // 监控内存使用
  startMemoryMonitoring(interval = 5000) {
    const monitor = setInterval(() => {
      const memoryInfo = this.getMemoryInfo();
      if (memoryInfo) {
        const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
        }
        
        console.log(`Memory Usage: ${this.formatBytes(memoryInfo.usedJSHeapSize)} (${usagePercent.toFixed(2)}%)`);
      }
    }, interval);
    
    return {
      stop: () => clearInterval(monitor)
    };
  }
  
  // 格式化字节数
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 检测内存泄漏
  detectMemoryLeaks(threshold = 10 * 1024 * 1024) { // 10MB
    if (this.snapshots.length < 2) {
      console.warn('Need at least 2 snapshots to detect memory leaks');
      return false;
    }
    
    const latest = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];
    
    const memoryIncrease = latest.usedJSHeapSize - previous.usedJSHeapSize;
    
    if (memoryIncrease > threshold) {
      console.warn(`Potential memory leak detected: ${this.formatBytes(memoryIncrease)} increase`);
      return true;
    }
    
    return false;
  }
}

// 4. DOM 调试工具
class DOMDebugger {
  constructor() {
    this.observers = [];
    this.highlightedElements = new Set();
  }
  
  // 高亮元素
  highlight(selector, color = 'red') {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      element.style.outline = `2px solid ${color}`;
      element.style.outlineOffset = '2px';
      this.highlightedElements.add(element);
    });
    
    console.log(`Highlighted ${elements.length} elements matching "${selector}"`);
    return elements;
  }
  
  // 清除高亮
  clearHighlight() {
    this.highlightedElements.forEach(element => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    });
    
    this.highlightedElements.clear();
    console.log('Cleared all highlights');
  }
  
  // 监听 DOM 变化
  watchDOM(selector, callback) {
    const targetNode = selector ? document.querySelector(selector) : document.body;
    
    if (!targetNode) {
      console.error(`Element not found: ${selector}`);
      return null;
    }
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        console.group('DOM Mutation');
        console.log('Type:', mutation.type);
        console.log('Target:', mutation.target);
        
        if (mutation.type === 'childList') {
          console.log('Added nodes:', mutation.addedNodes);
          console.log('Removed nodes:', mutation.removedNodes);
        } else if (mutation.type === 'attributes') {
          console.log('Attribute:', mutation.attributeName);
          console.log('Old value:', mutation.oldValue);
        }
        
        console.groupEnd();
        
        if (callback) {
          callback(mutation);
        }
      });
    });
    
    observer.observe(targetNode, {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      subtree: true
    });
    
    this.observers.push(observer);
    
    return {
      disconnect: () => {
        observer.disconnect();
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      }
    };
  }
  
  // 分析元素
  analyzeElement(selector) {
    const element = document.querySelector(selector);
    
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return null;
    }
    
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    const analysis = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      attributes: Array.from(element.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      dimensions: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      },
      styles: {
        display: computedStyle.display,
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
      },
      children: element.children.length,
      textContent: element.textContent ? element.textContent.substring(0, 100) : ''
    };
    
    console.group(`Element Analysis: ${selector}`);
    console.table(analysis.attributes);
    console.log('Dimensions:', analysis.dimensions);
    console.log('Computed Styles:', analysis.styles);
    console.log('Children Count:', analysis.children);
    console.groupEnd();
    
    return analysis;
  }
  
  // 查找性能问题
  findPerformanceIssues() {
    const issues = [];
    
    // 检查大量 DOM 节点
    const totalNodes = document.querySelectorAll('*').length;
    if (totalNodes > 1500) {
      issues.push({
        type: 'dom-size',
        message: `Large DOM size: ${totalNodes} nodes`,
        severity: 'warning'
      });
    }
    
    // 检查深度嵌套
    const maxDepth = this.getMaxDOMDepth();
    if (maxDepth > 32) {
      issues.push({
        type: 'dom-depth',
        message: `Deep DOM nesting: ${maxDepth} levels`,
        severity: 'warning'
      });
    }
    
    // 检查内联样式
    const inlineStyles = document.querySelectorAll('[style]').length;
    if (inlineStyles > 50) {
      issues.push({
        type: 'inline-styles',
        message: `Many inline styles: ${inlineStyles} elements`,
        severity: 'info'
      });
    }
    
    // 检查未优化的图片
    const images = document.querySelectorAll('img');
    let unoptimizedImages = 0;
    images.forEach(img => {
      if (!img.loading && !img.getAttribute('loading')) {
        unoptimizedImages++;
      }
    });
    
    if (unoptimizedImages > 0) {
      issues.push({
        type: 'image-optimization',
        message: `${unoptimizedImages} images without lazy loading`,
        severity: 'info'
      });
    }
    
    console.group('DOM Performance Issues');
    issues.forEach(issue => {
      const method = issue.severity === 'warning' ? 'warn' : 'info';
      console[method](`[${issue.type}] ${issue.message}`);
    });
    console.groupEnd();
    
    return issues;
  }
  
  // 获取最大 DOM 深度
  getMaxDOMDepth(element = document.body, depth = 0) {
    let maxDepth = depth;
    
    for (const child of element.children) {
      const childDepth = this.getMaxDOMDepth(child, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    
    return maxDepth;
  }
  
  // 清理观察器
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearHighlight();
  }
}

// 5. 网络调试工具
class NetworkDebugger {
  constructor() {
    this.requests = [];
    this.interceptors = [];
    this.init();
  }
  
  init() {
    // 拦截 fetch 请求
    this.interceptFetch();
    
    // 拦截 XMLHttpRequest
    this.interceptXHR();
  }
  
  // 拦截 fetch 请求
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const request = {
        id: this.generateId(),
        method: 'GET',
        url: args[0],
        startTime,
        type: 'fetch'
      };
      
      if (args[1]) {
        request.method = args[1].method || 'GET';
        request.headers = args[1].headers;
        request.body = args[1].body;
      }
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        request.endTime = endTime;
        request.duration = endTime - startTime;
        request.status = response.status;
        request.statusText = response.statusText;
        request.responseHeaders = this.headersToObject(response.headers);
        
        this.addRequest(request);
        this.logRequest(request);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        request.endTime = endTime;
        request.duration = endTime - startTime;
        request.error = error.message;
        
        this.addRequest(request);
        this.logRequest(request);
        
        throw error;
      }
    };
  }
  
  // 拦截 XMLHttpRequest
  interceptXHR() {
    const originalXHR = window.XMLHttpRequest;
    const self = this;
    
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const request = {
        id: self.generateId(),
        type: 'xhr',
        startTime: null
      };
      
      // 拦截 open 方法
      const originalOpen = xhr.open;
      xhr.open = function(method, url, ...args) {
        request.method = method;
        request.url = url;
        return originalOpen.call(this, method, url, ...args);
      };
      
      // 拦截 send 方法
      const originalSend = xhr.send;
      xhr.send = function(body) {
        request.startTime = performance.now();
        request.body = body;
        
        xhr.addEventListener('loadend', () => {
          request.endTime = performance.now();
          request.duration = request.endTime - request.startTime;
          request.status = xhr.status;
          request.statusText = xhr.statusText;
          request.responseHeaders = self.parseResponseHeaders(xhr.getAllResponseHeaders());
          
          if (xhr.status >= 400) {
            request.error = `HTTP ${xhr.status} ${xhr.statusText}`;
          }
          
          self.addRequest(request);
          self.logRequest(request);
        });
        
        return originalSend.call(this, body);
      };
      
      return xhr;
    };
  }
  
  // 生成请求 ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Headers 转对象
  headersToObject(headers) {
    const obj = {};
    for (const [key, value] of headers.entries()) {
      obj[key] = value;
    }
    return obj;
  }
  
  // 解析响应头
  parseResponseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    
    headerStr.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0]] = parts[1];
      }
    });
    
    return headers;
  }
  
  // 添加请求记录
  addRequest(request) {
    this.requests.push(request);
    
    // 限制记录数量
    if (this.requests.length > 100) {
      this.requests.shift();
    }
  }
  
  // 记录请求日志
  logRequest(request) {
    const color = request.error ? 'color: red' : 
                 request.status >= 400 ? 'color: orange' : 
                 'color: green';
    
    console.log(
      `%c[${request.type.toUpperCase()}] ${request.method} ${request.url} - ${request.status || 'ERROR'} (${request.duration?.toFixed(2)}ms)`,
      color
    );
    
    if (request.error) {
      console.error('Request error:', request.error);
    }
  }
  
  // 获取请求统计
  getStats() {
    const stats = {
      total: this.requests.length,
      successful: 0,
      failed: 0,
      byMethod: {},
      byStatus: {},
      averageDuration: 0,
      slowest: null,
      fastest: null
    };
    
    let totalDuration = 0;
    
    this.requests.forEach(request => {
      // 成功/失败统计
      if (request.error || (request.status && request.status >= 400)) {
        stats.failed++;
      } else {
        stats.successful++;
      }
      
      // 按方法统计
      stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
      
      // 按状态码统计
      if (request.status) {
        stats.byStatus[request.status] = (stats.byStatus[request.status] || 0) + 1;
      }
      
      // 时间统计
      if (request.duration) {
        totalDuration += request.duration;
        
        if (!stats.slowest || request.duration > stats.slowest.duration) {
          stats.slowest = request;
        }
        
        if (!stats.fastest || request.duration < stats.fastest.duration) {
          stats.fastest = request;
        }
      }
    });
    
    stats.averageDuration = totalDuration / this.requests.length;
    
    console.group('Network Statistics');
    console.table(stats.byMethod);
    console.table(stats.byStatus);
    console.log('Average Duration:', `${stats.averageDuration.toFixed(2)}ms`);
    console.log('Slowest Request:', stats.slowest);
    console.log('Fastest Request:', stats.fastest);
    console.groupEnd();
    
    return stats;
  }
  
  // 清空请求记录
  clear() {
    this.requests = [];
    console.log('Network debug history cleared');
  }
}

// 6. 综合调试管理器
class DebugManager {
  constructor(options = {}) {
    this.options = {
      enableConsoleDebug: true,
      enablePerformanceProfiler: true,
      enableMemoryAnalyzer: true,
      enableDOMDebugger: true,
      enableNetworkDebugger: true,
      ...options
    };
    
    this.tools = {};
    this.init();
  }
  
  init() {
    // 初始化各种调试工具
    if (this.options.enableConsoleDebug) {
      this.tools.console = new DebugTool();
    }
    
    if (this.options.enablePerformanceProfiler) {
      this.tools.performance = new PerformanceProfiler();
    }
    
    if (this.options.enableMemoryAnalyzer) {
      this.tools.memory = new MemoryAnalyzer();
    }
    
    if (this.options.enableDOMDebugger) {
      this.tools.dom = new DOMDebugger();
    }
    
    if (this.options.enableNetworkDebugger) {
      this.tools.network = new NetworkDebugger();
    }
    
    // 添加全局快捷方式
    window.debugTools = this.tools;
    
    console.log('Debug tools initialized:', Object.keys(this.tools));
  }
  
  // 获取调试工具
  getTool(name) {
    return this.tools[name];
  }
  
  // 运行诊断
  runDiagnostics() {
    console.group('System Diagnostics');
    
    // 性能诊断
    if (this.tools.performance) {
      const resourceAnalysis = this.tools.performance.analyzeResources();
      console.log('Resource Analysis:', resourceAnalysis);
    }
    
    // 内存诊断
    if (this.tools.memory) {
      const memoryInfo = this.tools.memory.getMemoryInfo();
      console.log('Memory Info:', memoryInfo);
    }
    
    // DOM 诊断
    if (this.tools.dom) {
      const domIssues = this.tools.dom.findPerformanceIssues();
      console.log('DOM Issues:', domIssues);
    }
    
    // 网络诊断
    if (this.tools.network) {
      const networkStats = this.tools.network.getStats();
      console.log('Network Stats:', networkStats);
    }
    
    console.groupEnd();
  }
  
  // 清理所有工具
  cleanup() {
    Object.values(this.tools).forEach(tool => {
      if (tool.cleanup) {
        tool.cleanup();
      }
    });
    
    delete window.debugTools;
    console.log('Debug tools cleaned up');
  }
}

// 7. 使用示例
const initDebugging = () => {
  // 初始化调试管理器
  const debugManager = new DebugManager();
  
  // 快捷键绑定
  document.addEventListener('keydown', (event) => {
    // Ctrl + Shift + D: 运行诊断
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      debugManager.runDiagnostics();
    }
    
    // Ctrl + Shift + C: 清理调试工具
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      debugManager.cleanup();
    }
  });
  
  return debugManager;
};

// 导出模块
export {
  DebugTool,
  PerformanceProfiler,
  MemoryAnalyzer,
  DOMDebugger,
  NetworkDebugger,
  DebugManager,
  initDebugging
};

/**
 * 前端调试最佳实践：
 * 
 * 1. 控制台调试：
 *    - 使用分组和格式化输出
 *    - 合理设置日志级别
 *    - 利用断点和条件断点
 * 
 * 2. 性能调试：
 *    - 使用 Performance API
 *    - 分析资源加载时间
 *    - 监控长任务和阻塞
 * 
 * 3. 内存调试：
 *    - 定期检查内存使用
 *    - 识别内存泄漏模式
 *    - 使用内存快照对比
 * 
 * 4. 网络调试：
 *    - 监控请求响应时间
 *    - 分析失败请求
 *    - 优化请求策略
 * 
 * 5. DOM 调试：
 *    - 监听 DOM 变化
 *    - 分析元素性能影响
 *    - 检查布局问题
 */