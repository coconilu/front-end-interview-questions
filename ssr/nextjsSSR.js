/**
 * Next.js 服务端渲染实现
 * 
 * Next.js 是一个基于 React 的全栈框架，提供了开箱即用的 SSR 支持
 * 本文件展示了 Next.js 中各种渲染模式的实现
 */

// 1. 静态生成 (Static Generation) - getStaticProps
// pages/posts/[id].js
import { GetStaticProps, GetStaticPaths } from 'next';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
}

interface PostPageProps {
  post: Post;
}

// 页面组件
function PostPage({ post }: PostPageProps) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>作者: {post.author}</p>
      <p>发布时间: {post.publishedAt}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

// 静态生成路径
export const getStaticPaths: GetStaticPaths = async () => {
  // 获取所有文章 ID
  const posts = await fetchAllPosts();
  const paths = posts.map((post) => ({
    params: { id: post.id }
  }));

  return {
    paths,
    fallback: 'blocking' // 或 true、false
  };
};

// 静态生成数据
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetchPost(params?.id as string);

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post
    },
    revalidate: 60 // ISR: 60秒后重新生成
  };
};

// 2. 服务端渲染 (Server-side Rendering) - getServerSideProps
// pages/dashboard.js
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  data: any[];
}

function Dashboard({ user, data }: DashboardProps) {
  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <div>
        {data.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // 未登录重定向
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  // 获取用户数据
  const [user, data] = await Promise.all([
    fetchUser(session.user.id),
    fetchUserData(session.user.id)
  ]);

  return {
    props: {
      user,
      data
    }
  };
};

// 3. 客户端渲染 (Client-side Rendering) - SWR
import useSWR from 'swr';
import { useState, useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function ClientSideDataPage() {
  const [mounted, setMounted] = useState(false);
  const { data, error, isLoading } = useSWR('/api/data', fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  if (error) return <div>加载失败</div>;
  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h1>客户端数据</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// 4. API 路由
// pages/api/posts/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  post?: Post;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await fetchPost(id as string);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedPost = await updatePost(id as string, req.body);
      res.status(200).json({ post: updatedPost });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// 5. 中间件
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 身份验证
  const token = request.cookies.get('token')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 地理位置重定向
  const country = request.geo?.country;
  if (country === 'CN' && !request.nextUrl.pathname.startsWith('/cn')) {
    return NextResponse.redirect(new URL('/cn' + request.nextUrl.pathname, request.url));
  }

  // 添加自定义头
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'custom-value');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 6. 自定义 App 和 Document
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'styled-components';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={{ primary: '#0070f3' }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;

// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import Document, { DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          <meta name="description" content="Next.js SSR 示例" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

// 7. 性能优化
// 图片优化
import Image from 'next/image';

function OptimizedImageComponent() {
  return (
    <div>
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={800}
        height={600}
        priority // 优先加载
        placeholder="blur" // 模糊占位符
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rq5lBEEbDvK2wjZMo7qGI8sGwdDmFvuuztVtYXMVq8bTQyKVZHGCpHcEcEVBtBBFJgAJjjKkqw7EHgg+oqCKKKACiiigD/9k="
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

// 动态导入
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 禁用 SSR
});

// 8. 数据获取工具函数
async function fetchAllPosts(): Promise<Post[]> {
  const response = await fetch(`${process.env.API_BASE_URL}/posts`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/posts/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const response = await fetch(`${process.env.API_BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update post');
  }
  
  return response.json();
}

async function fetchUser(id: string) {
  const response = await fetch(`${process.env.API_BASE_URL}/users/${id}`);
  return response.json();
}

async function fetchUserData(userId: string) {
  const response = await fetch(`${process.env.API_BASE_URL}/users/${userId}/data`);
  return response.json();
}

// 9. Next.js 配置
// next.config.js
const nextConfig = {
  // 实验性功能
  experimental: {
    appDir: true, // App Router
    serverComponentsExternalPackages: ['mongoose'],
  },
  
  // 图片配置
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 重定向
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
  
  // 重写
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
};

module.exports = nextConfig;

// 10. App Router (Next.js 13+)
// app/posts/[id]/page.tsx
import { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.id);
  
  return {
    title: post?.title || 'Post Not Found',
    description: post?.content.substring(0, 160) || '',
    openGraph: {
      title: post?.title,
      description: post?.content.substring(0, 160),
      images: [`/api/og?title=${encodeURIComponent(post?.title || '')}`],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const post = await fetchPost(params.id);
  
  if (!post) {
    return <div>Post not found</div>;
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author} on {post.publishedAt}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

export {
  PostPage,
  Dashboard,
  ClientSideDataPage,
  OptimizedImageComponent
};

/**
 * Next.js SSR 最佳实践：
 * 
 * 1. 选择合适的渲染策略：
 *    - 静态生成：适用于内容不经常变化的页面
 *    - SSR：适用于需要实时数据的页面
 *    - CSR：适用于交互性强的页面
 * 
 * 2. 性能优化：
 *    - 使用 ISR 实现增量静态再生
 *    - 合理使用动态导入
 *    - 优化图片和字体加载
 * 
 * 3. SEO 优化：
 *    - 设置合适的 meta 标签
 *    - 使用结构化数据
 *    - 优化页面加载速度
 * 
 * 4. 缓存策略：
 *    - 合理设置 revalidate 时间
 *    - 使用 CDN 缓存静态资源
 *    - 实现客户端缓存
 */