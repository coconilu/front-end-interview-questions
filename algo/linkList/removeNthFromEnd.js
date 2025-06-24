/**
 * 删除链表的倒数第N个节点
 * 题目：给定一个链表，删除链表的倒数第 n 个节点，并且返回链表的头节点。
 *
 * 示例：
 * 输入：head = [1,2,3,4,5], n = 2
 * 输出：[1,2,3,5]
 * 解释：删除了倒数第2个节点（值为4的节点）
 */

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

/**
 * 删除链表的倒数第N个节点
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0);
  dummy.next = head;

  let first = dummy;
  let second = dummy;

  // 先让first指针向前移动n+1步
  for (let i = 0; i <= n; i++) {
    first = first.next;
  }

  // 同时移动first和second指针，直到first到达链表末尾
  while (first) {
    first = first.next;
    second = second.next;
  }

  // 删除目标节点
  second.next = second.next.next;

  return dummy.next;
}

// 测试用例
function test() {
  // 创建测试链表：1->2->3->4->5
  const head = new ListNode(1);
  head.next = new ListNode(2);
  head.next.next = new ListNode(3);
  head.next.next.next = new ListNode(4);
  head.next.next.next.next = new ListNode(5);

  // 删除倒数第2个节点
  const result = removeNthFromEnd(head, 2);

  // 打印结果
  console.log('删除倒数第2个节点后的链表：', printList(result));
}

// 辅助函数：打印链表
function printList(head) {
  const result = [];
  let curr = head;
  while (curr) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result.join('->');
}

// 运行测试
test();
