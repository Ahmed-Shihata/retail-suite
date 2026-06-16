import {
  IconDeviceDesktopAnalytics,
  IconCreditCard,
  IconScan,
  IconBarcode,
} from '@tabler/icons-vue'

import { createRouter, createWebHistory } from "vue-router";
import { session, checkSession } from '@/services/auth'

import POS from "@/pages/POS.vue";
import Pay from "@/pages/Pay.vue";
import NonPage from "@/pages/NonPage.vue";
import MobileScan from "@/pages/MobileScan.vue";
import ForbiddenView from "@/pages/ForbiddenView.vue";
import Invoice from "@/components/modals/invoiceTemplate.vue";
const routes = [
  {
    path: "/pos",
    name: "POS",
    component: POS,
    meta: {
      title: "POS",
      requiresAuth: false,
      layout: 'none',
      icon: IconDeviceDesktopAnalytics,
      keywords: ['pos', 'cashier', 'sale', 'point of sale', 'checkout'],
      section: "POS"
    }
  },
  {
    path: "/payment",
    name: "Payment",
    component: Pay,
    meta: {
      title: "Payment",
       layout: 'none',
      requiresAuth: true,
      icon: IconCreditCard,
      keywords: ['payment', 'pay', 'cash', 'reconcile', 'settle'],
      section: 'Payment'
    }
  },
  {
    path: "/mobile-scan",
    name: "MobileScan",
    component: MobileScan,
    meta: {
      title: "Mobile Scan",
      requiresAuth: false,
      layout: 'none',
      icon: IconScan,
      keywords: ['scan', 'barcode', 'camera', 'mobile', 'qr'],
      section: "Inventory Dashboard"
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: ForbiddenView
  },

  {
    path: '/invoices/:name',
    name: 'Invoice',
    component: Invoice,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NonPage,
    meta: { requiresAuth: false }
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let sessionChecked = false;
router.beforeEach(async (to, from, next) => {

  if (!sessionChecked) {
    await checkSession()
    sessionChecked = true
  }

  const isAuth = !!session.user
  console.log('🔀 Guard:', to.path)
  console.log('👤 session.user:', session.user)
  console.log('✅ isAuth:', isAuth)
  console.log('✅  to.meta.requiresAuth:', to.meta.requiresAuth)
  if (to.path === '/') {
    if (isAuth) {
      return next('/pos')
    } else {
      console.log('🚀 Redirecting to login page')
      const base = import.meta.env.VITE_FRAPPE_URL_LOCAL || ''
      if (import.meta.env.VITE_ENV === 'development') {
        window.location.href = `${base}/login?redirect-to=${encodeURIComponent(window.location.href)}`
      } else {
        window.location.href = `/login`
      }
      return next(false)
    }
  }

  if (to.path === '/login' && isAuth) {
    return next('/pos')
  }

  if (to.meta.requiresAuth && !isAuth) {
    console.log('🚀 Redirecting to login page')
    const base = import.meta.env.VITE_FRAPPE_URL_LOCAL || ''
    window.location.href = `${base}/login`
    return next(false)
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRoles = session.roles || []
    const hasAccess = to.meta.roles.some(role => userRoles.includes(role))
    if (!hasAccess) return next({ name: 'Forbidden' })
  }
  // 👤 session.user: null
  // ✅ isAuth: false
  // ✅  to.meta.requiresAuth: false
  if (session.user === null && !to.meta.requiresAuth && !isAuth) {
    console.log('🚀 Redirecting to login page')
    const base = import.meta.env.VITE_FRAPPE_URL_LOCAL || ''
    const env_type = import.meta.env.VITE_ENV

    // development
    if (env_type === 'development') {
      window.location.href = `${base}/login?redirect-to=${encodeURIComponent(window.location.href)}`

    }
    else {
      // production
      window.location.href = `/login`
    }


  }
  next()
})
export default router;
