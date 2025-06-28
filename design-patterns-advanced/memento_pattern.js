/**
 * 备忘录模式 (Memento Pattern)
 * 经典面试题：实现一个文本编辑器的撤销/重做功能，支持多级操作历史
 * 
 * 面试考点：
 * 1. 备忘录模式的基本概念和三个角色
 * 2. 撤销/重做机制的实现
 * 3. 状态保存和恢复的策略
 * 4. 内存管理和性能优化
 * 5. 与命令模式的区别和联系
 */

// 备忘录类 - 存储发起者的内部状态
class Memento {
  constructor(state, timestamp = new Date()) {
    this._state = state;
    this._timestamp = timestamp;
    this._id = this.generateId();
  }

  // 获取状态（只有发起者可以访问）
  getState() {
    return this._state;
  }

  // 获取时间戳
  getTimestamp() {
    return this._timestamp;
  }

  // 获取ID
  getId() {
    return this._id;
  }

  // 获取备忘录信息（供外部查看）
  getInfo() {
    return {
      id: this._id,
      timestamp: this._timestamp,
      size: JSON.stringify(this._state).length
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}

// 发起者类 - 文本编辑器
class TextEditor {
  constructor() {
    this.content = '';
    this.cursorPosition = 0;
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.fontSize = 14;
    this.fontFamily = 'Arial';
    this.theme = 'light';
    this.lastModified = new Date();
  }

  // 创建备忘录
  createMemento() {
    const state = {
      content: this.content,
      cursorPosition: this.cursorPosition,
      selectionStart: this.selectionStart,
      selectionEnd: this.selectionEnd,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      theme: this.theme,
      lastModified: this.lastModified
    };

    return new Memento(state);
  }

  // 从备忘录恢复状态
  restoreFromMemento(memento) {
    const state = memento.getState();
    
    this.content = state.content;
    this.cursorPosition = state.cursorPosition;
    this.selectionStart = state.selectionStart;
    this.selectionEnd = state.selectionEnd;
    this.fontSize = state.fontSize;
    this.fontFamily = state.fontFamily;
    this.theme = state.theme;
    this.lastModified = state.lastModified;

    console.log(`✅ 恢复到状态: ${memento.getId()}`);
  }

  // 编辑操作
  insertText(text, position = this.cursorPosition) {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
    this.cursorPosition = position + text.length;
    this.lastModified = new Date();
    return this;
  }

  deleteText(start, end = start + 1) {
    const deletedText = this.content.slice(start, end);
    this.content = this.content.slice(0, start) + this.content.slice(end);
    this.cursorPosition = start;
    this.lastModified = new Date();
    return deletedText;
  }

  replaceText(start, end, newText) {
    const oldText = this.content.slice(start, end);
    this.content = this.content.slice(0, start) + newText + this.content.slice(end);
    this.cursorPosition = start + newText.length;
    this.lastModified = new Date();
    return oldText;
  }

  // 格式化操作
  setFontSize(size) {
    this.fontSize = size;
    this.lastModified = new Date();
    return this;
  }

  setFontFamily(family) {
    this.fontFamily = family;
    this.lastModified = new Date();
    return this;
  }

  setTheme(theme) {
    this.theme = theme;
    this.lastModified = new Date();
    return this;
  }

  // 选择操作
  setSelection(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
    return this;
  }

  setCursorPosition(position) {
    this.cursorPosition = Math.max(0, Math.min(position, this.content.length));
    return this;
  }

  // 获取编辑器状态
  getState() {
    return {
      content: this.content,
      contentLength: this.content.length,
      cursorPosition: this.cursorPosition,
      selection: {
        start: this.selectionStart,
        end: this.selectionEnd,
        text: this.content.slice(this.selectionStart, this.selectionEnd)
      },
      formatting: {
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        theme: this.theme
      },
      lastModified: this.lastModified
    };
  }

  // 获取内容预览
  getPreview(maxLength = 50) {
    return this.content.length <= maxLength 
      ? this.content 
      : this.content.slice(0, maxLength) + '...';
  }
}

// 管理者类 - 历史记录管理器
class HistoryManager {
  constructor(maxHistorySize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = maxHistorySize;
    this.statistics = {
      totalSaves: 0,
      totalUndos: 0,
      totalRedos: 0,
      memoryUsage: 0
    };
  }

  // 保存状态
  saveState(memento) {
    // 如果当前不在历史末尾，删除后续历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // 添加新的备忘录
    this.history.push(memento);
    this.currentIndex++;

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.statistics.totalSaves++;
    this.updateMemoryUsage();

    console.log(`💾 保存状态: ${memento.getId()} (${this.currentIndex + 1}/${this.history.length})`);
  }

  // 撤销操作
  undo() {
    if (!this.canUndo()) {
      console.log('❌ 无法撤销：已到达历史开始');
      return null;
    }

    this.currentIndex--;
    const memento = this.history[this.currentIndex];
    this.statistics.totalUndos++;

    console.log(`↩️ 撤销到: ${memento.getId()}`);
    return memento;
  }

  // 重做操作
  redo() {
    if (!this.canRedo()) {
      console.log('❌ 无法重做：已到达历史末尾');
      return null;
    }

    this.currentIndex++;
    const memento = this.history[this.currentIndex];
    this.statistics.totalRedos++;

    console.log(`↪️ 重做到: ${memento.getId()}`);
    return memento;
  }

  // 检查是否可以撤销
  canUndo() {
    return this.currentIndex > 0;
  }

  // 检查是否可以重做
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // 获取当前状态
  getCurrentMemento() {
    return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
  }

  // 获取历史记录列表
  getHistory() {
    return this.history.map((memento, index) => ({
      index,
      ...memento.getInfo(),
      isCurrent: index === this.currentIndex
    }));
  }

  // 跳转到指定历史点
  goToHistoryPoint(index) {
    if (index < 0 || index >= this.history.length) {
      console.log('❌ 无效的历史索引');
      return null;
    }

    this.currentIndex = index;
    const memento = this.history[index];
    
    console.log(`🎯 跳转到历史点: ${memento.getId()}`);
    return memento;
  }

  // 清理历史记录
  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
    this.updateMemoryUsage();
    console.log('🗑️ 历史记录已清空');
  }

  // 压缩历史记录（保留关键节点）
  compressHistory(keepEveryN = 5) {
    if (this.history.length <= keepEveryN) return;

    const compressed = [];
    const currentMemento = this.getCurrentMemento();

    // 保留关键节点
    for (let i = 0; i < this.history.length; i += keepEveryN) {
      compressed.push(this.history[i]);
    }

    // 确保保留当前状态
    if (currentMemento && !compressed.includes(currentMemento)) {
      compressed.push(currentMemento);
    }

    this.history = compressed;
    this.currentIndex = this.history.indexOf(currentMemento);
    this.updateMemoryUsage();

    console.log(`🗜️ 历史记录已压缩: ${compressed.length} 个节点`);
  }

  // 更新内存使用统计
  updateMemoryUsage() {
    this.statistics.memoryUsage = this.history.reduce((total, memento) => {
      return total + JSON.stringify(memento.getState()).length;
    }, 0);
  }

  // 获取统计信息
  getStatistics() {
    return {
      ...this.statistics,
      historySize: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsageKB: Math.round(this.statistics.memoryUsage / 1024)
    };
  }
}

// 自动保存管理器
class AutoSaveManager {
  constructor(textEditor, historyManager, options = {}) {
    this.textEditor = textEditor;
    this.historyManager = historyManager;
    this.options = {
      interval: options.interval || 30000, // 30秒
      maxIdle: options.maxIdle || 300000,  // 5分钟不操作后停止自动保存
      onlyOnChange: options.onlyOnChange !== false,
      ...options
    };

    this.intervalId = null;
    this.lastContent = '';
    this.lastSaveTime = Date.now();
    this.isEnabled = false;
  }

