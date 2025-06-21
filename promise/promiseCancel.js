/**
 * Promise 取消机制
 * 实现取消一个已经开始的Promise的多种方法
 * 
 * Promise本身是不可取消的，但我们可以通过以下几种方式实现取消效果：
 * 1. AbortController (推荐)
 * 2. Promise包装器
 * 3. 竞态Promise
 * 4. 取消令牌模式
 */

// 方法1: 使用 AbortController (现代浏览器推荐方式)
class CancellablePromise {
  constructor(executor) {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
    
    this.promise = new Promise((resolve, reject) => {
      // 如果已经取消，直接拒绝
      if (this.signal.aborted) {
        reject(new Error('Promise was cancelled'));
        return;
      }
      
      // 监听取消信号
      this.signal.addEventListener('abort', () => {
        reject(new Error('Promise was cancelled'));
      });
      
      // 执行原始Promise逻辑
      executor(
        (value) => {
          if (!this.signal.aborted) {
            resolve(value);
          }
        },
        (reason) => {
          if (!this.signal.aborted) {
            reject(reason);
          }
        }
      );
    });
  }
  
  // 取消Promise
  cancel() {
    this.controller.abort();
  }
  
  // 返回Promise
  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }
  
  catch(onRejected) {
    return this.promise.catch(onRejected);
  }
  
  finally(onFinally) {
    return this.promise.finally(onFinally);
  }
}

// 方法2: Promise包装器模式
function createCancellablePromise(promiseFactory) {
  let isCancelled = false;
  let cancelReject;
  
  const cancellablePromise = new Promise((resolve, reject) => {
    cancelReject = reject;
    
    // 创建原始Promise
    const originalPromise = promiseFactory();
    
    originalPromise
      .then((value) => {
        if (!isCancelled) {
          resolve(value);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          reject(error);
        }
      });
  });
  
  // 添加取消方法
  cancellablePromise.cancel = () => {
    if (!isCancelled) {
      isCancelled = true;
      cancelReject(new Error('Promise was cancelled'));
    }
  };
  
  return cancellablePromise;
}

// 方法3: 竞态Promise (Promise.race)
function createRaceBasedCancellable(promiseFactory) {
  let cancelReject;
  
  const cancelPromise = new Promise((_, reject) => {
    cancelReject = reject;
  });
  
  const originalPromise = promiseFactory();
  
  const racePromise = Promise.race([originalPromise, cancelPromise]);
  
  racePromise.cancel = () => {
    cancelReject(new Error('Promise was cancelled'));
  };
  
  return racePromise;
}

// 方法4: 取消令牌模式
class CancelToken {
  constructor() {
    this.isCancelled = false;
    this.reason = null;
    this.listeners = [];
  }
  
  // 取消操作
  cancel(reason = 'Operation was cancelled') {
    if (this.isCancelled) return;
    
    this.isCancelled = true;
    this.reason = reason;
    
    // 通知所有监听器
    this.listeners.forEach(listener => listener(reason));
    this.listeners = [];
  }
  
  // 添加取消监听器
  onCancel(listener) {
    if (this.isCancelled) {
      listener(this.reason);
    } else {
      this.listeners.push(listener);
    }
  }
  
  // 检查是否已取消
  throwIfCancelled() {
    if (this.isCancelled) {
      throw new Error(this.reason);
    }
  }
  
  // 创建取消令牌源
  static source() {
    const token = new CancelToken();
    return {
      token,
      cancel: (reason) => token.cancel(reason)
    };
  }
}

// 支持取消令牌的Promise包装器
function createTokenBasedPromise(executor, cancelToken) {
  return new Promise((resolve, reject) => {
    // 检查初始状态
    if (cancelToken && cancelToken.isCancelled) {
      reject(new Error(cancelToken.reason));
      return;
    }
    
    // 监听取消事件
    if (cancelToken) {
      cancelToken.onCancel((reason) => {
        reject(new Error(reason));
      });
    }
    
    // 执行原始逻辑
    executor(
      (value) => {
        if (!cancelToken || !cancelToken.isCancelled) {
          resolve(value);
        }
      },
      (error) => {
        if (!cancelToken || !cancelToken.isCancelled) {
          reject(error);
        }
      }
    );
  });
}

