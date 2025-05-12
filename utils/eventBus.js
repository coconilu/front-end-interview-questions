/**
 * 实现事件总线（EventBus）
 * 实现一个简单的事件总线，包含订阅、发布、取消订阅等功能。
 */
class EventBus {
  constructor() {
    this.events = new Map();
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return () => this.off(event, callback);
  }

  // 发布事件
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach((callback) => {
      callback.apply(this, args);
    });
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events.has(event)) return;
    if (!callback) {
      this.events.delete(event);
      return;
    }
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    if (callbacks.length === 0) {
      this.events.delete(event);
    }
  }

  // 只订阅一次
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      callback.apply(this, args);
      unsubscribe();
    });
    return unsubscribe;
  }
}
