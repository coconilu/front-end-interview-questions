/**
 * LRU缓存实现
 * 
 * 面试题：实现一个LRU（最近最少使用）缓存机制
 * 
 * 要求：
 * 1. get(key)：如果关键字存在于缓存中，则返回关键字的值，否则返回-1
 * 2. put(key, value)：如果关键字已经存在，则变更其值；如果不存在，则插入该组「关键字-值」
 * 3. 当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据，从而为新数据留出空间
 * 4. get和put操作的时间复杂度为O(1)
 */

// 方法1：使用Map实现（ES6）
class LRUCacheWithMap {
    constructor(capacity) {
        this.capacity = capacity
        this.cache = new Map()
    }
    get(key) {
        if (!this.cache.has(key)) return -1
        const value = this.cache.get(key)
        this.cache.delete(key)
        this.cache.set(key, value)
        return value
    }
    put(key, value) {
        if (this.cache.has(key)) this.cache.delete(key)
        this.cache.set(key, value)
        if (this.cache.size > this.capacity) {
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }
    }
}

// 方法2：使用双向链表 + 哈希表实现
class DLinkedNode {
    constructor(key = 0, value = 0) {
        this.key = key
        this.value = value
        this.prev = null
        this.next = null
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity
        this.size = 0
        this.cache = new Map() // 哈希表：key -> node
        
        // 使用伪头部和伪尾部节点
        this.head = new DLinkedNode()
        this.tail = new DLinkedNode()
        this.head.next = this.tail
        this.tail.prev = this.head
    }
    
    // 将节点添加到双向链表的头部
    addToHead(node) {
        node.prev = this.head
        node.next = this.head.next
        this.head.next.prev = node
        this.head.next = node
    }
    
    // 删除节点
    removeNode(node) {
        node.prev.next = node.next
        node.next.prev = node.prev
    }
    
    // 将节点移到头部（表示最近使用）
    moveToHead(node) {
        this.removeNode(node)
        this.addToHead(node)
    }
    
    // 删除尾部节点（最久未使用的节点）
    removeTail() {
        const res = this.tail.prev
        this.removeNode(res)
        return res
    }
    
    get(key) {
        const node = this.cache.get(key)
        if (!node) return -1
        
        // 将访问的节点移到头部
        this.moveToHead(node)
        return node.value
    }
    
    put(key, value) {
        const node = this.cache.get(key)
        
        if (!node) {
            // 如果key不存在，创建一个新节点
            const newNode = new DLinkedNode(key, value)
            
            // 添加进哈希表
            this.cache.set(key, newNode)
            
            // 添加至双向链表的头部
            this.addToHead(newNode)
            
            // 增加缓存数量
            this.size++
            
            // 如果超出容量，删除双向链表的尾部节点
            if (this.size > this.capacity) {
                const tail = this.removeTail()
                this.cache.delete(tail.key)
                this.size--
            }
        } else {
            // 如果key存在，先修改值，再移到头部
            node.value = value
            this.moveToHead(node)
        }
    }
}

// 测试
const lruCache = new LRUCache(2)
lruCache.put(1, 1)           // 缓存是 {1=1}
lruCache.put(2, 2)           // 缓存是 {1=1, 2=2}
console.log(lruCache.get(1)) // 返回 1
lruCache.put(3, 3)           // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
console.log(lruCache.get(2)) // 返回 -1 (未找到)
lruCache.put(4, 4)           // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
console.log(lruCache.get(1)) // 返回 -1 (未找到)
console.log(lruCache.get(3)) // 返回 3
console.log(lruCache.get(4)) // 返回 4 