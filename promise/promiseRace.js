/**
 * 实现 Promise.race
 * 手动实现Promise.race方法，返回一个 promise，一旦某个promise解决或拒绝，返回的 promise就会解决或拒绝。
 * @param {Array<Promise>} promises 
 * @returns {Promise}
 */
function promiseRace(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('参数必须是数组'))
        }
        
        if (promises.length === 0) {
            return reject(new Error('数组不能为空'))
        }
        
        promises.forEach(promise => {
            Promise.resolve(promise).then(resolve, reject)
        })
    })
} 