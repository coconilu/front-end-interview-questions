/**
 * 手写AJAX请求
 * 
 * 面试题：实现一个完整的AJAX请求函数，包括各种参数配置和错误处理
 */

/**
 * 基础版AJAX - 使用XMLHttpRequest实现GET请求
 * @param {string} url - 请求URL
 * @param {Function} callback - 回调函数，接收响应数据
 */
function basicAjaxGet(url, callback) {
  // 创建XMLHttpRequest对象
  const xhr = new XMLHttpRequest();
  
  // 监听状态变化
  xhr.onreadystatechange = function() {
    // readyState为4表示请求已完成
    if (xhr.readyState === 4) {
      // 状态码为200表示请求成功
      if (xhr.status === 200) {
        // 调用回调函数，传递响应数据
        callback(null, xhr.responseText);
      } else {
        // 请求失败，传递错误信息
        callback(new Error(`请求失败，状态码: ${xhr.status}`), null);
      }
    }
  };
  
  // 初始化请求
  xhr.open('GET', url, true);
  
  // 发送请求
  xhr.send();
}

/**
 * 完整版AJAX - 支持各种HTTP方法、请求头、请求体等
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.headers] - 请求头
 * @param {Object|string} [options.data] - 请求体数据
 * @param {number} [options.timeout] - 超时时间（毫秒）
 * @param {boolean} [options.async=true] - 是否异步
 * @param {Function} [options.success] - 成功回调
 * @param {Function} [options.error] - 错误回调
 * @param {Function} [options.complete] - 完成回调（无论成功或失败）
 * @param {string} [options.responseType=''] - 响应类型
 */
function ajax(options) {
  // 默认选项
  const defaults = {
    url: '',
    method: 'GET',
    headers: {},
    data: null,
    timeout: 0,
    async: true,
    success: null,
    error: null,
    complete: null,
    responseType: ''
  };
  
  // 合并选项
  options = Object.assign({}, defaults, options);
  
  // 创建XMLHttpRequest对象
  const xhr = new XMLHttpRequest();
  
  // 设置超时
  if (options.timeout > 0) {
    xhr.timeout = options.timeout;
  }
  
  // 监听状态变化
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      // 获取响应数据
      let response;
      try {
        // 尝试解析JSON
        if (options.responseType === 'json' && typeof xhr.response === 'string') {
          response = JSON.parse(xhr.response);
        } else {
          response = xhr.response;
        }
      } catch (e) {
        // 解析失败，使用原始响应
        response = xhr.response;
      }
      
      // 根据状态码处理响应
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
        // 请求成功
        if (typeof options.success === 'function') {
          options.success(response, xhr.status, xhr);
        }
      } else {
        // 请求失败
        if (typeof options.error === 'function') {
          options.error(xhr, xhr.status, xhr.statusText);
        }
      }
      
      // 完成回调
      if (typeof options.complete === 'function') {
        options.complete(xhr, xhr.status);
      }
    }
  };
  
  // 监听错误
  xhr.onerror = function() {
    if (typeof options.error === 'function') {
      options.error(xhr, xhr.status, xhr.statusText);
    }
    if (typeof options.complete === 'function') {
      options.complete(xhr, xhr.status);
    }
  };
  
  // 监听超时
  xhr.ontimeout = function() {
    if (typeof options.error === 'function') {
      options.error(xhr, 0, 'timeout');
    }
    if (typeof options.complete === 'function') {
      options.complete(xhr, 0);
    }
  };
  
  // 处理请求方法
  const method = options.method.toUpperCase();
  
  // 处理查询参数
  let url = options.url;
  
  // 对于GET请求，将data作为查询参数附加到URL
  if (method === 'GET' && options.data) {
    url += (url.includes('?') ? '&' : '?') + formatData(options.data);
  }
  
  // 初始化请求
  xhr.open(method, url, options.async);
  
  // 设置响应类型
  if (options.responseType) {
    xhr.responseType = options.responseType;
  }
  
  // 设置请求头
  for (const key in options.headers) {
    if (Object.prototype.hasOwnProperty.call(options.headers, key)) {
      xhr.setRequestHeader(key, options.headers[key]);
    }
  }
  
  // 对于POST、PUT等请求，设置Content-Type（如果未设置）
  if (method !== 'GET' && method !== 'HEAD' && !xhr.getResponseHeader('Content-Type')) {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  
  // 发送请求
  if (method === 'GET' || method === 'HEAD') {
    xhr.send();
  } else {
    // 处理请求体
    let data = options.data;
    
    // 如果data是对象且Content-Type是application/x-www-form-urlencoded，则格式化数据
    if (typeof data === 'object' && xhr.getResponseHeader('Content-Type') === 'application/x-www-form-urlencoded') {
      data = formatData(data);
    } 
    // 如果data是对象且Content-Type是application/json，则JSON序列化
    else if (typeof data === 'object' && xhr.getResponseHeader('Content-Type') === 'application/json') {
      data = JSON.stringify(data);
    }
    
    xhr.send(data);
  }
  
  // 格式化数据为查询字符串
  function formatData(data) {
    if (typeof data === 'string') {
      return data;
    }
    
    const pairs = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key] === null ? '' : data[key];
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }
    
    return pairs.join('&');
  }
  
  // 返回xhr对象，便于外部中止请求
  return xhr;
}

