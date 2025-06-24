/**
 * 哈希表实现
 *
 * 面试题：实现一个基本的哈希表，包含增删改查操作
 */

class HashTable {
  constructor(size = 53) {
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
  }

  // 哈希函数
  hash(key) {
    if (typeof key !== 'string') {
      key = String(key);
    }

    let total = 0;
    const PRIME = 31;

    // 使用霍纳法则计算哈希值，减少冲突
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i];
      const value = char.charCodeAt(0) - 96;
      total = (total * PRIME + value) % this.size;
    }

    return total;
  }

  // 设置键值对
  set(key, value) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // 检查键是否已存在
    for (let i = 0; i < bucket.length; i++) {
      const [storedKey, storedValue] = bucket[i];
      if (storedKey === key) {
        // 更新现有键的值
        bucket[i] = [key, value];
        return;
      }
    }

    // 添加新键值对
    bucket.push([key, value]);
  }

  // 获取键对应的值
  get(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const [storedKey, storedValue] of bucket) {
      if (storedKey === key) {
        return storedValue;
      }
    }

    return undefined;
  }

  // 检查键是否存在
  has(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (const [storedKey] of bucket) {
      if (storedKey === key) {
        return true;
      }
    }

    return false;
  }

  // 删除键值对
  delete(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      const [storedKey] = bucket[i];
      if (storedKey === key) {
        bucket.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  // 获取所有键
  keys() {
    const keysArray = [];

    for (const bucket of this.buckets) {
      for (const [key] of bucket) {
        keysArray.push(key);
      }
    }

    return keysArray;
  }

  // 获取所有值
  values() {
    const valuesArray = [];

    for (const bucket of this.buckets) {
      for (const [, value] of bucket) {
        valuesArray.push(value);
      }
    }

    return valuesArray;
  }

  // 获取所有键值对
  entries() {
    const entriesArray = [];

    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        entriesArray.push(entry);
      }
    }

    return entriesArray;
  }

  // 清空哈希表
  clear() {
    this.buckets = new Array(this.size).fill(null).map(() => []);
  }
}

// 测试
const hashTable = new HashTable();

// 添加键值对
hashTable.set('name', 'John');
hashTable.set('age', 30);
hashTable.set('city', 'New York');
hashTable.set('job', 'Developer');

// 获取值
console.log(hashTable.get('name')); // John
console.log(hashTable.get('age')); // 30
console.log(hashTable.get('city')); // New York

// 检查键是否存在
console.log(hashTable.has('job')); // true
console.log(hashTable.has('email')); // false

// 更新值
hashTable.set('age', 31);
console.log(hashTable.get('age')); // 31

// 删除键值对
console.log(hashTable.delete('city')); // true
console.log(hashTable.has('city')); // false

// 获取所有键
console.log(hashTable.keys()); // ['name', 'age', 'job']

// 获取所有值
console.log(hashTable.values()); // ['John', 31, 'Developer']

// 获取所有键值对
console.log(hashTable.entries()); // [['name', 'John'], ['age', 31], ['job', 'Developer']]

// 测试哈希冲突
const collisionTest = new HashTable(3); // 故意使用小容量增加冲突概率
collisionTest.set('a', 1);
collisionTest.set('d', 2); // 可能与'a'冲突
collisionTest.set('g', 3); // 可能与'a'和'd'冲突

console.log(collisionTest.get('a')); // 1
console.log(collisionTest.get('d')); // 2
console.log(collisionTest.get('g')); // 3
