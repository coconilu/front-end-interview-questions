/**
 * Single-SPA 微前端框架应用
 *
 * Single-SPA 是一个将多个单页应用聚合为一个整体应用的 JavaScript 前端框架
 * 支持多种前端技术栈共存，如 React、Vue、Angular 等
 */

// 1. Single-SPA 基础配置
import { registerApplication, start } from 'single-spa';

// 注册微应用
registerApplication({
  name: 'react-app',
  app: () => import('./react-app/main.js'),
  activeWhen: '/react',
  customProps: {
    domElement: document.getElementById('react-container'),
    authToken: 'abc123',
  },
});

registerApplication({
  name: 'vue-app',
  app: () => import('./vue-app/main.js'),
  activeWhen: '/vue',
  customProps: {
    domElement: document.getElementById('vue-container'),
  },
});

// 启动 Single-SPA
start();

// 2. React 微应用实现
// react-app/main.js
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

const ReactApp = () => {
  return (
    <div>
      <h2>React 微应用</h2>
      <p>这是一个 React 微前端应用</p>
    </div>
  );
};

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ReactApp,
  errorBoundary(err, info, props) {
    console.error('React app error:', err);
    return <div>React 应用出错了</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

// 3. Vue 微应用实现
// vue-app/main.js
import Vue from 'vue';
import singleSpaVue from 'single-spa-vue';

const VueApp = {
  template: `
    <div>
      <h2>Vue 微应用</h2>
      <p>这是一个 Vue 微前端应用</p>
      <button @click="count++">点击次数: {{ count }}</button>
    </div>
  `,
  data() {
    return {
      count: 0,
    };
  },
};

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render: (h) => h(VueApp),
  },
});

export const { bootstrap, mount, unmount } = vueLifecycles;

// 4. 自定义微应用生命周期
class CustomMicroApp {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.isActive = false;
    this.domElement = null;
  }

  // 引导阶段 - 只执行一次
  async bootstrap(props) {
    console.log(`${this.name} bootstrapping`);

    // 初始化应用资源
    await this.loadResources();

    // 设置全局错误处理
    this.setupErrorHandling();

    return Promise.resolve();
  }

  // 挂载阶段 - 每次激活时执行
  async mount(props) {
    console.log(`${this.name} mounting`);

    this.isActive = true;
    this.domElement =
      props.domElement || document.getElementById(this.config.containerId);

    // 渲染应用
    await this.render(props);

    // 绑定事件监听
    this.bindEvents();

    return Promise.resolve();
  }

  // 卸载阶段 - 每次失活时执行
  async unmount(props) {
    console.log(`${this.name} unmounting`);

    this.isActive = false;

    // 清理 DOM
    if (this.domElement) {
      this.domElement.innerHTML = '';
    }

    // 移除事件监听
    this.unbindEvents();

    // 清理定时器和订阅
    this.cleanup();

    return Promise.resolve();
  }

  // 加载资源
  async loadResources() {
    const { css, js } = this.config.assets || {};

    // 加载 CSS
    if (css) {
      await Promise.all(css.map((url) => this.loadCSS(url)));
    }

    // 加载 JS
    if (js) {
      await Promise.all(js.map((url) => this.loadJS(url)));
    }
  }

  // 加载 CSS 文件
  loadCSS(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // 加载 JS 文件
  loadJS(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 渲染应用
  async render(props) {
    if (this.domElement && this.config.render) {
      await this.config.render(this.domElement, props);
    }
  }

  // 绑定事件
  bindEvents() {
    if (this.config.events) {
      this.config.events.forEach(({ selector, event, handler }) => {
        const elements = this.domElement.querySelectorAll(selector);
        elements.forEach((el) => el.addEventListener(event, handler));
      });
    }
  }

  // 解绑事件
  unbindEvents() {
    if (this.config.events) {
      this.config.events.forEach(({ selector, event, handler }) => {
        const elements = this.domElement.querySelectorAll(selector);
        elements.forEach((el) => el.removeEventListener(event, handler));
      });
    }
  }

  // 清理资源
  cleanup() {
    // 清理定时器
    if (this.timers) {
      this.timers.forEach((timer) => clearTimeout(timer));
      this.timers = [];
    }

    // 清理订阅
    if (this.subscriptions) {
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      this.subscriptions = [];
    }
  }

  // 错误处理
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      if (this.isActive) {
        console.error(`${this.name} error:`, event.error);
        this.handleError(event.error);
      }
    });
  }

  handleError(error) {
    // 错误上报
    if (this.config.errorHandler) {
      this.config.errorHandler(error);
    }
  }
}

