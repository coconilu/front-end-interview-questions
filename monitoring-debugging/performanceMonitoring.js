/**
 * 前端性能监控与调试
 * 
 * 本文件展示了前端性能监控的各种方法和工具
 * 包括性能指标收集、错误监控、用户行为追踪等
 */

// 1. Web Performance API 性能监控
class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableResourceTiming: true,
      enableUserTiming: true,
      enableNavigationTiming: true,
      enablePaintTiming: true,
      enableLCP: true,
      enableFID: true,
      enableCLS: true,
      reportInterval: 30000, // 30秒上报一次
      ...options
    };
    
    this.metrics = new Map();
    this.observers = [];
    this.init();
  }
  
  init() {
    // 监听页面加载完成
    if (document.readyState === 'complete') {
      this.collectInitialMetrics();
    } else {
      window.addEventListener('load', () => {
        this.collectInitialMetrics();
      });
    }
    
    // 设置性能观察器
    this.setupPerformanceObservers();
    
    // 定期上报数据
    this.startReporting();
  }
  
  // 收集初始性能指标
  collectInitialMetrics() {
    // Navigation Timing
    if (this.options.enableNavigationTiming) {
      this.collectNavigationTiming();
    }
    
    // Resource Timing
    if (this.options.enableResourceTiming) {
      this.collectResourceTiming();
    }
    
    // Paint Timing
    if (this.options.enablePaintTiming) {
      this.collectPaintTiming();
    }
  }
  
  // 导航时间收集
  collectNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    const metrics = {
      // DNS 查询时间
      dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
      
      // TCP 连接时间
      tcpTime: navigation.connectEnd - navigation.connectStart,
      
      // SSL 握手时间
      sslTime: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      
      // 请求响应时间
      requestTime: navigation.responseEnd - navigation.requestStart,
      
      // DOM 解析时间
      domParseTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      
      // 资源加载时间
      resourceLoadTime: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
      
      // 首字节时间 (TTFB)
      ttfb: navigation.responseStart - navigation.requestStart,
      
      // 页面完全加载时间
      pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      
      // DOM Ready 时间
      domReadyTime: navigation.domContentLoadedEventEnd - navigation.navigationStart
    };
    
    this.setMetric('navigation', metrics);
  }
  
  // 资源时间收集
  collectResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const resourceMetrics = {
      totalResources: resources.length,
      totalSize: 0,
      totalDuration: 0,
      resourceTypes: {},
      slowResources: []
    };
    
    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.startTime;
      const size = resource.transferSize || 0;
      
      resourceMetrics.totalDuration += duration;
      resourceMetrics.totalSize += size;
      
      // 按类型分组
      const type = this.getResourceType(resource.name);
      if (!resourceMetrics.resourceTypes[type]) {
        resourceMetrics.resourceTypes[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        };
      }
      
      resourceMetrics.resourceTypes[type].count++;
      resourceMetrics.resourceTypes[type].totalSize += size;
      resourceMetrics.resourceTypes[type].totalDuration += duration;
      
      // 记录慢资源（超过2秒）
      if (duration > 2000) {
        resourceMetrics.slowResources.push({
          name: resource.name,
          duration,
          size,
          type
        });
      }
    });
    
    this.setMetric('resources', resourceMetrics);
  }
  
  // 绘制时间收集
  collectPaintTiming() {
    const paintEntries = performance.getEntriesByType('paint');
    const paintMetrics = {};
    
    paintEntries.forEach(entry => {
      paintMetrics[entry.name] = entry.startTime;
    });
    
    this.setMetric('paint', paintMetrics);
  }
  
  // 设置性能观察器
  setupPerformanceObservers() {
    // Largest Contentful Paint (LCP)
    if (this.options.enableLCP && 'PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.setMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported:', e);
      }
    }
    
    // First Input Delay (FID)
    if (this.options.enableFID && 'PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.setMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported:', e);
      }
    }
    
    // Cumulative Layout Shift (CLS)
    if (this.options.enableCLS && 'PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.setMetric('cls', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported:', e);
      }
    }
    
    // Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const longTasks = entries.map(entry => ({
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution
          }));
          this.setMetric('longTasks', longTasks);
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported:', e);
      }
    }
  }
  
  // 获取资源类型
  getResourceType(url) {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
    if (url.match(/\.(mp3|wav|ogg)$/)) return 'audio';
    return 'other';
  }
  
  // 设置指标
  setMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    });
  }
  
  // 获取指标
  getMetric(name) {
    return this.metrics.get(name);
  }
  
  // 获取所有指标
  getAllMetrics() {
    const result = {};
    this.metrics.forEach((metric, name) => {
      result[name] = metric;
    });
    return result;
  }
  
  // 开始定期上报
  startReporting() {
    setInterval(() => {
      this.reportMetrics();
    }, this.options.reportInterval);
  }
  
  // 上报指标
  reportMetrics() {
    const metrics = this.getAllMetrics();
    
    // 发送到监控服务
    this.sendToMonitoringService(metrics);
    
    // 清空已上报的指标
    this.metrics.clear();
  }
  
  // 发送到监控服务
  async sendToMonitoringService(metrics) {
    try {
      const payload = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics
      };
      
      // 使用 sendBeacon 确保数据发送
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance', JSON.stringify(payload));
      } else {
        // 降级到 fetch
        fetch('/api/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.error('Failed to send performance metrics:', err);
        });
      }
    } catch (error) {
      console.error('Error sending metrics:', error);
    }
  }
  
  // 销毁监控器
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
    this.metrics.clear();
  }
}

