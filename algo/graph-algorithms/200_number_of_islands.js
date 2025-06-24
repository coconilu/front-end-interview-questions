/**
 * 200. 岛屿数量
 *
 * 给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
 * 岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。
 * 此外，你可以假设该网格的四条边均被水包围。
 *
 * 示例 1：
 * 输入：grid = [
 *   ["1","1","1","1","0"],
 *   ["1","1","0","1","0"],
 *   ["1","1","0","0","0"],
 *   ["0","0","0","0","0"]
 * ]
 * 输出：1
 *
 * 示例 2：
 * 输入：grid = [
 *   ["1","1","0","0","0"],
 *   ["1","1","0","0","0"],
 *   ["0","0","1","0","0"],
 *   ["0","0","0","1","1"]
 * ]
 * 输出：3
 */

/**
 * DFS解法
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
  if (!grid || grid.length === 0) {
    return 0;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  // DFS函数，用于标记与当前陆地相连的所有陆地
  function dfs(i, j) {
    // 边界检查
    if (i < 0 || i >= rows || j < 0 || j >= cols || grid[i][j] === '0') {
      return;
    }

    // 标记为已访问（将陆地变为水）
    grid[i][j] = '0';

    // 访问上、下、左、右四个方向
    dfs(i - 1, j); // 上
    dfs(i + 1, j); // 下
    dfs(i, j - 1); // 左
    dfs(i, j + 1); // 右
  }

  // 遍历整个网格
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        count++; // 发现一个新岛屿
        dfs(i, j); // 标记这个岛屿的所有陆地
      }
    }
  }

  return count;
};

/**
 * BFS解法
 * @param {character[][]} grid
 * @return {number}
 */
var numIslandsBFS = function (grid) {
  if (!grid || grid.length === 0) {
    return 0;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  // 方向数组：上、下、左、右
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  // BFS函数，用于标记与当前陆地相连的所有陆地
  function bfs(i, j) {
    const queue = [[i, j]];
    grid[i][j] = '0'; // 标记为已访问

    while (queue.length > 0) {
      const [row, col] = queue.shift();

      // 检查四个方向
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        // 边界检查
        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          grid[newRow][newCol] === '1'
        ) {
          queue.push([newRow, newCol]);
          grid[newRow][newCol] = '0'; // 标记为已访问
        }
      }
    }
  }

  // 遍历整个网格
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        count++; // 发现一个新岛屿
        bfs(i, j); // 标记这个岛屿的所有陆地
      }
    }
  }

  return count;
};
