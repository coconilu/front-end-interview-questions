/**
 * 快速排序算法
 * 时间复杂度：平均 O(nlogn)，最坏 O(n²)
 * 空间复杂度：O(logn)
 * @param {Array} arr 待排序数组
 * @returns {Array} 排序后的数组
 */
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const middle = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else if (arr[i] > pivot) {
      right.push(arr[i]);
    } else {
      middle.push(arr[i]);
    }
  }

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 测试
const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5];
console.log(quickSort(arr)); // [1, 1, 2, 3, 4, 5, 5, 6, 9]

module.exports = quickSort;
