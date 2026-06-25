import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

const analyze = process.env.ANALYZE === 'true'

/** Stable vendor splits for long-cache headers and clearer analyzer output. */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('@tiptap')) return 'vendor-tiptap'
  if (id.includes('@tanstack/react-table')) return 'vendor-table'
  if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query-core')) {
    return 'vendor-query'
  }
  if (id.includes('@dnd-kit')) return 'vendor-dnd'
  if (id.includes('@radix-ui')) return 'vendor-radix'
  if (id.includes('react-router')) return 'vendor-router'
  if (
    id.includes('node_modules/react-dom/') ||
    id.includes('node_modules/react/') ||
    id.includes('node_modules/scheduler/')
  ) {
    return 'vendor-react'
  }

  return undefined
}

// Served under `/app/` so it sits behind the single-origin dev proxy alongside
// the public app (`/`) and the API (`/api`). The base also feeds the React
// Router basename so client routes resolve under `/app`.
export default defineConfig({
  base: '/app/',
  plugins: [
    react(),
    tailwindcss(),
    analyze &&
      visualizer({
        filename: 'bundle-stats/stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
