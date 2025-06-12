/**
 * 微应用间通信方案
 * 
 * 微前端架构中，不同应用间的通信是一个重要问题
 * 本文件展示了多种通信方案的实现
 */

// 1. 事件总线通信
class EventBus {
  constructor() {
    this.events = new Map();
  }

  // 订阅事件
  on(eventName, callback, options = {}) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0
    };
    
    const listeners = this.events.get(eventName);
    listeners.push(listener);
    
    // 按优先级排序
    listeners.sort((a, b) => b.priority - a.priority);
    
    // 返回取消订阅函数
    return () => this.off(eventName, callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events.has(eventName)) return;
    
    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(listener => listener.callback === callback);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(eventName);
    }
  }

  // 发布事件
  emit(eventName, data) {
    if (!this.events.has(eventName)) return;
    
    const listeners = this.events.get(eventName);
    const toRemove = [];
    
    listeners.forEach((listener, index) => {
      try {
        listener.callback(data);
        
        if (listener.once) {
          toRemove.push(index);
        }
      } catch (error) {
        console.error(`Event listener error for ${eventName}:`, error);
      }
    });
    
    // 移除一次性监听器
    toRemove.reverse().forEach(index => {
      listeners.splice(index, 1);
    });
  }

  // 一次性订阅
  once(eventName, callback) {
    return this.on(eventName, callback, { once: true });
  }

  // 清空所有事件
  clear() {
    this.events.clear();
  }

  // 获取事件列表
  getEvents() {
    return Array.from(this.events.keys());
  }
}

// 全局事件总线实例
window.__MICRO_EVENT_BUS__ = new EventBus();

// 2. 共享状态管理
class SharedStore {
  constructor() {
    this.state = {};
    this.subscribers = new Map();
    this.middleware = [];
    this.history = [];
    this.maxHistorySize = 50;
  }

  // 添加中间件
  use(middleware) {
    this.middleware.push(middleware);
  }

