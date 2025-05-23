/**
 * React Context实现
 *
 * 面试题：实现一个简单的Context API
 */

import React, { createContext, useContext, useState } from 'react';

/**
 * 创建Context
 * @param {any} defaultValue - 默认值
 * @returns {Object} - Context对象
 */
function createCustomContext(defaultValue) {
  const context = {
    Provider: null,
    Consumer: null,
    _defaultValue: defaultValue
  };

  // 创建Provider组件
  context.Provider = function Provider({ value, children }) {
    const [state, setState] = useState(value);
    
    // 提供value和setValue方法
    const contextValue = {
      value: state,
      setValue: setState
    };

    return (
      <context.Provider value={contextValue}>
        {children}
      </context.Provider>
    );
  };

  // 创建Consumer组件
  context.Consumer = function Consumer({ children }) {
    const value = useContext(context);
    return children(value);
  };

  return context;
}

/**
 * 自定义useContext Hook
 * @param {Object} context - Context对象
 * @returns {any} - Context值
 */
function useCustomContext(context) {
  const value = useContext(context);
  if (value === undefined) {
    throw new Error('useCustomContext must be used within a Provider');
  }
  return value;
}

// 使用示例
/*
// 创建主题Context
const ThemeContext = createCustomContext('light');

// 主题Provider组件
function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}

// 使用Consumer的组件
function ThemedButton() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <button style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
          Themed Button
        </button>
      )}
    </ThemeContext.Consumer>
  );
}

// 使用useContext的组件
function ThemedText() {
  const theme = useCustomContext(ThemeContext);
  return (
    <p style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
      Themed Text
    </p>
  );
}

// 使用示例
function App() {
  return (
    <ThemeProvider>
      <div>
        <ThemedButton />
        <ThemedText />
      </div>
    </ThemeProvider>
  );
}
*/

export {
  createCustomContext,
  useCustomContext
}; 