// 方法5: 超时取消
function createTimeoutCancellable(promiseFactory, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeout}ms`));
    }, timeout);
  });
  
  return Promise.race([promiseFactory(), timeoutPromise]);
}

// 方法6: 可取消的fetch请求
function cancellableFetch(url, options = {}) {
  const controller = new AbortController();
  
  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  fetchPromise.cancel = () => {
    controller.abort();
  };
  
  return fetchPromise;
}

// 使用示例和测试

// 示例1: 使用CancellablePromise类
function example1() {
  console.log('=== 示例1: CancellablePromise类 ===');
  
  const cancellablePromise = new CancellablePromise((resolve, reject) => {
    setTimeout(() => {
      resolve('任务完成');
    }, 3000);
  });
  
  cancellablePromise
    .then(result => console.log('结果:', result))
    .catch(error => console.log('错误:', error.message));
  
  // 1秒后取消
  setTimeout(() => {
    console.log('取消Promise...');
    cancellablePromise.cancel();
  }, 1000);
}

// 示例2: 使用Promise包装器
function example2() {
  console.log('\n=== 示例2: Promise包装器 ===');
  
  const cancellablePromise = createCancellablePromise(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('包装器任务完成');
      }, 3000);
    });
  });
  
  cancellablePromise
    .then(result => console.log('结果:', result))
    .catch(error => console.log('错误:', error.message));
  
  // 1.5秒后取消
  setTimeout(() => {
    console.log('取消包装器Promise...');
    cancellablePromise.cancel();
  }, 1500);
}

// 示例3: 使用取消令牌
function example3() {
  console.log('\n=== 示例3: 取消令牌模式 ===');
  
  const { token, cancel } = CancelToken.source();
  
  const promise = createTokenBasedPromise((resolve, reject) => {
    let count = 0;
    const interval = setInterval(() => {
      try {
        token.throwIfCancelled();
        count++;
        console.log(`进度: ${count}/5`);
        
        if (count >= 5) {
          clearInterval(interval);
          resolve('令牌任务完成');
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 500);
  }, token);
  
  promise
    .then(result => console.log('结果:', result))
    .catch(error => console.log('错误:', error.message));
  
  // 2秒后取消
  setTimeout(() => {
    console.log('取消令牌任务...');
    cancel('用户主动取消');
  }, 2000);
}

// 示例4: 可取消的网络请求
function example4() {
  console.log('\n=== 示例4: 可取消的fetch请求 ===');
  
  const request = cancellableFetch('https://jsonplaceholder.typicode.com/posts/1');
  
  request
    .then(response => response.json())
    .then(data => console.log('请求结果:', data.title))
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
      } else {
        console.log('请求错误:', error.message);
      }
    });
  
  // 100ms后取消请求（模拟快速取消）
  setTimeout(() => {
    console.log('取消网络请求...');
    request.cancel();
  }, 100);
}

// 示例5: 超时取消
function example5() {
  console.log('\n=== 示例5: 超时取消 ===');
  
  const slowPromise = createTimeoutCancellable(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('慢任务完成');
      }, 5000); // 5秒任务
    });
  }, 2000); // 2秒超时
  
  slowPromise
    .then(result => console.log('结果:', result))
    .catch(error => console.log('错误:', error.message));
}

// 高级应用：可取消的异步队列
class CancellableQueue {
  constructor() {
    this.queue = [];
    this.running = false;
    this.currentTask = null;
  }
  
  // 添加任务
  add(taskFactory) {
    const cancellableTask = new CancellablePromise(taskFactory);
    this.queue.push(cancellableTask);
    
    if (!this.running) {
      this.process();
    }
    
    return cancellableTask;
  }
  
  // 处理队列
  async process() {
    this.running = true;
    
    while (this.queue.length > 0) {
      this.currentTask = this.queue.shift();
      
      try {
        await this.currentTask;
      } catch (error) {
        console.log('任务失败或被取消:', error.message);
      }
    }
    
    this.running = false;
    this.currentTask = null;
  }
  
  // 取消当前任务
  cancelCurrent() {
    if (this.currentTask) {
      this.currentTask.cancel();
    }
  }
  
  // 取消所有任务
  cancelAll() {
    // 取消当前任务
    this.cancelCurrent();
    
    // 取消队列中的所有任务
    this.queue.forEach(task => task.cancel());
    this.queue = [];
  }
}

// 测试可取消队列
function testCancellableQueue() {
  console.log('\n=== 测试可取消队列 ===');
  
  const queue = new CancellableQueue();
  
  // 添加几个任务
  queue.add((resolve) => {
    setTimeout(() => {
      console.log('任务1完成');
      resolve('任务1结果');
    }, 1000);
  });
  
  queue.add((resolve) => {
    setTimeout(() => {
      console.log('任务2完成');
      resolve('任务2结果');
    }, 1000);
  });
  
  queue.add((resolve) => {
    setTimeout(() => {
      console.log('任务3完成');
      resolve('任务3结果');
    }, 1000);
  });
  
  // 2.5秒后取消所有任务
  setTimeout(() => {
    console.log('取消所有队列任务...');
    queue.cancelAll();
  }, 2500);
}

// 导出所有实现
module.exports = {
  CancellablePromise,
  createCancellablePromise,
  createRaceBasedCancellable,
  CancelToken,
  createTokenBasedPromise,
  createTimeoutCancellable,
  cancellableFetch,
  CancellableQueue
};

// 运行示例（取消注释来测试）
// example1();
// setTimeout(() => example2(), 4000);
// setTimeout(() => example3(), 8000);
// setTimeout(() => example4(), 12000);
// setTimeout(() => example5(), 16000);
// setTimeout(() => testCancellableQueue(), 20000);

/**
 * Promise取消机制总结：
 * 
 * 1. AbortController方式（推荐）：
 *    - 现代浏览器原生支持
 *    - 与fetch API完美集成
 *    - 标准化的取消机制
 * 
 * 2. Promise包装器：
 *    - 兼容性好
 *    - 实现简单
 *    - 适用于旧版本浏览器
 * 
 * 3. 竞态Promise：
 *    - 利用Promise.race特性
 *    - 实现简洁
 *    - 适合简单场景
 * 
 * 4. 取消令牌模式：
 *    - 功能强大
 *    - 支持复杂的取消逻辑
 *    - 类似于C#的CancellationToken
 * 
 * 5. 超时取消：
 *    - 防止长时间等待
 *    - 提升用户体验
 *    - 资源保护
 * 
 * 最佳实践：
 * - 优先使用AbortController
 * - 在不支持的环境中使用包装器模式
 * - 复杂场景考虑取消令牌模式
 * - 始终处理取消异常
 * - 清理相关资源（定时器、事件监听器等）
 */