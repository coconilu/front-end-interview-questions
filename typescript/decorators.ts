/**
 * TypeScript 装饰器模式实现
 * 
 * 装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、访问符、属性或参数上。
 * 装饰器使用 @expression 形式，expression 求值后必须为一个函数，它会在运行时被调用。
 */

// 启用装饰器需要在 tsconfig.json 中设置:
// {
//   "compilerOptions": {
//     "target": "ES5",
//     "experimentalDecorators": true
//   }
// }

// 1. 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}

// 2. 带参数的类装饰器
function classDecorator<T extends { new(...args: any[]): {} }>(
  constructor: T
) {
  return class extends constructor {
    newProperty = "new property";
    hello = "override";
  };
}

@classDecorator
class Greeter2 {
  property = "property";
  hello: string;
  constructor(m: string) {
    this.hello = m;
  }
}

console.log(new Greeter2("world"));

// 3. 方法装饰器
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

class Greeter3 {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}

// 4. 访问器装饰器
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() { return this._x; }

  @configurable(false)
  get y() { return this._y; }
}

// 5. 属性装饰器
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey];

    // 属性getter
    const getter = function () {
      return `${formatString} ${value}`;
    };

    // 属性setter
    const setter = function (newVal: string) {
      value = newVal;
    };

    // 删除属性
    if (delete target[propertyKey]) {
      // 创建新属性
      Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}

class Greeter4 {
  @format("Hello")
  greeting: string;
}

// 6. 参数装饰器
function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata("required", target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata("required", existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  let method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    let requiredParameters: number[] = Reflect.getOwnMetadata("required", target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= args.length || args[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, args);
  };
}

// 面试题：实现一个日志装饰器，记录方法的调用参数和返回值
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with args: ${JSON.stringify(args)}`);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${propertyKey} returned: ${JSON.stringify(result)}`);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2);  // 输出日志信息

// 面试题：实现一个性能监控装饰器，记录方法执行时间
function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const finish = performance.now();
    console.log(`${propertyKey} execution time: ${finish - start} ms`);
    return result;
  };

  return descriptor;
}

class SortAlgorithms {
  @measure
  bubbleSort(arr: number[]): number[] {
    const result = [...arr];
    const len = result.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  }
}

const sorter = new SortAlgorithms();
sorter.bubbleSort([5, 3, 8, 1, 2, 7, 4, 6]);  // 输出执行时间 