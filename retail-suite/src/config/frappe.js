const config = {
  FRAPPE_URL: import.meta.env.VITE_FRAPPE_URL_LOCAL,
  VUE_URL: import.meta.env.VITE_VUE_URL,
  ENV: import.meta.env.VITE_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE
}
console.log('Config Loaded:', config)
export default config;
