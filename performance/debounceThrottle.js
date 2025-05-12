/**
 * 防抖和节流函数
 * 
 * 面试题：实现防抖(debounce)和节流(throttle)函数，并解释它们的应用场景
 */

/**
 * 防抖函数 (Debounce)
 * 
 * 将多次高频操作优化为只在最后一次执行
 * 场景：输入框搜索，用户输入完毕后才发送请求
 * 
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间，单位ms
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} - 防抖处理后的函数
 */
function debounce(fn, delay = 300, immediate = false) {
  let timer = null;
  
  return function(...args) {
    // 保存函数调用时的上下文和参数
    const context = this;
    
    // 如果已经设定过定时器，则清空上一次的定时器
    if (timer) {
      clearTimeout(timer);
    }
    
    // 立即执行
    if (immediate) {
      // 如果是第一次调用，则立即执行
      const callNow = !timer;
      
      // 设置定时器，在delay后将timer设为null
      timer = setTimeout(() => {
        timer = null;
      }, delay);
      
      if (callNow) {
        fn.apply(context, args);
      }
    } else {
      // 非立即执行，设置定时器，在delay后执行函数
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 节流函数 (Throttle)
 * 
 * 每隔一段时间执行一次，降低频率
 * 场景：滚动事件，resize事件，拖拽
 * 
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 延迟时间，单位ms
 * @param {boolean} leading - 是否在延迟开始前执行
 * @param {boolean} trailing - 是否在延迟结束后执行
 * @returns {Function} - 节流处理后的函数
 */
function throttle(fn, delay = 300, { leading = true, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  
  // 定义执行函数
  const invoke = function(time) {
    // 执行函数
    fn.apply(lastThis, lastArgs);
    // 更新上次执行时间
    lastCallTime = time;
    // 清除参数
    lastArgs = lastThis = null;
  };
  
  // 返回节流函数
  return function(...args) {
    const now = Date.now();
    // 保存调用时的上下文和参数
    lastThis = this;
    lastArgs = args;
    
    // 如果是第一次调用或者距离上次调用已经超过了delay
    if (lastCallTime === 0) {
      // 如果需要立即执行
      if (leading) {
        lastCallTime = now;
        invoke(now);
      } else {
        lastCallTime = now;
      }
      return;
    }
    
    // 计算剩余时间
    const remaining = delay - (now - lastCallTime);
    
    // 如果已经到了执行时间
    if (remaining <= 0) {
      // 清除定时器
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      // 执行函数
      lastCallTime = now;
      invoke(now);
    } 
    // 如果还没到执行时间，且允许结束后执行
    else if (!timer && trailing) {
      // 设置定时器，在remaining后执行
      timer = setTimeout(() => {
        // 如果不允许立即执行，则将lastCallTime设为0
        lastCallTime = leading ? Date.now() : 0;
        timer = null;
        invoke(Date.now());
      }, remaining);
    }
  };
}

/**
 * 简化版节流函数 (使用时间戳)
 * 
 * 特点：第一次会立即执行，最后一次不一定执行
 * 
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 延迟时间，单位ms
 * @returns {Function} - 节流处理后的函数
 */
function throttleWithTimestamp(fn, delay = 300) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    // 如果距离上次执行超过了delay
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 简化版节流函数 (使用定时器)
 * 
 * 特点：第一次不会立即执行，最后一次会执行
 * 
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 延迟时间，单位ms
 * @returns {Function} - 节流处理后的函数
 */
function throttleWithTimer(fn, delay = 300) {
  let timer = null;
  
  return function(...args) {
    // 如果定时器不存在，则设置定时器
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 防抖与节流的应用场景
 * 
 * 防抖 (Debounce):
 * 1. 搜索框输入，用户输入完毕后才发送请求
 * 2. 表单验证，用户输入完毕后才验证
 * 3. 按钮提交，防止多次点击
 * 4. 调整浏览器窗口大小时，重新计算布局
 * 
 * 节流 (Throttle):
 * 1. 滚动事件，每隔一段时间计算位置
 * 2. 拖拽事件，固定时间内执行
 * 3. 动画帧率控制
 * 4. 鼠标移动事件
 * 5. 游戏中的按键响应
 */

// 使用示例
/*
// 防抖示例：搜索框
const searchInput = document.getElementById('search');
const search = debounce(function(event) {
  console.log('搜索:', event.target.value);
  // 发送API请求
}, 500);

searchInput.addEventListener('input', search);

// 节流示例：滚动事件
const onScroll = throttle(function() {
  console.log('滚动位置:', window.scrollY);
  // 检查是否需要加载更多内容
}, 200);

window.addEventListener('scroll', onScroll);
*/

// 导出函数
module.exports = {
  debounce,
  throttle,
  throttleWithTimestamp,
  throttleWithTimer
}; 