<!-- Supermarket.vue -->
<template>
  <div
      :class="isDark ? 'theme-dark' : 'theme-light'"
      class="page-wrapper min-h-screen transition-colors duration-500"
    >

    <!-- Navbar Component -->
    <Navbar
      :selected-category="selectedCategory"
      :delivery-address="deliveryAddress"
      :categories="categories"
      @category-changed="handleCategoryChange"
      @location-changed="handleLocationChange"
      @product-selected="handleProductSelected"
      @show-map-modal="openMapModal"
    />

    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="blob blob-1 absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"></div>
      <div class="blob blob-2 absolute bottom-40 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
    </div>

    <!-- Custom Message Toast -->
    <Transition name="slide-fade">
      <div
        v-if="message.show"
        :class="message.type === 'success'
          ? 'bg-emerald-500/90 shadow-emerald-500/50'
          : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl heading-text text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3"
      >
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Success Banner -->
    <Transition name="slide-down">
      <div
        v-if="showSuccessBanner && cartStore.subtotal >= minOrderValue"
        class="relative z-30 mx-4 mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 backdrop-blur-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-bounce">🎉</span>
            <p class="heading-text font-medium">تم تحقيق الحد الأدنى! يمكنك الذهاب للدفع الآن</p>
          </div>
          <button
            @click="showSuccessBanner = false"
            class="text-slate-400 hover:heading-text transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="relative z-20 max-w-7xl mx-auto px-4 py-12">
      <!-- Breadcrumb -->
      <div class="mb-8 text-sm text-slate-400 flex items-center gap-2">
        <router-link
          :to="{ name: 'Supermarket' }"
          class="text-emerald-400 hover:text-teal-400 transition"
        >
          الرئيسية
        </router-link>
        <span class="text-slate-600">/</span>
        <span class="text-slate-300">{{ selectedCategory }}</span>
      </div>

      <!-- Page Title -->
      <div class="mb-12">
        <h1 class="text-2xl md:text-xl font-black heading-text mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          {{ selectedCategory }}
        </h1>
        <p class="subtext font-light">Discover the best products carefully selected for you</p>
      </div>

      <div class="flex gap-8">
        <!-- Desktop Filters Sidebar -->
        <aside class="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <!-- Category Filter -->
          <div class="panel-bg backdrop-blur rounded-xl p-6">
            <h3 class="font-bold text-lg heading-text mb-4">Categories</h3>
            <div class="space-y-2">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="handleCategoryChange(cat)"
                :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
                class="w-full text-right px-4 py-2.5 rounded-lg border transition cat-btn"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Price Filter -->
          <div class="panel-bg backdrop-blur rounded-xl p-6">
            <h3 class="font-bold text-lg heading-text mb-4">Price Range</h3>
            <p class="text-emerald-400 font-bold mb-4">
              {{ formatCurrency(priceRange.min) }} - {{ formatCurrency(priceRange.max) }}
            </p>
            <div class="space-y-3">
              <input
                v-model.number="priceRange.min"
                type="number"
                min="0"
                max="35000"
                @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="الحد الأدنى"
              />
              <input
                v-model.number="priceRange.max"
                type="number"
                min="0"
                max="35000"
                @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="الحد الأقصى"
              />
            </div>
            <div class="price-track relative h-1 rounded-full mt-6">
              <div
                class="absolute h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                :style="{
                  left: (priceRange.min / 35000 * 100) + '%',
                  right: (100 - priceRange.max / 35000 * 100) + '%'
                }"
              ></div>
            </div>
          </div>
        </aside>

        <!-- Products Section -->
        <main class="flex-1">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-20"></div>
              <div
                class="absolute inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-40"
                style="animation-direction: reverse"
              ></div>
            </div>
            <p class="subtext mt-4 font-medium">Loading...</p>
          </div>

          <!-- Products Grid -->
           <div v-if="paginatedProducts.length > 0" class="container" >

          <div v-for="(product, idx) in paginatedProducts" :key="product.item_code"
            class="card card-panel"
            :style="{ 'animation-delay': `${idx * 50}ms`}">
            <span class="discount-badge">{{product.discount_percentage}}% خصم</span>
          <div class="image-container">
            <!-- <a href="/supermarket/supermarket.html?item_code=${encodedName}" title=""> -->
              <img
                :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc"
                :alt="product.item_name"
              />

            <!-- </a> -->
            <button class="add-to-cart" @click="addToCart(product)">
              <svg viewBox="-1 -1 26 26">
                <polygon points="12.5,2 11.5,2 11.5,11.5 2,11.5 2,12.5 11.5,12.5 11.5,22 12.5,22 12.5,12.5 22,12.5 22,11.5 12.5,11.5" stroke="#fff" stroke-width="2"></polygon>
              </svg>
            </button>
          </div>

          <div class="product-info">
            <div class="discount-price">
              <div class="dot-price-currency">
                  <div class="dot-price" dir="ltr">
                    .{{ (product.rate % 1).toFixed(2).split('.')[1] }}
                  </div>
                  <div class="currency-in-dot">
                    <span>{{product.currency}}</span>
                  </div>
              </div>
              <div class="not-dotprice">{{ Math.floor(product.rate) }}</div>
            </div>
             <div class="original-price" v-if="product.discount_percentage > 0">
                <div class="price">
                  {{ product.original_rate }}
                  <span class="currency">{{product.currency}}</span>
                </div>
                <div class="original-price-discount">
                  <div class="discount-label">
                    {{ product.discount_amount }} {{ product.currency }} خصم

                  </div>
                </div>
            </div>
          </div>

          <a class="product-name" href="/supermarket/supermarket.html?item_code=${encodedName}">{{product.item_name}}</a>
            </div>
           </div>

          <!-- Empty State -->
          <div v-if="!loading && paginatedProducts.length === 0" class="text-center py-20">
            <div class="text-6xl mb-4">📭</div>
            <p class="heading-text text-xl font-bold mb-2">No products available</p>
            <p class="subtext">Try changing the filters or searching</p>
          </div>

          <!-- Pagination -->
          <Transition name="fade">
            <div v-if="paginatedProducts.length > 0 && totalPages > 1" class="flex flex-wrap justify-center items-center gap-3 mt-12 pb-8">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Previous
              </button>

              <div class="flex gap-2">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 heading-text shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500'"
                  class="px-4 py-2 rounded-lg transition font-medium"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Next
              </button>
            </div>
          </Transition>
        </main>
      </div>
    </div>

    <!-- Location/Map Modal -->
    <Transition name="fade">
      <div v-if="showMapModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-700/50">
          <h2 class="text-2xl font-bold heading-text mb-6">Choose Delivery Location</h2>
          <div class="space-y-4 mb-6">
            <input
              v-model="locationSearch"
              type="text"
              placeholder="Search for your Location..."
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg heading-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />

            <!-- Location Results -->
            <div v-if="filteredLocations.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
              <button
                v-for="loc in filteredLocations"
                :key="loc"
                @click="selectLocation(loc)"
                class="w-full text-right px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500 transition"
              >
                📍 {{ loc }}
              </button>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showMapModal = false"
              class="flex-1 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              @click="closeMapModal"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 heading-text rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="relative z-20 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800 mt-20">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div>
            <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
              Hypermarket
            </h3>
            <p class="subtext text-sm leading-relaxed">
              Your trusted online shopping platform, offering top-quality products at competitive prices.
            </p>

          </div>
          <div>
            <h3 class="heading-text font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2 subtext text-sm">
              <li>
                <router-link :to="{ name: 'Supermarket' }" class="hover:text-emerald-400 transition">
                 Supermarket
                </router-link>
              </li>
              <li>
                <a href="#" class="hover:text-emerald-400 transition">Contact us</a>
              </li>
              <li>
                <a href="#" class="hover:text-emerald-400 transition">Loyalty Points</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4">Contact Us</h3>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📱</a>
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📧</a>
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📍</a>
            </div>
          </div>
          <div class="text-right text-slate-400 text-sm">
            <p class="font-bold heading-text mb-2">© 2024 Hypermarket</p>
          </div>
        </div>
        <div class="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          All rights reserved © 2024
        </div>

      </div>
    </footer>
  </div>
