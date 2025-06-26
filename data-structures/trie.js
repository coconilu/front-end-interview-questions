/**
 * 前缀树(Trie)实现
 * 
 * 前缀树是一种树形数据结构，用于高效地存储和检索字符串数据集中的键
 * 常用于自动补全、拼写检查、IP路由等场景
 */

// Trie节点
class TrieNode {
  constructor() {
    this.children = {}; // 存储子节点
    this.isEndOfWord = false; // 标记是否为单词结尾
    this.count = 0; // 记录通过该节点的单词数量
  }
}

// 前缀树实现
class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  // 插入单词
  insert(word) {
    if (!word || typeof word !== 'string') {
      throw new Error('Word must be a non-empty string');
    }

    let current = this.root;
    
    // 遍历单词的每个字符
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      // 如果字符不存在，创建新节点
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      
      current = current.children[char];
      current.count++; // 增加通过该节点的单词计数
    }
    
    // 标记单词结尾
    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      this.size++;
    }
  }

  // 搜索单词是否存在
  search(word) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    let current = this.root;
    
    // 遍历单词的每个字符
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      if (!current.children[char]) {
        return false;
      }
      
      current = current.children[char];
    }
    
    // 检查是否为完整单词
    return current.isEndOfWord;
  }

  // 检查是否存在以指定前缀开头的单词
  startsWith(prefix) {
    if (!prefix || typeof prefix !== 'string') {
      return false;
    }

    let current = this.root;
    
    // 遍历前缀的每个字符
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      
      if (!current.children[char]) {
        return false;
      }
      
      current = current.children[char];
    }
    
    return true;
  }

  // 删除单词
  delete(word) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    return this._deleteHelper(this.root, word, 0);
  }

  // 递归删除辅助方法
  _deleteHelper(node, word, index) {
    if (index === word.length) {
      // 到达单词末尾
      if (!node.isEndOfWord) {
        return false; // 单词不存在
      }
      
      node.isEndOfWord = false;
      this.size--;
      
      // 如果该节点没有子节点，可以删除
      return Object.keys(node.children).length === 0;
    }

    const char = word[index];
    const childNode = node.children[char];
    
    if (!childNode) {
      return false; // 单词不存在
    }

    const shouldDeleteChild = this._deleteHelper(childNode, word, index + 1);
    
    if (shouldDeleteChild) {
      delete node.children[char];
      childNode.count--;
      
      // 如果当前节点不是单词结尾且没有其他子节点，可以删除
      return !node.isEndOfWord && Object.keys(node.children).length === 0;
    }

    return false;
  }

  // 获取所有以指定前缀开头的单词
  getAllWordsWithPrefix(prefix = '') {
    const result = [];
    let current = this.root;
    
    // 找到前缀的末尾节点
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      
      if (!current.children[char]) {
        return result; // 前缀不存在
      }
      
      current = current.children[char];
    }
    
    // 从前缀末尾节点开始DFS收集所有单词
    this._collectWords(current, prefix, result);
    return result;
  }

  // 收集单词的DFS辅助方法
  _collectWords(node, currentWord, result) {
    if (node.isEndOfWord) {
      result.push(currentWord);
    }
    
    // 遍历所有子节点
    for (const char in node.children) {
      this._collectWords(
        node.children[char], 
        currentWord + char, 
        result
      );
    }
  }

  // 获取Trie中的所有单词
  getAllWords() {
    return this.getAllWordsWithPrefix('');
  }

  // 获取单词数量
  getSize() {
    return this.size;
  }

  // 检查Trie是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 清空Trie
  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }

  // 获取最长公共前缀
  longestCommonPrefix() {
    const words = this.getAllWords();
    if (words.length === 0) return '';
    if (words.length === 1) return words[0];
    
    let prefix = '';
    let current = this.root;
    
    while (Object.keys(current.children).length === 1 && !current.isEndOfWord) {
      const char = Object.keys(current.children)[0];
      prefix += char;
      current = current.children[char];
    }
    
    return prefix;
  }

  // 计算给定前缀的单词数量
  countWordsWithPrefix(prefix) {
    let current = this.root;
    
    // 找到前缀的末尾节点
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      
      if (!current.children[char]) {
        return 0;
      }
      
      current = current.children[char];
    }
    
    return this._countWords(current);
  }

  // 递归计算单词数量
  _countWords(node) {
    let count = node.isEndOfWord ? 1 : 0;
    
    for (const char in node.children) {
      count += this._countWords(node.children[char]);
    }
    
    return count;
  }

  // 自动补全功能
  autoComplete(prefix, maxSuggestions = 10) {
    const words = this.getAllWordsWithPrefix(prefix);
    return words.slice(0, maxSuggestions);
  }

  // 打印Trie结构
  printTrie() {
    console.log('Trie Structure:');
    this._printNode(this.root, '', '');
  }

  _printNode(node, prefix, indent) {
    if (node.isEndOfWord) {
      console.log(indent + prefix + ' (word)');
    }
    
    for (const char in node.children) {
      console.log(indent + prefix + char);
      this._printNode(
        node.children[char], 
        prefix + char, 
        indent + '  '
      );
    }
  }
}

// 测试用例
function testTrie() {
  console.log('=== 前缀树测试 ===');
  const trie = new Trie();

  // 插入单词
  const words = ['apple', 'app', 'application', 'apply', 'apt', 'cat', 'car', 'card', 'care'];
  words.forEach(word => trie.insert(word));
  
  console.log('插入单词:', words);
  console.log('Trie大小:', trie.getSize());

  // 搜索单词
  console.log('搜索 "app":', trie.search('app')); // true
  console.log('搜索 "appl":', trie.search('appl')); // false
  console.log('搜索 "apple":', trie.search('apple')); // true

  // 前缀匹配
  console.log('以 "app" 开头:', trie.startsWith('app')); // true
  console.log('以 "xyz" 开头:', trie.startsWith('xyz')); // false

  // 获取前缀对应的所有单词
  console.log('以 "app" 开头的所有单词:', trie.getAllWordsWithPrefix('app'));
  console.log('以 "car" 开头的所有单词:', trie.getAllWordsWithPrefix('car'));

  // 自动补全
  console.log('自动补全 "ap":', trie.autoComplete('ap', 5));

  // 获取所有单词
  console.log('所有单词:', trie.getAllWords());

  // 最长公共前缀
  const prefixTrie = new Trie();
  ['flower', 'flow', 'flight'].forEach(word => prefixTrie.insert(word));
  console.log('最长公共前缀:', prefixTrie.longestCommonPrefix()); // "fl"

  // 删除单词
  console.log('删除 "app":', trie.delete('app'));
  console.log('删除后搜索 "app":', trie.search('app')); // false
  console.log('删除后以 "app" 开头的单词:', trie.getAllWordsWithPrefix('app'));
}

// 运行测试
testTrie();

// 导出类
module.exports = {
  TrieNode,
  Trie
}; 