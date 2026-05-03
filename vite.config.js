import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // SOLUCIÓN 1: Evitar que choquen las dos versiones de three.js
  resolve: {
    dedupe: ['three'],
  },

  server: {
    host: true,
    allowedHosts: mode === 'development' ? true : ['openroof.duckdns.org'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  preview: {
    host: true,
    allowedHosts: ['openroof.duckdns.org'],
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Core React — always loaded
          if (/react\/|react-dom\/|react-router/.test(id)) return 'vendor-react';

          // UI Framework
          if (/bootstrap|react-bootstrap/.test(id)) return 'vendor-bootstrap';

          // Animations
          if (id.includes('framer-motion')) return 'vendor-framer';

          // Maps (heavy, lazy loaded)
          if (/leaflet|react-leaflet/.test(id)) return 'vendor-leaflet';

          // Charts (heavy, lazy loaded)
          if (/recharts|d3-/.test(id)) return 'vendor-charts';

          // 360 / 3D viewers (heavy, lazy loaded)
          if (/photo-sphere|three|model-viewer/.test(id)) return 'vendor-3d';

          // Rich text editor (lazy loaded)
          if (/tiptap|prosemirror|@tiptap/.test(id)) return 'vendor-editor';

          // Calendar (lazy loaded)
          if (id.includes('fullcalendar')) return 'vendor-calendar';

          // Icons
          if (/react-icons|react-bootstrap-icons|bootstrap-icons/.test(id)) return 'vendor-icons';

          // State & Data fetching
          if (/tanstack|zustand|axios|zod/.test(id)) return 'vendor-data';

          // i18n
          if (/i18next/.test(id)) return 'vendor-i18n';

          // Swiper
          if (id.includes('swiper')) return 'vendor-swiper';

          // SOLUCIÓN 2: Eliminamos el "return 'vendor-misc';"
          // Al no forzar un archivo genérico, Rollup separa las dependencias 
          // cruzadas automáticamente y se elimina el error "Circular chunk".
        }
      }
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function'],
      },
    },
  },

  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'node_modules/',
        'src/main.jsx',
        'src/test/',
        '**/*.config.js',
        'dist/',
      ],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
      },
    },
  },
}))