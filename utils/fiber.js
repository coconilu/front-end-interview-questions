// 定义Fiber节点结构
class Fiber {
  constructor(tag, key, pendingProps) {
    // 节点类型
    this.tag = tag;
    // 唯一标识
    this.key = key;
    // 新的props
    this.pendingProps = pendingProps;
    // 旧的props
    this.memoizedProps = null;
    // 旧的state
    this.memoizedState = null;

    // DOM节点
    this.stateNode = null;

    // Fiber关系
    this.return = null; // 父Fiber
    this.child = null; // 第一个子Fiber
    this.sibling = null; // 下一个兄弟Fiber
    this.index = 0;

    // 副作用标记
    this.effectTag = "NO_EFFECT";
    this.alternate = null; // 指向另一棵树中对应的Fiber

    // 更新队列
    this.updateQueue = null;
  }
}

// 工作循环相关变量
let nextUnitOfWork = null; // 下一个工作单元
let workInProgressRoot = null; // 当前正在构建的Fiber树根节点
let currentRoot = null; // 当前页面上对应的Fiber树
let deletions = []; // 需要删除的节点

// Fiber节点类型
const HOST_COMPONENT = "host";
const CLASS_COMPONENT = "class";
const FUNCTION_COMPONENT = "function";
const HOST_ROOT = "root";

// 副作用标记
const PLACEMENT = "PLACEMENT";
const UPDATE = "UPDATE";
const DELETION = "DELETION";

// 模拟React.createElement
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child),
      ),
    },
  };
}

// 创建文本元素
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 调度更新的入口函数
function scheduleUpdate(fiber, element) {
  // 创建更新对象
  const update = {
    element,
    next: null,
  };

  // 将更新添加到队列
  const updateQueue = fiber.updateQueue || { first: null, last: null };
  if (updateQueue.last === null) {
    updateQueue.first = update;
    updateQueue.last = update;
  } else {
    updateQueue.last.next = update;
    updateQueue.last = update;
  }
  fiber.updateQueue = updateQueue;

  // 如果当前没有工作进行中，则开始工作循环
  if (!nextUnitOfWork && currentRoot) {
    // 基于currentRoot创建workInProgress树
    nextUnitOfWork = createWorkInProgress(currentRoot, null);
    workInProgressRoot = nextUnitOfWork;
    console.log("触发更新: 创建workInProgress树");
  }

  // 请求调度
  requestIdleCallback(workLoop);
}

// 创建workInProgress Fiber
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;

  // 如果alternate不存在，则创建新的fiber
  if (!workInProgress) {
    workInProgress = new Fiber(
      current.tag,
      current.key,
      pendingProps || current.pendingProps,
    );

    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用已有alternate，更新pendingProps
    workInProgress.pendingProps = pendingProps || current.pendingProps;
    workInProgress.effectTag = "NO_EFFECT";
    workInProgress.child = null;
    workInProgress.sibling = null;
  }

  // 从current复制状态
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.updateQueue = current.updateQueue;

  return workInProgress;
}

// 工作循环，在浏览器空闲时执行
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // 执行当前工作单元并获取下一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果没有下一个工作单元且workInProgressRoot存在，说明协调阶段完成，进入提交阶段
  if (!nextUnitOfWork && workInProgressRoot) {
    console.log("协调阶段完成，开始提交阶段");
    commitRoot();
  }

  // 如果还有工作要做，继续调度
  if (nextUnitOfWork) {
    requestIdleCallback(workLoop);
  }
}

// 执行单个工作单元
function performUnitOfWork(fiber) {
  // 处理当前fiber节点
  console.log(`处理Fiber: ${fiber.key || fiber.tag}`);

  // 根据fiber类型进行不同的处理
  if (fiber.tag === HOST_COMPONENT) {
    updateHostComponent(fiber);
  } else if (fiber.tag === CLASS_COMPONENT) {
    updateClassComponent(fiber);
  } else if (fiber.tag === FUNCTION_COMPONENT) {
    updateFunctionComponent(fiber);
  } else if (fiber.tag === HOST_ROOT) {
    updateHostRoot(fiber);
  }

  // 返回下一个工作单元
  // 1. 如果有子节点，返回子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 2. 如果没有子节点，查找兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 3. 如果没有兄弟节点，返回父节点的兄弟节点
    nextFiber = nextFiber.return;
  }

  return null;
}

