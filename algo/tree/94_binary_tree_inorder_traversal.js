/**
 * 94. 二叉树的中序遍历
 * 
 * 给定一个二叉树，返回它的中序遍历。
 * 
 * 示例:
 * 输入: [1,null,2,3]
 *    1
 *     \
 *      2
 *     /
 *    3
 * 输出: [1,3,2]
 * 
 * 进阶: 递归算法很简单，你可以通过迭代算法完成吗？
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
 * @return {number[]}
 */
var inorderTraversal = function(root) {
    const result = [];
    
    const inorder = (node) => {
        if (!node) return;
        
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    };
    
    inorder(root);
    return result;
};

/**
 * 迭代解法
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversalIterative = function(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current || stack.length > 0) {
        // 遍历到最左节点
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // 处理节点
        current = stack.pop();
        result.push(current.val);
        
        // 转向右子树
        current = current.right;
    }
    
    return result;
}; 