// 2. 错误监控
class ErrorMonitor {
  constructor(options = {}) {
    this.options = {
      enableJSError: true,
      enablePromiseRejection: true,
      enableResourceError: true,
      maxErrors: 50,
      reportInterval: 10000,
      ...options
    };
    
    this.errors = [];
    this.init();
  }
  
  init() {
    // JavaScript 错误监听
    if (this.options.enableJSError) {
      window.addEventListener('error', this.handleJSError.bind(this));
    }
    
    // Promise 拒绝监听
    if (this.options.enablePromiseRejection) {
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
    
    // 资源加载错误监听
    if (this.options.enableResourceError) {
      window.addEventListener('error', this.handleResourceError.bind(this), true);
    }
    
    // 定期上报错误
    setInterval(() => {
      this.reportErrors();
    }, this.options.reportInterval);
  }
  
  // 处理 JavaScript 错误
  handleJSError(event) {
    const error = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : '',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.addError(error);
  }
  
  // 处理 Promise 拒绝
  handlePromiseRejection(event) {
    const error = {
      type: 'promise',
      message: event.reason ? event.reason.toString() : 'Promise rejected',
      stack: event.reason && event.reason.stack ? event.reason.stack : '',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.addError(error);
  }
  
  // 处理资源加载错误
  handleResourceError(event) {
    if (event.target !== window) {
      const error = {
        type: 'resource',
        message: `Failed to load resource: ${event.target.src || event.target.href}`,
        element: event.target.tagName,
        source: event.target.src || event.target.href,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      this.addError(error);
    }
  }
  
  // 添加错误
  addError(error) {
    this.errors.push(error);
    
    // 限制错误数量
    if (this.errors.length > this.options.maxErrors) {
      this.errors.shift();
    }
    
    // 立即上报严重错误
    if (this.isCriticalError(error)) {
      this.reportErrors([error]);
    }
  }
  
  // 判断是否为严重错误
  isCriticalError(error) {
    const criticalPatterns = [
      /ChunkLoadError/,
      /Loading chunk \d+ failed/,
      /Script error/,
      /Network Error/
    ];
    
    return criticalPatterns.some(pattern => pattern.test(error.message));
  }
  
  // 上报错误
  reportErrors(errors = this.errors) {
    if (errors.length === 0) return;
    
    const payload = {
      timestamp: Date.now(),
      errors: errors.slice() // 复制数组
    };
    
    // 发送错误数据
    this.sendErrorData(payload);
    
    // 清空已上报的错误
    if (errors === this.errors) {
      this.errors = [];
    }
  }
  
  // 发送错误数据
  async sendErrorData(payload) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/errors', JSON.stringify(payload));
      } else {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.error('Failed to send error data:', err);
        });
      }
    } catch (error) {
      console.error('Error sending error data:', error);
    }
  }
}

// 3. 用户行为追踪
class UserBehaviorTracker {
  constructor(options = {}) {
    this.options = {
      enableClickTracking: true,
      enableScrollTracking: true,
      enablePageViewTracking: true,
      enableFormTracking: true,
      sampleRate: 1.0, // 采样率
      ...options
    };
    
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.init();
  }
  
  init() {
    // 检查采样率
    if (Math.random() > this.options.sampleRate) {
      return;
    }
    
    // 页面浏览追踪
    if (this.options.enablePageViewTracking) {
      this.trackPageView();
    }
    
    // 点击追踪
    if (this.options.enableClickTracking) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
    
    // 滚动追踪
    if (this.options.enableScrollTracking) {
      this.setupScrollTracking();
    }
    
    // 表单追踪
    if (this.options.enableFormTracking) {
      this.setupFormTracking();
    }
    
    // 页面离开时上报数据
    window.addEventListener('beforeunload', () => {
      this.reportEvents();
    });
    
    // 定期上报数据
    setInterval(() => {
      this.reportEvents();
    }, 30000);
  }
  
  // 生成会话 ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // 追踪页面浏览
  trackPageView() {
    this.addEvent({
      type: 'pageview',
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    });
  }
  
