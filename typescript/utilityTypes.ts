/**
 * TypeScript 工具类型面试题
 * 
 * TypeScript内置了许多实用的工具类型，帮助我们进行常见的类型转换
 */

// 1. Partial<T> - 将类型的所有属性变为可选
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// 使用Partial创建可选的更新对象
function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>): Todo {
  return { ...todo, ...fieldsToUpdate };
}

const todo1: Todo = {
  title: "Learn TypeScript",
  description: "Study utility types",
  completed: false
};

const updatedTodo = updateTodo(todo1, { completed: true });

// 2. Required<T> - 将类型的所有属性变为必选
interface PartialConfig {
  host?: string;
  port?: number;
  protocol?: 'http' | 'https';
}

// 使用Required确保所有配置都存在
function startServer(config: Required<PartialConfig>): void {
  console.log(`Starting server at ${config.protocol}://${config.host}:${config.port}`);
}

// 3. Readonly<T> - 将类型的所有属性变为只读
interface Point {
  x: number;
  y: number;
}

// 使用Readonly创建不可变对象
const origin: Readonly<Point> = { x: 0, y: 0 };
// origin.x = 10; // 错误：无法分配到"x"，因为它是只读属性

// 4. Record<K, T> - 创建一个键为K类型、值为T类型的对象类型
type UserRoles = Record<string, string[]>;

const userRoles: UserRoles = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read']
};

// 5. Pick<T, K> - 从类型T中选择属性K
type TodoPreview = Pick<Todo, 'title' | 'completed'>;

const todoPreview: TodoPreview = {
  title: "Clean room",
  completed: false
};

// 6. Omit<T, K> - 从类型T中排除属性K
type TodoWithoutDescription = Omit<Todo, 'description'>;

const todoWithoutDesc: TodoWithoutDescription = {
  title: "Pay bills",
  completed: true
};

// 7. Exclude<T, U> - 从T中排除可以赋值给U的类型
type T0 = Exclude<string | number | boolean, boolean>;  // string | number

// 8. Extract<T, U> - 从T中提取可以赋值给U的类型
type T1 = Extract<string | number | boolean, boolean | string>;  // string | boolean

// 9. NonNullable<T> - 从T中排除null和undefined
type T2 = NonNullable<string | number | null | undefined>;  // string | number

// 10. ReturnType<T> - 获取函数类型的返回类型
function greeting() {
  return "Hello, world!";
}

type GreetingReturn = ReturnType<typeof greeting>;  // string

// 11. InstanceType<T> - 获取构造函数类型的实例类型
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

type PersonInstance = InstanceType<typeof Person>;  // Person

// 12. Parameters<T> - 获取函数类型的参数类型元组
type GreetingParams = Parameters<(name: string, age: number) => void>;  // [string, number]

// 13. ConstructorParameters<T> - 获取构造函数类型的参数类型元组
type PersonConstructorParams = ConstructorParameters<typeof Person>;  // [string]

// 面试题1: 实现一个DeepPartial类型，使嵌套对象的所有属性都变为可选
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface NestedConfig {
  server: {
    host: string;
    port: number;
    options: {
      timeout: number;
      cache: boolean;
    }
  };
  database: {
    url: string;
    name: string;
  }
}

// 使用DeepPartial
const partialConfig: DeepPartial<NestedConfig> = {
  server: {
    host: "localhost",
    // port和options都是可选的
  }
  // database是可选的
};

// 面试题2: 实现一个PickByType类型，从对象中选择特定类型的属性
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
};

interface UserInfo {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  registeredAt: Date;
}

// 使用PickByType
type StringProps = PickByType<UserInfo, string>;  // { name: string; email: string; }
type NumberProps = PickByType<UserInfo, number>;  // { id: number; age: number; }

// 面试题3: 实现一个Mutable类型，将只读类型的所有属性变为可写
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

// 使用Mutable
type MutableUser = Mutable<ReadonlyUser>;  // { id: number; name: string; }

// 面试题4: 实现一个DeepReadonly类型，使嵌套对象的所有属性都变为只读
type MyDeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : MyDeepReadonly<T[P]>
    : T[P]
};

interface NestedObject {
  data: {
    value: number;
    items: string[];
  };
  meta: {
    timestamp: Date;
  };
}

// 使用DeepReadonly
type ReadonlyNestedObject = MyDeepReadonly<NestedObject>;
// 所有层级的属性都是只读的

// 面试题5: 实现一个FlattenObject类型，将嵌套对象扁平化
type FlattenObject<T extends object, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? FlattenObject<T[K], `${Prefix}${string & K}.`>
    : { [P in `${Prefix}${string & K}`]: T[K] }
}[keyof T];

interface NestedData {
  user: {
    info: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
  app: {
    version: string;
  };
}

// 使用FlattenObject
type FlattenedData = FlattenObject<NestedData>;
/* 
等价于:
{
  'user.info.name': string;
  'user.info.age': number;
  'user.settings.theme': string;
  'app.version': string;
}
*/ 