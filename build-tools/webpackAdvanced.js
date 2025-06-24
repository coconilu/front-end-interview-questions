/**
 * Webpack 高级配置与优化
 *
 * 本文件展示了 Webpack 的高级配置、性能优化、插件开发等内容
 * 适用于高级前端工程师面试中的构建工具相关问题
 */

// 1. 高级 Webpack 配置
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    // 入口配置
    entry: {
      main: './src/index.js',
      vendor: ['react', 'react-dom', 'lodash'],
      polyfills: './src/polyfills.js',
    },

    // 输出配置
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction
        ? '[name].[contenthash:8].chunk.js'
        : '[name].chunk.js',
      publicPath: '/',
      clean: true, // 清理输出目录
      // 库配置
      library: {
        name: 'MyLibrary',
        type: 'umd',
        export: 'default',
      },
      // 全局对象
      globalObject: 'this',
    },

    // 模式
    mode: isProduction ? 'production' : 'development',

    // 开发工具
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',

    // 解析配置
    resolve: {
      // 文件扩展名
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],

      // 别名
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      },

      // 模块查找路径
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],

      // 主字段
      mainFields: ['browser', 'module', 'main'],

      // 符号链接
      symlinks: false,

      // 缓存
      cache: true,
    },

    // 模块配置
    module: {
      rules: [
        // JavaScript/TypeScript
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: 3,
                      targets: {
                        browsers: ['> 1%', 'last 2 versions'],
                      },
                    },
                  ],
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  '@babel/plugin-proposal-object-rest-spread',
                  isDevelopment && 'react-hot-loader/babel',
                ].filter(Boolean),
                cacheDirectory: true,
              },
            },
          ],
        },

        // CSS/SCSS
        {
          test: /\.(css|scss|sass)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[name]__[local]--[hash:base64:5]',
                },
                importLoaders: 2,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer', 'cssnano'],
                },
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src/styles')],
                },
              },
            },
          ],
        },

        // 图片
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8KB
            },
          },
          generator: {
            filename: 'images/[name].[hash:8][ext]',
          },
        },

        // 字体
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext]',
          },
        },

        // 其他资源
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'media/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // 优化配置
    optimization: {
      minimize: isProduction,
      minimizer: [
        // JS 压缩
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),

        // CSS 压缩
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),
      ],

      // 代码分割
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 第三方库
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },

          // 公共代码
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },

          // React 相关
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },

          // 工具库
          utils: {
            test: /[\\/]node_modules[\\/](lodash|moment|axios)[\\/]/,
            name: 'utils',
            priority: 15,
            chunks: 'all',
          },
        },
      },

      // 运行时代码
      runtimeChunk: {
        name: 'runtime',
      },

      // 模块 ID
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    },

    // 插件配置
    plugins: [
      // HTML 模板
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),

      // CSS 提取
      isProduction &&
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),

      // 环境变量
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(
          process.env.API_URL || 'http://localhost:3000'
        ),
      }),

      // 模块热替换
      isDevelopment && new webpack.HotModuleReplacementPlugin(),

      // 进度条
      new webpack.ProgressPlugin(),

      // 忽略插件
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),

      // Gzip 压缩
      isProduction &&
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        }),

      // PWA
      isProduction &&
        new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 300,
                },
              },
            },
          ],
        }),

      // 包分析
      process.env.ANALYZE && new BundleAnalyzerPlugin(),
    ].filter(Boolean),

    // 开发服务器
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      overlay: {
        warnings: false,
        errors: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        },
      },
    },

    // 性能配置
    performance: {
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 250000,
      maxEntrypointSize: 250000,
    },

    // 缓存配置
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    // 实验性功能
    experiments: {
      topLevelAwait: true,
      outputModule: true,
    },
  };
};

// 2. 自定义 Webpack 插件
class CustomPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const pluginName = 'CustomPlugin';

    // 编译开始
    compiler.hooks.compile.tap(pluginName, () => {
      console.log('编译开始...');
    });

    // 编译完成
    compiler.hooks.done.tap(pluginName, (stats) => {
      console.log('编译完成!');

      // 输出统计信息
      const { errors, warnings } = stats.compilation;
      if (errors.length > 0) {
        console.error('编译错误:', errors);
      }
      if (warnings.length > 0) {
        console.warn('编译警告:', warnings);
      }
    });

    // 资源处理
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      // 获取所有资源
      const assets = compilation.assets;

      // 创建资源清单
      const manifest = {};
      Object.keys(assets).forEach((filename) => {
        manifest[filename] = {
          size: assets[filename].size(),
          hash: compilation.hash,
        };
      });

      // 添加清单文件
      const manifestJson = JSON.stringify(manifest, null, 2);
      compilation.assets['manifest.json'] = {
        source: () => manifestJson,
        size: () => manifestJson.length,
      };

      callback();
    });
  }
}

// 3. 自定义 Loader
function customLoader(source) {
  const options = this.getOptions() || {};

  // 获取文件路径
  const filePath = this.resourcePath;

  // 添加版权信息
  if (options.addCopyright) {
    const copyright = `/**\n * Copyright (c) ${new Date().getFullYear()} My Company\n * File: ${path.basename(filePath)}\n */\n`;
    source = copyright + source;
  }

  // 替换特定字符串
  if (options.replace) {
    Object.keys(options.replace).forEach((key) => {
      const regex = new RegExp(key, 'g');
      source = source.replace(regex, options.replace[key]);
    });
  }

  return source;
}

// Loader 导出
module.exports = customLoader;

