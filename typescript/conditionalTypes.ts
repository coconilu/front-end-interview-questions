/**
 * TypeScript 条件类型面试题
 * 
 * 条件类型是TypeScript中强大的类型系统特性，允许根据条件表达式选择不同的类型
 */

// 1. 基本条件类型
type IsString<T> = T extends string ? true : false;

// 使用示例
type A = IsString<string>;  // true
type B = IsString<number>;  // false

// 2. 分配条件类型（Distributive Conditional Types）
type ToArray<T> = T extends any ? T[] : never;

// 使用示例
type C = ToArray<string | number>;  // string[] | number[]

// 3. 条件类型与映射类型结合
type NonNullableProperties<T> = {
  [K in keyof T]: T[K] extends null | undefined ? never : K
}[keyof T];

// 使用示例
interface PersonBase {
  name: string;
  age: number;
  address: string | null;
  phone: undefined;
}

type NonNullableKeys = NonNullableProperties<PersonBase>;  // "name" | "age"

// 4. 条件类型中使用infer进行类型推断
type UnpackArray<T> = T extends Array<infer U> ? U : T;

// 使用示例
type D = UnpackArray<string[]>;  // string
type E = UnpackArray<number>;    // number

// 5. 递归条件类型
type DeepFlatten<T> = T extends Array<infer U>
  ? DeepFlatten<U>
  : T;

// 使用示例
type DeepNestedArray = [1, [2, [3, 4]], 5];
type DeepFlattenedArray = DeepFlatten<DeepNestedArray>;  // number

// 6. 条件类型与联合类型、交叉类型结合
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 使用示例
type F = MyNonNullable<string | null | undefined>;  // string

// 7. 条件类型与泛型约束结合
type ExtractPropertyType<T, P extends keyof T> = T[P];

// 使用示例
interface ProductBase {
  id: number;
  name: string;
  price: number;
}

type ProductName = ExtractPropertyType<ProductBase, 'name'>;  // string

// 面试题1: 实现一个类型，从对象类型中提取所有值为字符串的属性键
type ExtractStringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T];

// 使用示例
interface UserBase {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  meta: { [key: string]: any };
}

type StringKeys = ExtractStringKeys<UserBase>;  // "name" | "email"

// 面试题2: 实现一个类型，将联合类型转换为交叉类型
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// 使用示例
type Union = { a: string } | { b: number } | { c: boolean };
type Intersection = UnionToIntersection<Union>;  // { a: string } & { b: number } & { c: boolean }

// 面试题3: 实现一个类型，从函数类型中提取参数类型和返回类型
type FunctionInfo<T extends (...args: any[]) => any> = {
  params: Parameters<T>;
  returnType: ReturnType<T>;
};

// 使用示例
function fetchUser(id: number, includeDetails: boolean): Promise<UserBase> {
  return Promise.resolve({} as UserBase);
}

type FetchUserInfo = FunctionInfo<typeof fetchUser>;
// { params: [number, boolean], returnType: Promise<User> }

// 面试题4: 实现一个类型，将对象类型的所有属性值转换为指定类型
type TransformValues<T, U> = {
  [K in keyof T]: U;
};

// 使用示例
interface ConfigBase {
  host: string;
  port: number;
  debug: boolean;
  timeout: number;
}

type StringifiedConfig = TransformValues<ConfigBase, string>;
// { host: string; port: string; debug: string; timeout: string; }

// 面试题5: 实现一个类型，从联合类型中排除某些类型
type Without<T, U> = T extends U ? never : T;

// 使用示例
type NumericOrString = number | string | boolean | object;
type OnlyNumericOrString = Without<NumericOrString, boolean | object>;  // number | string

// 面试题6: 实现一个类型，将对象类型的键转换为驼峰命名
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K];
};

// 使用示例
interface SnakeCaseObject {
  user_id: number;
  first_name: string;
  last_name: string;
  created_at: Date;
}

type CamelCaseObject = CamelCaseKeys<SnakeCaseObject>;
// { userId: number; firstName: string; lastName: string; createdAt: Date; }

// 面试题7: 实现一个类型，检查两个类型是否相等
type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// 使用示例
type IsEqual1 = Equals<{ a: string; b: number }, { a: string; b: number }>;  // true
type IsEqual2 = Equals<{ a: string; b: number }, { b: number; a: string }>;  // true
type IsEqual3 = Equals<{ a: string; b: number }, { a: string }>;             // false 