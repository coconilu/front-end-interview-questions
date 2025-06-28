/**
 * 责任链模式 (Chain of Responsibility Pattern)
 * 经典面试题：实现一个HTTP请求处理链，支持认证、权限、缓存、日志等中间件
 * 
 * 面试考点：
 * 1. 责任链模式的基本概念和实现
 * 2. 中间件模式的理解和应用
 * 3. 请求的传递和处理机制
 * 4. 动态构建处理链
 * 5. 与装饰器模式的区别
 */

// 抽象处理器
class Handler {
  constructor() {
    this.nextHandler = null;
  }

  // 设置下一个处理器
  setNext(handler) {
    this.nextHandler = handler;
    return handler; // 支持链式调用
  }

  // 处理请求
  async handle(request) {
    const result = await this.doHandle(request);
    
    // 如果当前处理器处理了请求，返回结果
    if (result && result.handled) {
      return result;
    }

    // 否则传递给下一个处理器
    if (this.nextHandler) {
      return await this.nextHandler.handle(request);
    }

    // 如果没有下一个处理器，返回未处理的结果
    return {
      handled: false,
      message: '没有处理器能够处理该请求'
    };
  }

  // 子类需要实现的处理方法
  async doHandle(request) {
    throw new Error('doHandle method must be implemented');
  }
}

// 认证处理器
class AuthenticationHandler extends Handler {
  constructor(requiredAuth = true) {
    super();
    this.requiredAuth = requiredAuth;
  }

  async doHandle(request) {
    console.log('🔐 执行身份认证检查...');

    // 检查是否需要认证
    if (!this.requiredAuth) {
      console.log('✅ 该请求不需要认证');
      return { handled: false }; // 继续到下一个处理器
    }

    // 检查认证信息
    const token = request.headers?.authorization;
    if (!token) {
      console.log('❌ 缺少认证信息');
      return {
        handled: true,
        success: false,
        statusCode: 401,
        message: '未提供认证信息'
      };
    }

    // 验证token（模拟）
    const isValidToken = await this.validateToken(token);
    if (!isValidToken) {
      console.log('❌ 认证失败');
      return {
        handled: true,
        success: false,
        statusCode: 401,
        message: '认证失败'
      };
    }

    // 将用户信息添加到请求中
    request.user = await this.getUserFromToken(token);
    console.log(`✅ 认证成功，用户: ${request.user.name}`);
    
    return { handled: false }; // 继续到下一个处理器
  }

  async validateToken(token) {
    // 模拟token验证
    await this.delay(50);
    return token.includes('valid');
  }

