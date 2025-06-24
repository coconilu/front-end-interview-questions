/**
 * Vue响应式原理实现
 *
 * 面试题：实现一个简单的Vue响应式系统
 */

/**
 * 依赖收集类 - 用于收集和触发依赖
 */
class Dep {
  constructor() {
    this.subscribers = new Set(); // 存储依赖（订阅者）
  }

  // 添加依赖
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  // 通知所有依赖更新
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}

// 当前活跃的副作用函数（用于依赖收集）
let activeEffect = null;

/**
 * 注册副作用函数
 * @param {Function} effect - 副作用函数
 */
function watchEffect(effect) {
  // 包装effect，确保在执行时可以被依赖收集
  const wrappedEffect = () => {
    activeEffect = wrappedEffect;
    effect();
    activeEffect = null;
  };

  // 立即执行一次，触发依赖收集
  wrappedEffect();
}

/**
 * Vue2风格 - 使用Object.defineProperty实现响应式
 * @param {Object} obj - 目标对象
 * @returns {Object} - 响应式对象
 */
function reactive(obj) {
  // 为每个属性创建一个依赖收集器
  const deps = {};

  // 遍历对象的所有属性
  Object.keys(obj).forEach((key) => {
    deps[key] = new Dep();

    let value = obj[key];

    // 如果属性值是对象，递归使其响应式
    if (typeof value === 'object' && value !== null) {
      value = reactive(value);
    }

    // 使用Object.defineProperty定义getter和setter
    Object.defineProperty(obj, key, {
      get() {
        // 依赖收集
        deps[key].depend();
        return value;
      },
      set(newValue) {
        if (newValue === value) return;

        // 更新值
        value = newValue;

        // 如果新值是对象，使其响应式
        if (typeof newValue === 'object' && newValue !== null) {
          value = reactive(newValue);
        }

        // 通知依赖更新
        deps[key].notify();
      },
    });
  });

  return obj;
}

/**
 * Vue3风格 - 使用Proxy实现响应式
 * @param {Object} target - 目标对象
 * @returns {Proxy} - 响应式代理
 */
function reactiveProxy(target) {
  // 为整个对象创建一个WeakMap存储依赖
  const depsMap = new WeakMap();

  // 获取指定key的依赖收集器
  function getDep(target, key) {
    // 获取target对象的依赖Map
    let targetDeps = depsMap.get(target);
    if (!targetDeps) {
      targetDeps = new Map();
      depsMap.set(target, targetDeps);
    }

    // 获取key的依赖收集器
    let dep = targetDeps.get(key);
    if (!dep) {
      dep = new Dep();
      targetDeps.set(key, dep);
    }

    return dep;
  }

  // 创建代理
  return new Proxy(target, {
    // 拦截属性读取
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);

      // 依赖收集
      const dep = getDep(target, key);
      dep.depend();

      // 如果属性值是对象，递归创建代理
      if (typeof result === 'object' && result !== null) {
        return reactiveProxy(result);
      }

      return result;
    },

    // 拦截属性设置
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      // 如果值发生变化，通知依赖更新
      if (oldValue !== value) {
        const dep = getDep(target, key);
        dep.notify();
      }

      return result;
    },

    // 拦截属性删除
    deleteProperty(target, key) {
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);

      // 如果删除成功且属性存在，通知依赖更新
      if (hadKey && result) {
        const dep = getDep(target, key);
        dep.notify();
      }

      return result;
    },
  });
}

/**
 * 创建计算属性
 * @param {Function} getter - 计算属性的getter函数
 * @returns {Object} - 包含value属性的对象
 */
function computed(getter) {
  // 缓存结果
  let value;
  // 标记是否需要重新计算
  let dirty = true;

  // 创建依赖收集器
  const dep = new Dep();

  // 创建effect，当依赖变化时将dirty设为true
  watchEffect(() => {
    dirty = true;
    const newValue = getter();

    // 如果值发生变化，通知依赖更新
    if (newValue !== value) {
      value = newValue;
      dep.notify();
    }
  });

  return {
    // 计算属性的getter
    get value() {
      // 如果dirty为true，重新计算
      if (dirty) {
        value = getter();
        dirty = false;
      }

      // 收集依赖
      dep.depend();
      return value;
    },
  };
}

/**
 * 创建ref - 包装基本类型值使其成为响应式
 * @param {any} initialValue - 初始值
 * @returns {Object} - 包含value属性的响应式对象
 */
function ref(initialValue) {
  const dep = new Dep();

  return {
    get value() {
      dep.depend();
      return initialValue;
    },
    set value(newValue) {
      if (newValue === initialValue) return;
      initialValue = newValue;
      dep.notify();
    },
  };
}

// 使用示例
/*
// 创建响应式对象
const state = reactive({
  count: 0,
  message: 'Hello'
});

// 创建计算属性
const doubleCount = computed(() => state.count * 2);

// 创建一个ref
const name = ref('Vue');

// 创建一个副作用，当依赖变化时自动执行
watchEffect(() => {
  console.log(`Count: ${state.count}, Double: ${doubleCount.value}`);
  console.log(`Message: ${state.message}, Name: ${name.value}`);
});

// 修改状态，触发更新
state.count++;
state.message = 'Hello Vue';
name.value = 'Vue.js';
*/

// 导出API
module.exports = {
  reactive,
  reactiveProxy,
  watchEffect,
  computed,
  ref,
};
