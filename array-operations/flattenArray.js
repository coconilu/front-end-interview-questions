/**
 * 数组扁平化 - 将多维数组转换成一维数组
 * 
 * 实现一个flatten函数，将多维数组转换为一维数组
 * 
 * 示例:
 * 输入: [1, [2, [3, 4], 5], 6]
 * 输出: [1, 2, 3, 4, 5, 6]
 */

// 方法1: 使用递归实现
function flattenRecursive(arr) {
  let result = [];
  
  arr.forEach(item => {
    if (Array.isArray(item)) {
      result = result.concat(flattenRecursive(item));
    } else {
      result.push(item);
    }
  });
  
  return result;
}

// 方法2: 使用reduce实现
function flattenReduce(arr) {
  return arr.reduce((acc, val) => {
    return acc.concat(Array.isArray(val) ? flattenReduce(val) : val);
  }, []);
}

// 方法3: 使用栈实现(非递归)
function flattenStack(arr) {
  const stack = [...arr];
  const result = [];
  
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) {
      stack.push(...next);
    } else {
      result.unshift(next);
    }
  }
  
  return result;
}

// 方法4: 使用ES6的flat方法
function flattenES6(arr) {
  return arr.flat(Infinity);
}

// 测试
const nestedArray = [1, [2, [3, 4], 5], 6];
console.log(flattenRecursive(nestedArray)); // [1, 2, 3, 4, 5, 6]
console.log(flattenReduce(nestedArray));    // [1, 2, 3, 4, 5, 6]
console.log(flattenStack(nestedArray));     // [1, 2, 3, 4, 5, 6]
console.log(flattenES6(nestedArray));       // [1, 2, 3, 4, 5, 6] 