/**
 * TypeScript 泛型使用示例
 * 
 * 泛型是 TypeScript 中最强大的特性之一，允许我们创建可重用的组件，
 * 这些组件可以处理多种类型而不是单一类型。
 */

// 1. 基本泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式
const num = identity<number>(42);  // 显式指定类型
const str = identity("Hello");     // 类型推断

// 2. 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

const myIdentity: GenericIdentityFn<string> = identity;

// 3. 泛型类
class GenericBox<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}

const numberBox = new GenericBox<number>(123);
const stringBox = new GenericBox("TypeScript");  // 类型推断

// 4. 泛型约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);  // 现在我们知道arg有length属性
  return arg;
}

// 有效调用
loggingIdentity("Hello");  // 字符串有length属性
loggingIdentity([1, 2, 3]);  // 数组有length属性
// loggingIdentity(3);  // 错误：数字没有length属性

// 5. 在泛型中使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 25 };
const personName = getProperty(person, "name");  // 返回string类型
const age = getProperty(person, "age");    // 返回number类型
// const gender = getProperty(person, "gender");  // 错误：person没有gender属性

// 6. 泛型工厂函数
function create<T>(c: { new(): T }): T {
  return new c();
}

class BeeKeeper {
  hasMask: boolean = true;
}

class ZooKeeper {
  nametag: string = "Zookeeper";
}

class Animal {
  numLegs: number = 4;
}

class Bee extends Animal {
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

const bee = createInstance(Bee);
const lion = createInstance(Lion);

// 面试题：实现一个泛型版本的 Pick 工具类型
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;
// 等价于: { title: string; completed: boolean; }

// 面试题：实现泛型版本的函数组合（Function Composition）
type Func<T extends any[], R> = (...args: T) => R;

function compose<R>(fn1: Func<any, R>): Func<any, R>;
function compose<T1, R>(fn1: Func<[T1], R>): Func<[T1], R>;
function compose<T1, T2, R>(
  fn1: Func<[T2], R>,
  fn2: Func<[T1], T2>
): Func<[T1], R>;
function compose<T1, T2, T3, R>(
  fn1: Func<[T3], R>,
  fn2: Func<[T2], T3>,
  fn3: Func<[T1], T2>
): Func<[T1], R>;
function compose(...fns: Function[]): Function {
  return fns.reduce(
    (prevFn, nextFn) => 
      (...args: any) => prevFn(nextFn(...args)),
    (value: any) => value
  );
}

// 使用示例
function addOne(x: number) { return x + 1; }
function multiplyByTwo(x: number) { return x * 2; }
function toString(x: number) { return x.toString(); }

const addThenMultiply = compose(multiplyByTwo, addOne);
console.log(addThenMultiply(3));  // 8

const addThenMultiplyThenToString = compose(toString, multiplyByTwo, addOne);
console.log(addThenMultiplyThenToString(3));  // "8" 