// 5. 应用间通信
class MicroAppCommunication {
  constructor() {
    this.eventBus = new EventTarget();
    this.sharedState = new Map();
  }

  // 发送事件
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventBus.dispatchEvent(event);
  }

  // 监听事件
  on(eventName, callback) {
    this.eventBus.addEventListener(eventName, callback);
    return () => this.eventBus.removeEventListener(eventName, callback);
  }

  // 设置共享状态
  setState(key, value) {
    this.sharedState.set(key, value);
    this.emit('stateChange', { key, value });
  }

  // 获取共享状态
  getState(key) {
    return this.sharedState.get(key);
  }

  // 订阅状态变化
  subscribe(key, callback) {
    const handler = (event) => {
      if (event.detail.key === key) {
        callback(event.detail.value);
      }
    };
    return this.on('stateChange', handler);
  }
}

// 全局通信实例
window.__MICRO_APP_COMMUNICATION__ = new MicroAppCommunication();

// 6. 路由管理
class MicroAppRouter {
  constructor() {
    this.routes = new Map();
    this.currentApp = null;
    this.init();
  }

  // 注册路由
  registerRoute(path, appName) {
    this.routes.set(path, appName);
  }

  // 初始化路由监听
  init() {
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // 监听 pushState 和 replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };
  }

  // 处理路由变化
  handleRouteChange() {
    const path = window.location.pathname;
    const appName = this.findMatchingApp(path);

    if (appName !== this.currentApp) {
      this.switchApp(appName);
    }
  }

  // 查找匹配的应用
  findMatchingApp(path) {
    for (const [routePath, appName] of this.routes) {
      if (path.startsWith(routePath)) {
        return appName;
      }
    }
    return null;
  }

  // 切换应用
  switchApp(appName) {
    if (this.currentApp) {
      // 卸载当前应用
      this.unmountApp(this.currentApp);
    }

    if (appName) {
      // 挂载新应用
      this.mountApp(appName);
    }

    this.currentApp = appName;
  }

  mountApp(appName) {
    console.log(`Mounting app: ${appName}`);
    // 触发应用挂载逻辑
  }

  unmountApp(appName) {
    console.log(`Unmounting app: ${appName}`);
    // 触发应用卸载逻辑
  }
}

// 7. 使用示例
const communication = window.__MICRO_APP_COMMUNICATION__;
const router = new MicroAppRouter();

// 注册路由
router.registerRoute('/react', 'react-app');
router.registerRoute('/vue', 'vue-app');

// 创建自定义微应用
const customApp = new CustomMicroApp('custom-app', {
  containerId: 'custom-container',
  assets: {
    css: ['/custom-app/styles.css'],
    js: ['/custom-app/bundle.js'],
  },
  render: (container, props) => {
    container.innerHTML = `
      <div>
        <h2>自定义微应用</h2>
        <p>Props: ${JSON.stringify(props)}</p>
        <button id="custom-btn">点击我</button>
      </div>
    `;
  },
  events: [
    {
      selector: '#custom-btn',
      event: 'click',
      handler: () => {
        communication.emit('customButtonClick', { timestamp: Date.now() });
      },
    },
  ],
  errorHandler: (error) => {
    console.error('Custom app error:', error);
  },
});

// 注册自定义应用
registerApplication({
  name: 'custom-app',
  app: () => Promise.resolve(customApp),
  activeWhen: '/custom',
});

// 应用间通信示例
communication.on('customButtonClick', (event) => {
  console.log('Custom button clicked:', event.detail);
});

// 共享状态示例
communication.setState('user', { id: 1, name: 'John' });
const unsubscribe = communication.subscribe('user', (user) => {
  console.log('User state changed:', user);
});

export { CustomMicroApp, MicroAppCommunication, MicroAppRouter };

/**
 * Single-SPA 最佳实践：
 *
 * 1. 应用隔离：确保各微应用之间的样式和 JS 不互相影响
 * 2. 生命周期管理：正确实现 bootstrap、mount、unmount 生命周期
 * 3. 错误边界：为每个微应用设置错误边界，避免单个应用错误影响整体
 * 4. 性能优化：合理使用懒加载，避免不必要的资源加载
 * 5. 状态管理：设计清晰的跨应用状态共享机制
 * 6. 路由管理：统一管理路由，避免路由冲突
 * 7. 版本控制：确保各微应用版本兼容性
 */
