/**
 * 重排链表
 * 题目：给定一个单链表 L：L0→L1→…→Ln-1→Ln，
 * 将其重新排列后变为： L0→Ln→L1→Ln-1→L2→Ln-2→…
 * 
 * 示例：
 * 输入：1->2->3->4
 * 输出：1->4->2->3
 * 
 * 输入：1->2->3->4->5
 * 输出：1->5->2->4->3
 */

class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

/**
 * 重排链表
 * @param {ListNode} head
 * @return {void} 不返回任何值，原地修改链表
 */
function reorderList(head) {
    if (!head || !head.next || !head.next.next) return;
    
    // 1. 找到链表的中点
    let slow = head;
    let fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // 2. 反转后半部分链表
    let prev = null;
    let curr = slow.next;
    slow.next = null; // 断开前后两部分
    
    while (curr) {
        const nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    
    // 3. 合并两个链表
    let first = head;
    let second = prev;
    
    while (second) {
        const firstNext = first.next;
        const secondNext = second.next;
        
        first.next = second;
        second.next = firstNext;
        
        first = firstNext;
        second = secondNext;
    }
}

// 测试用例
function test() {
    // 创建链表: 1->2->3->4
    const head1 = new ListNode(1);
    head1.next = new ListNode(2);
    head1.next.next = new ListNode(3);
    head1.next.next.next = new ListNode(4);
    
    // 重排链表
    reorderList(head1);
    
    // 打印结果
    let values1 = [];
    let current = head1;
    while (current) {
        values1.push(current.val);
        current = current.next;
    }
    console.log('重排后的链表 (1->2->3->4)：', values1.join('->'));  // 应该输出 1->4->2->3
    
    // 创建链表: 1->2->3->4->5
    const head2 = new ListNode(1);
    head2.next = new ListNode(2);
    head2.next.next = new ListNode(3);
    head2.next.next.next = new ListNode(4);
    head2.next.next.next.next = new ListNode(5);
    
    // 重排链表
    reorderList(head2);
    
    // 打印结果
    let values2 = [];
    current = head2;
    while (current) {
        values2.push(current.val);
        current = current.next;
    }
    console.log('重排后的链表 (1->2->3->4->5)：', values2.join('->'));  // 应该输出 1->5->2->4->3
}

// 运行测试
test(); 