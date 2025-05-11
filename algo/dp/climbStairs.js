/**
 * 爬楼梯
 * 题目：假设你正在爬楼梯。需要 n 阶你才能到达楼顶。
 * 每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
 * 
 * 示例 1：
 * 输入：n = 2
 * 输出：2
 * 解释：有两种方法可以爬到楼顶。
 * 1. 1 阶 + 1 阶
 * 2. 2 阶
 * 
 * 示例 2：
 * 输入：n = 3
 * 输出：3
 * 解释：有三种方法可以爬到楼顶。
 * 1. 1 阶 + 1 阶 + 1 阶
 * 2. 1 阶 + 2 阶
 * 3. 2 阶 + 1 阶
 */

/**
 * 动态规划解法
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    
    const dp = new Array(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    
    for (let i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

/**
 * 优化空间复杂度
 * 时间复杂度：O(n)
 * 空间复杂度：O(1)
 * @param {number} n
 * @return {number}
 */
function climbStairsOptimized(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    
    let prev = 1;
    let curr = 2;
    
    for (let i = 3; i <= n; i++) {
        const sum = prev + curr;
        prev = curr;
        curr = sum;
    }
    
    return curr;
}

/**
 * 递归解法（带记忆化）
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * @param {number} n
 * @return {number}
 */
function climbStairsMemo(n) {
    const memo = {};
    
    function climb(i) {
        if (i in memo) return memo[i];
        if (i <= 0) return 0;
        if (i === 1) return 1;
        if (i === 2) return 2;
        
        memo[i] = climb(i - 1) + climb(i - 2);
        return memo[i];
    }
    
    return climb(n);
}

// 测试
function test() {
    for (let i = 1; i <= 10; i++) {
        console.log(`爬 ${i} 层楼梯的方法数：`, climbStairs(i));
    }
    
    console.log('\n性能测试（n = 40）：');
    
    console.time('动态规划');
    climbStairs(40);
    console.timeEnd('动态规划');
    
    console.time('优化解法');
    climbStairsOptimized(40);
    console.timeEnd('优化解法');
    
    console.time('记忆化递归');
    climbStairsMemo(40);
    console.timeEnd('记忆化递归');
}

test(); 