  // 获取状态
  getState(path) {
    if (!path) return this.state;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key];
    }, this.state);
  }

  // 设置状态
  setState(path, value, meta = {}) {
    const oldState = { ...this.state };
    const action = { type: 'SET_STATE', path, value, meta, timestamp: Date.now() };
    
    // 执行中间件
    let finalAction = action;
    for (const middleware of this.middleware) {
      finalAction = middleware(finalAction, this.state) || finalAction;
    }
    
    // 更新状态
    this.updateState(finalAction.path, finalAction.value);
    
    // 记录历史
    this.addToHistory({
      action: finalAction,
      oldState,
      newState: { ...this.state }
    });
    
    // 通知订阅者
    this.notifySubscribers(finalAction.path, finalAction.value, oldState);
  }

  // 更新状态
  updateState(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    let current = this.state;
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }

  // 订阅状态变化
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, []);
    }
    
    this.subscribers.get(path).push(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.subscribers.get(path);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // 通知订阅者
  notifySubscribers(path, value, oldState) {
    // 精确匹配
    if (this.subscribers.has(path)) {
      this.subscribers.get(path).forEach(callback => {
        try {
          callback(value, this.getStateByPath(oldState, path));
        } catch (error) {
          console.error('Subscriber error:', error);
        }
      });
    }
    
    // 父路径匹配
    this.subscribers.forEach((callbacks, subscribePath) => {
      if (path.startsWith(subscribePath + '.') || subscribePath === '*') {
        callbacks.forEach(callback => {
          try {
            callback(this.getState(subscribePath), this.getStateByPath(oldState, subscribePath));
          } catch (error) {
            console.error('Subscriber error:', error);
          }
        });
      }
    });
  }

  // 根据路径获取状态
  getStateByPath(state, path) {
    if (!path) return state;
    return path.split('.').reduce((obj, key) => obj && obj[key], state);
  }

  // 添加到历史记录
  addToHistory(record) {
    this.history.push(record);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // 获取历史记录
  getHistory() {
    return this.history;
  }

  // 时间旅行调试
  timeTravel(index) {
    if (index >= 0 && index < this.history.length) {
      this.state = { ...this.history[index].newState };
      this.notifySubscribers('*', this.state, {});
    }
  }
}

// 全局共享状态实例
window.__MICRO_SHARED_STORE__ = new SharedStore();

// 3. PostMessage 通信
class PostMessageCommunication {
  constructor(appName) {
    this.appName = appName;
    this.messageHandlers = new Map();
    this.targetOrigins = new Set();
    this.init();
  }

  init() {
    window.addEventListener('message', (event) => {
      this.handleMessage(event);
    });
  }

  // 注册目标源
  addTargetOrigin(origin) {
    this.targetOrigins.add(origin);
  }

  // 发送消息
  send(targetApp, type, data, targetOrigin = '*') {
    const message = {
      from: this.appName,
      to: targetApp,
      type,
      data,
      timestamp: Date.now(),
      id: this.generateId()
    };

    if (window.parent !== window) {
      // 发送给父窗口
      window.parent.postMessage(message, targetOrigin);
    }

    // 发送给所有子窗口
    Array.from(window.frames).forEach(frame => {
      try {
        frame.postMessage(message, targetOrigin);
      } catch (error) {
        console.warn('Failed to send message to frame:', error);
      }
    });
  }

  // 处理接收到的消息
  handleMessage(event) {
    const { data } = event;
    
    // 验证消息格式
    if (!this.isValidMessage(data)) return;
    
    // 验证来源
    if (this.targetOrigins.size > 0 && !this.targetOrigins.has(event.origin)) {
      console.warn('Message from untrusted origin:', event.origin);
      return;
    }
    
    // 检查是否是发给当前应用的消息
    if (data.to && data.to !== this.appName) return;
    
    // 执行消息处理器
    if (this.messageHandlers.has(data.type)) {
      const handlers = this.messageHandlers.get(data.type);
      handlers.forEach(handler => {
        try {
          handler(data.data, data);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    }
  }

  // 验证消息格式
  isValidMessage(data) {
    return data && 
           typeof data === 'object' && 
           data.from && 
           data.type && 
           data.timestamp;
  }

  // 注册消息处理器
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type).push(handler);
    
    return () => this.off(type, handler);
  }

  // 移除消息处理器
  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 生成唯一ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 4. 基于 URL 的通信
class URLCommunication {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // 监听 URL 变化
    window.addEventListener('popstate', () => {
      this.handleURLChange();
    });
    
    // 重写 pushState 和 replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleURLChange();
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleURLChange();
    };
  }

  // 设置 URL 参数
  setParams(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    history.pushState({}, '', url.toString());
  }

  // 获取 URL 参数
  getParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    
    return params;
  }

  // 监听 URL 变化
  onChange(callback) {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 处理 URL 变化
  handleURLChange() {
    const params = this.getParams();
    this.listeners.forEach(callback => {
      try {
        callback(params);
      } catch (error) {
        console.error('URL change listener error:', error);
      }
    });
  }
}

// 5. 基于 LocalStorage 的通信
class StorageCommunication {
  constructor(prefix = 'micro-app') {
    this.prefix = prefix;
    this.listeners = new Map();
    this.init();
  }

  init() {
    window.addEventListener('storage', (event) => {
      this.handleStorageChange(event);
    });
  }

  // 设置数据
  setData(key, data) {
    const fullKey = `${this.prefix}:${key}`;
    const value = {
      data,
      timestamp: Date.now(),
      from: window.location.origin
    };
    
    localStorage.setItem(fullKey, JSON.stringify(value));
    
    // 手动触发事件（同一页面内的变化）
    this.notifyListeners(key, data);
  }

  // 获取数据
  getData(key) {
    const fullKey = `${this.prefix}:${key}`;
    const value = localStorage.getItem(fullKey);
    
    if (value) {
      try {
        const parsed = JSON.parse(value);
        return parsed.data;
      } catch (error) {
        console.error('Failed to parse storage data:', error);
      }
    }
    
    return null;
  }

  // 删除数据
  removeData(key) {
    const fullKey = `${this.prefix}:${key}`;
    localStorage.removeItem(fullKey);
  }

  // 监听数据变化
  onDataChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // 处理存储变化
  handleStorageChange(event) {
    if (!event.key || !event.key.startsWith(this.prefix)) return;
    
    const key = event.key.replace(`${this.prefix}:`, '');
    let newData = null;
    
    if (event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        newData = parsed.data;
      } catch (error) {
        console.error('Failed to parse storage event data:', error);
        return;
      }
    }
    
    this.notifyListeners(key, newData);
  }

  // 通知监听器
  notifyListeners(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Storage listener error:', error);
        }
      });
    }
  }
}

