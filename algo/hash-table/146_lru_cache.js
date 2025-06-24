/**
 * 146. LRU 缓存机制
 *
 * 运用你所掌握的数据结构，设计和实现一个 LRU (最近最少使用) 缓存机制。
 * 实现 LRUCache 类：
 *
 * LRUCache(int capacity) 以正整数作为容量 capacity 初始化 LRU 缓存
 * int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
 * void put(int key, int value) 如果关键字已经存在，则变更其数据值；如果关键字不存在，则插入该组「关键字-值」。
 * 当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间。
 *
 * 进阶：你是否可以在 O(1) 时间复杂度内完成这两种操作？
 */

/**
 * 双向链表节点
 */
class DLinkedNode {
  constructor(key = 0, value = 0) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * @param {number} capacity
 */
var LRUCache = function (capacity) {
  this.cache = new Map();
  this.capacity = capacity;
  this.size = 0;

  // 使用伪头部和伪尾部节点
  this.head = new DLinkedNode();
  this.tail = new DLinkedNode();
  this.head.next = this.tail;
  this.tail.prev = this.head;
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1;
  }

  // 如果key存在，先通过哈希表定位，再移到头部
  const node = this.cache.get(key);
  this.moveToHead(node);
  return node.value;
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  if (!this.cache.has(key)) {
    // 如果key不存在，创建一个新的节点
    const newNode = new DLinkedNode(key, value);
    // 添加进哈希表
    this.cache.set(key, newNode);
    // 添加至双向链表的头部
    this.addToHead(newNode);
    this.size++;

    if (this.size > this.capacity) {
      // 如果超出容量，删除双向链表的尾部节点
      const tail = this.removeTail();
      // 删除哈希表中对应的项
      this.cache.delete(tail.key);
      this.size--;
    }
  } else {
    // 如果key存在，先通过哈希表定位，再修改value，并移到头部
    const node = this.cache.get(key);
    node.value = value;
    this.moveToHead(node);
  }
};

/**
 * 将节点添加到双向链表的头部
 * @param {DLinkedNode} node
 */
LRUCache.prototype.addToHead = function (node) {
  node.prev = this.head;
  node.next = this.head.next;
  this.head.next.prev = node;
  this.head.next = node;
};

/**
 * 删除链表中的节点
 * @param {DLinkedNode} node
 */
LRUCache.prototype.removeNode = function (node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
};

/**
 * 将节点移动到链表头部
 * @param {DLinkedNode} node
 */
LRUCache.prototype.moveToHead = function (node) {
  this.removeNode(node);
  this.addToHead(node);
};

/**
 * 删除链表尾部节点并返回
 * @return {DLinkedNode}
 */
LRUCache.prototype.removeTail = function () {
  const res = this.tail.prev;
  this.removeNode(res);
  return res;
};