  // 启动自动保存
  start() {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.lastContent = this.textEditor.content;
    
    this.intervalId = setInterval(() => {
      this.checkAndSave();
    }, this.options.interval);

    console.log('🔄 自动保存已启动');
  }

  // 停止自动保存
  stop() {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('⏸️ 自动保存已停止');
  }

  // 检查并保存
  checkAndSave() {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;

    // 检查是否超过最大空闲时间
    if (timeSinceLastSave > this.options.maxIdle) {
      this.stop();
      return;
    }

    // 检查内容是否发生变化
    if (this.options.onlyOnChange && this.textEditor.content === this.lastContent) {
      return;
    }

    // 保存状态
    const memento = this.textEditor.createMemento();
    this.historyManager.saveState(memento);
    
    this.lastContent = this.textEditor.content;
    this.lastSaveTime = now;

    console.log('💾 自动保存执行');
  }

  // 手动触发保存
  forceSave() {
    const memento = this.textEditor.createMemento();
    this.historyManager.saveState(memento);
    
    this.lastContent = this.textEditor.content;
    this.lastSaveTime = Date.now();

    console.log('💾 手动保存执行');
  }

  // 重置空闲计时器
  resetIdleTimer() {
    this.lastSaveTime = Date.now();
  }
}

// 完整的编辑器系统
class EditorSystem {
  constructor(options = {}) {
    this.editor = new TextEditor();
    this.historyManager = new HistoryManager(options.maxHistory || 50);
    this.autoSaveManager = new AutoSaveManager(
      this.editor, 
      this.historyManager, 
      options.autoSave || {}
    );

    // 初始状态保存
    this.saveCurrentState();
  }

  // 执行编辑操作并保存状态
  executeOperation(operation, ...args) {
    const result = this.editor[operation](...args);
    this.saveCurrentState();
    this.autoSaveManager.resetIdleTimer();
    return result;
  }

  // 保存当前状态
  saveCurrentState() {
    const memento = this.editor.createMemento();
    this.historyManager.saveState(memento);
  }

  // 撤销
  undo() {
    const memento = this.historyManager.undo();
    if (memento) {
      this.editor.restoreFromMemento(memento);
    }
    return memento !== null;
  }

  // 重做
  redo() {
    const memento = this.historyManager.redo();
    if (memento) {
      this.editor.restoreFromMemento(memento);
    }
    return memento !== null;
  }

