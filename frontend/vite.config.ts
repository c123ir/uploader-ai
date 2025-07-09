// frontend/vite.config.ts - تنظیمات Vite برای پروژه
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Babel configuration
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ]
      }
    })
  ],
  
  // Server configuration
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections
    cors: true,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:5199',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    // HMR overlay settings
    hmr: {
      overlay: true
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Reduce bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        }
      }
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // CSS configuration
  css: {
    postcss: {
      plugins: [
        // Add PostCSS plugins if needed
      ]
    },
    devSourcemap: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react'
    ],
    exclude: [
      // Exclude any problematic dependencies
    ]
  },

  // Preview configuration (for production preview)
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  // Base URL configuration
  base: './',

  // Asset handling
  assetsInclude: [
    '**/*.woff2',
    '**/*.woff',
    '**/*.ttf',
    '**/*.otf'
  ]
})