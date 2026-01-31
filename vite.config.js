import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Configuración del Proxy para Desarrollo
    proxy: {
      // Captura cualquier petición que empiece por '/api'
      '/api': {
        target: 'http://localhost:3000', // Redirige a tu servidor backend (server.js)
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Aseguramos que la compilación vaya a 'dist'
    // (Esto debe coincidir con lo que sirve tu server.js en producción)
    outDir: 'dist',
    emptyOutDir: true,
  }
});