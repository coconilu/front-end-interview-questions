/**
 * 最大子数组和
 * 题目：给定一个整数数组 nums，找到一个具有最大和的连续子数组（至少包含一个元素），返回其最大和。
 *
 * 示例 1:
 * 输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
 * 输出：6
 * 解释：连续子数组 [4,-1,2,1] 的和最大，为 6。
 *
 * 示例 2:
 * 输入：nums = [1]
 * 输出：1
 *
 * 示例 3:
 * 输入：nums = [5,4,-1,7,8]
 * 输出：23
 * 解释：连续子数组 [5,4,-1,7,8] 的和最大，为 23。
 */

/**
 * 动态规划解法
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  if (!nums || nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  // dp[i] 表示以 nums[i] 结尾的最大子数组和
  const dp = new Array(nums.length);
  dp[0] = nums[0];
  let maxSum = dp[0];

  for (let i = 1; i < nums.length; i++) {
    // 当前元素是独立的一段，还是与前面的最大子数组和连接
    dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
    maxSum = Math.max(maxSum, dp[i]);
  }

  return maxSum;
}

/**
 * 优化空间复杂度的解法（Kadane算法）
 * 时间复杂度：O(n)
 * 空间复杂度：O(1)
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArrayOptimized(nums) {
  if (!nums || nums.length === 0) return 0;

  let currentMax = nums[0];
  let globalMax = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    globalMax = Math.max(globalMax, currentMax);
  }

  return globalMax;
}

/**
 * 带索引的解法，返回最大子数组的起始和结束位置
 * @param {number[]} nums
 * @return {Object}
 */
function maxSubArrayWithIndices(nums) {
  if (!nums || nums.length === 0) return { maxSum: 0, start: -1, end: -1 };

  let currentMax = nums[0];
  let globalMax = nums[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > currentMax + nums[i]) {
      currentMax = nums[i];
      tempStart = i;
    } else {
      currentMax = currentMax + nums[i];
    }

    if (currentMax > globalMax) {
      globalMax = currentMax;
      start = tempStart;
      end = i;
    }
  }

  return { maxSum: globalMax, start, end };
}

/**
 * 分治法解决最大子数组和
 * 时间复杂度：O(n log n)
 * 空间复杂度：O(log n) 递归调用的栈空间
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArrayDivideConquer(nums) {
  if (!nums || nums.length === 0) return 0;

  function findMaxSubArray(nums, left, right) {
    if (left === right) return nums[left];

    const mid = Math.floor((left + right) / 2);

    // 最大子数组可能的情况：
    // 1. 仅在左半边
    const leftMax = findMaxSubArray(nums, left, mid);
    // 2. 仅在右半边
    const rightMax = findMaxSubArray(nums, mid + 1, right);
    // 3. 跨越中点的情况

    // 计算包含中点向左的最大和
    let leftCrossingSum = 0;
    let leftCrossingMax = Number.NEGATIVE_INFINITY;
    for (let i = mid; i >= left; i--) {
      leftCrossingSum += nums[i];
      leftCrossingMax = Math.max(leftCrossingMax, leftCrossingSum);
    }

    // 计算包含中点+1向右的最大和
    let rightCrossingSum = 0;
    let rightCrossingMax = Number.NEGATIVE_INFINITY;
    for (let i = mid + 1; i <= right; i++) {
      rightCrossingSum += nums[i];
      rightCrossingMax = Math.max(rightCrossingMax, rightCrossingSum);
    }

    // 跨越中点的最大子数组和
    const crossingMax = leftCrossingMax + rightCrossingMax;

    // 返回三种情况中的最大值
    return Math.max(leftMax, rightMax, crossingMax);
  }

  return findMaxSubArray(nums, 0, nums.length - 1);
}

// 测试
function test() {
  const testCases = [
    {
      nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      expected: 6,
      expectedSubArray: [4, -1, 2, 1],
    },
    { nums: [1], expected: 1, expectedSubArray: [1] },
    {
      nums: [5, 4, -1, 7, 8],
      expected: 23,
      expectedSubArray: [5, 4, -1, 7, 8],
    },
    { nums: [-1], expected: -1, expectedSubArray: [-1] },
    { nums: [-2, -1], expected: -1, expectedSubArray: [-1] },
    { nums: [-2, -3, -1, -5], expected: -1, expectedSubArray: [-1] },
  ];

  for (const { nums, expected } of testCases) {
    const maxSum1 = maxSubArray(nums);
    const maxSum2 = maxSubArrayOptimized(nums);
    const maxSum3 = maxSubArrayDivideConquer(nums);
    const { maxSum, start, end } = maxSubArrayWithIndices(nums);
    const subArray = nums.slice(start, end + 1);

    console.log(`输入数组: [${nums}]`);
    console.log(
      `DP解法结果: ${maxSum1}, 期望: ${expected}, 正确: ${maxSum1 === expected}`,
    );
    console.log(
      `Kadane算法结果: ${maxSum2}, 期望: ${expected}, 正确: ${maxSum2 === expected}`,
    );
    console.log(
      `分治法结果: ${maxSum3}, 期望: ${expected}, 正确: ${maxSum3 === expected}`,
    );
    console.log(`最大和子数组: [${subArray}], 索引: [${start},${end}]`);
    console.log("---");
  }

  // 性能测试
  console.log("\n性能测试（大规模数组）:");
  const largeArray = [];
  for (let i = 0; i < 10000; i++) {
    largeArray.push(Math.floor(Math.random() * 201) - 100); // -100 到 100 的随机数
  }

  console.time("DP解法");
  maxSubArray(largeArray);
  console.timeEnd("DP解法");

  console.time("Kadane算法");
  maxSubArrayOptimized(largeArray);
  console.timeEnd("Kadane算法");

  console.time("分治法");
  maxSubArrayDivideConquer(largeArray);
  console.timeEnd("分治法");
}

test();
