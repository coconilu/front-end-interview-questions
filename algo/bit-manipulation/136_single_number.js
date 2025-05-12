/**
 * 136. 只出现一次的数字
 * 
 * 给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。
 * 
 * 说明：
 * 你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？
 * 
 * 示例 1:
 * 输入: [2,2,1]
 * 输出: 1
 * 
 * 示例 2:
 * 输入: [4,1,2,1,2]
 * 输出: 4
 */

/**
 * 位运算解法 - 异或
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    let result = 0;
    
    for (const num of nums) {
        result ^= num;
    }
    
    return result;
};

/**
 * 哈希表解法
 * @param {number[]} nums
 * @return {number}
 */
var singleNumberHash = function(nums) {
    const map = new Map();
    
    // 统计每个数字出现的次数
    for (const num of nums) {
        map.set(num, (map.get(num) || 0) + 1);
    }
    
    // 找出只出现一次的数字
    for (const [num, count] of map.entries()) {
        if (count === 1) {
            return num;
        }
    }
    
    return -1; // 不会执行到这里
}; 