// 更新Host组件（普通DOM元素）
function updateHostComponent(fiber) {
  // 如果没有DOM节点，创建DOM节点
  if (!fiber.stateNode) {
    if (fiber.type === "TEXT_ELEMENT") {
      fiber.stateNode = document.createTextNode("");
    } else {
      fiber.stateNode = document.createElement(fiber.type);
    }
  }

  // 处理子元素，创建子Fiber
  reconcileChildren(fiber, fiber.pendingProps.children);
}

// 更新类组件
function updateClassComponent(fiber) {
  const instance = fiber.stateNode || new fiber.type(fiber.pendingProps);
  fiber.stateNode = instance;

  // 处理更新队列
  processUpdateQueue(fiber);

  // 获取新的子元素
  const nextChildren = [instance.render()];
  reconcileChildren(fiber, nextChildren);
}

// 更新函数组件
function updateFunctionComponent(fiber) {
  // 处理更新队列
  processUpdateQueue(fiber);

  // 执行函数组件，获取新的子元素
  const nextChildren = [fiber.type(fiber.pendingProps)];
  reconcileChildren(fiber, nextChildren);
}

// 更新根节点
function updateHostRoot(fiber) {
  // 处理更新队列
  processUpdateQueue(fiber);

  // 获取新的子元素
  const nextChildren = fiber.memoizedState ? [fiber.memoizedState] : [];
  reconcileChildren(fiber, nextChildren);
}

// 处理更新队列
function processUpdateQueue(fiber) {
  const updateQueue = fiber.updateQueue;
  if (!updateQueue) return;

  // 遍历更新队列，应用更新
  let update = updateQueue.first;
  while (update) {
    fiber.memoizedState = update.element;
    update = update.next;
  }

  // 重置更新队列
  fiber.updateQueue = { first: null, last: null };
}

