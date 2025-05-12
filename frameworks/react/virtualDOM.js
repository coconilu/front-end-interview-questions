/**
 * 虚拟DOM实现原理
 * 
 * 面试题：实现一个简单的虚拟DOM和diff算法
 */

/**
 * 创建虚拟DOM节点
 * @param {string} type - 节点类型
 * @param {Object} props - 节点属性
 * @param  {...any} children - 子节点
 * @returns {Object} - 虚拟DOM节点
 */
function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children: children.flat().map(child => 
      typeof child === 'object' ? child : createTextElement(child)
    )
  };
}

/**
 * 创建文本节点
 * @param {string} text - 文本内容
 * @returns {Object} - 文本节点
 */
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {},
    children: [],
    value: text
  };
}

/**
 * 将虚拟DOM渲染到真实DOM
 * @param {Object} vNode - 虚拟DOM节点
 * @param {HTMLElement} container - 容器元素
 */
function render(vNode, container) {
  // 创建DOM元素
  const dom = vNode.type === 'TEXT_ELEMENT'
    ? document.createTextNode(vNode.value)
    : document.createElement(vNode.type);
  
  // 设置属性
  if (vNode.props) {
    Object.keys(vNode.props).forEach(name => {
      // 处理事件
      if (name.startsWith('on')) {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, vNode.props[name]);
      } else if (name === 'style') {
        // 处理样式
        Object.assign(dom.style, vNode.props.style);
      } else if (name !== 'children') {
        // 设置其他属性
        dom[name] = vNode.props[name];
      }
    });
  }
  
  // 递归渲染子节点
  if (vNode.children) {
    vNode.children.forEach(child => render(child, dom));
  }
  
  // 将元素添加到容器
  container.appendChild(dom);
}

/**
 * 简单的diff算法实现
 * @param {HTMLElement} dom - 真实DOM节点
 * @param {Object} oldVNode - 旧的虚拟DOM节点
 * @param {Object} newVNode - 新的虚拟DOM节点
 */
function updateElement(dom, oldVNode, newVNode) {
  // 情况1：节点被移除
  if (!newVNode) {
    dom.remove();
    return;
  }
  
  // 情况2：新节点是文本节点
  if (typeof newVNode === 'string') {
    dom.textContent = newVNode;
    return;
  }
  
  // 情况3：节点类型改变
  if (oldVNode.type !== newVNode.type) {
    const newDom = document.createElement(newVNode.type);
    dom.parentNode.replaceChild(newDom, dom);
    render(newVNode, newDom.parentNode);
    return;
  }
  
  // 情况4：更新属性
  updateProps(dom, oldVNode.props || {}, newVNode.props || {});
  
  // 情况5：更新子节点
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < maxLength; i++) {
    updateElement(
      dom.childNodes[i],
      oldChildren[i],
      newChildren[i]
    );
  }
}

/**
 * 更新DOM元素的属性
 * @param {HTMLElement} dom - DOM元素
 * @param {Object} oldProps - 旧属性
 * @param {Object} newProps - 新属性
 */
function updateProps(dom, oldProps, newProps) {
  // 设置新属性
  Object.keys(newProps).forEach(name => {
    if (name === 'children') return;
    
    // 处理事件
    if (name.startsWith('on')) {
      const eventType = name.toLowerCase().substring(2);
      if (oldProps[name]) {
        dom.removeEventListener(eventType, oldProps[name]);
      }
      dom.addEventListener(eventType, newProps[name]);
    } else if (name === 'style') {
      // 处理样式
      Object.assign(dom.style, newProps.style);
    } else {
      // 设置其他属性
      dom[name] = newProps[name];
    }
  });
  
  // 移除不再存在的属性
  Object.keys(oldProps).forEach(name => {
    if (name === 'children' || newProps[name] !== undefined) return;
    
    // 移除事件
    if (name.startsWith('on')) {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, oldProps[name]);
    } else {
      // 移除属性
      dom[name] = '';
    }
  });
}

/**
 * 创建一个组件实例
 * @param {Function|Class} component - 组件构造函数或类
 * @param {Object} props - 组件属性
 * @returns {Object} - 组件实例
 */
function createComponent(component, props) {
  let instance;
  
  // 类组件
  if (component.prototype && component.prototype.render) {
    instance = new component(props);
  } 
  // 函数组件
  else {
    instance = {
      render: () => component(props),
      props
    };
  }
  
  return instance;
}

/**
 * 使用JSX语法的示例
 * 注意：这需要Babel转换
 */
/*
// 定义一个简单的组件
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

// 使用我们的虚拟DOM库渲染
const vNode = (
  <div className="app">
    <h1>Virtual DOM Example</h1>
    <Counter initialCount={0} />
    <p>This is a simple implementation of Virtual DOM</p>
  </div>
);

render(vNode, document.getElementById('root'));
*/

/**
 * 不使用JSX的等效代码
 */
/*
// 定义一个简单的组件
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  
  return createElement(
    'div',
    {},
    createElement('h1', {}, `Count: ${count}`),
    createElement('button', { onClick: () => setCount(count - 1) }, '-'),
    createElement('button', { onClick: () => setCount(count + 1) }, '+')
  );
}

// 使用我们的虚拟DOM库渲染
const vNode = createElement(
  'div',
  { className: 'app' },
  createElement('h1', {}, 'Virtual DOM Example'),
  createElement(Counter, { initialCount: 0 }),
  createElement('p', {}, 'This is a simple implementation of Virtual DOM')
);

render(vNode, document.getElementById('root'));
*/

// 导出API
module.exports = {
  createElement,
  render,
  updateElement
}; 