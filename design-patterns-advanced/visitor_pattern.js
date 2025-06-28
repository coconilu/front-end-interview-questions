/**
 * 访问者模式 (Visitor Pattern)
 * 经典面试题：实现一个表达式计算器，支持不同类型的操作
 * 
 * 面试考点：
 * 1. 访问者模式的基本概念和应用场景
 * 2. 双分派机制的理解
 * 3. 开闭原则的体现（添加新操作不需要修改现有类）
 * 4. AST（抽象语法树）的处理
 */

// 抽象表达式类
class Expression {
  accept(visitor) {
    throw new Error('accept method must be implemented');
  }
}

// 数字表达式
class NumberExpression extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitNumber(this);
  }
}

// 加法表达式
class AddExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitAdd(this);
  }
}

// 减法表达式
class SubtractExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitSubtract(this);
  }
}

// 乘法表达式
class MultiplyExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitMultiply(this);
  }
}

// 除法表达式
class DivideExpression extends Expression {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitDivide(this);
  }
}

// 抽象访问者
class ExpressionVisitor {
  visitNumber(expression) {
    throw new Error('visitNumber method must be implemented');
  }

  visitAdd(expression) {
    throw new Error('visitAdd method must be implemented');
  }

  visitSubtract(expression) {
    throw new Error('visitSubtract method must be implemented');
  }

  visitMultiply(expression) {
    throw new Error('visitMultiply method must be implemented');
  }

  visitDivide(expression) {
    throw new Error('visitDivide method must be implemented');
  }
}

// 计算访问者 - 计算表达式的值
class CalculatorVisitor extends ExpressionVisitor {
  visitNumber(expression) {
    return expression.value;
  }

  visitAdd(expression) {
    const leftValue = expression.left.accept(this);
    const rightValue = expression.right.accept(this);
    return leftValue + rightValue;
  }

  visitSubtract(expression) {
    const leftValue = expression.left.accept(this);
    const rightValue = expression.right.accept(this);
    return leftValue - rightValue;
  }

  visitMultiply(expression) {
    const leftValue = expression.left.accept(this);
    const rightValue = expression.right.accept(this);
    return leftValue * rightValue;
  }

  visitDivide(expression) {
    const leftValue = expression.left.accept(this);
    const rightValue = expression.right.accept(this);
    if (rightValue === 0) {
      throw new Error('Division by zero');
    }
    return leftValue / rightValue;
  }
}

// 打印访问者 - 将表达式转换为字符串
class PrintVisitor extends ExpressionVisitor {
  visitNumber(expression) {
    return expression.value.toString();
  }

  visitAdd(expression) {
    const leftStr = expression.left.accept(this);
    const rightStr = expression.right.accept(this);
    return `(${leftStr} + ${rightStr})`;
  }

  visitSubtract(expression) {
    const leftStr = expression.left.accept(this);
    const rightStr = expression.right.accept(this);
    return `(${leftStr} - ${rightStr})`;
  }

  visitMultiply(expression) {
    const leftStr = expression.left.accept(this);
    const rightStr = expression.right.accept(this);
    return `(${leftStr} * ${rightStr})`;
  }

  visitDivide(expression) {
    const leftStr = expression.left.accept(this);
    const rightStr = expression.right.accept(this);
    return `(${leftStr} / ${rightStr})`;
  }
}

// 后序遍历访问者 - 返回后序遍历结果
class PostOrderVisitor extends ExpressionVisitor {
  visitNumber(expression) {
    return [expression.value];
  }

  visitAdd(expression) {
    const leftResult = expression.left.accept(this);
    const rightResult = expression.right.accept(this);
    return [...leftResult, ...rightResult, '+'];
  }

  visitSubtract(expression) {
    const leftResult = expression.left.accept(this);
    const rightResult = expression.right.accept(this);
    return [...leftResult, ...rightResult, '-'];
  }

  visitMultiply(expression) {
    const leftResult = expression.left.accept(this);
    const rightResult = expression.right.accept(this);
    return [...leftResult, ...rightResult, '*'];
  }

  visitDivide(expression) {
    const leftResult = expression.left.accept(this);
    const rightResult = expression.right.accept(this);
    return [...leftResult, ...rightResult, '/'];
  }
}

// 验证访问者 - 检查表达式是否有效
class ValidationVisitor extends ExpressionVisitor {
  constructor() {
    super();
    this.errors = [];
  }

  visitNumber(expression) {
    if (typeof expression.value !== 'number' || isNaN(expression.value)) {
      this.errors.push(`Invalid number: ${expression.value}`);
      return false;
    }
    return true;
  }

  visitAdd(expression) {
    const leftValid = expression.left.accept(this);
    const rightValid = expression.right.accept(this);
    return leftValid && rightValid;
  }

  visitSubtract(expression) {
    const leftValid = expression.left.accept(this);
    const rightValid = expression.right.accept(this);
    return leftValid && rightValid;
  }

  visitMultiply(expression) {
    const leftValid = expression.left.accept(this);
    const rightValid = expression.right.accept(this);
    return leftValid && rightValid;
  }

