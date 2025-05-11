/**
 * 相交链表
 * 题目：编写一个程序，找到两个单链表相交的起始节点。
 * 
 * 示例：
 * 输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,0,1,8,4,5], skipA = 2, skipB = 3
 * 输出：Reference of the node with value = 8
 * 解释：相交节点的值为 8（注意，如果两个链表相交则不能为 0）。
 * 从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，链表 B 为 [5,0,1,8,4,5]。
 * 在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点。
 */

class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

/**
 * 获取两个链表的相交节点
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
function getIntersectionNode(headA, headB) {
    if (!headA || !headB) return null;
    
    let pA = headA;
    let pB = headB;
    
    while (pA !== pB) {
        pA = pA ? pA.next : headB;
        pB = pB ? pB.next : headA;
    }
    
    return pA;
}

// 测试用例
function test() {
    // 创建相交链表
    // 链表A: 4->1->8->4->5
    // 链表B: 5->0->1->8->4->5
    // 相交节点值为8
    
    const intersect = new ListNode(8);
    intersect.next = new ListNode(4);
    intersect.next.next = new ListNode(5);
    
    const headA = new ListNode(4);
    headA.next = new ListNode(1);
    headA.next.next = intersect;
    
    const headB = new ListNode(5);
    headB.next = new ListNode(0);
    headB.next.next = new ListNode(1);
    headB.next.next.next = intersect;
    
    const result = getIntersectionNode(headA, headB);
    console.log('相交节点的值：', result ? result.val : null);
}

// 运行测试
test(); 