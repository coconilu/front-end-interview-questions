/**
 * TypeScript 高级类型面试题
 *
 * 本文件包含TypeScript高级类型相关的面试题和实现
 */

// 1. 实现一个Readonly类型，使对象的所有属性变为只读
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  name: string;
  age: number;
}

// 测试MyReadonly
type ReadonlyUser = MyReadonly<User>;
// 等价于: { readonly name: string; readonly age: number; }

// 2. 实现一个DeepReadonly类型，递归地使对象所有层级的属性变为只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

interface NestedObject {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
      country: string;
    };
  };
}

// 测试DeepReadonly
type DeepReadonlyNested = DeepReadonly<NestedObject>;
// 所有层级的属性都变为只读

// 3. 实现一个Pick类型，从一个对象类型中选取指定属性
type MyPickType<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 测试MyPickType
type NameOnly = MyPickType<User, 'name'>;
// 等价于: { name: string; }

// 4. 实现一个Omit类型，从一个对象类型中排除指定属性
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 测试MyOmit
type WithoutAge = MyOmit<User, 'age'>;
// 等价于: { name: string; }

// 5. 实现一个Partial类型，使对象的所有属性变为可选
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 测试MyPartial
type OptionalUser = MyPartial<User>;
// 等价于: { name?: string; age?: number; }

// 6. 实现一个Required类型，使对象的所有可选属性变为必选
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

interface OptionalFields {
  name?: string;
  age?: number;
}

// 测试MyRequired
type RequiredFields = MyRequired<OptionalFields>;
// 等价于: { name: string; age: number; }

// 7. 实现一个Record类型，构造一个对象类型，属性键为K，属性值为T
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// 测试MyRecord
type StringMap = MyRecord<string, number>;
// 等价于: { [key: string]: number; }

// 8. 实现一个Exclude类型，从T中排除可以赋值给U的类型
type MyExclude<T, U> = T extends U ? never : T;

// 测试MyExclude
type T0 = MyExclude<'a' | 'b' | 'c', 'a'>;
// 等价于: 'b' | 'c'

// 9. 实现一个Extract类型，从T中提取可以赋值给U的类型
type MyExtract<T, U> = T extends U ? T : never;

// 测试MyExtract
type T1 = MyExtract<'a' | 'b' | 'c', 'a' | 'f'>;
// 等价于: 'a'

// 10. 实现一个ReturnType类型，获取函数类型的返回类型
type GetReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

function greet(): string {
  return 'Hello';
}

// 测试GetReturnType
type GreetReturn = GetReturnType<typeof greet>;
// 等价于: string

// 面试题：实现一个Merge类型，将两个类型合并，第二个类型的属性会覆盖第一个类型的同名属性
type Merge<T, U> = {
  [P in keyof T | keyof U]: P extends keyof U
    ? U[P]
    : P extends keyof T
      ? T[P]
      : never;
};

interface Person {
  name: string;
  age: number;
}

interface Employee {
  name: string;
  jobTitle: string;
  salary: number;
}

// 测试Merge
type PersonEmployee = Merge<Person, Employee>;
// 等价于: { name: string; age: number; jobTitle: string; salary: number; }
// 注意name属性使用了Employee中的定义
