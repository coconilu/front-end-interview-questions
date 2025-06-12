/**
 * 低代码/可视化开发平台实现
 * 
 * 本文件展示了低代码平台的核心概念和实现方式
 * 包括拖拽编辑器、组件系统、数据绑定等
 */

// 1. 拖拽编辑器核心实现

class DragDropEditor {
  constructor(container) {
    this.container = container;
    this.components = new Map();
    this.selectedComponent = null;
    this.draggedComponent = null;
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.createToolbox();
    this.createCanvas();
    this.createPropertyPanel();
  }
  
  // 创建组件工具箱
  createToolbox() {
    const toolbox = document.createElement('div');
    toolbox.className = 'toolbox';
    toolbox.innerHTML = `
      <h3>组件库</h3>
      <div class="component-list">
        <div class="component-item" draggable="true" data-type="button">
          <i class="icon-button"></i>
          <span>按钮</span>
        </div>
        <div class="component-item" draggable="true" data-type="input">
          <i class="icon-input"></i>
          <span>输入框</span>
        </div>
        <div class="component-item" draggable="true" data-type="text">
          <i class="icon-text"></i>
          <span>文本</span>
        </div>
        <div class="component-item" draggable="true" data-type="image">
          <i class="icon-image"></i>
          <span>图片</span>
        </div>
        <div class="component-item" draggable="true" data-type="container">
          <i class="icon-container"></i>
          <span>容器</span>
        </div>
      </div>
    `;
    
    this.container.appendChild(toolbox);
  }
  
  // 创建画布
  createCanvas() {
    const canvas = document.createElement('div');
    canvas.className = 'canvas';
    canvas.innerHTML = `
      <div class="canvas-header">
        <h3>设计画布</h3>
        <div class="canvas-actions">
          <button onclick="this.preview()">预览</button>
          <button onclick="this.save()">保存</button>
          <button onclick="this.clear()">清空</button>
        </div>
      </div>
      <div class="canvas-content" id="canvas-content">
        <div class="drop-zone">拖拽组件到这里</div>
      </div>
    `;
    
    this.container.appendChild(canvas);
    this.canvasContent = canvas.querySelector('#canvas-content');
  }
  
