/**
 * Vue生命周期钩子使用
 *
 * 面试题：解释Vue2和Vue3的生命周期钩子函数及其使用场景
 */

/**
 * Vue2 生命周期钩子示例
 */

// Vue2 组件示例
const Vue2Component = {
  // 组件名称
  name: 'Vue2LifecycleExample',

  // 组件数据
  data() {
    return {
      message: 'Hello Vue2',
      counter: 0,
      timerId: null,
      fetchedData: null,
    };
  },

  // 计算属性
  computed: {
    doubleCounter() {
      return this.counter * 2;
    },
  },

  // 方法
  methods: {
    incrementCounter() {
      this.counter++;
    },

    async fetchData() {
      try {
        const response = await fetch('https://api.example.com/data');
        this.fetchedData = await response.json();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    },

    startTimer() {
      this.timerId = setInterval(() => {
        this.counter++;
      }, 1000);
    },

    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },
  },

  // 1. beforeCreate: 实例初始化之后，数据观测和事件配置之前
  beforeCreate() {
    console.log('beforeCreate');
    console.log('数据和方法尚未初始化:', this.message); // undefined
  },

  // 2. created: 实例创建完成，数据观测、属性和方法的运算，watch/event事件回调已配置完成
  created() {
    console.log('created');
    console.log('数据已初始化:', this.message); // "Hello Vue2"
    // 适合进行API调用、初始化数据等操作
    this.fetchData();
  },

  // 3. beforeMount: 挂载开始之前被调用，相关的render函数首次被调用
  beforeMount() {
    console.log('beforeMount');
    console.log('DOM尚未挂载');
  },

  // 4. mounted: 挂载完成，可以访问DOM元素
  mounted() {
    console.log('mounted');
    console.log('DOM已挂载，可以访问DOM元素');
    // 适合操作DOM、添加第三方库、启动定时器等
    this.startTimer();
  },

  // 5. beforeUpdate: 数据更新时调用，发生在虚拟DOM打补丁之前
  beforeUpdate() {
    console.log('beforeUpdate');
    console.log('数据已更新，但DOM尚未更新');
  },

  // 6. updated: 由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子
  updated() {
    console.log('updated');
    console.log('DOM已更新');
    // 注意不要在这里修改数据，可能导致无限循环
  },

  // 7. beforeDestroy: 实例销毁之前调用
  beforeDestroy() {
    console.log('beforeDestroy');
    console.log('实例即将销毁');
    // 适合清理定时器、取消订阅等
    this.stopTimer();
  },

  // 8. destroyed: 实例销毁后调用
  destroyed() {
    console.log('destroyed');
    console.log('实例已销毁');
  },

  // 额外的钩子: activated 和 deactivated (用于keep-alive组件)
  activated() {
    console.log('activated');
    console.log('被keep-alive缓存的组件激活时调用');
  },

  deactivated() {
    console.log('deactivated');
    console.log('被keep-alive缓存的组件停用时调用');
  },

  // 错误捕获钩子
  errorCaptured(err, vm, info) {
    console.log('errorCaptured');
    console.log(`捕获到后代组件错误: ${err}, ${info}`);
    // 返回false可以阻止错误继续向上传播
    return false;
  },
};

/**
 * Vue3 Composition API 生命周期钩子示例
 */

// 导入Vue3的Composition API
/*
import { 
  ref, 
  computed, 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue';
*/

