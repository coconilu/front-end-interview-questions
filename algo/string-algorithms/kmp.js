/**
 * KMP（Knuth-Morris-Pratt）字符串匹配算法
 * 时间复杂度：O(n+m)，其中n是文本长度，m是模式长度
 * 空间复杂度：O(m)
 */

/**
 * 计算部分匹配表（失效函数）
 * @param {string} pattern 模式串
 * @returns {Array} 部分匹配表
 */
function computeLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let length = 0;
  let i = 1;

  while (i < pattern.length) {
    if (pattern[i] === pattern[length]) {
      length++;
      lps[i] = length;
      i++;
    } else {
      if (length !== 0) {
        length = lps[length - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }

  return lps;
}

/**
 * KMP搜索算法
 * @param {string} text 文本串
 * @param {string} pattern 模式串
 * @returns {Array} 所有匹配的起始位置
 */
function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [];
  if (pattern.length > text.length) return [];

  const matches = [];
  const lps = computeLPS(pattern);

  let i = 0; // 文本串的索引
  let j = 0; // 模式串的索引

  while (i < text.length) {
    if (pattern[j] === text[i]) {
      i++;
      j++;
    }

    if (j === pattern.length) {
      // 找到匹配，记录起始位置
      matches.push(i - j);
      // 继续查找下一个匹配
      j = lps[j - 1];
    } else if (i < text.length && pattern[j] !== text[i]) {
      // 不匹配
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  return matches;
}

// 测试
const text = 'ABABDABACDABABCABAB';
const pattern = 'ABABCABAB';
console.log(kmpSearch(text, pattern)); // [10]

const text2 = 'AABAACAADAABAABA';
const pattern2 = 'AABA';
console.log(kmpSearch(text2, pattern2)); // [0, 9, 12]

module.exports = { kmpSearch, computeLPS };
