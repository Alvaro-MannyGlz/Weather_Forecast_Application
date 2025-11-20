import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Matches any request starting with /api
      '/api': {
        target: 'http://127.0.0.1:5000', // YOUR PYTHON SERVER PORT HERE
        changeOrigin: true,
        secure: false,
        // Optional: Rewrite removes '/api' before sending to backend
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})