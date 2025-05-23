/**
 * Vue Diff算法与最长公共子序列
 *
 * 面试题：如果面试官要求写一个Vue在diff虚拟DOM时用到的最长公共子序列算法，如何实现？
 */

/**
 * 1. 最长公共子序列（LCS）基本概念
 * 
 * 在Vue3的diff算法中，最长公共子序列（实际上是最长递增子序列）被用于
 * 确定哪些节点保持不动，哪些需要移动，从而最小化DOM操作次数。
 * 这在处理节点列表更新时尤为重要。
 */

/**
 * 2. 最长递增子序列算法实现
 * 
 * 该算法返回数组中最长递增子序列的索引数组
 * 时间复杂度：O(NlogN)
 * 空间复杂度：O(N)
 */
function getSequence(arr) {
  // 数组长度
  const len = arr.length;
  // 用于存储最长递增子序列对应的索引
  const result = [0];
  // 存储在result中记录的元素在arr中的前一个索引，用于回溯
  const p = arr.slice();
  let start, end, middle;
  
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    
    // 当前项为0表示是新增节点，不参与最长递增子序列的计算
    if (arrI !== 0) {
      // 获取result中的最后一项的索引
      const lastResultIndex = result[result.length - 1];
      
      // 如果当前项大于result最后一项对应的值，直接将当前索引添加到result中
      if (arr[lastResultIndex] < arrI) {
        p[i] = lastResultIndex;
        result.push(i);
        continue;
      }
      
      // 使用二分查找，找到result中第一个大于等于arrI的位置
      start = 0;
      end = result.length - 1;
      
      while (start < end) {
        middle = (start + end) >> 1;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      
      // 更新result中对应位置的值为当前索引
      if (arrI < arr[result[start]]) {
        if (start > 0) {
          p[i] = result[start - 1];
        }
        result[start] = i;
      }
    }
  }
  
  // 回溯，从后向前查找，得到正确的最长递增子序列
  let resultLen = result.length;
  let last = result[resultLen - 1];
  
  while (resultLen-- > 0) {
    result[resultLen] = last;
    last = p[last];
  }
  
  return result;
}

/**
 * 3. 在Vue3 Diff算法中的应用（伪代码）
 */
function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
  let i = 0;
  const l2 = c2.length;
  // 旧节点的结束索引
  let e1 = c1.length - 1;
  // 新节点的结束索引
  let e2 = l2 - 1;
  
  // 1. 从头部开始比对
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVNodeType(n1, n2)) {
      // 递归比对子节点
      patch(n1, n2);
    } else {
      break;
    }
    i++;
  }
  
  // 2. 从尾部开始比对
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2);
    } else {
      break;
    }
    e1--;
    e2--;
  }
  
  // 3. 处理公共序列外的节点
  if (i > e1) {
    // 说明旧节点比对完了，但新节点还有剩余，需要新增节点
    if (i <= e2) {
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
      while (i <= e2) {
        // 挂载新节点
        mount(c2[i], container, anchor);
        i++;
      }
    }
  } else if (i > e2) {
    // 说明新节点比对完了，但旧节点还有剩余，需要删除节点
    while (i <= e1) {
      // 卸载旧节点
      unmount(c1[i]);
      i++;
    }
  } else {
    // 4. 处理乱序部分（核心diff算法）
    
    // 旧子节点的开始索引和个数
    const s1 = i;
    const s2 = i;
    
    // 新节点总数量
    const toBePatched = e2 - s2 + 1;
    // 已处理的新节点数量
    let patched = 0;
    
    // 构建新节点的key到索引的映射
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      if (nextChild.key != null) {
        keyToNewIndexMap.set(nextChild.key, i);
      }
    }
    
    // 用于存储新节点在旧节点中的位置映射
    // 例如：newIndexToOldIndexMap[newIndex - s2] = oldIndex + 1
    // +1是为了避免i=0的情况，0表示新节点在旧节点中不存在
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
    
    // 是否需要移动节点
    let moved = false;
    // 用于检测是否需要移动节点
    let maxNewIndexSoFar = 0;
    
    // 遍历旧节点，找到可复用的节点并标记
    for (let i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      
      // 如果已处理的节点数量大于等于需要处理的节点数量，说明剩余的旧节点都是需要删除的
      if (patched >= toBePatched) {
        unmount(prevChild);
        continue;
      }
      
      // 查找旧节点在新节点中的位置
      let newIndex;
      if (prevChild.key != null) {
        // 有key，通过key查找
        newIndex = keyToNewIndexMap.get(prevChild.key);
      } else {
        // 没有key，遍历查找相同类型的节点
        for (let j = s2; j <= e2; j++) {
          if (newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j])) {
            newIndex = j;
            break;
          }
        }
      }
      
      // 如果在新节点中找不到，说明旧节点需要被删除
      if (newIndex === undefined) {
        unmount(prevChild);
      } else {
        // 记录新节点在旧节点中的位置
        // +1是为了避免i=0的情况
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        
        // 检查是否需要移动节点
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
        
        // 更新复用的节点
        patch(prevChild, c2[newIndex]);
        patched++;
      }
    }
    
    // 5. 移动和挂载节点
    
    // 生成最长递增子序列（仅当需要移动节点时）
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : [];
    
    // j指向最长递增子序列的最后一个位置
    let j = increasingNewIndexSequence.length - 1;
    
    // 从后向前遍历，确保节点的插入顺序正确
    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
      
      // 如果新节点在旧节点中不存在，挂载新节点
      if (newIndexToOldIndexMap[i] === 0) {
        mount(nextChild, container, anchor);
      } else if (moved) {
        // 如果需要移动节点
        // j < 0表示没有剩余的递增子序列
        // i !== increasingNewIndexSequence[j]表示当前节点不在最长递增子序列中
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          // 移动节点
          move(nextChild, container, anchor);
        } else {
          // 当前节点在最长递增子序列中，不需要移动
          j--;
        }
      }
    }
  }
}

