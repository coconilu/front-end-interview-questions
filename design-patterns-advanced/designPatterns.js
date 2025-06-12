/**
 * 前端设计模式进阶
 * 
 * 本文件展示了前端开发中常用的高级设计模式
 * 包括创建型、结构型、行为型模式的实际应用
 */

// 1. 创建型模式

// 单例模式 - 全局状态管理
class GlobalStateManager {
  constructor() {
    if (GlobalStateManager.instance) {
      return GlobalStateManager.instance;
    }
    
    this.state = new Map();
    this.listeners = new Map();
    GlobalStateManager.instance = this;
  }
  
  // 设置状态
  setState(key, value) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    // 通知监听器
    const keyListeners = this.listeners.get(key) || [];
    keyListeners.forEach(listener => {
      listener(value, oldValue);
    });
  }
  
  // 获取状态
  getState(key) {
    return this.state.get(key);
  }
  
  // 订阅状态变化
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(listener);
    
    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(key);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}

// 工厂模式 - 组件工厂
class ComponentFactory {
  constructor() {
    this.components = new Map();
  }
  
  // 注册组件
  register(type, componentClass) {
    this.components.set(type, componentClass);
  }
  
  // 创建组件
  create(type, props = {}) {
    const ComponentClass = this.components.get(type);
    
    if (!ComponentClass) {
      throw new Error(`Component type "${type}" not found`);
    }
    
    return new ComponentClass(props);
  }
  
  // 批量创建组件
  createBatch(configs) {
    return configs.map(config => 
      this.create(config.type, config.props)
    );
  }
}

// 抽象工厂模式 - UI 主题工厂
class ThemeFactory {
  static createTheme(themeName) {
    switch (themeName) {
      case 'light':
        return new LightThemeFactory();
      case 'dark':
        return new DarkThemeFactory();
      case 'high-contrast':
        return new HighContrastThemeFactory();
      default:
        throw new Error(`Unknown theme: ${themeName}`);
    }
  }
}

class LightThemeFactory {
  createButton() {
    return {
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #cccccc'
    };
  }
  
  createInput() {
    return {
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #cccccc'
    };
  }
  
  createCard() {
    return {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
  }
}

class DarkThemeFactory {
  createButton() {
    return {
      backgroundColor: '#333333',
      color: '#ffffff',
      border: '1px solid #555555'
    };
  }
  
  createInput() {
    return {
      backgroundColor: '#333333',
      color: '#ffffff',
      border: '1px solid #555555'
    };
  }
  
  createCard() {
    return {
      backgroundColor: '#333333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    };
  }
}

class HighContrastThemeFactory {
  createButton() {
    return {
      backgroundColor: '#000000',
      color: '#ffffff',
      border: '2px solid #ffffff'
    };
  }
  
  createInput() {
    return {
      backgroundColor: '#000000',
      color: '#ffffff',
      border: '2px solid #ffffff'
    };
  }
  
  createCard() {
    return {
      backgroundColor: '#000000',
      border: '2px solid #ffffff'
    };
  }
}

// 建造者模式 - 复杂表单构建器
class FormBuilder {
  constructor() {
    this.form = {
      fields: [],
      validation: {},
      layout: 'vertical',
      submitHandler: null
    };
  }
  
  // 添加字段
  addField(field) {
    this.form.fields.push(field);
    return this;
  }
  
  // 添加文本输入
  addTextInput(name, label, options = {}) {
    return this.addField({
      type: 'text',
      name,
      label,
      placeholder: options.placeholder || '',
      required: options.required || false,
      maxLength: options.maxLength
    });
  }
  
  // 添加选择框
  addSelect(name, label, options, config = {}) {
    return this.addField({
      type: 'select',
      name,
      label,
      options,
      multiple: config.multiple || false,
      required: config.required || false
    });
  }
  
  // 添加复选框
  addCheckbox(name, label, options = {}) {
    return this.addField({
      type: 'checkbox',
      name,
      label,
      checked: options.checked || false,
      required: options.required || false
    });
  }
  
  // 设置验证规则
  setValidation(fieldName, rules) {
    this.form.validation[fieldName] = rules;
    return this;
  }
  
