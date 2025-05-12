/**
 * 编辑距离（Levenshtein Distance）算法
 *
 * 给定两个字符串 word1 和 word2，计算将 word1 转换为 word2 所使用的最少操作数。
 * 你可以对一个字符串进行三种操作：
 * 1. 插入一个字符
 * 2. 删除一个字符
 * 3. 替换一个字符
 *
 * 时间复杂度：O(m*n)，其中m和n是两个字符串的长度
 * 空间复杂度：O(m*n)
 *
 * @param {string} word1 第一个字符串
 * @param {string} word2 第二个字符串
 * @returns {number} 最小编辑距离
 */
function minDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;

  // 创建二维DP数组
  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  // 初始化边界条件
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i; // 将word1[0...i]转换为空串需要删除i个字符
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j; // 将空串转换为word2[0...j]需要插入j个字符
  }

  // 填充DP表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        // 如果当前字符相同，不需要操作
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // 取三种操作（插入、删除、替换）的最小值
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // 删除
          dp[i][j - 1] + 1, // 插入
          dp[i - 1][j - 1] + 1, // 替换
        );
      }
    }
  }

  // 返回最终结果
  return dp[m][n];
}

// 优化空间复杂度为O(n)的解法
function minDistanceOptimized(word1, word2) {
  const m = word1.length;
  const n = word2.length;

  // 确保word1是较短的字符串，减少空间消耗
  if (m > n) {
    return minDistanceOptimized(word2, word1);
  }

  // 只需要一维DP数组
  let prev = Array(n + 1).fill(0);
  let curr = Array(n + 1).fill(0);

  // 初始化第一行
  for (let j = 0; j <= n; j++) {
    prev[j] = j;
  }

  // 填充DP表
  for (let i = 1; i <= m; i++) {
    curr[0] = i;

    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = Math.min(
          prev[j] + 1, // 删除
          curr[j - 1] + 1, // 插入
          prev[j - 1] + 1, // 替换
        );
      }
    }

    // 交换prev和curr，重用数组
    [prev, curr] = [curr, prev];
  }

  // 由于最后交换了一次，所以结果在prev中
  return prev[n];
}

// 测试
console.log(minDistance("horse", "ros")); // 3
console.log(minDistance("intention", "execution")); // 5
console.log(minDistanceOptimized("horse", "ros")); // 3
console.log(minDistanceOptimized("intention", "execution")); // 5

module.exports = { minDistance, minDistanceOptimized };
