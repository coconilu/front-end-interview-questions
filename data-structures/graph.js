/**
 * 图(Graph)数据结构实现
 * 
 * 包含邻接表和邻接矩阵两种表示方法
 * 支持有向图和无向图、加权图和无权图
 * 实现常见图算法：DFS、BFS、拓扑排序、最短路径等
 */

// 邻接表实现的图
class Graph {
  constructor(isDirected = false) {
    this.isDirected = isDirected;
    this.vertices = new Map(); // 存储顶点和其邻接列表
  }

  // 添加顶点
  addVertex(vertex) {
    if (!this.vertices.has(vertex)) {
      this.vertices.set(vertex, []);
    }
  }

  // 添加边
  addEdge(source, destination, weight = 1) {
    // 确保顶点存在
    this.addVertex(source);
    this.addVertex(destination);
    
    // 添加边
    this.vertices.get(source).push({ vertex: destination, weight });
    
    // 如果是无向图，添加反向边
    if (!this.isDirected) {
      this.vertices.get(destination).push({ vertex: source, weight });
    }
  }

  // 移除顶点
  removeVertex(vertex) {
    if (!this.vertices.has(vertex)) {
      return false;
    }
    
    // 移除所有指向该顶点的边
    for (const [v, edges] of this.vertices) {
      this.vertices.set(v, edges.filter(edge => edge.vertex !== vertex));
    }
    
    // 移除顶点
    this.vertices.delete(vertex);
    return true;
  }

  // 移除边
  removeEdge(source, destination) {
    if (!this.vertices.has(source) || !this.vertices.has(destination)) {
      return false;
    }
    
    // 移除正向边
    const sourceEdges = this.vertices.get(source);
    this.vertices.set(source, sourceEdges.filter(edge => edge.vertex !== destination));
    
    // 如果是无向图，移除反向边
    if (!this.isDirected) {
      const destEdges = this.vertices.get(destination);
      this.vertices.set(destination, destEdges.filter(edge => edge.vertex !== source));
    }
    
    return true;
  }

  // 获取顶点的邻居
  getNeighbors(vertex) {
    return this.vertices.get(vertex) || [];
  }

  // 获取所有顶点
  getVertices() {
    return Array.from(this.vertices.keys());
  }

  // 检查边是否存在
  hasEdge(source, destination) {
    if (!this.vertices.has(source)) {
      return false;
    }
    
    return this.vertices.get(source).some(edge => edge.vertex === destination);
  }

  // 获取顶点数量
  getVertexCount() {
    return this.vertices.size;
  }

  // 获取边数量
  getEdgeCount() {
    let count = 0;
    for (const edges of this.vertices.values()) {
      count += edges.length;
    }
    return this.isDirected ? count : count / 2;
  }

  // 深度优先搜索 (DFS)
  dfs(startVertex, visited = new Set(), result = []) {
    if (!this.vertices.has(startVertex)) {
      return result;
    }
    
    visited.add(startVertex);
    result.push(startVertex);
    
    const neighbors = this.getNeighbors(startVertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        this.dfs(neighbor.vertex, visited, result);
      }
    }
    