// 6. 使用示例
const eventBus = window.__MICRO_EVENT_BUS__;
const sharedStore = window.__MICRO_SHARED_STORE__;
const postMessage = new PostMessageCommunication('main-app');
const urlComm = new URLCommunication();
const storageComm = new StorageCommunication();

// 事件总线示例
eventBus.on('user-login', (userData) => {
  console.log('用户登录:', userData);
});

eventBus.emit('user-login', { id: 1, name: 'John' });

// 共享状态示例
sharedStore.setState('user.profile', { name: 'John', age: 30 });
sharedStore.subscribe('user', (newUser, oldUser) => {
  console.log('用户状态变化:', newUser, oldUser);
});

// PostMessage 示例
postMessage.on('data-update', (data) => {
  console.log('接收到数据更新:', data);
});

postMessage.send('child-app', 'data-update', { message: 'Hello from main app' });

// URL 通信示例
urlComm.setParams({ tab: 'profile', id: '123' });
urlComm.onChange((params) => {
  console.log('URL 参数变化:', params);
});

// Storage 通信示例
storageComm.setData('current-user', { id: 1, name: 'John' });
storageComm.onDataChange('current-user', (userData) => {
  console.log('用户数据变化:', userData);
});

// 7. 通信管理器
class CommunicationManager {
  constructor() {
    this.channels = new Map();
    this.defaultChannel = 'eventBus';
  }

  // 注册通信通道
  registerChannel(name, channel) {
    this.channels.set(name, channel);
  }

  // 发送消息
  send(message, channel = this.defaultChannel) {
    const comm = this.channels.get(channel);
    if (comm && comm.send) {
      comm.send(message);
    } else if (comm && comm.emit) {
      comm.emit(message.type, message.data);
    }
  }

  // 监听消息
  listen(type, callback, channel = this.defaultChannel) {
    const comm = this.channels.get(channel);
    if (comm && comm.on) {
      return comm.on(type, callback);
    }
  }

  // 广播消息到所有通道
  broadcast(message) {
    this.channels.forEach((channel, name) => {
      try {
        this.send(message, name);
      } catch (error) {
        console.error(`Failed to broadcast to ${name}:`, error);
      }
    });
  }
}

// 初始化通信管理器
const commManager = new CommunicationManager();
commManager.registerChannel('eventBus', eventBus);
commManager.registerChannel('postMessage', postMessage);
commManager.registerChannel('storage', storageComm);

export {
  EventBus,
  SharedStore,
  PostMessageCommunication,
  URLCommunication,
  StorageCommunication,
  CommunicationManager
};

/**
 * 微应用通信最佳实践：
 * 
 * 1. 选择合适的通信方式：
 *    - 事件总线：适用于同一页面内的应用通信
 *    - PostMessage：适用于跨域或 iframe 通信
 *    - URL 参数：适用于路由状态共享
 *    - LocalStorage：适用于持久化状态共享
 * 
 * 2. 数据格式标准化：统一消息格式，便于维护
 * 3. 错误处理：完善的错误边界和降级策略
 * 4. 性能优化：避免频繁通信，合理使用缓存
 * 5. 安全考虑：验证消息来源，防止 XSS 攻击
 * 6. 调试支持：提供完善的日志和调试工具
 * 7. 版本兼容：确保不同版本应用间的通信兼容性
 */