/**
 * 912. 排序数组
 * 
 * 给你一个整数数组 nums，请你将该数组升序排列。
 * 
 * 示例 1：
 * 输入：nums = [5,2,3,1]
 * 输出：[1,2,3,5]
 * 
 * 示例 2：
 * 输入：nums = [5,1,1,2,0,0]
 * 输出：[0,0,1,1,2,5]
 */

/**
 * 快速排序
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArray = function(nums) {
    if (nums.length <= 1) {
        return nums;
    }
    
    quickSort(nums, 0, nums.length - 1);
    return nums;
};

/**
 * 快速排序辅助函数
 * @param {number[]} nums
 * @param {number} left
 * @param {number} right
 */
function quickSort(nums, left, right) {
    if (left < right) {
        const pivotIndex = partition(nums, left, right);
        quickSort(nums, left, pivotIndex - 1);
        quickSort(nums, pivotIndex + 1, right);
    }
}

/**
 * 分区函数
 * @param {number[]} nums
 * @param {number} left
 * @param {number} right
 * @return {number}
 */
function partition(nums, left, right) {
    // 选择最右边的元素作为基准
    const pivot = nums[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
        if (nums[j] <= pivot) {
            i++;
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
    }
    
    [nums[i + 1], nums[right]] = [nums[right], nums[i + 1]];
    return i + 1;
}

/**
 * 归并排序
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArrayMerge = function(nums) {
    if (nums.length <= 1) {
        return nums;
    }
    
    return mergeSort(nums);
};

/**
 * 归并排序辅助函数
 * @param {number[]} nums
 * @return {number[]}
 */
function mergeSort(nums) {
    if (nums.length <= 1) {
        return nums;
    }
    
    const mid = Math.floor(nums.length / 2);
    const left = mergeSort(nums.slice(0, mid));
    const right = mergeSort(nums.slice(mid));
    
    return merge(left, right);
}

/**
 * 合并两个有序数组
 * @param {number[]} left
 * @param {number[]} right
 * @return {number[]}
 */
function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    // 将剩余元素添加到结果中
    while (i < left.length) {
        result.push(left[i]);
        i++;
    }
    
    while (j < right.length) {
        result.push(right[j]);
        j++;
    }
    
    return result;
}

/**
 * 堆排序
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArrayHeap = function(nums) {
    if (nums.length <= 1) {
        return nums;
    }
    
    // 构建最大堆
    buildMaxHeap(nums);
    
    // 堆排序
    for (let i = nums.length - 1; i > 0; i--) {
        // 将堆顶元素（最大值）与当前末尾元素交换
        [nums[0], nums[i]] = [nums[i], nums[0]];
        // 重新调整堆
        heapify(nums, 0, i);
    }
    
    return nums;
};

/**
 * 构建最大堆
 * @param {number[]} nums
 */
function buildMaxHeap(nums) {
    const n = nums.length;
    // 从最后一个非叶子节点开始向上调整
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(nums, i, n);
    }
}

/**
 * 调整堆
 * @param {number[]} nums
 * @param {number} i
 * @param {number} heapSize
 */
function heapify(nums, i, heapSize) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;
    
    // 找出当前节点、左子节点和右子节点中的最大值
    if (left < heapSize && nums[left] > nums[largest]) {
        largest = left;
    }
    
    if (right < heapSize && nums[right] > nums[largest]) {
        largest = right;
    }
    
    // 如果最大值不是当前节点，交换并继续调整
    if (largest !== i) {
        [nums[i], nums[largest]] = [nums[largest], nums[i]];
        heapify(nums, largest, heapSize);
    }
} 