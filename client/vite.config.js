// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 🛡️ Pro-Security Proxy Logic
      '/api': {
        target: 'http://localhost:3000', // Root backend URL
        changeOrigin: true,
        secure: false,
        // Rewrite can be used if you want to hide the /api prefix too
        // rewrite: (path) => path.replace(/^\/api/, ''), 
        
        // Add custom security headers
        headers: {
          'X-Proxy-Secure-Access': 'CPATRON_ADVANCED_SECURITY_KEY_2026',
        },
      },
      // Proxy for uploads if needed
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
  },
});