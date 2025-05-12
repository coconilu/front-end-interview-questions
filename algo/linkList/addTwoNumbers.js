/**
 * 两数相加
 * 题目：给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，
 * 并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。
 * 
 * 示例：
 * 输入：l1 = [2,4,3], l2 = [5,6,4]
 * 输出：[7,0,8]
 * 解释：342 + 465 = 807.
 */

class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

/**
 * 两个链表表示的数字相加
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function addTwoNumbers(l1, l2) {
    const dummyHead = new ListNode(0);
    let current = dummyHead;
    let carry = 0;
    
    while (l1 !== null || l2 !== null) {
        const x = l1 ? l1.val : 0;
        const y = l2 ? l2.val : 0;
        
        const sum = x + y + carry;
        carry = Math.floor(sum / 10);
        
        current.next = new ListNode(sum % 10);
        current = current.next;
        
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }
    
    if (carry > 0) {
        current.next = new ListNode(carry);
    }
    
    return dummyHead.next;
}

// 测试用例
function test() {
    // 创建第一个链表: 2->4->3 (表示数字342)
    const l1 = new ListNode(2);
    l1.next = new ListNode(4);
    l1.next.next = new ListNode(3);
    
    // 创建第二个链表: 5->6->4 (表示数字465)
    const l2 = new ListNode(5);
    l2.next = new ListNode(6);
    l2.next.next = new ListNode(4);
    
    // 计算结果
    const result = addTwoNumbers(l1, l2);
    
    // 打印结果
    let values = [];
    let current = result;
    while (current) {
        values.push(current.val);
        current = current.next;
    }
    console.log('相加结果：', values.join('->'));  // 应该输出 7->0->8
    
    // 测试进位情况
    const l3 = new ListNode(9);
    l3.next = new ListNode(9);
    
    const l4 = new ListNode(1);
    
    const result2 = addTwoNumbers(l3, l4);
    let values2 = [];
    current = result2;
    while (current) {
        values2.push(current.val);
        current = current.next;
    }
    console.log('进位测试：', values2.join('->'));  // 应该输出 0->0->1
}

// 运行测试
test(); 