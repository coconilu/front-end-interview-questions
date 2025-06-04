/**
 * 堆（Heap）实现
 *
 * 面试题：实现一个最大堆和最小堆，包含插入、删除、查看堆顶等操作
 *
 * 堆的特性：
 * 1. 完全二叉树
 * 2. 最大堆：父节点的值大于等于子节点的值
 * 3. 最小堆：父节点的值小于等于子节点的值
 */

// 最大堆实现
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  // 获取父节点索引
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  // 获取左子节点索引
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  // 获取右子节点索引
  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  // 交换两个元素
  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  // 向上调整（用于插入后维护堆性质）
  heapifyUp(index) {
    const parentIndex = this.getParentIndex(index);

    if (parentIndex >= 0 && this.heap[parentIndex] < this.heap[index]) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  // 向下调整（用于删除后维护堆性质）
  heapifyDown(index) {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let largest = index;

    // 找到最大值的索引
    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex] > this.heap[largest]
    ) {
      largest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex] > this.heap[largest]
    ) {
      largest = rightChildIndex;
    }

    // 如果最大值不是当前节点，交换并继续向下调整
    if (largest !== index) {
      this.swap(index, largest);
      this.heapifyDown(largest);
    }
  }

  // 插入元素
  insert(value) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  // 删除并返回堆顶元素（最大值）
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return max;
  }

  // 查看堆顶元素
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // 获取堆的大小
  size() {
    return this.heap.length;
  }

  // 检查堆是否为空
  isEmpty() {
    return this.heap.length === 0;
  }

  // 获取堆数组（用于调试）
  getHeap() {
    return [...this.heap];
  }
}

// 最小堆实现
class MinHeap {
  constructor() {
    this.heap = [];
  }

  // 获取父节点索引
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  // 获取左子节点索引
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  // 获取右子节点索引
  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  // 交换两个元素
  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  // 向上调整（用于插入后维护堆性质）
  heapifyUp(index) {
    const parentIndex = this.getParentIndex(index);

    if (parentIndex >= 0 && this.heap[parentIndex] > this.heap[index]) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  // 向下调整（用于删除后维护堆性质）
  heapifyDown(index) {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let smallest = index;

    // 找到最小值的索引
    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex] < this.heap[smallest]
    ) {
      smallest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex] < this.heap[smallest]
    ) {
      smallest = rightChildIndex;
    }

    // 如果最小值不是当前节点，交换并继续向下调整
    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  // 插入元素
  insert(value) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  // 删除并返回堆顶元素（最小值）
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  // 查看堆顶元素
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // 获取堆的大小
  size() {
    return this.heap.length;
  }

  // 检查堆是否为空
  isEmpty() {
    return this.heap.length === 0;
  }

  // 获取堆数组（用于调试）
  getHeap() {
    return [...this.heap];
  }
}

// 测试最大堆
console.log("=== 最大堆测试 ===");
const maxHeap = new MaxHeap();

// 插入元素
[10, 20, 15, 30, 40].forEach((val) => {
  maxHeap.insert(val);
  console.log(`插入 ${val}，堆: [${maxHeap.getHeap()}]`);
});

console.log(`堆顶元素: ${maxHeap.peek()}`);
console.log(`堆大小: ${maxHeap.size()}`);

// 删除元素
while (!maxHeap.isEmpty()) {
  const max = maxHeap.extractMax();
  console.log(`删除最大值: ${max}，剩余堆: [${maxHeap.getHeap()}]`);
}

console.log("\n=== 最小堆测试 ===");
const minHeap = new MinHeap();

// 插入元素
[10, 20, 15, 30, 40].forEach((val) => {
  minHeap.insert(val);
  console.log(`插入 ${val}，堆: [${minHeap.getHeap()}]`);
});

console.log(`堆顶元素: ${minHeap.peek()}`);
console.log(`堆大小: ${minHeap.size()}`);

// 删除元素
while (!minHeap.isEmpty()) {
  const min = minHeap.extractMin();
  console.log(`删除最小值: ${min}，剩余堆: [${minHeap.getHeap()}]`);
}
