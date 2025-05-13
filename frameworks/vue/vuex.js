/**
 * Vuex 状态管理
 *
 * 面试题：请详细解释Vuex的核心概念、工作原理以及在大型应用中的最佳实践
 */

/**
 * 1. Vuex 核心概念
 */

// 创建一个简单的Vuex Store
const store = new Vuex.Store({
  // 状态：存储应用的数据
  state: {
    count: 0,
    todos: [],
    user: null,
    isLoading: false,
    error: null
  },

  // Getters：从state派生出的状态
  getters: {
    // 计算属性
    completedTodos: state => {
      return state.todos.filter(todo => todo.completed);
    },
    // 接受其他getter作为第二个参数
    completedTodosCount: (state, getters) => {
      return getters.completedTodos.length;
    },
    // 返回一个函数，可以接受参数
    getTodoById: state => id => {
      return state.todos.find(todo => todo.id === id);
    }
  },

  // Mutations：同步修改状态的方法
  mutations: {
    // 简单mutation
    INCREMENT(state) {
      state.count++;
    },
    // 带载荷的mutation
    SET_COUNT(state, payload) {
      state.count = payload;
    },
    // 对象风格的提交方式
    SET_TODO_STATUS(state, { id, completed }) {
      const todo = state.todos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = completed;
      }
    },
    // 添加新的todo
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    },
    // 设置用户
    SET_USER(state, user) {
      state.user = user;
    },
    // 设置加载状态
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    // 设置错误
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  // Actions：可包含异步操作，通过提交mutation来修改状态
  actions: {
    // 简单action
    increment({ commit }) {
      commit('INCREMENT');
    },
    // 异步action
    incrementAsync({ commit }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('INCREMENT');
          resolve();
        }, 1000);
      });
    },
    // 带参数的action
    setCount({ commit }, count) {
      commit('SET_COUNT', count);
    },
    // 复杂的异步action
    async fetchTodos({ commit, state }) {
      // 避免重复请求
      if (state.isLoading) return;

      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);

        const response = await fetch('https://api.example.com/todos');
        
        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }
        
        const todos = await response.json();
        
        // 更新状态
        todos.forEach(todo => {
          commit('ADD_TODO', todo);
        });
        
        commit('SET_LOADING', false);
      } catch (error) {
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
      }
    },
    // Action可以调用其他action
    async login({ dispatch, commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        
        const user = await authService.login(credentials);
        commit('SET_USER', user);
        
        // 登录后获取用户数据
        await dispatch('fetchUserData', user.id);
        
        commit('SET_LOADING', false);
      } catch (error) {
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
      }
    }
  },

  // 模块：将store分割成模块
  modules: {
    // 每个模块拥有自己的state、mutations、actions、getters
    products: {
      namespaced: true, // 启用命名空间
      state: {
        all: []
      },
      getters: {
        availableProducts(state) {
          return state.all.filter(product => product.inventory > 0);
        }
      },
      mutations: {
        SET_PRODUCTS(state, products) {
          state.all = products;
        }
      },
      actions: {
        async fetchProducts({ commit }) {
          const products = await fetch('https://api.example.com/products');
          commit('SET_PRODUCTS', await products.json());
        }
      }
    },
    
    cart: {
      namespaced: true,
      state: {
        items: []
      },
      getters: {
        cartTotal(state) {
          return state.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
          }, 0);
        }
      },
      mutations: {
        ADD_TO_CART(state, { product, quantity = 1 }) {
          const existingItem = state.items.find(item => item.id === product.id);
          
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            state.items.push({
              ...product,
              quantity
            });
          }
        }
      },
      actions: {
        addProductToCart({ commit, rootState }, { productId, quantity }) {
          // 访问根状态
          const product = rootState.products.all.find(p => p.id === productId);
          
          if (product && product.inventory > 0) {
            commit('ADD_TO_CART', { product, quantity });
            // 调用其他模块的mutation
            commit('products/DECREMENT_INVENTORY', { id: productId }, { root: true });
          }
        }
      }
    }
  }
});

/**
 * 2. 在组件中使用Vuex
 */

// 基本用法
const Counter = {
  template: `
    <div>
      <p>Count: {{ count }}</p>
      <p>Double Count: {{ doubleCount }}</p>
      <button @click="increment">Increment</button>
      <button @click="incrementAsync">Increment Async</button>
    </div>
  `,
  computed: {
    count() {
      return this.$store.state.count;
    },
    doubleCount() {
      return this.$store.getters.doubleCount;
    }
  },
  methods: {
    increment() {
      this.$store.commit('INCREMENT');
    },
    incrementAsync() {
      this.$store.dispatch('incrementAsync');
    }
  }
};

