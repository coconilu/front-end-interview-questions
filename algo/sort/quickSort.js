/**
 * 快速排序
 * 时间复杂度：平均 O(n log n)，最坏 O(n²)
 * 空间复杂度：O(log n)
 */

function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];
  const equal = [];

  for (let num of arr) {
    if (num < pivot) {
      left.push(num);
    } else if (num > pivot) {
      right.push(num);
    } else {
      equal.push(num);
    }
  }

  return [...quickSort(left), ...equal, ...quickSort(right)];
}

// 测试用例
function test() {
  const arr1 = [4, 2, 1, 3];
  console.log('测试用例1:', arr1);
  console.log('排序结果:', quickSort(arr1));

  const arr2 = [-1, 5, 3, 4, 0];
  console.log('测试用例2:', arr2);
  console.log('排序结果:', quickSort(arr2));
}

test();
