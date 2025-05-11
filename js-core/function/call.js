/**
 * 实现 Function.prototype.call
 * 手动实现call方法，可以指定this和参数列表来调用函数。
 * @param {*} context 
 * @param  {...any} args 
 * @returns {*}
 */
Function.prototype.myCall = function(context, ...args) {
    // 处理context为null或undefined的情况
    context = context || window
    
    // 防止属性名冲突
    const fn = Symbol()
    
    // 将函数设为对象的属性
    context[fn] = this
    
    // 执行函数
    const result = context[fn](...args)
    
    // 删除临时属性
    delete context[fn]
    
    return result
} 