/**
 * once 函数
 * 实现一个 once 函数，使得传入的函数只会被执行一次。
 * @param {Function} fn 
 * @returns {Function}
 */
function once(fn) {
    let called = false
    let result
    return function (...args) {
        if (!called) {
            called = true
            result = fn.apply(this, args)
        }
        return result
    }
} 