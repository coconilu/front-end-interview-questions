/**
 * 事件委托实现
 *
 * 面试题：实现一个通用的事件委托函数，支持元素选择器过滤
 */

/**
 * 事件委托函数
 * @param {HTMLElement} parent - 父元素
 * @param {string} eventType - 事件类型
 * @param {string} selector - CSS选择器
 * @param {Function} callback - 回调函数
 * @returns {Function} - 移除事件监听的函数
 */
function delegate(parent, eventType, selector, callback) {
  // 参数检查
  if (!parent || !(parent instanceof HTMLElement)) {
    throw new Error('Parent must be a valid HTML element');
  }

  if (!eventType || typeof eventType !== 'string') {
    throw new Error('Event type must be a valid string');
  }

  if (!selector || typeof selector !== 'string') {
    throw new Error('Selector must be a valid string');
  }

  if (!callback || typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  // 事件处理函数
  const eventHandler = function (event) {
    // 获取事件目标
    const target = event.target;

    // 查找匹配选择器的目标元素
    const potentialElements = Array.from(parent.querySelectorAll(selector));
    let elementFound = false;

    // 检查事件目标是否匹配选择器，或者是否是匹配选择器的元素的子元素
    let currentNode = target;

    while (currentNode && currentNode !== parent) {
      if (potentialElements.includes(currentNode)) {
        elementFound = true;
        break;
      }
      currentNode = currentNode.parentNode;
    }

    // 如果找到匹配的元素，调用回调函数
    if (elementFound) {
      // 将当前匹配的元素作为this传递给回调函数
      callback.call(currentNode, event, currentNode);
    }
  };

  // 添加事件监听
  parent.addEventListener(eventType, eventHandler);

  // 返回一个函数，用于移除事件监听
  return function removeListener() {
    parent.removeEventListener(eventType, eventHandler);
  };
}

/**
 * 简化版事件委托函数
 * @param {HTMLElement} parent - 父元素
 * @param {string} eventType - 事件类型
 * @param {string} selector - CSS选择器
 * @param {Function} callback - 回调函数
 */
function simpleDelegate(parent, eventType, selector, callback) {
  parent.addEventListener(eventType, function (event) {
    const target = event.target;

    // 使用Element.matches API检查目标是否匹配选择器
    if (target.matches(selector) || target.closest(selector)) {
      callback.call(target, event);
    }
  });
}

// 使用示例 (在浏览器环境中)
/*
// HTML结构
<ul id="parent-list">
  <li class="item">Item 1 <span class="delete">X</span></li>
  <li class="item">Item 2 <span class="delete">X</span></li>
  <li class="item">Item 3 <span class="delete">X</span></li>
  <li class="item">Item 4 <span class="delete">X</span></li>
  <li class="item">Item 5 <span class="delete">X</span></li>
</ul>

// 事件委托
document.addEventListener('DOMContentLoaded', function() {
  const parentList = document.getElementById('parent-list');
  
  // 点击项目
  delegate(parentList, 'click', '.item', function(event, element) {
    console.log('Item clicked:', element.textContent.trim());
  });
  
  // 点击删除按钮
  const removeDeleteListener = delegate(parentList, 'click', '.delete', function(event, element) {
    event.stopPropagation(); // 阻止事件冒泡到.item元素
    const item = element.closest('.item');
    console.log('Deleting item:', item.textContent.trim());
    item.remove();
  });
  
  // 移除事件监听示例
  // setTimeout(() => {
  //   console.log('Removing delete event listener');
  //   removeDeleteListener();
  // }, 5000);
});
*/

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    delegate,
    simpleDelegate,
  };
}
