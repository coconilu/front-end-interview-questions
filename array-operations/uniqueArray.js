/**
 * 数组去重
 * 实现一个 unique 函数，返回去重后的新数组。
 * @param {Array} arr
 * @returns {Array}
 */
function unique(arr) {
  return Array.from(new Set(arr));
}