// 4. Webpack 性能优化技巧
const optimizationTips = {
  // 1. 减少解析
  reduceResolving: {
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules')],
      extensions: ['.js', '.jsx'], // 只包含必要的扩展名
      alias: {
        // 使用别名减少查找时间
        react: path.resolve(__dirname, 'node_modules/react/index.js'),
      },
    },
    module: {
      noParse: /jquery|lodash/, // 跳过解析已知的库
    },
  },

  // 2. 使用 DLL
  dllConfig: {
    entry: {
      vendor: ['react', 'react-dom', 'lodash'],
    },
    output: {
      path: path.resolve(__dirname, 'dll'),
      filename: '[name].dll.js',
      library: '[name]_library',
    },
    plugins: [
      new webpack.DllPlugin({
        path: path.resolve(__dirname, 'dll/[name].manifest.json'),
        name: '[name]_library',
      }),
    ],
  },

  // 3. 多线程构建
  threadLoader: {
    test: /\.js$/,
    include: path.resolve('src'),
    use: [
      {
        loader: 'thread-loader',
        options: {
          workers: 2,
          workerParallelJobs: 50,
          workerNodeArgs: ['--max-old-space-size=1024'],
        },
      },
      'babel-loader',
    ],
  },

  // 4. 缓存优化
  cacheOptimization: {
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
      },
    },
  },

  // 5. Tree Shaking
  treeShaking: {
    mode: 'production',
    optimization: {
      usedExports: true,
      sideEffects: false,
    },
  },
};

// 5. Webpack Bundle 分析
class BundleAnalyzer {
  static analyzeBundle(stats) {
    const { chunks, modules, assets } = stats.compilation;

    // 分析代码块
    const chunkAnalysis = chunks.map((chunk) => ({
      id: chunk.id,
      name: chunk.name,
      size: chunk.size,
      modules: chunk.getNumberOfModules(),
      files: chunk.files,
    }));

    // 分析模块
    const moduleAnalysis = modules.map((module) => ({
      id: module.id,
      name: module.name,
      size: module.size(),
      chunks: module.getChunks().map((c) => c.id),
    }));

    // 分析资源
    const assetAnalysis = Object.keys(assets).map((name) => ({
      name,
      size: assets[name].size(),
      chunks: assets[name].chunks || [],
    }));

    return {
      chunks: chunkAnalysis,
      modules: moduleAnalysis,
      assets: assetAnalysis,
      totalSize: assetAnalysis.reduce((sum, asset) => sum + asset.size, 0),
    };
  }

  static findLargestModules(modules, count = 10) {
    return modules.sort((a, b) => b.size - a.size).slice(0, count);
  }

  static findDuplicateModules(modules) {
    const moduleMap = new Map();
    const duplicates = [];

    modules.forEach((module) => {
      const name = module.name.split('!').pop(); // 移除 loader 前缀
      if (moduleMap.has(name)) {
        duplicates.push({
          name,
          instances: [moduleMap.get(name), module],
        });
      } else {
        moduleMap.set(name, module);
      }
    });

    return duplicates;
  }
}

// 6. Webpack 配置工厂函数
function createWebpackConfig(env = {}) {
  const {
    mode = 'development',
    target = 'web',
    analyze = false,
    hot = true,
  } = env;

  const isProduction = mode === 'production';
  const isDevelopment = !isProduction;

  return {
    mode,
    target,

    entry: getEntry(env),
    output: getOutput(env),
    module: getModuleConfig(env),
    plugins: getPlugins(env),
    optimization: getOptimization(env),
    resolve: getResolveConfig(env),
    devServer: isDevelopment ? getDevServer(env) : undefined,
  };
}

function getEntry(env) {
  const { mode } = env;
  const baseEntry = './src/index.js';

  if (mode === 'development') {
    return ['webpack-hot-middleware/client', baseEntry];
  }

  return baseEntry;
}

function getOutput(env) {
  const { mode } = env;
  const isProduction = mode === 'production';

  return {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
    publicPath: '/',
  };
}

function getModuleConfig(env) {
  return {
    rules: [
      // JavaScript 规则
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },

      // CSS 规则
      {
        test: /\.css$/,
        use: [
          env.mode === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
        ],
      },
    ],
  };
}

function getPlugins(env) {
  const { mode, analyze } = env;
  const isProduction = mode === 'production';

  const plugins = [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ];

  if (isProduction) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      })
    );
  }

  if (analyze) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return plugins;
}

function getOptimization(env) {
  const { mode } = env;
  const isProduction = mode === 'production';

  if (!isProduction) {
    return {};
  }

  return {
    minimize: true,
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };
}

function getResolveConfig(env) {
  return {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  };
}

function getDevServer(env) {
  return {
    contentBase: path.join(__dirname, 'dist'),
    hot: env.hot,
    port: 3000,
    historyApiFallback: true,
  };
}

// 导出配置
module.exports = {
  createWebpackConfig,
  CustomPlugin,
  customLoader,
  optimizationTips,
  BundleAnalyzer,
};

/**
 * Webpack 高级特性总结：
 *
 * 1. 性能优化：
 *    - 代码分割和懒加载
 *    - Tree Shaking
 *    - 缓存优化
 *    - 多线程构建
 *
 * 2. 开发体验：
 *    - 热模块替换
 *    - 开发服务器配置
 *    - Source Map 配置
 *
 * 3. 生产优化：
 *    - 代码压缩
 *    - 资源优化
 *    - 缓存策略
 *
 * 4. 扩展性：
 *    - 自定义插件
 *    - 自定义 Loader
 *    - 配置工厂函数
 */
