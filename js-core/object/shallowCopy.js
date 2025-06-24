/**
 * 浅拷贝
 * 实现一个简单的浅拷贝函数，只复制对象的第一层属性。
 * @param {Object} obj
 * @returns {Object}
 */
function shallowCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  return Array.isArray(obj) ? obj.slice() : { ...obj };
}
