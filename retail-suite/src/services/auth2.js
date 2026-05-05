// auth.js
import config from '@/config/frappe';
import axios from 'axios';
import { ref, reactive } from 'vue'
// ==========================================
// Session State (Reactive)
// ==========================================
export const session = reactive({
  api_key: null,
  api_secret: null,
  sid: null,
  isAuthenticated: false,
  csrf_token: null,
  user: null
})

let client = null;
let isInitializing = false;
let initPromise = null;


// ==========================================
// Auth API
// ==========================================
export const authAPI = {
  async login(username, password) {
    try {
      const response = await fetch(
        `${config.FRAPPE_URL}/api/method/retail.retail.api.auth.authenticate_and_generate_api_key`,
        {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ username, password })
        }
      );

      const result = await response.json();

      if (result.message && result.message.success) {

        const creds = result.message.data;
        console.log('✅ Login successful!')
        console.log('📦 Received credentials:', creds)

        const { api_key, api_secret, sid, user } = creds;

        session.api_key = api_key;
        session.api_secret = api_secret;
        session.sid = sid;
        session.user = user;
        session.isAuthenticated = true;

        try {
          session.csrf_token = await authAPI.fetchCsrfToken(session.api_key, session.api_secret);
          console.log('🛡️ CSRF Token obtained')

        } catch (csrfError) {
          console.warn("⚠️ Could not fetch CSRF token immediately:", csrfError);
        }

        return result;
      } else {
        console.warn("❌ Login failed:", result.message);
        return null;
      }
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  },

  async fetchCsrfToken(api_key, api_secret) {
    try {

      if (!api_key || !api_secret) {
        console.warn('⚠️ Missing credentials for CSRF token fetch')
        return null
      }

      const headers = api_key && api_secret ? { 'Authorization': `token ${api_key}:${api_secret}` } : {};

      const res = await axios.get(
        `${config.FRAPPE_URL}/api/method/retail.retail.api.middleware.get_csrf_token`,
        {
          withCredentials: true,
          headers,
          timeout: 10000
        }
      );

      const csrf_token = res.data?.csrf_token || res.data?.message?.message;
      if (csrf_token) {
        console.log("🛡️ CSRF Token fetched:", csrf_token);
        return csrf_token;
      }
    } catch (error) {
      console.warn("⚠️ Could not fetch CSRF token:", error);
      return null;
    }
  },

  logout: () => {
    session = { api_key: null, api_secret: null, sid: null, csrf_token: null, isAuthenticated: false, user: null };
    client = null;
    isInitializing = false;
    initPromise = null;

  }
};

// ======================
// 2) Initialize Client
// ======================
async function initializeClient() {
  if (client) return client;
  if (isInitializing) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      const success = await authAPI.login("Administrator", "123456");
      // const success = await authAPI.login("cheif@gmail.com", "123456");
      // const success = await authAPI.login("ahmed@gmail.com", "123456");
      if (!success) throw new Error("Login failed");

      if (!config?.FRAPPE_URL) throw new Error('FRAPPE_URL is not defined');
      if (!session.api_key || !session.api_secret) throw new Error('⚠️ Not logged in yet!');

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `token ${session.api_key}:${session.api_secret}`
      };

      if (session.csrf_token) headers['X-Frappe-CSRF-Token'] = session.csrf_token;

      client = axios.create({
        baseURL: config.FRAPPE_URL,
        timeout: 30000,
        withCredentials: true,
        headers
      });

      // 🔄 CSRF Refresh Interceptor
      client.interceptors.response.use(
        res => res,
        async error => {
          const status = error.response?.status;
          const msg = error.response?.data?.message || '';

          if (status === 403 && /CSRF|Invalid Request/i.test(msg) && !error.config._retry) {
            console.log("🔄 CSRF token expired, fetching new one...");
            error.config._retry = true;
            const newToken = await authAPI.fetchCsrfToken(session.api_key, session.api_secret);
            if (newToken) {
              session.csrf_token = newToken;
              error.config.headers['X-Frappe-CSRF-Token'] = newToken;
              return client.request(error.config);
            }
          }

          if (status === 401) {
            alert("⚠️ Session expired or invalid credentials");
            authAPI.logout();
          }

          return Promise.reject(error);
        }
      );

      //   console.log('✅ API Client initialized');
      return client;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

// ======================
// 3) Singleton Proxy
// ======================
initializeClient();

// ======================
// 4) Exported Client (Direct Access)
// Singleton Proxy
// ======================
export const api = {
  get: (...args) => client ? client.get(...args) : initializeClient().then(c => c.get(...args)),
  post: (...args) => client ? client.post(...args) : initializeClient().then(c => c.post(...args)),
  put: (...args) => client ? client.put(...args) : initializeClient().then(c => c.put(...args)),
  delete: (...args) => client ? client.delete(...args) : initializeClient().then(c => c.delete(...args)),
  patch: (...args) => client ? client.patch(...args) : initializeClient().then(c => c.patch(...args)),
};
