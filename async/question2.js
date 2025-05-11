/**
 * 问题2: 并行请求限制
 * 
 * 请实现一个异步控制函数 parallelLimit，要求如下:
 * 1. 可以并行执行异步任务
 * 2. 可以控制同时执行的任务数量
 * 3. 所有任务完成后，返回结果数组
 * 
 * 函数签名: parallelLimit(tasks, limit)
 * @param {Function[]} tasks - 异步任务数组，每个任务都返回Promise
 * @param {number} limit - 同时执行的任务数量上限
 * @return {Promise<any[]>} - 所有任务的结果数组，顺序与tasks参数保持一致
 */

/**
 * 并行限制控制器
 * @param {Function[]} tasks 异步任务数组
 * @param {number} limit 同时执行的任务数量上限
 * @returns {Promise<any[]>}
 */
function parallelLimit(tasks, limit) {
  // 在此实现你的代码
}

// 测试用例
async function test() {
  // 模拟异步任务，返回延迟的Promise
  const createTask = (id, delay) => {
    return () => new Promise((resolve) => {
      console.log(`Task ${id} started`);
      setTimeout(() => {
        console.log(`Task ${id} completed`);
        resolve(id);
      }, delay);
    });
  };

  const tasks = [
    createTask(1, 1000),
    createTask(2, 500),
    createTask(3, 300),
    createTask(4, 400),
    createTask(5, 200)
  ];

  console.log('开始测试，并行数为2');
  const results = await parallelLimit(tasks, 2);
  console.log('所有任务完成，结果:', results);
  // 预期输出: [1, 2, 3, 4, 5]
}

// test();

/**
 * 参考答案:
 * 
 * function parallelLimit(tasks, limit) {
 *   return new Promise((resolve) => {
 *     if (tasks.length === 0) {
 *       resolve([]);
 *       return;
 *     }
 *     
 *     const results = new Array(tasks.length);
 *     let index = 0;  // 下一个待执行的任务索引
 *     let completedCount = 0;  // 已完成的任务数量
 *     
 *     // 启动初始的limit个任务
 *     function runTask() {
 *       const currentIndex = index;
 *       const task = tasks[currentIndex];
 *       
 *       index++;
 *       
 *       Promise.resolve(task())
 *         .then(result => {
 *           // 保存结果，保持与输入任务相同的顺序
 *           results[currentIndex] = result;
 *           completedCount++;
 *           
 *           // 如果所有任务都完成了，返回结果
 *           if (completedCount === tasks.length) {
 *             resolve(results);
 *           } else if (index < tasks.length) {
 *             // 如果还有待执行的任务，继续执行
 *             runTask();
 *           }
 *         });
 *     }
 *     
 *     // 初始启动limit个任务
 *     const initialCount = Math.min(limit, tasks.length);
 *     for (let i = 0; i < initialCount; i++) {
 *       runTask();
 *     }
 *   });
 * }
 */ 