    return result;
  }

  // 广度优先搜索 (BFS)
  bfs(startVertex) {
    if (!this.vertices.has(startVertex)) {
      return [];
    }
    
    const visited = new Set();
    const queue = [startVertex];
    const result = [];
    
    visited.add(startVertex);
    
    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);
      
      const neighbors = this.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          visited.add(neighbor.vertex);
          queue.push(neighbor.vertex);
        }
      }
    }
    
    return result;
  }

  // 检查图是否连通（无向图）
  isConnected() {
    if (this.isDirected) {
      throw new Error('Connectivity check is for undirected graphs only');
    }
    
    const vertices = this.getVertices();
    if (vertices.length === 0) return true;
    
    const visited = this.dfs(vertices[0]);
    return visited.length === vertices.length;
  }

  // 检测环（有向图使用DFS）
  hasCycleDFS() {
    const visited = new Set();
    const recStack = new Set();
    
    for (const vertex of this.getVertices()) {
      if (!visited.has(vertex)) {
        if (this._hasCycleUtil(vertex, visited, recStack)) {
          return true;
        }
      }
    }
    
    return false;
  }

  _hasCycleUtil(vertex, visited, recStack) {
    visited.add(vertex);
    recStack.add(vertex);
    
    const neighbors = this.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      const neighborVertex = neighbor.vertex;
      
      if (!visited.has(neighborVertex)) {
        if (this._hasCycleUtil(neighborVertex, visited, recStack)) {
          return true;
        }
      } else if (recStack.has(neighborVertex)) {
        return true;
      }
    }
    
    recStack.delete(vertex);
    return false;
  }

  // 拓扑排序（仅适用于有向无环图）
  topologicalSort() {
    if (!this.isDirected) {
      throw new Error('Topological sort is for directed graphs only');
    }
    
    const visited = new Set();
    const stack = [];
    
    for (const vertex of this.getVertices()) {
      if (!visited.has(vertex)) {
        this._topologicalSortUtil(vertex, visited, stack);
      }
    }
    
    return stack.reverse();
  }

  _topologicalSortUtil(vertex, visited, stack) {
    visited.add(vertex);
    
    const neighbors = this.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        this._topologicalSortUtil(neighbor.vertex, visited, stack);
      }
    }
    
    stack.push(vertex);
  }

  // Dijkstra最短路径算法
  dijkstra(startVertex) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    // 初始化距离
    for (const vertex of this.getVertices()) {
      distances.set(vertex, vertex === startVertex ? 0 : Infinity);
      previous.set(vertex, null);
      unvisited.add(vertex);
    }
    
    while (unvisited.size > 0) {
      // 找到未访问顶点中距离最小的
      let current = null;
      let minDistance = Infinity;
      
      for (const vertex of unvisited) {
        if (distances.get(vertex) < minDistance) {
          minDistance = distances.get(vertex);
          current = vertex;
        }
      }
      
      if (current === null) break;
      
      unvisited.delete(current);
      
      // 更新邻居的距离
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (unvisited.has(neighbor.vertex)) {
          const newDistance = distances.get(current) + neighbor.weight;
          
          if (newDistance < distances.get(neighbor.vertex)) {
            distances.set(neighbor.vertex, newDistance);
            previous.set(neighbor.vertex, current);
          }
        }
      }
    }
    
    return { distances, previous };
  }

  // 获取两点间的最短路径
  getShortestPath(start, end) {
    const { distances, previous } = this.dijkstra(start);
    
    if (distances.get(end) === Infinity) {
      return null; // 无路径
    }
    
    const path = [];
    let current = end;
    
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current);
    }
    
    return {
      path,
      distance: distances.get(end)
    };
  }

  // 打印图
  printGraph() {
    console.log(`Graph (${this.isDirected ? 'Directed' : 'Undirected'}):`);
    for (const [vertex, edges] of this.vertices) {
      const edgeStr = edges.map(e => `${e.vertex}(${e.weight})`).join(', ');
      console.log(`${vertex} -> [${edgeStr}]`);
    }
  }
}

// 邻接矩阵实现的图
class MatrixGraph {
  constructor(size, isDirected = false) {
    this.size = size;
    this.isDirected = isDirected;
    this.matrix = Array(size).fill().map(() => Array(size).fill(0));
    this.vertices = new Map(); // 顶点名称到索引的映射
    this.indexToVertex = new Map(); // 索引到顶点名称的映射
    this.vertexCount = 0;
  }

  // 添加顶点
  addVertex(vertex) {
    if (this.vertices.has(vertex)) {
      return false;
    }
    
    if (this.vertexCount >= this.size) {
      throw new Error('Graph is full');
    }
    
    this.vertices.set(vertex, this.vertexCount);
    this.indexToVertex.set(this.vertexCount, vertex);
    this.vertexCount++;
    return true;
  }

  // 添加边
  addEdge(source, destination, weight = 1) {
    const sourceIndex = this.vertices.get(source);
    const destIndex = this.vertices.get(destination);
    
    if (sourceIndex === undefined || destIndex === undefined) {
      throw new Error('Vertex not found');
    }
    
    this.matrix[sourceIndex][destIndex] = weight;
    
    if (!this.isDirected) {
      this.matrix[destIndex][sourceIndex] = weight;
    }
  }

