<!-- inventoryBalance.vue -->
<!-- inventoryBalance.vue -->
<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <InventoryIcon class="text-cyan-600" />
              <h1 class="text-lg font-bold text-gray-900">Inventory Balance</h1>
            </div>
            <button
              @click="loadInventory"
              :disabled="isLoading"
              class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 text-white rounded-lg transition font-medium text-sm"
            >
              <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
              {{ isLoading ? 'Loading…' : 'Refresh' }}
            </button>
          </div>
        </header>

        <!-- Stats -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-6">Statistics</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Products"
                :value="totalProducts"
                icon="BarChart3"
                color="blue"
              />
              <StatsCard
                title="Categories"
                :value="categories.length"
                icon="Tag"
                color="green"
              />
              <StatsCard
                title="Low Stock"
                :value="lowStockCount"
                icon="TrendingUp"
                color="purple"
              />
              <StatsCard
                title="Total Value"
                :value="formatPrice(totalInventoryValue)"
                icon="DollarSign"
                color="purple"
              />
            </div>
          </div>
        </section>

        <!-- Filters -->
        <section class="flex-shrink-0 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">

              <!-- Search -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div class="relative">
                  <SearchIcon class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Search by name, category, warehouse…"
                  />
                </div>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  v-model="selectedCategory"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All Categories</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <!-- Warehouse -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                <select
                  v-model="selectedWarehouse"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="">All Warehouses</option>
                  <option v-for="wh in warehouses" :key="wh" :value="wh">{{ wh }}</option>
                </select>
              </div>

              <!-- Sort -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  v-model="sortBy"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="category">Category</option>
                  <option value="stock">Stock</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

            </div>
          </div>
        </section>

        <!-- Table -->
        <section class="ml-2 flex-1 px-4 sm:px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">

            <!-- Table Header -->
            <div class="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <InventoryIcon class="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" />
                <span class="text-gray-600 font-normal text-sm sm:text-base">
                  Products ({{ filteredProducts.length }})
                </span>
              </h3>
              <span v-if="isLoading" class="text-xs text-cyan-600 animate-pulse font-medium">Loading…</span>
              <span v-if="errorMessage" class="text-xs text-red-600 font-medium">⚠ {{ errorMessage }}</span>
            </div>

            <!-- Skeleton loader -->
            <div v-if="isLoading" class="p-6 space-y-3">
              <div v-for="i in 6" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">

                  <!-- Rows -->
                  <tr
                    v-for="product in filteredProducts"
                    :key="`${product.item_code}-${product.warehouse}`"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <!-- Product -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <img
                          :src="product?.image? `${config.VUE_URL}${product?.image}`: defaultImageSrc"
                          :alt="product.item_name"
                          class="h-10 w-10 rounded-lg object-cover bg-gray-100"
                          @error="handleImageError"
                        />
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ product.item_name }}</div>
                          <div class="text-xs text-gray-400 truncate max-w-[200px]">
                            {{ product.description || product.item_code }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Warehouse -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                        {{ product.warehouse || '—' }}
                      </span>
                    </td>

                    <!-- Category -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getCategoryClass(product.item_group)"
                      >
                        {{ product.item_group || 'Uncategorized' }}
                      </span>
                    </td>

                    <!-- Price -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {{ formatPrice(product.rate) }}
                    </td>

                    <!-- Stock -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span :class="getStockClass(product.actual_qty)">
                        {{ product.actual_qty }} units
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(product.actual_qty)"
                      >
                        {{ getStatusText(product.actual_qty) }}
                      </span>
                    </td>
                  </tr>

                  <!-- Empty state -->
                  <tr v-if="filteredProducts.length === 0 && !isLoading">
                    <td colspan="6" class="px-6 py-16 text-center">
                      <div class="flex flex-col items-center gap-3">
                        <PackageIcon class="w-12 h-12 text-gray-300" />
                        <p class="text-gray-500 font-medium">No products found</p>
                        <p class="text-gray-400 text-sm">
                          {{ searchQuery || selectedCategory || selectedWarehouse
                              ? 'Try adjusting your filters'
                              : 'No stock data available' }}
                        </p>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        </section>

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RefreshCcw, Search as SearchIcon, Package as PackageIcon } from 'lucide-vue-next'
import config from '@/config/frappe'
import StatsCard    from '@/layout/StatsCard.vue'
import MainLayout   from '@/layout/MainLayout.vue'
import InventoryIcon from '@/components/icons/InventoryIcon2.svg'
import { formatPrice } from '@/utils/formatters'
import { getInventoryBalance } from '@/services/api'


