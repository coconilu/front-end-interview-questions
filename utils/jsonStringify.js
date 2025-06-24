/**
 * 实现 JSON.stringify
 * 手动实现简化版的JSON.stringify方法。
 * @param {any} data
 * @returns {string}
 */
function jsonStringify(data) {
  // 处理基本数据类型
  if (data === null) return 'null';
  if (data === undefined) return undefined;
  if (typeof data === 'boolean' || typeof data === 'number')
    return data.toString();
  if (typeof data === 'string') return `"${data}"`;

  // 处理数组
  if (Array.isArray(data)) {
    const elements = data.map((item) => jsonStringify(item) ?? 'null');
    return `[${elements.join(',')}]`;
  }

  // 处理对象
  if (typeof data === 'object') {
    const pairs = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = jsonStringify(data[key]);
        if (value !== undefined) {
          pairs.push(`"${key}":${value}`);
        }
      }
    }
    return `{${pairs.join(',')}}`;
  }

  // 不支持的数据类型（如函数、Symbol等）
  return undefined;
}
