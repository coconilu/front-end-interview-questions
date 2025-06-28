/**
 * 模板方法模式 (Template Method Pattern)
 * 经典面试题：实现一个数据处理流水线，支持不同的数据源和处理方式
 * 
 * 面试考点：
 * 1. 模板方法模式的基本概念
 * 2. 抽象类和具体子类的设计
 * 3. 算法骨架的定义和步骤的个性化实现
 * 4. 钩子方法的使用
 * 5. 好莱坞原则（Don't call us, we'll call you）
 */

// 抽象数据处理器
class DataProcessor {
  // 模板方法 - 定义处理流程的骨架
  async processData(inputData) {
    console.log('开始数据处理流程...');

    try {
      // 1. 验证输入数据
      const validationResult = await this.validateInput(inputData);
      if (!validationResult.isValid) {
        throw new Error(`数据验证失败: ${validationResult.errors.join(', ')}`);
      }

      // 2. 预处理数据（钩子方法，子类可选择是否实现）
      const preprocessedData = await this.preprocess(inputData);

      // 3. 核心处理逻辑（抽象方法，子类必须实现）
      const processedData = await this.doProcess(preprocessedData);

      // 4. 后处理数据（钩子方法）
      const finalData = await this.postprocess(processedData);

      // 5. 保存结果（抽象方法）
      const saveResult = await this.saveResult(finalData);

      // 6. 发送通知（钩子方法）
      if (this.shouldNotify()) {
        await this.sendNotification(saveResult);
      }

      console.log('数据处理完成');
      return {
        success: true,
        data: finalData,
        metadata: saveResult
      };

    } catch (error) {
      console.error('数据处理失败:', error.message);
      
      // 错误处理（钩子方法）
      await this.handleError(error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 抽象方法 - 子类必须实现
  async validateInput(data) {
    throw new Error('validateInput method must be implemented');
  }

  async doProcess(data) {
    throw new Error('doProcess method must be implemented');
  }

  async saveResult(data) {
    throw new Error('saveResult method must be implemented');
  }

  // 钩子方法 - 子类可选择性覆盖
  async preprocess(data) {
    console.log('执行默认预处理...');
    return data;
  }

  async postprocess(data) {
    console.log('执行默认后处理...');
    return data;
  }

  shouldNotify() {
    return true; // 默认发送通知
  }

  async sendNotification(result) {
    console.log('发送处理完成通知');
  }

  async handleError(error) {
    console.log('执行默认错误处理...');
  }
}

// 具体实现：JSON数据处理器
class JsonDataProcessor extends DataProcessor {
  constructor(options = {}) {
    super();
    this.requiredFields = options.requiredFields || [];
    this.outputFormat = options.outputFormat || 'json';
  }

  async validateInput(data) {
    const errors = [];

    // 检查是否为有效的JSON
    if (typeof data !== 'object' || data === null) {
      errors.push('输入数据必须是有效的JSON对象');
    } else {
      // 检查必需字段
      for (const field of this.requiredFields) {
        if (!data.hasOwnProperty(field)) {
          errors.push(`缺少必需字段: ${field}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async preprocess(data) {
    console.log('JSON预处理：清理和格式化数据');
    
    // 移除空值和undefined
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanData[key] = value;
      }
    }

    // 添加处理时间戳
    cleanData._processedAt = new Date().toISOString();
    
    return cleanData;
  }

  async doProcess(data) {
    console.log('执行JSON数据核心处理逻辑');
    
    // 数据转换和业务逻辑处理
    const processedData = {
      ...data,
      _id: this.generateId(),
      _version: '1.0',
      _status: 'processed'
    };

    // 模拟异步处理
    await this.delay(100);

    return processedData;
  }

  async postprocess(data) {
    console.log('JSON后处理：格式化输出');
    
    if (this.outputFormat === 'xml') {
      return this.convertToXml(data);
    }
    
    return JSON.stringify(data, null, 2);
  }

  async saveResult(data) {
    console.log('保存JSON处理结果到数据库');
    
    // 模拟数据库保存
    const result = {
      id: this.generateId(),
      savedAt: new Date().toISOString(),
      size: JSON.stringify(data).length
    };

    await this.delay(50);
    return result;
  }

  shouldNotify() {
    return true; // JSON处理器总是发送通知
  }

  async sendNotification(result) {
    console.log(`JSON数据处理完成通知 - ID: ${result.id}, 大小: ${result.size} bytes`);
  }

  // 辅助方法
  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  convertToXml(data) {
    // 简化的JSON到XML转换
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    for (const [key, value] of Object.entries(JSON.parse(data))) {
      xml += `  <${key}>${value}</${key}>\n`;
    }
    xml += '</root>';
    return xml;
  }
}

// 具体实现：CSV数据处理器
class CsvDataProcessor extends DataProcessor {
  constructor(options = {}) {
    super();
    this.delimiter = options.delimiter || ',';
    this.hasHeader = options.hasHeader !== false;
    this.maxRows = options.maxRows || 10000;
  }

  async validateInput(data) {
    const errors = [];

    if (typeof data !== 'string') {
      errors.push('CSV数据必须是字符串格式');
    } else {
      const lines = data.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        errors.push('CSV数据不能为空');
      } else if (lines.length > this.maxRows) {
        errors.push(`CSV行数超过限制 (${this.maxRows})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async preprocess(data) {
    console.log('CSV预处理：解析和清理数据');
    
    const lines = data.split('\n').filter(line => line.trim());
    let headers = [];
    let rows = [];

    if (this.hasHeader && lines.length > 0) {
      headers = lines[0].split(this.delimiter).map(h => h.trim());
      rows = lines.slice(1);
    } else {
      headers = lines[0] ? lines[0].split(this.delimiter).map((_, i) => `column_${i}`) : [];
      rows = lines;
    }

    return {
      headers,
      rows: rows.map(row => row.split(this.delimiter).map(cell => cell.trim()))
    };
  }

  async doProcess(data) {
    console.log('执行CSV数据核心处理逻辑');
    
    const { headers, rows } = data;
    
    // 转换为对象数组
    const processedData = rows.map((row, index) => {
      const obj = { _rowIndex: index };
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });

    // 数据统计
    const statistics = {
      totalRows: processedData.length,
      totalColumns: headers.length,
      headers,
      processedAt: new Date().toISOString()
    };

    await this.delay(200);

    return {
      data: processedData,
      statistics
    };
  }

  async postprocess(processedData) {
    console.log('CSV后处理：生成统计报告');
    
    const { data, statistics } = processedData;
    
    return {
      processedRecords: data,
      summary: {
        ...statistics,
        sampleRecord: data[0] || null
      }
    };
  }

  async saveResult(data) {
    console.log('保存CSV处理结果');
    
    const result = {
      id: this.generateId(),
      type: 'csv',
      recordCount: data.processedRecords.length,
      savedAt: new Date().toISOString()
    };

    await this.delay(100);
    return result;
  }

  shouldNotify() {
    // 只有当记录数大于100时才发送通知
    return true;
  }

  async sendNotification(result) {
    console.log(`CSV数据处理完成 - 处理了 ${result.recordCount} 条记录`);
  }

  async handleError(error) {
    console.log('CSV处理器特定错误处理:', error.message);
    // 可以在这里添加特定的错误恢复逻辑
  }

  generateId() {
    return 'csv_' + Date.now().toString(36);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 具体实现：图片数据处理器
class ImageDataProcessor extends DataProcessor {
  constructor(options = {}) {
    super();
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
    this.allowedFormats = options.allowedFormats || ['jpg', 'png', 'gif', 'webp'];
    this.compressionQuality = options.compressionQuality || 0.8;
  }

  async validateInput(data) {
    const errors = [];

    if (!data || !data.buffer || !data.filename) {
      errors.push('图片数据格式无效');
    } else {
      // 检查文件大小
      if (data.buffer.length > this.maxSize) {
        errors.push(`文件大小超过限制 (${this.maxSize / 1024 / 1024}MB)`);
      }

      // 检查文件格式
      const extension = data.filename.split('.').pop().toLowerCase();
      if (!this.allowedFormats.includes(extension)) {
        errors.push(`不支持的文件格式: ${extension}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async preprocess(data) {
    console.log('图片预处理：读取元数据');
    
    // 模拟图片元数据提取
    const metadata = {
      filename: data.filename,
      size: data.buffer.length,
      format: data.filename.split('.').pop().toLowerCase(),
      dimensions: { width: 1920, height: 1080 }, // 模拟数据
      processedAt: new Date().toISOString()
    };

    return {
      ...data,
      metadata
    };
  }

  async doProcess(data) {
    console.log('执行图片核心处理：压缩和优化');
    
    // 模拟图片处理操作
    const processedBuffer = this.compressImage(data.buffer);
    
    const result = {
      ...data,
      processedBuffer,
      metadata: {
        ...data.metadata,
        originalSize: data.buffer.length,
        compressedSize: processedBuffer.length,
        compressionRatio: (1 - processedBuffer.length / data.buffer.length).toFixed(2)
      }
    };

    await this.delay(300);
    return result;
  }

  async postprocess(data) {
    console.log('图片后处理：生成缩略图和统计');
    
    // 模拟缩略图生成
    const thumbnail = this.generateThumbnail(data.processedBuffer);
    
    return {
      ...data,
      thumbnail,
      summary: {
        originalSize: data.metadata.originalSize,
        finalSize: data.metadata.compressedSize,
        savedBytes: data.metadata.originalSize - data.metadata.compressedSize,
        compressionRatio: data.metadata.compressionRatio
      }
    };
  }

  async saveResult(data) {
    console.log('保存图片处理结果到存储');
    
    // 模拟文件保存
    const result = {
      id: this.generateId(),
      type: 'image',
      filename: data.filename,
      originalSize: data.metadata.originalSize,
      finalSize: data.metadata.compressedSize,
      savedAt: new Date().toISOString(),
      path: `/images/processed/${this.generateId()}_${data.filename}`
    };

    await this.delay(150);
    return result;
  }

  shouldNotify() {
    return true; // 图片处理完成总是通知
  }

  async sendNotification(result) {
    console.log(`图片处理完成 - ${result.filename}`);
    console.log(`压缩效果: ${result.originalSize} -> ${result.finalSize} bytes`);
  }

  async handleError(error) {
    console.log('图片处理器错误处理:', error.message);
    // 可以在这里清理临时文件等
  }

  // 模拟方法
  compressImage(buffer) {
    // 模拟压缩：减少30%大小
    const compressedSize = Math.floor(buffer.length * 0.7);
    return Buffer.alloc(compressedSize);
  }

  generateThumbnail(buffer) {
    // 模拟缩略图生成
    return Buffer.alloc(Math.floor(buffer.length * 0.1));
  }

  generateId() {
    return 'img_' + Date.now().toString(36);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 处理器工厂
class ProcessorFactory {
  static createProcessor(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'json':
        return new JsonDataProcessor(options);
      case 'csv':
        return new CsvDataProcessor(options);
      case 'image':
        return new ImageDataProcessor(options);
      default:
        throw new Error(`不支持的处理器类型: ${type}`);
    }
  }
}

// 使用示例和测试
async function demonstrateTemplateMethod() {
  console.group('模板方法模式演示');

  // 测试JSON处理器
  console.log('\n=== JSON数据处理器测试 ===');
  const jsonProcessor = ProcessorFactory.createProcessor('json', {
    requiredFields: ['name', 'email'],
    outputFormat: 'json'
  });

  const jsonData = {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 30,
    city: '北京',
    emptyField: null
  };

  const jsonResult = await jsonProcessor.processData(jsonData);
  console.log('JSON处理结果:', jsonResult.success ? '成功' : '失败');

  // 测试CSV处理器
  console.log('\n=== CSV数据处理器测试 ===');
  const csvProcessor = ProcessorFactory.createProcessor('csv', {
    delimiter: ',',
    hasHeader: true,
    maxRows: 1000
  });

  const csvData = `name,age,city
张三,30,北京
李四,25,上海
王五,35,广州`;

  const csvResult = await csvProcessor.processData(csvData);
  console.log('CSV处理结果:', csvResult.success ? '成功' : '失败');

  // 测试图片处理器
  console.log('\n=== 图片数据处理器测试 ===');
  const imageProcessor = ProcessorFactory.createProcessor('image', {
    maxSize: 10 * 1024 * 1024,
    allowedFormats: ['jpg', 'png'],
    compressionQuality: 0.8
  });

  const imageData = {
    filename: 'test.jpg',
    buffer: Buffer.alloc(1024 * 1024) // 1MB模拟图片
  };

  const imageResult = await imageProcessor.processData(imageData);
  console.log('图片处理结果:', imageResult.success ? '成功' : '失败');

  // 测试错误处理
  console.log('\n=== 错误处理测试 ===');
  const invalidResult = await jsonProcessor.processData('invalid data');
  console.log('无效数据处理结果:', invalidResult.success ? '成功' : '失败');

  console.groupEnd();
}

// 导出
export {
  DataProcessor,
  JsonDataProcessor,
  CsvDataProcessor,
  ImageDataProcessor,
  ProcessorFactory,
  demonstrateTemplateMethod
};

/**
 * 面试要点总结：
 * 
 * 1. 模板方法模式的核心概念：
 *    - 在父类中定义算法的骨架，将某些步骤延迟到子类中实现
 *    - 通过继承复用公共代码，通过覆盖实现差异化
 *    - 控制算法的整体结构，允许子类重定义特定步骤
 * 
 * 2. 关键组成部分：
 *    - 模板方法：定义算法骨架的方法（processData）
 *    - 抽象方法：子类必须实现的方法
 *    - 钩子方法：子类可选择性覆盖的方法
 * 
 * 3. 适用场景：
 *    - 多个类有相同的算法结构但具体实现不同
 *    - 需要控制算法的执行顺序
 *    - 想要避免代码重复时
 * 
 * 4. 优缺点：
 *    优点：
 *    - 代码复用性好
 *    - 符合开闭原则
 *    - 控制算法结构
 *    
 *    缺点：
 *    - 继承关系可能过于复杂
 *    - 子类数量可能增加
 *    - 调试相对困难
 * 
 * 5. 与策略模式的区别：
 *    - 模板方法通过继承改变算法的某些部分
 *    - 策略模式通过组合改变整个算法
 */ 