  // 创建属性面板
  createPropertyPanel() {
    const panel = document.createElement('div');
    panel.className = 'property-panel';
    panel.innerHTML = `
      <h3>属性设置</h3>
      <div class="property-content" id="property-content">
        <p>请选择一个组件</p>
      </div>
    `;
    
    this.container.appendChild(panel);
    this.propertyContent = panel.querySelector('#property-content');
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 工具箱拖拽开始
    this.container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('component-item')) {
        this.draggedComponent = {
          type: e.target.dataset.type,
          source: 'toolbox'
        };
        e.dataTransfer.effectAllowed = 'copy';
      }
    });
    
    // 画布拖拽事件
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.target.closest('.canvas-content') && this.draggedComponent) {
        this.createComponent(this.draggedComponent.type, {
          x: e.offsetX,
          y: e.offsetY
        });
        this.draggedComponent = null;
      }
    });
    
    // 组件选择
    this.container.addEventListener('click', (e) => {
      const component = e.target.closest('.component-instance');
      if (component) {
        this.selectComponent(component.dataset.id);
      }
    });
  }
  
  // 创建组件实例
  createComponent(type, position) {
    const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const componentData = {
      id,
      type,
      position,
      properties: this.getDefaultProperties(type),
      styles: this.getDefaultStyles(type)
    };
    
    this.components.set(id, componentData);
    this.renderComponent(componentData);
    this.selectComponent(id);
  }
  
  // 获取默认属性
  getDefaultProperties(type) {
    const defaults = {
      button: {
        text: '按钮',
        onClick: '',
        disabled: false
      },
      input: {
        placeholder: '请输入内容',
        value: '',
        type: 'text',
        required: false
      },
      text: {
        content: '文本内容',
        tag: 'p'
      },
      image: {
        src: 'https://via.placeholder.com/150',
        alt: '图片',
        width: 150,
        height: 150
      },
      container: {
        children: [],
        layout: 'flex',
        direction: 'column'
      }
    };
    
    return defaults[type] || {};
  }
  
  // 获取默认样式
  getDefaultStyles(type) {
    const defaults = {
      button: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer'
      },
      input: {
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '14px'
      },
      text: {
        fontSize: '14px',
        color: '#333',
        margin: '0'
      },
      image: {
        maxWidth: '100%',
        height: 'auto'
      },
      container: {
        border: '1px dashed #ccc',
        minHeight: '100px',
        padding: '10px'
      }
    };
    
    return defaults[type] || {};
  }
  
  // 渲染组件
  renderComponent(componentData) {
    const { id, type, position, properties, styles } = componentData;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'component-instance';
    wrapper.dataset.id = id;
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${position.x}px`;
    wrapper.style.top = `${position.y}px`;
    
    let element;
    
    switch (type) {
      case 'button':
        element = document.createElement('button');
        element.textContent = properties.text;
        element.disabled = properties.disabled;
        break;
        
      case 'input':
        element = document.createElement('input');
        element.type = properties.type;
        element.placeholder = properties.placeholder;
        element.value = properties.value;
        element.required = properties.required;
        break;
        
      case 'text':
        element = document.createElement(properties.tag);
        element.textContent = properties.content;
        break;
        
      case 'image':
        element = document.createElement('img');
        element.src = properties.src;
        element.alt = properties.alt;
        element.width = properties.width;
        element.height = properties.height;
        break;
        
      case 'container':
        element = document.createElement('div');
        element.style.display = properties.layout;
        element.style.flexDirection = properties.direction;
        break;
        
      default:
        element = document.createElement('div');
        element.textContent = `未知组件: ${type}`;
    }
    
    // 应用样式
    Object.assign(element.style, styles);
    
    wrapper.appendChild(element);
    this.canvasContent.appendChild(wrapper);
  }
  
  // 选择组件
  selectComponent(id) {
    // 清除之前的选择
    this.container.querySelectorAll('.component-instance.selected')
      .forEach(el => el.classList.remove('selected'));
    
    // 选择新组件
    const component = this.container.querySelector(`[data-id="${id}"]`);
    if (component) {
      component.classList.add('selected');
      this.selectedComponent = id;
      this.updatePropertyPanel(id);
    }
  }
  
  // 更新属性面板
  updatePropertyPanel(id) {
    const componentData = this.components.get(id);
    if (!componentData) return;
    
    const { type, properties, styles } = componentData;
    
    this.propertyContent.innerHTML = `
      <div class="property-section">
        <h4>基本属性</h4>
        ${this.renderPropertyInputs(properties, 'properties')}
      </div>
      <div class="property-section">
        <h4>样式设置</h4>
        ${this.renderStyleInputs(styles)}
      </div>
      <div class="property-section">
        <h4>操作</h4>
        <button onclick="this.deleteComponent('${id}')">删除组件</button>
        <button onclick="this.duplicateComponent('${id}')">复制组件</button>
      </div>
    `;
  }
  
  // 渲染属性输入框
  renderPropertyInputs(properties, section) {
    return Object.entries(properties).map(([key, value]) => {
      const inputType = typeof value === 'boolean' ? 'checkbox' : 'text';
      const inputValue = typeof value === 'boolean' ? '' : value;
      const checked = typeof value === 'boolean' && value ? 'checked' : '';
      
      return `
        <div class="property-item">
          <label>${key}:</label>
          <input 
            type="${inputType}" 
            value="${inputValue}" 
            ${checked}
            onchange="this.updateProperty('${section}', '${key}', this.value, this.type)"
          />
        </div>
      `;
    }).join('');
  }
  
  // 渲染样式输入框
  renderStyleInputs(styles) {
    return Object.entries(styles).map(([key, value]) => `
      <div class="property-item">
        <label>${key}:</label>
        <input 
          type="text" 
          value="${value}" 
          onchange="this.updateStyle('${key}', this.value)"
        />
      </div>
    `).join('');
  }
  
  // 更新属性
  updateProperty(section, key, value, type) {
    if (!this.selectedComponent) return;
    
    const componentData = this.components.get(this.selectedComponent);
    if (!componentData) return;
    
    const actualValue = type === 'checkbox' ? 
      event.target.checked : 
      (isNaN(value) ? value : Number(value));
    
    componentData[section][key] = actualValue;
    this.rerenderComponent(this.selectedComponent);
  }
  
  // 更新样式
  updateStyle(key, value) {
    if (!this.selectedComponent) return;
    
    const componentData = this.components.get(this.selectedComponent);
    if (!componentData) return;
    
    componentData.styles[key] = value;
    this.rerenderComponent(this.selectedComponent);
  }
  
  // 重新渲染组件
  rerenderComponent(id) {
    const existingElement = this.container.querySelector(`[data-id="${id}"]`);
    if (existingElement) {
      const position = {
        x: parseInt(existingElement.style.left),
        y: parseInt(existingElement.style.top)
      };
      existingElement.remove();
      
      const componentData = this.components.get(id);
      componentData.position = position;
      this.renderComponent(componentData);
      this.selectComponent(id);
    }
  }
  
  // 删除组件
  deleteComponent(id) {
    const element = this.container.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.remove();
      this.components.delete(id);
      this.selectedComponent = null;
      this.propertyContent.innerHTML = '<p>请选择一个组件</p>';
    }
  }
  
  // 复制组件
  duplicateComponent(id) {
    const componentData = this.components.get(id);
    if (!componentData) return;
    
    const newComponentData = {
      ...componentData,
      id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: componentData.position.x + 20,
        y: componentData.position.y + 20
      }
    };
    
    this.components.set(newComponentData.id, newComponentData);
    this.renderComponent(newComponentData);
    this.selectComponent(newComponentData.id);
  }
  
  // 预览
  preview() {
    const previewWindow = window.open('', '_blank');
    const html = this.generateHTML();
    previewWindow.document.write(html);
  }
  
  // 生成 HTML
  generateHTML() {
    const components = Array.from(this.components.values());
    
    const componentHTML = components.map(comp => {
      const { type, properties, styles, position } = comp;
      const styleStr = Object.entries(styles)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
      
      let html = '';
      
      switch (type) {
        case 'button':
          html = `<button style="${styleStr}; position: absolute; left: ${position.x}px; top: ${position.y}px;">${properties.text}</button>`;
          break;
        case 'input':
          html = `<input type="${properties.type}" placeholder="${properties.placeholder}" value="${properties.value}" style="${styleStr}; position: absolute; left: ${position.x}px; top: ${position.y}px;" />`;
          break;
        case 'text':
          html = `<${properties.tag} style="${styleStr}; position: absolute; left: ${position.x}px; top: ${position.y}px;">${properties.content}</${properties.tag}>`;
          break;
        case 'image':
          html = `<img src="${properties.src}" alt="${properties.alt}" width="${properties.width}" height="${properties.height}" style="${styleStr}; position: absolute; left: ${position.x}px; top: ${position.y}px;" />`;
          break;
        case 'container':
          html = `<div style="${styleStr}; position: absolute; left: ${position.x}px; top: ${position.y}px;"></div>`;
          break;
      }
      
      return html;
    }).join('\n');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>预览页面</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
      </html>
    `;
  }
  
  // 保存
  save() {
    const data = {
      components: Array.from(this.components.entries()),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('lowcode_design', JSON.stringify(data));
    alert('保存成功！');
  }
  
  // 加载
  load() {
    const saved = localStorage.getItem('lowcode_design');
    if (saved) {
      const data = JSON.parse(saved);
      this.components = new Map(data.components);
      this.renderAllComponents();
    }
  }
  
  // 渲染所有组件
  renderAllComponents() {
    this.canvasContent.innerHTML = '<div class="drop-zone">拖拽组件到这里</div>';
    this.components.forEach(componentData => {
      this.renderComponent(componentData);
    });
  }
  
  // 清空画布
  clear() {
    if (confirm('确定要清空画布吗？')) {
      this.components.clear();
      this.canvasContent.innerHTML = '<div class="drop-zone">拖拽组件到这里</div>';
      this.selectedComponent = null;
      this.propertyContent.innerHTML = '<p>请选择一个组件</p>';
    }
  }
}