  // 设置布局
  setLayout(layout) {
    this.form.layout = layout;
    return this;
  }
  
  // 设置提交处理器
  setSubmitHandler(handler) {
    this.form.submitHandler = handler;
    return this;
  }
  
  // 构建表单
  build() {
    return new Form(this.form);
  }
}

class Form {
  constructor(config) {
    this.config = config;
    this.values = {};
    this.errors = {};
  }
  
  // 渲染表单
  render(container) {
    const formElement = document.createElement('form');
    formElement.className = `form form--${this.config.layout}`;
    
    this.config.fields.forEach(field => {
      const fieldElement = this.renderField(field);
      formElement.appendChild(fieldElement);
    });
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    formElement.appendChild(submitButton);
    
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    container.appendChild(formElement);
  }
  
  // 渲染字段
  renderField(field) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-field';
    
    const label = document.createElement('label');
    label.textContent = field.label;
    label.htmlFor = field.name;
    fieldContainer.appendChild(label);
    
    let input;
    
    switch (field.type) {
      case 'text':
        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = field.placeholder;
        if (field.maxLength) {
          input.maxLength = field.maxLength;
        }
        break;
        
      case 'select':
        input = document.createElement('select');
        if (field.multiple) {
          input.multiple = true;
        }
        
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          input.appendChild(optionElement);
        });
        break;
        
      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = field.checked;
        break;
    }
    
    input.name = field.name;
    input.id = field.name;
    input.required = field.required;
    
    input.addEventListener('change', (e) => {
      this.values[field.name] = e.target.value;
      this.validateField(field.name);
    });
    
    fieldContainer.appendChild(input);
    
    return fieldContainer;
  }
  
  // 验证字段
  validateField(fieldName) {
    const rules = this.config.validation[fieldName];
    if (!rules) return true;
    
    const value = this.values[fieldName];
    const errors = [];
    
    rules.forEach(rule => {
      if (!rule.validator(value)) {
        errors.push(rule.message);
      }
    });
    
    this.errors[fieldName] = errors;
    return errors.length === 0;
  }
  
  // 处理提交
  handleSubmit() {
    let isValid = true;
    
    // 验证所有字段
    this.config.fields.forEach(field => {
      if (!this.validateField(field.name)) {
        isValid = false;
      }
    });
    
    if (isValid && this.config.submitHandler) {
      this.config.submitHandler(this.values);
    }
  }
}

// 2. 结构型模式

// 适配器模式 - API 适配器
class APIAdapter {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  // 适配不同的 API 响应格式
  async getUsers() {
    const response = await this.apiClient.get('/users');
    
    // 适配不同的响应格式
    if (response.data) {
      // REST API 格式
      return response.data.map(user => ({
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar || user.profile_image
      }));
    } else if (response.users) {
      // GraphQL 格式
      return response.users.map(user => ({
        id: user.id,
        name: user.displayName,
        email: user.emailAddress,
        avatar: user.avatarUrl
      }));
    }
    
    return [];
  }
  
  // 适配不同的错误格式
  handleError(error) {
    if (error.response) {
      // REST API 错误
      return {
        code: error.response.status,
        message: error.response.data.message || 'Unknown error'
      };
    } else if (error.errors) {
      // GraphQL 错误
      return {
        code: 400,
        message: error.errors[0].message
      };
    }
    
    return {
      code: 500,
      message: 'Network error'
    };
  }
}

// 装饰器模式 - 组件增强
class ComponentDecorator {
  constructor(component) {
    this.component = component;
  }
  
  render() {
    return this.component.render();
  }
}

// 加载状态装饰器
class LoadingDecorator extends ComponentDecorator {
  constructor(component) {
    super(component);
    this.isLoading = false;
  }
  
  setLoading(loading) {
    this.isLoading = loading;
  }
  
  render() {
    if (this.isLoading) {
      return '<div class="loading">Loading...</div>';
    }
    return super.render();
  }
}

// 错误边界装饰器
class ErrorBoundaryDecorator extends ComponentDecorator {
  constructor(component) {
    super(component);
    this.hasError = false;
    this.error = null;
  }
  
  setError(error) {
    this.hasError = true;
    this.error = error;
  }
  
