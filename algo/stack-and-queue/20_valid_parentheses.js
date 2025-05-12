/**
 * 20. 有效的括号
 * 
 * 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。
 * 
 * 有效字符串需满足：
 * 1. 左括号必须用相同类型的右括号闭合。
 * 2. 左括号必须以正确的顺序闭合。
 * 
 * 注意空字符串可被认为是有效字符串。
 * 
 * 示例 1:
 * 输入: "()"
 * 输出: true
 * 
 * 示例 2:
 * 输入: "()[]{}"
 * 输出: true
 * 
 * 示例 3:
 * 输入: "(]"
 * 输出: false
 * 
 * 示例 4:
 * 输入: "([)]"
 * 输出: false
 * 
 * 示例 5:
 * 输入: "{[]}"
 * 输出: true
 */

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    const map = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        
        if (map[char]) {
            // 如果是左括号，入栈
            stack.push(char);
        } else {
            // 如果是右括号，检查栈顶元素是否匹配
            const top = stack.pop();
            
            if (map[top] !== char) {
                return false;
            }
        }
    }
    
    // 最后检查栈是否为空
    return stack.length === 0;
}; 