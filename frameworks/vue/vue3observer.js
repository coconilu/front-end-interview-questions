/**
 * Vue3 数组响应式原理实现
 * 
 * 面试题：Vue3 相比 Vue2，在数组响应式处理上有哪些改进？
 * 答案要点：
 * 1. Vue3 使用 Proxy 可以直接监听整个对象，包括数组
 * 2. Proxy 可以拦截数组的索引赋值和 length 修改
 * 3. 不再需要重写数组方法，更加简洁高效
 * 4. 可以检测到之前 Vue2 监测不到的数组变化
 */

// 模拟 Vue3 中的响应式系统
function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  
  return new Proxy(target, {
    get(target, key, receiver) {
      console.log(`获取 ${key}`);
      
      // 获取属性值
      const result = Reflect.get(target, key, receiver);
      
      // 如果属性值是对象，递归设置响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      // 在这里收集依赖
      track(target, key);
      
      return result;
    },
    
    set(target, key, value, receiver) {
      console.log(`设置 ${key}: ${value}`);
      
      // 获取旧值
      const oldValue = target[key];
      
      // 设置新值
      const result = Reflect.set(target, key, value, receiver);
      
      // 如果是数组且修改了 length 属性
      if (Array.isArray(target) && key === 'length') {
        console.log(`数组长度被修改为 ${value}`);
      }
      
      // 如果是数组索引且索引有效
      if (Array.isArray(target) && isIntegerKey(key)) {
        console.log(`数组索引 ${key} 被修改`);
      }
      
      // 值变化时触发更新
      if (oldValue !== value) {
        // 在这里触发更新
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      console.log(`删除属性 ${key}`);
      
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);
      
      // 如果删除成功且是自身属性，触发更新
      if (hadKey && result) {
        // 在这里触发更新
        trigger(target, key);
      }
      
      return result;
    }
  });
}

// 判断是否为有效的数组索引
function isIntegerKey(key) {
  return String(parseInt(key)) === key;
}

// 模拟依赖收集
function track(target, key) {
  // 在实际实现中，这里会收集当前正在执行的副作用函数
  console.log(`跟踪 ${key} 的变化`);
}

// 模拟触发更新
function trigger(target, key) {
  // 在实际实现中，这里会执行收集到的副作用函数
  console.log(`触发 ${key} 相关的更新`);
}

// 示例用法
const arr = reactive(['a', 'b', 'c']);

// 以下操作都会触发更新
arr.push('d');        // 触发更新
arr.pop();            // 触发更新
arr[0] = 'x';         // 触发更新 (Vue2 无法实现)
arr.length = 1;       // 触发更新 (Vue2 无法实现)

// 对比 Vue2 和 Vue3 在处理数组响应式上的区别
console.log('Vue3 优势：');
console.log('1. 可以检测到数组索引的变化');
console.log('2. 可以检测到数组长度的变化');
console.log('3. 不需要重写数组方法');
console.log('4. 性能更好，代码更简洁');
