/**
 * Node.js 后端开发基础
 *
 * 本文件展示了 Node.js 后端开发的核心概念和实践
 * 包括服务器创建、中间件、数据库操作、API 设计等
 */

// 1. HTTP 服务器基础
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// 基础 HTTP 服务器
class BasicHTTPServer {
  constructor(port = 3000) {
    this.port = port;
    this.routes = new Map();
    this.middlewares = [];
  }

  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // 添加路由
  addRoute(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  // GET 路由
  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  // POST 路由
  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  // PUT 路由
  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }

  // DELETE 路由
  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }

  // 处理请求
  async handleRequest(req, res) {
    try {
      // 解析 URL
      const parsedUrl = url.parse(req.url, true);
      req.pathname = parsedUrl.pathname;
      req.query = parsedUrl.query;

      // 解析请求体
      if (req.method === 'POST' || req.method === 'PUT') {
        req.body = await this.parseBody(req);
      }

      // 执行中间件
      for (const middleware of this.middlewares) {
        await middleware(req, res);
        if (res.headersSent) {
          return;
        }
      }

      // 查找路由
      const routeKey = `${req.method}:${req.pathname}`;
      const handler = this.routes.get(routeKey);

      if (handler) {
        await handler(req, res);
      } else {
        this.send404(res);
      }
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // 解析请求体
  parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'];

          if (contentType && contentType.includes('application/json')) {
            resolve(JSON.parse(body));
          } else if (
            contentType &&
            contentType.includes('application/x-www-form-urlencoded')
          ) {
            resolve(querystring.parse(body));
          } else {
            resolve(body);
          }
        } catch (error) {
          reject(error);
        }
      });

      req.on('error', reject);
    });
  }

  // 发送 404 响应
  send404(res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  // 发送错误响应
  sendError(res, error) {
    console.error('Server Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }

  // 启动服务器
  listen(callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      if (callback) callback();
    });

    return server;
  }
}

