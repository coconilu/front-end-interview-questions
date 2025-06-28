/**
 * 设计模式进阶演示
 * 
 * 本文件演示5个经典设计模式的使用方法
 * 包括：访问者模式、模板方法模式、责任链模式、原型模式、备忘录模式
 */

// 导入所有设计模式
import { demonstrateVisitorPattern } from './visitor_pattern.js';
import { demonstrateTemplateMethod } from './template_method.js';
import { demonstrateChainOfResponsibility } from './chain_of_responsibility.js';
import { demonstratePrototypePattern } from './prototype_pattern.js';
import { demonstrateMementoPattern } from './memento_pattern.js';

/**
 * 主演示函数
 * 依次演示所有设计模式
 */
async function runAllPatternDemos() {
  console.log('🎯 开始设计模式进阶演示\n');
  console.log('本演示包含5个经典设计模式的实现和使用示例：');
  console.log('1. 访问者模式 (Visitor Pattern)');
  console.log('2. 模板方法模式 (Template Method Pattern)');
  console.log('3. 责任链模式 (Chain of Responsibility Pattern)');
  console.log('4. 原型模式 (Prototype Pattern)');
  console.log('5. 备忘录模式 (Memento Pattern)\n');

  const patterns = [
    {
      name: '访问者模式',
      description: '表达式计算器实现，支持多种操作类型',
      demo: demonstrateVisitorPattern
    },
    {
      name: '模板方法模式',
      description: '数据处理流水线，支持不同数据源和处理方式',
      demo: demonstrateTemplateMethod
    },
    {
      name: '责任链模式',
      description: 'HTTP请求处理链，支持认证、权限、缓存等中间件',
      demo: demonstrateChainOfResponsibility
    },
    {
      name: '原型模式',
      description: '可克隆图形系统，支持深拷贝和浅拷贝',
      demo: demonstratePrototypePattern
    },
    {
      name: '备忘录模式',
      description: '文本编辑器撤销重做功能，支持多级操作历史',
      demo: demonstrateMementoPattern
    }
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${i + 1}. ${pattern.name}`);
    console.log(`描述：${pattern.description}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      await pattern.demo();
    } catch (error) {
      console.error(`❌ ${pattern.name}演示出错:`, error.message);
    }
    
    // 添加分隔符
    if (i < patterns.length - 1) {
      console.log('\n' + '─'.repeat(60));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒延迟
    }
  }

  console.log('\n🎉 所有设计模式演示完成！');
  
  // 显示总结
  showPatternSummary();
}

/**
 * 显示设计模式总结
 */
function showPatternSummary() {
  console.log('\n📋 设计模式总结：');
  
  const summary = [
    {
      pattern: '访问者模式',
      category: '行为型',
      useCase: 'AST处理、编译器设计、表达式计算',
      keyFeature: '双分派机制、操作与对象分离'
    },
    {
      pattern: '模板方法模式',
      category: '行为型',
      useCase: '数据处理流水线、算法框架、工作流',
      keyFeature: '算法骨架定义、步骤个性化实现'
    },
    {
      pattern: '责任链模式',
      category: '行为型',
      useCase: '中间件系统、过滤器链、事件处理',
      keyFeature: '请求传递、职责分离、动态链构建'
    },
    {
      pattern: '原型模式',
      category: '创建型',
      useCase: '对象克隆、配置复制、性能优化',
      keyFeature: '克隆创建、深浅拷贝、原型管理'
    },
    {
      pattern: '备忘录模式',
      category: '行为型',
      useCase: '撤销重做、状态回滚、历史记录',
      keyFeature: '状态保存恢复、封装保护、历史管理'
    }
  ];

  console.table(summary);

  console.log('\n💡 设计模式选择建议：');
  console.log('• 需要对对象结构进行多种操作时 → 访问者模式');
  console.log('• 算法步骤固定但具体实现不同时 → 模板方法模式');
  console.log('• 多个对象都可以处理同一请求时 → 责任链模式');
  console.log('• 需要复制现有对象创建新实例时 → 原型模式');
  console.log('• 需要保存和恢复对象状态时 → 备忘录模式');

  console.log('\n🔗 模式组合建议：');
  console.log('• 责任链 + 命令模式 → 可撤销的请求处理');
  console.log('• 备忘录 + 命令模式 → 完整的撤销重做系统');
  console.log('• 原型 + 抽象工厂 → 灵活的对象创建');
  console.log('• 访问者 + 组合模式 → 复杂对象结构的处理');
  console.log('• 模板方法 + 策略模式 → 可配置的算法框架');
}

/**
 * 交互式选择演示
 */
function createInteractiveDemo() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🎮 交互式演示模式');
  console.log('请选择要演示的设计模式：');
  console.log('1. 访问者模式');
  console.log('2. 模板方法模式');
  console.log('3. 责任链模式');
  console.log('4. 原型模式');
  console.log('5. 备忘录模式');
  console.log('6. 运行所有演示');
  console.log('0. 退出');

  rl.question('\n请输入选项 (0-6): ', async (answer) => {
    const choice = parseInt(answer);
    
    switch (choice) {
      case 1:
        await demonstrateVisitorPattern();
        break;
      case 2:
        await demonstrateTemplateMethod();
        break;
      case 3:
        await demonstrateChainOfResponsibility();
        break;
      case 4:
        await demonstratePrototypePattern();
        break;
      case 5:
        await demonstrateMementoPattern();
        break;
      case 6:
        await runAllPatternDemos();
        break;
      case 0:
        console.log('👋 演示结束，再见！');
        rl.close();
        return;
      default:
        console.log('❌ 无效选项，请重新选择');
        break;
    }
    
    // 递归调用以继续交互
    setTimeout(() => createInteractiveDemo(), 1000);
  });
}

// 检查是否为Node.js环境
if (typeof window === 'undefined') {
  // Node.js环境
  if (process.argv.includes('--interactive')) {
    createInteractiveDemo();
  } else {
    runAllPatternDemos().catch(console.error);
  }
} else {
  // 浏览器环境
  console.log('🌐 浏览器环境检测到');
  console.log('请在控制台中调用 runAllPatternDemos() 开始演示');
  window.runAllPatternDemos = runAllPatternDemos;
}

// 导出演示函数
export {
  runAllPatternDemos,
  showPatternSummary,
  createInteractiveDemo
};

/**
 * 使用说明：
 * 
 * 1. Node.js环境：
 *    - 基本演示：node demo.js
 *    - 交互模式：node demo.js --interactive
 * 
 * 2. 浏览器环境：
 *    - 在控制台调用：runAllPatternDemos()
 * 
 * 3. 模块导入：
 *    - import { runAllPatternDemos } from './demo.js'
 * 
 * 4. 单独演示：
 *    - 直接运行各个模式的演示函数
 */ 