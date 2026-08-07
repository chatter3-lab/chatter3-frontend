import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@react-oauth')) return 'vendor-google';
          }
          if (id.includes('/pages/')) {
            if (id.includes('Admin')) return 'admin';
            return 'landing-pages';
          }
        }
      }
    }
  }
})