  // 处理点击事件
  handleClick(event) {
    const target = event.target;
    const eventData = {
      type: 'click',
      element: target.tagName.toLowerCase(),
      text: target.textContent ? target.textContent.substring(0, 100) : '',
      className: target.className,
      id: target.id,
      x: event.clientX,
      y: event.clientY
    };
    
    // 特殊处理链接和按钮
    if (target.tagName === 'A') {
      eventData.href = target.href;
    }
    
    if (target.tagName === 'BUTTON' || target.type === 'submit') {
      eventData.buttonType = target.type;
    }
    
    this.addEvent(eventData);
  }
  
  // 设置滚动追踪
  setupScrollTracking() {
    let scrollDepth = 0;
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      scrollDepth = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // 记录滚动深度里程碑
        if (maxScrollDepth % 25 === 0 && maxScrollDepth > 0) {
          this.addEvent({
            type: 'scroll',
            depth: maxScrollDepth
          });
        }
      }
    };
    
    // 节流处理
    let scrollTimer;
    window.addEventListener('scroll', () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(handleScroll, 100);
    });
  }
  
  // 设置表单追踪
  setupFormTracking() {
    // 表单提交追踪
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.addEvent({
        type: 'form_submit',
        formId: form.id,
        formAction: form.action,
        formMethod: form.method
      });
    });
    
    // 表单字段焦点追踪
    document.addEventListener('focus', (event) => {
      const target = event.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        this.addEvent({
          type: 'form_focus',
          fieldType: target.type,
          fieldName: target.name,
          fieldId: target.id
        });
      }
    }, true);
  }
  
  // 添加事件
  addEvent(eventData) {
    const event = {
      ...eventData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };
    
    this.events.push(event);
    
    // 限制事件数量
    if (this.events.length > 100) {
      this.events.shift();
    }
  }
  
  // 上报事件
  reportEvents() {
    if (this.events.length === 0) return;
    
    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      events: this.events.slice()
    };
    
    // 发送数据
    this.sendEventData(payload);
    
    // 清空事件
    this.events = [];
  }
  
  // 发送事件数据
  async sendEventData(payload) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/behavior', JSON.stringify(payload));
      } else {
        fetch('/api/behavior', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.error('Failed to send behavior data:', err);
        });
      }
    } catch (error) {
      console.error('Error sending behavior data:', error);
    }
  }
}

// 4. 综合监控管理器
class MonitoringManager {
  constructor(options = {}) {
    this.options = {
      enablePerformance: true,
      enableError: true,
      enableBehavior: true,
      apiEndpoint: '/api/monitoring',
      ...options
    };
    
    this.monitors = {};
    this.init();
  }
  
  init() {
    // 初始化性能监控
    if (this.options.enablePerformance) {
      this.monitors.performance = new PerformanceMonitor(this.options.performance);
    }
    
    // 初始化错误监控
    if (this.options.enableError) {
      this.monitors.error = new ErrorMonitor(this.options.error);
    }
    
    // 初始化行为追踪
    if (this.options.enableBehavior) {
      this.monitors.behavior = new UserBehaviorTracker(this.options.behavior);
    }
  }
  
  // 获取监控器
  getMonitor(type) {
    return this.monitors[type];
  }
  
  // 销毁所有监控器
  destroy() {
    Object.values(this.monitors).forEach(monitor => {
      if (monitor.destroy) {
        monitor.destroy();
      }
    });
    this.monitors = {};
  }
}

// 5. 使用示例
const initMonitoring = () => {
  // 初始化监控管理器
  const monitoring = new MonitoringManager({
    performance: {
      reportInterval: 30000
    },
    error: {
      maxErrors: 50
    },
    behavior: {
      sampleRate: 0.1 // 10% 采样率
    }
  });
  
  // 自定义性能指标
  const performanceMonitor = monitoring.getMonitor('performance');
  if (performanceMonitor) {
    // 标记关键时间点
    performance.mark('app-start');
    
    // 应用初始化完成后
    setTimeout(() => {
      performance.mark('app-ready');
      performance.measure('app-init-time', 'app-start', 'app-ready');
    }, 1000);
  }
  
  return monitoring;
};

// 导出模块
export {
  PerformanceMonitor,
  ErrorMonitor,
  UserBehaviorTracker,
  MonitoringManager,
  initMonitoring
};

/**
 * 前端监控最佳实践：
 * 
 * 1. 性能监控：
 *    - 关注核心 Web 指标 (LCP, FID, CLS)
 *    - 监控资源加载性能
 *    - 追踪长任务和阻塞
 * 
 * 2. 错误监控：
 *    - 捕获 JavaScript 错误
 *    - 监控 Promise 拒绝
 *    - 追踪资源加载失败
 * 
 * 3. 用户行为：
 *    - 页面浏览追踪
 *    - 用户交互记录
 *    - 表单使用分析
 * 
 * 4. 数据上报：
 *    - 使用 sendBeacon 确保数据发送
 *    - 合理的采样率和批量上报
 *    - 错误去重和聚合
 */