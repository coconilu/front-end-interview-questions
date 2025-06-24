/**
 * Vue Router 实现与应用
 *
 * 面试题：请解释Vue Router的工作原理，以及如何在Vue项目中实现路由守卫和懒加载
 */

/**
 * 1. 基本路由配置
 */

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true, // 将路由参数作为props传递给组件
  },
  {
    path: '/posts',
    name: 'Posts',
    // 嵌套路由
    children: [
      {
        path: '',
        name: 'PostList',
        component: PostList,
      },
      {
        path: ':id',
        name: 'PostDetail',
        component: PostDetail,
      },
    ],
  },
  {
    // 404页面
    path: '*',
    name: 'NotFound',
    component: NotFound,
  },
];

// 创建路由实例
const router = new VueRouter({
  mode: 'history', // 使用HTML5 History模式，去掉URL中的#
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 页面切换时滚动行为
    if (savedPosition) {
      return savedPosition; // 如果是浏览器的前进/后退按钮，恢复到之前的位置
    } else {
      return { x: 0, y: 0 }; // 否则滚动到顶部
    }
  },
});

/**
 * 2. 路由守卫 (Navigation Guards)
 */

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('全局前置守卫');
  const isAuthenticated = checkIfUserIsAuthenticated();

  // 检查用户是否需要登录
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 需要登录但用户未认证
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 存储用户想要访问的页面
      });
    } else {
      next(); // 已认证，继续导航
    }
  } else {
    next(); // 不需要认证的路由，直接通过
  }
});

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('全局解析守卫');
  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  console.log('全局后置钩子');
  // 不接受next函数，不能改变导航
  // 常用于分析、更改页面标题等
  document.title = to.meta.title || 'Vue App';
});

// 路由独享守卫
const routesWithGuard = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 检查用户是否是管理员
      if (isAdmin()) {
        next();
      } else {
        next('/forbidden');
      }
    },
  },
];

// 组件内的导航守卫
const UserComponent = {
  template: '<div>用户页面</div>',
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被确认前调用
    // 不能获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    fetchUserData(to.params.id, (user) => {
      // 通过传递回调给next来访问组件实例
      next((vm) => {
        vm.user = user;
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 例如，对于一个带有动态参数的路径 `/user/:id`，在 `/user/1` 和 `/user/2` 之间跳转的时候
    // 由于会渲染同样的UserComponent组件，因此组件实例会被复用
    // 这个钩子就会在这个情况下被调用
    this.user = null;
    fetchUserData(to.params.id, (user) => {
      this.user = user;
      next();
    });
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('你有未保存的更改，确定要离开吗？');
      if (answer) {
        next();
      } else {
        next(false); // 取消导航
      }
    } else {
      next();
    }
  },
};

/**
 * 3. 路由懒加载 (Lazy Loading Routes)
 */

// 使用动态import实现路由懒加载
const lazyRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () =>
      import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    // 路由元信息
    meta: {
      requiresAuth: true,
      title: '仪表盘',
    },
  },
];

// 按模块组织的懒加载
const groupedLazyRoutes = [
  {
    path: '/admin',
    component: () => import('../views/admin/Layout.vue'),
    children: [
      {
        path: 'users',
        component: () => import('../views/admin/Users.vue'),
      },
      {
        path: 'settings',
        component: () => import('../views/admin/Settings.vue'),
      },
    ],
  },
];

/**
 * 4. 路由模式
 */

// Hash模式路由 (默认)
const hashRouter = new VueRouter({
  mode: 'hash', // 使用URL hash值来作路由
  routes: [
    /* ... */
  ],
});
// 示例URL: http://example.com/#/about

// History模式路由
const historyRouter = new VueRouter({
  mode: 'history', // 使用HTML5 History API
  routes: [
    /* ... */
  ],
});
// 示例URL: http://example.com/about
// 注意: 需要服务器配置支持，否则刷新页面会404

/**
 * 5. 编程式导航
 */

// 导航到指定路由
function navigateToUser(userId) {
  router.push({ name: 'User', params: { id: userId } });
  // 或者
  // router.push(`/user/${userId}`);
}

// 替换当前路由
function replaceRoute() {
  router.replace({ path: '/new-page' });
}

// 前进/后退
function navigateBack() {
  router.go(-1); // 后退一步
}

function navigateForward() {
  router.go(1); // 前进一步
}

/**
 * 6. 路由数据获取
 */

// 导航完成后获取数据
const AfterNavigationComponent = {
  template: '<div>{{ data }}</div>',
  data() {
    return {
      loading: false,
      data: null,
      error: null,
    };
  },
  created() {
    // 组件创建后获取数据
    this.fetchData();
  },
  watch: {
    // 路由变化时重新获取数据
    $route: 'fetchData',
  },
  methods: {
    fetchData() {
      this.loading = true;
      this.error = null;

      fetchApi(this.$route.params.id)
        .then((data) => {
          this.data = data;
          this.loading = false;
        })
        .catch((err) => {
          this.error = err;
          this.loading = false;
        });
    },
  },
};

// 导航完成前获取数据
const BeforeNavigationComponent = {
  template: '<div>{{ data }}</div>',
  data() {
    return {
      data: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    fetchApi(to.params.id)
      .then((data) => {
        // 通过next回调访问组件实例
        next((vm) => {
          vm.data = data;
        });
      })
      .catch((error) => {
        next(error);
      });
  },
};

/**
 * 7. Vue Router 工作原理简述
 *
 * Vue Router 的核心工作原理:
 *
 * 1. 路由匹配:
 *    - 解析当前URL
 *    - 匹配定义的路由规则
 *    - 确定要渲染的组件
 *
 * 2. 视图更新:
 *    - 通过<router-view>组件作为占位符
 *    - 当路由变化时，更新<router-view>中渲染的组件
 *
 * 3. 路由模式:
 *    - Hash模式: 使用URL的hash部分(#)，不需要服务器配置
 *    - History模式: 使用HTML5 History API，需要服务器配置
 *
 * 4. 导航守卫:
 *    - 提供一系列钩子函数控制导航流程
 *    - 可以在全局、单个路由、组件级别定义
 *
 * 5. 路由参数:
 *    - 动态路由参数: /user/:id
 *    - 查询参数: /search?q=keyword
 *    - 可通过$route.params和$route.query访问
 */
