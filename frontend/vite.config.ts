import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Нужен для Docker
    port: 5173,
    watch: {
      usePolling: true, // Нужен для Windows/Docker
    },
    proxy: {
      '/api': {
        target: 'http://api:8000', // Имя сервиса Django из docker-compose
        changeOrigin: true,
        secure: false,
      },
      // Если нужно проксировать медиа файлы
      '/media': {
        target: 'http://api:8000',
        changeOrigin: true,
      }
    }
  }
})