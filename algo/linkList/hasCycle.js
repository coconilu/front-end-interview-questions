/**
 * 环形链表检测
 * 题目：给定一个链表，判断链表中是否有环。如果链表中存在环，则返回 true，否则返回 false。
 *
 * 示例：
 * 输入：head = [3,2,0,-4], pos = 1
 * 输出：true
 * 解释：链表中有一个环，其尾部连接到第二个节点。
 */

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

/**
 * 使用快慢指针检测环形链表
 * @param {ListNode} head
 * @return {boolean}
 */
function hasCycle(head) {
  if (!head || !head.next) {
    return false;
  }

  let slow = head;
  let fast = head.next;

  while (slow !== fast) {
    if (!fast || !fast.next) {
      return false;
    }
    slow = slow.next;
    fast = fast.next.next;
  }

  return true;
}

// 测试用例
function test() {
  // 创建有环的链表：3->2->0->-4->2
  const head = new ListNode(3);
  const node2 = new ListNode(2);
  const node0 = new ListNode(0);
  const node4 = new ListNode(-4);

  head.next = node2;
  node2.next = node0;
  node0.next = node4;
  node4.next = node2; // 形成环

  console.log('是否有环：', hasCycle(head));

  // 创建无环的链表：1->2->3->4
  const head2 = new ListNode(1);
  head2.next = new ListNode(2);
  head2.next.next = new ListNode(3);
  head2.next.next.next = new ListNode(4);

  console.log('是否有环：', hasCycle(head2));
}

// 运行测试
test();
