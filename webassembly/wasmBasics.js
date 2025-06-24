/**
 * WebAssembly 基础与应用
 *
 * 本文件展示了 WebAssembly 的基本概念、使用方法和实际应用
 * 包括 WASM 模块加载、JavaScript 交互、性能优化等
 */

// 1. WebAssembly 基础概念

/**
 * WebAssembly (WASM) 是一种低级的类汇编语言，具有紧凑的二进制格式
 * 可以在现代 Web 浏览器中运行，并提供接近原生的性能
 *
 * 主要特点：
 * - 高性能：接近原生代码的执行速度
 * - 安全：在沙箱环境中运行
 * - 开放：开放的 Web 标准
 * - 可移植：跨平台运行
 * - 紧凑：二进制格式，体积小
 */

// 2. 加载和实例化 WebAssembly 模块

class WasmLoader {
  constructor() {
    this.modules = new Map();
  }

  // 从 URL 加载 WASM 模块
  async loadFromUrl(url, imports = {}) {
    try {
      const response = await fetch(url);
      const bytes = await response.arrayBuffer();
      return await this.loadFromBytes(bytes, imports);
    } catch (error) {
      console.error('加载 WASM 模块失败:', error);
      throw error;
    }
  }

  // 从字节数组加载 WASM 模块
  async loadFromBytes(bytes, imports = {}) {
    try {
      const module = await WebAssembly.compile(bytes);
      const instance = await WebAssembly.instantiate(module, imports);
      return {
        module,
        instance,
        exports: instance.exports,
      };
    } catch (error) {
      console.error('编译 WASM 模块失败:', error);
      throw error;
    }
  }

  // 流式加载（适用于大型模块）
  async loadStreaming(url, imports = {}) {
    try {
      const response = await fetch(url);
      const { module, instance } = await WebAssembly.instantiateStreaming(
        response,
        imports
      );
      return {
        module,
        instance,
        exports: instance.exports,
      };
    } catch (error) {
      console.error('流式加载 WASM 模块失败:', error);
      throw error;
    }
  }

  // 缓存模块
  cacheModule(name, wasmModule) {
    this.modules.set(name, wasmModule);
  }

  // 获取缓存的模块
  getCachedModule(name) {
    return this.modules.get(name);
  }
}

// 3. JavaScript 与 WebAssembly 交互

class WasmInterop {
  constructor(wasmInstance) {
    this.instance = wasmInstance;
    this.exports = wasmInstance.exports;
    this.memory = this.exports.memory;
  }

  // 内存操作
  getMemoryView() {
    return new DataView(this.memory.buffer);
  }

  getUint8Array() {
    return new Uint8Array(this.memory.buffer);
  }

  getInt32Array() {
    return new Int32Array(this.memory.buffer);
  }

  getFloat32Array() {
    return new Float32Array(this.memory.buffer);
  }

  // 字符串操作
  writeString(str, offset) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const memory = this.getUint8Array();

    for (let i = 0; i < bytes.length; i++) {
      memory[offset + i] = bytes[i];
    }

    return bytes.length;
  }

  readString(offset, length) {
    const memory = this.getUint8Array();
    const bytes = memory.slice(offset, offset + length);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // 数组操作
  writeArray(array, offset, type = 'int32') {
    const memory = this.getMemoryView();
    const bytesPerElement = this.getBytesPerElement(type);

    for (let i = 0; i < array.length; i++) {
      const byteOffset = offset + i * bytesPerElement;

      switch (type) {
        case 'int8':
          memory.setInt8(byteOffset, array[i]);
          break;
        case 'uint8':
          memory.setUint8(byteOffset, array[i]);
          break;
        case 'int16':
          memory.setInt16(byteOffset, array[i], true);
          break;
        case 'uint16':
          memory.setUint16(byteOffset, array[i], true);
          break;
        case 'int32':
          memory.setInt32(byteOffset, array[i], true);
          break;
        case 'uint32':
          memory.setUint32(byteOffset, array[i], true);
          break;
        case 'float32':
          memory.setFloat32(byteOffset, array[i], true);
          break;
        case 'float64':
          memory.setFloat64(byteOffset, array[i], true);
          break;
      }
    }

    return array.length * bytesPerElement;
  }

  readArray(offset, length, type = 'int32') {
    const memory = this.getMemoryView();
    const bytesPerElement = this.getBytesPerElement(type);
    const result = [];

    for (let i = 0; i < length; i++) {
      const byteOffset = offset + i * bytesPerElement;

      switch (type) {
        case 'int8':
          result.push(memory.getInt8(byteOffset));
          break;
        case 'uint8':
          result.push(memory.getUint8(byteOffset));
          break;
        case 'int16':
          result.push(memory.getInt16(byteOffset, true));
          break;
        case 'uint16':
          result.push(memory.getUint16(byteOffset, true));
          break;
        case 'int32':
          result.push(memory.getInt32(byteOffset, true));
          break;
        case 'uint32':
          result.push(memory.getUint32(byteOffset, true));
          break;
        case 'float32':
          result.push(memory.getFloat32(byteOffset, true));
          break;
        case 'float64':
          result.push(memory.getFloat64(byteOffset, true));
          break;
      }
    }

    return result;
  }

  getBytesPerElement(type) {
    const sizes = {
      int8: 1,
      uint8: 1,
      int16: 2,
      uint16: 2,
      int32: 4,
      uint32: 4,
      float32: 4,
      float64: 8,
    };
    return sizes[type] || 4;
  }

  // 调用 WASM 函数
  callFunction(functionName, ...args) {
    const func = this.exports[functionName];
    if (!func) {
      throw new Error(`函数 ${functionName} 不存在`);
    }
    return func(...args);
  }
}