  clearError() {
    this.hasError = false;
    this.error = null;
  }
  
  render() {
    if (this.hasError) {
      return `<div class="error">Error: ${this.error.message}</div>`;
    }
    
    try {
      return super.render();
    } catch (error) {
      this.setError(error);
      return this.render();
    }
  }
}

// 缓存装饰器
class CacheDecorator extends ComponentDecorator {
  constructor(component, ttl = 5000) {
    super(component);
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  render(props = {}) {
    const cacheKey = JSON.stringify(props);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.result;
    }
    
    const result = super.render(props);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// 外观模式 - 复杂 API 简化
class MediaFacade {
  constructor() {
    this.audioContext = null;
    this.videoElement = null;
    this.canvas = null;
    this.stream = null;
  }
  
  // 简化的音频播放
  async playAudio(url, options = {}) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      if (options.volume !== undefined) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
      } else {
        source.connect(this.audioContext.destination);
      }
      
      source.start(0);
      
      return {
        stop: () => source.stop(),
        duration: audioBuffer.duration
      };
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }
  
  // 简化的视频录制
  async startVideoRecording(options = {}) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: options.video || true,
        audio: options.audio || true
      });
      
      const mediaRecorder = new MediaRecorder(this.stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.start();
      
      return {
        stop: () => {
          return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              this.stopStream();
              resolve(blob);
            };
            mediaRecorder.stop();
          });
        },
        pause: () => mediaRecorder.pause(),
        resume: () => mediaRecorder.resume()
      };
    } catch (error) {
      console.error('Video recording failed:', error);
      throw error;
    }
  }
  
  // 简化的图像处理
  processImage(imageElement, filters = {}) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }
    
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = imageElement.width;
    this.canvas.height = imageElement.height;
    
    ctx.drawImage(imageElement, 0, 0);
    
    // 应用滤镜
    if (filters.brightness || filters.contrast || filters.saturation) {
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (filters.brightness) {
          data[i] = Math.min(255, data[i] * filters.brightness);
          data[i + 1] = Math.min(255, data[i + 1] * filters.brightness);
          data[i + 2] = Math.min(255, data[i + 2] * filters.brightness);
        }
        
        if (filters.grayscale) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    return this.canvas.toDataURL();
  }
  
  // 停止媒体流
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  // 清理资源
  cleanup() {
    this.stopStream();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 代理模式 - 虚拟代理和缓存代理
class ImageProxy {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }
  
  // 懒加载图片
  async loadImage(src, placeholder = null) {
    // 检查缓存
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    
    // 检查是否正在加载
    if (this.loading.has(src)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }
    
    this.loading.add(src);
    
    try {
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          this.cache.set(src, img);
          this.loading.delete(src);
          resolve(img);
        };
        
        img.onerror = () => {
          this.loading.delete(src);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
      });
    } catch (error) {
      this.loading.delete(src);
      throw error;
    }
  }
  
  // 预加载图片
  preloadImages(urls) {
    return Promise.all(urls.map(url => this.loadImage(url)));
  }
  
  // 清理缓存
  clearCache() {
    this.cache.clear();
  }
  
  // 获取缓存统计
  getCacheStats() {
    return {
      size: this.cache.size,
      loading: this.loading.size,
      urls: Array.from(this.cache.keys())
    };
  }
}

// 3. 行为型模式