// 使用mapState, mapGetters, mapMutations, mapActions辅助函数
const TodoList = {
  template: `
    <div>
      <div v-if="isLoading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <ul v-else>
        <li v-for="todo in todos" :key="todo.id" 
            :class="{ completed: todo.completed }">
          {{ todo.text }}
          <button @click="toggleTodo(todo.id)">Toggle</button>
        </li>
      </ul>
      <p>Completed: {{ completedTodosCount }}</p>
      <button @click="fetchTodos">Refresh</button>
    </div>
  `,
  computed: {
    // 从state中映射
    ...Vuex.mapState({
      todos: state => state.todos,
      isLoading: 'isLoading',
      error: 'error'
    }),
    // 从getters中映射
    ...Vuex.mapGetters([
      'completedTodos',
      'completedTodosCount'
    ])
  },
  methods: {
    // 映射mutations
    ...Vuex.mapMutations({
      setTodoStatus: 'SET_TODO_STATUS'
    }),
    // 映射actions
    ...Vuex.mapActions([
      'fetchTodos'
    ]),
    toggleTodo(id) {
      const todo = this.$store.getters.getTodoById(id);
      this.setTodoStatus({
        id,
        completed: !todo.completed
      });
    }
  },
  created() {
    this.fetchTodos();
  }
};

// 使用命名空间的模块
const ProductList = {
  template: `
    <div>
      <h2>Products</h2>
      <ul>
        <li v-for="product in availableProducts" :key="product.id">
          {{ product.title }} - ${{ product.price }}
          <button @click="addToCart(product.id)">Add to Cart</button>
        </li>
      </ul>
      <div>
        <h3>Cart</h3>
        <p>Total: ${{ cartTotal }}</p>
      </div>
    </div>
  `,
  computed: {
    // 使用命名空间的mapState和mapGetters
    ...Vuex.mapState('products', {
      products: 'all'
    }),
    ...Vuex.mapGetters('products', [
      'availableProducts'
    ]),
    ...Vuex.mapGetters('cart', [
      'cartTotal'
    ])
  },
  methods: {
    // 使用命名空间的mapActions
    ...Vuex.mapActions('products', [
      'fetchProducts'
    ]),
    ...Vuex.mapActions('cart', {
      addProductToCart: 'addProductToCart'
    }),
    addToCart(productId) {
      this.addProductToCart({ productId, quantity: 1 });
    }
  },
  created() {
    this.fetchProducts();
  }
};

/**
 * 3. Vuex 插件
 */

// 持久化插件
const persistStatePlugin = store => {
  // 从localStorage恢复状态
  const savedState = localStorage.getItem('vuex-state');
  if (savedState) {
    store.replaceState(JSON.parse(savedState));
  }

  // 当状态变更时保存到localStorage
  store.subscribe((mutation, state) => {
    localStorage.setItem('vuex-state', JSON.stringify(state));
  });
};

// 日志插件
const loggerPlugin = store => {
  store.subscribe((mutation, state) => {
    console.log('mutation', mutation.type, mutation.payload);
    console.log('next state', state);
  });
};

// 使用插件
const storeWithPlugins = new Vuex.Store({
  // ...store配置
  plugins: [
    persistStatePlugin,
    loggerPlugin,
    // 只在开发环境使用的插件
    process.env.NODE_ENV !== 'production' ? createLogger() : []
  ]
});

/**
 * 4. Vuex 严格模式
 */

const strictStore = new Vuex.Store({
  // ...store配置
  strict: process.env.NODE_ENV !== 'production'
  // 在严格模式下，任何非mutation的状态变更都会抛出错误
});

/**
 * 5. Vuex 最佳实践
 * 
 * 1. 目录结构:
 *    - 按功能模块拆分store
 *    - 使用命名空间区分模块
 *    - 将actions、mutations、getters分离到单独文件
 * 
 * 2. 类型常量:
 *    - 使用常量替代mutation字符串
 *    - 避免拼写错误和重复定义
 */

// 类型常量
const types = {
  INCREMENT: 'INCREMENT',
  SET_COUNT: 'SET_COUNT',
  FETCH_TODOS: 'FETCH_TODOS'
};

// 使用常量
const storeWithConstants = {
  mutations: {
    [types.INCREMENT](state) {
      state.count++;
    },
    [types.SET_COUNT](state, count) {
      state.count = count;
    }
  },
  actions: {
    [types.FETCH_TODOS]({ commit }) {
      // ...
    }
  }
};

/**
 * 6. Vuex 工作原理
 * 
 * Vuex的核心工作原理:
 * 
 * 1. 响应式系统:
 *    - 利用Vue的响应式系统来追踪状态变化
 *    - Store中的state对象被转换为响应式对象
 * 
 * 2. 单向数据流:
 *    - 视图 -> Actions -> Mutations -> State -> 视图
 *    - 保证状态变更可追踪、可预测
 * 
 * 3. 状态隔离:
 *    - 应用状态集中管理
 *    - 组件只能通过规定的方式修改状态
 * 
 * 4. 模块化:
 *    - 通过modules分割状态树
 *    - 每个模块维护自己的状态、mutations、actions和getters
 */ 