/**
 * 栈（Stack）实现
 *
 * 面试题：实现一个栈数据结构，包含入栈、出栈、查看栈顶、检查是否为空等操作
 *
 * 栈的特性：
 * 1. LIFO（Last In First Out）后进先出
 * 2. 只能在栈顶进行插入和删除操作
 * 3. 主要操作：push（入栈）、pop（出栈）、peek/top（查看栈顶）、isEmpty（检查是否为空）
 */

// 方法1：使用数组实现栈
class ArrayStack {
  constructor() {
    this.items = [];
  }

  // 入栈
  push(element) {
    this.items.push(element);
  }

  // 出栈
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.items.pop();
  }

  // 查看栈顶元素
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  // 检查栈是否为空
  isEmpty() {
    return this.items.length === 0;
  }

  // 获取栈的大小
  size() {
    return this.items.length;
  }

  // 清空栈
  clear() {
    this.items = [];
  }

  // 获取栈的所有元素（用于调试）
  getItems() {
    return [...this.items];
  }

  // 打印栈
  toString() {
    return this.items.toString();
  }
}

// 方法2：使用链表实现栈
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedListStack {
  constructor() {
    this.top = null;
    this.count = 0;
  }

  // 入栈
  push(element) {
    const node = new ListNode(element);
    node.next = this.top;
    this.top = node;
    this.count++;
  }

  // 出栈
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    const data = this.top.data;
    this.top = this.top.next;
    this.count--;
    return data;
  }

  // 查看栈顶元素
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.top.data;
  }

  // 检查栈是否为空
  isEmpty() {
    return this.top === null;
  }

  // 获取栈的大小
  size() {
    return this.count;
  }

  // 清空栈
  clear() {
    this.top = null;
    this.count = 0;
  }

  // 获取栈的所有元素（用于调试）
  getItems() {
    const items = [];
    let current = this.top;
    while (current) {
      items.push(current.data);
      current = current.next;
    }
    return items;
  }

  // 打印栈
  toString() {
    return this.getItems().toString();
  }
}

// 栈的应用示例

// 1. 括号匹配检查
function isValidParentheses(s) {
  const stack = new ArrayStack();
  const pairs = {
    ')': '(',
    '}': '{',
    ']': '[',
  };

  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (char === ')' || char === '}' || char === ']') {
      if (stack.isEmpty() || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.isEmpty();
}

// 2. 十进制转二进制
function decimalToBinary(decimal) {
  const stack = new ArrayStack();

  while (decimal > 0) {
    stack.push(decimal % 2);
    decimal = Math.floor(decimal / 2);
  }

  let binary = '';
  while (!stack.isEmpty()) {
    binary += stack.pop();
  }

  return binary || '0';
}

// 3. 逆波兰表达式求值（后缀表达式）
function evalRPN(tokens) {
  const stack = new ArrayStack();
  const operators = ['+', '-', '*', '/'];

  for (let token of tokens) {
    if (operators.includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      let result;

      switch (token) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          result = Math.trunc(a / b);
          break;
      }

      stack.push(result);
    } else {
      stack.push(parseInt(token));
    }
  }

  return stack.pop();
}

// 测试
console.log('=== 数组栈测试 ===');
const arrayStack = new ArrayStack();

// 入栈测试
[1, 2, 3, 4, 5].forEach((val) => {
  arrayStack.push(val);
  console.log(`入栈 ${val}，栈: [${arrayStack.getItems()}]`);
});

console.log(`栈顶元素: ${arrayStack.peek()}`);
console.log(`栈大小: ${arrayStack.size()}`);

// 出栈测试
while (!arrayStack.isEmpty()) {
  const val = arrayStack.pop();
  console.log(`出栈 ${val}，剩余栈: [${arrayStack.getItems()}]`);
}

console.log('\n=== 链表栈测试 ===');
const linkedStack = new LinkedListStack();

// 入栈测试
['a', 'b', 'c', 'd', 'e'].forEach((val) => {
  linkedStack.push(val);
  console.log(`入栈 ${val}，栈: [${linkedStack.getItems()}]`);
});

console.log(`栈顶元素: ${linkedStack.peek()}`);
console.log(`栈大小: ${linkedStack.size()}`);

// 出栈测试
while (!linkedStack.isEmpty()) {
  const val = linkedStack.pop();
  console.log(`出栈 ${val}，剩余栈: [${linkedStack.getItems()}]`);
}

console.log('\n=== 栈应用测试 ===');

// 括号匹配测试
const testCases = ['()', '()[]{}', '(]', '([)]', '{[]}'];
testCases.forEach((test) => {
  console.log(`"${test}" 括号匹配: ${isValidParentheses(test)}`);
});

// 十进制转二进制测试
const decimals = [10, 233, 1000];
decimals.forEach((num) => {
  console.log(`${num} 转二进制: ${decimalToBinary(num)}`);
});

// 逆波兰表达式测试
const rpnExpressions = [
  ['2', '1', '+', '3', '*'], // ((2 + 1) * 3) = 9
  ['4', '13', '5', '/', '+'], // (4 + (13 / 5)) = 6
  ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'], // 22
];
rpnExpressions.forEach((expr, index) => {
  console.log(
    `逆波兰表达式 ${index + 1}: [${expr.join(', ')}] = ${evalRPN(expr)}`
  );
});
