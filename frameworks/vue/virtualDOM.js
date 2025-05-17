/**
 * Vue 虚拟DOM (Virtual DOM)
 *
 * 面试题：请解释Vue中虚拟DOM的工作原理，并手写一个简单的虚拟DOM结构实现
 */

/**
 * 1. 虚拟DOM基本概念
 * 
 * 虚拟DOM(Virtual DOM)是对真实DOM的JavaScript对象表示。
 * 在Vue中，它作为真实DOM和开发者编写的模板之间的一个缓冲层，
 * 通过diff算法高效地计算出最小DOM操作，从而提升性能。
 */

/**
 * 2. Vue中的VNode结构
 * 
 * 下面是Vue中虚拟DOM节点(VNode)的简化结构
 */
const VNodeExample = {
  tag: 'div',           // 标签名
  data: {               // 节点属性、样式、事件等数据
    attrs: {
      id: 'app'
    },
    staticClass: 'container',
    on: {
      click: () => console.log('clicked')
    }
  },
  children: [           // 子节点数组
    {
      tag: 'h1',
      data: {
        staticClass: 'title'
      },
      children: [
        {
          tag: undefined,  // 文本节点没有tag
          text: '标题文本'  // 文本内容
        }
      ]
    },
    {
      tag: 'p',
      data: {
        staticClass: 'content'
      },
      children: [
        {
          tag: undefined,
          text: '这是段落内容'
        }
      ]
    }
  ],
  text: undefined,      // 如果是文本节点，这里会有值
  elm: null,            // 对应的真实DOM元素引用
  context: {},          // VNode的上下文，Vue实例
  componentOptions: {}  // 组件VNode特有的选项
};

/**
 * 3. 简单的虚拟DOM实现
 */

// 创建虚拟DOM节点
function createElement(tag, props = {}, ...children) {
  return {
    tag,
    props,
    children: children.flat().map(child => 
      typeof child === 'string' || typeof child === 'number'
        ? createTextNode(child)
        : child
    )
  };
}

// 创建文本节点
function createTextNode(text) {
  return {
    tag: null,
    props: {},
    children: [],
    text
  };
}

// 将虚拟DOM渲染为真实DOM
function render(vnode, container) {
  const el = document.createElement(vnode.tag);
  
  // 处理属性
  const { props } = vnode;
  Object.keys(props).forEach(key => {
    if (key.startsWith('on')) {
      // 事件处理
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, props[key]);
    } else {
      // 普通属性
      el.setAttribute(key, props[key]);
    }
  });
  
  // 处理子节点
  vnode.children.forEach(child => {
    if (child.tag) {
      // 如果是元素节点，递归渲染
      render(child, el);
    } else {
      // 如果是文本节点
      el.appendChild(document.createTextNode(child.text));
    }
  });
  
  // 添加到容器
  container.appendChild(el);
  
  // 保存真实DOM引用
  vnode.el = el;
  
  return el;
}

// 简单的diff算法实现
function diff(oldVNode, newVNode) {
  // 节点类型不同，直接替换
  if (oldVNode.tag !== newVNode.tag) {
    const parent = oldVNode.el.parentNode;
    const newEl = render(newVNode, document.createElement('div'));
    parent.replaceChild(newEl, oldVNode.el);
    return newVNode;
  }
  
  // 文本节点特殊处理
  if (!oldVNode.tag && !newVNode.tag) {
    if (oldVNode.text !== newVNode.text) {
      oldVNode.el.nodeValue = newVNode.text;
    }
    newVNode.el = oldVNode.el;
    return newVNode;
  }
  
  // 节点类型相同，更新属性
  const el = newVNode.el = oldVNode.el;
  
  // 更新属性
  const oldProps = oldVNode.props || {};
  const newProps = newVNode.props || {};
  
  // 添加新属性
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, oldProps[key]);
        el.addEventListener(eventName, newProps[key]);
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }
  
  // 删除旧属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, oldProps[key]);
      } else {
        el.removeAttribute(key);
      }
    }
  }
  
  // 递归对比子节点
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;
  
  // 简化实现：只考虑相同数量子节点的情况
  const len = Math.min(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < len; i++) {
    diff(oldChildren[i], newChildren[i]);
  }
  
  // 处理新增子节点
  if (newChildren.length > oldChildren.length) {
    newChildren.slice(oldChildren.length).forEach(child => {
      render(child, el);
    });
  }
  
  // 处理需要删除的子节点
  if (oldChildren.length > newChildren.length) {
    oldChildren.slice(newChildren.length).forEach(child => {
      el.removeChild(child.el);
    });
  }
  
  return newVNode;
}

