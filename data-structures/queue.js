/**
 * 队列和循环队列实现
 * 
 * 队列(Queue)是一种先进先出(FIFO)的数据结构
 * 循环队列(Circular Queue)是队列的一种实现方式，能够更有效地利用空间
 */

// 基础队列实现
class Queue {
  constructor() {
    this.items = [];
  }

  // 入队：在队列尾部添加元素
  enqueue(element) {
    this.items.push(element);
  }

  // 出队：移除并返回队列头部元素
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // 查看队列头部元素
  front() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // 检查队列是否为空
  isEmpty() {
    return this.items.length === 0;
  }

  // 获取队列大小
  size() {
    return this.items.length;
  }

  // 清空队列
  clear() {
    this.items = [];
  }

  // 打印队列
  toString() {
    return this.items.toString();
  }
}

// 循环队列实现 - 更高效的队列实现
class CircularQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = new Array(capacity);
    this.front = 0;  // 队列头部索引
    this.rear = 0;   // 队列尾部索引
    this.count = 0;  // 当前元素数量
  }

  // 入队
  enqueue(element) {
    if (this.isFull()) {
      throw new Error('Queue is full');
    }
    
    this.items[this.rear] = element;
    this.rear = (this.rear + 1) % this.capacity;
    this.count++;
    return true;
  }

  // 出队
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    
    const element = this.items[this.front];
    this.items[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return element;
  }

  // 查看队列头部元素
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.front];
  }

  // 检查队列是否为空
  isEmpty() {
    return this.count === 0;
  }

  // 检查队列是否已满
  isFull() {
    return this.count === this.capacity;
  }

  // 获取队列大小
  size() {
    return this.count;
  }

  // 获取队列容量
  getCapacity() {
    return this.capacity;
  }

  // 清空队列
  clear() {
    this.front = 0;
    this.rear = 0;
    this.count = 0;
    this.items.fill(undefined);
  }

  // 打印队列状态
  toString() {
    if (this.isEmpty()) {
      return 'Queue is empty';
    }
    
    const result = [];
    let index = this.front;
    for (let i = 0; i < this.count; i++) {
      result.push(this.items[index]);
      index = (index + 1) % this.capacity;
    }
    return result.toString();
  }
}

// 双端队列(Deque)实现
class Deque {
  constructor() {
    this.items = [];
  }

  // 从前端添加元素
  addFront(element) {
    this.items.unshift(element);
  }

  // 从后端添加元素
  addRear(element) {
    this.items.push(element);
  }

  // 从前端移除元素
  removeFront() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // 从后端移除元素
  removeRear() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop();
  }

  // 查看前端元素
  peekFront() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // 查看后端元素
  peekRear() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  // 检查是否为空
  isEmpty() {
    return this.items.length === 0;
  }

  // 获取大小
  size() {
    return this.items.length;
  }

  // 清空
  clear() {
    this.items = [];
  }

  // 转换为字符串
  toString() {
    return this.items.toString();
  }
}

// 测试用例
function testQueue() {
  console.log('=== 基础队列测试 ===');
  const queue = new Queue();
  
  // 测试入队
  queue.enqueue(1);
  queue.enqueue(2);
  queue.enqueue(3);
  console.log('入队后:', queue.toString()); // 1,2,3
  
  // 测试出队
  console.log('出队:', queue.dequeue()); // 1
  console.log('出队后:', queue.toString()); // 2,3
  
  // 测试查看头部
  console.log('头部元素:', queue.front()); // 2
  console.log('队列大小:', queue.size()); // 2
}

function testCircularQueue() {
  console.log('\n=== 循环队列测试 ===');
  const circularQueue = new CircularQueue(3);
  
  // 测试入队
  circularQueue.enqueue('A');
  circularQueue.enqueue('B');
  circularQueue.enqueue('C');
  console.log('入队后:', circularQueue.toString()); // A,B,C
  console.log('是否已满:', circularQueue.isFull()); // true
  
  // 测试出队
  console.log('出队:', circularQueue.dequeue()); // A
  console.log('出队后:', circularQueue.toString()); // B,C
  
  // 测试再次入队
  circularQueue.enqueue('D');
  console.log('再次入队后:', circularQueue.toString()); // B,C,D
  
  console.log('队列大小:', circularQueue.size()); // 3
}

function testDeque() {
  console.log('\n=== 双端队列测试 ===');
  const deque = new Deque();
  
  // 从两端添加元素
  deque.addRear(1);
  deque.addRear(2);
  deque.addFront(0);
  console.log('添加后:', deque.toString()); // 0,1,2
  
  // 从两端移除元素
  console.log('从前端移除:', deque.removeFront()); // 0
  console.log('从后端移除:', deque.removeRear()); // 2
  console.log('移除后:', deque.toString()); // 1
}

// 运行测试
testQueue();
testCircularQueue();
testDeque();

// 导出类
module.exports = {
  Queue,
  CircularQueue,
  Deque
}; 