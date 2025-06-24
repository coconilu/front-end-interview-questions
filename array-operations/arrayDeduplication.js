/**
 * 数组去重 - 移除数组中的重复元素
 *
 * 实现多种数组去重的方法
 *
 * 示例:
 * 输入: [1, 2, 2, 3, 4, 4, 5]
 * 输出: [1, 2, 3, 4, 5]
 */

// 方法1: 使用Set
function dedupeWithSet(arr) {
  return [...new Set(arr)];
}

// 方法2: 使用filter和indexOf
function dedupeWithFilter(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}

// 方法3: 使用reduce和includes
function dedupeWithReduce(arr) {
  return arr.reduce((acc, curr) => {
    if (!acc.includes(curr)) {
      acc.push(curr);
    }
    return acc;
  }, []);
}

// 方法4: 使用对象的键值对
function dedupeWithObject(arr) {
  const obj = {};
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      obj[arr[i]] = true;
      result.push(arr[i]);
    }
  }

  return result;
}

// 方法5: 使用Map
function dedupeWithMap(arr) {
  const map = new Map();
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      map.set(arr[i], true);
      result.push(arr[i]);
    }
  }

  return result;
}

// 测试
const duplicateArray = [1, 2, 2, 3, 4, 4, 5];
console.log(dedupeWithSet(duplicateArray)); // [1, 2, 3, 4, 5]
console.log(dedupeWithFilter(duplicateArray)); // [1, 2, 3, 4, 5]
console.log(dedupeWithReduce(duplicateArray)); // [1, 2, 3, 4, 5]
console.log(dedupeWithObject(duplicateArray)); // [1, 2, 3, 4, 5]
console.log(dedupeWithMap(duplicateArray)); // [1, 2, 3, 4, 5]

// 注意: 对象方法在处理特殊值如数字和字符串'1'时可能会有问题
const specialArray = [
  1,
  '1',
  true,
  'true',
  {},
  {},
  null,
  null,
  undefined,
  undefined,
  NaN,
  NaN,
];
console.log(dedupeWithSet(specialArray)); // 正确处理所有类型
console.log(dedupeWithObject(specialArray)); // 可能会将数字1和字符串'1'视为相同
