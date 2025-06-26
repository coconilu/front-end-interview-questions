/**
 * 二叉搜索树(Binary Search Tree)实现
 * 
 * 二叉搜索树是一种特殊的二叉树，对于任意节点：
 * - 左子树中所有节点的值都小于该节点的值
 * - 右子树中所有节点的值都大于该节点的值
 * - 左右子树也都是二叉搜索树
 */

// 二叉搜索树节点
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

// 二叉搜索树实现
class BinarySearchTree {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  // 插入节点
  insert(value) {
    this.root = this._insertNode(this.root, value);
    this.size++;
  }

  // 递归插入节点的辅助方法
  _insertNode(node, value) {
    // 如果当前节点为空，创建新节点
    if (node === null) {
      return new TreeNode(value);
    }

    // 根据值的大小决定插入位置
    if (value < node.value) {
      node.left = this._insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this._insertNode(node.right, value);
    }
    // 如果值相等，不插入重复值

    return node;
  }

  // 删除节点
  remove(value) {
    const originalSize = this.size;
    this.root = this._removeNode(this.root, value);
    return this.size < originalSize;
  }

  // 递归删除节点的辅助方法
  _removeNode(node, value) {
    if (node === null) {
      return null;
    }

    if (value < node.value) {
      node.left = this._removeNode(node.left, value);
    } else if (value > node.value) {
      node.right = this._removeNode(node.right, value);
    } else {
      // 找到要删除的节点
      this.size--;

      // 情况1: 节点没有子节点
      if (node.left === null && node.right === null) {
        return null;
      }

      // 情况2: 节点只有右子节点
      if (node.left === null) {
        return node.right;
      }

      // 情况3: 节点只有左子节点
      if (node.right === null) {
        return node.left;
      }

      // 情况4: 节点有两个子节点
      // 找到右子树中的最小值节点（中序后继）
      const minNode = this._findMin(node.right);
      node.value = minNode.value;
      node.right = this._removeNode(node.right, minNode.value);
      this.size++; // 因为上面的递归调用会减少size，这里需要补回来
    }

    return node;
  }

  // 查找最小值节点
  _findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  // 查找最大值节点
  _findMax(node) {
    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  // 搜索节点
  search(value) {
    return this._searchNode(this.root, value);
  }

  // 递归搜索节点的辅助方法
  _searchNode(node, value) {
    if (node === null) {
      return false;
    }

    if (value === node.value) {
      return true;
    }

    if (value < node.value) {
      return this._searchNode(node.left, value);
    } else {
      return this._searchNode(node.right, value);
    }
  }

  // 获取最小值
  getMin() {
    if (this.root === null) {
      return null;
    }
    return this._findMin(this.root).value;
  }

  // 获取最大值
  getMax() {
    if (this.root === null) {
      return null;
    }
    return this._findMax(this.root).value;
  }

  // 中序遍历 (左 -> 根 -> 右) - 结果是有序的
  inorderTraversal() {
    const result = [];
    this._inorder(this.root, result);
    return result;
  }

  _inorder(node, result) {
    if (node !== null) {
      this._inorder(node.left, result);
      result.push(node.value);
      this._inorder(node.right, result);
    }
  }

  // 前序遍历 (根 -> 左 -> 右)
  preorderTraversal() {
    const result = [];
    this._preorder(this.root, result);
    return result;
  }

  _preorder(node, result) {
    if (node !== null) {
      result.push(node.value);
      this._preorder(node.left, result);
      this._preorder(node.right, result);
    }
  }

  // 后序遍历 (左 -> 右 -> 根)
  postorderTraversal() {
    const result = [];
    this._postorder(this.root, result);
    return result;
  }

  _postorder(node, result) {
    if (node !== null) {
      this._postorder(node.left, result);
      this._postorder(node.right, result);
      result.push(node.value);
    }
  }

  // 层序遍历 (广度优先)
  levelOrderTraversal() {
    if (this.root === null) {
      return [];
    }

    const result = [];
    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node.value);

      if (node.left !== null) {
        queue.push(node.left);
      }
      if (node.right !== null) {
        queue.push(node.right);
      }
    }

