/**
 * 合并两个有序链表
 * 题目：将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。
 * 
 * 示例：
 * 输入：l1 = [1,2,4], l2 = [1,3,4]
 * 输出：[1,1,2,3,4,4]
 */

class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
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
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    // 处理剩余节点
    current.next = l1 || l2;
    
    return dummy.next;
}

// 测试用例
function test() {
    // 创建第一个链表：1->2->4
    const l1 = new ListNode(1);
    l1.next = new ListNode(2);
    l1.next.next = new ListNode(4);
    
    // 创建第二个链表：1->3->4
    const l2 = new ListNode(1);
    l2.next = new ListNode(3);
    l2.next.next = new ListNode(4);
    
    // 合并链表
    const merged = mergeTwoLists(l1, l2);
    
    // 打印结果
    console.log('合并后的链表：', printList(merged));
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