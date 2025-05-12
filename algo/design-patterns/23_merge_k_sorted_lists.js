/**
 * 23. 合并K个升序链表
 * 
 * 给你一个链表数组，每个链表都已经按升序排列。
 * 请你将所有链表合并到一个升序链表中，返回合并后的链表。
 * 
 * 示例 1：
 * 输入：lists = [[1,4,5],[1,3,4],[2,6]]
 * 输出：[1,1,2,3,4,4,5,6]
 * 解释：链表数组如下：
 * [
 *   1->4->5,
 *   1->3->4,
 *   2->6
 * ]
 * 将它们合并到一个有序链表中得到。
 * 1->1->2->3->4->4->5->6
 * 
 * 示例 2：
 * 输入：lists = []
 * 输出：[]
 * 
 * 示例 3：
 * 输入：lists = [[]]
 * 输出：[]
 */

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

/**
 * 方法一：分治合并
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function(lists) {
    if (!lists || lists.length === 0) {
        return null;
    }
    
    // 合并两个有序链表
    function mergeTwoLists(l1, l2) {
        const dummy = new ListNode(-1);
        let current = dummy;
        
        while (l1 !== null && l2 !== null) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        current.next = l1 === null ? l2 : l1;
        
        return dummy.next;
    }
    
    // 分治合并
    function merge(lists, left, right) {
        if (left === right) {
            return lists[left];
        }
        if (left > right) {
            return null;
        }
        
        const mid = Math.floor((left + right) / 2);
        return mergeTwoLists(merge(lists, left, mid), merge(lists, mid + 1, right));
    }
    
    return merge(lists, 0, lists.length - 1);
};

/**
 * 方法二：优先队列
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKListsHeap = function(lists) {
    if (!lists || lists.length === 0) {
        return null;
    }
    
    // 创建一个最小堆
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        
        // 获取父节点索引
        getParentIndex(i) {
            return Math.floor((i - 1) / 2);
        }
        
        // 获取左子节点索引
        getLeftIndex(i) {
            return 2 * i + 1;
        }
        
        // 获取右子节点索引
        getRightIndex(i) {
            return 2 * i + 2;
        }
        
        // 交换节点
        swap(i1, i2) {
            [this.heap[i1], this.heap[i2]] = [this.heap[i2], this.heap[i1]];
        }
        
        // 向上调整
        shiftUp(index) {
            if (index === 0) return;
            
            const parentIndex = this.getParentIndex(index);
            if (this.heap[parentIndex] && this.heap[parentIndex].val > this.heap[index].val) {
                this.swap(parentIndex, index);
                this.shiftUp(parentIndex);
            }
        }
        
        // 向下调整
        shiftDown(index) {
            const leftIndex = this.getLeftIndex(index);
            const rightIndex = this.getRightIndex(index);
            
            if (this.heap[leftIndex] && this.heap[leftIndex].val < this.heap[index].val) {
                this.swap(leftIndex, index);
                this.shiftDown(leftIndex);
            }
            
            if (this.heap[rightIndex] && this.heap[rightIndex].val < this.heap[index].val) {
                this.swap(rightIndex, index);
                this.shiftDown(rightIndex);
            }
        }
        
        // 插入节点
        insert(value) {
            this.heap.push(value);
            this.shiftUp(this.heap.length - 1);
        }
        
        // 删除堆顶
        pop() {
            if (this.heap.length === 0) {
                return null;
            }
            if (this.heap.length === 1) {
                return this.heap.pop();
            }
            
            const top = this.heap[0];
            this.heap[0] = this.heap.pop();
            this.shiftDown(0);
            
            return top;
        }
        
        // 获取堆大小
        size() {
            return this.heap.length;
        }
    }
    
    const dummy = new ListNode(-1);
    let current = dummy;
    const minHeap = new MinHeap();
    
    // 将所有链表的头节点加入堆
    for (const list of lists) {
        if (list) {
            minHeap.insert(list);
        }
    }
    
    // 不断从堆中取出最小节点，并将其下一个节点加入堆
    while (minHeap.size() > 0) {
        const node = minHeap.pop();
        current.next = node;
        current = current.next;
        
        if (node.next) {
            minHeap.insert(node.next);
        }
    }
    
    return dummy.next;
}; 