</template>
<script setup>
import Navbar from "@/pages/website/components/navbar.vue"
import config from '@/config/frappe'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { formatCurrency } from '@/utils/formatters'
import { getItemGroup, getCustomerProfileApi } from "@/services/api"
import { useSettingsStore } from '@/stores/settings'

// ─── Theme ────────────────────────────────────────────────────────────────────
const settingsStore = useSettingsStore()
const settings    = computed(() => settingsStore.settings)
const isDark      = computed(() => settings.value?.appearance?.theme === 'dark')

// ================= STORES =================
const router = useRouter()
const cartStore = useCartStore()
const productsStore = useProductsStore()

// ================= CONSTANTS =================
const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = `${config.VUE_URL}${defaultImage}`
const itemsPerPage = 12
const minOrderValue = 1000

// ================= STATE =================
const selectedCategory = ref('جميع التصنيفات')
const categories = ref(['جميع التصنيفات'])

const loading = ref(false)
const currentPage = ref(1)

const deliveryAddress = ref('اختر موقعك')
const showSuccessBanner = ref(false)

const priceRange = ref({ min: 0, max: 35000 })

const message = ref({
  show: false,
  text: '',
  type: 'success',
})



const showMapModal = ref(false)
const locationSearch = ref('')
const allLocations = [
  'المعادي - القاهرة',
  'حلوان - القاهرة',
  'مدينة نصر - القاهرة',
  'القاهرة الجديدة',
  'الجيزة',
]

