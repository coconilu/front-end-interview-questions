/**
 * 函数柯里化
 * 实现一个 curry 函数，将多参数函数转化为单参数函数的链式调用。
 * @param {Function} fn
 * @returns {Function}
 */
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function (...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}
