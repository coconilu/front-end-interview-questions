/**
 * 78. 子集
 * 
 * 给你一个整数数组 nums ，数组中的元素 互不相同 。返回该数组所有可能的子集（幂集）。
 * 解集 不能 包含重复的子集。你可以按 任意顺序 返回解集。
 * 
 * 示例 1：
 * 输入：nums = [1,2,3]
 * 输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
 * 
 * 示例 2：
 * 输入：nums = [0]
 * 输出：[[],[0]]
 */

/**
 * 回溯算法
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function(nums) {
    const result = [];
    
    function backtrack(start, path) {
        // 每个路径都是一个子集，所以每次都添加到结果中
        result.push([...path]);
        
        for (let i = start; i < nums.length; i++) {
            // 选择当前元素
            path.push(nums[i]);
            
            // 继续递归，从下一个位置开始
            backtrack(i + 1, path);
            
            // 回溯，撤销选择
            path.pop();
        }
    }
    
    backtrack(0, []);
    return result;
};

/**
 * 迭代法（二进制位掩码）
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsIterative = function(nums) {
    const n = nums.length;
    const result = [];
    
    // 总共有 2^n 个子集
    const total = 1 << n;
    
    for (let i = 0; i < total; i++) {
        const subset = [];
        
        // 检查每一位是否为1
        for (let j = 0; j < n; j++) {
            if ((i & (1 << j)) !== 0) {
                subset.push(nums[j]);
            }
        }
        
        result.push(subset);
    }
    
    return result;
}; 