// 协调子节点（Diff算法的简化版）
function reconcileChildren(returnFiber, newChildren) {
  console.log("进行协调: 比较新旧子节点");

  // 获取旧的第一个子Fiber
  let oldFiber = returnFiber.alternate ? returnFiber.alternate.child : null;
  let prevSibling = null;
  let newIndex = 0;

  // 遍历新的子元素，与旧Fiber比较
  while (newIndex < newChildren.length || oldFiber) {
    const newChild = newChildren[newIndex];
    let newFiber = null;

    // 同一位置的新旧节点
    const sameType = oldFiber && newChild && oldFiber.type === newChild.type;

    // 如果类型相同，复用节点（更新）
    if (sameType) {
      newFiber = new Fiber(oldFiber.tag, oldFiber.key, newChild.props);
      newFiber.type = oldFiber.type;
      newFiber.stateNode = oldFiber.stateNode;
      newFiber.alternate = oldFiber;
      oldFiber.alternate = newFiber;
      newFiber.effectTag = UPDATE;
    }

    // 如果类型不同但有新节点，创建新节点（添加）
    if (!sameType && newChild) {
      const tag =
        typeof newChild.type === "function"
          ? newChild.type.prototype && newChild.type.prototype.isReactComponent
            ? CLASS_COMPONENT
            : FUNCTION_COMPONENT
          : HOST_COMPONENT;

      newFiber = new Fiber(tag, newChild.key, newChild.props);
      newFiber.type = newChild.type;
      newFiber.effectTag = PLACEMENT;
    }

    // 如果类型不同且有旧节点，删除旧节点
    if (!sameType && oldFiber) {
      oldFiber.effectTag = DELETION;
      deletions.push(oldFiber);
    }

    // 移动oldFiber指针
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 将新创建的Fiber添加到Fiber树中
    if (newFiber) {
      newFiber.return = returnFiber;

      if (!prevSibling) {
        returnFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
    }

    newIndex++;
  }
}

// 提交阶段：将变更应用到DOM
function commitRoot() {
  // 首先处理需要删除的节点
  deletions.forEach(commitWork);

  // 提交workInProgressRoot的所有子节点
  if (workInProgressRoot.child) {
    commitWork(workInProgressRoot.child);
  }

  // workInProgress树切换为current树
  console.log("提交阶段完成：workInProgress树切换为current树");
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
  deletions = [];
}

// 递归提交单个Fiber节点的工作
function commitWork(fiber) {
  if (!fiber) return;

  // 找到父级DOM节点
  let parentFiber = fiber.return;
  while (parentFiber && !parentFiber.stateNode) {
    parentFiber = parentFiber.return;
  }

  const parentDom = parentFiber ? parentFiber.stateNode : null;

  // 根据effectTag执行不同操作
  if (fiber.effectTag === PLACEMENT && fiber.stateNode) {
    // 新增节点
    console.log(`添加节点: ${fiber.key || fiber.tag}`);
    parentDom.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === UPDATE && fiber.stateNode) {
    // 更新节点
    console.log(`更新节点: ${fiber.key || fiber.tag}`);
    updateDomProperties(
      fiber.stateNode,
      fiber.memoizedProps,
      fiber.pendingProps,
    );
  } else if (fiber.effectTag === DELETION) {
    // 删除节点
    console.log(`删除节点: ${fiber.key || fiber.tag}`);
    commitDeletion(fiber, parentDom);
    return; // 删除后不需要继续处理子节点
  }

  // 保存已处理的props
  fiber.memoizedProps = fiber.pendingProps;

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 更新DOM属性
function updateDomProperties(dom, prevProps, nextProps) {
  // 移除旧的事件监听器和属性
  Object.keys(prevProps).forEach((name) => {
    if (name !== "children" && !(name in nextProps)) {
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      } else {
        dom[name] = "";
      }
    }
  });

  // 设置新的事件监听器和属性
  Object.keys(nextProps).forEach((name) => {
    if (name !== "children" && prevProps[name] !== nextProps[name]) {
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        // 移除旧的事件监听器
        if (prevProps[name]) {
          dom.removeEventListener(eventType, prevProps[name]);
        }
        // 添加新的事件监听器
        dom.addEventListener(eventType, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    }
  });
}

// 递归删除节点
function commitDeletion(fiber, parentDom) {
  if (fiber.stateNode) {
    parentDom.removeChild(fiber.stateNode);
  } else {
    // 如果当前fiber没有DOM节点，递归查找子节点
    commitDeletion(fiber.child, parentDom);
  }
}

// 创建并渲染应用的根节点
function render(element, container) {
  // 如果是第一次渲染，创建根Fiber
  if (!currentRoot) {
    // 创建根Fiber
    const rootFiber = new Fiber(HOST_ROOT, null, { children: [element] });
    rootFiber.stateNode = container;

    // 设置为当前工作的根节点
    currentRoot = rootFiber;
    nextUnitOfWork = rootFiber;
    workInProgressRoot = rootFiber;

    // 开始工作循环
    requestIdleCallback(workLoop);
  } else {
    // 如果不是第一次渲染，进行更新
    scheduleUpdate(currentRoot, element);
  }
}

// 模拟React API
const React = {
  createElement,
  Component: class Component {
    constructor(props) {
      this.props = props;
      this.state = {};
    }

    setState(partialState) {
      this.state = { ...this.state, ...partialState };
      // 触发更新
      scheduleUpdate(this._fiber, null);
    }
  },
};

const ReactDOM = {
  render,
};

// 导出模块
window.React = React;
window.ReactDOM = ReactDOM;

// 使用示例
function App() {
  return React.createElement(
    "div",
    { id: "app" },
    React.createElement("h1", null, "Fiber架构演示"),
    React.createElement("p", null, "这是一个简化的React Fiber实现"),
  );
}

// 在页面加载完成后渲染
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    ReactDOM.render(React.createElement(App), container);

    // 模拟更新
    setTimeout(() => {
      console.log("------- 触发更新 -------");
      const updatedElement = React.createElement(
        "div",
        { id: "app" },
        React.createElement("h1", null, "Fiber架构演示（已更新）"),
        React.createElement("p", null, "这是一个更新后的React Fiber实现"),
        React.createElement("button", null, "点击我"),
      );

      ReactDOM.render(updatedElement, container);
    }, 2000);
  }
});
