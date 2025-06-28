/**
 * 原型模式 (Prototype Pattern)
 * 经典面试题：实现一个可克隆的图形系统，支持深拷贝和浅拷贝
 * 
 * 面试考点：
 * 1. 原型模式的基本概念和使用场景
 * 2. 深拷贝 vs 浅拷贝的理解和实现
 * 3. JavaScript中的原型链和克隆机制
 * 4. 对象创建性能优化
 * 5. 复杂对象的拷贝策略
 */

// 可克隆接口
class Cloneable {
  clone() {
    throw new Error('clone method must be implemented');
  }

  deepClone() {
    throw new Error('deepClone method must be implemented');
  }
}

// 抽象图形类
class Shape extends Cloneable {
  constructor(id, type) {
    super();
    this.id = id;
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.color = '#000000';
    this.createdAt = new Date();
  }

  // 浅拷贝
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    
    // 为克隆对象生成新的ID
    cloned.id = this.generateId();
    cloned.createdAt = new Date();
    
    return cloned;
  }

  // 深拷贝
  deepClone() {
    const cloned = this.clone();
    
    // 深拷贝复杂属性
    if (this.metadata && typeof this.metadata === 'object') {
      cloned.metadata = JSON.parse(JSON.stringify(this.metadata));
    }
    
    if (this.style && typeof this.style === 'object') {
      cloned.style = { ...this.style };
    }
    
    if (this.transform && typeof this.transform === 'object') {
      cloned.transform = { ...this.transform };
    }
    
    return cloned;
  }

  // 设置位置
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  // 设置颜色
  setColor(color) {
    this.color = color;
    return this;
  }

  // 获取信息
  getInfo() {
    return {
      id: this.id,
      type: this.type,
      position: { x: this.x, y: this.y },
      color: this.color,
      createdAt: this.createdAt
    };
  }

  // 生成唯一ID
  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // 抽象方法
  draw() {
    throw new Error('draw method must be implemented');
  }

  getArea() {
    throw new Error('getArea method must be implemented');
  }
}

// 圆形
class Circle extends Shape {
  constructor(id, radius = 10) {
    super(id, 'circle');
    this.radius = radius;
    this.style = {
      lineWidth: 1,
      lineDash: [],
      opacity: 1
    };
  }

  // 重写深拷贝以处理特定属性
  deepClone() {
    const cloned = super.deepClone();
    
    // 圆形特有的深拷贝逻辑
    if (this.style) {
      cloned.style = {
        ...this.style,
        lineDash: [...(this.style.lineDash || [])]
      };
    }
    
    return cloned;
  }

  setRadius(radius) {
    this.radius = radius;
    return this;
  }

  setStyle(styleOptions) {
    this.style = { ...this.style, ...styleOptions };
    return this;
  }

  draw() {
    return `绘制圆形: 中心(${this.x}, ${this.y}), 半径${this.radius}, 颜色${this.color}`;
  }

  getArea() {
    return Math.PI * this.radius * this.radius;
  }

  getPerimeter() {
    return 2 * Math.PI * this.radius;
  }
}

