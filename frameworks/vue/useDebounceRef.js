/**
 * Vue 自定义Ref实现防抖功能
 *
 * 面试题：实现一个带有防抖功能的响应式引用
 */

import { customRef } from 'vue';

/**
 * 创建一个带有防抖功能的ref
 * @param {any} value - 初始值
 * @param {number} delay - 防抖延迟时间(毫秒)
 * @returns {Object} - 自定义ref对象
 */
function useDebouncedRef(value, delay = 500) {
  let timeout;
  return customRef((track, trigger) => ({
    get() { track(); return value; },
    set(newVal) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        value = newVal;
        trigger(); // 延迟触发更新
      }, delay);
    }
  }));
}

// 使用示例
// const searchText = useDebouncedRef(''); // 输入框防抖应用

// 导出API
export default useDebouncedRef;