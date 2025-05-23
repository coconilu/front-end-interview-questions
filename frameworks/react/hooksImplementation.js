/**
 * React Hooks实现原理
 *
 * 面试题：实现一个简单的useState Hook
 */

// 存储hooks状态的数组
let hooks = [];
// 当前hook的索引
let currentHook = 0;

/**
 * 简单的useState实现
 * @param {any} initialState - 初始状态
 * @returns {[any, Function]} - 状态值和更新函数
 */
function useState(initialState) {
  // 获取当前hook的索引
  const hookIndex = currentHook;
  
  // 如果是第一次渲染，使用初始值
  if (!hooks[hookIndex]) {
    hooks[hookIndex] = initialState;
  }
  
  // 创建setState函数
  const setState = (newState) => {
    // 如果新状态是函数，则调用它获取新状态
    const nextState = typeof newState === 'function' 
      ? newState(hooks[hookIndex])
      : newState;
      
    // 更新状态
    hooks[hookIndex] = nextState;
    
    // 触发重新渲染
    render();
  };
  
  // 增加hook索引
  currentHook++;
  
  return [hooks[hookIndex], setState];
}

/**
 * 简单的useEffect实现
 * @param {Function} callback - 副作用函数
 * @param {Array} deps - 依赖数组
 */
function useEffect(callback, deps) {
  const hookIndex = currentHook;
  
  // 获取上一次的依赖
  const prevDeps = hooks[hookIndex];
  
  // 检查依赖是否改变
  const hasChangedDeps = !prevDeps || 
    !deps || 
    deps.some((dep, i) => dep !== prevDeps[i]);
  
  if (hasChangedDeps) {
    // 执行副作用
    callback();
    // 保存新的依赖
    hooks[hookIndex] = deps;
  }
  
  currentHook++;
}

/**
 * 简单的useRef实现
 * @param {any} initialValue - 初始值
 * @returns {Object} - ref对象
 */
function useRef(initialValue) {
  const hookIndex = currentHook;
  
  if (!hooks[hookIndex]) {
    hooks[hookIndex] = { current: initialValue };
  }
  
  currentHook++;
  return hooks[hookIndex];
}

/**
 * 重置hooks状态
 */
function resetHooks() {
  currentHook = 0;
  hooks = [];
}

/**
 * 简单的渲染函数
 */
function render() {
  // 重置hooks状态
  resetHooks();
  
  // 这里应该调用组件的render方法
  // 为了示例，我们直接返回
  return;
}

// 使用示例
/*
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  
  const countRef = useRef(0);
  
  return {
    increment: () => setCount(count + step),
    decrement: () => setCount(count - step),
    setStep: (newStep) => setStep(newStep),
    getCount: () => countRef.current
  };
}
*/

export { useState, useEffect, useRef }; 