/**
 * Promise版AJAX - 使用Promise包装AJAX请求
 * @param {Object} options - 请求选项，与ajax函数相同
 * @returns {Promise} - 返回Promise对象
 */
function ajaxPromise(options) {
  return new Promise((resolve, reject) => {
    // 复用ajax函数，设置回调
    ajax({
      ...options,
      success: function(response, status, xhr) {
        resolve({ response, status, xhr });
      },
      error: function(xhr, status, error) {
        reject({ xhr, status, error });
      }
    });
  });
}

/**
 * 便捷方法 - GET请求
 * @param {string} url - 请求URL
 * @param {Object} [data] - 查询参数
 * @param {Object} [options] - 其他选项
 * @returns {Promise} - 返回Promise对象
 */
function get(url, data = null, options = {}) {
  return ajaxPromise({
    ...options,
    url,
    method: 'GET',
    data
  });
}

/**
 * 便捷方法 - POST请求
 * @param {string} url - 请求URL
 * @param {Object} [data] - 请求体数据
 * @param {Object} [options] - 其他选项
 * @returns {Promise} - 返回Promise对象
 */
function post(url, data = null, options = {}) {
  return ajaxPromise({
    ...options,
    url,
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

/**
 * 便捷方法 - JSON请求
 * @param {string} url - 请求URL
 * @param {Object} [data] - 请求体数据
 * @param {string} [method='GET'] - 请求方法
 * @returns {Promise} - 返回Promise对象
 */
function getJSON(url, data = null, method = 'GET') {
  return ajaxPromise({
    url,
    method,
    data,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    responseType: 'json'
  });
}

/**
 * 使用示例
 */
/*
// 基础版GET请求
basicAjaxGet('https://api.example.com/data', (err, data) => {
  if (err) {
    console.error('请求失败:', err);
    return;
  }
  console.log('请求成功:', data);
});

// 完整版AJAX请求
ajax({
  url: 'https://api.example.com/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  data: {
    name: 'John',
    age: 30
  },
  timeout: 5000,
  success: function(response) {
    console.log('创建用户成功:', response);
  },
  error: function(xhr, status, error) {
    console.error('创建用户失败:', error);
  }
});

// Promise版AJAX请求
ajaxPromise({
  url: 'https://api.example.com/posts',
  method: 'GET',
  responseType: 'json'
})
  .then(({ response }) => {
    console.log('获取文章成功:', response);
  })
  .catch(({ error }) => {
    console.error('获取文章失败:', error);
  });

// 便捷方法
get('https://api.example.com/users')
  .then(({ response }) => console.log('用户列表:', response))
  .catch(({ error }) => console.error('获取用户失败:', error));

post('https://api.example.com/users', { name: 'John', age: 30 })
  .then(({ response }) => console.log('创建用户成功:', response))
  .catch(({ error }) => console.error('创建用户失败:', error));

getJSON('https://api.example.com/data')
  .then(({ response }) => console.log('JSON数据:', response))
  .catch(({ error }) => console.error('获取JSON失败:', error));
*/

// 导出函数
module.exports = {
  basicAjaxGet,
  ajax,
  ajaxPromise,
  get,
  post,
  getJSON
}; 