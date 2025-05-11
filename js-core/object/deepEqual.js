/**
 * 深度相等判断
 * 实现一个 deepEqual 函数，判断两个值是否深度相等。
 * @param {*} a 
 * @param {*} b 
 * @returns {boolean}
 */
function deepEqual(a, b) {
    if (a === b) return true
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
    if (Object.keys(a).length !== Object.keys(b).length) return false
    for (const key in a) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
            return false
        }
    }
    return true
} 