// auth.js
import { reactive, computed } from 'vue'
import { createResource, frappeRequest } from 'frappe-ui'
import router from '../router'

// ==========================================
// Session User from Cookie
// ==========================================
function sessionUser() {
  const cookies = new URLSearchParams(document.cookie.split("; ").join("&"))
  const user = cookies.get("user_id")
  return user === "Guest" ? null : user
}
// ==========================================
// Session State
// ==========================================
export const session = reactive({
  user: sessionUser(),
  isAuthenticated: computed(() => !!session.user),
  full_name: null,
  email: null,
  login: createResource({
    url: 'login',
    makeParams({ username, password }) {
      console.log("🔥 makeParams:", values)
      return { usr: username, pwd: password }
    },
    async onSuccess(data) {
      console.log("Data login: ", data)
      session.user = sessionUser()
      session.full_name = data?.full_name || null
      session.email = data?.email || null
      session.login.reset()
      router.push({ name: 'POS' })
    },
    onError(err) {
      console.error("❌ Login error:", err)
    }
  }),

  logout: createResource({
    url: 'logout',
    onSuccess() {
      session.user = null
      session.full_name = null
      session.email = null
      router.push({ name: 'Login' })
    },
    onError() {
      session.user = null
      router.push({ name: 'Login' })
    }
  }),
})

// ==========================================
// Check Existing Session
// ==========================================
export async function checkSession() {
  const user = sessionUser()
  if (!user) {
    session.user = null
    return false
  }
  session.user = user

  return true
}

// ==========================================
// API Methods
// ==========================================
// GET — There is no request body; the data must be tracked in the URL:
// api.get(..., { params }) → Query String في الـ URL

// // api.post(..., { params }) → JSON Body
// POST /api/method/my.method
// Body: { "opening_shift_name": "POS-001" }
export const api = {
  get: (url, { params } = {}) => frappeRequest({ url, params }),
  post: (url, data) => frappeRequest({ url, method: 'POST', body: data }),
  put: (url, data) => frappeRequest({ url, method: 'PUT', body: data }),
  delete: (url) => frappeRequest({ url, method: 'DELETE' }),
  patch: (url, data) => frappeRequest({ url, method: 'PATCH', body: data }),
}