// 矩形
class Rectangle extends Shape {
  constructor(id, width = 20, height = 10) {
    super(id, 'rectangle');
    this.width = width;
    this.height = height;
    this.transform = {
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    this.metadata = {
      author: 'unknown',
      version: '1.0',
      tags: []
    };
  }

  // 重写深拷贝
  deepClone() {
    const cloned = super.deepClone();
    
    // 矩形特有的深拷贝逻辑
    if (this.metadata && this.metadata.tags) {
      cloned.metadata.tags = [...this.metadata.tags];
    }
    
    return cloned;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  setTransform(transformOptions) {
    this.transform = { ...this.transform, ...transformOptions };
    return this;
  }

  setMetadata(metadataOptions) {
    this.metadata = { ...this.metadata, ...metadataOptions };
    return this;
  }

  addTag(tag) {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
    return this;
  }

  draw() {
    return `绘制矩形: 位置(${this.x}, ${this.y}), 尺寸${this.width}x${this.height}, 颜色${this.color}`;
  }

  getArea() {
    return this.width * this.height;
  }

  getPerimeter() {
    return 2 * (this.width + this.height);
  }
}

// 复杂图形：组合图形
class CompositeShape extends Shape {
  constructor(id, name) {
    super(id, 'composite');
    this.name = name;
    this.shapes = [];
    this.groupProperties = {
      locked: false,
      visible: true,
      opacity: 1
    };
  }

  // 重写深拷贝以处理嵌套图形
  deepClone() {
    const cloned = super.deepClone();
    
    // 深拷贝所有子图形
    cloned.shapes = this.shapes.map(shape => shape.deepClone());
    
    return cloned;
  }

  addShape(shape) {
    this.shapes.push(shape);
    return this;
  }

  removeShape(shapeId) {
    this.shapes = this.shapes.filter(shape => shape.id !== shapeId);
    return this;
  }

  setGroupProperties(properties) {
    this.groupProperties = { ...this.groupProperties, ...properties };
    return this;
  }

  draw() {
    const childDrawings = this.shapes.map(shape => `  ${shape.draw()}`).join('\n');
    return `绘制组合图形 "${this.name}":\n${childDrawings}`;
  }

  getArea() {
    return this.shapes.reduce((total, shape) => total + shape.getArea(), 0);
  }

  getShapeCount() {
    return this.shapes.length;
  }
}

// 带有复杂属性的特殊图形
class AdvancedShape extends Shape {
  constructor(id, type) {
    super(id, type);
    this.animation = {
      enabled: false,
      duration: 1000,
      easing: 'ease-in-out',
      keyframes: []
    };
    this.events = new Map();
    this.data = new WeakMap();
    this.buffer = new ArrayBuffer(1024);
  }

  // 重写深拷贝以处理特殊属性
  deepClone() {
    const cloned = super.deepClone();
    
    // 处理动画属性
    if (this.animation) {
      cloned.animation = {
        ...this.animation,
        keyframes: this.animation.keyframes.map(frame => ({ ...frame }))
      };
    }
    
    // 处理Map
    if (this.events) {
      cloned.events = new Map(this.events);
    }
    
    // WeakMap无法直接克隆，创建新的WeakMap
    cloned.data = new WeakMap();
    
    // ArrayBuffer需要复制数据
    cloned.buffer = this.buffer.slice();
    
    return cloned;
  }

  addAnimation(keyframe) {
    this.animation.keyframes.push(keyframe);
    return this;
  }

  addEventListener(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
    return this;
  }

  setData(key, value) {
    this.data.set(key, value);
    return this;
  }

  draw() {
    return `绘制高级图形: ${this.type}`;
  }

  getArea() {
    return 0;
  }
}

// 图形注册表（原型管理器）
class ShapeRegistry {
  constructor() {
    this.prototypes = new Map();
    this.statistics = {
      totalClones: 0,
      clonesByType: new Map()
    };
  }

  // 注册原型
  registerPrototype(key, prototype) {
    if (!(prototype instanceof Shape)) {
      throw new Error('Prototype must be an instance of Shape');
    }
    
    this.prototypes.set(key, prototype);
    console.log(`✅ 已注册原型: ${key} (${prototype.type})`);
  }

  // 获取原型的浅拷贝
  getClone(key) {
    const prototype = this.prototypes.get(key);
    
    if (!prototype) {
      throw new Error(`Prototype with key "${key}" not found`);
    }

    const clone = prototype.clone();
    this.updateStatistics(prototype.type, 'clone');
    
    console.log(`📋 创建浅拷贝: ${key} -> ${clone.id}`);
    return clone;
  }

  // 获取原型的深拷贝
  getDeepClone(key) {
    const prototype = this.prototypes.get(key);
    
    if (!prototype) {
      throw new Error(`Prototype with key "${key}" not found`);
    }

    const deepClone = prototype.deepClone();
    this.updateStatistics(prototype.type, 'deepClone');
    
    console.log(`📋 创建深拷贝: ${key} -> ${deepClone.id}`);
    return deepClone;
  }

  // 批量克隆
  batchClone(key, count, deep = false) {
    const clones = [];
    
    for (let i = 0; i < count; i++) {
      const clone = deep ? this.getDeepClone(key) : this.getClone(key);
      clones.push(clone);
    }
    
    console.log(`📋 批量${deep ? '深' : '浅'}拷贝: ${count}个 ${key}`);
    return clones;
  }

  // 列出所有原型
  listPrototypes() {
    const prototypes = [];
    
    for (const [key, prototype] of this.prototypes.entries()) {
      prototypes.push({
        key,
        type: prototype.type,
        id: prototype.id,
        createdAt: prototype.createdAt
      });
    }
    
    return prototypes;
  }

  // 更新统计信息
  updateStatistics(type, operation) {
    this.statistics.totalClones++;
    
    if (!this.statistics.clonesByType.has(type)) {
      this.statistics.clonesByType.set(type, { clone: 0, deepClone: 0 });
    }
    
    this.statistics.clonesByType.get(type)[operation]++;
  }

  // 获取统计信息
  getStatistics() {
    return {
      totalPrototypes: this.prototypes.size,
      totalClones: this.statistics.totalClones,
      clonesByType: Object.fromEntries(this.statistics.clonesByType)
    };
  }

  // 清理注册表
  clear() {
    this.prototypes.clear();
    this.statistics = {
      totalClones: 0,
      clonesByType: new Map()
    };
    console.log('🗑️ 原型注册表已清空');
  }
}

// 性能测试工具
class PerformanceTester {
  static async testClonePerformance(registry, prototypeKey, iterations = 1000) {
    console.log(`\n🚀 性能测试: ${prototypeKey} (${iterations}次迭代)`);
    
    // 测试浅拷贝性能
    const shallowStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      registry.getClone(prototypeKey);
    }
    const shallowEnd = performance.now();
    const shallowTime = shallowEnd - shallowStart;
    
    // 测试深拷贝性能
    const deepStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      registry.getDeepClone(prototypeKey);
    }
    const deepEnd = performance.now();
    const deepTime = deepEnd - deepStart;
    
    // 测试原生new创建性能
    const prototype = registry.prototypes.get(prototypeKey);
    const constructorStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      new prototype.constructor(prototype.id, ...Object.values(prototype).slice(2));
    }
    const constructorEnd = performance.now();
    const constructorTime = constructorEnd - constructorStart;
    