// 4. 数学计算示例

class WasmMath {
  constructor(wasmInstance) {
    this.interop = new WasmInterop(wasmInstance);
  }

  // 矩阵乘法
  async matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
    const sizeA = rowsA * colsA;
    const sizeB = colsA * colsB;
    const sizeC = rowsA * colsB;

    // 分配内存
    const offsetA = this.interop.callFunction('allocate', sizeA * 4);
    const offsetB = this.interop.callFunction('allocate', sizeB * 4);
    const offsetC = this.interop.callFunction('allocate', sizeC * 4);

    try {
      // 写入数据
      this.interop.writeArray(matrixA, offsetA, 'float32');
      this.interop.writeArray(matrixB, offsetB, 'float32');

      // 调用 WASM 函数
      this.interop.callFunction(
        'matrix_multiply',
        offsetA,
        offsetB,
        offsetC,
        rowsA,
        colsA,
        colsB
      );

      // 读取结果
      const result = this.interop.readArray(offsetC, sizeC, 'float32');

      return result;
    } finally {
      // 释放内存
      this.interop.callFunction('deallocate', offsetA);
      this.interop.callFunction('deallocate', offsetB);
      this.interop.callFunction('deallocate', offsetC);
    }
  }

  // 快速傅里叶变换
  async fft(realPart, imagPart) {
    const size = realPart.length;

    const offsetReal = this.interop.callFunction('allocate', size * 4);
    const offsetImag = this.interop.callFunction('allocate', size * 4);

    try {
      this.interop.writeArray(realPart, offsetReal, 'float32');
      this.interop.writeArray(imagPart, offsetImag, 'float32');

      this.interop.callFunction('fft', offsetReal, offsetImag, size);

      const resultReal = this.interop.readArray(offsetReal, size, 'float32');
      const resultImag = this.interop.readArray(offsetImag, size, 'float32');

      return { real: resultReal, imag: resultImag };
    } finally {
      this.interop.callFunction('deallocate', offsetReal);
      this.interop.callFunction('deallocate', offsetImag);
    }
  }

  // 素数检测
  isPrime(number) {
    return this.interop.callFunction('is_prime', number) === 1;
  }

  // 计算斐波那契数列
  fibonacci(n) {
    return this.interop.callFunction('fibonacci', n);
  }
}

// 5. 图像处理示例

class WasmImageProcessor {
  constructor(wasmInstance) {
    this.interop = new WasmInterop(wasmInstance);
  }

  // 图像滤镜
  async applyFilter(imageData, filterType) {
    const { data, width, height } = imageData;
    const size = data.length;

    const offset = this.interop.callFunction('allocate', size);

    try {
      // 写入图像数据
      this.interop.writeArray(Array.from(data), offset, 'uint8');

      // 应用滤镜
      switch (filterType) {
        case 'grayscale':
          this.interop.callFunction('grayscale_filter', offset, width, height);
          break;
        case 'blur':
          this.interop.callFunction('blur_filter', offset, width, height);
          break;
        case 'sharpen':
          this.interop.callFunction('sharpen_filter', offset, width, height);
          break;
        case 'edge':
          this.interop.callFunction('edge_detection', offset, width, height);
          break;
      }

      // 读取处理后的数据
      const result = this.interop.readArray(offset, size, 'uint8');

      // 创建新的 ImageData
      const newImageData = new ImageData(
        new Uint8ClampedArray(result),
        width,
        height
      );

      return newImageData;
    } finally {
      this.interop.callFunction('deallocate', offset);
    }
  }

