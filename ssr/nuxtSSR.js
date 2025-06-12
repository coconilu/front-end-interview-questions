/**
 * Nuxt.js 服务端渲染实现
 * 
 * Nuxt.js 是基于 Vue.js 的全栈框架，提供了强大的 SSR 功能
 * 本文件展示了 Nuxt.js 中各种渲染模式和功能的实现
 */

// 1. 页面组件 - pages/posts/_id.vue
<template>
  <div class="post-page">
    <article v-if="post">
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span>作者: {{ post.author }}</span>
        <span>发布时间: {{ formatDate(post.publishedAt) }}</span>
      </div>
      <div class="content" v-html="post.content"></div>
    </article>
    <div v-else>
      <h1>文章未找到</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostPage',
  
  // 异步数据获取
  async asyncData({ params, $axios, error }) {
    try {
      const post = await $axios.$get(`/api/posts/${params.id}`);
      return { post };
    } catch (err) {
      error({ statusCode: 404, message: 'Post not found' });
    }
  },
  
  // 头部信息
  head() {
    return {
      title: this.post?.title || 'Post Not Found',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.post?.content?.substring(0, 160) || ''
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.post?.title || ''
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.post?.content?.substring(0, 160) || ''
        }
      ]
    };
  },
  
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN');
    }
  }
};
</script>

<style scoped>
.post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.meta {
  color: #666;
  margin-bottom: 20px;
}

.meta span {
  margin-right: 20px;
}

.content {
  line-height: 1.6;
}
</style>

// 2. 静态生成 - nuxt.config.js
export default {
  // 渲染模式
  mode: 'universal', // 或 'spa'
  target: 'static', // 或 'server'
  
  // 生成配置
  generate: {
    // 动态路由
    routes() {
      return axios.get('/api/posts')
        .then(res => res.data.map(post => `/posts/${post.id}`));
    },
    
    // 并发生成
    concurrency: 25,
    
    // 生成间隔
    interval: 100,
    
    // 子目录
    subFolders: false,
    
    // 回调函数
    done(builder, errors) {
      console.log('Generation completed!');
    }
  },
  
  // 头部配置
  head: {
    title: 'Nuxt.js SSR Demo',
    htmlAttrs: {
      lang: 'zh-CN'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js SSR 示例应用' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ]
  },
  
  // CSS 配置
  css: [
    '~/assets/css/main.css'
  ],
  
  // 插件
  plugins: [
    '~/plugins/axios.js',
    { src: '~/plugins/localStorage.js', mode: 'client' }
  ],
  
  // 组件自动导入
  components: true,
  
  // 构建配置
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss'
  ],
  
  // 模块
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/pwa'
  ],
  
  // Axios 配置
  axios: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000'
  },
  
  // 认证配置
  auth: {
    strategies: {
      local: {
        token: {
          property: 'token',
          global: true
        },
        user: {
          property: 'user',
          autoFetch: true
        },
        endpoints: {
          login: { url: '/api/auth/login', method: 'post' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get' }
        }
      }
    }
  },
  
  // PWA 配置
  pwa: {
    manifest: {
      name: 'Nuxt.js SSR Demo',
      short_name: 'NuxtSSR',
      description: 'Nuxt.js SSR 示例应用'
    }
  },
  
  // 服务器中间件
  serverMiddleware: [
    '~/api/index.js'
  ],
  
  // 路由配置
  router: {
    middleware: ['auth']
  }
};

// 3. 中间件 - middleware/auth.js
export default function ({ $auth, redirect, route }) {
  // 检查用户是否已认证
  if (!$auth.loggedIn && route.path !== '/login') {
    return redirect('/login');
  }
  
  // 检查用户权限
  if ($auth.loggedIn && route.path.startsWith('/admin')) {
    if (!$auth.user.isAdmin) {
      return redirect('/');
    }
  }
}

// 4. 插件 - plugins/axios.js
export default function ({ $axios, redirect, $auth }) {
  // 请求拦截器
  $axios.onRequest(config => {
    console.log('Making request to ' + config.url);
    
    // 添加认证头
    if ($auth.loggedIn) {
      config.headers.Authorization = `Bearer ${$auth.strategy.token.get()}`;
    }
  });
  
  // 响应拦截器
  $axios.onResponse(response => {
    console.log('Response received:', response.status);
  });
  
  // 错误处理
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    
    if (code === 401) {
      $auth.logout();
      redirect('/login');
    }
    
    if (code === 404) {
      redirect('/404');
    }
  });
}

// 5. 服务器 API - api/posts.js
const express = require('express');
const app = express();

// 模拟数据
const posts = [
  {
    id: '1',
    title: 'Nuxt.js SSR 入门',
    content: '<p>这是一篇关于 Nuxt.js SSR 的文章...</p>',
    author: 'John Doe',
    publishedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Vue.js 组件开发',
    content: '<p>这是一篇关于 Vue.js 组件的文章...</p>',
    author: 'Jane Smith',
    publishedAt: '2023-01-02T00:00:00Z'
  }
];

// 获取所有文章
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// 获取单篇文章
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  res.json(post);
});

// 创建文章
app.post('/api/posts', (req, res) => {
  const newPost = {
    id: String(posts.length + 1),
    ...req.body,
    publishedAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

module.exports = app;

// 6. 状态管理 - store/posts.js
export const state = () => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null
});

export const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts;
  },
  
  SET_CURRENT_POST(state, post) {
    state.currentPost = post;
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  ADD_POST(state, post) {
    state.posts.unshift(post);
  },
  
  UPDATE_POST(state, updatedPost) {
    const index = state.posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      state.posts.splice(index, 1, updatedPost);
    }
  },
  
  DELETE_POST(state, postId) {
    state.posts = state.posts.filter(p => p.id !== postId);
  }
};

