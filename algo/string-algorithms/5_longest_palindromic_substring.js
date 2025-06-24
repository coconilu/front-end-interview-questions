/**
 * 5. 最长回文子串
 *
 * 给定一个字符串 s，找到 s 中最长的回文子串。你可以假设 s 的最大长度为 1000。
 *
 * 示例 1：
 * 输入: "babad"
 * 输出: "bab"
 * 注意: "aba" 也是一个有效答案。
 *
 * 示例 2：
 * 输入: "cbbd"
 * 输出: "bb"
 */

/**
 * 中心扩展法
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  if (s.length < 2) return s;

  let start = 0;
  let maxLength = 1;

  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLength = right - left + 1;
      if (currentLength > maxLength) {
        maxLength = currentLength;
        start = left;
      }
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    // 奇数长度回文
    expandAroundCenter(i, i);
    // 偶数长度回文
    expandAroundCenter(i, i + 1);
  }

  return s.substring(start, start + maxLength);
};

/**
 * 动态规划解法
 * @param {string} s
 * @return {string}
 */
var longestPalindromeDP = function (s) {
  const n = s.length;
  if (n < 2) return s;

  let start = 0;
  let maxLength = 1;

  // dp[i][j] 表示 s[i..j] 是否为回文串
  const dp = Array(n)
    .fill()
    .map(() => Array(n).fill(false));

  // 所有单个字符都是回文
  for (let i = 0; i < n; i++) {
    dp[i][i] = true;
  }

  // 检查长度为2的子串
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === s[i + 1]) {
      dp[i][i + 1] = true;
      start = i;
      maxLength = 2;
    }
  }

  // 检查长度大于2的子串
  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1; // 子串的结束位置

      // 如果首尾字符相同且中间部分是回文
      if (s[i] === s[j] && dp[i + 1][j - 1]) {
        dp[i][j] = true;
        start = i;
        maxLength = len;
      }
    }
  }

  return s.substring(start, start + maxLength);
};
