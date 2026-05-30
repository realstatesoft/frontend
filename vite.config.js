import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Keep singleton dependencies deduped across lazy chunks.
  resolve: {
    dedupe: ['three', 'react', 'react-dom'],
  },

  server: {
    host: true,
    allowedHosts: mode === 'development' ? true : ['openroof.duckdns.org'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
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
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/');
          if (!normalizedId.includes('node_modules')) return;

          // Core React — always loaded
          if (/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(normalizedId)) return 'vendor-react';

          // UI Framework
          if (/bootstrap|react-bootstrap/.test(normalizedId)) return 'vendor-bootstrap';

          // Animations (heavy, route-level lazy chunks)
          if (normalizedId.includes('framer-motion')) return 'vendor-animation';

          // Maps (heavy, route-level lazy chunks)
          if (/leaflet|react-leaflet/.test(normalizedId)) return 'vendor-maps';

          // Charts (heavy, route-level lazy chunks)
          if (/recharts|d3-/.test(normalizedId)) return 'vendor-charts';

          // 360 / 3D viewers (heavy, lazy loaded)
          if (normalizedId.includes('@photo-sphere-viewer')) return 'vendor-photo-sphere';
          if (normalizedId.includes('@google/model-viewer')) return 'vendor-model-viewer';
          if (/node_modules\/three\//.test(normalizedId)) return 'vendor-three';

          // Rich text editor (lazy loaded)
          if (/tiptap|prosemirror|@tiptap/.test(normalizedId)) return 'vendor-editor';

          // Calendar (lazy loaded)
          if (normalizedId.includes('fullcalendar')) return 'vendor-calendar';

          // Icons
          if (/react-icons|react-bootstrap-icons|bootstrap-icons/.test(normalizedId)) return 'vendor-icons';

          // State & Data fetching
          if (/tanstack|zustand|axios|zod/.test(normalizedId)) return 'vendor-data';

          // i18n — va junto con react porque react-i18next necesita React en el mismo chunk
          if (/i18next|react-i18next/.test(normalizedId)) return 'vendor-react';

          // Swiper
          if (normalizedId.includes('swiper')) return 'vendor-swiper';
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