/**
 * 4. 最长递增子序列算法工作原理示例
 * 
 * 假设我们有一个新节点在旧节点中的位置映射数组：[5, 3, 4, 0]
 * 其中0表示新节点，不存在于旧序列中
 * 
 * 计算最长递增子序列：
 * 初始化：result = [0], p = [5, 3, 4, 0]
 * 
 * i=0, arrI=5
 *   result = [0]
 *   lastResultIndex = 0, arr[lastResultIndex] = 5
 *   5 !< 5, 进入二分查找
 *   start=0, end=0, middle=0
 *   arr[result[middle]] = 5, 5 !< 5, end=0
 *   result不变，仍为[0]
 * 
 * i=1, arrI=3
 *   result = [0]
 *   lastResultIndex = 0, arr[lastResultIndex] = 5
 *   3 < 5, 所以将result[0]改为1
 *   result = [1]
 * 
 * i=2, arrI=4
 *   result = [1]
 *   lastResultIndex = 0, arr[lastResultIndex] = 3
 *   4 > 3, 所以将i=2添加到result
 *   p[2] = 0
 *   result = [1, 2]
 * 
 * i=3, arrI=0
 *   arrI === 0, 跳过不处理
 * 
 * 回溯：
 *   resultLen = 2
 *   last = result[1] = 2
 *   
 *   resultLen = 1
 *   result[1] = 2
 *   last = p[2] = 0
 *   
 *   resultLen = 0
 *   result[0] = 0
 * 
 * 最终结果：result = [1, 2]
 * 表示索引1和2位置的节点（即值为3和4的节点）构成最长递增子序列
 */

/**
 * 5. 面试答疑
 */

/**
 * 问题1: 为什么Vue3 diff算法中使用最长递增子序列而不是最长公共子序列？
 * 
 * 答案:
 * 1. 最长递增子序列算法时间复杂度为O(NlogN)，而最长公共子序列算法时间复杂度为O(N²)
 * 2. 在Vue的diff场景中，我们需要找到一组索引，这些索引在新旧列表中相对顺序不变，
 *    这正好符合最长递增子序列的特性
 * 3. 在节点复用的情况下，我们关心的是节点的相对顺序，而不是节点内容的匹配度
 */

/**
 * 问题2: Vue3 diff算法相比Vue2有哪些改进？
 * 
 * 答案:
 * 1. Vue2使用双端比较算法，总体复杂度是O(N)
 * 2. Vue3引入了最长递增子序列算法，虽然复杂度提高到O(NlogN)，但减少了DOM移动次数
 * 3. Vue3的算法更类似于文本diff，先处理头尾相同的节点，再处理中间乱序的部分
 * 4. 实际测试中，Vue3的算法在DOM操作方面更高效，因为DOM移动比算法计算更昂贵
 */

/**
 * 问题3: 最长递增子序列算法有什么实际价值？
 * 
 * 答案:
 * 1. 减少DOM操作：该算法可以找出不需要移动的节点，从而最小化DOM操作
 * 2. 保持稳定性：尽可能多地保持节点位置不变，提升渲染性能和用户体验
 * 3. 算法效率：O(NlogN)的时间复杂度在处理大型列表时仍然保持高效
 */

// 导出模块
module.exports = {
  getSequence,
  patchKeyedChildren
}; 