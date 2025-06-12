/**
 * Module Federation 微前端实现
 * 
 * Module Federation 是 Webpack 5 的一个新特性，允许多个独立的构建可以组成一个应用程序
 * 这些独立的构建之间不应该有依赖关系，因此可以单独开发和部署
 */

// 1. 宿主应用配置 (Host Application)
const ModuleFederationPlugin = require('@module-federation/webpack');

// webpack.config.js for host app
const hostConfig = {
  mode: 'development',
  devServer: {
    port: 3000,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        // 远程应用配置
        mfe1: 'mfe1@http://localhost:3001/remoteEntry.js',
        mfe2: 'mfe2@http://localhost:3002/remoteEntry.js',
      },
    }),
  ],
};

// 2. 远程应用配置 (Remote Application)
const remoteConfig = {
  mode: 'development',
  devServer: {
    port: 3001,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe1',
      filename: 'remoteEntry.js',
      exposes: {
        // 暴露的组件
        './Button': './src/Button',
        './Header': './src/Header',
      },
      shared: {
        // 共享依赖
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};

// 3. 动态导入远程组件
class MicroFrontendLoader {
  constructor() {
    this.cache = new Map();
  }

  // 动态加载远程组件
  async loadRemoteComponent(remoteName, componentName) {
    const cacheKey = `${remoteName}/${componentName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 动态导入远程模块
      const container = window[remoteName];
      await container.init(__webpack_share_scopes__.default);
      const factory = await container.get(componentName);
      const Module = factory();
      
      this.cache.set(cacheKey, Module.default);
      return Module.default;
    } catch (error) {
      console.error(`Failed to load remote component ${cacheKey}:`, error);
      return null;
    }
  }

  // 预加载远程组件
  async preloadComponent(remoteName, componentName) {
    return this.loadRemoteComponent(remoteName, componentName);
  }
}

// 4. React 组件中使用远程组件
import React, { Suspense, lazy } from 'react';

// 懒加载远程组件
const RemoteButton = lazy(() => import('mfe1/Button'));
const RemoteHeader = lazy(() => import('mfe2/Header'));

function App() {
  return (
    <div>
      <h1>Host Application</h1>
      
      <Suspense fallback={<div>Loading Button...</div>}>
        <RemoteButton onClick={() => alert('Remote button clicked!')} />
      </Suspense>
      
      <Suspense fallback={<div>Loading Header...</div>}>
        <RemoteHeader title="Remote Header" />
      </Suspense>
    </div>
  );
}

// 5. 错误边界处理
class RemoteComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Remote component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>远程组件加载失败</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 6. 运行时动态加载
class RuntimeModuleFederation {
  constructor() {
    this.remotes = new Map();
  }

  // 注册远程应用
  registerRemote(name, url) {
    this.remotes.set(name, url);
  }

  // 动态加载远程应用
  async loadRemote(name) {
    const url = this.remotes.get(name);
    if (!url) {
      throw new Error(`Remote ${name} not registered`);
    }

    // 动态创建 script 标签加载远程入口
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        resolve(window[name]);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// 使用示例
const loader = new MicroFrontendLoader();
const runtime = new RuntimeModuleFederation();

// 注册远程应用
runtime.registerRemote('mfe1', 'http://localhost:3001/remoteEntry.js');
runtime.registerRemote('mfe2', 'http://localhost:3002/remoteEntry.js');

// 动态加载和使用
async function loadAndRenderRemoteComponent() {
  try {
    const RemoteComponent = await loader.loadRemoteComponent('mfe1', './Button');
    
    if (RemoteComponent) {
      // 渲染组件
      const element = React.createElement(RemoteComponent, {
        text: 'Dynamic Remote Button',
        onClick: () => console.log('Dynamic button clicked!')
      });
      
      ReactDOM.render(element, document.getElementById('remote-container'));
    }
  } catch (error) {
    console.error('Failed to load remote component:', error);
  }
}

// 7. 共享状态管理
class SharedStateManager {
  constructor() {
    this.state = {};
    this.subscribers = [];
  }

  // 设置共享状态
  setState(key, value) {
    this.state[key] = value;
    this.notifySubscribers(key, value);
  }

  // 获取共享状态
  getState(key) {
    return this.state[key];
  }

  // 订阅状态变化
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // 通知订阅者
  notifySubscribers(key, value) {
    this.subscribers.forEach(callback => {
      callback(key, value);
    });
  }
}

// 全局共享状态实例
window.__SHARED_STATE__ = new SharedStateManager();

export {
  ModuleFederationPlugin,
  MicroFrontendLoader,
  RemoteComponentErrorBoundary,
  RuntimeModuleFederation,
  SharedStateManager
};

/**
 * Module Federation 最佳实践：
 * 
 * 1. 版本管理：确保共享依赖的版本兼容性
 * 2. 错误处理：实现完善的错误边界和降级策略
 * 3. 性能优化：合理使用懒加载和预加载
 * 4. 状态管理：设计清晰的跨应用状态共享机制
 * 5. 部署策略：独立部署，避免单点故障
 * 6. 监控告警：实现完善的监控和日志系统
 * 7. 类型安全：使用 TypeScript 确保类型安全
 */