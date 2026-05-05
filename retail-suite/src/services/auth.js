// auth.js
import config from '@/config/frappe';
import axios from 'axios';
import { reactive } from 'vue'
import router from '../router';

// ==========================================
// Session State (Reactive)
// ==========================================
export const session = reactive({
  user: null,
  isAuthenticated: false,
  full_name: null,
  email: null,
  roles: []
})

let client = null;
let isInitializing = false;
let initPromise = null;

// ==========================================
// Auth API - متبع Frappe pattern
// ==========================================
export const authAPI = {
  async login(username, password) {
    try {
      console.log(`🔐 Attempting login to ${config.FRAPPE_URL}/api/method/login`);
      console.log(`📝 Username: ${username}`);

      const response = await fetch(
        `${config.FRAPPE_URL}/api/method/login`,
        {
          method: "POST",
          credentials: 'include',
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            usr: username,
            pwd: password
          })
        }
      );

      console.log(`📊 Response status: ${response.status} ${response.statusText}`);

      const result = await response.json();
      console.log('📦 Response body:', JSON.stringify(result, null, 2));

      if (response.ok) {
        console.log('✅ Login successful!');

        // Update session state
        session.user = result.message?.user || username;
        session.full_name = result.message?.full_name;
        session.email = result.message?.email;
        session.isAuthenticated = true;

        console.log('👤 User:', session.user);
        console.log('📍 SID stored in HTTP-Only cookie');

        // Return true to indicate success
        return true;
      } else {
        console.warn("❌ Login failed - Response not OK");
        console.warn("Status:", response.status);
        console.warn("Message:", result.message);
        console.warn("Full response:", result);
        session.isAuthenticated = false;
        return false;
      }
    } catch (err) {
      console.error("❌ Login error (exception):", err);
      console.error("Error details:", err.message);
      session.isAuthenticated = false;
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(`${config.FRAPPE_URL}/api/method/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      session.user = null;
      session.email = null;
      session.full_name = null;
      session.isAuthenticated = false;
      client = null;
      isInitializing = false;
      initPromise = null;
      console.log("✅ Logged out successfully");
      router.push({ name: 'Login' });
    }
  }
};

// ==========================================
// Initialize API Client
// ==========================================
export async function initializeClient({ allowGuest = false } = {}) {
  if (client) return client;
  if (isInitializing) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {

      if (!config?.FRAPPE_URL) {
        throw new Error('FRAPPE_URL not defined in config');
      }

       // ❗ AUTH GUARD (modified)
      if (!session.isAuthenticated && !allowGuest) {
        throw new Error('Session not authenticated after login');
      }

      // Create axios client with credentials
      client = axios.create({
        baseURL: config.FRAPPE_URL,
        timeout: 30000,
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Request interceptor for CSRF token
      client.interceptors.request.use(config => {
        if (window.frappe?.csrf_token) {
          config.headers['X-Frappe-CSRF-Token'] = window.frappe.csrf_token;
        }
        return config;
      }, error => Promise.reject(error));

      // Response interceptor for error handling
      client.interceptors.response.use(
        res => res,
        async error => {
          const status = error.response?.status;
          const msg = error.response?.data?.message || '';

          // 🔁 CSRF handling
          if (status === 403 && /CSRF|Invalid Request/i.test(msg)) {
            console.log("🔄 CSRF error - refreshing page");
            window.location.reload();
          }

          // 🚫 Permission denied (NOT CSRF)
          if (status === 403) {
              console.warn("🚫 Permission denied:", msg);
              router.push({
                name: 'Forbidden',
                query: { message: msg }
              });
             return Promise.reject(error);
          }
          if (status === 401) {
            console.error("❌ Unauthorized - Session expired");
            await authAPI.logout();
            window.location.href = '/app/login';
          }

          return Promise.reject(error);
        }
      );

      console.log('✅ API Client initialized successfully');
      console.log("client", client);
      return client;
    } catch (error) {
      console.error('❌ Client initialization failed:', error.message);
      isInitializing = false;
      throw error;
    }
  })();

  return initPromise;
}
// ==========================================
// Check Existing Session
// ==========================================
async function checkSession() {
  try {
    const res = await fetch(
      `${config.FRAPPE_URL}/api/method/retail.retail.api.auth.get_logged_user`,
      { credentials: 'include' }
    )

    const data = await res.json()

    if (data.message && data.message !== 'Guest') {
      session.user            = data.message
      session.isAuthenticated = true
      console.log('UID',data.message)
      // ✅ جيب الـ roles كمان
      try {
        const rolesRes = await fetch(
          `${config.FRAPPE_URL}/api/method/frappe.core.doctype.user.user.get_roles?uid=${data.message}`,
          { credentials: 'include' }
        )
        const rolesData = await rolesRes.json()
        session.roles = Array.isArray(rolesData.message)
        ? [...rolesData.message]
        : []

        console.log("session.roles",session.roles )
      } catch {
        session.roles = []
      }

      return true
    }

    session.isAuthenticated = false
    session.roles = []
    return false

  } catch (err) {
    session.isAuthenticated = false
    session.roles = []
    return false
  }
}
export { checkSession }

// Initialize on import
// initializeClient().catch(err => {
//   console.error('Failed to initialize auth client:', err.message);
//   // Set a flag that auth failed
//   session.isAuthenticated = false;
// });

// ==========================================
// Exported API Methods
// ==========================================
export const api = {
  get: (...args) => client ? client.get(...args) : initializeClient().then(c => c.get(...args)),
  post: (...args) => client ? client.post(...args) : initializeClient().then(c => c.post(...args)),
  put: (...args) => client ? client.put(...args) : initializeClient().then(c => c.put(...args)),
  delete: (...args) => client ? client.delete(...args) : initializeClient().then(c => c.delete(...args)),
  patch: (...args) => client ? client.patch(...args) : initializeClient().then(c => c.patch(...args)),
};
