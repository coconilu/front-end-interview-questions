/**
 * React状态管理
 *
 * 面试题：实现一个简单的Redux
 */

/**
 * 创建Store
 * @param {Function} reducer - 纯函数，用于处理状态更新
 * @param {any} initialState - 初始状态
 * @returns {Object} - Store对象
 */
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];
  
  // 获取当前状态
  const getState = () => state;
  
  // 分发action
  const dispatch = (action) => {
    // 更新状态
    state = reducer(state, action);
    // 通知所有监听器
    listeners.forEach(listener => listener());
  };
  
  // 订阅状态变化
  const subscribe = (listener) => {
    listeners.push(listener);
    // 返回取消订阅的函数
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };
  
  return {
    getState,
    dispatch,
    subscribe
  };
}

/**
 * 合并多个reducer
 * @param {Object} reducers - reducer对象
 * @returns {Function} - 合并后的reducer
 */
function combineReducers(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, {});
  };
}

/**
 * 中间件机制
 * @param {Function} middleware - 中间件函数
 * @returns {Function} - 增强后的dispatch
 */
function applyMiddleware(middleware) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    const dispatch = middleware(store)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
}

/**
 * 日志中间件示例
 */
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  return result;
};

// 使用示例
/*
// 定义reducer
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
};

// 创建store
const store = createStore(counterReducer, 0);

// 订阅状态变化
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// 分发action
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'INCREMENT' });
store.dispatch({ type: 'DECREMENT' });

// 取消订阅
unsubscribe();
*/

export {
  createStore,
  combineReducers,
  applyMiddleware,
  loggerMiddleware
}; 