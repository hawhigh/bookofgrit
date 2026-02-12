import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/create-checkout-session.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/verify-session.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/upload.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/delete-asset.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/download.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/webhook.php': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})
