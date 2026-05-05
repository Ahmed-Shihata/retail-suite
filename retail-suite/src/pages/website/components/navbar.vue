<template>
  <nav class="navbar-root" :class="isDark ? 'theme-dark' : 'theme-light'">

    <!-- ── Promo Strip ── -->
    <div class="promo-strip">
      <span>
        <img class="promo-icon" src="@/img/van.png" />
      </span>
      <strong>توصيل مجاني على جميع الطلبات</strong>
      <span class="promo-sep">·</span>
      <span>اطلب الآن واستلم خلال ساعتين</span>
    </div>

    <!-- ── Main Bar ── -->
    <div class="main-bar" :class="{ 'main-bar--scrolled': scrolled }">
      <div class="bar-grid">

        <!-- CELL 1: Logo -->
        <router-link :to="{ name: 'Supermarket' }" class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">Hyper</span>
        </router-link>

        <!-- CELL 2: Search (hidden on mobile, shown on tablet+) -->
        <div class="search-wrap" ref="searchRef">
          <div class="search-box" :class="{ 'search-box--focused': searchFocused }">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              @input="performSearch"
              @focus="searchFocused = true"
              @blur="onSearchBlur"
              type="text"
              placeholder="ابحث عن منتج..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="search-clear">✕</button>
          </div>

          <Transition name="drop">
            <div v-if="searchResults.length > 0 && searchFocused" class="search-dropdown">
              <div
                v-for="product in searchResults"
                :key="product.item_code"
                @mousedown.prevent="selectProduct(product)"
                class="search-result-item"
              >
                <div class="result-img">
                  <img v-if="product.image" :src="frappe_url + product.image" :alt="product.item_name" />
                  <span v-else>📦</span>
                </div>
                <div class="result-info">
                  <p class="result-name">{{ product.item_name }}</p>
                  <p class="result-price">{{ product.rate }} {{ product.currency || 'EGP' }}</p>
                </div>
                <svg class="result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </Transition>
        </div>

        <!-- CELL 3: Actions -->
        <div class="actions">

          <!-- Location (lg only) -->
          <!-- <button @click="openMapModal" class="action-btn location-btn" title="موقع التوصيل">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="location-text">{{ deliveryAddress }}</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
          </button> -->

          <!-- Theme Toggle -->
          <button @click="toggleTheme"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            :title="isDark ? 'وضع النهار' : 'وضع الليل'">
              <svg v-if="isDark" class="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            <!-- <span class="toggle-track" :class="{ 'toggle-track--light': !isDark }">
              <span class="toggle-thumb" :class="{ 'toggle-thumb--light': !isDark }">
                {{ isDark ? '🌙' : '☀️' }}
              </span>
            </span> -->
          </button>

          <!-- User -->
          <div v-if="isLoggedIn" ref="profileRef" class="profile-wrap hidden sm:block">
            <button @click.stop="toggleProfileDropdown" class="action-btn profile-btn">
              <img :src="userAvatar" class="avatar" :alt="userName" />
              <span class="profile-name">{{ firstName }}</span>
              <svg class="chevron" :class="{ 'chevron--open': showProfileDropdown }" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            <Transition name="drop">
              <div v-if="showProfileDropdown" class="profile-dropdown">
                <div class="dropdown-header">
                  <img :src="userAvatar" class="dropdown-avatar" />
                  <div>
                    <p class="dropdown-name">{{ userName }}</p>
                    <p class="dropdown-email">{{ userEmail }}</p>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <router-link :to="{ name: 'CustomerOrders' }" @click="showProfileDropdown=false" class="dropdown-item">
                  <span>📦</span> طلباتي
                </router-link>
                <router-link :to="{ name: 'MyAccount' }" @click="showProfileDropdown=false" class="dropdown-item">
                  <span>👤</span> حسابي
                </router-link>
                <router-link :to="{ name: 'Loyalty' }" @click="showProfileDropdown=false" class="dropdown-item">
                  <span>⭐</span> نقاط الولاء
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click="logout" class="dropdown-item dropdown-item--danger">
                  <span>🚪</span> تسجيل الخروج
                </button>
              </div>
            </Transition>
          </div>

          <router-link v-else :to="{ name: 'Login' }" class="login-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="login-text">دخول</span>
          </router-link>

          <!-- Cart -->
          <button @click="goToCart" class="cart-btn">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <Transition name="badge-pop">
              <span v-if="cartStore.cart.length > 0" class="cart-badge">
                {{ cartStore.cart.length > 99 ? '99+' : cartStore.cart.length }}
              </span>
            </Transition>
          </button>

          <!-- Hamburger (mobile/tablet) -->
          <button @click="showSidebar = true" class="hamburger" aria-label="القائمة">
            <span></span><span></span><span></span>
          </button>
        </div>

      </div>

      <!-- Mobile Search Row (xs/sm only) -->
      <div class="mobile-search-row">
        <div class="search-box" :class="{ 'search-box--focused': searchFocused }">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            @input="performSearch"
            @focus="searchFocused = true"
            @blur="onSearchBlur"
            type="text"
            placeholder="ابحث عن منتج..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="search-clear">✕</button>
        </div>
        <Transition name="drop">
          <div v-if="searchResults.length > 0 && searchFocused" class="search-dropdown search-dropdown--mobile">
            <div
              v-for="product in searchResults"
              :key="product.item_code"
              @mousedown.prevent="selectProduct(product)"
              class="search-result-item"
            >
              <div class="result-img">
                <img v-if="product.image" :src="frappe_url + product.image" :alt="product.item_name" />
                <span v-else>📦</span>
              </div>
              <div class="result-info">
                <p class="result-name">{{ product.item_name }}</p>
                <p class="result-price">{{ product.rate }} {{ product.currency || 'EGP' }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ── Categories Bar ── -->
      <div class="cats-bar">
        <div class="cats-inner">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectCategory(cat)"
            :class="['cat-pill', selectedCategory === cat ? 'cat-pill--active' : '']"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════ MOBILE SIDEBAR ══════════ -->
    <Transition name="sidebar-fade">
      <div v-if="showSidebar" class="sidebar-overlay" @click.self="showSidebar = false">
        <Transition name="sidebar-slide">
          <div v-if="showSidebar" class="sidebar-panel">

            <div class="sidebar-header">
              <span class="logo-text">Hypermarket</span>
              <button @click="showSidebar = false" class="sidebar-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div v-if="isLoggedIn" class="sidebar-user">
              <img :src="userAvatar" class="sidebar-avatar" />
              <div>
                <p class="sidebar-username">{{ userName }}</p>
                <p class="sidebar-email">{{ userEmail }}</p>
              </div>
            </div>

            <div class="sidebar-section">
              <p class="sidebar-section-title">التصنيفات</p>
              <div class="sidebar-cats">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="selectCategory(cat); showSidebar = false"
                  :class="['sidebar-cat', selectedCategory === cat ? 'sidebar-cat--active' : '']"
                >{{ cat }}</button>
              </div>
            </div>

            <div class="sidebar-section">
              <p class="sidebar-section-title">روابط سريعة</p>
              <router-link :to="{ name: 'Supermarket' }" @click="showSidebar=false" class="sidebar-link">🏠 الرئيسية</router-link>
              <template v-if="isLoggedIn">
                <router-link :to="{ name: 'CustomerOrders' }" @click="showSidebar=false" class="sidebar-link">📦 طلباتي</router-link>
                <router-link :to="{ name: 'Loyalty' }" @click="showSidebar=false" class="sidebar-link">⭐ نقاط الولاء</router-link>
                <router-link :to="{ name: 'MyAccount' }" @click="showSidebar=false" class="sidebar-link">👤 حسابي</router-link>
                <button @click="logout" class="sidebar-link sidebar-link--danger">🚪 تسجيل الخروج</button>
              </template>
              <template v-else>
                <router-link :to="{ name: 'Login' }" @click="showSidebar=false" class="sidebar-link">🔑 تسجيل الدخول</router-link>
                <router-link :to="{ name: 'Register' }" @click="showSidebar=false" class="sidebar-link">✨ حساب جديد</router-link>
              </template>
            </div>
<!--
            <div class="sidebar-section">
              <button @click="openMapModal(); showSidebar=false" class="sidebar-location">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {{ deliveryAddress }}
              </button>
            </div> -->

          </div>
        </Transition>
      </div>
    </Transition>

  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useSettingsStore } from '@/stores/settings'
