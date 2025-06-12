/**
 * Vite 高级配置与优化
 * 
 * Vite 是新一代前端构建工具，基于 ES modules 和 esbuild
 * 本文件展示了 Vite 的高级配置、插件开发、性能优化等内容
 */

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import eslint from 'vite-plugin-eslint';
import { defineConfig as defineVitestConfig } from 'vitest/config';

// 1. 基础 Vite 配置
export default defineConfig(({ command, mode, ssrBuild }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    // 基础配置
    base: env.VITE_BASE_URL || '/',
    mode,
    
    // 环境变量前缀
    envPrefix: 'VITE_',
    
    // 定义全局常量
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDevelopment,
      __PROD__: isProduction
    },

    // 插件配置
    plugins: [
      // Vue 支持
      vue({
        include: [/\.vue$/, /\.md$/],
        reactivityTransform: true,
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      
      // React 支持
      react({
        include: '**/*.{jsx,tsx}',
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }]
          ]
        }
      }),
      
      // ESLint
      eslint({
        include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
        exclude: ['node_modules', 'dist'],
        cache: false
      }),
      
      // HTML 模板处理
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: env.VITE_APP_TITLE || 'Vite App',
            description: env.VITE_APP_DESCRIPTION || 'A Vite application'
          }
        }
      }),
      
      // SVG 图标
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last',
        customDomId: '__svg__icons__dom__'
      }),
      
      // 包分析
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),

    // 解析配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@api': resolve(__dirname, 'src/api'),
        '@store': resolve(__dirname, 'src/store'),
        '@views': resolve(__dirname, 'src/views')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // CSS 配置
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/variables.scss";
            @import "@/styles/mixins.scss";
          `,
          charset: false
        },
        less: {
          additionalData: `@import "@/styles/variables.less";`,
          javascriptEnabled: true
        }
      },
      
      // CSS Modules
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction 
          ? '[hash:base64:8]' 
          : '[name]__[local]___[hash:base64:5]'
      },
      
      // PostCSS
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('cssnano')({
            preset: 'default'
          })
        ]
      }
    },

    // 开发服务器
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      
      // 代理配置
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/upload': {
          target: env.VITE_UPLOAD_URL || 'http://localhost:8081',
          changeOrigin: true
        }
      },
      
      // 预热文件
      warmup: {
        clientFiles: ['./src/components/*.vue', './src/utils/*.ts']
      }
    },

    // 预览服务器
    preview: {
      host: '0.0.0.0',
      port: 4173,
      open: true
    },

    // 构建配置
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      
      // 资源内联阈值
      assetsInlineLimit: 4096,
      
      // CSS 代码分割
      cssCodeSplit: true,
      
      // 生成 source map
      sourcemap: isProduction ? false : true,
      
      // 压缩配置
      minify: 'esbuild',
      
      // 清空输出目录
      emptyOutDir: true,
      
      // Rollup 配置
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          // 多页面应用
          admin: resolve(__dirname, 'admin.html')
        },
        
        output: {
          // 分包策略
          manualChunks: {
            // 第三方库
            vendor: ['vue', 'vue-router', 'pinia'],
            utils: ['lodash', 'axios', 'dayjs'],
            ui: ['element-plus', 'ant-design-vue']
          },
          
          // 文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
              return `media/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        },
        
        // 外部依赖
        external: ['vue', 'react'],
        
        // 插件
        plugins: []
      },
      
      // 构建监听
      watch: isDevelopment ? {
        include: 'src/**',
        exclude: 'node_modules/**'
      } : null,
      
      // 报告压缩后的大小
      reportCompressedSize: false,
      
      // 块大小警告限制
      chunkSizeWarningLimit: 1000
    },

    // 依赖优化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'lodash',
        'dayjs'
      ],
      exclude: [
        'vue-demi'
      ],
      
      // esbuild 配置
      esbuildOptions: {
        target: 'es2020'
      }
    },

    // SSR 配置
    ssr: {
      noExternal: ['element-plus'],
      external: ['vue', 'vue-router']
    },

    // 工作线程配置
    worker: {
      format: 'es',
      plugins: []
    },

    // 实验性功能
    experimental: {
      renderBuiltUrl: (filename, { hostType }) => {
        if (hostType === 'js') {
          return { js: `window.__assetsPath(${JSON.stringify(filename)})` };
        } else {
          return { relative: true };
        }
      }
    }
  };
});

