/**
 * 226. 翻转二叉树
 *
 * 翻转一棵二叉树。
 *
 * 示例：
 * 输入：
 *      4
 *    /   \
 *   2     7
 *  / \   / \
 * 1   3 6   9
 *
 * 输出：
 *      4
 *    /   \
 *   7     2
 *  / \   / \
 * 9   6 3   1
 */

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

/**
 * 递归解法
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function (root) {
  if (!root) return null;

  // 交换左右子树
  const temp = root.left;
  root.left = root.right;
  root.right = temp;

  // 递归翻转左右子树
  invertTree(root.left);
  invertTree(root.right);

  return root;
};

/**
 * 迭代解法 (BFS)
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTreeBFS = function (root) {
  if (!root) return null;

  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();

    // 交换左右子树
    const temp = node.left;
    node.left = node.right;
    node.right = temp;

    // 将左右子节点加入队列
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return root;
};