  // 移除边
  removeEdge(source, destination) {
    const sourceIndex = this.vertices.get(source);
    const destIndex = this.vertices.get(destination);
    
    if (sourceIndex === undefined || destIndex === undefined) {
      return false;
    }
    
    this.matrix[sourceIndex][destIndex] = 0;
    
    if (!this.isDirected) {
      this.matrix[destIndex][sourceIndex] = 0;
    }
    
    return true;
  }

  // 检查边是否存在
  hasEdge(source, destination) {
    const sourceIndex = this.vertices.get(source);
    const destIndex = this.vertices.get(destination);
    
    if (sourceIndex === undefined || destIndex === undefined) {
      return false;
    }
    
    return this.matrix[sourceIndex][destIndex] !== 0;
  }

  // 获取邻居
  getNeighbors(vertex) {
    const index = this.vertices.get(vertex);
    if (index === undefined) return [];
    
    const neighbors = [];
    for (let i = 0; i < this.vertexCount; i++) {
      if (this.matrix[index][i] !== 0) {
        neighbors.push({
          vertex: this.indexToVertex.get(i),
          weight: this.matrix[index][i]
        });
      }
    }
    
    return neighbors;
  }

  // 打印矩阵
  printMatrix() {
    console.log('Adjacency Matrix:');
    console.log('   ', Array.from(this.indexToVertex.values()).join(' '));
    
    for (let i = 0; i < this.vertexCount; i++) {
      const row = this.matrix[i].slice(0, this.vertexCount);
      console.log(this.indexToVertex.get(i), ' ', row.join(' '));
    }
  }
}

// 测试用例
function testGraph() {
  console.log('=== 邻接表图测试 ===');
  const graph = new Graph(false); // 无向图
  
  // 添加顶点和边
  graph.addEdge('A', 'B', 5);
  graph.addEdge('A', 'C', 3);
  graph.addEdge('B', 'D', 2);
  graph.addEdge('C', 'D', 4);
  graph.addEdge('D', 'E', 1);
  
  console.log('图结构:');
  graph.printGraph();
  
  console.log('\nDFS遍历 (从A开始):', graph.dfs('A'));
  console.log('BFS遍历 (从A开始):', graph.bfs('A'));
  
  console.log('\n图是否连通:', graph.isConnected());
  
  // 最短路径
  const shortestPath = graph.getShortestPath('A', 'E');
  console.log('\nA到E的最短路径:', shortestPath);
}

function testDirectedGraph() {
  console.log('\n=== 有向图测试 ===');
  const directedGraph = new Graph(true);
  
  // 构建有向无环图用于拓扑排序
  directedGraph.addEdge('A', 'C');
  directedGraph.addEdge('B', 'C');
  directedGraph.addEdge('B', 'D');
  directedGraph.addEdge('C', 'E');
  directedGraph.addEdge('D', 'F');
  directedGraph.addEdge('E', 'F');
  
  console.log('有向图结构:');
  directedGraph.printGraph();
  
  console.log('\n是否有环:', directedGraph.hasCycleDFS());
  console.log('拓扑排序:', directedGraph.topologicalSort());
}

function testMatrixGraph() {
  console.log('\n=== 邻接矩阵图测试 ===');
  const matrixGraph = new MatrixGraph(5, false);
  
  // 添加顶点
  ['A', 'B', 'C', 'D', 'E'].forEach(v => matrixGraph.addVertex(v));
  
  // 添加边
  matrixGraph.addEdge('A', 'B', 1);
  matrixGraph.addEdge('A', 'C', 1);
  matrixGraph.addEdge('B', 'D', 1);
  matrixGraph.addEdge('C', 'D', 1);
  matrixGraph.addEdge('D', 'E', 1);
  
  console.log('邻接矩阵表示:');
  matrixGraph.printMatrix();
  
  console.log('\nB的邻居:', matrixGraph.getNeighbors('B'));
}

// 运行测试
testGraph();
testDirectedGraph();
testMatrixGraph();

// 导出类
module.exports = {
  Graph,
  MatrixGraph
}; 