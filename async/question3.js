/**
 * 问题3: 手写Promise实现
 *
 * 请实现一个简化版的Promise，需要支持以下功能:
 * 1. new MyPromise((resolve, reject) => {})
 * 2. MyPromise.prototype.then
 * 3. MyPromise.prototype.catch
 * 4. 支持链式调用
 *
 * 不需要实现所有Promise/A+规范，但需要实现核心功能
 */

/**
 * MyPromise类
 * @param {Function} executor 执行器函数
 */
class MyPromise {
  constructor(executor) {
    // 在此实现你的代码
  }

  /**
   * then方法
   * @param {Function} onFulfilled 成功回调
   * @param {Function} onRejected 失败回调
   * @returns {MyPromise}
   */
  then(onFulfilled, onRejected) {
    // 在此实现你的代码
  }

  /**
   * catch方法
   * @param {Function} onRejected 失败回调
   * @returns {MyPromise}
   */
  catch(onRejected) {
    // 在此实现你的代码
  }
}

// 测试用例
function testMyPromise() {
  const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('成功');
    }, 1000);
  });

  promise1
    .then((value) => {
      console.log('Promise1 成功:', value);
      return '链式调用';
    })
    .then((value) => {
      console.log('Promise1 链式调用:', value);
    });

  const promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
      reject('失败');
    }, 1000);
  });

  promise2
    .then((value) => {
      console.log('Promise2 成功:', value);
    })
    .catch((reason) => {
      console.log('Promise2 失败:', reason);
      return '失败后继续';
    })
    .then((value) => {
      console.log('Promise2 失败后继续:', value);
    });
}

// testMyPromise();

/**
 * 参考答案:
 *
 * class MyPromise {
 *   static PENDING = 'pending';
 *   static FULFILLED = 'fulfilled';
 *   static REJECTED = 'rejected';
 *
 *   constructor(executor) {
 *     this.status = MyPromise.PENDING;
 *     this.value = undefined;
 *     this.reason = undefined;
 *     this.onFulfilledCallbacks = [];
 *     this.onRejectedCallbacks = [];
 *
 *     const resolve = (value) => {
 *       if (this.status === MyPromise.PENDING) {
 *         this.status = MyPromise.FULFILLED;
 *         this.value = value;
 *         this.onFulfilledCallbacks.forEach(callback => callback(this.value));
 *       }
 *     };
 *
 *     const reject = (reason) => {
 *       if (this.status === MyPromise.PENDING) {
 *         this.status = MyPromise.REJECTED;
 *         this.reason = reason;
 *         this.onRejectedCallbacks.forEach(callback => callback(this.reason));
 *       }
 *     };
 *
 *     try {
 *       executor(resolve, reject);
 *     } catch (error) {
 *       reject(error);
 *     }
 *   }
 *
 *   then(onFulfilled, onRejected) {
 *     // 处理参数可选的情况
 *     onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
 *     onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
 *
 *     // 实现链式调用
 *     const promise2 = new MyPromise((resolve, reject) => {
 *       if (this.status === MyPromise.FULFILLED) {
 *         // 使用setTimeout模拟异步
 *         setTimeout(() => {
 *           try {
 *             const x = onFulfilled(this.value);
 *             resolve(x);
 *           } catch (error) {
 *             reject(error);
 *           }
 *         }, 0);
 *       }
 *
 *       if (this.status === MyPromise.REJECTED) {
 *         setTimeout(() => {
 *           try {
 *             const x = onRejected(this.reason);
 *             resolve(x);
 *           } catch (error) {
 *             reject(error);
 *           }
 *         }, 0);
 *       }
 *
 *       if (this.status === MyPromise.PENDING) {
 *         this.onFulfilledCallbacks.push((value) => {
 *           setTimeout(() => {
 *             try {
 *               const x = onFulfilled(value);
 *               resolve(x);
 *             } catch (error) {
 *               reject(error);
 *             }
 *           }, 0);
 *         });
 *
 *         this.onRejectedCallbacks.push((reason) => {
 *           setTimeout(() => {
 *             try {
 *               const x = onRejected(reason);
 *               resolve(x);
 *             } catch (error) {
 *               reject(error);
 *             }
 *           }, 0);
 *         });
 *       }
 *     });
 *
 *     return promise2;
 *   }
 *
 *   catch(onRejected) {
 *     return this.then(null, onRejected);
 *   }
 * }
 */
