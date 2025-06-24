/**
 * TypeScript 中的 infer 关键字
 *
 * infer 关键字用于条件类型中推断类型变量，常用于高级类型编程和类型提取。
 * 它只能在 extends 条件类型的 true 分支中使用。
 */

// 1. 基本用法：提取函数返回类型
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

function greeting(): string {
  return 'Hello, TypeScript!';
}

// 使用 MyReturnType 获取函数返回类型
type GreetingReturnType = MyReturnType<typeof greeting>; // string

// 2. 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;

type NumberArrayType = ElementType<number[]>; // number
type StringArrayType = ElementType<string[]>; // string
type MixedArrayType = ElementType<(string | number)[]>; // string | number

// 3. 提取 Promise 的值类型
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type PromiseString = UnpackPromise<Promise<string>>; // string
type NotPromise = UnpackPromise<number>; // number

// 4. 提取函数参数类型
type MyParameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

function add(a: number, b: string): void {}

type AddParams = MyParameters<typeof add>; // [number, string]

// 5. 提取构造函数参数类型
type MyConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never;

class Person {
  constructor(name: string, age: number) {}
}

type PersonConstructorParams = MyConstructorParameters<typeof Person>; // [string, number]

// 6. 提取对象属性类型
type PropertyType<T, K extends keyof T> = T extends { [P in K]: infer U }
  ? U
  : never;

interface User {
  name: string;
  age: number;
}

type UserNameType = PropertyType<User, 'name'>; // string

// 面试题1: 使用 infer 实现一个 FirstParameter 类型，提取函数的第一个参数类型
type FirstParameter<T extends (...args: any) => any> = T extends (
  first: infer F,
  ...rest: any[]
) => any
  ? F
  : never;

function updateUser(id: string, name: string, age: number): void {}

type FirstParam = FirstParameter<typeof updateUser>; // string

// 面试题2: 实现一个 LastItem 类型，提取元组类型的最后一个元素类型
type LastItem<T extends any[]> = T extends [...any[], infer L] ? L : never;

type LastOfTuple = LastItem<[string, number, boolean]>; // boolean

// 面试题3: 实现一个 Flatten 类型，展平嵌套数组类型
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

type NestedArray = [1, [2, [3, 4]], 5];
type FlattenedArray = Flatten<NestedArray>; // number

// 面试题4: 实现一个 ReplaceAll 类型，替换类型中的所有指定子类型
type ReplaceAll<T, From, To> = T extends From
  ? To
  : T extends object
    ? { [K in keyof T]: ReplaceAll<T[K], From, To> }
    : T extends any[]
      ? { [K in keyof T]: ReplaceAll<T[K], From, To> }
      : T;

type ReplacedType = ReplaceAll<{ a: number; b: { c: number } }, number, string>;
// { a: string, b: { c: string } }

// 面试题5: 实现一个 UnwrapPromiseDeep 类型，递归解包嵌套的 Promise 类型
type UnwrapPromiseDeep<T> =
  T extends Promise<infer U> ? UnwrapPromiseDeep<U> : T;

type DeepPromise = Promise<Promise<Promise<string>>>;
type UnwrappedPromise = UnwrapPromiseDeep<DeepPromise>; // string

// 面试题6: 实现一个 FunctionType 类型，提取函数的完整类型信息
type FunctionType<T> = T extends (...args: infer A) => infer R
  ? { args: A; returnType: R }
  : never;

function multiply(a: number, b: number): number {
  return a * b;
}

type MultiplyFunction = FunctionType<typeof multiply>;
// { args: [number, number], returnType: number }

// 面试题7: 实现 GetRequiredProps 类型，提取对象中所有必需属性的键
type GetRequiredProps<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
}

type RequiredProductProps = GetRequiredProps<Product>; // "id" | "name"
