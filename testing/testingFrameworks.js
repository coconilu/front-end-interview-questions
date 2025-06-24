/**
 * 前端测试框架与实践
 *
 * 本文件展示了前端测试的各种框架和最佳实践
 * 包括单元测试、集成测试、E2E 测试等
 */

// 1. Jest 单元测试

// 基础测试示例
describe('数学工具函数', () => {
  // 加法函数测试
  describe('add 函数', () => {
    test('应该正确计算两个正数的和', () => {
      const add = (a, b) => a + b;
      expect(add(2, 3)).toBe(5);
    });

    test('应该正确处理负数', () => {
      const add = (a, b) => a + b;
      expect(add(-1, 1)).toBe(0);
      expect(add(-2, -3)).toBe(-5);
    });

    test('应该正确处理小数', () => {
      const add = (a, b) => a + b;
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  // 除法函数测试
  describe('divide 函数', () => {
    const divide = (a, b) => {
      if (b === 0) {
        throw new Error('除数不能为零');
      }
      return a / b;
    };

    test('应该正确计算除法', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(9, 3)).toBe(3);
    });

    test('应该在除数为零时抛出错误', () => {
      expect(() => divide(10, 0)).toThrow('除数不能为零');
    });
  });
});

// 2. 异步函数测试
describe('异步函数测试', () => {
  // Promise 测试
  test('应该正确处理 Promise', async () => {
    const fetchUser = (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, name: `User ${id}` });
        }, 100);
      });
    };

    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: 'User 1' });
  });

  // 错误处理测试
  test('应该正确处理 Promise 错误', async () => {
    const fetchUserWithError = (id) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id < 0) {
            reject(new Error('无效的用户 ID'));
          } else {
            resolve({ id, name: `User ${id}` });
          }
        }, 100);
      });
    };

    await expect(fetchUserWithError(-1)).rejects.toThrow('无效的用户 ID');
  });

  // 超时测试
  test('应该在超时时失败', async () => {
    const slowFunction = () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('完成'), 2000);
      });
    };

    await expect(slowFunction()).resolves.toBe('完成');
  }, 3000); // 设置 3 秒超时
});

// 3. Mock 和 Spy 测试
describe('Mock 和 Spy 测试', () => {
  // 函数 Mock
  test('应该正确 Mock 函数', () => {
    const mockCallback = jest.fn();
    const forEach = (items, callback) => {
      for (let index = 0; index < items.length; index++) {
        callback(items[index]);
      }
    };

    forEach([0, 1], mockCallback);

    // 验证 Mock 函数被调用
    expect(mockCallback.mock.calls.length).toBe(2);
    expect(mockCallback.mock.calls[0][0]).toBe(0);
    expect(mockCallback.mock.calls[1][0]).toBe(1);
  });

  // 模块 Mock
  test('应该正确 Mock 模块', () => {
    // Mock axios
    jest.mock('axios');
    const axios = require('axios');
    const mockedAxios = axios;

    const fetchData = async (url) => {
      const response = await axios.get(url);
      return response.data;
    };

    // 设置 Mock 返回值
    mockedAxios.get.mockResolvedValue({
      data: { id: 1, name: 'Test User' },
    });

    return fetchData('/users/1').then((data) => {
      expect(data).toEqual({ id: 1, name: 'Test User' });
      expect(mockedAxios.get).toHaveBeenCalledWith('/users/1');
    });
  });

  // Spy 测试
  test('应该正确使用 Spy', () => {
    const mathObject = {
      multiply: (a, b) => a * b,
    };

    const multiplySpy = jest.spyOn(mathObject, 'multiply');

    const result = mathObject.multiply(3, 4);

    expect(result).toBe(12);
    expect(multiplySpy).toHaveBeenCalledWith(3, 4);
    expect(multiplySpy).toHaveBeenCalledTimes(1);

    multiplySpy.mockRestore();
  });
});

// 4. React 组件测试（使用 React Testing Library）
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 示例组件
const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = React.useState(initialValue);

  return (
    <div>
      <h1>计数器</h1>
      <p data-testid="count">当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
};

// 组件测试
describe('Counter 组件', () => {
  test('应该渲染初始计数', () => {
    render(<Counter initialValue={5} />);

    expect(screen.getByText('计数器')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('当前计数: 5');
  });

  test('应该在点击增加按钮时增加计数', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const incrementButton = screen.getByText('增加');
    await user.click(incrementButton);

    expect(screen.getByTestId('count')).toHaveTextContent('当前计数: 1');
  });

  test('应该在点击减少按钮时减少计数', async () => {
    const user = userEvent.setup();
    render(<Counter initialValue={5} />);

    const decrementButton = screen.getByText('减少');
    await user.click(decrementButton);

    expect(screen.getByTestId('count')).toHaveTextContent('当前计数: 4');
  });

  test('应该在点击重置按钮时重置计数', async () => {
    const user = userEvent.setup();
    render(<Counter initialValue={10} />);

    const resetButton = screen.getByText('重置');
    await user.click(resetButton);

    expect(screen.getByTestId('count')).toHaveTextContent('当前计数: 0');
  });
});

// 表单组件测试
const LoginForm = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">用户名:</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="password">密码:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <button type="submit">登录</button>
    </form>
  );
};

describe('LoginForm 组件', () => {
  test('应该正确处理表单输入', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<LoginForm onSubmit={mockSubmit} />);

    const usernameInput = screen.getByLabelText('用户名:');
    const passwordInput = screen.getByLabelText('密码:');
    const submitButton = screen.getByText('登录');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });
});