// 观察者模式 - 事件系统
class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
  }
  
  // 添加监听器
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    
    if (listeners.length >= this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.length + 1} ${event} listeners added.`);
    }
    
    listeners.push(listener);
    
    return this;
  }
  
  // 添加一次性监听器
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    
    return this.on(event, onceWrapper);
  }
  
  // 移除监听器
  off(event, listener) {
    if (!this.events.has(event)) {
      return this;
    }
    
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
    
    return this;
  }
  
  // 触发事件
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }
    
    const listeners = this.events.get(event).slice();
    
    listeners.forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
    
    return true;
  }
  
  // 移除所有监听器
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  // 获取监听器数量
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
  
  // 设置最大监听器数量
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }
}

// 命令模式 - 撤销/重做系统
class Command {
  execute() {
    throw new Error('Execute method must be implemented');
  }
  
  undo() {
    throw new Error('Undo method must be implemented');
  }
}

class AddTextCommand extends Command {
  constructor(editor, text, position) {
    super();
    this.editor = editor;
    this.text = text;
    this.position = position;
  }
  
  execute() {
    this.editor.insertText(this.text, this.position);
  }
  
  undo() {
    this.editor.deleteText(this.position, this.text.length);
  }
}

class DeleteTextCommand extends Command {
  constructor(editor, position, length) {
    super();
    this.editor = editor;
    this.position = position;
    this.length = length;
    this.deletedText = '';
  }
  
  execute() {
    this.deletedText = this.editor.getText(this.position, this.length);
    this.editor.deleteText(this.position, this.length);
  }
  
  undo() {
    this.editor.insertText(this.deletedText, this.position);
  }
}

class CommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 100;
  }
  
  // 执行命令
  execute(command) {
    // 移除当前位置之后的历史记录
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // 执行命令
    command.execute();
    
    // 添加到历史记录
    this.history.push(command);
    this.currentIndex++;
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }
  
  // 撤销
  undo() {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      return true;
    }
    return false;
  }
  
  // 重做
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      return true;
    }
    return false;
  }
  
  // 检查是否可以撤销
  canUndo() {
    return this.currentIndex >= 0;
  }
  
  // 检查是否可以重做
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
  
  // 清空历史记录
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

// 策略模式 - 排序策略
class SortStrategy {
  sort(data) {
    throw new Error('Sort method must be implemented');
  }
}

class BubbleSortStrategy extends SortStrategy {
  sort(data) {
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

class QuickSortStrategy extends SortStrategy {
  sort(data) {
    const arr = [...data];
    return this.quickSort(arr, 0, arr.length - 1);
  }
  
  quickSort(arr, low, high) {
    if (low < high) {
      const pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
    return arr;
  }
  
  partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
}

class MergeSortStrategy extends SortStrategy {
  sort(data) {
    const arr = [...data];
    return this.mergeSort(arr);
  }
  
  mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }
    
    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid));
    const right = this.mergeSort(arr.slice(mid));
    
    return this.merge(left, right);
  }
  
  merge(left, right) {
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
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

class SortContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  sort(data) {
    return this.strategy.sort(data);
  }
}

// 状态模式 - 媒体播放器状态
class MediaPlayerState {
  play(player) {
    throw new Error('Play method must be implemented');
  }
  
  pause(player) {
    throw new Error('Pause method must be implemented');
  }
  
  stop(player) {
    throw new Error('Stop method must be implemented');
  }
}

class PlayingState extends MediaPlayerState {
  play(player) {
    console.log('Already playing');
  }
  
  pause(player) {
    console.log('Pausing playback');
    player.setState(new PausedState());
  }
  
  stop(player) {
    console.log('Stopping playback');
    player.setState(new StoppedState());
  }
}

class PausedState extends MediaPlayerState {
  play(player) {
    console.log('Resuming playback');
    player.setState(new PlayingState());
  }
  
  pause(player) {
    console.log('Already paused');
  }
  
  stop(player) {
    console.log('Stopping playback');
    player.setState(new StoppedState());
  }
}

class StoppedState extends MediaPlayerState {
  play(player) {
    console.log('Starting playback');
    player.setState(new PlayingState());
  }
  
  pause(player) {
    console.log('Cannot pause when stopped');
  }
  
  stop(player) {
    console.log('Already stopped');
  }
}

class MediaPlayer {
  constructor() {
    this.state = new StoppedState();
  }
  
  setState(state) {
    this.state = state;
  }
  
  play() {
    this.state.play(this);
  }
  
  pause() {
    this.state.pause(this);
  }
  
  stop() {
    this.state.stop(this);
  }
}

// 4. 使用示例
const demonstratePatterns = () => {
  console.group('Design Patterns Demo');
  
  // 单例模式示例
  console.log('=== Singleton Pattern ===');
  const stateManager1 = new GlobalStateManager();
  const stateManager2 = new GlobalStateManager();
  console.log('Same instance:', stateManager1 === stateManager2);
  
  // 工厂模式示例
  console.log('=== Factory Pattern ===');
  const factory = new ComponentFactory();
  factory.register('button', class Button {
    constructor(props) {
      this.props = props;
    }
    render() {
      return `<button>${this.props.text}</button>`;
    }
  });
  
  const button = factory.create('button', { text: 'Click me' });
  console.log('Button HTML:', button.render());
  
  // 建造者模式示例
  console.log('=== Builder Pattern ===');
  const form = new FormBuilder()
    .addTextInput('name', 'Name', { required: true })
    .addTextInput('email', 'Email', { required: true })
    .addSelect('country', 'Country', [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' }
    ])
    .setValidation('email', [
      {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Invalid email format'
      }
    ])
    .setSubmitHandler((data) => {
      console.log('Form submitted:', data);
    })
    .build();
  
  // 装饰器模式示例
  console.log('=== Decorator Pattern ===');
  class SimpleComponent {
    render() {
      return '<div>Hello World</div>';
    }
  }
  
  const component = new SimpleComponent();
  const loadingComponent = new LoadingDecorator(component);
  const cachedComponent = new CacheDecorator(loadingComponent);
  
  console.log('Decorated component:', cachedComponent.render());
  
  // 观察者模式示例
  console.log('=== Observer Pattern ===');
  const emitter = new EventEmitter();
  
  emitter.on('user-login', (user) => {
    console.log('User logged in:', user.name);
  });
  
  emitter.emit('user-login', { name: 'John Doe' });
  
  // 命令模式示例
  console.log('=== Command Pattern ===');
  const commandManager = new CommandManager();
  
  class MockEditor {
    constructor() {
      this.content = '';
    }
    
    insertText(text, position) {
      this.content = this.content.slice(0, position) + text + this.content.slice(position);
    }
    
    deleteText(position, length) {
      this.content = this.content.slice(0, position) + this.content.slice(position + length);
    }
    
    getText(position, length) {
      return this.content.slice(position, position + length);
    }
  }
  
  const editor = new MockEditor();
  const addCommand = new AddTextCommand(editor, 'Hello', 0);
  
  commandManager.execute(addCommand);
  console.log('Editor content:', editor.content);
  
  commandManager.undo();
  console.log('After undo:', editor.content);
  
  // 策略模式示例
  console.log('=== Strategy Pattern ===');
  const data = [64, 34, 25, 12, 22, 11, 90];
  
  const sortContext = new SortContext(new QuickSortStrategy());
  console.log('Quick sort:', sortContext.sort(data));
  
  sortContext.setStrategy(new MergeSortStrategy());
  console.log('Merge sort:', sortContext.sort(data));
  
  // 状态模式示例
  console.log('=== State Pattern ===');
  const player = new MediaPlayer();
  
  player.play();  // Starting playback
  player.pause(); // Pausing playback
  player.play();  // Resuming playback
  player.stop();  // Stopping playback
  
  console.groupEnd();
};

// 导出模块
export {
  GlobalStateManager,
  ComponentFactory,
  ThemeFactory,
  FormBuilder,
  APIAdapter,
  ComponentDecorator,
  LoadingDecorator,
  ErrorBoundaryDecorator,
  CacheDecorator,
  MediaFacade,
  ImageProxy,
  EventEmitter,
  Command,
  CommandManager,
  SortStrategy,
  SortContext,
  MediaPlayer,
  demonstratePatterns
};

/**
 * 设计模式最佳实践：
 * 
 * 1. 创建型模式：
 *    - 单例：全局状态管理、配置管理
 *    - 工厂：组件创建、主题切换
 *    - 建造者：复杂对象构建
 * 
 * 2. 结构型模式：
 *    - 适配器：API 兼容、数据格式转换
 *    - 装饰器：功能增强、横切关注点
 *    - 外观：复杂 API 简化
 *    - 代理：懒加载、缓存、访问控制
 * 
 * 3. 行为型模式：
 *    - 观察者：事件系统、状态变化通知
 *    - 命令：撤销重做、操作记录
 *    - 策略：算法切换、业务规则
 *    - 状态：状态机、流程控制
 * 
 * 4. 选择原则：
 *    - 根据具体问题选择合适的模式
 *    - 避免过度设计和模式滥用
 *    - 保持代码简洁和可维护性
 *    - 考虑性能和复杂度平衡
 */