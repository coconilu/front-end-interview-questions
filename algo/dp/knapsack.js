/**
 * 0-1背包问题
 * 题目：有n个物品，每个物品有一个重量weight和一个价值value。
 * 现在有一个容量为capacity的背包，问如何选择装入背包的物品，使得装入背包的物品的总价值最大。
 * 每个物品只能使用一次（0-1背包问题）。
 * 
 * 示例：
 * 输入：weights = [2, 3, 4, 5], values = [3, 4, 5, 6], capacity = 8
 * 输出：10
 * 解释：选择第一件物品和第三件物品装入背包，总重量为 2 + 4 = 6 <= 8，总价值为 3 + 5 = 8；
 *      或者选择第一件物品和第四件物品装入背包，总重量为 2 + 5 = 7 <= 8，总价值为 3 + 6 = 9；
 *      或者选择第二件物品和第四件物品装入背包，总重量为 3 + 5 = 8 <= 8，总价值为 4 + 6 = 10。
 */

/**
 * 动态规划解法 - 二维数组
 * 时间复杂度: O(n * capacity)
 * 空间复杂度: O(n * capacity)
 * @param {number[]} weights
 * @param {number[]} values
 * @param {number} capacity
 * @return {number}
 */
function knapsack(weights, values, capacity) {
    const n = weights.length;
    
    // dp[i][j] 表示考虑前i个物品，背包容量为j时能获得的最大价值
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 0; j <= capacity; j++) {
            if (weights[i - 1] > j) {
                // 当前物品太重，无法装入背包
                dp[i][j] = dp[i - 1][j];
            } else {
                // 选择是否装入当前物品：
                // 1. 不装入当前物品，价值为dp[i-1][j]
                // 2. 装入当前物品，价值为dp[i-1][j-weights[i-1]] + values[i-1]
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    
    return dp[n][capacity];
}

/**
 * 动态规划解法 - 一维数组优化空间复杂度
 * 时间复杂度: O(n * capacity)
 * 空间复杂度: O(capacity)
 * @param {number[]} weights
 * @param {number[]} values
 * @param {number} capacity
 * @return {number}
 */
function knapsackOptimized(weights, values, capacity) {
    const n = weights.length;
    
    // dp[j] 表示背包容量为j时能获得的最大价值
    const dp = Array(capacity + 1).fill(0);
    
    for (let i = 0; i < n; i++) {
        // 必须从后往前遍历，否则会重复使用物品
        for (let j = capacity; j >= weights[i]; j--) {
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}

/**
 * 回溯解法 - 记录选择了哪些物品
 * @param {number[]} weights
 * @param {number[]} values
 * @param {number} capacity
 * @return {Object}
 */
function knapsackWithItems(weights, values, capacity) {
    const n = weights.length;
    
    // dp[i][j] 表示考虑前i个物品，背包容量为j时能获得的最大价值
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 0; j <= capacity; j++) {
            if (weights[i - 1] > j) {
                dp[i][j] = dp[i - 1][j];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    
    // 回溯找出所选物品
    const selectedItems = [];
    let remainingCapacity = capacity;
    
    for (let i = n; i > 0; i--) {
        if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
            // 选择了第i个物品
            selectedItems.push(i - 1); // 转为0-based索引
            remainingCapacity -= weights[i - 1];
        }
    }
    
    return {
        maxValue: dp[n][capacity],
        selectedItems: selectedItems.reverse()
    };
}

// 测试
function test() {
    const testCases = [
        {
            weights: [2, 3, 4, 5],
            values: [3, 4, 5, 6],
            capacity: 8,
            expected: 10
        },
        {
            weights: [1, 2, 3, 4, 5],
            values: [5, 4, 3, 2, 1],
            capacity: 10,
            expected: 15
        },
        {
            weights: [10, 20, 30],
            values: [60, 100, 120],
            capacity: 50,
            expected: 220
        }
    ];
    
    for (const { weights, values, capacity, expected } of testCases) {
        console.log(`物品重量: [${weights}]`);
        console.log(`物品价值: [${values}]`);
        console.log(`背包容量: ${capacity}`);
        
        const value1 = knapsack(weights, values, capacity);
        console.log(`二维DP结果: ${value1}, 期望: ${expected}, 正确: ${value1 === expected}`);
        
        const value2 = knapsackOptimized(weights, values, capacity);
        console.log(`一维DP结果: ${value2}, 期望: ${expected}, 正确: ${value2 === expected}`);
        
        const result = knapsackWithItems(weights, values, capacity);
        console.log(`选择的物品索引: [${result.selectedItems}], 总价值: ${result.maxValue}`);
        
        console.log('---');
    }
    
    // 性能测试
    console.log('\n性能测试（大规模数据）:');
    const n = 200;
    const largeWeights = Array(n).fill().map(() => Math.floor(Math.random() * 100) + 1);
    const largeValues = Array(n).fill().map(() => Math.floor(Math.random() * 100) + 1);
    const largeCapacity = 1000;
    
    console.time('一维DP');
    knapsackOptimized(largeWeights, largeValues, largeCapacity);
    console.timeEnd('一维DP');
    
    // 二维DP对于大数据来说会很慢，可以注释掉
    // console.time('二维DP');
    // knapsack(largeWeights, largeValues, largeCapacity);
    // console.timeEnd('二维DP');
}

test(); 