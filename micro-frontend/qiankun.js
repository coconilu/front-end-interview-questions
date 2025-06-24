/**
 * qiankun 微前端方案
 *
 * qiankun 是一个基于 single-spa 的微前端实现库
 * 提供了更加开箱即用的 API，支持样式隔离、JS 沙箱等特性
 */

// 1. 主应用配置
import { registerMicroApps, start, setDefaultMountApp } from 'qiankun';

// 注册微应用
registerMicroApps(
  [
    {
      name: 'react-app',
      entry: '//localhost:7100',
      container: '#react-container',
      activeRule: '/react',
      props: {
        routerBase: '/react',
        getGlobalState: () =>
          window.__POWERED_BY_QIANKUN__
            ? window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
            : '/',
      },
    },
    {
      name: 'vue-app',
      entry: {
        scripts: ['//localhost:7101/main.js'],
        styles: ['//localhost:7101/main.css'],
      },
      container: '#vue-container',
      activeRule: '/vue',
      props: {
        routerBase: '/vue',
      },
    },
    {
      name: 'angular-app',
      entry: '//localhost:7102',
      container: '#angular-container',
      activeRule: '/angular',
    },
  ],
  {
    // 全局生命周期钩子
    beforeLoad: (app) => {
      console.log('[LifeCycle] before load %c%s', 'color: green;', app.name);
      return Promise.resolve();
    },
    beforeMount: (app) => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name);
      return Promise.resolve();
    },
    afterUnmount: (app) => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name);
      return Promise.resolve();
    },
  }
);

// 设置默认进入的子应用
setDefaultMountApp('/react');

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: true, // 严格样式隔离
    experimentalStyleIsolation: true, // 实验性样式隔离
  },
  prefetch: 'all', // 预加载策略
  singular: false, // 是否为单实例场景
  fetch: window.fetch, // 自定义 fetch 方法
});

// 2. 微应用改造 - React 应用
// public/index.html 需要设置
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function render(props) {
  const { container } = props;
  const dom = container
    ? container.querySelector('#root')
    : document.querySelector('#root');

  ReactDOM.render(<App />, dom);
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

// 导出 qiankun 生命周期函数
export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  const dom = container
    ? container.querySelector('#root')
    : document.querySelector('#root');
  ReactDOM.unmountComponentAtNode(dom);
}

// 3. 微应用改造 - Vue 应用
// main.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import routes from './router';

Vue.config.productionTip = false;

let router = null;
let instance = null;

