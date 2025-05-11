/**
 * 实现 new 操作符
 * 手动实现JavaScript的new操作符功能。
 * @param {Function} constructor 构造函数
 * @param {...any} args 构造函数参数
 * @returns {Object}
 */
function myNew(constructor, ...args) {
    // 创建一个新对象，原型指向构造函数的prototype
    const obj = Object.create(constructor.prototype)
    
    // 执行构造函数，并将this指向新对象
    const result = constructor.apply(obj, args)
    
    // 如果构造函数返回的是对象则返回该对象，否则返回创建的新对象
    return (typeof result === 'object' && result !== null) ? result : obj
} 