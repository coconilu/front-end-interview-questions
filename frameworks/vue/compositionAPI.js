/**
 * Vue3 Composition API
 *
 * 面试题：请详细解释Vue3 Composition API的核心概念、优势以及与Options API的区别
 */

/**
 * 1. Composition API 基础
 */

// 导入所需的API
/*
import { 
  ref, 
  reactive, 
  computed, 
  watch, 
  watchEffect,
  onMounted,
  onUpdated,
  onUnmounted,
  provide,
  inject
} from 'vue';
*/

// 基本的组合式API组件
/*
export default {
  setup() {
    // 1. 声明响应式状态
    const count = ref(0);
    const user = reactive({
      name: '张三',
      age: 30
    });

    // 2. 定义方法
    function increment() {
      count.value++;
    }

    function updateUserName(newName) {
      user.name = newName;
    }

    // 3. 计算属性
    const doubleCount = computed(() => count.value * 2);

    // 4. 监听变化
    watch(count, (newValue, oldValue) => {
      console.log(`计数从 ${oldValue} 变为 ${newValue}`);
    });

    // 5. 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载');
    });

    // 6. 返回需要暴露给模板的内容
    return {
      count,
      user,
      doubleCount,
      increment,
      updateUserName
    };
  }
}
*/

/**
 * 2. 响应式系统详解
 */

// ref: 用于基本类型的响应式
function refExample() {
  // 创建一个响应式引用
  const count = ref(0);

  // 访问和修改值需要使用.value
  console.log(count.value); // 0
  count.value++;
  console.log(count.value); // 1

  // 在模板中使用时不需要.value
  // <div>{{ count }}</div>

  return { count };
}

// reactive: 用于对象类型的响应式
function reactiveExample() {
  // 创建一个响应式对象
  const state = reactive({
    count: 0,
    message: 'Hello',
    user: {
      name: '李四',
      age: 25,
    },
  });

  // 直接访问和修改属性
  console.log(state.count); // 0
  state.count++;
  state.user.age = 26;

  // 替换整个对象会失去响应性
  // state = {}; // 这样做会破坏响应性

  // 正确的做法是修改属性
  Object.assign(state, { count: 10, message: 'Updated' });

  return { state };
}

// toRef 和 toRefs: 解构响应式对象
function toRefsExample() {
  const state = reactive({
    count: 0,
    message: 'Hello',
  });

  // 不会保持响应性的解构
  // const { count, message } = state;

  // 使用toRefs保持响应性
  const stateRefs = toRefs(state);
  const { count, message } = stateRefs;

  // 现在count和message是ref，会保持与原对象的响应性连接
  count.value++;
  console.log(state.count); // 1

  // 单个属性转为ref
  const countRef = toRef(state, 'count');
  countRef.value++;
  console.log(state.count); // 2

  return { count, message };
}

// readonly: 创建只读代理
function readonlyExample() {
  const original = reactive({ count: 0 });
  const copy = readonly(original);

  // 修改原始对象会反映到只读代理
  original.count++;
  console.log(copy.count); // 1

  // 但不能直接修改只读代理
  // copy.count++; // 警告: Set operation on key "count" failed: target is readonly

  return { original, copy };
}

/**
 * 3. 计算属性和监听器
 */

// computed: 创建计算属性
function computedExample() {
  const count = ref(0);

  // 只读计算属性
  const doubleCount = computed(() => count.value * 2);

  // 可写计算属性
  const plusOne = computed({
    get: () => count.value + 1,
    set: (val) => {
      count.value = val - 1;
    },
  });

  // 使用
  console.log(doubleCount.value); // 0
  count.value = 2;
  console.log(doubleCount.value); // 4

  plusOne.value = 10; // 会设置count.value为9
  console.log(count.value); // 9

  return { count, doubleCount, plusOne };
}

// watch: 侦听特定数据源
function watchExample() {
  const count = ref(0);
  const message = ref('Hello');
  const user = reactive({
    name: '王五',
    address: {
      city: '北京',
    },
  });

  // 侦听ref
  watch(count, (newValue, oldValue) => {
    console.log(`count从${oldValue}变为${newValue}`);
  });

  // 侦听多个数据源
  watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
    console.log(
      `count: ${oldCount} -> ${newCount}, message: ${oldMessage} -> ${newMessage}`
    );
  });

  // 侦听响应式对象的属性
  watch(
    () => user.name,
    (newName, oldName) => {
      console.log(`name从${oldName}变为${newName}`);
    }
  );

  // 深度侦听
  watch(
    user,
    (newUser, oldUser) => {
      console.log('user对象变化了');
    },
    { deep: true }
  );

  // 立即执行
  watch(
    count,
    (newValue) => {
      console.log(`count当前值: ${newValue}`);
    },
    { immediate: true }
  );

  return { count, message, user };
}