function render(props = {}) {
  const { container, routerBase } = props;

  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : process.env.BASE_URL,
    mode: 'history',
    routes,
  });

  instance = new Vue({
    router,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}

export async function mount(props) {
  console.log('[vue] props from main framework', props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  router = null;
}

// 4. 应用间通信
import { initGlobalState } from 'qiankun';

// 主应用中初始化全局状态
const actions = initGlobalState({
  user: { name: 'qiankun', age: 18 },
  theme: 'light',
});

// 监听全局状态变化
actions.onGlobalStateChange((value, prev) => {
  console.log('[onGlobalStateChange - master]:', value, prev);
});

// 设置全局状态
actions.setGlobalState({
  user: { name: 'qiankun', age: 20 },
});

// 微应用中使用全局状态
export async function mount(props) {
  const { onGlobalStateChange, setGlobalState } = props;

  // 监听全局状态变化
  onGlobalStateChange((value, prev) => {
    console.log('[onGlobalStateChange - sub]:', value, prev);
  }, true);

  // 设置全局状态
  setGlobalState({
    theme: 'dark',
  });

  render(props);
}

// 5. 自定义沙箱实现
class CustomSandbox {
  constructor(name) {
    this.name = name;
    this.proxy = null;
    this.sandboxRunning = false;
    this.latestSetProp = null;
    this.modifiedPropsOriginalValueMapInSandbox = new Map();
    this.addedPropsMapInSandbox = new Map();
    this.currentUpdatedPropsValueMap = new Map();

    this.createProxy();
  }

  createProxy() {
    const {
      sandboxRunning,
      currentUpdatedPropsValueMap,
      modifiedPropsOriginalValueMapInSandbox,
      addedPropsMapInSandbox,
    } = this;
    const rawWindow = window;
    const fakeWindow = Object.create(null);

    this.proxy = new Proxy(fakeWindow, {
      set: (target, prop, value) => {
        if (sandboxRunning) {
          if (!rawWindow.hasOwnProperty(prop)) {
            addedPropsMapInSandbox.set(prop, value);
          } else if (!modifiedPropsOriginalValueMapInSandbox.has(prop)) {
            modifiedPropsOriginalValueMapInSandbox.set(prop, rawWindow[prop]);
          }

          currentUpdatedPropsValueMap.set(prop, value);

          if (typeof prop === 'string' && rawWindow.hasOwnProperty(prop)) {
            rawWindow[prop] = value;
          }

          this.latestSetProp = prop;
        }

        return true;
      },

      get: (target, prop) => {
        if (prop === Symbol.unscopables) return undefined;

        if (['top', 'parent', 'window', 'self'].includes(prop)) {
          return this.proxy;
        }

        const value = rawWindow[prop];
        return typeof value === 'function' ? value.bind(rawWindow) : value;
      },

      has: (target, prop) => {
        return prop in rawWindow;
      },

      getOwnPropertyDescriptor: (target, prop) => {
        return Object.getOwnPropertyDescriptor(rawWindow, prop);
      },

      defineProperty: (target, prop, descriptor) => {
        if (sandboxRunning) {
          Object.defineProperty(rawWindow, prop, descriptor);
        }
        return true;
      },
    });
  }

  // 激活沙箱
  active() {
    if (!this.sandboxRunning) {
      this.currentUpdatedPropsValueMap.forEach((v, p) => {
        window[p] = v;
      });
    }
    this.sandboxRunning = true;
  }

  // 失活沙箱
  inactive() {
    if (this.sandboxRunning) {
      this.modifiedPropsOriginalValueMapInSandbox.forEach((v, p) => {
        window[p] = v;
      });

      this.addedPropsMapInSandbox.forEach((_, p) => {
        delete window[p];
      });
    }
    this.sandboxRunning = false;
  }
}

// 6. 样式隔离实现
class StyleIsolation {
  constructor(appName) {
    this.appName = appName;
    this.styleElements = [];
    this.scopedCSS = new Map();
  }

  // 处理样式隔离
  process(styleElement) {
    const css = styleElement.textContent || styleElement.innerHTML;
    const scopedCSS = this.addScope(css, this.appName);

    styleElement.textContent = scopedCSS;
    this.styleElements.push(styleElement);
    this.scopedCSS.set(styleElement, css);
  }

  // 添加作用域
  addScope(css, scope) {
    const re = /([^{}]+){([^{}]*)}/g;
    return css.replace(re, (match, selectors, rules) => {
      const scopedSelectors = selectors
        .split(',')
        .map((selector) => {
          selector = selector.trim();
          if (selector.includes(':global')) {
            return selector.replace(':global', '');
          }
          return `[data-qiankun="${scope}"] ${selector}`;
        })
        .join(', ');

      return `${scopedSelectors} { ${rules} }`;
    });
  }

  // 清理样式
  cleanup() {
    this.styleElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.styleElements = [];
    this.scopedCSS.clear();
  }
}

// 7. 预加载实现
class Prefetch {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }

  // 预加载应用
  async prefetchApp(app) {
    const { name, entry } = app;

    if (this.cache.has(name) || this.loading.has(name)) {
      return this.cache.get(name);
    }

    this.loading.add(name);

    try {
      const assets = await this.loadAssets(entry);
      this.cache.set(name, assets);
      this.loading.delete(name);
      return assets;
    } catch (error) {
      this.loading.delete(name);
      throw error;
    }
  }

  // 加载资源
  async loadAssets(entry) {
    if (typeof entry === 'string') {
      const html = await fetch(entry).then((res) => res.text());
      return this.parseAssets(html, entry);
    } else {
      const { scripts = [], styles = [] } = entry;
      return {
        scripts: await Promise.all(scripts.map((src) => this.loadScript(src))),
        styles: await Promise.all(styles.map((href) => this.loadStyle(href))),
      };
    }
  }

  // 解析 HTML 中的资源
  parseAssets(html, baseURL) {
    const scripts = [];
    const styles = [];

    // 解析 script 标签
    const scriptRegex = /<script[^>]*src=["']([^"']*)["'][^>]*><\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
      scripts.push(new URL(scriptMatch[1], baseURL).href);
    }

    // 解析 link 标签
    const linkRegex = /<link[^>]*href=["']([^"']*)["'][^>]*>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      if (linkMatch[0].includes('rel="stylesheet"')) {
        styles.push(new URL(linkMatch[1], baseURL).href);
      }
    }

    return { scripts, styles, html };
  }

  // 加载脚本
  async loadScript(src) {
    return fetch(src).then((res) => res.text());
  }

  // 加载样式
  async loadStyle(href) {
    return fetch(href).then((res) => res.text());
  }

  // 获取缓存的资源
  getCachedAssets(name) {
    return this.cache.get(name);
  }
}

// 8. 使用示例
const sandbox = new CustomSandbox('react-app');
const styleIsolation = new StyleIsolation('react-app');
const prefetch = new Prefetch();

// 激活沙箱
sandbox.active();

// 在沙箱中执行代码
with (sandbox.proxy) {
  var testVar = 'sandbox test';
  console.log('在沙箱中:', testVar);
}

// 失活沙箱
sandbox.inactive();

// 预加载应用
prefetch
  .prefetchApp({
    name: 'react-app',
    entry: '//localhost:7100',
  })
  .then((assets) => {
    console.log('预加载完成:', assets);
  });

// 处理样式隔离
const styleElement = document.createElement('style');
styleElement.textContent = `
  .container { background: red; }
  .title { color: blue; }
`;
styleIsolation.process(styleElement);

export { CustomSandbox, StyleIsolation, Prefetch };

/**
 * qiankun 核心特性：
 *
 * 1. JS 沙箱：基于 Proxy 实现的沙箱机制，隔离全局变量
 * 2. 样式隔离：支持 strictStyleIsolation 和 experimentalStyleIsolation
 * 3. HTML Entry：支持通过 HTML 入口加载微应用
 * 4. 预加载：支持预加载微应用资源，提升用户体验
 * 5. 应用间通信：提供全局状态管理机制
 * 6. 生命周期：完整的应用生命周期管理
 * 7. 路由管理：支持基于路由的应用激活
 * 8. 错误处理：提供完善的错误边界和降级机制
 */