// 2. 自定义 Vite 插件
function customVitePlugin(options = {}) {
  return {
    name: 'custom-vite-plugin',
    
    // 配置解析钩子
    config(config, { command }) {
      if (command === 'serve') {
        config.define = config.define || {};
        config.define.__IS_DEV__ = true;
      }
    },
    
    // 配置服务器钩子
    configureServer(server) {
      server.middlewares.use('/api/health', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      });
    },
    
    // 构建开始钩子
    buildStart(opts) {
      console.log('构建开始...');
    },
    
    // 解析 ID 钩子
    resolveId(id) {
      if (id === 'virtual:my-module') {
        return id;
      }
    },
    
    // 加载钩子
    load(id) {
      if (id === 'virtual:my-module') {
        return 'export const msg = "Hello from virtual module!"';
      }
    },
    
    // 转换钩子
    transform(code, id) {
      if (id.endsWith('.vue') && options.addTimestamp) {
        return {
          code: code.replace(
            /<template>/,
            `<template><!-- Generated at ${new Date().toISOString()} -->`
          ),
          map: null
        };
      }
    },
    
    // 生成包钩子
    generateBundle(opts, bundle) {
      // 生成资源清单
      const manifest = {};
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        manifest[fileName] = {
          type: chunk.type,
          size: chunk.type === 'chunk' ? chunk.code.length : chunk.source.length
        };
      });
      
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2)
      });
    },
    
    // 构建结束钩子
    buildEnd() {
      console.log('构建结束!');
    }
  };
}

// 3. 环境配置管理
class ViteConfigManager {
  static createConfig(env) {
    const { mode, command } = env;
    const isProduction = mode === 'production';
    const isDevelopment = mode === 'development';
    const isBuild = command === 'build';
    
    return {
      // 基础配置
      ...this.getBaseConfig(env),
      
      // 插件配置
      plugins: this.getPlugins(env),
      
      // 构建配置
      build: this.getBuildConfig(env),
      
      // 开发服务器配置
      server: isDevelopment ? this.getServerConfig(env) : undefined,
      
      // 优化配置
      optimizeDeps: this.getOptimizeDepsConfig(env)
    };
  }
  
  static getBaseConfig(env) {
    return {
      base: process.env.VITE_BASE_URL || '/',
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src')
        }
      }
    };
  }
  
  static getPlugins(env) {
    const { mode } = env;
    const isProduction = mode === 'production';
    
    const plugins = [
      vue(),
      customVitePlugin({ addTimestamp: !isProduction })
    ];
    
    if (isProduction) {
      plugins.push(
        visualizer({
          filename: 'dist/stats.html'
        })
      );
    }
    
    return plugins;
  }
  
  static getBuildConfig(env) {
    const { mode } = env;
    const isProduction = mode === 'production';
    
    return {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: isProduction ? {
            vendor: ['vue', 'vue-router'],
            utils: ['lodash', 'axios']
          } : undefined
        }
      }
    };
  }
  
  static getServerConfig(env) {
    return {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    };
  }
  
  static getOptimizeDepsConfig(env) {
    return {
      include: ['vue', 'vue-router', 'axios'],
      exclude: ['vue-demi']
    };
  }
}