  visitDivide(expression) {
    const leftValid = expression.left.accept(this);
    const rightValid = expression.right.accept(this);
    
    // 检查除零错误
    if (rightValid && expression.right instanceof NumberExpression && expression.right.value === 0) {
      this.errors.push('Division by zero detected');
      return false;
    }
    
    return leftValid && rightValid;
  }

  getErrors() {
    return this.errors;
  }

  reset() {
    this.errors = [];
  }
}

// 表达式构建器 - 辅助构建复杂表达式
class ExpressionBuilder {
  static number(value) {
    return new NumberExpression(value);
  }

  static add(left, right) {
    return new AddExpression(left, right);
  }

  static subtract(left, right) {
    return new SubtractExpression(left, right);
  }

  static multiply(left, right) {
    return new MultiplyExpression(left, right);
  }

  static divide(left, right) {
    return new DivideExpression(left, right);
  }

  // 从中缀表达式字符串构建表达式树
  static fromString(expression) {
    // 简化版本，实际应该使用完整的解析器
    const tokens = expression.replace(/\s+/g, '').split(/([+\-*/()])/);
    return this.parseExpression(tokens);
  }

  static parseExpression(tokens) {
    // 这里是一个简化的递归下降解析器
    // 实际项目中应该使用更完善的解析算法
    let index = 0;

    const parseNumber = () => {
      const token = tokens[index++];
      return new NumberExpression(parseFloat(token));
    };

    const parseFactor = () => {
      if (tokens[index] === '(') {
        index++; // skip '('
        const expr = parseExpression();
        index++; // skip ')'
        return expr;
      }
      return parseNumber();
    };

    const parseTerm = () => {
      let left = parseFactor();
      
      while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
        const operator = tokens[index++];
        const right = parseFactor();
        
        if (operator === '*') {
          left = new MultiplyExpression(left, right);
        } else {
          left = new DivideExpression(left, right);
        }
      }
      
      return left;
    };

    const parseExpression = () => {
      let left = parseTerm();
      
      while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
        const operator = tokens[index++];
        const right = parseTerm();
        
        if (operator === '+') {
          left = new AddExpression(left, right);
        } else {
          left = new SubtractExpression(left, right);
        }
      }
      
      return left;
    };

    return parseExpression();
  }
}

// 使用示例和测试
function demonstrateVisitorPattern() {
  console.group('访问者模式演示');

  // 构建表达式：(3 + 4) * (5 - 2)
  const expr = ExpressionBuilder.multiply(
    ExpressionBuilder.add(
      ExpressionBuilder.number(3),
      ExpressionBuilder.number(4)
    ),
    ExpressionBuilder.subtract(
      ExpressionBuilder.number(5),
      ExpressionBuilder.number(2)
    )
  );

  // 使用不同的访问者
  const calculator = new CalculatorVisitor();
  const printer = new PrintVisitor();
  const postOrder = new PostOrderVisitor();
  const validator = new ValidationVisitor();

  console.log('表达式:', printer.visitExpression ? printer.visitExpression(expr) : expr.accept(printer));
  console.log('计算结果:', expr.accept(calculator));
  console.log('后序遍历:', expr.accept(postOrder));
  console.log('验证结果:', expr.accept(validator));

  if (validator.getErrors().length > 0) {
    console.log('验证错误:', validator.getErrors());
  }

  // 测试除零错误
  console.log('\n=== 测试除零错误 ===');
  const divideByZero = ExpressionBuilder.divide(
    ExpressionBuilder.number(10),
    ExpressionBuilder.number(0)
  );

  validator.reset();
  const isValid = divideByZero.accept(validator);
  console.log('除零表达式验证:', isValid);
  console.log('验证错误:', validator.getErrors());

  console.groupEnd();
}

// 导出
export {
  Expression,
  NumberExpression,
  AddExpression,
  SubtractExpression,
  MultiplyExpression,
  DivideExpression,
  ExpressionVisitor,
  CalculatorVisitor,
  PrintVisitor,
  PostOrderVisitor,
  ValidationVisitor,
  ExpressionBuilder,
  demonstrateVisitorPattern
};

/**
 * 面试要点总结：
 * 
 * 1. 访问者模式的核心思想：
 *    - 将操作从对象结构中分离出来
 *    - 支持在不修改现有类的情况下添加新操作
 *    - 通过双分派机制实现类型安全的操作
 * 
 * 2. 适用场景：
 *    - 对象结构稳定，但经常需要添加新操作
 *    - 需要对对象结构中的元素进行很多不同且不相关的操作
 *    - AST处理、编译器设计、文档处理等
 * 
 * 3. 优缺点：
 *    优点：
 *    - 符合开闭原则
 *    - 将相关操作集中在访问者中
 *    - 支持累积状态
 *    
 *    缺点：
 *    - 增加新的元素类型困难
 *    - 破坏封装性
 *    - 依赖具体类而非抽象
 * 
 * 4. 与其他模式的区别：
 *    - vs 策略模式：访问者处理复合对象，策略处理单一算法
 *    - vs 命令模式：访问者关注操作，命令关注请求封装
 */ 