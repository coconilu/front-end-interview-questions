/**
 * 并查集(Union Find / Disjoint Set Union)实现
 * 
 * 并查集是一种树型数据结构，用于处理一些不相交集合的合并及查询问题
 * 主要操作：
 * - Find: 查找元素所属的集合
 * - Union: 合并两个集合
 * 
 * 优化技术：
 * - 路径压缩(Path Compression): 在查找时压缩路径
 * - 按秩合并(Union by Rank): 按树的高度合并，保持树的平衡
 */

class UnionFind {
  constructor(size) {
    if (size <= 0) {
      throw new Error('Size must be positive');
    }
    
    this.size = size;
    this.parent = new Array(size); // 父节点数组
    this.rank = new Array(size);   // 秩数组(树的高度)
    this.count = size;             // 连通分量数量
    
    // 初始化：每个元素的父节点是自己，秩为0
    for (let i = 0; i < size; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
  }

  // 查找操作 - 带路径压缩
  find(x) {
    this._validateIndex(x);
    
    // 路径压缩：递归查找根节点，并将路径上所有节点直接连接到根节点
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    
    return this.parent[x];
  }

  // 合并操作 - 按秩合并
  union(x, y) {
    this._validateIndex(x);
    this._validateIndex(y);
    
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    // 如果已经在同一集合中，无需合并
    if (rootX === rootY) {
      return false;
    }
    
    // 按秩合并：将秩小的树连接到秩大的树下
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      // 秩相等时，任选一个作为根，并增加其秩
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    
    this.count--; // 连通分量数量减1
    return true;
  }

  // 检查两个元素是否连通
  connected(x, y) {
    this._validateIndex(x);
    this._validateIndex(y);
    
    return this.find(x) === this.find(y);
  }

  // 获取连通分量数量
  getCount() {
    return this.count;
  }

  // 获取元素x所在集合的大小
  getSetSize(x) {
    this._validateIndex(x);
    
    const root = this.find(x);
    let size = 0;
    
    for (let i = 0; i < this.size; i++) {
      if (this.find(i) === root) {
        size++;
      }
    }
    
    return size;
  }

  // 获取所有连通分量
  getAllSets() {
    const sets = new Map();
    
    for (let i = 0; i < this.size; i++) {
      const root = this.find(i);
      
      if (!sets.has(root)) {
        sets.set(root, []);
      }
      
      sets.get(root).push(i);
    }
    
    return Array.from(sets.values());
  }

  // 重置并查集
  reset() {
    for (let i = 0; i < this.size; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
    this.count = this.size;
  }

  // 验证索引有效性
  _validateIndex(x) {
    if (x < 0 || x >= this.size) {
      throw new Error(`Index ${x} is out of bounds [0, ${this.size})`);
    }
  }

  // 打印并查集状态
  printState() {
    console.log('Parent:', this.parent);
    console.log('Rank:', this.rank);
    console.log('Count:', this.count);
    console.log('Sets:', this.getAllSets());
  }
}

// 带权重的并查集（用于一些特殊应用）
class WeightedUnionFind extends UnionFind {
  constructor(size) {
    super(size);
    this.weight = new Array(size).fill(0); // 权重数组
  }

  // 带权重的查找
  find(x) {
    this._validateIndex(x);
    
    if (this.parent[x] !== x) {
      const root = this.find(this.parent[x]);
      this.weight[x] += this.weight[this.parent[x]];
      this.parent[x] = root;
    }
    
    return this.parent[x];
  }

  // 带权重的合并
  union(x, y, w) {
    this._validateIndex(x);
    this._validateIndex(y);
    
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX === rootY) {
      return false;
    }
    
    // 根据权重调整合并
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
      this.weight[rootX] = this.weight[y] - this.weight[x] + w;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
      this.weight[rootY] = this.weight[x] - this.weight[y] - w;
    } else {
      this.parent[rootY] = rootX;
      this.weight[rootY] = this.weight[x] - this.weight[y] - w;
      this.rank[rootX]++;
    }
    
    this.count--;
    return true;
  }

  // 获取两个元素之间的权重差
  getWeightDiff(x, y) {
    if (!this.connected(x, y)) {
      throw new Error('Elements are not connected');
    }
    
    return this.weight[y] - this.weight[x];
  }
}

// 应用实例：图的连通性检测
class GraphConnectivity {
  constructor(vertices) {
    this.vertices = vertices;
    this.uf = new UnionFind(vertices);
    this.edges = [];
  }

  addEdge(u, v) {
    this.edges.push([u, v]);
    this.uf.union(u, v);
  }

  isConnected(u, v) {
    return this.uf.connected(u, v);
  }

  getConnectedComponents() {
    return this.uf.getAllSets();
  }

  isFullyConnected() {
    return this.uf.getCount() === 1;
  }
}

// 应用实例：最小生成树(Kruskal算法)
function kruskalMST(vertices, edges) {
  // edges格式: [[u, v, weight], ...]
  const uf = new UnionFind(vertices);
  const mst = [];
  let totalWeight = 0;
  
  // 按权重排序边
  edges.sort((a, b) => a[2] - b[2]);
  
  for (const [u, v, weight] of edges) {
    // 如果添加这条边不会形成环
    if (!uf.connected(u, v)) {
      uf.union(u, v);
      mst.push([u, v, weight]);
      totalWeight += weight;
      
      // 如果已经有n-1条边，MST完成
      if (mst.length === vertices - 1) {
        break;
      }
    }
  }
  
  return { mst, totalWeight };
}

// 测试用例
function testUnionFind() {
  console.log('=== 并查集测试 ===');
  const uf = new UnionFind(10);
  
  console.log('初始状态:');
  console.log('连通分量数量:', uf.getCount()); // 10
  
  // 合并一些元素
  uf.union(0, 1);
  uf.union(2, 3);
  uf.union(4, 5);
  uf.union(1, 3); // 将{0,1}和{2,3}合并
  
  console.log('\n合并后:');
  console.log('连通分量数量:', uf.getCount()); // 7
  console.log('0和3是否连通:', uf.connected(0, 3)); // true
  console.log('4和6是否连通:', uf.connected(4, 6)); // false
  
  console.log('\n所有连通分量:');
  uf.getAllSets().forEach((set, index) => {
    console.log(`分量${index + 1}:`, set);
  });
}

function testGraphConnectivity() {
  console.log('\n=== 图连通性测试 ===');
  const graph = new GraphConnectivity(6);
  
  // 添加边
  graph.addEdge(0, 1);
  graph.addEdge(1, 2);
  graph.addEdge(3, 4);
  
  console.log('连通分量:', graph.getConnectedComponents());
  console.log('图是否完全连通:', graph.isFullyConnected()); // false
  
  // 连接两个分量
  graph.addEdge(2, 3);
  console.log('添加边(2,3)后:');
  console.log('连通分量:', graph.getConnectedComponents());
  console.log('图是否完全连通:', graph.isFullyConnected()); // false (还有节点5)
}

function testKruskalMST() {
  console.log('\n=== Kruskal最小生成树测试 ===');
  const vertices = 4;
  const edges = [
    [0, 1, 10],
    [0, 2, 6],
    [0, 3, 5],
    [1, 3, 15],
    [2, 3, 4]
  ];
  
  const result = kruskalMST(vertices, edges);
  console.log('最小生成树边:', result.mst);
  console.log('总权重:', result.totalWeight);
}

// 运行测试
testUnionFind();
testGraphConnectivity();
testKruskalMST();

// 导出类
module.exports = {
  UnionFind,
  WeightedUnionFind,
  GraphConnectivity,
  kruskalMST
}; 