// watchEffect: 自动收集依赖并侦听
function watchEffectExample() {
  const count = ref(0);
  const message = ref('Hello');

  // 会立即执行一次，并在依赖变化时重新执行
  const stop = watchEffect(() => {
    console.log(`Count: ${count.value}, Message: ${message.value}`);
    // 自动追踪count和message作为依赖
  });

  // 修改会触发watchEffect重新执行
  count.value++;

  // 停止侦听
  stop();

  // 此后的修改不会触发watchEffect
  message.value = 'Hi';

  return { count, message };
}

/**
 * 4. 生命周期钩子
 */

function lifecycleHooksExample() {
  // 在setup中使用生命周期钩子
  onBeforeMount(() => {
    console.log('组件挂载前');
  });

  onMounted(() => {
    console.log('组件已挂载');
    // 适合执行DOM操作、API调用等
  });

  onBeforeUpdate(() => {
    console.log('组件更新前');
  });

  onUpdated(() => {
    console.log('组件已更新');
  });

  onBeforeUnmount(() => {
    console.log('组件卸载前');
    // 清理工作：移除事件监听器、定时器等
  });

  onUnmounted(() => {
    console.log('组件已卸载');
  });

  // Vue3特有的钩子
  onRenderTracked(({ key, target, type }) => {
    console.log('渲染时访问到的响应式属性', key);
  });

  onRenderTriggered(({ key, target, type }) => {
    console.log('触发重新渲染的响应式属性', key);
  });
}

/**
 * 5. 依赖注入
 */

// 在祖先组件中提供数据
function ancestorComponent() {
  // 提供非响应式值
  provide('theme', 'dark');

  // 提供响应式值
  const count = ref(0);
  provide('count', count);

  // 提供只读值，防止后代修改
  const user = reactive({ name: '赵六' });
  provide('user', readonly(user));

  // 提供方法
  function updateCount(value) {
    count.value = value;
  }
  provide('updateCount', updateCount);
}

// 在后代组件中注入数据
function descendantComponent() {
  // 注入值
  const theme = inject('theme');
  const count = inject('count');
  const user = inject('user');
  const updateCount = inject('updateCount');

  // 带默认值的注入
  const locale = inject('locale', 'zh-CN');

  // 使用注入的值和方法
  function increment() {
    updateCount(count.value + 1);
  }

  return { theme, count, user, locale, increment };
}

/**
 * 6. 组合函数 (Composables)
 */

// 可重用的组合函数
function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = initialValue;
  }

  // 返回需要暴露的状态和方法
  return {
    count,
    increment,
    decrement,
    reset,
  };
}

// 带有生命周期管理的组合函数
function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  // 在组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('resize', update);
  });

  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return { width, height };
}

// 异步数据获取的组合函数
function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  // 执行获取数据的操作
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      data.value = json;
      loading.value = false;
    })
    .catch((err) => {
      error.value = err;
      loading.value = false;
    });

  return { data, error, loading };
}

/**
 * 7. 与Options API的对比
 */

// Options API 方式
const OptionsAPIComponent = {
  data() {
    return {
      count: 0,
      message: 'Hello',
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    },
  },
  methods: {
    increment() {
      this.count++;
    },
  },
  watch: {
    count(newValue, oldValue) {
      console.log(`Count changed from ${oldValue} to ${newValue}`);
    },
  },
  mounted() {
    console.log('Component mounted');
  },
};

// Composition API 方式
const CompositionAPIComponent = {
  setup() {
    // 状态
    const count = ref(0);
    const message = ref('Hello');

    // 计算属性
    const doubleCount = computed(() => count.value * 2);

    // 方法
    function increment() {
      count.value++;
    }

    // 侦听器
    watch(count, (newValue, oldValue) => {
      console.log(`Count changed from ${oldValue} to ${newValue}`);
    });

    // 生命周期
    onMounted(() => {
      console.log('Component mounted');
    });

    // 返回暴露给模板的内容
    return {
      count,
      message,
      doubleCount,
      increment,
    };
  },
};

/**
 * 8. Composition API 的优势
 *
 * 1. 更好的代码组织:
 *    - 按功能/关注点组织代码，而不是选项类型
 *    - 相关的逻辑可以放在一起，提高可维护性
 *
 * 2. 逻辑复用:
 *    - 通过组合函数(Composables)轻松提取和复用逻辑
 *    - 不依赖this上下文，避免混入(mixins)的缺点
 *
 * 3. 更好的类型推断:
 *    - 更好地支持TypeScript
 *    - 返回值可以获得完整的类型推断
 *
 * 4. 更小的生产包体积:
 *    - 更好的代码压缩
 *    - 未使用的组合函数可以被摇树优化(tree-shaking)移除
 *
 * 5. 灵活性:
 *    - 可以与Options API共存
 *    - 可以根据需要逐步采用
 */