import { authAPI } from '@/services/auth'
import { getCurrentUserInfoApi } from '@/services/api.js'
import config from '@/config/frappe'

const frappe_url = config.FRAPPE_URL
const vue_url = config.VUE_URL
const emit = defineEmits(['category-changed', 'location-changed', 'product-selected', 'show-map-modal'])
const props = defineProps({
  selectedCategory: { type: String, default: 'جميع التصنيفات' },
  deliveryAddress:  { type: String, default: 'اختر موقعك' },
  categories: {
    type: Array,
    default: () => ['جميع التصنيفات', 'الأطعمة المعبأة', 'الأطعمة الطازجة', 'الفواكه والخضروات', 'المشروبات', 'الإلكترونيات', 'الهواتف', 'منتجات الأطفال']
  }
})

const router        = useRouter()
const cartStore     = useCartStore()
const productsStore = useProductsStore()
const settingsStore = useSettingsStore()

const settings    = computed(() => settingsStore.settings)
const isDark      = computed(() => settings.value?.appearance?.theme === 'dark')
const toggleTheme = () => settingsStore.updateSettings({
  appearance: { ...settings.value.appearance, theme: isDark.value ? 'light' : 'dark' }
})

const scrolled = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 10 }

const showSidebar         = ref(false)
const searchQuery         = ref('')
const searchResults       = ref([])
const searchFocused       = ref(false)
const showProfileDropdown = ref(false)
const profileRef          = ref(null)
const searchRef           = ref(null)

