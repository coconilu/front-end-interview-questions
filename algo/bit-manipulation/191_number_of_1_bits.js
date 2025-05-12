/**
 * 191. 位1的个数
 * 
 * 编写一个函数，输入是一个无符号整数（以二进制串的形式），返回其二进制表达式中数字位数为 '1' 的个数（也被称为汉明重量）。
 * 
 * 示例 1：
 * 输入：00000000000000000000000000001011
 * 输出：3
 * 解释：输入的二进制串 00000000000000000000000000001011 中，共有三位为 '1'。
 * 
 * 示例 2：
 * 输入：00000000000000000000000010000000
 * 输出：1
 * 解释：输入的二进制串 00000000000000000000000010000000 中，共有一位为 '1'。
 * 
 * 示例 3：
 * 输入：11111111111111111111111111111101
 * 输出：31
 * 解释：输入的二进制串 11111111111111111111111111111101 中，共有 31 位为 '1'。
 * 
 * 提示：
 * 输入必须是长度为 32 的 二进制串 。
 */

/**
 * 循环检查每一位
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeight = function(n) {
    let count = 0;
    
    // 检查32位
    for (let i = 0; i < 32; i++) {
        if ((n & (1 << i)) !== 0) {
            count++;
        }
    }
    
    return count;
};

/**
 * 位操作优化
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeightOptimized = function(n) {
    let count = 0;
    
    while (n !== 0) {
        // n & (n - 1) 可以消除 n 的二进制表示中最右边的 1
        n &= (n - 1);
        count++;
    }
    
    return count;
};

/**
 * 使用JavaScript内置方法
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeightJS = function(n) {
    // 转换为二进制字符串，并计算 '1' 的个数
    return n.toString(2).split('0').join('').length;
}; 