/**
 * 实现 instanceof 操作符
 * 手动实现JavaScript的instanceof操作符。
 * @param {Object} obj 要检测的对象
 * @param {Function} constructor 构造函数
 * @returns {boolean}
 */
function myInstanceOf(obj, constructor) {
  // 基本类型直接返回false
  if (obj === null || typeof obj !== 'object') return false;

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);

  // 递归查找原型链
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}
