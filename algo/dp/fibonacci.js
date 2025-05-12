/**
 * 斐波那契数列
 * 题目：斐波那契数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。
 * 给定 n，请计算 F(n)。
 *
 * 示例：
 * 输入：n = 5
 * 输出：5
 * 解释：F(5) = F(4) + F(3) = 3 + 2 = 5
 *
 * 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
 */

/**
 * 递归解法（效率低）
 * 时间复杂度：O(2^n)
 * 空间复杂度：O(n)
 * @param {number} n
 * @return {number}
 */
function fibRecursive(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

/**
 * 动态规划-自底向上
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * @param {number} n
 * @return {number}
 */
function fibDP(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
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
function fibOptimized(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const sum = prev + curr;
    prev = curr;
    curr = sum;
  }

  return curr;
}

// 测试
function test() {
  const n = 10;
  console.log(`递归解法：F(${n}) =`, fibRecursive(n));
  console.log(`动态规划解法：F(${n}) =`, fibDP(n));
  console.log(`优化空间复杂度解法：F(${n}) =`, fibOptimized(n));

  console.log("\n性能测试（n = 40）：");

  console.time("优化解法");
  fibOptimized(40);
  console.timeEnd("优化解法");

  console.time("DP解法");
  fibDP(40);
  console.timeEnd("DP解法");

  // 递归解法对于大数会非常慢，不建议测试大于30的数
  // console.time('递归解法');
  // fibRecursive(40);
  // console.timeEnd('递归解法');
}

test();
