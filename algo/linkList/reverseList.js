/**
 * 反转链表
 * 题目：给定一个单链表的头节点 head，请反转链表，并返回反转后的链表。
 * 
 * 示例：
 * 输入：1->2->3->4->5
 * 输出：5->4->3->2->1
 */

// 链表节点定义
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

/**
 * 迭代方式反转链表
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
}

/**
 * 递归方式反转链表
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseListRecursive(head) {
    if (!head || !head.next) {
        return head;
    }
    
    const newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}

// 测试用例
function test() {
    // 创建测试链表：1->2->3->4->5
    const head = new ListNode(1);
    head.next = new ListNode(2);
    head.next.next = new ListNode(3);
    head.next.next.next = new ListNode(4);
    head.next.next.next.next = new ListNode(5);
    
    // 测试迭代方法
    const reversed1 = reverseList(head);
    console.log('迭代方法结果：', printList(reversed1));
    
    // 测试递归方法
    const reversed2 = reverseListRecursive(reversed1);
    console.log('递归方法结果：', printList(reversed2));
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