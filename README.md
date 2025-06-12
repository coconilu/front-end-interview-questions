# 前端面试笔试题集合

这个仓库收集了前端开发面试中常见的笔试题和编程挑战，包括 JavaScript 核心概念、数据结构、算法、异步编程等多个方面。每个示例都包含详细注释，帮助理解实现思路。

## 项目结构

```
.
├── algo/                      # 算法相关题目
│   ├── array/                 # 数组相关算法
│   │   ├── 1_two_sum.js                # 两数之和
│   │   ├── 11_container_with_most_water.js # 盛最多水的容器
│   │   ├── 15_3sum.js                  # 三数之和
│   │   ├── 53_maximum_subarray.js      # 最大子序和
│   │   └── 238_product_of_array_except_self.js # 除自身以外数组的乘积
│   │
│   ├── backtracking/          # 回溯算法
│   │   ├── 46_permutations.js          # 全排列
│   │   └── 78_subsets.js               # 子集
│   │
│   ├── bit-manipulation/      # 位运算
│   │   ├── 136_single_number.js        # 只出现一次的数字
│   │   └── 191_number_of_1_bits.js     # 位1的个数
│   │
│   ├── design-patterns/       # 设计模式
│   │   ├── 23_merge_k_sorted_lists.js  # 合并K个升序链表
│   │   └── 208_implement_trie_prefix_tree.js # 实现Trie(前缀树)
│   │
│   ├── dp/                    # 动态规划
│   │   ├── 5_longest_palindromic_substring.js # 最长回文子串
│   │   ├── 70_climbing_stairs.js       # 爬楼梯
│   │   ├── 121_best_time_to_buy_and_sell_stock.js # 买卖股票的最佳时机
│   │   ├── 322_coin_change.js          # 零钱兑换
│   │   ├── climbStairs.js              # 爬楼梯（详细解法）
│   │   ├── coinChange.js               # 零钱兑换（详细解法）
│   │   ├── editDistance.js             # 编辑距离
│   │   ├── fibonacci.js                # 斐波那契数列
│   │   ├── knapsack.js                 # 背包问题
│   │   ├── longestCommonSubsequence.js # 最长公共子序列
│   │   └── maxSubArray.js              # 最大子数组和（详细解法）
│   │
│   ├── graph-algorithms/      # 图算法
│   │   ├── 200_number_of_islands.js    # 岛屿数量
│   │   └── 207_course_schedule.js      # 课程表
│   │
│   ├── greedy/                # 贪心算法
│   │   ├── 55_jump_game.js             # 跳跃游戏
│   │   └── 56_merge_intervals.js       # 合并区间
│   │
│   ├── hash-table/            # 哈希表
│   │   ├── 3_longest_substring_without_repeating_characters.js # 无重复字符的最长子串
│   │   ├── 49_group_anagrams.js        # 字母异位词分组
│   │   └── 146_lru_cache.js            # LRU缓存机制
│   │
│   ├── linkList/              # 链表算法
│   │   ├── 21_merge_two_sorted_lists.js # 合并两个有序链表
│   │   ├── 141_linked_list_cycle.js    # 环形链表
│   │   ├── 206_reverse_linked_list.js  # 反转链表
│   │   ├── addTwoNumbers.js            # 两数相加
│   │   ├── detectCycle.js              # 环形链表II
│   │   ├── getIntersectionNode.js      # 相交链表
│   │   ├── hasCycle.js                 # 环形链表（详细解法）
│   │   ├── isPalindrome.js             # 回文链表
│   │   ├── mergeSortedLink.js          # 合并有序链表
│   │   ├── mergeTwoLists.js            # 合并两个有序链表（详细解法）
│   │   ├── removeNthFromEnd.js         # 删除链表的倒数第N个节点
│   │   ├── reorderList.js              # 重排链表
│   │   ├── reverseList.js              # 反转链表（详细解法）
│   │   └── sortList.js                 # 排序链表
│   │
│   ├── math/                  # 数学算法
│   │   ├── 50_powx_n.js                # Pow(x, n)
│   │   ├── 69_sqrtx.js                 # x的平方根
│   │   └── sieveOfEratosthenes.js      # 埃拉托斯特尼筛法
│   │
│   ├── searching/             # 搜索算法
│   │   ├── 33_search_in_rotated_sorted_array.js # 搜索旋转排序数组
│   │   ├── 704_binary_search.js        # 二分查找
│   │   ├── binarySearch.js             # 二分查找（详细解法）
│   │   └── dfs.js                      # 深度优先搜索
│   │
│   ├── sorting/               # 排序算法
│   │   ├── 912_sort_an_array.js        # 排序数组
│   │   ├── mergeSort.js                # 归并排序
│   │   └── quickSort.js                # 快速排序
│   │
│   ├── stack-and-queue/       # 栈和队列
│   │   ├── 20_valid_parentheses.js     # 有效的括号
│   │   └── 155_min_stack.js            # 最小栈
│   │
│   ├── string-algorithms/     # 字符串算法
│   │   ├── 5_longest_palindromic_substring.js # 最长回文子串
│   │   ├── 76_minimum_window_substring.js # 最小覆盖子串
│   │   └── kmp.js                      # KMP字符串匹配算法
│   │
│   └── tree/                  # 树相关算法
│       ├── 94_binary_tree_inorder_traversal.js # 二叉树的中序遍历
│       ├── 101_symmetric_tree.js       # 对称二叉树
│       ├── 104_maximum_depth_of_binary_tree.js # 二叉树的最大深度
│       ├── 226_invert_binary_tree.js   # 翻转二叉树
│       └── binaryTreeTraversal.js      # 二叉树遍历方法
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
│   ├── hashTable.js           # 哈希表实现
│   ├── heap.js                # 堆（最大堆/最小堆）实现
│   └── stack.js               # 栈数据结构实现
│
├── dom/                       # DOM操作和事件处理
│   ├── eventDelegation.js     # 事件委托实现
│   └── domTraversal.js        # DOM树遍历方法
│
├── css/                       # CSS和布局相关题目
│   ├── centerElement.html     # 元素居中的多种方法
│   ├── flexboxLayout.html     # Flexbox布局实现
│   ├── gridLayout.html        # CSS Grid布局特性、用法和示例
│   ├── cssAnimations.html     # CSS动画实现方式，包括transition、animation和transform
│   ├── cssSelector.html       # CSS选择器类型及优先级规则
│   ├── cssBFC.html            # CSS块级格式化上下文的概念、特性和应用场景
│   ├── responsiveDesign.html  # 响应式设计的核心技术和实现方法
│   ├── cssVariable.html       # CSS变量(自定义属性)的使用方法和应用场景
│   ├── cssPreprocessors.html  # Sass、Less和Stylus三种CSS预处理器的特点和语法
│   └── borderGradient.html    # 圆角边框渐变效果的实现方法
│
├── frameworks/                # 前端框架相关
│   ├── react/                 # React相关题目
│   │   ├── useHooks.js        # 自定义Hook实现
│   │   ├── virtualDOM.js      # 虚拟DOM实现原理
│   │   ├── hooksImplementation.js # React Hooks实现原理
│   │   ├── performanceOptimization.js # React性能优化
│   │   ├── stateManagement.js # React状态管理(Redux实现)
│   │   ├── contextImplementation.js # Context API实现
│   │   └── routerImplementation.js # React Router实现
│   └── vue/                   # Vue相关题目
│       ├── reactivity.js      # 响应式原理实现
│       ├── useDebounceRef.js  # 自定义防抖Ref实现
│       ├── vue2observer.js    # Vue2数组响应式原理实现
│       ├── vue3observer.js    # Vue3数组响应式原理实现
│       ├── vueLifecycle.js    # 生命周期钩子使用
│       ├── componentCommunication.js # 组件通信方式
│       ├── vueRouter.js       # Vue Router实现与应用
│       ├── vuex.js            # Vuex状态管理
│       ├── compositionAPI.js  # Composition API
│       ├── renderFunction.js  # 渲染函数与JSX
│       ├── virtualDOM.js      # 虚拟DOM结构与实现
│       └── diffAlgorithm.js   # Diff算法及最长递增子序列实现
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
│   ├── inferTypes.ts          # 类型推断示例
│   ├── decorators.ts          # 装饰器模式实现
│   ├── advancedTypes.ts       # 高级类型实现
│   ├── typeGuards.ts          # 类型守卫实现
│   ├── conditionalTypes.ts    # 条件类型实现
│   ├── genericConstraints.ts  # 泛型约束实现
│   └── utilityTypes.ts        # 工具类型实现
│
├── mobile/                    # 移动端和响应式
│   ├── touchEvents.js         # 移动端触摸事件处理与手势识别
│   ├── responsiveDesign.html  # 响应式设计实现
│   ├── mobileOptimization.html # 移动端性能优化方法和技巧
│   ├── deviceAdaptation.html  # 移动端设备适配方案
│   └── hybridApp.html         # 混合应用开发基础知识和技术
│
├── js-core/                   # JavaScript核心概念
│   ├── function/              # 函数相关题目
│   │   ├── currying.js        # 函数柯里化实现
│   │   ├── bind.js            # 手写bind函数
│   │   ├── call.js            # 手写call函数
│   │   ├── apply.js           # 手写apply函数
│   │   └── once.js            # 只执行一次的函数
│   │
│   └── object/                # 对象相关题目
│       ├── deepClone.js       # 深拷贝实现
│       └── inheritance.js     # 继承模式实现
│
├── promise/                   # Promise相关实现
│   ├── promiseAll.js          # 实现Promise.all
│   ├── promiseLimit.js        # 实现Promise并发限制
│   └── promiseRace.js         # 实现Promise.race
│
├── utils/                     # 实用工具函数
│   ├── eventEmitter.js        # 事件发布订阅模式
│   └── deepEqual.js           # 对象深度比较
│
├── micro-frontend/            # 微前端架构
│   ├── moduleFederation.js    # Webpack Module Federation实现
│   ├── singleSpa.js           # Single-SPA框架使用
│   ├── qiankun.js             # qiankun微前端框架
│   └── microAppCommunication.js # 微应用间通信方案
│
├── ssr/                       # 服务端渲染
│   ├── nextjsSSR.js           # Next.js服务端渲染实现
│   └── nuxtSSR.js             # Nuxt.js服务端渲染实现
│
├── build-tools/               # 构建工具深入
│   ├── webpackAdvanced.js     # Webpack高级配置与优化
│   └── viteConfig.js          # Vite配置与优化
│
├── monitoring-debugging/      # 监控与调试
│   ├── performanceMonitoring.js # 前端性能监控实现
│   └── debuggingTools.js      # 调试工具与技巧
│
├── design-patterns-advanced/  # 设计模式进阶
│   └── designPatterns.js      # 高级设计模式实现
│
├── nodejs-backend/            # Node.js后端开发
│   └── nodeBasics.js          # Node.js基础与实践
│
├── testing/                   # 测试框架与实践
│   └── testingFrameworks.js   # 前端测试框架使用
│
├── low-code-visual/           # 低代码/可视化开发
│   └── lowCodePlatform.js     # 低代码平台实现
│
├── webassembly/               # WebAssembly
│   └── wasmBasics.js          # WebAssembly基础与应用
│
└── emerging-tech/             # 新兴技术与趋势
    └── emergingTechnologies.js # Web3、AI集成、边缘计算等新兴技术
```

## 使用方法

每个 JavaScript 文件都是独立的，包含了一个特定问题的解决方案。你可以直接查看源代码学习实现思路，或者在本地环境中运行测试。

## 学习资源

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/)
- [JavaScript 高级程序设计](https://book.douban.com/subject/10546125/)
- [算法导论](https://book.douban.com/subject/20432061/)

## 许可证

MIT
