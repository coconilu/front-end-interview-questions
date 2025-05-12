/**
 * 101. 对称二叉树
 * 
 * 给定一个二叉树，检查它是否是镜像对称的。
 * 
 * 例如，二叉树 [1,2,2,3,4,4,3] 是对称的。
 *     1
 *    / \
 *   2   2
 *  / \ / \
 * 3  4 4  3
 * 
 * 但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的:
 *     1
 *    / \
 *   2   2
 *    \   \
 *    3    3
 * 
 * 进阶：你可以运用递归和迭代两种方法解决这个问题吗？
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
 * @return {boolean}
 */
var isSymmetric = function(root) {
    if (!root) return true;
    
    const isMirror = (left, right) => {
        // 两个节点都为空，对称
        if (!left && !right) return true;
        // 一个节点为空，一个不为空，不对称
        if (!left || !right) return false;
        // 两个节点值不相等，不对称
        if (left.val !== right.val) return false;
        
        // 递归检查外侧和内侧是否对称
        return isMirror(left.left, right.right) && isMirror(left.right, right.left);
    };
    
    return isMirror(root.left, root.right);
};

/**
 * 迭代解法
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetricIterative = function(root) {
    if (!root) return true;
    
    const queue = [root.left, root.right];
    
    while (queue.length > 0) {
        const left = queue.shift();
        const right = queue.shift();
        
        // 两个节点都为空，继续
        if (!left && !right) continue;
        // 一个节点为空，一个不为空，不对称
        if (!left || !right) return false;
        // 两个节点值不相等，不对称
        if (left.val !== right.val) return false;
        
        // 将外侧和内侧节点加入队列
        queue.push(left.left);
        queue.push(right.right);
        queue.push(left.right);
        queue.push(right.left);
    }
    
    return true;
}; 