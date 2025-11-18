import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://quiz-app-backend-5mgt.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