// 2. 数据绑定系统

class DataBinding {
  constructor() {
    this.data = new Proxy({}, {
      set: (target, property, value) => {
        target[property] = value;
        this.updateBindings(property, value);
        return true;
      }
    });
    this.bindings = new Map();
  }
  
  // 绑定数据到元素
  bind(element, property, expression) {
    if (!this.bindings.has(property)) {
      this.bindings.set(property, []);
    }
    
    this.bindings.get(property).push({
      element,
      expression,
      update: (value) => this.updateElement(element, expression, value)
    });
  }
  
  // 更新绑定
  updateBindings(property, value) {
    const bindings = this.bindings.get(property);
    if (bindings) {
      bindings.forEach(binding => binding.update(value));
    }
  }
  
  // 更新元素
  updateElement(element, expression, value) {
    switch (expression.type) {
      case 'text':
        element.textContent = value;
        break;
      case 'value':
        element.value = value;
        break;
      case 'attribute':
        element.setAttribute(expression.attribute, value);
        break;
      case 'style':
        element.style[expression.property] = value;
        break;
      case 'class':
        element.classList.toggle(expression.className, value);
        break;
    }
  }
  
  // 设置数据
  setData(property, value) {
    this.data[property] = value;
  }
  
  // 获取数据
  getData(property) {
    return this.data[property];
  }
}

