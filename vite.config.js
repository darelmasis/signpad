import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Raíz del proyecto
  publicDir: false, // No usar publicDir para evitar conflictos
  server: {
    open: '/index.html' // Abrir el ejemplo automáticamente
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SignPad',
      formats: ['es', 'umd'],
      fileName: (format) => `signpad.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['react', 'react-dom'],
      output: {
        // Global variables to use in UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Preserve CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'signpad.css';
          }
          return assetInfo.name;
        }
      }
    },
    sourcemap: true,
    // Ensure build output is clean
    emptyOutDir: true,
    // Enable minification
    minify: true
  }
})

