# 前端面试笔试题集合

这个仓库收集了前端开发面试中常见的笔试题和编程挑战，包括JavaScript核心概念、数据结构、算法、异步编程等多个方面。每个示例都包含详细注释，帮助理解实现思路。

## 项目结构

```
.
├── algo/                      # 算法相关题目
│   ├── backtracking/          # 回溯算法
│   ├── bit-manipulation/      # 位运算
│   ├── design-patterns/       # 设计模式
│   ├── dp/                    # 动态规划
│   ├── graph-algorithms/      # 图算法
│   ├── greedy/                # 贪心算法
│   ├── linkList/              # 链表算法
│   ├── math/                  # 数学算法
│   ├── searching/             # 搜索算法
│   ├── sorting/               # 排序算法
│   ├── string-algorithms/     # 字符串算法
│   └── tree/                  # 树相关算法
│
├── array-operations/          # 数组操作相关题目
│   ├── flattenArray.js        # 数组扁平化实现
│   └── arrayDeduplication.js  # 数组去重方法
│
├── async/                     # 异步编程相关题目
│   ├── asyncAwait.js          # async/await使用示例
│   └── generatorAsync.js      # 使用Generator实现异步
│
├── data-structures/           # 数据结构实现
│   ├── LRUCache.js            # LRU缓存实现
│   └── hashTable.js           # 哈希表实现
│
├── dom/                       # DOM操作和事件处理
│   ├── eventDelegation.js     # 事件委托实现
│   └── domTraversal.js        # DOM树遍历方法
│
├── css/                       # CSS和布局相关题目
│   ├── centerElement.html     # 元素居中的多种方法
│   └── flexboxLayout.html     # Flexbox布局实现
│
├── frameworks/                # 前端框架相关
│   ├── react/                 # React相关题目
│   │   ├── useHooks.js        # 自定义Hook实现
│   │   └── virtualDOM.js      # 虚拟DOM实现原理
│   └── vue/                   # Vue相关题目
│       ├── reactivity.js      # 响应式原理实现
│       └── vueLifecycle.js    # 生命周期钩子使用
│
├── performance/               # 前端性能优化
│   ├── lazyLoading.js         # 图片懒加载实现
│   └── debounceThrottle.js    # 防抖和节流函数
│
├── network/                   # 网络和HTTP相关
│   ├── httpCache.js           # HTTP缓存机制
│   └── ajaxImplementation.js  # 手写AJAX请求
│
├── browser/                   # 浏览器API和兼容性
│   ├── storageAPI.js          # 存储API使用比较
│   └── crossOrigin.js         # 跨域解决方案
│
├── security/                  # Web安全
│   ├── xssPrevent.js          # XSS攻击与防御
│   └── csrfProtection.js      # CSRF攻击与防御
│
├── engineering/               # 前端工程化
│   ├── webpackConfig.js       # Webpack配置示例
│   └── babelPlugin.js         # Babel插件开发
│
├── typescript/                # TypeScript相关
│   ├── genericTypes.ts        # 泛型使用示例
│   └── decorators.ts          # 装饰器模式实现
│
├── mobile/                    # 移动端和响应式
│   ├── touchEvents.js         # 移动端触摸事件
│   └── responsiveDesign.html  # 响应式设计实现
│
├── js-core/                   # JavaScript核心概念
│   ├── function/              # 函数相关题目
│   │   ├── currying.js        # 函数柯里化实现
│   │   └── bind.js            # 手写bind函数
│   └── object/                # 对象相关题目
│       ├── deepClone.js       # 深拷贝实现
│       └── inheritance.js     # 继承模式实现
│
├── promise/                   # Promise相关实现
│   ├── promiseAll.js          # 实现Promise.all
│   ├── promiseLimit.js        # 实现Promise并发限制
│   └── promiseRace.js         # 实现Promise.race
│
└── utils/                     # 实用工具函数
    ├── eventEmitter.js        # 事件发布订阅模式
    └── deepEqual.js           # 对象深度比较
```

## 使用方法

每个JavaScript文件都是独立的，包含了一个特定问题的解决方案。你可以直接查看源代码学习实现思路，或者在本地环境中运行测试。

## 学习资源

- [MDN Web文档](https://developer.mozilla.org/zh-CN/)
- [JavaScript高级程序设计](https://book.douban.com/subject/10546125/)
- [算法导论](https://book.douban.com/subject/20432061/)

## 许可证

MIT 