/**
 * Vue2 数组响应式原理实现
 *
 * 面试题：Vue2 中如何实现数组的响应式？为什么需要重写数组方法？
 * 答案要点：
 * 1. Vue2 使用 Object.defineProperty 无法直接监听数组索引的变化
 * 2. Vue2 通过重写数组原型方法来实现响应式
 * 3. Vue2 不能检测到通过索引设置数组项和修改数组长度的变化
 */

// 模拟 Vue2 中的响应式系统
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    // 重写数组方法
    protoAugment(obj, arrayMethods);

    // 对数组的每个元素进行观察
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  } else {
    // 处理对象
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }

  return obj;
}

// 定义响应式属性
function defineReactive(obj, key, val) {
  // 递归观察属性值
  const childOb = observe(val);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`获取 ${key}: ${val}`);
      // 在这里收集依赖
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      console.log(`设置 ${key}: ${newVal}`);
      val = newVal;
      // 新值可能是对象，需要重新观察
      observe(newVal);
      // 在这里触发更新
    },
  });
}

// 数组方法拦截
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

// 需要重写的数组方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

methodsToPatch.forEach((method) => {
  // 缓存原始方法
  const original = arrayProto[method];

  // 重写数组方法
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      // 调用原始方法
      const result = original.apply(this, args);

      // 获取插入的新元素
      let inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }

      // 对新插入的元素进行观察
      if (inserted) {
        for (let i = 0; i < inserted.length; i++) {
          observe(inserted[i]);
        }
      }

      // 触发更新
      console.log(`数组方法 ${method} 被调用，触发更新`);

      return result;
    },
    enumerable: false,
    writable: true,
    configurable: true,
  });
});

// 为数组设置拦截原型
function protoAugment(arr, proto) {
  arr.__proto__ = proto;
}

// 示例用法
const data = {
  items: ['a', 'b', 'c'],
};

// 将数据变成响应式
observe(data);

// 以下操作会触发更新
data.items.push('d'); // 触发更新
data.items.pop(); // 触发更新

// 以下操作不会触发更新
data.items[0] = 'x'; // 不会触发更新
data.items.length = 1; // 不会触发更新