    const results = {
      iterations,
      shallowClone: {
        totalTime: shallowTime.toFixed(2),
        avgTime: (shallowTime / iterations).toFixed(4),
        opsPerSec: Math.round(iterations / (shallowTime / 1000))
      },
      deepClone: {
        totalTime: deepTime.toFixed(2),
        avgTime: (deepTime / iterations).toFixed(4),
        opsPerSec: Math.round(iterations / (deepTime / 1000))
      },
      constructor: {
        totalTime: constructorTime.toFixed(2),
        avgTime: (constructorTime / iterations).toFixed(4),
        opsPerSec: Math.round(iterations / (constructorTime / 1000))
      }
    };
    
    console.table(results);
    return results;
  }

  static testDeepCloneCorrectness(original, cloned) {
    console.log('\n🔍 深拷贝正确性测试');
    
    const tests = [
      {
        name: '对象不是同一个引用',
        test: () => original !== cloned,
        result: null
      },
      {
        name: 'ID不同',
        test: () => original.id !== cloned.id,
        result: null
      },
      {
        name: '基本属性相等',
        test: () => original.type === cloned.type && original.color === cloned.color,
        result: null
      },
      {
        name: '复杂属性不共享引用',
        test: () => {
          if (original.metadata && cloned.metadata) {
            return original.metadata !== cloned.metadata;
          }
          return true;
        },
        result: null
      }
    ];
    
    tests.forEach(test => {
      try {
        test.result = test.test() ? '✅ 通过' : '❌ 失败';
      } catch (error) {
        test.result = `❌ 错误: ${error.message}`;
      }
    });
    
    console.table(tests.map(t => ({ 测试项: t.name, 结果: t.result })));
    
    return tests.every(test => test.result.includes('通过'));
  }
}

