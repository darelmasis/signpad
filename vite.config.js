import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic' // Usar modo clásico para evitar inyectar el runtime automático en la librería
    })
  ],
  root: '.',
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production') // Evitar fugas de process.env
  },
  server: {
    open: '/index.html'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SignPad',
      formats: ['es', 'umd'],
      fileName: (format) => `signpad.${format}.js`
    },
    rollupOptions: {
      // Externalizar dependencias para que no se incluyan en el bundle
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        'prop-types' // También externalizar prop-types para reducir tamaño
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'prop-types': 'PropTypes'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'signpad.css';
          }
          return assetInfo.name;
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true,
    minify: true
  }
})