// 5. API 测试（使用 MSW - Mock Service Worker）
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// 设置 Mock 服务器
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ])
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ id: parseInt(id), name: `User ${id}` }));
  }),

  rest.post('/api/users', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 3, name: 'New User' }));
  })
);

// 启动和关闭服务器
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// API 服务类
class UserService {
  static async getUsers() {
    const response = await fetch('/api/users');
    return response.json();
  }

  static async getUserById(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  static async createUser(userData) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }
}

// API 测试
describe('UserService API 测试', () => {
  test('应该获取用户列表', async () => {
    const users = await UserService.getUsers();

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual({ id: 1, name: 'John Doe' });
  });

  test('应该获取单个用户', async () => {
    const user = await UserService.getUserById(1);

    expect(user).toEqual({ id: 1, name: 'User 1' });
  });

  test('应该创建新用户', async () => {
    const newUser = await UserService.createUser({ name: 'Test User' });

    expect(newUser).toEqual({ id: 3, name: 'New User' });
  });

  test('应该处理网络错误', async () => {
    // 模拟网络错误
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await expect(UserService.getUsers()).rejects.toThrow();
  });
});

// 6. 自定义 Hook 测试
import { renderHook, act } from '@testing-library/react';

// 自定义 Hook
const useCounter = (initialValue = 0) => {
  const [count, setCount] = React.useState(initialValue);

  const increment = React.useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = React.useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const reset = React.useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
};

// Hook 测试
describe('useCounter Hook', () => {
  test('应该初始化计数器', () => {
    const { result } = renderHook(() => useCounter(5));

    expect(result.current.count).toBe(5);
  });

  test('应该增加计数', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test('应该减少计数', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  test('应该重置计数', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});

// 7. E2E 测试（使用 Cypress）

// cypress/integration/app.spec.js
describe('应用 E2E 测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该显示主页', () => {
    cy.contains('欢迎来到我们的应用');
    cy.get('[data-testid="main-title"]').should('be.visible');
  });

  it('应该能够导航到不同页面', () => {
    cy.get('[data-testid="nav-about"]').click();
    cy.url().should('include', '/about');
    cy.contains('关于我们');
  });

  it('应该能够提交表单', () => {
    cy.get('[data-testid="contact-form"]').within(() => {
      cy.get('input[name="name"]').type('测试用户');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('textarea[name="message"]').type('这是一条测试消息');
      cy.get('button[type="submit"]').click();
    });

    cy.contains('消息发送成功');
  });

  it('应该能够处理用户登录', () => {
    cy.get('[data-testid="login-button"]').click();

    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.contains('欢迎回来, testuser');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('应该在移动设备上正确显示', () => {
    cy.viewport('iphone-6');

    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-nav"]').should('be.visible');
  });
});

// 8. 性能测试
describe('性能测试', () => {
  test('应该在合理时间内完成大量计算', () => {
    const start = performance.now();

    const fibonacci = (n) => {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    };

    const result = fibonacci(30);
    const end = performance.now();

    expect(result).toBe(832040);
    expect(end - start).toBeLessThan(1000); // 应该在 1 秒内完成
  });

  test('应该正确处理内存使用', () => {
    const createLargeArray = (size) => {
      return new Array(size)
        .fill(0)
        .map((_, i) => ({ id: i, data: `item-${i}` }));
    };

    const largeArray = createLargeArray(10000);

    expect(largeArray).toHaveLength(10000);
    expect(largeArray[0]).toEqual({ id: 0, data: 'item-0' });
    expect(largeArray[9999]).toEqual({ id: 9999, data: 'item-9999' });
  });
});

// 9. 测试工具函数
class TestUtils {
  // 创建 Mock 用户
  static createMockUser(overrides = {}) {
    return {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  // 创建 Mock API 响应
  static createMockApiResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    };
  }

  // 等待异步操作完成
  static async waitFor(condition, timeout = 5000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  // 模拟延迟
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 生成随机测试数据
  static generateTestData(count = 10) {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Test Item ${i + 1}`,
      value: Math.random() * 100,
      active: Math.random() > 0.5,
    }));
  }
}

// 10. 测试配置和设置

// jest.config.js
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // 转换配置
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // 忽略转换的模块
  transformIgnorePatterns: ['node_modules/(?!(some-es6-module)/)'],

  // 测试匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
};

// setupTests.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 配置 Testing Library
configure({ testIdAttribute: 'data-testid' });

// 全局 Mock
global.fetch = jest.fn();

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
});

// 导出测试工具
export { TestUtils, UserService, useCounter, Counter, LoginForm };

/**
 * 前端测试最佳实践：
 *
 * 1. 测试金字塔：
 *    - 单元测试（70%）：快速、独立、专注
 *    - 集成测试（20%）：组件交互、API 集成
 *    - E2E 测试（10%）：用户流程、关键路径
 *
 * 2. 测试原则：
 *    - AAA 模式：Arrange、Act、Assert
 *    - 测试行为而非实现
 *    - 保持测试简单和专注
 *    - 使用描述性的测试名称
 *
 * 3. Mock 策略：
 *    - Mock 外部依赖
 *    - 避免过度 Mock
 *    - 使用真实数据结构
 *
 * 4. 测试覆盖率：
 *    - 追求有意义的覆盖率
 *    - 关注边界条件
 *    - 测试错误处理
 *
 * 5. 持续集成：
 *    - 自动化测试运行
 *    - 快速反馈
 *    - 测试报告和分析
 */
