# 前端面试笔试题集合

这个仓库收集了前端开发面试中常见的笔试题和编程挑战，包括JavaScript核心概念、数据结构、算法、异步编程等多个方面。每个示例都包含详细注释，帮助理解实现思路。

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