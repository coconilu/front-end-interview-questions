/**
 * React自定义Hook实现
 *
 * 面试题：实现几个常用的自定义Hook
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 1. useLocalStorage - 将状态持久化到localStorage
 * @param {string} key - localStorage的键名
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} - 状态值和更新函数
 */
function useLocalStorage(key, initialValue) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 从localStorage获取值
      const item = window.localStorage.getItem(key);
      // 如果存在则解析JSON，否则返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 更新localStorage的函数
  const setValue = (value) => {
    try {
      // 允许value是函数，类似于setState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // 保存到state
      setStoredValue(valueToStore);
      // 保存到localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

/**
 * 2. useDebounce - 防抖Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {any} - 防抖后的值
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数，组件卸载或value/delay变化时调用
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 3. useFetch - 数据获取Hook
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @returns {Object} - {data, loading, error, refetch}
 */
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 使用useRef保存最新的options
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 重新获取数据的函数
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, optionsRef.current);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  // 初始获取数据
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * 4. useMediaQuery - 媒体查询Hook
 * @param {string} query - CSS媒体查询字符串
 * @returns {boolean} - 是否匹配
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // 设置初始值
    setMatches(mediaQuery.matches);

    // 定义回调函数
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * 5. useClickOutside - 点击外部元素Hook
 * @param {Function} handler - 点击外部时的回调函数
 * @returns {React.RefObject} - ref对象，需要附加到目标元素
 */
function useClickOutside(handler) {
  const ref = useRef();

  useEffect(() => {
    const listener = (event) => {
      // 如果点击的元素不在ref引用的元素内部，则调用handler
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // 添加事件监听器
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // 清理函数
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}

// 使用示例
/*
function App() {
  // 使用localStorage存储用户名
  const [username, setUsername] = useLocalStorage('username', '');
  
  // 使用防抖处理搜索输入
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // 获取数据
  const { data, loading, error } = useFetch(
    `https://api.example.com/search?q=${debouncedSearchTerm}`
  );
  
  // 检测是否是移动设备
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // 创建一个下拉菜单，点击外部时关闭
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => {
    setIsOpen(false);
  });
  
  return (
    <div>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="用户名 (保存到localStorage)"
      />
      
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索 (带防抖)"
      />
      
      {loading ? (
        <p>加载中...</p>
      ) : error ? (
        <p>错误: {error}</p>
      ) : (
        <ul>
          {data?.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      
      {isMobile ? <p>移动设备视图</p> : <p>桌面视图</p>}
      
      <div>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '关闭' : '打开'}下拉菜单
        </button>
        {isOpen && (
          <div ref={dropdownRef}>
            <ul>
              <li>选项1</li>
              <li>选项2</li>
              <li>选项3</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
*/

export {
  useLocalStorage,
  useDebounce,
  useFetch,
  useMediaQuery,
  useClickOutside,
};
