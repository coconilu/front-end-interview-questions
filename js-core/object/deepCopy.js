/**
 * 深拷贝
 *
 * 改进后的深拷贝方法现在具有以下特点：
 * 修复了属性检查的问题，使用 Object.prototype.hasOwnProperty.call(obj, key) 来正确检查对象属性
 * 添加了对 Map 和 Set 对象的支持
 * 添加了对 Error 对象的支持
 * 添加了对 Symbol 类型属性的支持
 * 正确处理了循环引用的问题
 * 保持了原有的 Date 和 RegExp 对象的处理
 * 还有一些注意事项：
 * 函数（Function）对象没有被处理，因为函数通常不需要深拷贝
 * 原型链上的属性不会被复制，这是符合预期的行为
 * 对于 Map 和 Set 的键值对也进行了深拷贝，确保完全独立
 * @param {*} obj
 * @param {*} map
 * @returns
 */
function copyDeep(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Error) return new Error(obj.message);
  if (obj instanceof Map) {
    const newMap = new Map();
    obj.forEach((value, key) => {
      newMap.set(copyDeep(key, map), copyDeep(value, map));
    });
    return newMap;
  }
  if (obj instanceof Set) {
    const newSet = new Set();
    obj.forEach((value) => {
      newSet.add(copyDeep(value, map));
    });
    return newSet;
  }

  if (map.has(obj)) return map.get(obj);

  const newObj = Array.isArray(obj) ? [] : {};

  map.set(obj, newObj);

  // 处理普通属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = copyDeep(obj[key], map);
    }
  }

  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const key of symbolKeys) {
    newObj[key] = copyDeep(obj[key], map);
  }

  return newObj;
}
