/**
 * 数组扁平化
 * 实现一个 flatten 函数，将多维数组拍平成一维数组。
 * @param {Array} arr 
 * @returns {Array}
 */
function flatten(arr) {
    return arr.reduce((acc, cur) => {
        return acc.concat(Array.isArray(cur) ? flatten(cur) : cur)
    }, [])
} 