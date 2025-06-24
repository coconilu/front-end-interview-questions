/**
 * 二叉树遍历算法
 * 包含前序遍历、中序遍历、后序遍历和层序遍历的递归和迭代实现
 */

// 二叉树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * 前序遍历 - 递归实现 (根->左->右)
 * 时间复杂度: O(n)
 * 空间复杂度: O(h)，h为树的高度
 * @param {TreeNode} root
 * @returns {Array}
 */
function preorderTraversalRecursive(root) {
  const result = [];

  function traverse(node) {
    if (!node) return;

    // 根节点
    result.push(node.val);
    // 左子树
    traverse(node.left);
    // 右子树
    traverse(node.right);
  }

  traverse(root);
  return result;
}

/**
 * 前序遍历 - 迭代实现
 * @param {TreeNode} root
 * @returns {Array}
 */
function preorderTraversalIterative(root) {
  if (!root) return [];

  const result = [];
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);

    // 注意：先压入右子节点，再压入左子节点，这样出栈时才是左子节点先出栈
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }

  return result;
}

/**
 * 中序遍历 - 递归实现 (左->根->右)
 * @param {TreeNode} root
 * @returns {Array}
 */
function inorderTraversalRecursive(root) {
  const result = [];

  function traverse(node) {
    if (!node) return;

    // 左子树
    traverse(node.left);
    // 根节点
    result.push(node.val);
    // 右子树
    traverse(node.right);
  }

  traverse(root);
  return result;
}

/**
 * 中序遍历 - 迭代实现
 * @param {TreeNode} root
 * @returns {Array}
 */
function inorderTraversalIterative(root) {
  const result = [];
  const stack = [];
  let curr = root;

  while (curr || stack.length) {
    // 遍历左子树，并将节点入栈
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }

    // 弹出栈顶节点，访问根节点
    curr = stack.pop();
    result.push(curr.val);

    // 转向右子树
    curr = curr.right;
  }

  return result;
}

/**
 * 后序遍历 - 递归实现 (左->右->根)
 * @param {TreeNode} root
 * @returns {Array}
 */
function postorderTraversalRecursive(root) {
  const result = [];

  function traverse(node) {
    if (!node) return;

    // 左子树
    traverse(node.left);
    // 右子树
    traverse(node.right);
    // 根节点
    result.push(node.val);
  }

  traverse(root);
  return result;
}

/**
 * 后序遍历 - 迭代实现
 * @param {TreeNode} root
 * @returns {Array}
 */
function postorderTraversalIterative(root) {
  if (!root) return [];

  const result = [];
  const stack = [root];

  // 后序遍历是左->右->根，我们可以通过修改前序遍历(根->左->右)得到(根->右->左)
  // 然后反转得到(左->右->根)
  while (stack.length) {
    const node = stack.pop();
    result.unshift(node.val); // 在结果前面插入，相当于反转

    // 先压左子节点，再压右子节点
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }

  return result;
}

/**
 * 层序遍历（广度优先搜索）
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * @param {TreeNode} root
 * @returns {Array[]}
 */
function levelOrderTraversal(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

// 创建一个测试二叉树
//       1
//      / \
//     2   3
//    / \   \
//   4   5   6
//  /
// 7
function createTestTree() {
  const node7 = new TreeNode(7);
  const node4 = new TreeNode(4, node7);
  const node5 = new TreeNode(5);
  const node6 = new TreeNode(6);
  const node2 = new TreeNode(2, node4, node5);
  const node3 = new TreeNode(3, null, node6);
  const root = new TreeNode(1, node2, node3);

  return root;
}

// 测试
const root = createTestTree();

console.log('前序遍历 (递归):', preorderTraversalRecursive(root)); // [1, 2, 4, 7, 5, 3, 6]
console.log('前序遍历 (迭代):', preorderTraversalIterative(root)); // [1, 2, 4, 7, 5, 3, 6]

console.log('中序遍历 (递归):', inorderTraversalRecursive(root)); // [7, 4, 2, 5, 1, 3, 6]
console.log('中序遍历 (迭代):', inorderTraversalIterative(root)); // [7, 4, 2, 5, 1, 3, 6]

console.log('后序遍历 (递归):', postorderTraversalRecursive(root)); // [7, 4, 5, 2, 6, 3, 1]
console.log('后序遍历 (迭代):', postorderTraversalIterative(root)); // [7, 4, 5, 2, 6, 3, 1]

console.log('层序遍历:', levelOrderTraversal(root)); // [[1], [2, 3], [4, 5, 6], [7]]

module.exports = {
  TreeNode,
  preorderTraversalRecursive,
  preorderTraversalIterative,
  inorderTraversalRecursive,
  inorderTraversalIterative,
  postorderTraversalRecursive,
  postorderTraversalIterative,
  levelOrderTraversal,
};
