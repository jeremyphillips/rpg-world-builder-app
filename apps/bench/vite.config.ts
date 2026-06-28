import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served under `/bench/` behind the single-origin dev proxy alongside the public
// app (`/`), dashboard (`/app`), and API (`/api`). The base also feeds the React
// Router basename so client routes resolve under `/bench`.
export default defineConfig({
  base: '/bench/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