const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = `${config.VUE_URL}${defaultImage}`

// ============================================================
// STATE
// ============================================================
const products        = ref([])   // raw data from API
const isLoading       = ref(false)
const errorMessage    = ref('')

const searchQuery      = ref('')
const selectedCategory = ref('')
const selectedWarehouse = ref('')
const sortBy           = ref('name')

// ============================================================
// DERIVED LISTS (for filter dropdowns)
// ============================================================
const categories = computed(() => {
  const set = new Set(products.value.map(p => p.item_group).filter(Boolean))
  return Array.from(set).sort()
})

const warehouses = computed(() => {
  const set = new Set(products.value.map(p => p.warehouse).filter(Boolean))
  return Array.from(set).sort()
})

// ============================================================
// STATS
// ============================================================
const totalProducts = computed(() => {
  // unique item_codes
  return new Set(products.value.map(p => p.item_code)).size
})

const lowStockCount = computed(() =>
  products.value.filter(p => p.actual_qty > 0 && p.actual_qty < 10).length
)

const totalInventoryValue = computed(() =>
  products.value.reduce((sum, p) => sum + (p.rate * p.actual_qty), 0)
)

// ============================================================
// FILTERED + SORTED TABLE DATA
// ============================================================
const filteredProducts = computed(() => {
  let list = [...products.value]

  // search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.item_name?.toLowerCase().includes(q) ||
      p.item_code?.toLowerCase().includes(q) ||
      p.item_group?.toLowerCase().includes(q) ||
      p.warehouse?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }

  // category filter
  if (selectedCategory.value) {
    list = list.filter(p => p.item_group === selectedCategory.value)
  }

  // warehouse filter
  if (selectedWarehouse.value) {
    list = list.filter(p => p.warehouse === selectedWarehouse.value)
  }

  // sort
  switch (sortBy.value) {
    case 'name':
      list.sort((a, b) => (a.item_name || '').localeCompare(b.item_name || ''))
      break
    case 'price':
      list.sort((a, b) => (a.rate || 0) - (b.rate || 0))
      break
    case 'category':
      list.sort((a, b) => (a.item_group || '').localeCompare(b.item_group || ''))
      break
    case 'stock':
      list.sort((a, b) => (b.actual_qty || 0) - (a.actual_qty || 0))
      break
    case 'warehouse':
      list.sort((a, b) => (a.warehouse || '').localeCompare(b.warehouse || ''))
      break
  }

  return list
})

// ============================================================
// DATA LOADING
// ============================================================
const loadInventory = async () => {
  isLoading.value    = true
  errorMessage.value = ''
  try {
    const response = await getInventoryBalance()
    if (response.status === 'success') {
      products.value = response.data
    } else {
      errorMessage.value = response.message || 'Failed to load inventory'
    }
  } catch (err) {
    console.error('loadInventory error:', err)
    errorMessage.value = 'Error loading inventory data'
  } finally {
    isLoading.value = false
  }
}

// ============================================================
// HELPERS
// ============================================================
// Dynamic color palette — cycles through a set of Tailwind pairs
const categoryColorPalette = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
]
const categoryColorMap = {}
let colorIndex = 0

const getCategoryClass = (category) => {
  if (!category) return 'bg-gray-100 text-gray-800'
  if (!categoryColorMap[category]) {
    categoryColorMap[category] = categoryColorPalette[colorIndex % categoryColorPalette.length]
    colorIndex++
  }
  return categoryColorMap[category]
}

const getStockClass = (qty) => {
  if (qty <= 0)  return 'text-red-600 font-semibold'
  if (qty < 10)  return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

const getStatusClass = (qty) => {
  if (qty <= 0)  return 'bg-red-100 text-red-800'
  if (qty < 10)  return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getStatusText = (qty) => {
  if (qty <= 0)  return 'Out of Stock'
  if (qty < 10)  return 'Low Stock'
  return 'In Stock'
}

const handleImageError = (e) => {
  e.target.src = ''
  e.target.classList.add('hidden')
}

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(() => {
  loadInventory()
})
</script>