const userName   = ref('')
const userEmail  = ref('')
const userAvatar = ref('')
const isLoggedIn = ref(false)
const firstName  = computed(() => userName.value.split(' ')[0])

const performSearch = () => {
  if (!searchQuery.value.trim()) { searchResults.value = []; return }
  const kw = searchQuery.value.toLowerCase()
  searchResults.value = productsStore.products
    .filter(p => p.item_name?.toLowerCase().includes(kw))
    .slice(0, 7)
}
const clearSearch  = () => { searchQuery.value = ''; searchResults.value = [] }
const onSearchBlur = () => { setTimeout(() => { searchFocused.value = false }, 150) }
const selectProduct = (p) => {
  emit('product-selected', p)
  clearSearch()
  searchFocused.value = false
}

const selectCategory = (cat) => emit('category-changed', cat)
const openMapModal   = () => emit('show-map-modal')
const goToCart       = () => router.push({ name: 'Cart' })
const toggleProfileDropdown = () => { showProfileDropdown.value = !showProfileDropdown.value }
const handleClickOutside = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) showProfileDropdown.value = false
}

const logout = async () => {
  await authAPI.logout()
  isLoggedIn.value = false
  userName.value = userEmail.value = userAvatar.value = ''
  router.push('/login')
}
const loadUser = async () => {
  try {
    const u = await getCurrentUserInfoApi()
    if (u) {
      isLoggedIn.value = true
      userName.value   = u.full_name || u.user
      userEmail.value  = u.email
      userAvatar.value = u.user_image
        ? config.FRAPPE_URL + u.user_image
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name||u.user)}&background=0d9488&color=fff`
    }
  } catch { isLoggedIn.value = false }
}

onMounted(async () => {
  await loadUser()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/*
  ═══════════════════════════════════════════════════════
  GRID BREAKPOINTS:
    xs  : 0    – 479px   (mobile portrait)
    sm  : 480  – 767px   (mobile landscape)
    md  : 768  – 1023px  (tablet)
    lg  : 1024 – 1279px  (desktop)
    xl  : 1280+          (wide desktop)
  ═══════════════════════════════════════════════════════
*/

/* ── Root ── */
.navbar-root {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  direction: rtl;
}

/* ── Promo Strip ── */
.promo-strip {
  display: grid;
  place-items: center;
  grid-auto-flow: column;
  gap: 6px;
  padding: 7px 12px;
  background: linear-gradient(90deg, #0d9488, #10b981, #0d9488);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}
.promo-sep { opacity: .6; }
.promo-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  transform: scale(1.5);
}
@media (max-width: 479px) {
  .promo-strip { font-size: 11px; gap: 4px; }
  .promo-sep   { display: none; }
}
@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* ═══════════════════════════════════════════════════════
   MAIN BAR
═══════════════════════════════════════════════════════ */
.main-bar {
  background: var(--nav-bg);
  border-bottom: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
  transition: box-shadow .3s;
}
.theme-light .main-bar { --nav-bg: rgba(255,253,248,.97); }
.theme-dark  .main-bar { --nav-bg: rgba(8,22,27,.93); }
.main-bar--scrolled     { box-shadow: 0 4px 24px rgba(0,0,0,.18); }

/*
  ─────────────────────────────────────────────────────
  BAR GRID — Core Layout Engine
  Columns: [logo] [search] [actions]
  Breakpoints collapse columns gracefully
  ─────────────────────────────────────────────────────
*/
.bar-grid {
  display: grid;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 64px;
  gap: 12px;

  /* xl / lg: logo | search | actions */
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "logo search actions";
}

/* md: logo | actions (search moves to its own row below) */
@media (max-width: 1023px) {
  .bar-grid {
    grid-template-columns: auto 1fr auto;
    grid-template-areas: "logo . actions";
    gap: 8px;
  }
  /* hide the inline search on md and below — use mobile-search-row */
  .search-wrap { display: none; }
}

/* xs/sm: same grid but tighter padding */
@media (max-width: 479px) {
  .bar-grid { padding: 0 10px; height: 56px; gap: 6px; }
}

.logo    { grid-area: logo; }
.search-wrap { grid-area: search; }
.actions { grid-area: actions; }

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 20px; }
.logo-text {
  font-size: 17px;
  font-weight: 900;
  background: linear-gradient(135deg, #0d9488, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -.01em;
  white-space: nowrap;
}
@media (max-width: 360px) {
  .logo-icon { font-size: 18px; }
  .logo-text { font-size: 15px; }
}

/* ── Search Box (shared styles) ── */
.search-wrap { position: relative; }
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 40px;
  border-radius: 12px;
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  transition: border-color .2s, box-shadow .2s;
}
.search-box--focused {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,.15);
}
.search-icon  { color: var(--subtext); flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--heading);
  font-size: 14px;
  outline: none;
  min-width: 0;
  direction: rtl;
}
.search-input::placeholder { color: var(--subtext); }
.search-clear {
  color: var(--subtext);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color .15s;
}
.search-clear:hover { color: #f43f5e; }

/* Search dropdown (desktop) */
.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--modal-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0,0,0,.3);
  overflow: hidden;
  z-index: 200;
}
/* Search dropdown (mobile — full width below search row) */
.search-dropdown--mobile {
  border-radius: 0 0 14px 14px;
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background .15s;
  border-bottom: 1px solid var(--divider);
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover      { background: rgba(13,148,136,.08); }
.result-img {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.result-img img { width: 100%; height: 100%; object-fit: cover; }
.result-info    { flex: 1; min-width: 0; }
.result-name    { font-size: 13px; font-weight: 600; color: var(--heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-price   { font-size: 12px; color: #0d9488; font-weight: 700; margin-top: 1px; }
.result-arrow   { color: var(--subtext); flex-shrink: 0; }

/* ─────────────────────────────────────────────────────
   MOBILE SEARCH ROW
   Shown ONLY on md/sm/xs (below bar-grid)
─────────────────────────────────────────────────────── */
.mobile-search-row {
  display: none;
  position: relative;
  padding: 8px 16px 10px;
  border-top: 1px solid var(--divider);
}
@media (max-width: 1023px) {
  .mobile-search-row { display: block; }
}
@media (max-width: 479px) {
  .mobile-search-row { padding: 6px 10px 8px; }
}

/* ─────────────────────────────────────────────────────
   ACTIONS — Grid inside actions cell
─────────────────────────────────────────────────────── */
.actions {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 6px;
}

/* Location — only lg+ */
.location-btn { display: none; }
@media (min-width: 1024px) {
  .location-btn { display: inline-flex; }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--subtext);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
  white-space: nowrap;
}
.action-btn:hover { border-color: #0d9488; color: #0d9488; }
.location-text {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Theme toggle */
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
}
.toggle-track {
  display: flex;
  align-items: center;
  width: 50px;
  height: 26px;
  border-radius: 999px;
  background: rgba(13,148,136,.15);
  border: 1.5px solid rgba(13,148,136,.3);
  padding: 2px;
  transition: background .3s;
}
.toggle-track--light { background: rgba(245,200,80,.15); border-color: rgba(245,200,80,.4); }
.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: transform .35s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
}
.toggle-thumb--light {
  transform: translateX(22px);
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
/* hide toggle on xs to save space */
@media (max-width: 360px) { .theme-toggle-btn { display: none; } }

/* Profile */
.profile-wrap { position: relative; }
.profile-btn  { gap: 7px; }
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(13,148,136,.4);
  flex-shrink: 0;
}
/* profile name: only md+ */
.profile-name { display: none; }
@media (min-width: 768px) { .profile-name { display: block; } }
.chevron         { transition: transform .22s; color: var(--subtext); }
.chevron--open   { transform: rotate(180deg); }

/* Profile dropdown */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 210px;
  background: var(--modal-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0,0,0,.28);
  overflow: hidden;
  z-index: 200;
}
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
}
.dropdown-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(13,148,136,.3);
  flex-shrink: 0;
}
.dropdown-name  { font-size: 13px; font-weight: 700; color: var(--heading); }
.dropdown-email { font-size: 11px; color: var(--subtext); margin-top: 2px; }
.dropdown-divider { height: 1px; background: var(--divider); }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--heading);
  background: none;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s, color .15s;
  text-align: right;
}
.dropdown-item:hover         { background: rgba(13,148,136,.08); color: #0d9488; }
.dropdown-item--danger       { color: #f43f5e; }
.dropdown-item--danger:hover { background: rgba(244,63,94,.08); color: #f43f5e; }

/* Login btn */
.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d9488, #10b981);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: filter .2s, transform .15s;
  box-shadow: 0 3px 10px rgba(13,148,136,.3);
  white-space: nowrap;
}
.login-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
/* hide text on xs */
@media (max-width: 479px) { .login-text { display: none; } }

/* Cart */
.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  color: var(--subtext);
  cursor: pointer;
  transition: border-color .2s, color .2s, transform .15s;
  flex-shrink: 0;
}
.cart-btn:hover { border-color: #0d9488; color: #0d9488; transform: scale(1.05); }
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f43f5e;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  min-width: 17px;
  height: 17px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--modal-bg, #081519);
}

/* Hamburger — shown on < lg */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 7px;
  background: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color .2s;
}
@media (max-width: 1023px) { .hamburger { display: flex; } }
.hamburger:hover { border-color: #0d9488; }
.hamburger span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--subtext);
  transition: width .2s, background .2s;
}
.hamburger span:nth-child(1) { width: 17px; }
.hamburger span:nth-child(2) { width: 13px; }
.hamburger span:nth-child(3) { width: 9px; }
.hamburger:hover span { background: #0d9488; width: 17px !important; }

/* ═══════════════════════════════════════════════════════
   CATEGORIES BAR
═══════════════════════════════════════════════════════ */
.cats-bar   { border-top: 1px solid var(--divider); padding: 0 16px; }
.cats-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 7px 0;
}
.cats-inner::-webkit-scrollbar { display: none; }
@media (max-width: 479px) { .cats-bar { padding: 0 10px; } }

.cat-pill {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1.5px solid transparent;
  background: transparent;
  color: var(--subtext);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all .2s;
}
@media (max-width: 479px) { .cat-pill { font-size: 12px; padding: 5px 11px; } }
.cat-pill:hover    { border-color: rgba(13,148,136,.4); color: #0d9488; background: rgba(13,148,136,.07); }
.cat-pill--active  {
  background: linear-gradient(135deg, #0d9488, #10b981);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 10px rgba(13,148,136,.3);
  font-weight: 700;
}

/* ═══════════════════════════════════════════════════════
   MOBILE SIDEBAR
═══════════════════════════════════════════════════════ */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(4px);
  z-index: 300;
}
.sidebar-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(300px, 88vw);
  height: 100%;
  background: var(--modal-bg);
  border-left: 1px solid var(--card-border);
  overflow-y: auto;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  align-content: start;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--divider);
}
.sidebar-close {
  color: var(--subtext);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color .15s;
}
.sidebar-close:hover { color: #f43f5e; }

.sidebar-user {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 11px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--divider);
  background: rgba(13,148,136,.05);
}
.sidebar-avatar   { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(13,148,136,.3); }
.sidebar-username { font-size: 13px; font-weight: 700; color: var(--heading); }
.sidebar-email    { font-size: 11px; color: var(--subtext); margin-top: 2px; }

.sidebar-section        { padding: 14px 18px; border-bottom: 1px solid var(--divider); }
.sidebar-section-title  {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--subtext);
  margin-bottom: 10px;
}

.sidebar-cats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 6px;
}
.sidebar-cat {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  color: var(--subtext);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all .2s;
}
.sidebar-cat:hover    { border-color: #0d9488; color: #0d9488; }
.sidebar-cat--active  { background: linear-gradient(135deg,#0d9488,#10b981); color: #fff; border-color: transparent; font-weight: 700; }

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 4px;
  font-size: 14px;
  color: var(--heading);
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: right;
  cursor: pointer;
  border-radius: 8px;
  transition: color .15s, background .15s;
}
.sidebar-link:hover         { color: #0d9488; background: rgba(13,148,136,.06); }
.sidebar-link--danger       { color: #f43f5e; }
.sidebar-link--danger:hover { background: rgba(244,63,94,.06); }

.sidebar-location {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px dashed rgba(13,148,136,.4);
  background: rgba(13,148,136,.05);
  color: #0d9488;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background .2s;
}
.sidebar-location:hover { background: rgba(13,148,136,.12); }

/* ═══════════════════════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════════════════════ */
.drop-enter-active { animation: dropIn .2s cubic-bezier(.4,0,.2,1); }
.drop-leave-active { animation: dropIn .15s cubic-bezier(.4,0,.2,1) reverse; }
@keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

.sidebar-fade-enter-active, .sidebar-fade-leave-active { transition: opacity .25s; }
.sidebar-fade-enter-from, .sidebar-fade-leave-to { opacity: 0; }

.sidebar-slide-enter-active { animation: slideIn .28s cubic-bezier(.4,0,.2,1); }
.sidebar-slide-leave-active { animation: slideIn .22s cubic-bezier(.4,0,.2,1) reverse; }
@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

.badge-pop-enter-active { animation: badgePop .3s cubic-bezier(.68,-.55,.265,1.55); }
.badge-pop-leave-active { transition: all .15s; }
.badge-pop-leave-to { opacity:0; transform:scale(0); }
@keyframes badgePop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
</style>
