import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

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
