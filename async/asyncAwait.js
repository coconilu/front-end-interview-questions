/**
 * async/await使用示例
 * 
 * 面试题：实现一个函数，模拟多个异步请求的并行和串行执行
 */

// 模拟异步请求函数
function fetchData(id) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 1000) + 500;
    setTimeout(() => {
      console.log(`Fetched data for id: ${id}, took ${delay}ms`);
      resolve({ id, data: `Data for ${id}`, delay });
    }, delay);
  });
}

// 串行执行异步请求
async function fetchSequential(ids) {
  console.time('Sequential');
  const results = [];
  
  for (const id of ids) {
    const result = await fetchData(id);
    results.push(result);
  }
  
  console.timeEnd('Sequential');
  return results;
}

// 并行执行异步请求
async function fetchParallel(ids) {
  console.time('Parallel');
  
  const promises = ids.map(id => fetchData(id));
  const results = await Promise.all(promises);
  
  console.timeEnd('Parallel');
  return results;
}

// 使用async/await处理错误
async function fetchWithErrorHandling(id) {
  try {
    if (id === 3) {
      throw new Error('ID 3 is not allowed');
    }
    return await fetchData(id);
  } catch (error) {
    console.error(`Error fetching data for id ${id}:`, error.message);
    return { id, error: error.message };
  }
}

// 并行执行但限制并发数
async function fetchWithConcurrencyLimit(ids, limit = 2) {
  console.time('Limited Concurrency');
  const results = [];
  
  // 分批处理
  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit);
    const batchPromises = batch.map(id => fetchData(id));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  console.timeEnd('Limited Concurrency');
  return results;
}

// 测试
async function runTests() {
  const ids = [1, 2, 3, 4, 5];
  
  console.log('--- Sequential Execution ---');
  const sequentialResults = await fetchSequential(ids);
  console.log('Sequential Results:', sequentialResults);
  
  console.log('\n--- Parallel Execution ---');
  const parallelResults = await fetchParallel(ids);
  console.log('Parallel Results:', parallelResults);
  
  console.log('\n--- Error Handling ---');
  const errorResults = await Promise.all(ids.map(fetchWithErrorHandling));
  console.log('Error Handling Results:', errorResults);
  
  console.log('\n--- Limited Concurrency ---');
  const limitedResults = await fetchWithConcurrencyLimit(ids, 2);
  console.log('Limited Concurrency Results:', limitedResults);
}

runTests().catch(console.error); 