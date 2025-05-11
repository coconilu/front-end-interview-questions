/**
 * 深度优先搜索 (DFS) 算法
 * 时间复杂度：O(V + E)，其中 V 是顶点数，E 是边数
 * 空间复杂度：O(V)
 */

// 图的邻接表表示
class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  // 添加顶点
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  // 添加边 (无向图)
  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
    this.adjacencyList[vertex2].push(vertex1);
  }

  // 深度优先搜索 - 递归实现
  dfsRecursive(start) {
    const result = [];
    const visited = {};
    const adjacencyList = this.adjacencyList;

    (function dfs(vertex) {
      if (!vertex) return null;
      visited[vertex] = true;
      result.push(vertex);
      
      adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          return dfs(neighbor);
        }
      });
    })(start);

    return result;
  }

  // 深度优先搜索 - 迭代实现
  dfsIterative(start) {
    const stack = [start];
    const result = [];
    const visited = {};
    visited[start] = true;

    while (stack.length) {
      const currentVertex = stack.pop();
      result.push(currentVertex);

      this.adjacencyList[currentVertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      });
    }
    
    return result;
  }
}

// 测试
const g = new Graph();
g.addVertex("A");
g.addVertex("B");
g.addVertex("C");
g.addVertex("D");
g.addVertex("E");
g.addVertex("F");

g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("C", "E");
g.addEdge("D", "E");
g.addEdge("D", "F");
g.addEdge("E", "F");

// DFS: ["A", "B", "D", "E", "C", "F"]
console.log(g.dfsRecursive("A"));
// DFS: ["A", "C", "E", "F", "D", "B"]
console.log(g.dfsIterative("A"));

module.exports = Graph; 