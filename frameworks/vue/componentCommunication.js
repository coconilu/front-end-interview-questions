/**
 * Vue组件通信方式
 *
 * 面试题：请详细说明Vue中各种组件通信方式及其适用场景
 */

/**
 * 1. Props 和 Events (父子组件通信)
 */

// 父组件
const ParentComponent = {
  template: `
    <div>
      <h2>父组件</h2>
      <p>来自子组件的消息: {{ messageFromChild }}</p>
      <child-component 
        :message="messageToChild" 
        @update-message="handleChildUpdate">
      </child-component>
    </div>
  `,
  data() {
    return {
      messageToChild: '父组件传递给子组件的数据',
      messageFromChild: '',
    };
  },
  methods: {
    handleChildUpdate(message) {
      this.messageFromChild = message;
      console.log('父组件接收到子组件消息:', message);
    },
  },
};

// 子组件
const ChildComponent = {
  template: `
    <div>
      <h3>子组件</h3>
      <p>来自父组件的消息: {{ message }}</p>
      <button @click="sendMessageToParent">发送消息给父组件</button>
    </div>
  `,
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  methods: {
    sendMessageToParent() {
      this.$emit('update-message', '这是来自子组件的消息');
    },
  },
};

/**
 * 2. 通过 ref 访问子组件
 */
const RefParentComponent = {
  template: `
    <div>
      <h2>父组件</h2>
      <button @click="callChildMethod">调用子组件方法</button>
      <ref-child-component ref="childComponent"></ref-child-component>
    </div>
  `,
  methods: {
    callChildMethod() {
      // 通过ref直接访问子组件实例
      this.$refs.childComponent.childMethod('父组件通过ref调用');
    },
  },
};

const RefChildComponent = {
  template: `<div><h3>子组件</h3></div>`,
  methods: {
    childMethod(message) {
      console.log('子组件方法被调用:', message);
    },
  },
};

/**
 * 3. EventBus (非父子组件通信)
 */

// 创建事件总线
const EventBus = new Vue();

// 组件A
const ComponentA = {
  template: `
    <div>
      <h3>组件A</h3>
      <button @click="sendMessage">发送消息到组件B</button>
    </div>
  `,
  methods: {
    sendMessage() {
      // 发布事件
      EventBus.$emit('message-from-a', '这是来自组件A的消息');
    },
  },
};

// 组件B
const ComponentB = {
  template: `
    <div>
      <h3>组件B</h3>
      <p>来自组件A的消息: {{ message }}</p>
    </div>
  `,
  data() {
    return {
      message: '',
    };
  },
  created() {
    // 订阅事件
    EventBus.$on('message-from-a', (message) => {
      this.message = message;
    });
  },
  beforeDestroy() {
    // 取消订阅
    EventBus.$off('message-from-a');
  },
};

/**
 * 4. Vuex (全局状态管理)
 */

// Vuex store 定义
const store = new Vuex.Store({
  state: {
    count: 0,
    message: '全局共享的消息',
  },
  mutations: {
    INCREMENT(state) {
      state.count++;
    },
    SET_MESSAGE(state, message) {
      state.message = message;
    },
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('INCREMENT');
      }, 1000);
    },
  },
  getters: {
    doubleCount: (state) => state.count * 2,
  },
});

// 使用Vuex的组件
const VuexComponent = {
  template: `
    <div>
      <h3>Vuex组件</h3>
      <p>Count: {{ count }}</p>
      <p>Double Count: {{ doubleCount }}</p>
      <p>Message: {{ message }}</p>
      <button @click="increment">同步增加</button>
      <button @click="incrementAsync">异步增加</button>
      <button @click="updateMessage">更新消息</button>
    </div>
  `,
  computed: {
    // 映射state
    ...Vuex.mapState(['count', 'message']),
    // 映射getters
    ...Vuex.mapGetters(['doubleCount']),
  },
  methods: {
    // 映射mutations
    ...Vuex.mapMutations({
      increment: 'INCREMENT',
    }),
    // 映射actions
    ...Vuex.mapActions(['incrementAsync']),
    updateMessage() {
      this.$store.commit('SET_MESSAGE', '更新后的消息');
    },
  },
};

/**
 * 5. Provide / Inject (祖先和后代组件通信)
 */

// 祖先组件
const AncestorComponent = {
  template: `
    <div>
      <h2>祖先组件</h2>
      <descendant-component></descendant-component>
    </div>
  `,
  data() {
    return {
      sharedData: '祖先组件提供的数据',
    };
  },
  // 提供数据给后代组件
  provide() {
    return {
      ancestorData: this.sharedData,
      // 提供方法
      ancestorMethod: this.handleDescendantEvent,
    };
  },
  methods: {
    handleDescendantEvent(message) {
      console.log('祖先组件收到后代消息:', message);
    },
  },
};

// 后代组件
const DescendantComponent = {
  template: `
    <div>
      <h3>后代组件</h3>
      <p>来自祖先的数据: {{ ancestorData }}</p>
      <button @click="callAncestorMethod">调用祖先方法</button>
    </div>
  `,
  // 注入祖先提供的数据
  inject: ['ancestorData', 'ancestorMethod'],
  methods: {
    callAncestorMethod() {
      this.ancestorMethod('这是来自后代组件的消息');
    },
  },
};

/**
 * 6. Vue3 新增: 组合式API中的通信方式
 */

// 使用组合式API的组件通信
/*
import { ref, provide, inject } from 'vue';

// 在父组件中
export default {
  setup() {
    // 创建响应式数据
    const message = ref('Hello from parent');
    
    // 提供给后代组件
    provide('message', message);
    
    // 提供方法
    const updateMessage = (newValue) => {
      message.value = newValue;
    };
    provide('updateMessage', updateMessage);
    
    return {
      message
    };
  }
};

// 在子组件中
export default {
  setup() {
    // 注入父组件提供的数据和方法
    const message = inject('message');
    const updateMessage = inject('updateMessage');
    
    const sendToParent = () => {
      updateMessage('Updated from child');
    };
    
    return {
      message,
      sendToParent
    };
  }
};
*/

/**
 * 通信方式总结
 *
 * 1. Props/Events: 父子组件通信的基本方式
 * 2. Ref: 父组件直接访问子组件实例
 * 3. EventBus: 任意组件间通信，适用于小型应用
 * 4. Vuex: 复杂应用的状态管理
 * 5. Provide/Inject: 深层嵌套组件通信
 * 6. Vue3组合式API: 使用provide/inject和响应式API
 *
 * 选择合适的通信方式取决于:
 * - 组件关系(父子、兄弟、跨多层)
 * - 应用复杂度
 * - 数据流向(单向/双向)
 * - 是否需要响应式
 */
