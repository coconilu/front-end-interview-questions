/**
 * Promise 并发限制
 * 实现一个 promiseLimit 函数，限制同时执行的异步任务数量。
 * @param {Array<Function>} tasks 任务数组，每个任务返回一个Promise
 * @param {number} limit 并发数
 * @returns {Promise<Array>}
 */
function promiseLimit(tasks, limit) {
    const results = []
    let i = 0
    let running = 0
    return new Promise((resolve, reject) => {
        function runNext() {
            if (i === tasks.length && running === 0) return resolve(results)
            while (running < limit && i < tasks.length) {
                const cur = i++
                running++
                tasks[cur]()
                    .then(res => results[cur] = res)
                    .catch(reject)
                    .finally(() => {
                        running--
                        runNext()
                    })
            }
        }
        runNext()
    })
} 