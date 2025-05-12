/**
 * HTTP缓存机制
 * 
 * 面试题：详细解释HTTP缓存机制，包括强缓存和协商缓存
 */

/**
 * HTTP缓存机制概述
 * 
 * HTTP缓存是一种提高Web性能的重要技术，通过复用之前获取的资源，可以显著减少网络延迟和流量消耗。
 * 
 * 缓存类型主要分为两种：
 * 1. 强缓存（也称为本地缓存）
 * 2. 协商缓存（也称为对比缓存）
 */

/**
 * 强缓存 (Strong Cache)
 * 
 * 特点：不需要发送请求到服务端，直接从本地获取资源
 * 状态码：200 (from disk cache) 或 200 (from memory cache)
 * 
 * 相关的HTTP头部：
 * 1. Expires (HTTP/1.0)
 *    - 指定资源的过期时间（GMT格式的绝对时间）
 *    - 缺点：依赖客户端时间，可能不准确
 * 
 * 2. Cache-Control (HTTP/1.1)
 *    - max-age: 指定资源的有效期（相对时间，单位为秒）
 *    - s-maxage: 指定共享缓存（如CDN）的有效期
 *    - public: 表示响应可以被任何缓存区缓存
 *    - private: 表示响应只能被私有缓存区缓存（默认值）
 *    - no-cache: 需要使用协商缓存验证
 *    - no-store: 不使用任何缓存
 *    - must-revalidate: 一旦资源过期，必须向服务器验证
 * 
 * 优先级：Cache-Control > Expires
 */
function demonstrateStrongCache() {
  // 服务端设置强缓存的示例代码
  function serverResponseWithStrongCache(res) {
    // 设置资源有效期为1小时
    res.setHeader('Cache-Control', 'max-age=3600');
    
    // 或者设置绝对过期时间
    const expiresDate = new Date();
    expiresDate.setTime(expiresDate.getTime() + 3600 * 1000);
    res.setHeader('Expires', expiresDate.toUTCString());
    
    // 返回资源内容
    res.send('资源内容');
  }
  
  return {
    description: '强缓存示例',
    serverCode: serverResponseWithStrongCache.toString()
  };
}

/**
 * 协商缓存 (Negotiation Cache)
 * 
 * 特点：需要发送请求到服务端，由服务端决定是否使用缓存
 * 状态码：304 Not Modified（使用缓存）或 200 OK（不使用缓存）
 * 
 * 相关的HTTP头部：
 * 1. Last-Modified / If-Modified-Since
 *    - Last-Modified: 服务端在响应头中设置资源的最后修改时间
 *    - If-Modified-Since: 客户端在请求头中携带上次收到的Last-Modified值
 *    - 缺点：时间精度只到秒，无法处理1秒内多次修改的情况
 * 
 * 2. ETag / If-None-Match
 *    - ETag: 服务端在响应头中设置资源的唯一标识（通常是内容的哈希值）
 *    - If-None-Match: 客户端在请求头中携带上次收到的ETag值
 *    - 优点：解决了Last-Modified的精度问题
 * 
 * 优先级：ETag / If-None-Match > Last-Modified / If-Modified-Since
 */
function demonstrateNegotiationCache() {
  // 服务端设置协商缓存的示例代码
  function serverResponseWithNegotiationCache(req, res) {
    // 资源的ETag（假设是内容的哈希值）
    const etag = '"a1b2c3d4e5f6"';
    
    // 资源的最后修改时间
    const lastModified = new Date().toUTCString();
    
    // 检查If-None-Match头（ETag）
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      // ETag匹配，返回304状态码
      res.status(304).end();
      return;
    }
    
    // 检查If-Modified-Since头（Last-Modified）
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= new Date(lastModified).getTime()) {
      // 资源未修改，返回304状态码
      res.status(304).end();
      return;
    }
    
    // 设置ETag和Last-Modified
    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', lastModified);
    
    // 设置Cache-Control为no-cache，表示需要使用协商缓存
    res.setHeader('Cache-Control', 'no-cache');
    
    // 返回资源内容
    res.send('资源内容');
  }
  
  return {
    description: '协商缓存示例',
    serverCode: serverResponseWithNegotiationCache.toString()
  };
}