  // 图像缩放
  async resizeImage(imageData, newWidth, newHeight) {
    const { data, width, height } = imageData;
    const inputSize = data.length;
    const outputSize = newWidth * newHeight * 4;

    const inputOffset = this.interop.callFunction('allocate', inputSize);
    const outputOffset = this.interop.callFunction('allocate', outputSize);

    try {
      this.interop.writeArray(Array.from(data), inputOffset, 'uint8');

      this.interop.callFunction(
        'resize_image',
        inputOffset,
        outputOffset,
        width,
        height,
        newWidth,
        newHeight
      );

      const result = this.interop.readArray(outputOffset, outputSize, 'uint8');

      return new ImageData(new Uint8ClampedArray(result), newWidth, newHeight);
    } finally {
      this.interop.callFunction('deallocate', inputOffset);
      this.interop.callFunction('deallocate', outputOffset);
    }
  }
}

// 6. 性能基准测试

class WasmBenchmark {
  constructor() {
    this.results = [];
  }

  // 运行基准测试
  async runBenchmark(name, jsFunction, wasmFunction, iterations = 1000) {
    console.log(`开始基准测试: ${name}`);

    // JavaScript 版本测试
    const jsStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      jsFunction();
    }
    const jsEnd = performance.now();
    const jsTime = jsEnd - jsStart;

    // WebAssembly 版本测试
    const wasmStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      wasmFunction();
    }
    const wasmEnd = performance.now();
    const wasmTime = wasmEnd - wasmStart;

    const speedup = jsTime / wasmTime;

    const result = {
      name,
      iterations,
      jsTime: jsTime.toFixed(2),
      wasmTime: wasmTime.toFixed(2),
      speedup: speedup.toFixed(2),
    };

    this.results.push(result);

    console.log(`${name} 基准测试结果:`);
    console.log(`JavaScript: ${jsTime.toFixed(2)}ms`);
    console.log(`WebAssembly: ${wasmTime.toFixed(2)}ms`);
    console.log(`加速比: ${speedup.toFixed(2)}x`);

    return result;
  }

  // 数学计算基准测试
  async mathBenchmark(wasmMath) {
    const size = 1000;
    const array = new Array(size).fill(0).map(() => Math.random() * 100);

    // JavaScript 版本
    const jsSum = () => {
      return array.reduce((sum, val) => sum + val, 0);
    };

    // WASM 版本
    const wasmSum = () => {
      return wasmMath.interop.callFunction(
        'array_sum'
        /* 需要先将数组写入内存 */
      );
    };

    return await this.runBenchmark('数组求和', jsSum, wasmSum);
  }

  // 获取所有结果
  getResults() {
    return this.results;
  }

  // 生成报告
  generateReport() {
    console.table(this.results);

    const avgSpeedup =
      this.results.reduce(
        (sum, result) => sum + parseFloat(result.speedup),
        0
      ) / this.results.length;

    console.log(`平均加速比: ${avgSpeedup.toFixed(2)}x`);

    return {
      results: this.results,
      averageSpeedup: avgSpeedup,
    };
  }
}

// 7. WASM 模块管理器

class WasmModuleManager {
  constructor() {
    this.modules = new Map();
    this.loader = new WasmLoader();
  }

  // 注册模块
  async registerModule(name, url, imports = {}) {
    try {
      const wasmModule = await this.loader.loadFromUrl(url, imports);
      this.modules.set(name, wasmModule);
      console.log(`模块 ${name} 注册成功`);
      return wasmModule;
    } catch (error) {
      console.error(`模块 ${name} 注册失败:`, error);
      throw error;
    }
  }

  // 获取模块
  getModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`模块 ${name} 未找到`);
    }
    return module;
  }

  // 创建模块实例
  createInstance(name, imports = {}) {
    const module = this.getModule(name);
    return WebAssembly.instantiate(module.module, imports);
  }

  // 列出所有模块
  listModules() {
    return Array.from(this.modules.keys());
  }

  // 卸载模块
  unloadModule(name) {
    return this.modules.delete(name);
  }
}

// 8. 使用示例

// 初始化模块管理器
const moduleManager = new WasmModuleManager();

// 示例：加载数学计算模块
async function initMathModule() {
  try {
    // 注册数学模块
    const mathModule = await moduleManager.registerModule(
      'math',
      '/wasm/math.wasm',
      {
        env: {
          memory: new WebAssembly.Memory({ initial: 256 }),
          table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
          abort: () => console.error('WASM abort called'),
        },
      }
    );

    // 创建数学计算实例
    const wasmMath = new WasmMath(mathModule.instance);

    // 测试矩阵乘法
    const matrixA = [1, 2, 3, 4];
    const matrixB = [5, 6, 7, 8];
    const result = await wasmMath.matrixMultiply(matrixA, matrixB, 2, 2, 2);
    console.log('矩阵乘法结果:', result);

    // 测试素数检测
    console.log('97 是素数吗?', wasmMath.isPrime(97));

    // 运行基准测试
    const benchmark = new WasmBenchmark();
    await benchmark.mathBenchmark(wasmMath);
    benchmark.generateReport();
  } catch (error) {
    console.error('初始化数学模块失败:', error);
  }
}

