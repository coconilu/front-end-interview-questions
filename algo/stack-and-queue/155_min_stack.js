/**
 * 155. 最小栈
 * 
 * 设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。
 * 
 * push(x) —— 将元素 x 推入栈中。
 * pop() —— 删除栈顶的元素。
 * top() —— 获取栈顶元素。
 * getMin() —— 检索栈中的最小元素。
 * 
 * 示例:
 * 输入：
 * ["MinStack","push","push","push","getMin","pop","top","getMin"]
 * [[],[-2],[0],[-3],[],[],[],[]]
 * 
 * 输出：
 * [null,null,null,null,-3,null,0,-2]
 * 
 * 解释：
 * MinStack minStack = new MinStack();
 * minStack.push(-2);
 * minStack.push(0);
 * minStack.push(-3);
 * minStack.getMin();   --> 返回 -3.
 * minStack.pop();
 * minStack.top();      --> 返回 0.
 * minStack.getMin();   --> 返回 -2.
 */

/**
 * 使用辅助栈实现
 */
var MinStack = function() {
    this.stack = [];
    this.minStack = [Infinity]; // 辅助栈，用于存储最小值
};

/** 
 * @param {number} x
 * @return {void}
 */
MinStack.prototype.push = function(x) {
    this.stack.push(x);
    // 将当前最小值压入辅助栈
    this.minStack.push(Math.min(this.minStack[this.minStack.length - 1], x));
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function() {
    this.stack.pop();
    this.minStack.pop();
};

/**
 * @return {number}
 */
MinStack.prototype.top = function() {
    return this.stack[this.stack.length - 1];
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function() {
    return this.minStack[this.minStack.length - 1];
};

/**
 * 不使用辅助栈实现
 */
var MinStackOptimized = function() {
    this.stack = [];
    this.min = Infinity;
};

/** 
 * @param {number} x
 * @return {void}
 */
MinStackOptimized.prototype.push = function(x) {
    // 如果x小于等于当前最小值，先将当前最小值入栈，再更新最小值
    if (x <= this.min) {
        this.stack.push(this.min);
        this.min = x;
    }
    this.stack.push(x);
};

/**
 * @return {void}
 */
MinStackOptimized.prototype.pop = function() {
    // 如果弹出的是最小值，需要更新最小值
    if (this.stack.pop() === this.min) {
        this.min = this.stack.pop();
    }
};

/**
 * @return {number}
 */
MinStackOptimized.prototype.top = function() {
    return this.stack[this.stack.length - 1];
};

/**
 * @return {number}
 */
MinStackOptimized.prototype.getMin = function() {
    return this.min;
}; 