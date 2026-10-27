import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env lives in the project root, shared with the backend
  const env = loadEnv(mode, '..', '')

  return {
    plugins: [react()],
    server: {
      port: Number(env.FRONTEND_PORT) || 5173,
      host: true,
      proxy: {
        // 127.0.0.1 instead of localhost: on Windows "localhost" adds ~200ms to every request
        '/api': `http://127.0.0.1:${env.BACKEND_PORT || 5000}`,
        '/uploads': `http://127.0.0.1:${env.BACKEND_PORT || 5000}`,
      },
    },
  }
})
