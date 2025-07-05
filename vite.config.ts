import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SDC/',
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-toastify'],
          supabase: ['@supabase/supabase-js', '@tanstack/react-query']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true, // Permite acceso desde 192.168.x.x
    open: false
  },
  preview: {
    port: 4173,
    host: true, // Permite acceso desde 192.168.x.x
    open: false
  }
})
