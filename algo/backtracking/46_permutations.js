/**
 * 46. 全排列
 *
 * 给定一个不含重复数字的数组 nums ，返回其所有可能的全排列。你可以按任意顺序返回答案。
 *
 * 示例 1：
 * 输入：nums = [1,2,3]
 * 输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
 *
 * 示例 2：
 * 输入：nums = [0,1]
 * 输出：[[0,1],[1,0]]
 *
 * 示例 3：
 * 输入：nums = [1]
 * 输出：[[1]]
 */

/**
 * 回溯算法
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const result = [];

  // 回溯函数
  function backtrack(path, used) {
    // 当路径长度等于数组长度时，找到了一个排列
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      // 跳过已经使用过的元素
      if (used[i]) continue;

      // 选择当前元素
      path.push(nums[i]);
      used[i] = true;

      // 继续递归
      backtrack(path, used);

      // 回溯，撤销选择
      path.pop();
      used[i] = false;
    }
  }

  backtrack([], new Array(nums.length).fill(false));
  return result;
};

/**
 * 交换元素的方法
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteSwap = function (nums) {
  const result = [];

  function backtrack(start) {
    if (start === nums.length) {
      result.push([...nums]);
      return;
    }

    for (let i = start; i < nums.length; i++) {
      // 交换元素
      [nums[start], nums[i]] = [nums[i], nums[start]];

      // 继续递归
      backtrack(start + 1);

      // 回溯，撤销交换
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }

  backtrack(0);
  return result;
};
