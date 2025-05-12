/**
 * 图片懒加载实现
 * 
 * 面试题：实现图片懒加载的多种方式
 */

/**
 * 1. 使用滚动事件 + getBoundingClientRect 实现懒加载
 * @param {string} selector - 图片选择器
 */
function lazyLoadWithScroll(selector = 'img.lazy') {
  // 获取所有需要懒加载的图片
  const lazyImages = document.querySelectorAll(selector);
  
  // 检查图片是否在视口中
  function checkIfInView() {
    lazyImages.forEach(image => {
      // 已经加载过的图片跳过
      if (image.dataset.loaded === 'true') return;
      
      // 获取图片相对于视口的位置
      const rect = image.getBoundingClientRect();
      
      // 检查图片是否在视口中或接近视口
      const isInViewport = (
        rect.top <= window.innerHeight + 300 && // 预加载视口下方300px的图片
        rect.bottom >= 0 &&
        rect.left <= window.innerWidth &&
        rect.right >= 0
      );
      
      if (isInViewport) {
        // 加载图片
        loadImage(image);
      }
    });
  }
  
  // 加载图片
  function loadImage(image) {
    // 设置src属性为data-src的值
    const src = image.dataset.src;
    if (!src) return;
    
    // 图片加载完成后的处理
    image.onload = function() {
      image.classList.remove('lazy');
      image.classList.add('loaded');
      image.dataset.loaded = 'true';
    };
    
    // 设置图片源
    image.src = src;
  }
  
  // 添加滚动事件监听
  function setupLazyLoad() {
    // 首次检查
    checkIfInView();
    
    // 添加节流处理的滚动事件监听
    let timeout;
    window.addEventListener('scroll', () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      
      timeout = window.requestAnimationFrame(() => {
        checkIfInView();
      });
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkIfInView);
    window.addEventListener('orientationchange', checkIfInView);
  }
  
  // 初始化
  setupLazyLoad();
}

/**
 * 2. 使用Intersection Observer API实现懒加载
 * @param {string} selector - 图片选择器
 */
function lazyLoadWithIntersectionObserver(selector = 'img.lazy') {
  // 检查浏览器是否支持Intersection Observer
  if (!('IntersectionObserver' in window)) {
    // 降级处理，使用传统方法
    lazyLoadWithScroll(selector);
    return;
  }
  
  // 获取所有需要懒加载的图片
  const lazyImages = document.querySelectorAll(selector);
  
  // 加载图片
  function loadImage(image) {
    const src = image.dataset.src;
    if (!src) return;
    
    image.onload = function() {
      image.classList.remove('lazy');
      image.classList.add('loaded');
      image.dataset.loaded = 'true';
    };
    
    image.src = src;
  }
  
  // 创建观察者实例
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      // 当图片进入视口
      if (entry.isIntersecting) {
        const image = entry.target;
        
        // 加载图片
        loadImage(image);
        
        // 停止观察已加载的图片
        observer.unobserve(image);
      }
    });
  }, {
    // 配置项
    rootMargin: '0px 0px 300px 0px', // 提前300px加载
    threshold: 0.01 // 当1%的图片进入视口时触发
  });
  
  // 观察所有图片
  lazyImages.forEach(image => {
    imageObserver.observe(image);
  });
}

/**
 * 3. 使用loading="lazy"属性实现原生懒加载
 * 注意：这是HTML属性，不是JavaScript实现
 * 
 * 示例:
 * <img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy" alt="Lazy loaded image">
 */
function nativeLazyLoading(selector = 'img.lazy') {
  // 检查浏览器是否支持原生懒加载
  const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;
  
  if (supportsNativeLazy) {
    // 获取所有需要懒加载的图片
    const lazyImages = document.querySelectorAll(selector);
    
    lazyImages.forEach(img => {
      // 设置原生懒加载属性
      img.loading = 'lazy';
      
      // 直接设置src（浏览器会自动懒加载）
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      
      img.classList.remove('lazy');
    });
  } else {
    // 降级处理，使用Intersection Observer
    lazyLoadWithIntersectionObserver(selector);
  }
}

/**
 * 4. 使用懒加载库实现（示例代码，实际项目中可以使用第三方库）
 */
function lazyLoadWithLibrary() {
  // 使用第三方库示例（如lazysizes）
  /*
  // 1. 引入lazysizes库
  // <script src="lazysizes.min.js"></script>
  
  // 2. HTML中使用特定的类名和属性
  // <img data-src="image.jpg" class="lazyload" alt="Lazy image">
  
  // 3. 库会自动处理懒加载
  */
  
  console.log('使用第三方懒加载库，如lazysizes');
}

/**
 * 完整的懒加载解决方案
 * @param {string} selector - 图片选择器
 */
function initLazyLoading(selector = 'img.lazy') {
  // 检查是否支持原生懒加载
  if ('loading' in HTMLImageElement.prototype) {
    nativeLazyLoading(selector);
  } 
  // 检查是否支持Intersection Observer
  else if ('IntersectionObserver' in window) {
    lazyLoadWithIntersectionObserver(selector);
  } 
  // 降级到传统滚动事件方法
  else {
    lazyLoadWithScroll(selector);
  }
}

// 使用示例
/*
document.addEventListener('DOMContentLoaded', () => {
  // 初始化懒加载
  initLazyLoading('img.lazy');
});

// HTML示例
// <img class="lazy" src="placeholder.jpg" data-src="actual-image.jpg" alt="Lazy loaded image">
*/

// 导出函数
module.exports = {
  lazyLoadWithScroll,
  lazyLoadWithIntersectionObserver,
  nativeLazyLoading,
  initLazyLoading
}; 