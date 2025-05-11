/**
 * 实现 Object.create
 * 手动实现JavaScript的Object.create方法。
 * @param {Object} proto 指定原型对象
 * @param {Object} propertiesObject 属性描述对象
 * @returns {Object}
 */
function myObjectCreate(proto, propertiesObject) {
    if (typeof proto !== 'object' && typeof proto !== 'function') {
        throw new TypeError('参数必须是对象或null')
    }
    
    // 创建一个空的构造函数
    function F() {}
    
    // 设置原型
    F.prototype = proto
    
    // 创建实例
    const obj = new F()
    
    // 如果有第二个参数，添加属性
    if (propertiesObject !== undefined) {
        Object.defineProperties(obj, propertiesObject)
    }
    
    return obj
} 