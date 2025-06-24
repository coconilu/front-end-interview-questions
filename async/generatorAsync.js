/**
 * 使用Generator实现异步
 *
 * 面试题：使用Generator函数实现类似async/await的异步流程控制
 */

// 模拟异步请求函数
function fetchData(id) {
  return new Promise((resolve, reject) => {
    const delay = Math.floor(Math.random() * 1000) + 500;
    setTimeout(() => {
      if (Math.random() > 0.9) {
        reject(new Error(`Failed to fetch data for id: ${id}`));
      } else {
        resolve({ id, data: `Data for ${id}`, delay });
      }
    }, delay);
  });
}

// 自动执行Generator函数的工具
function runGenerator(generatorFn) {
  const generator = generatorFn();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value)
      .then((res) => handle(generator.next(res)))
      .catch((err) => handle(generator.throw(err)));
  }

  return handle(generator.next());
}

// 使用Generator函数实现异步流程控制
function* fetchSequentialGenerator(ids) {
  const results = [];

  try {
    for (const id of ids) {
      console.log(`Fetching data for id: ${id}...`);
      const result = yield fetchData(id);
      console.log(`Received data for id: ${id}`);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error in generator:', error);
    return results;
  }
}

// 使用Generator实现异步并行
function* fetchParallelGenerator(ids) {
  try {
    // 并行发起所有请求
    const promises = ids.map((id) => fetchData(id));

    // 等待所有请求完成
    const results = yield Promise.all(promises);

    return results;
  } catch (error) {
    console.error('Error in parallel generator:', error);
    return [];
  }
}

// 使用Generator实现异步错误处理
function* fetchWithErrorHandlingGenerator(ids) {
  const results = [];

  for (const id of ids) {
    try {
      const result = yield fetchData(id);
      results.push(result);
    } catch (error) {
      console.error(`Error fetching id ${id}:`, error.message);
      results.push({ id, error: error.message });
    }
  }

  return results;
}

// 测试
console.log('--- Sequential Execution with Generator ---');
runGenerator(function* () {
  console.time('Generator Sequential');
  const sequentialResults = yield* fetchSequentialGenerator([1, 2, 3]);
  console.timeEnd('Generator Sequential');
  console.log('Sequential Results:', sequentialResults);

  console.log('\n--- Parallel Execution with Generator ---');
  console.time('Generator Parallel');
  const parallelResults = yield* fetchParallelGenerator([4, 5, 6]);
  console.timeEnd('Generator Parallel');
  console.log('Parallel Results:', parallelResults);

  console.log('\n--- Error Handling with Generator ---');
  const errorResults = yield* fetchWithErrorHandlingGenerator([7, 8, 9]);
  console.log('Error Handling Results:', errorResults);
});
