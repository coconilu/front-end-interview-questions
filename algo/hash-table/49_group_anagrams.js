/**
 * 49. 字母异位词分组
 * 
 * 给定一个字符串数组，将字母异位词组合在一起。字母异位词指字母相同，但排列不同的字符串。
 * 
 * 示例:
 * 输入: ["eat", "tea", "tan", "ate", "nat", "bat"]
 * 输出:
 * [
 *   ["ate","eat","tea"],
 *   ["nat","tan"],
 *   ["bat"]
 * ]
 * 
 * 说明：
 * 所有输入均为小写字母。
 * 不考虑答案输出的顺序。
 */

/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function(strs) {
    const map = new Map();
    
    for (const str of strs) {
        // 将字符串排序作为key
        const sortedStr = str.split('').sort().join('');
        
        if (!map.has(sortedStr)) {
            map.set(sortedStr, []);
        }
        
        map.get(sortedStr).push(str);
    }
    
    return Array.from(map.values());
};

/**
 * 优化解法 - 使用字符计数
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagramsOptimized = function(strs) {
    const map = new Map();
    
    for (const str of strs) {
        // 使用字符计数作为key
        const count = new Array(26).fill(0);
        
        for (let i = 0; i < str.length; i++) {
            const index = str.charCodeAt(i) - 'a'.charCodeAt(0);
            count[index]++;
        }
        
        // 将计数数组转为字符串作为key
        const key = count.join('#');
        
        if (!map.has(key)) {
            map.set(key, []);
        }
        
        map.get(key).push(str);
    }
    
    return Array.from(map.values());
}; 