// 3. 组件系统

class ComponentSystem {
  constructor() {
    this.components = new Map();
    this.instances = new Map();
  }
  
  // 注册组件
  register(name, definition) {
    this.components.set(name, {
      ...definition,
      name
    });
  }
  
  // 创建组件实例
  create(name, props = {}, container) {
    const definition = this.components.get(name);
    if (!definition) {
      throw new Error(`组件 "${name}" 未注册`);
    }
    
    const instance = {
      id: `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      props,
      state: { ...definition.defaultState },
      element: null,
      children: [],
      parent: null
    };
    
    // 创建元素
    instance.element = this.createElement(definition, instance);
    
    // 添加到容器
    if (container) {
      container.appendChild(instance.element);
    }
    
    // 保存实例
    this.instances.set(instance.id, instance);
    
    // 调用生命周期
    if (definition.mounted) {
      definition.mounted.call(instance);
    }
    
    return instance;
  }
  
  // 创建元素
  createElement(definition, instance) {
    const element = document.createElement(definition.tag || 'div');
    
    // 设置属性
    if (definition.attributes) {
      Object.entries(definition.attributes).forEach(([key, value]) => {
        element.setAttribute(key, this.resolveValue(value, instance));
      });
    }
    
    // 设置样式
    if (definition.styles) {
      Object.entries(definition.styles).forEach(([key, value]) => {
        element.style[key] = this.resolveValue(value, instance);
      });
    }
    
    // 设置内容
    if (definition.template) {
      element.innerHTML = this.resolveTemplate(definition.template, instance);
    }
    
    // 绑定事件
    if (definition.events) {
      Object.entries(definition.events).forEach(([event, handler]) => {
        element.addEventListener(event, (e) => {
          handler.call(instance, e);
        });
      });
    }
    
    return element;
  }
  
  // 解析值
  resolveValue(value, instance) {
    if (typeof value === 'function') {
      return value.call(instance);
    }
    
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const expression = value.slice(2, -2).trim();
      return this.evaluateExpression(expression, instance);
    }
    
    return value;
  }
  
  // 解析模板
  resolveTemplate(template, instance) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      return this.evaluateExpression(expression.trim(), instance);
    });
  }
  
  // 计算表达式
  evaluateExpression(expression, instance) {
    try {
      // 简单的表达式计算（实际项目中应使用更安全的方式）
      const func = new Function('props', 'state', `return ${expression}`);
      return func(instance.props, instance.state);
    } catch (error) {
      console.error('表达式计算错误:', expression, error);
      return '';
    }
  }
  
  // 更新组件
  update(instanceId, newProps = {}, newState = {}) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    const definition = this.components.get(instance.name);
    
    // 更新 props 和 state
    Object.assign(instance.props, newProps);
    Object.assign(instance.state, newState);
    
    // 重新创建元素
    const newElement = this.createElement(definition, instance);
    instance.element.parentNode.replaceChild(newElement, instance.element);
    instance.element = newElement;
    
    // 调用生命周期
    if (definition.updated) {
      definition.updated.call(instance);
    }
  }
  
  // 销毁组件
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) return;
    
    const definition = this.components.get(instance.name);
    
    // 调用生命周期
    if (definition.beforeDestroy) {
      definition.beforeDestroy.call(instance);
    }
    
    // 移除元素
    if (instance.element && instance.element.parentNode) {
      instance.element.parentNode.removeChild(instance.element);
    }
    
    // 清理实例
    this.instances.delete(instanceId);
  }
}

// 4. 表单构建器

class FormBuilder {
  constructor(container) {
    this.container = container;
    this.fields = [];
    this.validators = new Map();
    this.formData = {};
  }
  
  // 添加字段
  addField(config) {
    const field = {
      id: config.id || `field_${Date.now()}`,
      type: config.type || 'text',
      label: config.label || '',
      placeholder: config.placeholder || '',
      required: config.required || false,
      validation: config.validation || [],
      options: config.options || [],
      value: config.value || ''
    };
    
    this.fields.push(field);
    this.renderField(field);
    return field;
  }
  
  // 渲染字段
  renderField(field) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-field';
    fieldContainer.dataset.fieldId = field.id;
    
    // 标签
    if (field.label) {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.setAttribute('for', field.id);
      if (field.required) {
        label.innerHTML += ' <span class="required">*</span>';
      }
      fieldContainer.appendChild(label);
    }
    
    // 输入元素
    let input;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        input = document.createElement('input');
        input.type = field.type;
        input.placeholder = field.placeholder;
        break;
        
      case 'textarea':
        input = document.createElement('textarea');
        input.placeholder = field.placeholder;
        break;
        
      case 'select':
        input = document.createElement('select');
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          input.appendChild(optionElement);
        });
        break;
        
      case 'radio':
        const radioContainer = document.createElement('div');
        radioContainer.className = 'radio-group';
        field.options.forEach(option => {
          const radioWrapper = document.createElement('div');
          radioWrapper.className = 'radio-item';
          
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = field.id;
          radio.value = option.value;
          radio.id = `${field.id}_${option.value}`;
          
          const radioLabel = document.createElement('label');
          radioLabel.setAttribute('for', radio.id);
          radioLabel.textContent = option.label;
          
          radioWrapper.appendChild(radio);
          radioWrapper.appendChild(radioLabel);
          radioContainer.appendChild(radioWrapper);
        });
        input = radioContainer;
        break;
        
      case 'checkbox':
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-group';
        field.options.forEach(option => {
          const checkboxWrapper = document.createElement('div');
          checkboxWrapper.className = 'checkbox-item';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = field.id;
          checkbox.value = option.value;
          checkbox.id = `${field.id}_${option.value}`;
          
          const checkboxLabel = document.createElement('label');
          checkboxLabel.setAttribute('for', checkbox.id);
          checkboxLabel.textContent = option.label;
          
          checkboxWrapper.appendChild(checkbox);
          checkboxWrapper.appendChild(checkboxLabel);
          checkboxContainer.appendChild(checkboxWrapper);
        });
        input = checkboxContainer;
        break;
        
      default:
        input = document.createElement('input');
        input.type = 'text';
    }
    
    if (input.tagName !== 'DIV') {
      input.id = field.id;
      input.name = field.id;
      input.value = field.value;
      input.required = field.required;
      
      // 添加验证事件
      input.addEventListener('blur', () => this.validateField(field.id));
      input.addEventListener('input', () => this.updateFormData(field.id));
    } else {
      // 处理 radio 和 checkbox 组
      const inputs = input.querySelectorAll('input');
      inputs.forEach(inp => {
        inp.addEventListener('change', () => this.updateFormData(field.id));
      });
    }
    
    fieldContainer.appendChild(input);
    
    // 错误信息容器
    const errorContainer = document.createElement('div');
    errorContainer.className = 'field-error';
    errorContainer.id = `${field.id}_error`;
    fieldContainer.appendChild(errorContainer);
    
    this.container.appendChild(fieldContainer);
  }
  
  // 验证字段
  validateField(fieldId) {
    const field = this.fields.find(f => f.id === fieldId);
    if (!field) return true;
    
    const value = this.getFieldValue(fieldId);
    const errors = [];
    
    // 必填验证
    if (field.required && (!value || value.length === 0)) {
      errors.push(`${field.label} 是必填项`);
    }
    
    // 自定义验证
    field.validation.forEach(validator => {
      if (typeof validator === 'function') {
        const result = validator(value);
        if (result !== true) {
          errors.push(result);
        }
      } else if (validator.pattern && !validator.pattern.test(value)) {
        errors.push(validator.message || '格式不正确');
      }
    });
    
    // 显示错误
    const errorContainer = document.getElementById(`${fieldId}_error`);
    if (errors.length > 0) {
      errorContainer.textContent = errors[0];
      errorContainer.style.display = 'block';
      return false;
    } else {
      errorContainer.style.display = 'none';
      return true;
    }
  }
  
  // 获取字段值
  getFieldValue(fieldId) {
    const field = this.fields.find(f => f.id === fieldId);
    if (!field) return null;
    
    switch (field.type) {
      case 'radio':
        const radioInput = this.container.querySelector(`input[name="${fieldId}"]:checked`);
        return radioInput ? radioInput.value : '';
        
      case 'checkbox':
        const checkboxInputs = this.container.querySelectorAll(`input[name="${fieldId}"]:checked`);
        return Array.from(checkboxInputs).map(input => input.value);
        
      default:
        const input = this.container.querySelector(`#${fieldId}`);
        return input ? input.value : '';
    }
  }
  
