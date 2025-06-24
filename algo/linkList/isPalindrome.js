/**
 * 回文链表
 * 题目：给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。
 *
 * 示例：
 * 输入：head = [1,2,2,1]
 * 输出：true
 *
 * 输入：head = [1,2]
 * 输出：false
 */

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// 用于递归解法的全局变量
let frontPointer;

/**
 * 递归方式判断链表是否为回文链表
 * @param {ListNode} currentNode
 * @return {boolean}
 */
function isPalindromeRecursive(currentNode) {
  if (currentNode !== null) {
    if (!isPalindromeRecursive(currentNode.next)) {
      return false;
    }
    if (currentNode.val !== frontPointer.val) {
      return false;
    }
    frontPointer = frontPointer.next;
  }
  return true;
}

/**
 * 递归解法的主函数
 * @param {ListNode} head
 * @return {boolean}
 */
function isPalindromeRecursiveSolution(head) {
  frontPointer = head;
  return isPalindromeRecursive(head);
}

/**
 * 判断链表是否为回文链表
 * @param {ListNode} head
 * @return {boolean}
 */
function isPalindrome(head) {
  if (!head || !head.next) return true;

  // 1. 使用快慢指针找到链表中点
  let slow = head;
  let fast = head;

  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // 2. 反转后半部分链表
  let secondHalf = reverseList(slow.next);

  // 3. 比较前半部分和反转后的后半部分
  let p1 = head;
  let p2 = secondHalf;
  let result = true;

  while (result && p2) {
    if (p1.val !== p2.val) result = false;
    p1 = p1.next;
    p2 = p2.next;
  }

  // 4. 恢复链表（可选）
  slow.next = reverseList(secondHalf);

  return result;
}

/**
 * 反转链表
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}

/**
 * 使用数组判断链表是否为回文链表
 * @param {ListNode} head
 * @return {boolean}
 */
function isPalindromeArray(head) {
  // 将链表值存入数组
  const values = [];
  let current = head;
  while (current) {
    values.push(current.val);
    current = current.next;
  }

  // 使用双指针判断数组是否为回文
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    if (values[left] !== values[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// 修改测试函数，添加数组解法的测试
function test() {
  // 测试用例1: [1,2,2,1] - 回文
  const list1 = new ListNode(1);
  list1.next = new ListNode(2);
  list1.next.next = new ListNode(2);
  list1.next.next.next = new ListNode(1);

  console.log('测试用例1结果 (迭代解法):', isPalindrome(list1)); // 应该输出 true
  console.log(
    '测试用例1结果 (递归解法):',
    isPalindromeRecursiveSolution(list1)
  ); // 应该输出 true
  console.log('测试用例1结果 (数组解法):', isPalindromeArray(list1)); // 应该输出 true

  // 测试用例2: [1,2] - 非回文
  const list2 = new ListNode(1);
  list2.next = new ListNode(2);

  console.log('测试用例2结果 (迭代解法):', isPalindrome(list2)); // 应该输出 false
  console.log(
    '测试用例2结果 (递归解法):',
    isPalindromeRecursiveSolution(list2)
  ); // 应该输出 false
  console.log('测试用例2结果 (数组解法):', isPalindromeArray(list2)); // 应该输出 false
}

// 运行测试
test();
