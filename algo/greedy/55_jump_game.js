/**
 * 55. 跳跃游戏
 *
 * 给定一个非负整数数组 nums ，你最初位于数组的 第一个下标 。
 * 数组中的每个元素代表你在该位置可以跳跃的最大长度。
 * 判断你是否能够到达最后一个下标。
 *
 * 示例 1：
 * 输入：nums = [2,3,1,1,4]
 * 输出：true
 * 解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。
 *
 * 示例 2：
 * 输入：nums = [3,2,1,0,4]
 * 输出：false
 * 解释：无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0 ， 所以永远不可能到达最后一个下标。
 */

/**
 * 贪心算法
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function (nums) {
  let maxReach = 0; // 当前能够到达的最远位置

  for (let i = 0; i < nums.length; i++) {
    // 如果当前位置已经无法到达，返回false
    if (i > maxReach) {
      return false;
    }

    // 更新最远可到达位置
    maxReach = Math.max(maxReach, i + nums[i]);

    // 如果已经可以到达最后一个位置，返回true
    if (maxReach >= nums.length - 1) {
      return true;
    }
  }

  return true;
};

/**
 * 从后往前遍历
 * @param {number[]} nums
 * @return {boolean}
 */
var canJumpBackward = function (nums) {
  let lastPos = nums.length - 1;

  // 从倒数第二个位置开始向前遍历
  for (let i = nums.length - 2; i >= 0; i--) {
    // 如果当前位置可以跳到最后一个可达位置
    if (i + nums[i] >= lastPos) {
      lastPos = i; // 更新最后一个可达位置
    }
  }

  // 如果最后一个可达位置是起点，则可以到达终点
  return lastPos === 0;
};
