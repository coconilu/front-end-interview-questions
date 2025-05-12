/**
 * 二分查找算法
 * 时间复杂度：O(logn)
 * 空间复杂度：O(1)
 * 注意：数组必须是已排序的
 *
 * @param {Array} arr 已排序数组
 * @param {*} target 要查找的目标值
 * @returns {number} 目标值的索引，如果不存在则返回-1
 */
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // 未找到目标值
}

// 递归实现
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;

  const mid = Math.floor((left + right) / 2);

  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] < target) {
    return binarySearchRecursive(arr, target, mid + 1, right);
  } else {
    return binarySearchRecursive(arr, target, left, mid - 1);
  }
}

// 测试
const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(binarySearch(sortedArray, 7)); // 6
console.log(binarySearch(sortedArray, 11)); // -1
console.log(binarySearchRecursive(sortedArray, 3)); // 2

module.exports = { binarySearch, binarySearchRecursive };