// 使用示例和测试
async function demonstratePrototypePattern() {
  console.group('原型模式演示');

  // 创建原型注册表
  const registry = new ShapeRegistry();

  // 创建和注册原型
  console.log('\n=== 创建和注册原型 ===');
  
  const circlePrototype = new Circle('circle-proto', 25)
    .setPosition(100, 100)
    .setColor('#ff0000')
    .setStyle({ lineWidth: 2, opacity: 0.8 });
  
  const rectPrototype = new Rectangle('rect-proto', 50, 30)
    .setPosition(200, 150)
    .setColor('#00ff00')
    .setMetadata({ author: '张三', version: '2.0' })
    .addTag('geometric')
    .addTag('basic');

  const compositePrototype = new CompositeShape('composite-proto', '组合图形')
    .addShape(new Circle('inner-circle', 15).setColor('#0000ff'))
    .addShape(new Rectangle('inner-rect', 20, 20).setColor('#ffff00'))
    .setGroupProperties({ opacity: 0.9 });

  registry.registerPrototype('basic-circle', circlePrototype);
  registry.registerPrototype('basic-rectangle', rectPrototype);
  registry.registerPrototype('complex-composite', compositePrototype);

  // 测试浅拷贝
  console.log('\n=== 浅拷贝测试 ===');
  const shallowCircle = registry.getClone('basic-circle');
  shallowCircle.setPosition(300, 300).setColor('#purple');
  
  console.log('原型位置:', circlePrototype.x, circlePrototype.y);
  console.log('克隆位置:', shallowCircle.x, shallowCircle.y);
  console.log('样式对象共享:', circlePrototype.style === shallowCircle.style);

  // 测试深拷贝
  console.log('\n=== 深拷贝测试 ===');
  const deepRect = registry.getDeepClone('basic-rectangle');
  deepRect.setPosition(400, 400).setColor('#purple');
  deepRect.metadata.author = '李四';
  deepRect.addTag('modified');
  
  console.log('原型作者:', rectPrototype.metadata.author);
  console.log('克隆作者:', deepRect.metadata.author);
  console.log('原型标签:', rectPrototype.metadata.tags);
  console.log('克隆标签:', deepRect.metadata.tags);
  console.log('元数据对象共享:', rectPrototype.metadata === deepRect.metadata);

  // 测试复杂对象的深拷贝
  console.log('\n=== 复杂对象深拷贝测试 ===');
  const deepComposite = registry.getDeepClone('complex-composite');
  console.log('原型子图形数量:', compositePrototype.shapes.length);
  console.log('克隆子图形数量:', deepComposite.shapes.length);
  console.log('子图形对象共享:', compositePrototype.shapes[0] === deepComposite.shapes[0]);

  // 批量克隆测试
  console.log('\n=== 批量克隆测试 ===');
  const batchCircles = registry.batchClone('basic-circle', 5, false);
  const batchRects = registry.batchClone('basic-rectangle', 3, true);
  
  console.log('批量浅拷贝圆形:', batchCircles.length);
  console.log('批量深拷贝矩形:', batchRects.length);

  // 显示统计信息
  console.log('\n=== 统计信息 ===');
  console.table(registry.getStatistics());

  // 性能测试
  console.log('\n=== 性能测试 ===');
  await PerformanceTester.testClonePerformance(registry, 'basic-circle', 1000);

  // 正确性测试
  console.log('\n=== 正确性测试 ===');
  const testCorrectness = PerformanceTester.testDeepCloneCorrectness(
    rectPrototype, 
    registry.getDeepClone('basic-rectangle')
  );
  
  console.log('深拷贝正确性:', testCorrectness ? '✅ 全部通过' : '❌ 有测试失败');

  console.groupEnd();
}

// 导出
export {
  Cloneable,
  Shape,
  Circle,
  Rectangle,
  CompositeShape,
  AdvancedShape,
  ShapeRegistry,
  PerformanceTester,
  demonstratePrototypePattern
};

/**
 * 面试要点总结：
 * 
 * 1. 原型模式的核心概念：
 *    - 通过克隆现有对象来创建新对象
 *    - 避免重复的初始化操作
 *    - 支持动态添加和删除产品
 * 
 * 2. 浅拷贝 vs 深拷贝：
 *    - 浅拷贝：只复制对象的引用
 *    - 深拷贝：递归复制对象及其所有子对象
 *    - 性能权衡：浅拷贝快但可能有副作用，深拷贝安全但耗时
 * 
 * 3. JavaScript中的实现方式：
 *    - Object.assign() 浅拷贝
 *    - JSON.parse(JSON.stringify()) 深拷贝（有限制）
 *    - 自定义克隆方法
 *    - 结构化克隆（structuredClone）
 * 
 * 4. 适用场景：
 *    - 对象创建成本高昂
 *    - 需要大量相似对象
 *    - 运行时确定对象类型
 *    - 配置对象的克隆
 * 
 * 5. 优缺点：
 *    优点：
 *    - 性能优于new操作
 *    - 简化对象创建
 *    - 运行时动态配置
 *    
 *    缺点：
 *    - 深拷贝复杂对象困难
 *    - 循环引用问题
 *    - 某些对象无法克隆（如函数、DOM节点）
 * 
 * 6. 与其他模式的关系：
 *    - 常与抽象工厂模式结合
 *    - 可以简化建造者模式
 *    - 与享元模式配合使用
 */ 