// 4. Vite 性能优化
const performanceOptimizations = {
  // 预构建优化
  optimizeDeps: {
    // 强制预构建
    force: true,
    
    // 包含依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es',
      'element-plus/es',
      'element-plus/es/components/button/style/css',
      '@element-plus/icons-vue'
    ],
    
    // 排除依赖
    exclude: [
      'vue-demi',
      '@vueuse/core'
    ]
  },
  
  // 构建优化
  build: {
    // 使用 esbuild 压缩
    minify: 'esbuild',
    
    // 禁用 brotli 压缩报告
    reportCompressedSize: false,
    
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 2000,
    
    rollupOptions: {
      output: {
        // 更细粒度的代码分割
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue';
            }
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  
  // 服务器优化
  server: {
    // 预热文件
    warmup: {
      clientFiles: [
        './src/components/**/*.vue',
        './src/utils/**/*.ts'
      ]
    },
    
    // 文件系统缓存
    fs: {
      strict: false,
      allow: ['..', './src']
    }
  }
};

// 5. Vite 插件生态
const vitePluginEcosystem = {
  // 框架插件
  frameworks: {
    vue: '@vitejs/plugin-vue',
    react: '@vitejs/plugin-react',
    svelte: '@sveltejs/vite-plugin-svelte',
    solid: 'vite-plugin-solid'
  },
  
  // 工具插件
  tools: {
    eslint: 'vite-plugin-eslint',
    mock: 'vite-plugin-mock',
    pwa: 'vite-plugin-pwa',
    windicss: 'vite-plugin-windicss',
    unocss: 'unocss/vite'
  },
  
  // 优化插件
  optimization: {
    legacy: '@vitejs/plugin-legacy',
    bundle: 'rollup-plugin-visualizer',
    compression: 'vite-plugin-compression'
  },
  
  // 开发插件
  development: {
    restart: 'vite-plugin-restart',
    inspect: 'vite-plugin-inspect',
    components: 'unplugin-vue-components/vite'
  }
};

// 6. Vite 与 Webpack 对比
const viteVsWebpack = {
  // 开发体验
  development: {
    vite: {
      启动速度: '极快（基于 esbuild）',
      热更新: '极快（基于 ES modules）',
      构建工具: 'esbuild + Rollup'
    },
    webpack: {
      启动速度: '较慢（需要打包）',
      热更新: '较快（HMR）',
      构建工具: 'Webpack'
    }
  },
  
  // 生产构建
  production: {
    vite: {
      构建工具: 'Rollup',
      代码分割: '基于 ES modules',
      优化: 'Tree shaking + 压缩'
    },
    webpack: {
      构建工具: 'Webpack',
      代码分割: '基于 chunks',
      优化: 'Tree shaking + 压缩 + 缓存'
    }
  },
  
  // 生态系统
  ecosystem: {
    vite: {
      插件系统: 'Rollup 插件 + Vite 插件',
      社区: '快速增长',
      兼容性: '现代浏览器优先'
    },
    webpack: {
      插件系统: 'Webpack 插件',
      社区: '成熟稳定',
      兼容性: '广泛支持'
    }
  }
};

// 7. Vitest 配置（测试）
export const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}'
      ]
    }
  }
});

// 导出配置
export {
  customVitePlugin,
  ViteConfigManager,
  performanceOptimizations,
  vitePluginEcosystem,
  viteVsWebpack
};

/**
 * Vite 核心特性总结：
 * 
 * 1. 开发体验：
 *    - 极快的冷启动
 *    - 即时热模块替换
 *    - 真正的按需编译
 * 
 * 2. 现代化：
 *    - 基于 ES modules
 *    - 原生支持 TypeScript
 *    - 内置 CSS 预处理器支持
 * 
 * 3. 插件系统：
 *    - 兼容 Rollup 插件
 *    - 丰富的官方插件
 *    - 简单的插件 API
 * 
 * 4. 构建优化：
 *    - 基于 Rollup 的生产构建
 *    - 自动代码分割
 *    - 内置优化策略
 */