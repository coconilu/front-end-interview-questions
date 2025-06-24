/**
 * 69. x 的平方根
 *
 * 实现 int sqrt(int x) 函数。
 * 计算并返回 x 的平方根，其中 x 是非负整数。
 * 由于返回类型是整数，结果只保留整数的部分，小数部分将被舍去。
 *
 * 示例 1:
 * 输入: 4
 * 输出: 2
 *
 * 示例 2:
 * 输入: 8
 * 输出: 2
 * 说明: 8 的平方根是 2.82842...,
 *      由于返回类型是整数，小数部分将被舍去。
 */

/**
 * 二分查找解法
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x === 0) return 0;
  if (x === 1) return 1;

  let left = 1;
  let right = Math.floor(x / 2);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const square = mid * mid;

    if (square === x) {
      return mid;
    } else if (square < x) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 当循环结束时，right 是小于等于 sqrt(x) 的最大整数
  return right;
};

/**
 * 牛顿迭代法
 * @param {number} x
 * @return {number}
 */
var mySqrtNewton = function (x) {
  if (x === 0) return 0;

  // 初始猜测值
  let r = x;

  // 牛顿迭代
  while (r * r > x) {
    r = Math.floor((r + x / r) / 2);
  }

  return r;
};
