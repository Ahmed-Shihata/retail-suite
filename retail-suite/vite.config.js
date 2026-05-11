import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import svgLoader from 'vite-svg-loader'
// vuetify Vuetify plugin support autoImport
import vuetify from 'vite-plugin-vuetify'
import fs from 'fs'
import path from 'path'

const FRAPPE_URL = process.env.VITE_FRAPPE_URL_LOCAL || 'http://192.168.8.5:81'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    svgLoader(), // هنا بيتحوّل كل SVG لـ Vue component
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },

  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync('/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1-key.pem'),
      cert: fs.readFileSync('/home/frappe/Music/frappe-bench-v15/certs/192.168.8.5+1.pem'),
    },
    proxy: {
      '/api': {
        target: FRAPPE_URL,  // IP السيرفر
        changeOrigin: true,
        ws: true,
        secure: false,
        cookieDomainRewrite: '192.168.8.5',
      },
       '/assets': {
        target: FRAPPE_URL,
        changeOrigin: true,
      },
      '/app': {
        target: FRAPPE_URL,
        changeOrigin: true,
      },
      '/files': {
        target: FRAPPE_URL,
        changeOrigin: true,
      },
      '/socket.io': {
        // target: 'http://192.168.8.5:9010',
        target: 'http://192.168.8.5:9010',  // http مش https
        changeOrigin: true,
        secure: false,      // ← إذا كان السيرفر يستخدم شهادة SSL غير موثوقة (مثل self-signed)
        ws: true,
        rewriteWsOrigin: true,  // ←  تأكد من إعادة كتابة Origin في اتصالات WebSocket لتجنب مشاكل CORS
        ws: true,
        headers: {
        'x-frappe-site-name': 'dms.com',  // ← أضف ده
       },
      },
    }
  },
  build: {
    // outDir: 'dist',
    outDir: path.resolve(__dirname, '../retail/public/retail_suite'),
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['idb']
        }
      }
    }
  }
})
