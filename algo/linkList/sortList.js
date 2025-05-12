/**
 * 排序链表
 * 题目：给你链表的头结点 head ，请将其按 升序 排列并返回 排序后的链表 。
 *
 * 示例：
 * 输入：head = [4,2,1,3]
 * 输出：[1,2,3,4]
 *
 * 输入：head = [-1,5,3,4,0]
 * 输出：[-1,0,3,4,5]
 */

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

/**
 * 对链表进行排序
 * @param {ListNode} head
 * @return {ListNode}
 */
function sortList(head) {
  // 基本情况：空链表或只有一个节点的链表已经是有序的
  if (!head || !head.next) return head;

  // 使用归并排序 - 分治法
  // 1. 找到链表中点，分割链表
  const mid = findMiddle(head);
  const right = mid.next;
  mid.next = null; // 切断链表

  // 2. 递归排序两个子链表
  const left = sortList(head);
  const sortedRight = sortList(right);

  // 3. 合并两个有序链表
  return mergeTwoLists(left, sortedRight);
}

/**
 * 找到链表的中点
 * @param {ListNode} head
 * @return {ListNode}
 */
function findMiddle(head) {
  let slow = head;
  let fast = head;

  // 快慢指针法找中点
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  return slow;
}

/**
 * 合并两个有序链表
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let current = dummy;

  while (l1 && l2) {
    if (l1.val < l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }

  // 连接剩余部分
  current.next = l1 || l2;

  return dummy.next;
}

// 测试用例
function test() {
  // 测试用例1: [4,2,1,3]
  const list1 = new ListNode(4);
  list1.next = new ListNode(2);
  list1.next.next = new ListNode(1);
  list1.next.next.next = new ListNode(3);

  let result1 = sortList(list1);
  let values1 = [];
  while (result1) {
    values1.push(result1.val);
    result1 = result1.next;
  }
  console.log("测试用例1结果:", values1); // 应该输出 [1,2,3,4]

  // 测试用例2: [-1,5,3,4,0]
  const list2 = new ListNode(-1);
  list2.next = new ListNode(5);
  list2.next.next = new ListNode(3);
  list2.next.next.next = new ListNode(4);
  list2.next.next.next.next = new ListNode(0);

  let result2 = sortList(list2);
  let values2 = [];
  while (result2) {
    values2.push(result2.val);
    result2 = result2.next;
  }
  console.log("测试用例2结果:", values2); // 应该输出 [-1,0,3,4,5]
}

// 运行测试
test();
