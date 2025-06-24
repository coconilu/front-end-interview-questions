/**
 * 最长公共子序列
 * 题目：给定两个字符串 text1 和 text2，返回这两个字符串的最长公共子序列的长度。
 * 一个字符串的子序列是指从原字符串中删除一些字符（也可以不删除）而不改变剩余字符相对位置形成的新字符串。
 * 例如，"ace" 是 "abcde" 的子序列，而 "aec" 不是。
 *
 * 示例 1:
 * 输入：text1 = "abcde", text2 = "ace"
 * 输出：3
 * 解释：最长公共子序列是 "ace"，它的长度为 3。
 *
 * 示例 2:
 * 输入：text1 = "abc", text2 = "abc"
 * 输出：3
 * 解释：最长公共子序列是 "abc"，它的长度为 3。
 *
 * 示例 3:
 * 输入：text1 = "abc", text2 = "def"
 * 输出：0
 * 解释：两个字符串没有公共子序列，返回 0。
 */

/**
 * 动态规划解法
 * 时间复杂度：O(m * n)
 * 空间复杂度：O(m * n)
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;

  // dp[i][j] 表示 text1[0...i-1] 和 text2[0...j-1] 的最长公共子序列长度
  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        // 如果当前字符相同，则最长公共子序列长度加1
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        // 否则取删除text1当前字符或text2当前字符两种情况的较大值
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * 空间优化解法
 * 时间复杂度：O(m * n)
 * 空间复杂度：O(n)
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequenceOptimized(text1, text2) {
  // 确保 text2 是较短的字符串以优化空间
  if (text1.length < text2.length) {
    [text1, text2] = [text2, text1];
  }

  const m = text1.length;
  const n = text2.length;

  // 只使用两行dp数组
  let dp = Array(n + 1).fill(0);
  let prevDp = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[j] = prevDp[j - 1] + 1;
      } else {
        dp[j] = Math.max(dp[j - 1], prevDp[j]);
      }
    }
    // 保存当前行，下一轮迭代中将作为上一行使用
    [dp, prevDp] = [prevDp, [...dp]];
  }

  return prevDp[n];
}

/**
 * 获取最长公共子序列的内容
 * @param {string} text1
 * @param {string} text2
 * @return {string}
 */
function getLCS(text1, text2) {
  const m = text1.length;
  const n = text2.length;

  // dp[i][j] 表示 text1[0...i-1] 和 text2[0...j-1] 的最长公共子序列长度
  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯找出LCS内容
  let lcs = '';
  let i = m,
    j = n;

  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      lcs = text1[i - 1] + lcs;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

// 测试
function test() {
  const testCases = [
    { text1: 'abcde', text2: 'ace', expected: 3, expectedLCS: 'ace' },
    { text1: 'abc', text2: 'abc', expected: 3, expectedLCS: 'abc' },
    { text1: 'abc', text2: 'def', expected: 0, expectedLCS: '' },
    { text1: 'ABCBDAB', text2: 'BDCABA', expected: 4, expectedLCS: 'BCBA' },
    { text1: 'AGGTAB', text2: 'GXTXAYB', expected: 4, expectedLCS: 'GTAB' },
  ];

  for (const { text1, text2, expected, expectedLCS } of testCases) {
    const length = longestCommonSubsequence(text1, text2);
    const optimizedLength = longestCommonSubsequenceOptimized(text1, text2);
    const lcs = getLCS(text1, text2);

    console.log(`字符串1: "${text1}"`);
    console.log(`字符串2: "${text2}"`);
    console.log(
      `LCS长度: ${length}, 期望: ${expected}, 正确: ${length === expected}`
    );
    console.log(
      `优化空间后LCS长度: ${optimizedLength}, 期望: ${expected}, 正确: ${optimizedLength === expected}`
    );
    console.log(
      `LCS内容: "${lcs}", 期望: "${expectedLCS}", 正确: ${lcs === expectedLCS}`
    );
    console.log('---');
  }

  // 性能测试
  console.log('\n性能测试（较长字符串）:');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function generateRandomString(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const longText1 = generateRandomString(1000);
  const longText2 = generateRandomString(1000);

  console.time('标准DP');
  longestCommonSubsequence(longText1, longText2);
  console.timeEnd('标准DP');

  console.time('空间优化DP');
  longestCommonSubsequenceOptimized(longText1, longText2);
  console.timeEnd('空间优化DP');
}

test();
