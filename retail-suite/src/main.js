// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'
import './main.css'
import * as icons from "@/components/icons/index.js"
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// استيراد CSS الأساسي لـ Vuetify
import 'vuetify/styles'
import router from './router.js'
// (اختياري) لاستخدام أيقونات Material Design
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
// إنشاء instance من Vuetify
import { initSocket } from "./socket"
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// Pinia store
const pinia = createPinia()

// Create Vue app
const app = createApp(App)


// Use plugins
app.use(router)
app.use(pinia)
app.use(Toast)

// Use vuetify
app.use(vuetify)

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component)
})
// to reach from every Place
window.$toast = useToast()

// ─── Socket Initialization ───────────────────────────────
async function initializeSocket() {
  try {
    const siteName = import.meta.env.VITE_SITE_NAME || window.location.hostname

    if (!window.frappe) window.frappe = {}
    window.frappe.realtime = initSocket(siteName)
    window.frappe.realtime.connect()

  } catch (err) {
    console.warn("[main] socket init failed:", err)
  }
}

initializeSocket()
// ─────────────────────────────────────────────────────────

// Mount app
app.mount('#app')
