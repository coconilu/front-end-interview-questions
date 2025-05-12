/**
 * DOM树遍历方法
 *
 * 面试题：实现多种DOM树遍历方法，包括深度优先和广度优先
 */

/**
 * 深度优先遍历DOM树 (递归实现)
 * @param {HTMLElement} root - 根节点
 * @param {Function} callback - 回调函数，接收当前节点作为参数
 */
function traverseDOMDepthFirstRecursive(root, callback) {
  if (!root) return;

  // 处理当前节点
  callback(root);

  // 遍历所有子节点
  const children = root.children;
  for (let i = 0; i < children.length; i++) {
    traverseDOMDepthFirstRecursive(children[i], callback);
  }
}

/**
 * 深度优先遍历DOM树 (非递归实现，使用栈)
 * @param {HTMLElement} root - 根节点
 * @param {Function} callback - 回调函数，接收当前节点作为参数
 */
function traverseDOMDepthFirst(root, callback) {
  if (!root) return;

  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();

    // 处理当前节点
    callback(current);

    // 将子节点按照相反的顺序入栈，以保持从左到右的遍历顺序
    const children = current.children;
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }
}

/**
 * 广度优先遍历DOM树 (使用队列)
 * @param {HTMLElement} root - 根节点
 * @param {Function} callback - 回调函数，接收当前节点作为参数
 */
function traverseDOMBreadthFirst(root, callback) {
  if (!root) return;

  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift();

    // 处理当前节点
    callback(current);

    // 将所有子节点加入队列
    const children = current.children;
    for (let i = 0; i < children.length; i++) {
      queue.push(children[i]);
    }
  }
}

/**
 * 按照特定条件查找DOM元素 (深度优先)
 * @param {HTMLElement} root - 根节点
 * @param {Function} predicate - 判断函数，返回true表示找到目标元素
 * @returns {HTMLElement|null} - 找到的元素或null
 */
function findElementDepthFirst(root, predicate) {
  if (!root) return null;

  // 检查当前节点
  if (predicate(root)) {
    return root;
  }

  // 遍历子节点
  const children = root.children;
  for (let i = 0; i < children.length; i++) {
    const found = findElementDepthFirst(children[i], predicate);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * 获取DOM树中所有文本内容 (忽略script和style标签)
 * @param {HTMLElement} root - 根节点
 * @returns {string} - 所有文本内容
 */
function getAllTextContent(root) {
  if (!root) return "";

  // 如果是script或style标签，忽略内容
  if (root.tagName === "SCRIPT" || root.tagName === "STYLE") {
    return "";
  }

  let text = "";

  // 处理文本节点
  for (let i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent.trim() + " ";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += getAllTextContent(node);
    }
  }

  return text;
}

/**
 * 查找最近的共同父节点
 * @param {HTMLElement} node1 - 第一个节点
 * @param {HTMLElement} node2 - 第二个节点
 * @returns {HTMLElement|null} - 最近的共同父节点
 */
function findCommonAncestor(node1, node2) {
  if (!node1 || !node2) return null;

  // 获取第一个节点的所有祖先节点
  const ancestors = new Set();
  let current = node1;

  while (current) {
    ancestors.add(current);
    current = current.parentNode;
  }

  // 检查第二个节点的祖先是否在集合中
  current = node2;
  while (current) {
    if (ancestors.has(current)) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

// 使用示例 (在浏览器环境中)
/*
document.addEventListener('DOMContentLoaded', function() {
  const root = document.body;
  
  console.log('深度优先遍历 (递归):');
  traverseDOMDepthFirstRecursive(root, node => {
    console.log(node.tagName, node.className);
  });
  
  console.log('\n深度优先遍历 (非递归):');
  traverseDOMDepthFirst(root, node => {
    console.log(node.tagName, node.className);
  });
  
  console.log('\n广度优先遍历:');
  traverseDOMBreadthFirst(root, node => {
    console.log(node.tagName, node.className);
  });
  
  // 查找特定元素
  const button = findElementDepthFirst(root, node => 
    node.tagName === 'BUTTON' && node.className.includes('submit')
  );
  console.log('\n找到的按钮:', button);
  
  // 获取所有文本内容
  const allText = getAllTextContent(root);
  console.log('\n所有文本内容:', allText);
  
  // 查找共同祖先
  const elem1 = document.querySelector('.item1');
  const elem2 = document.querySelector('.item2');
  if (elem1 && elem2) {
    const ancestor = findCommonAncestor(elem1, elem2);
    console.log('\n共同祖先:', ancestor);
  }
});
*/

// 导出函数供其他模块使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    traverseDOMDepthFirstRecursive,
    traverseDOMDepthFirst,
    traverseDOMBreadthFirst,
    findElementDepthFirst,
    getAllTextContent,
    findCommonAncestor,
  };
}
