import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部IP访问
    //  host: true,  // 或指定IP如'0.0.0.0'
    // port: 5173,     // 默认端口（可自定义）
    port: 8080,     // 默认端口（可自定义）

    strictPort: true,  // 避免端口冲突

    hmr: true,      // 热模块替换
    // 可选：配置代理（解决跨域问题）
    proxy: {
      '/api': {
        target: 'http://your-backend-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})