// 2. Express.js 风格的应用
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Express 应用配置
class ExpressApp {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  // 设置中间件
  setupMiddlewares() {
    // 安全中间件
    this.app.use(helmet());

    // CORS 配置
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // 压缩响应
    this.app.use(compression());

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 分钟
      max: 100, // 限制每个 IP 100 个请求
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
    });
    this.app.use('/api/', limiter);

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  // 设置路由
  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API 路由
    this.app.use('/api/users', this.createUserRoutes());
    this.app.use('/api/posts', this.createPostRoutes());
    this.app.use('/api/auth', this.createAuthRoutes());
  }

  // 用户路由
  createUserRoutes() {
    const router = express.Router();

    // 获取所有用户
    router.get('/', async (req, res) => {
      try {
        const { page = 1, limit = 10, search } = req.query;
        const users = await this.getUserService().getUsers({
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        });

        res.json({
          success: true,
          data: users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.total,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 获取单个用户
    router.get('/:id', async (req, res) => {
      try {
        const user = await this.getUserService().getUserById(req.params.id);

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        res.json({
          success: true,
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 创建用户
    router.post('/', async (req, res) => {
      try {
        const userData = req.body;

        // 验证数据
        const validation = this.validateUserData(userData);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: validation.errors,
          });
        }

        const user = await this.getUserService().createUser(userData);

        res.status(201).json({
          success: true,
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 更新用户
    router.put('/:id', async (req, res) => {
      try {
        const userId = req.params.id;
        const updateData = req.body;

        const user = await this.getUserService().updateUser(userId, updateData);

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        res.json({
          success: true,
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 删除用户
    router.delete('/:id', async (req, res) => {
      try {
        const result = await this.getUserService().deleteUser(req.params.id);

        if (!result) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        res.json({
          success: true,
          message: 'User deleted successfully',
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    return router;
  }

  // 文章路由
  createPostRoutes() {
    const router = express.Router();

    // 获取所有文章
    router.get('/', async (req, res) => {
      try {
        const { page = 1, limit = 10, category, author } = req.query;
        const posts = await this.getPostService().getPosts({
          page: parseInt(page),
          limit: parseInt(limit),
          category,
          author,
        });

        res.json({
          success: true,
          data: posts,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 创建文章
    router.post('/', async (req, res) => {
      try {
        const postData = req.body;
        const post = await this.getPostService().createPost(postData);

        res.status(201).json({
          success: true,
          data: post,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    return router;
  }

  // 认证路由
  createAuthRoutes() {
    const router = express.Router();

    // 登录
    router.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password are required',
          });
        }

        const result = await this.getAuthService().login(email, password);

        if (!result.success) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
          });
        }

        res.json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 注册
    router.post('/register', async (req, res) => {
      try {
        const userData = req.body;
        const result = await this.getAuthService().register(userData);

        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: result.error,
          });
        }

        res.status(201).json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 刷新令牌
    router.post('/refresh', async (req, res) => {
      try {
        const { refreshToken } = req.body;
        const result = await this.getAuthService().refreshToken(refreshToken);

        if (!result.success) {
          return res.status(401).json({
            success: false,
            error: 'Invalid refresh token',
          });
        }

        res.json({
          success: true,
          data: {
            token: result.token,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    return router;
  }

  // 设置错误处理
  setupErrorHandling() {
    // 404 处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
      });
    });

    // 全局错误处理
    this.app.use((error, req, res, next) => {
      console.error('Global Error Handler:', error);

      res.status(error.status || 500).json({
        success: false,
        error:
          process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      });
    });
  }

  // 验证用户数据
  validateUserData(userData) {
    const errors = [];

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 获取服务实例（依赖注入）
  getUserService() {
    return new UserService();
  }

  getPostService() {
    return new PostService();
  }

  getAuthService() {
    return new AuthService();
  }

  // 启动应用
  listen(port = 3000) {
    return this.app.listen(port, () => {
      console.log(`Express server running on port ${port}`);
    });
  }
}

// 3. 数据库操作（MongoDB 示例）
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 用户模型
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 生成 JWT 令牌
userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h',
  });
};

// 转换为 JSON 时移除敏感信息
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

// 文章模型
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['tech', 'lifestyle', 'business', 'other'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 发布时设置发布时间
postSchema.pre('save', function (next) {
  if (
    this.isModified('status') &&
    this.status === 'published' &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

// 4. 服务层
class UserService {
  async getUsers(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserById(id) {
    return User.findById(id).select('-password');
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async updateUser(id, updateData) {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async deleteUser(id) {
    return User.findByIdAndDelete(id);
  }

  async getUserByEmail(email) {
    return User.findOne({ email });
  }
}

class PostService {
  async getPosts(options = {}) {
    const { page = 1, limit = 10, category, author } = options;
    const skip = (page - 1) * limit;

    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email avatar')
        .skip(skip)
        .limit(limit)
        .sort({ publishedAt: -1 }),
      Post.countDocuments(query),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getPostById(id) {
    const post = await Post.findById(id)
      .populate('author', 'name email avatar')
      .populate('likes', 'name');

    if (post) {
      // 增加浏览量
      await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return post;
  }

  async createPost(postData) {
    const post = new Post(postData);
    await post.save();
    return post.populate('author', 'name email avatar');
  }

  async updatePost(id, updateData) {
    return Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');
  }

  async deletePost(id) {
    return Post.findByIdAndDelete(id);
  }

  async likePost(postId, userId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // 取消点赞
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      // 添加点赞
      post.likes.push(userId);
    }

    await post.save();
    return post;
  }
}

class AuthService {
  async login(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // 更新最后登录时间
      user.lastLogin = new Date();
      await user.save();

      const token = user.generateAuthToken();

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    try {
      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      const user = new User(userData);
      await user.save();

      const token = user.generateAuthToken();

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET || 'fallback-secret'
      );
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid token' };
      }

      const token = user.generateAuthToken();

      return {
        success: true,
        token,
      };
    } catch (error) {
      return { success: false, error: 'Invalid token' };
    }
  }
}

// 5. 中间件
class AuthMiddleware {
  static authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      );
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid token.',
      });
    }
  }

  static authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Access denied. User not authenticated.',
        });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.',
        });
      }

      next();
    };
  }
}

// 6. 数据库连接
class DatabaseConnection {
  static async connect() {
    try {
      const mongoUri =
        process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('Connected to MongoDB');

      // 监听连接事件
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      // 优雅关闭
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }
}

// 7. 应用启动
class Application {
  constructor() {
    this.app = null;
    this.server = null;
  }

  async initialize() {
    try {
      // 连接数据库
      await DatabaseConnection.connect();

      // 创建 Express 应用
      this.app = new ExpressApp();

      // 启动服务器
      const port = process.env.PORT || 3000;
      this.server = this.app.listen(port);

      console.log(`Application started successfully on port ${port}`);
    } catch (error) {
      console.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('Shutting down application...');

    if (this.server) {
      this.server.close();
    }

    await mongoose.connection.close();
    console.log('Application shut down complete.');
  }
}

// 导出模块
module.exports = {
  BasicHTTPServer,
  ExpressApp,
  User,
  Post,
  UserService,
  PostService,
  AuthService,
  AuthMiddleware,
  DatabaseConnection,
  Application,
};

/**
 * Node.js 后端开发最佳实践：
 *
 * 1. 项目结构：
 *    - 分层架构（路由、服务、数据访问）
 *    - 模块化设计
 *    - 配置管理
 *
 * 2. 安全性：
 *    - 输入验证和清理
 *    - 身份认证和授权
 *    - HTTPS 和安全头
 *    - 速率限制
 *
 * 3. 性能优化：
 *    - 数据库查询优化
 *    - 缓存策略
 *    - 压缩和 CDN
 *    - 负载均衡
 *
 * 4. 错误处理：
 *    - 全局错误处理
 *    - 日志记录
 *    - 监控和告警
 *
 * 5. 测试：
 *    - 单元测试
 *    - 集成测试
 *    - API 测试
 *
 * 6. 部署：
 *    - 环境配置
 *    - 容器化
 *    - CI/CD 流程
 */