  // 更新表单数据
  updateFormData(fieldId) {
    this.formData[fieldId] = this.getFieldValue(fieldId);
  }
  
  // 验证整个表单
  validate() {
    let isValid = true;
    
    this.fields.forEach(field => {
      if (!this.validateField(field.id)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  // 获取表单数据
  getData() {
    this.fields.forEach(field => {
      this.updateFormData(field.id);
    });
    return { ...this.formData };
  }
  
  // 设置表单数据
  setData(data) {
    Object.entries(data).forEach(([fieldId, value]) => {
      const field = this.fields.find(f => f.id === fieldId);
      if (!field) return;
      
      switch (field.type) {
        case 'radio':
          const radioInput = this.container.querySelector(`input[name="${fieldId}"][value="${value}"]`);
          if (radioInput) radioInput.checked = true;
          break;
          
        case 'checkbox':
          const values = Array.isArray(value) ? value : [value];
          values.forEach(val => {
            const checkboxInput = this.container.querySelector(`input[name="${fieldId}"][value="${val}"]`);
            if (checkboxInput) checkboxInput.checked = true;
          });
          break;
          
        default:
          const input = this.container.querySelector(`#${fieldId}`);
          if (input) input.value = value;
      }
      
      this.formData[fieldId] = value;
    });
  }
  
  // 清空表单
  clear() {
    this.fields.forEach(field => {
      switch (field.type) {
        case 'radio':
        case 'checkbox':
          const inputs = this.container.querySelectorAll(`input[name="${field.id}"]`);
          inputs.forEach(input => input.checked = false);
          break;
          
        default:
          const input = this.container.querySelector(`#${field.id}`);
          if (input) input.value = '';
      }
    });
    
    this.formData = {};
  }
}

// 5. 使用示例

// 初始化拖拽编辑器
const editor = new DragDropEditor(document.getElementById('editor-container'));

// 注册自定义组件
const componentSystem = new ComponentSystem();

componentSystem.register('custom-button', {
  tag: 'button',
  defaultState: {
    clicked: false
  },
  attributes: {
    class: 'custom-btn',
    type: 'button'
  },
  styles: {
    padding: '10px 20px',
    backgroundColor: () => this.state.clicked ? '#28a745' : '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  template: '{{props.text || "按钮"}}',
  events: {
    click: function(e) {
      this.state.clicked = !this.state.clicked;
      componentSystem.update(this.id, {}, this.state);
    }
  },
  mounted: function() {
    console.log('自定义按钮已挂载:', this.id);
  }
});

// 创建表单构建器
const formBuilder = new FormBuilder(document.getElementById('form-container'));

// 添加表单字段
formBuilder.addField({
  id: 'username',
  type: 'text',
  label: '用户名',
  placeholder: '请输入用户名',
  required: true,
  validation: [
    {
      pattern: /^[a-zA-Z0-9_]{3,20}$/,
      message: '用户名只能包含字母、数字和下划线，长度3-20位'
    }
  ]
});

formBuilder.addField({
  id: 'email',
  type: 'email',
  label: '邮箱',
  placeholder: '请输入邮箱地址',
  required: true,
  validation: [
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入有效的邮箱地址'
    }
  ]
});

formBuilder.addField({
  id: 'gender',
  type: 'radio',
  label: '性别',
  required: true,
  options: [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
  ]
});

// 导出类和工具
export {
  DragDropEditor,
  DataBinding,
  ComponentSystem,
  FormBuilder
};

/**
 * 低代码/可视化开发最佳实践：
 * 
 * 1. 组件设计原则：
 *    - 高内聚、低耦合
 *    - 可配置、可扩展
 *    - 标准化接口
 * 
 * 2. 数据流管理：
 *    - 单向数据流
 *    - 状态集中管理
 *    - 响应式更新
 * 
 * 3. 用户体验：
 *    - 直观的拖拽操作
 *    - 实时预览
 *    - 撤销/重做功能
 * 
 * 4. 性能优化：
 *    - 虚拟滚动
 *    - 懒加载
 *    - 组件缓存
 * 
 * 5. 扩展性：
 *    - 插件系统
 *    - 自定义组件
 *    - 主题定制
 */