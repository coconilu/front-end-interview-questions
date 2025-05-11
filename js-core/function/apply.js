/**
 * 实现 Function.prototype.apply
 * 手动实现apply方法，可以指定this和参数数组来调用函数。
 * @param {*} context 
 * @param {Array} args 
 * @returns {*}
 */
Function.prototype.myApply = function(context, args) {
    // 处理context为null或undefined的情况
    context = context || window
    
    // 检查参数是否为数组或类数组
    if (args && !Array.isArray(args) && !('length' in args)) {
        throw new TypeError('第二个参数必须是数组或类数组对象')
    }
    
    // 防止属性名冲突
    const fn = Symbol()
    
    // 将函数设为对象的属性
    context[fn] = this
    
    // 执行函数
    const result = context[fn](...(args || []))
    
    // 删除临时属性
    delete context[fn]
    
    return result
} 