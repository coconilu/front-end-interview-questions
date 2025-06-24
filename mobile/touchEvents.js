/**
 * 移动端触摸事件处理
 *
 * 移动端触摸事件与桌面端鼠标事件的区别：
 * 1. 移动端有touch事件（touchstart, touchmove, touchend, touchcancel）
 * 2. 触摸事件可以同时触发多个触摸点（多点触控）
 * 3. 移动端点击有300ms延迟问题
 */

/**
 * 触摸事件基础用法示例
 */
function basicTouchEvents() {
  const element = document.getElementById('touch-area');

  // 触摸开始事件
  element.addEventListener('touchstart', function (e) {
    console.log('Touch started');

    // 阻止默认行为（防止滚动、缩放等）
    e.preventDefault();

    // 获取触摸点信息
    const touch = e.touches[0];
    console.log(`Touch position: (${touch.clientX}, ${touch.clientY})`);

    // 获取所有触摸点
    console.log(`Total touches: ${e.touches.length}`);
  });

  // 触摸移动事件
  element.addEventListener('touchmove', function (e) {
    console.log('Touch moved');

    // 获取触摸点信息
    const touch = e.touches[0];
    console.log(`Touch position: (${touch.clientX}, ${touch.clientY})`);

    // 性能优化：使用requestAnimationFrame
    requestAnimationFrame(() => {
      // 更新UI
    });
  });

  // 触摸结束事件
  element.addEventListener('touchend', function (e) {
    console.log('Touch ended');

    // 注意：touchend事件中，结束的触摸点会从e.touches中移除
    // 但可以通过e.changedTouches获取刚结束的触摸点
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      console.log(`Last touch position: (${touch.clientX}, ${touch.clientY})`);
    }
  });

  // 触摸取消事件（如触摸被系统打断）
  element.addEventListener('touchcancel', function (e) {
    console.log('Touch cancelled');
  });
}

/**
 * 解决移动端点击300ms延迟问题
 */
function solveTouchDelay() {
  // 方法1：使用touchend模拟点击
  function fastClick(element, callback) {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    const MAX_TOUCH_TIME = 300; // 最大触摸时间
    const MAX_TOUCH_MOVE = 10; // 最大移动距离

    element.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    });

    element.addEventListener('touchend', function (e) {
      const touchTime = Date.now() - touchStartTime;

      // 确保是单点触摸且触摸时间短
      if (e.changedTouches.length === 1 && touchTime < MAX_TOUCH_TIME) {
        const touch = e.changedTouches[0];

        // 确保没有明显移动（防止滑动误触）
        const moveX = Math.abs(touch.clientX - touchStartX);
        const moveY = Math.abs(touch.clientY - touchStartY);

        if (moveX < MAX_TOUCH_MOVE && moveY < MAX_TOUCH_MOVE) {
          // 触发回调
          callback(e);

          // 阻止默认的click事件
          e.preventDefault();
        }
      }
    });
  }

  // 使用示例
  const button = document.getElementById('fast-button');
  fastClick(button, function (e) {
    console.log('Fast click triggered!');
  });

  // 方法2：使用现代解决方案
  // 1. 使用viewport meta标签
  // <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

  // 2. 使用CSS touch-action属性
  // button { touch-action: manipulation; }

  // 3. 使用第三方库如FastClick
  // if ('addEventListener' in document) {
  //   document.addEventListener('DOMContentLoaded', function() {
  //     FastClick.attach(document.body);
  //   }, false);
  // }
}

/**
 * 实现简单的滑动检测
 */
function detectSwipe(element, callback) {
  let startX, startY, endX, endY;
  const MIN_DISTANCE = 50; // 最小滑动距离
  const MAX_TIME = 300; // 最大滑动时间
  let startTime;

  element.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }
  });

  element.addEventListener('touchend', function (e) {
    if (e.changedTouches.length === 1) {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // 确保滑动时间不太长
      if (deltaTime <= MAX_TIME) {
        let direction = '';

        // 判断水平方向
        if (Math.abs(deltaX) >= MIN_DISTANCE) {
          direction = deltaX > 0 ? 'right' : 'left';
        }

        // 判断垂直方向（如果水平滑动距离不够）
        else if (Math.abs(deltaY) >= MIN_DISTANCE) {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        // 如果检测到滑动方向，触发回调
        if (direction) {
          callback(direction, {
            deltaX,
            deltaY,
            deltaTime,
          });
        }
      }
    }
  });
}

/**
 * 实现简单的缩放手势
 */
function detectPinchZoom(element, callback) {
  let startDistance = 0;
  let currentDistance = 0;

  function getDistance(touches) {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  element.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      startDistance = getDistance(e.touches);
    }
  });

  element.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      currentDistance = getDistance(e.touches);

      // 计算缩放比例
      const scale = currentDistance / startDistance;

      callback({
        scale,
        center: {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        },
      });

      e.preventDefault(); // 阻止默认的缩放行为
    }
  });
}

/**
 * 移动端事件最佳实践
 */
function touchEventsBestPractices() {
  // 1. 使用passive: true提高滚动性能
  document.addEventListener(
    'touchstart',
    function (e) {
      // 处理触摸事件
    },
    { passive: true }
  );

  // 2. 减少touchmove事件处理频率
  let ticking = false;
  document.addEventListener('touchmove', function (e) {
    if (!ticking) {
      requestAnimationFrame(function () {
        // 处理触摸移动
        ticking = false;
      });
      ticking = true;
    }
  });

  // 3. 使用指针事件统一处理鼠标和触摸
  document.addEventListener('pointerdown', function (e) {
    // 处理指针按下事件
    console.log(`Pointer type: ${e.pointerType}`); // touch, mouse, pen
  });

  // 4. 触摸事件的事件委托
  document.body.addEventListener('touchstart', function (e) {
    const target = e.target;
    if (target.classList.contains('touch-item')) {
      // 处理特定元素的触摸
    }
  });
}

/**
 * 移动端常见手势库对比
 *
 * 1. Hammer.js - 最流行的手势库
 * 2. ZingTouch - 现代手势库，支持自定义手势
 * 3. AlloyFinger - 轻量级手势库
 */
function gestureLibraries() {
  // Hammer.js 示例
  /*
  const hammer = new Hammer(document.getElementById('gesture-area'));
  
  // 添加手势识别
  hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }));
  hammer.add(new Hammer.Pinch());
  hammer.add(new Hammer.Swipe());
  hammer.add(new Hammer.Tap());
  
  // 监听手势
  hammer.on('pan', function(e) {
    console.log(`Pan: ${e.deltaX}, ${e.deltaY}`);
  });
  
  hammer.on('pinch', function(e) {
    console.log(`Pinch: ${e.scale}`);
  });
  
  hammer.on('swipe', function(e) {
    console.log(`Swipe direction: ${e.direction}`);
  });
  
  hammer.on('tap', function(e) {
    console.log('Tap detected');
  });
  */
}

// 导出函数
module.exports = {
  basicTouchEvents,
  solveTouchDelay,
  detectSwipe,
  detectPinchZoom,
  touchEventsBestPractices,
  gestureLibraries,
};