    return result;
  }

  // 计算树的高度
  getHeight() {
    return this._calculateHeight(this.root);
  }

  _calculateHeight(node) {
    if (node === null) {
      return -1;
    }

    const leftHeight = this._calculateHeight(node.left);
    const rightHeight = this._calculateHeight(node.right);
    
    return Math.max(leftHeight, rightHeight) + 1;
  }

  // 检查是否为空
  isEmpty() {
    return this.root === null;
  }

  // 获取节点数量
  getSize() {
    return this.size;
  }

  // 清空树
  clear() {
    this.root = null;
    this.size = 0;
  }

  // 验证是否为有效的二叉搜索树
  isValidBST() {
    return this._validateBST(this.root, null, null);
  }

  _validateBST(node, min, max) {
    if (node === null) {
      return true;
    }

    if ((min !== null && node.value <= min) || 
        (max !== null && node.value >= max)) {
      return false;
    }

    return this._validateBST(node.left, min, node.value) &&
           this._validateBST(node.right, node.value, max);
  }

  // 查找前驱节点（中序遍历中的前一个节点）
  findPredecessor(value) {
    const node = this._findNode(this.root, value);
    if (!node) return null;

    // 如果有左子树，前驱是左子树的最大值
    if (node.left) {
      return this._findMax(node.left).value;
    }

    // 否则，前驱是某个祖先节点
    let predecessor = null;
    let current = this.root;

    while (current !== node) {
      if (value > current.value) {
        predecessor = current;
        current = current.right;
      } else {
        current = current.left;
      }
    }

    return predecessor ? predecessor.value : null;
  }

  // 查找后继节点（中序遍历中的下一个节点）
  findSuccessor(value) {
    const node = this._findNode(this.root, value);
    if (!node) return null;

    // 如果有右子树，后继是右子树的最小值
    if (node.right) {
      return this._findMin(node.right).value;
    }

    // 否则，后继是某个祖先节点
    let successor = null;
    let current = this.root;

    while (current !== node) {
      if (value < current.value) {
        successor = current;
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return successor ? successor.value : null;
  }

  // 查找节点对象
  _findNode(node, value) {
    if (node === null || node.value === value) {
      return node;
    }

    if (value < node.value) {
      return this._findNode(node.left, value);
    } else {
      return this._findNode(node.right, value);
    }
  }

  // 打印树结构（简单的文本表示）
  printTree() {
    if (this.root === null) {
      console.log('Tree is empty');
      return;
    }

    this._printNode(this.root, '', true);
  }

  _printNode(node, prefix, isLast) {
    if (node !== null) {
      console.log(prefix + (isLast ? '└── ' : '├── ') + node.value);
      
      const children = [];
      if (node.left) children.push(node.left);
      if (node.right) children.push(node.right);
      
      children.forEach((child, index) => {
        const isLastChild = index === children.length - 1;
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        
        if (child === node.left && node.right) {
          this._printNode(child, childPrefix, false);
        } else {
          this._printNode(child, childPrefix, isLastChild);
        }
      });
    }
  }
}

// 测试用例
function testBinarySearchTree() {
  console.log('=== 二叉搜索树测试 ===');
  const bst = new BinarySearchTree();

  // 插入元素
  const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45];
  values.forEach(value => bst.insert(value));
  
  console.log('插入元素:', values);
  console.log('树的大小:', bst.getSize());
  console.log('树的高度:', bst.getHeight());

  // 遍历
  console.log('中序遍历 (有序):', bst.inorderTraversal());
  console.log('前序遍历:', bst.preorderTraversal());
  console.log('后序遍历:', bst.postorderTraversal());
  console.log('层序遍历:', bst.levelOrderTraversal());

  // 搜索
  console.log('查找 40:', bst.search(40)); // true
  console.log('查找 90:', bst.search(90)); // false

  // 最小值和最大值
  console.log('最小值:', bst.getMin()); // 10
  console.log('最大值:', bst.getMax()); // 80

  // 前驱和后继
  console.log('30的前驱:', bst.findPredecessor(30)); // 25
  console.log('30的后继:', bst.findSuccessor(30));   // 35

  // 删除元素
  console.log('删除 20:', bst.remove(20));
  console.log('删除后中序遍历:', bst.inorderTraversal());

  // 验证BST
  console.log('是否为有效BST:', bst.isValidBST()); // true

  // 打印树结构
  console.log('\n树结构:');
  bst.printTree();
}

// 运行测试
testBinarySearchTree();

// 导出类
module.exports = {
  TreeNode,
  BinarySearchTree
}; 