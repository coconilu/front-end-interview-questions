/**
 * 环形链表 II
 * 题目：给定一个链表，返回链表开始入环的第一个节点。如果链表无环，则返回 null。
 *
 * 示例：
 * 输入：head = [3,2,0,-4]，其中-4指向节点2
 * 输出：返回节点2
 * 解释：链表中有一个环，其尾部连接到第二个节点。
 */

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

/**
 * 检测链表中环的起始节点
 * @param {ListNode} head
 * @return {ListNode}
 */
function detectCycle(head) {
  if (!head || !head.next) return null;

  // 使用快慢指针检测是否有环
  let slow = head;
  let fast = head;
  let hasCycle = false;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      hasCycle = true;
      break;
    }
  }

  // 如果没有环，返回null
  if (!hasCycle) return null;

  // 找到环的入口
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }

  return slow;
}

// 测试用例
function test() {
  // 创建一个有环的链表: 3->2->0->-4->2(环)
  const head = new ListNode(3);
  const node2 = new ListNode(2);
  const node3 = new ListNode(0);
  const node4 = new ListNode(-4);

  head.next = node2;
  node2.next = node3;
  node3.next = node4;
  node4.next = node2; // 形成环，指向第二个节点

  const result = detectCycle(head);
  console.log("环的入口节点值：", result ? result.val : null); // 应该输出 2

  // 测试无环的情况
  const head2 = new ListNode(1);
  head2.next = new ListNode(2);
  head2.next.next = new ListNode(3);

  const result2 = detectCycle(head2);
  console.log("无环情况：", result2 ? result2.val : null); // 应该输出 null
}

// 运行测试
test();
