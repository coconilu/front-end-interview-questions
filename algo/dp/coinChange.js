/**
 * 零钱兑换
 * 题目：给定不同面额的硬币 coins 和一个总金额 amount，计算可以凑成总金额所需的最少的硬币个数。
 * 如果没有任何一种硬币组合能组成总金额，返回 -1。
 *
 * 示例 1:
 * 输入：coins = [1, 2, 5], amount = 11
 * 输出：3
 * 解释：11 = 5 + 5 + 1
 *
 * 示例 2:
 * 输入：coins = [2], amount = 3
 * 输出：-1
 *
 * 示例 3:
 * 输入：coins = [1], amount = 0
 * 输出：0
 */

/**
 * 动态规划解法
 * 时间复杂度：O(amount * coins.length)
 * 空间复杂度：O(amount)
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // dp[i] 表示凑成金额 i 所需的最少硬币个数
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * 递归 + 记忆化搜索解法
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChangeMemo(coins, amount) {
  const memo = {};

  function dp(n) {
    if (n in memo) return memo[n];
    if (n === 0) return 0;
    if (n < 0) return -1;

    let minCoins = Infinity;

    for (const coin of coins) {
      const res = dp(n - coin);
      if (res >= 0) {
        minCoins = Math.min(minCoins, res + 1);
      }
    }

    memo[n] = minCoins === Infinity ? -1 : minCoins;
    return memo[n];
  }

  return dp(amount);
}

// 测试
function test() {
  const testCases = [
    { coins: [1, 2, 5], amount: 11, expected: 3 },
    { coins: [2], amount: 3, expected: -1 },
    { coins: [1], amount: 0, expected: 0 },
    { coins: [1, 3, 4, 5], amount: 7, expected: 2 },
    { coins: [2, 5, 10, 1], amount: 27, expected: 4 },
    { coins: [186, 419, 83, 408], amount: 6249, expected: 20 },
  ];

  for (const { coins, amount, expected } of testCases) {
    const result = coinChange(coins, amount);
    console.log(`硬币: [${coins}], 金额: ${amount}`);
    console.log(
      `结果: ${result}, 期望: ${expected}, 正确: ${result === expected}`
    );
    console.log('---');
  }

  console.log('\n性能测试（大数据）：');
  const largeAmount = 10000;
  const largeCoins = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

  console.time('动态规划');
  coinChange(largeCoins, largeAmount);
  console.timeEnd('动态规划');

  console.time('记忆化递归');
  coinChangeMemo(largeCoins, largeAmount);
  console.timeEnd('记忆化递归');
}

test();