// 示例：图像处理
async function initImageProcessor() {
  try {
    const imageModule = await moduleManager.registerModule(
      'image',
      '/wasm/image.wasm'
    );

    const processor = new WasmImageProcessor(imageModule.instance);

    // 从 Canvas 获取图像数据
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 应用灰度滤镜
    const grayImage = await processor.applyFilter(imageData, 'grayscale');

    // 显示处理后的图像
    ctx.putImageData(grayImage, 0, 0);
  } catch (error) {
    console.error('初始化图像处理模块失败:', error);
  }
}

// 9. 错误处理和调试

class WasmDebugger {
  constructor() {
    this.logs = [];
  }

  // 包装 WASM 函数调用以添加调试信息
  wrapFunction(wasmInstance, functionName) {
    const originalFunction = wasmInstance.exports[functionName];

    return (...args) => {
      const start = performance.now();

      try {
        const result = originalFunction(...args);
        const end = performance.now();

        this.log({
          function: functionName,
          args,
          result,
          duration: end - start,
          success: true,
        });

        return result;
      } catch (error) {
        const end = performance.now();

        this.log({
          function: functionName,
          args,
          error: error.message,
          duration: end - start,
          success: false,
        });

        throw error;
      }
    };
  }

  // 记录日志
  log(entry) {
    this.logs.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  // 获取日志
  getLogs() {
    return this.logs;
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
  }

  // 生成性能报告
  generatePerformanceReport() {
    const functionStats = new Map();

    this.logs.forEach((log) => {
      if (!functionStats.has(log.function)) {
        functionStats.set(log.function, {
          calls: 0,
          totalDuration: 0,
          errors: 0,
        });
      }

      const stats = functionStats.get(log.function);
      stats.calls++;
      stats.totalDuration += log.duration;
      if (!log.success) stats.errors++;
    });

    const report = Array.from(functionStats.entries()).map(([func, stats]) => ({
      function: func,
      calls: stats.calls,
      averageDuration: (stats.totalDuration / stats.calls).toFixed(2),
      totalDuration: stats.totalDuration.toFixed(2),
      errorRate: ((stats.errors / stats.calls) * 100).toFixed(2),
    }));

    console.table(report);
    return report;
  }
}

// 10. 工具函数

class WasmUtils {
  // 检查 WebAssembly 支持
  static isSupported() {
    return (
      typeof WebAssembly === 'object' &&
      typeof WebAssembly.instantiate === 'function'
    );
  }

  // 获取 WASM 模块信息
  static getModuleInfo(module) {
    const imports = WebAssembly.Module.imports(module);
    const exports = WebAssembly.Module.exports(module);

    return {
      imports: imports.map((imp) => ({
        module: imp.module,
        name: imp.name,
        kind: imp.kind,
      })),
      exports: exports.map((exp) => ({
        name: exp.name,
        kind: exp.kind,
      })),
    };
  }

  // 验证模块
  static validateModule(bytes) {
    try {
      return WebAssembly.validate(bytes);
    } catch (error) {
      console.error('模块验证失败:', error);
      return false;
    }
  }

  // 计算内存使用
  static getMemoryUsage(memory) {
    const pages = memory.buffer.byteLength / (64 * 1024);
    return {
      pages,
      bytes: memory.buffer.byteLength,
      megabytes: (memory.buffer.byteLength / (1024 * 1024)).toFixed(2),
    };
  }
}

// 导出所有类和工具
export {
  WasmLoader,
  WasmInterop,
  WasmMath,
  WasmImageProcessor,
  WasmBenchmark,
  WasmModuleManager,
  WasmDebugger,
  WasmUtils,
};

/**
 * WebAssembly 最佳实践：
 *
 * 1. 性能优化：
 *    - 使用适当的数据类型
 *    - 减少 JS-WASM 边界调用
 *    - 批量处理数据
 *    - 内存对齐
 *
 * 2. 内存管理：
 *    - 手动管理内存分配和释放
 *    - 避免内存泄漏
 *    - 使用内存池
 *
 * 3. 错误处理：
 *    - 验证输入参数
 *    - 处理内存不足
 *    - 提供有意义的错误信息
 *
 * 4. 调试技巧：
 *    - 使用浏览器开发工具
 *    - 添加日志记录
 *    - 性能分析
 *
 * 5. 部署考虑：
 *    - 压缩 WASM 文件
 *    - 使用 CDN
 *    - 缓存策略
 *    - 渐进式加载
 */