/**
 * 缓存策略最佳实践
 * 
 * 1. HTML文件
 *    - 使用协商缓存
 *    - Cache-Control: no-cache
 *    - 确保用户始终能获取最新的HTML结构
 * 
 * 2. JavaScript和CSS文件
 *    - 使用强缓存 + 文件名哈希
 *    - Cache-Control: max-age=31536000 (1年)
 *    - 文件内容变化时修改文件名（如app.a1b2c3.js）
 * 
 * 3. 图片和其他静态资源
 *    - 使用强缓存
 *    - Cache-Control: max-age=86400 (1天) 或更长
 * 
 * 4. API响应
 *    - 根据数据更新频率决定
 *    - 频繁更新的数据：Cache-Control: no-cache
 *    - 不频繁更新的数据：Cache-Control: max-age=适当的时间
 */
function cacheBestPractices() {
  return {
    html: {
      headers: {
        'Cache-Control': 'no-cache',
        'ETag': '"hash-of-content"'
      },
      reason: '确保用户始终能获取最新的HTML结构'
    },
    js_css: {
      headers: {
        'Cache-Control': 'max-age=31536000',
      },
      fileNaming: 'app.[hash].js',
      reason: '长时间缓存，通过文件名哈希处理更新'
    },
    images: {
      headers: {
        'Cache-Control': 'max-age=86400',
      },
      reason: '图片变化不频繁，可以缓存较长时间'
    },
    api: {
      dynamic: {
        headers: {
          'Cache-Control': 'no-cache',
          'ETag': '"hash-of-content"'
        },
        reason: '频繁更新的数据使用协商缓存'
      },
      static: {
        headers: {
          'Cache-Control': 'max-age=3600',
        },
        reason: '不频繁更新的数据可以短时间缓存'
      }
    }
  };
}

/**
 * 缓存控制示例 - Express服务器
 */
function expressCacheExample() {
  /*
  const express = require('express');
  const app = express();
  
  // HTML - 使用协商缓存
  app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.send('<html>...</html>');
  });
  
  // JS/CSS - 使用强缓存（1年）
  app.use('/static', (req, res, next) => {
    // 只对带有哈希值的文件使用强缓存
    if (req.path.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'max-age=31536000');
    }
    next();
  }, express.static('public'));
  
  // API - 动态数据使用协商缓存
  app.get('/api/users', (req, res) => {
    const users = [{ id: 1, name: 'John' }];
    const etag = computeETag(users);
    
    // 检查ETag
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('ETag', etag);
    res.json(users);
  });
  
  // API - 静态数据使用短时间强缓存
  app.get('/api/constants', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=3600');
    res.json({ VERSION: '1.0.0' });
  });
  
  app.listen(3000);
  */
  
  return '以上是Express服务器中实现不同缓存策略的示例代码';
}

/**
 * 浏览器缓存位置
 * 
 * 1. Service Worker
 *    - 运行在浏览器背后的独立线程
 *    - 可以自由控制缓存哪些文件、如何匹配缓存、如何读取缓存
 *    - 支持离线访问
 * 
 * 2. Memory Cache
 *    - 内存中的缓存
 *    - 速度最快，但容量小，会随浏览器关闭而清除
 * 
 * 3. Disk Cache
 *    - 硬盘中的缓存
 *    - 速度较慢，但容量大，持久存储
 * 
 * 4. Push Cache
 *    - HTTP/2推送的缓存
 *    - 只在会话（Session）中存在，会话结束后被释放
 */

// 导出函数
module.exports = {
  demonstrateStrongCache,
  demonstrateNegotiationCache,
  cacheBestPractices,
  expressCacheExample
}; 