export const actions = {
  async fetchPosts({ commit }) {
    try {
      commit('SET_LOADING', true);
      const posts = await this.$axios.$get('/api/posts');
      commit('SET_POSTS', posts);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchPost({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      const post = await this.$axios.$get(`/api/posts/${id}`);
      commit('SET_CURRENT_POST', post);
      return post;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async createPost({ commit }, postData) {
    try {
      const post = await this.$axios.$post('/api/posts', postData);
      commit('ADD_POST', post);
      return post;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },
  
  async updatePost({ commit }, { id, data }) {
    try {
      const post = await this.$axios.$put(`/api/posts/${id}`, data);
      commit('UPDATE_POST', post);
      return post;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },
  
  async deletePost({ commit }, id) {
    try {
      await this.$axios.$delete(`/api/posts/${id}`);
      commit('DELETE_POST', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  }
};

export const getters = {
  getPostById: (state) => (id) => {
    return state.posts.find(post => post.id === id);
  },
  
  getPostsByAuthor: (state) => (author) => {
    return state.posts.filter(post => post.author === author);
  },
  
  isLoading: (state) => state.loading,
  hasError: (state) => !!state.error
};

// 7. 布局组件 - layouts/default.vue
<template>
  <div class="app-layout">
    <header class="header">
      <nav class="nav">
        <nuxt-link to="/" class="logo">Nuxt SSR Demo</nuxt-link>
        <div class="nav-links">
          <nuxt-link to="/posts">文章</nuxt-link>
          <nuxt-link to="/about">关于</nuxt-link>
          <div v-if="$auth.loggedIn" class="user-menu">
            <span>{{ $auth.user.name }}</span>
            <button @click="$auth.logout()">退出</button>
          </div>
          <nuxt-link v-else to="/login">登录</nuxt-link>
        </div>
      </nav>
    </header>
    
    <main class="main">
      <nuxt />
    </main>
    
    <footer class="footer">
      <p>&copy; 2023 Nuxt.js SSR Demo</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
};
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2d3748;
  color: white;
  padding: 1rem 0;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-links a:hover,
.nav-links a.nuxt-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

.footer {
  background: #f7fafc;
  padding: 1rem 0;
  text-align: center;
  color: #4a5568;
}
</style>

// 8. 错误页面 - layouts/error.vue
<template>
  <div class="error-page">
    <h1 v-if="error.statusCode === 404">页面未找到</h1>
    <h1 v-else>应用发生错误</h1>
    
    <p>{{ error.message }}</p>
    
    <div class="actions">
      <nuxt-link to="/" class="btn">返回首页</nuxt-link>
      <button @click="$router.go(-1)" class="btn btn-secondary">返回上页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorLayout',
  layout: 'empty',
  props: ['error'],
  
  head() {
    const title = this.error.statusCode === 404 ? '页面未找到' : '发生错误';
    return {
      title
    };
  }
};
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background: #2c5aa0;
}

.btn-secondary {
  background: #718096;
}

.btn-secondary:hover {
  background: #4a5568;
}
</style>

// 9. 性能优化配置
// nuxt.config.js 性能优化部分
export default {
  // 渲染性能
  render: {
    // 资源提示
    resourceHints: true,
    
    // 内联关键 CSS
    inlineStyles: false,
    
    // 压缩 HTML
    compressor: { threshold: 0 },
    
    // HTTP/2 推送
    http2: {
      push: true,
      pushAssets: (req, res, publicPath, preloadFiles) => {
        return preloadFiles
          .filter(f => f.asType === 'script' && f.isInitial)
          .map(f => `<${publicPath}${f.file}>; rel=preload; as=${f.asType}`);
      }
    }
  },
  
  // 构建优化
  build: {
    // 分析包大小
    analyze: process.env.NODE_ENV === 'development',
    
    // 代码分割
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true
    },
    
    // 优化 CSS
    optimizeCSS: true,
    
    // 提取 CSS
    extractCSS: {
      ignoreOrder: true
    },
    
    // Babel 配置
    babel: {
      presets({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 }
            }
          ]
        ];
      }
    },
    
    // Webpack 扩展
    extend(config, { isDev, isClient }) {
      // 生产环境优化
      if (!isDev && isClient) {
        config.optimization.splitChunks.cacheGroups.vendor = {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 1
        };
      }
    }
  }
};

/**
 * Nuxt.js SSR 最佳实践：
 * 
 * 1. 数据获取策略：
 *    - asyncData: 页面级数据获取
 *    - fetch: 组件级数据获取
 *    - nuxtServerInit: 全局数据初始化
 * 
 * 2. 性能优化：
 *    - 合理使用静态生成
 *    - 实现代码分割
 *    - 优化图片和资源加载
 * 
 * 3. SEO 优化：
 *    - 动态设置 head 信息
 *    - 实现结构化数据
 *    - 优化页面加载速度
 * 
 * 4. 缓存策略：
 *    - 服务器端缓存
 *    - 客户端缓存
 *    - CDN 缓存
 * 
 * 5. 错误处理：
 *    - 自定义错误页面
 *    - 全局错误处理
 *    - 优雅降级
 */