// Vue3 组件示例
function Vue3Component() {
  // 响应式数据
  const message = ref('Hello Vue3');
  const counter = ref(0);
  let timerId = null;
  const fetchedData = ref(null);

  // 计算属性
  const doubleCounter = computed(() => counter.value * 2);

  // 方法
  function incrementCounter() {
    counter.value++;
  }

  async function fetchData() {
    try {
      const response = await fetch('https://api.example.com/data');
      fetchedData.value = await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  function startTimer() {
    timerId = setInterval(() => {
      counter.value++;
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // 生命周期钩子

  // 1. setup: 在beforeCreate和created之间执行
  console.log('setup');
  console.log('组件初始化');
  // 适合进行API调用、初始化数据等操作
  fetchData();

  // 2. onBeforeMount: 挂载开始之前被调用
  onBeforeMount(() => {
    console.log('onBeforeMount');
    console.log('DOM尚未挂载');
  });

  // 3. onMounted: 挂载完成后调用
  onMounted(() => {
    console.log('onMounted');
    console.log('DOM已挂载，可以访问DOM元素');
    // 适合操作DOM、添加第三方库、启动定时器等
    startTimer();
  });

  // 4. onBeforeUpdate: 数据更新时调用，发生在虚拟DOM打补丁之前
  onBeforeUpdate(() => {
    console.log('onBeforeUpdate');
    console.log('数据已更新，但DOM尚未更新');
  });

  // 5. onUpdated: 由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子
  onUpdated(() => {
    console.log('onUpdated');
    console.log('DOM已更新');
    // 注意不要在这里修改数据，可能导致无限循环
  });

  // 6. onBeforeUnmount: 实例销毁之前调用
  onBeforeUnmount(() => {
    console.log('onBeforeUnmount');
    console.log('实例即将销毁');
    // 适合清理定时器、取消订阅等
    stopTimer();
  });

  // 7. onUnmounted: 实例销毁后调用
  onUnmounted(() => {
    console.log('onUnmounted');
    console.log('实例已销毁');
  });

  // 额外的钩子: onActivated 和 onDeactivated (用于keep-alive组件)
  onActivated(() => {
    console.log('onActivated');
    console.log('被keep-alive缓存的组件激活时调用');
  });

  onDeactivated(() => {
    console.log('onDeactivated');
    console.log('被keep-alive缓存的组件停用时调用');
  });

  // 错误捕获钩子
  onErrorCaptured((err, vm, info) => {
    console.log('onErrorCaptured');
    console.log(`捕获到后代组件错误: ${err}, ${info}`);
    // 返回false可以阻止错误继续向上传播
    return false;
  });

  // 返回需要暴露给模板的内容
  return {
    message,
    counter,
    doubleCounter,
    fetchedData,
    incrementCounter,
  };
}

/**
 * Vue2与Vue3生命周期钩子对照表
 *
 * Vue2              Vue3
 * -----------------------------
 * beforeCreate  -> setup()
 * created       -> setup()
 * beforeMount   -> onBeforeMount
 * mounted       -> onMounted
 * beforeUpdate  -> onBeforeUpdate
 * updated       -> onUpdated
 * beforeDestroy -> onBeforeUnmount
 * destroyed     -> onUnmounted
 * activated     -> onActivated
 * deactivated   -> onDeactivated
 * errorCaptured -> onErrorCaptured
 */

/**
 * 生命周期钩子使用场景总结
 *
 * 1. created/setup:
 *    - 初始化数据
 *    - 发起API请求
 *    - 设置事件监听器
 *
 * 2. mounted/onMounted:
 *    - 访问和操作DOM
 *    - 初始化第三方库
 *    - 设置定时器
 *    - 添加事件监听
 *
 * 3. beforeUpdate/onBeforeUpdate:
 *    - 在DOM更新前访问现有的DOM
 *    - 移除即将被更新的事件监听器
 *
 * 4. updated/onUpdated:
 *    - 访问更新后的DOM
 *    - 注意避免在此钩子中修改状态
 *
 * 5. beforeDestroy(beforeUnmount)/onBeforeUnmount:
 *    - 清理定时器
 *    - 取消网络请求
 *    - 解除事件监听
 *    - 销毁第三方库实例
 *
 * 6. activated/onActivated:
 *    - keep-alive组件激活时执行操作
 *    - 恢复状态或重新获取数据
 *
 * 7. deactivated/onDeactivated:
 *    - keep-alive组件停用时执行清理操作
 */

// 导出组件
module.exports = {
  Vue2Component,
  Vue3Component,
};