// ========== COMPUTED ==========
const websiteProducts = ref([])
const filteredProducts = computed(() => {
  return websiteProducts.value.filter(p => {
    const categoryMatch =
      selectedCategory.value === 'جميع التصنيفات' ||
      p.item_group === selectedCategory.value
    const priceMatch =
      p.rate >= priceRange.value.min &&
      p.rate <= priceRange.value.max
    return categoryMatch && priceMatch
  })
})

console.log("websiteProducts.value ", websiteProducts.value)
console.log("filteredProducts", filteredProducts.value)
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) {
    return allLocations
  }
  const keyword = locationSearch.value.toLowerCase()
  return allLocations.filter(loc =>
    loc.toLowerCase().includes(keyword)
  )
})

// ========== METHODS ==========
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  currentPage.value = 1
}
const loadCategories = async () => {
  try {
    const response = await getItemGroup()
    const groups = response?.data
    console.log("groups",groups)
    categories.value = [
      'جميع التصنيفات',
      ...groups.map(g => g.name || g.item_group).filter(Boolean)
    ]
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}
const handleLocationChange = (location) => {
  deliveryAddress.value = location
}

const handleProductSelected = (product) => {
  addToCart(product)
}

const addToCart = (product) => {
  cartStore.addToCart(product)

  if (cartStore.subtotal >= minOrderValue) {
    showSuccessBanner.value = true
  }

  showMessage('تم إضافة المنتج إلى السلة!', 'success')
}

const openMapModal = () => {
  showMapModal.value = true
  locationSearch.value = ''
}

const selectLocation = (location) => {
  deliveryAddress.value = location
  locationSearch.value = ''
  showMapModal.value = false
}


const closeMapModal = () => {
  showMapModal.value = false
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

const filterAndLoadProducts = () => {
  currentPage.value = 1
}


const loadProducts = async () => {
  loading.value = true
  try {
    const websitePriceList = "Standard Selling"

    let websiteCustomer = "Guest"

    try {
      const profile = await getCustomerProfileApi()
      console.log("Prooooofile",profile)
      if (profile?.party_type === "Customer" && profile?.party_name) {
        websiteCustomer = profile.party_name
      }

    } catch (e) {
      console.log("User not logged in → Guest mode",e)
    }
      console.log("website Customer : ",websiteCustomer)
   websiteProducts.value =  await productsStore.loadWebsiteProducts(
      websitePriceList,
      websiteCustomer
    )

  } catch (error) {
    console.error('Error loading products:', error)
    showMessage('خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}



// ========== LIFECYCLE ==========
onMounted(async () => {
    await Promise.all([
      loadCategories(),
      loadProducts()

    ])
     console.log("After load:", websiteProducts.value)

})
</script>

<style scoped>


/* =================== ANIMATIONS =================== */
@keyframes slide-fade {
  0% {
    transform: translateX(30px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =================== UTILITIES =================== */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* =================== GROUP HOVER =================== */
.group:nth-child(1) {
  animation: slideUp 0.5s ease forwards;
  opacity: 0;
}

/* =================== CUSTOM SCROLLBAR =================== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669;
}
/* media for big cards */
.container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    width: 100%;
    margin: auto;
    margin-top: 25px;


}
/* ==================================================================================== */
/* البطاقة */
/* Big Cards */
/* ==================================================================================== */
.card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 15px;
    max-width: 300px;
    margin: auto;
    position: relative;
    text-align: center;
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* الصورة */
.image-container {
    position: relative;
}

.image-container img {
    width: 100%;
    border-radius: 10px;
}

/* شارة الخصم */
.discount-badge {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #bc1e20;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  font-weight: bold;
  border-bottom-right-radius: 0.75rem;
  border-top-left-radius: 0.75rem
}
/* زر الإضافة إلى السلة */
.add-to-cart {
    background: var(--btn-add-cart-bg);
    transition: background .3s, transform .2s;
    border: none;
    color: white;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 22px;
    width: 50px;
    height: 50px;
    position: absolute;
    bottom: 50px;
    right: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0;
    right: 0px;
}

.add-to-cart:hover {
    /* background: #0056b3; */
    background: var(--btn-add-cart-hover);
    transform: scale(1.05);
}

.add-to-cart svg {
    width: 25px;
    height: 25px;
    fill: white;
}

/* معلومات المنتج */
.product-info {
    width: 100%;
    height: 50px;
    position: relative;
    direction: rtl;
    display: inline-block;
    text-decoration: inherit;

}

.discount-price {
    position:relative;
    right: 0;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    height: 35px;

}


.dot-price-currency{
    box-sizing: border-box;
    margin: 5px 4px 0px 0px;
    min-width: 0px;
    display: inline-block;
    vertical-align: top;
    position: absolute;
    top: 0;
    right: 0;
}

.dot-price {
    box-sizing: border-box;
    margin: 0px;
    min-width: 0px;
    font-size: 10px;
    line-height: 10px;
    font-weight: 700;
    color: var(--price-color);

}

.not-dotprice{
    box-sizing: border-box;
    margin: 0px;
    min-width: 0px;
    font-size: 20px;
    line-height: 28px;
    display: inline-block;
    font-weight: 700;
    position: absolute;
    right: 20px;
    bottom: 0;
    color: var(--price-color);
}

.original-price {
    font-size: 14px;
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
}
.original-price .price{
    text-decoration: line-through;
}
.currency-in-dot{
    box-sizing: border-box;
    margin: 0px;
    min-width: 0px;
    font-size: 7px;
    line-height: 7px;
    font-weight: 400;
    color: var(--heading);
}
.currency {
    font-size: 14px;
    color: var(--subtext);
}

.product-name {
    color: var(--heading);
    transition: color .3s;
    text-decoration: none;
    font-size: 16px;
    font-weight: bold;
    display: block;
    text-align: center;
    margin-top: 5px;
}
.original-price .original-price-discount .discount-label {
    color: red;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 5px;
    margin-right: 10px;
}

/* Category Buttons */
.cat-btn {
  color: var(--heading);
  border-color: var(--card-border);
}

.cat-btn-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.45);
}

.cat-btn-inactive {
  color: var(--subtext);
  border-color: var(--card-border);
}

.cat-btn-inactive:hover {
  border-color: var(--input-border);
  color: var(--heading);
}

/* Price Track */
.price-track {
  background: var(--track-bg);
  border: 1px solid var(--track-border);
}

.field-input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-color);
}

/* placeholder color */
.field-input::placeholder {
  color: var(--subtext);
  opacity: 0.7;
}
/* ==================================================================================== */
/* Responsive Big Cards  */
/* ==================================================================================== */


@media (max-width: 1200px) {
    .container {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 900px) {
    .container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .container {
        grid-template-columns: repeat(1, 1fr);
    }

}
@media (max-width: 480px) {
    .container {
        grid-template-columns: repeat(1, 1fr);
    }
}



</style>
