/**
 * 50. Pow(x, n)
 * 
 * 实现 pow(x, n) ，即计算 x 的 n 次幂函数（即，x^n）。
 * 
 * 示例 1：
 * 输入：x = 2.00000, n = 10
 * 输出：1024.00000
 * 
 * 示例 2：
 * 输入：x = 2.10000, n = 3
 * 输出：9.26100
 * 
 * 示例 3：
 * 输入：x = 2.00000, n = -2
 * 输出：0.25000
 * 解释：2^-2 = 1/2^2 = 1/4 = 0.25
 */

/**
 * 快速幂算法（递归）
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
    // 处理边界情况
    if (n === 0) return 1;
    if (n === 1) return x;
    if (n === -1) return 1 / x;
    
    // 计算 x^(n/2)
    const half = myPow(x, Math.floor(n / 2));
    
    // 如果 n 是偶数，返回 half * half
    // 如果 n 是奇数，返回 half * half * x
    return n % 2 === 0 ? half * half : half * half * (n > 0 ? x : 1 / x);
};

/**
 * 快速幂算法（迭代）
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPowIterative = function(x, n) {
    // 处理负指数
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    
    let result = 1;
    let current = x;
    
    while (n > 0) {
        // 如果 n 的二进制表示中当前位是 1，将 current 乘入结果
        if (n & 1) {
            result *= current;
        }
        
        // 将 current 平方
        current *= current;
        
        // 将 n 右移一位
        n >>>= 1;
    }
    
    return result;
}; 