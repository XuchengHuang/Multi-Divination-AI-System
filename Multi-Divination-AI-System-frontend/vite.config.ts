import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },

      // <<< 新增：开发代理，把 /api 转发到后端 8000 端口 >>>
      server: {
        proxy: {
          '/api': {
            target: 'https://divination-backend-1078607865495.us-central1.run.app',
            changeOrigin: true,
            // 如果你的后端没有 /api 前缀，才需要打开这一行重写：
            rewrite: (p) => p.replace(/^\/api/, '')
          },
        },
      },
    };
});