  async getUserFromToken(token) {
    // 模拟从token获取用户信息
    await this.delay(30);
    return {
      id: '12345',
      name: '张三',
      role: 'user'
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 权限检查处理器
class AuthorizationHandler extends Handler {
  constructor(requiredPermissions = []) {
    super();
    this.requiredPermissions = requiredPermissions;
  }

  async doHandle(request) {
    console.log('🛡️ 执行权限检查...');

    // 检查是否需要权限验证
    if (this.requiredPermissions.length === 0) {
      console.log('✅ 该请求不需要特殊权限');
      return { handled: false };
    }

    // 检查用户是否已认证
    if (!request.user) {
      console.log('❌ 用户未认证，无法进行权限检查');
      return {
        handled: true,
        success: false,
        statusCode: 401,
        message: '用户未认证'
      };
    }

    // 获取用户权限
    const userPermissions = await this.getUserPermissions(request.user);
    
    // 检查是否有足够权限
    const hasPermission = this.requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      console.log('❌ 权限不足');
      return {
        handled: true,
        success: false,
        statusCode: 403,
        message: '权限不足'
      };
    }

    console.log('✅ 权限检查通过');
    return { handled: false };
  }

  async getUserPermissions(user) {
    // 模拟获取用户权限
    await this.delay(40);
    
    const permissionMap = {
      'admin': ['read', 'write', 'delete', 'admin'],
      'user': ['read', 'write'],
      'guest': ['read']
    };

    return permissionMap[user.role] || ['read'];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 缓存处理器
class CacheHandler extends Handler {
  constructor(ttl = 300) { // 默认5分钟缓存
    super();
    this.cache = new Map();
    this.ttl = ttl * 1000; // 转换为毫秒
  }

  async doHandle(request) {
    console.log('💾 检查缓存...');

    // 只对GET请求进行缓存
    if (request.method !== 'GET') {
      console.log('⏭️ 非GET请求，跳过缓存');
      return { handled: false };
    }

    const cacheKey = this.generateCacheKey(request);
    const cachedData = this.cache.get(cacheKey);

    // 检查缓存是否存在且未过期
    if (cachedData && !this.isCacheExpired(cachedData)) {
      console.log('✅ 缓存命中');
      return {
        handled: true,
        success: true,
        statusCode: 200,
        data: cachedData.data,
        fromCache: true
      };
    }

    // 缓存未命中，继续处理并缓存结果
    console.log('❌ 缓存未命中，继续处理请求');
    
    // 添加缓存回调到请求中
    request.cacheCallback = (data) => {
      this.setCache(cacheKey, data);
    };

    return { handled: false };
  }

  generateCacheKey(request) {
    const { method, url, user } = request;
    const userId = user ? user.id : 'anonymous';
    return `${method}:${url}:${userId}`;
  }

  isCacheExpired(cachedData) {
    return Date.now() - cachedData.timestamp > this.ttl;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log('💾 数据已缓存');
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ 缓存已清空');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// 日志处理器
class LoggingHandler extends Handler {
  constructor(logLevel = 'info') {
    super();
    this.logLevel = logLevel;
    this.logs = [];
  }

  async doHandle(request) {
    const startTime = Date.now();
    console.log('📝 记录请求日志...');

    // 记录请求开始
    const requestLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userAgent: request.headers?.['user-agent'] || 'unknown',
      userId: request.user?.id || 'anonymous',
      ip: request.ip || '127.0.0.1'
    };

    this.logs.push(requestLog);

    // 添加响应日志回调到请求中
    request.logCallback = (response) => {
      const endTime = Date.now();
      const responseLog = {
        ...requestLog,
        statusCode: response.statusCode,
        responseTime: endTime - startTime,
        success: response.success
      };

      this.logs.push(responseLog);
      console.log(`📝 请求处理完成: ${response.statusCode} (${endTime - startTime}ms)`);
    };

    console.log('✅ 日志记录设置完成');
    return { handled: false };
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
    console.log('🗑️ 日志已清空');
  }

  getStats() {
    const totalRequests = this.logs.length;
    const successRequests = this.logs.filter(log => log.success).length;
    const averageResponseTime = this.logs.reduce((sum, log) => 
      sum + (log.responseTime || 0), 0) / totalRequests || 0;

    return {
      totalRequests,
      successRequests,
      errorRequests: totalRequests - successRequests,
      averageResponseTime: Math.round(averageResponseTime)
    };
  }
}

// 限流处理器
class RateLimitHandler extends Handler {
  constructor(maxRequests = 100, windowMs = 60000) { // 默认每分钟100次
    super();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // 存储每个用户的请求记录
  }

  async doHandle(request) {
    console.log('⚡ 执行限流检查...');

    const userId = request.user?.id || request.ip || 'anonymous';
    const now = Date.now();
    
    // 获取用户请求记录
    if (!this.requests.has(userId)) {
      this.requests.set(userId, []);
    }

    const userRequests = this.requests.get(userId);
    
    // 清理过期的请求记录
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // 检查是否超过限制
    if (validRequests.length >= this.maxRequests) {
      console.log('❌ 请求频率超过限制');
      return {
        handled: true,
        success: false,
        statusCode: 429,
        message: '请求频率过高，请稍后再试',
        retryAfter: Math.ceil(this.windowMs / 1000)
      };
    }

    // 记录当前请求
    validRequests.push(now);
    this.requests.set(userId, validRequests);

    console.log(`✅ 限流检查通过 (${validRequests.length}/${this.maxRequests})`);
    return { handled: false };
  }

  getRateLimitStats() {
    const stats = {};
    for (const [userId, requests] of this.requests.entries()) {
      const now = Date.now();
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.windowMs
      );
      stats[userId] = {
        currentRequests: validRequests.length,
        maxRequests: this.maxRequests,
        remainingRequests: this.maxRequests - validRequests.length
      };
    }
    return stats;
  }
}

// 业务处理器（最终处理器）
class BusinessHandler extends Handler {
  constructor() {
    super();
    this.data = new Map(); // 模拟数据存储
  }

  async doHandle(request) {
    console.log('🏢 执行业务逻辑处理...');

    let response;

    try {
      switch (request.method) {
        case 'GET':
          response = await this.handleGet(request);
          break;
        case 'POST':
          response = await this.handlePost(request);
          break;
        case 'PUT':
          response = await this.handlePut(request);
          break;
        case 'DELETE':
          response = await this.handleDelete(request);
          break;
        default:
          response = {
            success: false,
            statusCode: 405,
            message: '不支持的HTTP方法'
          };
      }

      // 执行缓存回调
      if (request.cacheCallback && response.success && request.method === 'GET') {
        request.cacheCallback(response.data);
      }

      // 执行日志回调
      if (request.logCallback) {
        request.logCallback(response);
      }

      console.log('✅ 业务逻辑处理完成');
      return {
        handled: true,
        ...response
      };

    } catch (error) {
      console.error('❌ 业务处理出错:', error.message);
      
      const errorResponse = {
        success: false,
        statusCode: 500,
        message: '服务器内部错误'
      };

      if (request.logCallback) {
        request.logCallback(errorResponse);
      }

      return {
        handled: true,
        ...errorResponse
      };
    }
  }

  async handleGet(request) {
    const key = request.url.split('/').pop();
    const data = this.data.get(key);

    if (!data) {
      return {
        success: false,
        statusCode: 404,
        message: '资源不存在'
      };
    }

    return {
      success: true,
      statusCode: 200,
      data
    };
  }

  async handlePost(request) {
    const id = Date.now().toString();
    const data = {
      id,
      ...request.body,
      createdAt: new Date().toISOString(),
      createdBy: request.user?.id
    };

    this.data.set(id, data);

    return {
      success: true,
      statusCode: 201,
      data
    };
  }

  async handlePut(request) {
    const key = request.url.split('/').pop();
    const existingData = this.data.get(key);

    if (!existingData) {
      return {
        success: false,
        statusCode: 404,
        message: '资源不存在'
      };
    }

    const updatedData = {
      ...existingData,
      ...request.body,
      updatedAt: new Date().toISOString(),
      updatedBy: request.user?.id
    };

    this.data.set(key, updatedData);

    return {
      success: true,
      statusCode: 200,
      data: updatedData
    };
  }

  async handleDelete(request) {
    const key = request.url.split('/').pop();
    
    if (!this.data.has(key)) {
      return {
        success: false,
        statusCode: 404,
        message: '资源不存在'
      };
    }

    this.data.delete(key);

    return {
      success: true,
      statusCode: 204,
      message: '删除成功'
    };
  }
}

// 请求处理器工厂
class RequestHandlerFactory {
  static createDefaultChain() {
    const auth = new AuthenticationHandler();
    const authz = new AuthorizationHandler(['read']);
    const cache = new CacheHandler(300);
    const logging = new LoggingHandler();
    const rateLimit = new RateLimitHandler(10, 60000);
    const business = new BusinessHandler();

    // 构建处理链
    auth.setNext(authz)
         .setNext(rateLimit)
         .setNext(cache)
         .setNext(logging)
         .setNext(business);

    return auth;
  }

  static createPublicChain() {
    const auth = new AuthenticationHandler(false); // 不需要认证
    const cache = new CacheHandler(600); // 更长的缓存时间
    const logging = new LoggingHandler();
    const rateLimit = new RateLimitHandler(50, 60000);
    const business = new BusinessHandler();

    auth.setNext(cache)
        .setNext(logging)
        .setNext(rateLimit)
        .setNext(business);

    return auth;
  }

  static createAdminChain() {
    const auth = new AuthenticationHandler();
    const authz = new AuthorizationHandler(['admin']);
    const logging = new LoggingHandler();
    const business = new BusinessHandler();

    auth.setNext(authz)
        .setNext(logging)
        .setNext(business);

    return auth;
  }
}

// 使用示例和测试
async function demonstrateChainOfResponsibility() {
  console.group('责任链模式演示');

  // 创建默认处理链
  const defaultChain = RequestHandlerFactory.createDefaultChain();

  // 测试请求1：正常认证请求
  console.log('\n=== 测试1: 正常认证请求 ===');
  const request1 = {
    method: 'GET',
    url: '/api/users/123',
    headers: {
      'authorization': 'Bearer valid-token',
      'user-agent': 'Mozilla/5.0'
    },
    ip: '192.168.1.100'
  };

  const response1 = await defaultChain.handle(request1);
  console.log('响应:', response1);

  // 测试请求2：未认证请求
  console.log('\n=== 测试2: 未认证请求 ===');
  const request2 = {
    method: 'GET',
    url: '/api/users/456',
    headers: {
      'user-agent': 'Mozilla/5.0'
    },
    ip: '192.168.1.101'
  };

  const response2 = await defaultChain.handle(request2);
  console.log('响应:', response2);

  // 测试请求3：POST请求
  console.log('\n=== 测试3: POST请求 ===');
  const request3 = {
    method: 'POST',
    url: '/api/users',
    headers: {
      'authorization': 'Bearer valid-token',
      'content-type': 'application/json'
    },
    body: {
      name: '李四',
      email: 'lisi@example.com'
    },
    ip: '192.168.1.102'
  };

  const response3 = await defaultChain.handle(request3);
  console.log('响应:', response3);

  // 测试公共API链
  console.log('\n=== 测试4: 公共API请求 ===');
  const publicChain = RequestHandlerFactory.createPublicChain();
  const publicRequest = {
    method: 'GET',
    url: '/api/public/info',
    headers: {
      'user-agent': 'Mozilla/5.0'
    },
    ip: '192.168.1.103'
  };

  const publicResponse = await publicChain.handle(publicRequest);
  console.log('公共API响应:', publicResponse);

  console.groupEnd();
}

// 导出
export {
  Handler,
  AuthenticationHandler,
  AuthorizationHandler,
  CacheHandler,
  LoggingHandler,
  RateLimitHandler,
  BusinessHandler,
  RequestHandlerFactory,
  demonstrateChainOfResponsibility
};

/**
 * 面试要点总结：
 * 
 * 1. 责任链模式的核心概念：
 *    - 将请求的发送者和接收者解耦
 *    - 多个对象都有机会处理请求
 *    - 沿着链传递请求，直到有对象处理它
 * 
 * 2. 关键组成部分：
 *    - 抽象处理者：定义处理请求的接口
 *    - 具体处理者：实现处理请求的具体逻辑
 *    - 客户端：创建和配置责任链
 * 
 * 3. 适用场景：
 *    - 多个对象可以处理同一请求
 *    - 不想让客户端知道具体哪个对象处理请求
 *    - 想要动态指定能处理请求的对象集合
 *    - 中间件模式、过滤器链、事件处理等
 * 
 * 4. 优缺点：
 *    优点：
 *    - 降低耦合度
 *    - 增强灵活性
 *    - 符合开闭原则
 *    - 责任分离
 *    
 *    缺点：
 *    - 性能受到影响（需要遍历链）
 *    - 调试困难
 *    - 可能出现请求无法被处理的情况
 * 
 * 5. 与其他模式的关系：
 *    - vs 装饰器模式：责任链关注请求传递，装饰器关注功能增强
 *    - vs 组合模式：责任链是线性结构，组合模式是树形结构
 *    - 常与命令模式、策略模式结合使用
 */ 