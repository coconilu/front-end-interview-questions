/**
 * 实现 Promise.all
 * 手动实现Promise.all方法，接收一个Promise数组，返回一个新的Promise。
 * @param {Array<Promise>} promises 
 * @returns {Promise}
 */
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('参数必须是数组'))
        }
        const results = []
        let completed = 0
        const len = promises.length
        
        if (len === 0) return resolve([])
        
        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(result => {
                    results[index] = result
                    completed++
                    if (completed === len) {
                        resolve(results)
                    }
                })
                .catch(reject)
        })
    })
} 