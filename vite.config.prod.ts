import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production Vite config for Vercel
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})

