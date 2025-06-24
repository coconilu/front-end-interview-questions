/**
 * TypeScript 泛型约束面试题
 *
 * 泛型约束允许你限制泛型类型参数必须满足的条件，增强类型安全性
 */

// 1. 基本泛型约束
interface HasLength {
  length: number;
}

// 约束泛型T必须有length属性
function printLength<T extends HasLength>(arg: T): number {
  return arg.length;
}

// 使用示例
printLength('Hello'); // 正确，字符串有length属性
printLength([1, 2, 3]); // 正确，数组有length属性
printLength({ length: 10 }); // 正确，对象有length属性
// printLength(123); // 错误，数字没有length属性

// 2. 使用keyof进行泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 使用示例
const person = {
  name: 'Alice',
  age: 30,
  address: 'Wonderland',
};

const name = getProperty(person, 'name'); // 正确，返回string
const age = getProperty(person, 'age'); // 正确，返回number
// const invalid = getProperty(person, "job"); // 错误，"job"不是person的属性

// 3. 泛型约束中使用类型参数
function copyFields<T extends U, U>(source: T, target: U): T {
  for (const key in source) {
    if (key in target) {
      source[key] = target[key] as any;
    }
  }
  return source;
}

// 使用示例
const sourceObj = { a: 1, b: 2, c: 3 };
const targetObj = { b: 10, c: 20, d: 30 };
const result = copyFields(sourceObj, targetObj); // { a: 1, b: 10, c: 20 }

// 4. 泛型约束与默认类型
interface DefaultGeneric<T = string> {
  value: T;
  getValue(): T;
}

class StringContainer implements DefaultGeneric {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}

class NumberContainer implements DefaultGeneric<number> {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }
}

// 5. 条件类型与泛型约束结合
type NonNullableField<T, K extends keyof T> = T[K] extends null | undefined
  ? never
  : T[K];

// 使用示例
interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  phone: string | undefined;
}

type EmailType = NonNullableField<UserProfile, 'email'>; // never，因为email可能为null
type NameType = NonNullableField<UserProfile, 'name'>; // string

// 面试题1: 实现一个函数，确保对象包含特定的属性
function ensureProperty<T, K extends string>(
  obj: T,
  propName: K,
  defaultValue: any
): T & Record<K, any> {
  if (!(propName in obj)) {
    return {
      ...obj,
      [propName]: defaultValue,
    };
  }
  return obj as T & Record<K, any>;
}

// 使用示例
const config = { debug: true };
const configWithHost = ensureProperty(config, 'host', 'localhost');
console.log(configWithHost.host); // "localhost"

// 面试题2: 实现一个类型安全的深度比较函数
function deepEquals<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;

    const valA = a[key as keyof T];
    const valB = b[key as keyof T];

    if (
      typeof valA === 'object' &&
      valA !== null &&
      typeof valB === 'object' &&
      valB !== null
    ) {
      if (!deepEquals(valA as object, valB as object)) return false;
    } else if (valA !== valB) {
      return false;
    }
  }

  return true;
}

// 使用示例
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { a: 1, b: { c: 2 } };
const obj3 = { a: 1, b: { c: 3 } };
console.log(deepEquals(obj1, obj2)); // true
console.log(deepEquals(obj1, obj3)); // false

// 面试题3: 实现一个类型安全的映射函数，将对象的所有属性值应用转换函数
function mapObject<T extends object, U>(
  obj: T,
  transformFn: <K extends keyof T>(value: T[K], key: K) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = transformFn(obj[key], key as keyof T);
    }
  }

  return result;
}

// 使用示例
const numbers = { a: 1, b: 2, c: 3 };
const doubled = mapObject(numbers, (value) => value * 2);
console.log(doubled); // { a: 2, b: 4, c: 6 }

// 面试题4: 实现一个函数，确保对象的所有属性都是只读的
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

function makeReadonly<T extends object>(obj: T): DeepReadonly<T> {
  const result = {} as DeepReadonly<T>;

  for (const key in obj) {
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = makeReadonly(value) as any;
    } else {
      result[key as keyof T] = value as any;
    }
  }

  return Object.freeze(result);
}

// 使用示例
const mutableObj = {
  name: 'John',
  settings: {
    darkMode: true,
    notifications: {
      email: true,
      sms: false,
    },
  },
};

const readonlyObj = makeReadonly(mutableObj);
// readonlyObj.name = "Jane"; // 错误，无法分配到"name"，因为它是只读属性
// readonlyObj.settings.darkMode = false; // 错误，无法分配到"darkMode"，因为它是只读属性

// 面试题5: 实现一个类型安全的过滤函数，过滤对象的属性
function filterObject<T extends object, K extends keyof T>(
  obj: T,
  predicate: (value: T[K], key: K) => boolean
): Partial<T> {
  const result = {} as Partial<T>;

  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      predicate(obj[key as keyof T] as T[K], key as K)
    ) {
      result[key as keyof T] = obj[key as keyof T];
    }
  }

  return result;
}

// 使用示例
const user = {
  id: 1,
  name: 'John',
  age: 30,
  email: 'john@example.com',
  isAdmin: false,
};

const stringFields = filterObject(user, (value) => typeof value === 'string');
console.log(stringFields); // { name: "John", email: "john@example.com" }
