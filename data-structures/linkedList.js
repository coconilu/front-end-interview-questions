/**
 * 链表数据结构实现
 * 
 * 包含单向链表(Singly Linked List)和双向链表(Doubly Linked List)的实现
 * 链表是一种线性数据结构，元素存储在节点中，通过指针相连
 */

// 单向链表节点
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// 双向链表节点
class DoublyListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

// 单向链表实现
class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // 在链表头部插入元素
  prepend(value) {
    const newNode = new ListNode(value);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // 在链表尾部插入元素
  append(value) {
    const newNode = new ListNode(value);
    
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
  }

  // 在指定位置插入元素
  insertAt(index, value) {
    if (index < 0 || index > this.size) {
      throw new Error('Index out of bounds');
    }

    if (index === 0) {
      this.prepend(value);
      return;
    }

    const newNode = new ListNode(value);
    let current = this.head;
    
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }
    
    newNode.next = current.next;
    current.next = newNode;
    this.size++;
  }

  // 删除指定值的第一个节点
  remove(value) {
    if (!this.head) return false;

    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
      this.size--;
      return true;
    }
    
    return false;
  }

  // 删除指定位置的节点
  removeAt(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    if (index === 0) {
      const removedValue = this.head.value;
      this.head = this.head.next;
      this.size--;
      return removedValue;
    }

    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }

    const removedValue = current.next.value;
    current.next = current.next.next;
    this.size--;
    return removedValue;
  }

  // 查找元素的索引
  indexOf(value) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.value === value) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  // 获取指定位置的元素
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current.next;
    }

    return current.value;
  }

  // 检查链表是否包含指定值
  contains(value) {
    return this.indexOf(value) !== -1;
  }

  // 获取链表大小
  getSize() {
    return this.size;
  }

  // 检查链表是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 清空链表
  clear() {
    this.head = null;
    this.size = 0;
  }

  // 反转链表
  reverse() {
    let prev = null;
    let current = this.head;
    let next = null;

    while (current) {
      next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }

    this.head = prev;
  }

  // 转换为数组
  toArray() {
    const result = [];
    let current = this.head;
    
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    
    return result;
  }

  // 转换为字符串
  toString() {
    return this.toArray().join(' -> ');
  }
}

// 双向链表实现
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // 在头部插入
  prepend(value) {
    const newNode = new DoublyListNode(value);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }

    this.size++;
  }

  // 在尾部插入
  append(value) {
    const newNode = new DoublyListNode(value);

    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    this.size++;
  }

  // 在指定位置插入
  insertAt(index, value) {
    if (index < 0 || index > this.size) {
      throw new Error('Index out of bounds');
    }

    if (index === 0) {
      this.prepend(value);
      return;
    }

    if (index === this.size) {
      this.append(value);
      return;
    }

    const newNode = new DoublyListNode(value);
    let current;

    // 从较近的一端开始遍历
    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) {
        current = current.next;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current.prev;
      }
    }

    newNode.next = current;
    newNode.prev = current.prev;
    current.prev.next = newNode;
    current.prev = newNode;

    this.size++;
  }

  // 删除指定值的节点
  remove(value) {
    let current = this.head;

    while (current) {
      if (current.value === value) {
        // 更新前一个节点的next指针
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }

        // 更新后一个节点的prev指针
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }

        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  // 删除指定位置的节点
  removeAt(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    let current;

    // 从较近的一端开始遍历
    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) {
        current = current.next;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current.prev;
      }
    }

    const removedValue = current.value;

    // 更新指针
    if (current.prev) {
      current.prev.next = current.next;
    } else {
      this.head = current.next;
    }

    if (current.next) {
      current.next.prev = current.prev;
    } else {
      this.tail = current.prev;
    }

    this.size--;
    return removedValue;
  }

  // 查找元素索引
  indexOf(value) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.value === value) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  // 获取指定位置的元素
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    let current;

    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) {
        current = current.next;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current.prev;
      }
    }

    return current.value;
  }

  // 检查是否包含指定值
  contains(value) {
    return this.indexOf(value) !== -1;
  }

  // 获取大小
  getSize() {
    return this.size;
  }

  // 检查是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 清空链表
  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // 反转链表
  reverse() {
    let current = this.head;
    this.head = this.tail;
    this.tail = current;

    while (current) {
      const temp = current.next;
      current.next = current.prev;
      current.prev = temp;
      current = temp;
    }
  }

  // 转换为数组
  toArray() {
    const result = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  // 从尾部开始转换为数组
  toArrayReverse() {
    const result = [];
    let current = this.tail;

    while (current) {
      result.push(current.value);
      current = current.prev;
    }

    return result;
  }

  // 转换为字符串
  toString() {
    return this.toArray().join(' <-> ');
  }
}

// 测试用例
function testSinglyLinkedList() {
  console.log('=== 单向链表测试 ===');
  const list = new SinglyLinkedList();

  // 添加元素
  list.append(1);
  list.append(2);
  list.append(3);
  list.prepend(0);
  console.log('添加元素后:', list.toString()); // 0 -> 1 -> 2 -> 3

  // 插入元素
  list.insertAt(2, 1.5);
  console.log('插入元素后:', list.toString()); // 0 -> 1 -> 1.5 -> 2 -> 3

  // 删除元素
  list.remove(1.5);
  console.log('删除元素后:', list.toString()); // 0 -> 1 -> 2 -> 3

  // 查找元素
  console.log('元素2的索引:', list.indexOf(2)); // 2
  console.log('索引1的元素:', list.get(1)); // 1

  // 反转链表
  list.reverse();
  console.log('反转后:', list.toString()); // 3 -> 2 -> 1 -> 0
}

function testDoublyLinkedList() {
  console.log('\n=== 双向链表测试 ===');
  const list = new DoublyLinkedList();

  // 添加元素
  list.append('A');
  list.append('B');
  list.append('C');
  list.prepend('Z');
  console.log('添加元素后:', list.toString()); // Z <-> A <-> B <-> C

  // 插入元素
  list.insertAt(2, 'X');
  console.log('插入元素后:', list.toString()); // Z <-> A <-> X <-> B <-> C

  // 删除元素
  list.removeAt(2);
  console.log('删除元素后:', list.toString()); // Z <-> A <-> B <-> C

  // 反向遍历
  console.log('反向数组:', list.toArrayReverse()); // ['C', 'B', 'A', 'Z']

  // 反转链表
  list.reverse();
  console.log('反转后:', list.toString()); // C <-> B <-> A <-> Z
}

// 运行测试
testSinglyLinkedList();
testDoublyLinkedList();

// 导出类
module.exports = {
  ListNode,
  DoublyListNode,
  SinglyLinkedList,
  DoublyLinkedList
}; 