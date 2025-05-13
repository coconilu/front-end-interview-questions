/**
 * TypeScript 类型守卫面试题
 * 
 * 类型守卫允许你在运行时检查变量的类型，并在特定的代码块中缩小变量的类型范围
 */

// 1. 基本类型守卫：typeof
function padLeft(value: string, padding: string | number) {
  // 类型守卫：typeof
  if (typeof padding === "number") {
    // 在这个分支中，TypeScript 知道 padding 是 number 类型
    return Array(padding + 1).join(" ") + value;
  }
  // 在这个分支中，TypeScript 知道 padding 是 string 类型
  return padding + value;
}

// 2. 类型守卫：instanceof
class AnimalBase {
  move() { console.log("Moving..."); }
}

class Dog extends AnimalBase {
  bark() { console.log("Woof!"); }
}

class Cat extends AnimalBase {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: AnimalBase) {
  // 类型守卫：instanceof
  if (animal instanceof Dog) {
    // 在这个分支中，TypeScript 知道 animal 是 Dog 类型
    animal.bark();
  } else if (animal instanceof Cat) {
    // 在这个分支中，TypeScript 知道 animal 是 Cat 类型
    animal.meow();
  } else {
    animal.move();
  }
}

// 3. 类型守卫：in 操作符
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function getSmallPet(): Fish | Bird {
  // 返回 Fish 或 Bird
  return Math.random() > 0.5 
    ? { swim: () => {}, layEggs: () => {} } 
    : { fly: () => {}, layEggs: () => {} };
}

function move(pet: Fish | Bird) {
  // 类型守卫：in 操作符
  if ("swim" in pet) {
    // 在这个分支中，TypeScript 知道 pet 是 Fish 类型
    pet.swim();
  } else {
    // 在这个分支中，TypeScript 知道 pet 是 Bird 类型
    pet.fly();
  }
}

// 4. 自定义类型守卫：使用类型谓词
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move2(pet: Fish | Bird) {
  if (isFish(pet)) {
    // 在这个分支中，TypeScript 知道 pet 是 Fish 类型
    pet.swim();
  } else {
    // 在这个分支中，TypeScript 知道 pet 是 Bird 类型
    pet.fly();
  }
}

// 5. 可辨识联合类型
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  // 使用可辨识属性 kind 作为类型守卫
  switch (shape.kind) {
    case "square":
      // 在这个分支中，TypeScript 知道 shape 是 Square 类型
      return shape.size * shape.size;
    case "rectangle":
      // 在这个分支中，TypeScript 知道 shape 是 Rectangle 类型
      return shape.width * shape.height;
    case "circle":
      // 在这个分支中，TypeScript 知道 shape 是 Circle 类型
      return Math.PI * shape.radius ** 2;
    default:
      // 穷尽检查：如果添加了新的 Shape 类型但忘记处理，这里会报错
      const _exhaustiveCheck: never = shape;
      throw new Error(`未知的形状: ${_exhaustiveCheck}`);
  }
}

// 面试题1：实现一个函数，安全地访问嵌套对象属性，避免空值错误
function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj ? obj[key] : undefined;
}

// 改进版本，支持深层嵌套属性访问
type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

function safeGetNested<T>(obj: T, path: string): any {
  return path.split('.').reduce((acc, part) => {
    return acc && typeof acc === 'object' ? acc[part] : undefined;
  }, obj as any);
}

// 面试题2：实现一个类型安全的事件发射器
type EventMap = {
  login: { user: string; time: Date };
  logout: { user: string; time: Date };
  pageView: { page: string; time: Date };
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: Partial<Record<keyof T, Array<(data: any) => void>>> = {};

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
    return this;
  }

  emit<K extends keyof T>(event: K, data: T[K]): this {
    if (!this.listeners[event]) {
      return this;
    }
    this.listeners[event]!.forEach(callback => callback(data));
    return this;
  }

  off<K extends keyof T>(event: K, callback?: (data: T[K]) => void): this {
    if (!callback) {
      delete this.listeners[event];
      return this;
    }
    
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter(cb => cb !== callback) as any;
    }
    return this;
  }
}

// 使用示例
const emitter = new TypedEventEmitter<EventMap>();
emitter.on('login', ({ user, time }) => {
  console.log(`${user} logged in at ${time}`);
});
emitter.emit('login', { user: 'john', time: new Date() });

// 面试题3：实现一个函数，确保对象拥有所有必需的属性
function ensureRequired<T, K extends keyof T>(
  obj: Partial<T>, 
  requiredKeys: K[]
): asserts obj is (Partial<T> & Required<Pick<T, K>>) {
  for (const key of requiredKeys) {
    if (obj[key] === undefined) {
      throw new Error(`缺少必需的属性: ${String(key)}`);
    }
  }
}

// 使用示例
interface Config {
  host: string;
  port: number;
  debug?: boolean;
  timeout?: number;
}

function initServer(config: Partial<Config>) {
  ensureRequired(config, ['host', 'port']);
  
  // 现在 TypeScript 知道 config.host 和 config.port 一定存在
  console.log(`Server starting at ${config.host}:${config.port}`);
  
  // 其他属性仍然是可选的
  if (config.debug) {
    console.log('Debug mode enabled');
  }
} 