  // 跳转到历史点
  goToHistory(index) {
    const memento = this.historyManager.goToHistoryPoint(index);
    if (memento) {
      this.editor.restoreFromMemento(memento);
    }
    return memento !== null;
  }

  // 获取完整状态
  getFullState() {
    return {
      editor: this.editor.getState(),
      history: this.historyManager.getStatistics(),
      autoSave: {
        enabled: this.autoSaveManager.isEnabled,
        lastSaveTime: this.autoSaveManager.lastSaveTime
      }
    };
  }

  // 启用自动保存
  enableAutoSave() {
    this.autoSaveManager.start();
  }

  // 禁用自动保存
  disableAutoSave() {
    this.autoSaveManager.stop();
  }

  // 清理系统
  cleanup() {
    this.autoSaveManager.stop();
    this.historyManager.clearHistory();
  }
}

// 使用示例和测试
async function demonstrateMementoPattern() {
  console.group('备忘录模式演示');

  // 创建编辑器系统
  const editorSystem = new EditorSystem({
    maxHistory: 20,
    autoSave: {
      interval: 5000, // 5秒自动保存
      onlyOnChange: true
    }
  });

  console.log('\n=== 编辑操作测试 ===');
  
  // 执行一系列编辑操作
  editorSystem.executeOperation('insertText', 'Hello World!', 0);
  console.log('插入文本:', editorSystem.editor.getPreview());

  editorSystem.executeOperation('insertText', ' JavaScript is awesome.', 12);
  console.log('继续插入:', editorSystem.editor.getPreview());

  editorSystem.executeOperation('setFontSize', 16);
  editorSystem.executeOperation('setTheme', 'dark');
  
  editorSystem.executeOperation('deleteText', 6, 12); // 删除 "World!"
  console.log('删除文本:', editorSystem.editor.getPreview());

  editorSystem.executeOperation('replaceText', 0, 5, 'Hi');
  console.log('替换文本:', editorSystem.editor.getPreview());

  // 显示历史记录
  console.log('\n=== 历史记录 ===');
  console.table(editorSystem.historyManager.getHistory());

  // 测试撤销操作
  console.log('\n=== 撤销操作测试 ===');
  console.log('撤销前:', editorSystem.editor.getPreview());
  
  editorSystem.undo();
  console.log('撤销后:', editorSystem.editor.getPreview());
  
  editorSystem.undo();
  console.log('再次撤销:', editorSystem.editor.getPreview());

  // 测试重做操作
  console.log('\n=== 重做操作测试 ===');
  editorSystem.redo();
  console.log('重做后:', editorSystem.editor.getPreview());

  // 跳转到特定历史点
  console.log('\n=== 历史跳转测试 ===');
  editorSystem.goToHistory(2);
  console.log('跳转到历史点2:', editorSystem.editor.getPreview());

  // 显示统计信息
  console.log('\n=== 系统统计 ===');
  console.table(editorSystem.getFullState());

  // 启用自动保存测试
  console.log('\n=== 自动保存测试 ===');
  editorSystem.enableAutoSave();
  
  // 模拟一些编辑操作
  setTimeout(() => {
    editorSystem.executeOperation('insertText', ' Auto-saved!', editorSystem.editor.content.length);
    console.log('自动保存触发后:', editorSystem.editor.getPreview());
  }, 1000);

  // 清理
  setTimeout(() => {
    editorSystem.cleanup();
    console.log('✅ 系统已清理');
    console.groupEnd();
  }, 6000);
}

// 导出
export {
  Memento,
  TextEditor,
  HistoryManager,
  AutoSaveManager,
  EditorSystem,
  demonstrateMementoPattern
};

/**
 * 面试要点总结：
 * 
 * 1. 备忘录模式的三个角色：
 *    - 发起者(Originator)：创建备忘录，恢复状态
 *    - 备忘录(Memento)：存储发起者的内部状态
 *    - 管理者(Caretaker)：管理备忘录，但不能访问其内容
 * 
 * 2. 核心特点：
 *    - 在不破坏封装的前提下保存和恢复对象状态
 *    - 提供了状态回滚机制
 *    - 简化了发起者的职责
 * 
 * 3. 适用场景：
 *    - 需要保存对象历史状态（撤销/重做）
 *    - 事务回滚
 *    - 数据备份和恢复
 *    - 游戏存档系统
 * 
 * 4. 实现要点：
 *    - 备忘录应该是不可变的
 *    - 只有发起者能访问备忘录的详细内容
 *    - 管理者负责备忘录的生命周期管理
 *    - 考虑内存使用和性能优化
 * 
 * 5. 优缺点：
 *    优点：
 *    - 保护封装边界
 *    - 简化发起者设计
 *    - 提供状态恢复能力
 *    
 *    缺点：
 *    - 内存消耗大
 *    - 管理复杂度高
 *    - 可能影响性能
 * 
 * 6. 与命令模式的区别：
 *    - 备忘录模式关注状态保存和恢复
 *    - 命令模式关注操作的封装和执行
 *    - 两者经常结合使用实现撤销/重做功能
 */