/**
 * 4. 使用示例
 */

// 创建初始虚拟DOM树
const initialVDOM = createElement('div', { id: 'app', class: 'container' },
  createElement('h1', { class: 'title' }, '虚拟DOM示例'),
  createElement('p', { class: 'content' }, '这是一个简单的虚拟DOM实现')
);

// 模拟更新后的虚拟DOM树
const updatedVDOM = createElement('div', { id: 'app', class: 'container active' },
  createElement('h1', { class: 'title highlighted' }, '虚拟DOM示例(已更新)'),
  createElement('p', { class: 'content' }, '这是一个简单的虚拟DOM实现'),
  createElement('button', { onClick: () => alert('点击了按钮') }, '点击我')
);

/**
 * 5. 面试题相关知识点
 */

/**
 * 问题1: Vue中的虚拟DOM与React的虚拟DOM有何区别?
 * 
 * 答案:
 * 1. Vue的模板是基于HTML的扩展，而React使用JSX
 * 2. Vue的虚拟DOM实现包含更多的优化:
 *    - 静态内容提升: 对不变的内容进行提升，减少比对
 *    - 静态树提升: 对不变的子树进行整体提升
 *    - 缓存事件处理函数: 避免不必要的重新渲染
 * 3. Vue3在编译时会生成Block Tree，提供更精确的DOM更新提示
 */

/**
 * 问题2: 为什么虚拟DOM比直接操作真实DOM性能更好?
 * 
 * 答案:
 * 1. 批量更新: 虚拟DOM可以将多次更新合并为一次真实DOM操作
 * 2. 减少回流重绘: 通过diff算法计算出最小化的DOM变更
 * 3. 跨平台: 虚拟DOM是JS对象，可以在不同环境中进行渲染(浏览器、服务器、原生应用等)
 * 4. 声明式编程: 开发者只需关注状态变化，不需要手动操作DOM
 */

/**
 * 问题3: 简述虚拟DOM的diff算法原理
 * 
 * 答案:
 * Vue的diff算法基于以下假设和策略:
 * 1. 同层比较: 只比较同一层级的节点，不跨层级比较
 * 2. 标签不同则直接替换: 如果新旧节点的标签不同，则直接替换整个节点
 * 3. 列表比较时使用key: 通过key标识来重用节点，提高列表更新性能
 * 4. 采用双端比较算法: Vue2中使用双端比较，Vue3使用更快的算法
 */

/**
 * 问题4: 如何自己实现一个简单的虚拟DOM库?
 * 
 * 答案:
 * 一个简单的虚拟DOM库需要实现以下功能:
 * 1. createElement函数: 创建虚拟DOM节点
 * 2. render函数: 将虚拟DOM渲染为真实DOM
 * 3. diff算法: 对比新旧虚拟DOM树，计算最小更新
 * 4. patch函数: 根据diff结果更新真实DOM
 * (参考上面的实现示例)
 */

/**
 * 问题5: Vue3在虚拟DOM方面做了哪些优化?
 * 
 * 答案:
 * 1. 静态提升(Static Hoisting): 将静态节点提升到render函数外
 * 2. 预字符串化(Pre-Stringification): 对静态节点进行字符串化处理
 * 3. 缓存处理程序(Cached Handlers): 缓存内联处理程序
 * 4. 块树(Block Tree): 跟踪动态节点，减少比对范围
 * 5. 基于Proxy的响应式系统: 提高数据变化检测的性能
 */

// 模拟Vue3中的虚拟DOM节点结构(更加紧凑高效)
const Vue3VNodeExample = {
  type: 'div',        // 标签或组件
  props: {            // 所有属性
    id: 'app',
    class: 'container',
    onClick: () => {}
  },
  children: [         // 子节点
    {
      type: 'h1',
      props: { class: 'title' },
      children: '标题文本'  // 简单文本可以直接使用字符串
    },
    {
      type: 'p',
      props: null,
      children: [
        { type: 'span', props: null, children: '段落内容' }
      ]
    }
  ],
  patchFlag: 1,        // 标记动态节点(Vue3特有)
  dynamicProps: ['onClick'], // 动态属性列表(Vue3特有)
  cacheHandlers: true  // 是否缓存事件处理程序(Vue3特有)
};

// 导出模块
module.exports = {
  createElement,
  render,
  diff,
  VNodeExample,
  Vue3VNodeExample
}; 