/**
 * React Router实现
 *
 * 面试题：实现一个简单的React Router
 */

import React, { useState, useEffect, useContext } from 'react';

// 创建Router Context
const RouterContext = React.createContext();

/**
 * Router组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} - Router组件
 */
function Router({ children }) {
  const [location, setLocation] = useState(window.location.pathname);

  useEffect(() => {
    // 监听popstate事件
    const handlePopState = () => {
      setLocation(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = {
    location,
    navigate: (to) => {
      window.history.pushState({}, '', to);
      setLocation(to);
    },
  };

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

/**
 * Route组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element|null} - Route组件
 */
function Route({ path, component: Component }) {
  const { location } = useContext(RouterContext);

  // 简单的路径匹配
  const match = location === path;

  return match ? <Component /> : null;
}

/**
 * Link组件
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} - Link组件
 */
function Link({ to, children }) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
}

/**
 * useHistory Hook
 * @returns {Object} - history对象
 */
function useHistory() {
  const { navigate } = useContext(RouterContext);

  return {
    push: (to) => navigate(to),
    replace: (to) => {
      window.history.replaceState({}, '', to);
      navigate(to);
    },
    goBack: () => window.history.back(),
  };
}

/**
 * useParams Hook
 * @returns {Object} - 路由参数对象
 */
function useParams() {
  const { location } = useContext(RouterContext);

  // 简单的参数解析
  const params = {};
  const pathParts = location.split('/');

  // 假设路由格式为 /:param1/:param2
  if (pathParts.length > 1) {
    params.param1 = pathParts[1];
    if (pathParts.length > 2) {
      params.param2 = pathParts[2];
    }
  }

  return params;
}

// 使用示例
/*
// 页面组件
function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

function UserProfile() {
  const params = useParams();
  return <h1>User Profile: {params.param1}</h1>;
}

// 导航组件
function Navigation() {
  const history = useHistory();
  
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <button onClick={() => history.push('/user/123')}>
        Go to User Profile
      </button>
    </nav>
  );
}

// 应用组件
function App() {
  return (
    <Router>
      <Navigation />
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/user/:id" component={UserProfile} />
    </Router>
  );
}
*/

export { Router, Route, Link, useHistory, useParams };
