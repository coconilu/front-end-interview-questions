/**
 * 实现 Function.prototype.bind
 * 手动实现bind方法，返回一个新函数，并且可以预设this和部分参数。
 * @param {*} context
 * @returns {Function}
 */
Function.prototype.myBind = function (context, ...args1) {
  const fn = this;
  if (typeof fn !== "function") {
    throw new TypeError("只能对函数使用bind");
  }

  return function (...args2) {
    // 处理new调用的情况
    if (this instanceof fn) {
      return new fn(...args1, ...args2);
    }
    return fn.apply(context, [...args1, ...args2]);
  };
};
