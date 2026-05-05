<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 class="text-lg font-bold text-gray-900">Sales Analytics</h1>
              <p class="text-gray-500 text-sm mt-0.5">Comprehensive store performance</p>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <select
                v-model="selectedCompany"
                class="px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Companies</option>
                <option v-for="c in companies" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <button
                @click="loadAll"
                :disabled="loading"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                <svg :class="['w-4 h-4', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ loading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <!-- Date filters -->
          <div class="px-6 pb-4 flex items-center gap-4 flex-wrap border-t border-gray-100 pt-3">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide">From</span>
              <input v-model="dateFrom" type="date"
                class="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide">To</span>
              <input v-model="dateTo" type="date"
                class="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div class="flex gap-2">
              <button
                v-for="r in quickRanges" :key="r.label"
                @click="setRange(r)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition border"
                :class="activeRange === r.label
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'"
              >{{ r.label }}</button>
            </div>
          </div>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else>

          <!-- Key Metrics -->
          <section class="px-6 py-5">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm p-4">
                <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Sales</p>
                <p class="text-2xl font-bold text-green-900 mt-1.5">{{ formatCurrency(metrics.total_sales ?? 0) }}</p>
                <p class="text-xs text-green-600 mt-1.5">
                  {{ (metrics.growth_rate ?? 0) >= 0 ? '↑' : '↓' }}
                  {{ Math.abs(metrics.growth_rate ?? 0) }}% vs prev period
                </p>
              </div>

              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-4">
                <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Invoices</p>
                <p class="text-2xl font-bold text-blue-900 mt-1.5">{{ metrics.invoice_count ?? 0 }}</p>
                <p class="text-xs text-blue-600 mt-1.5">Avg {{ formatCurrency(metrics.avg_invoice ?? 0) }}</p>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm p-4">
                <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Customers</p>
                <p class="text-2xl font-bold text-purple-900 mt-1.5">{{ customerStats.total }}</p>
                <p class="text-xs text-purple-600 mt-1.5">{{ customerStats.new_this_period }} new this period</p>
              </div>

              <div
                class="rounded-xl border shadow-sm p-4"
                :class="(metrics.growth_rate ?? 0) >= 0
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide"
                  :class="(metrics.growth_rate ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'"
                >Growth Rate</p>
                <p
                  class="text-2xl font-bold mt-1.5"
                  :class="(metrics.growth_rate ?? 0) >= 0 ? 'text-emerald-900' : 'text-red-700'"
                >
                  {{ (metrics.growth_rate ?? 0) >= 0 ? '+' : '' }}{{ metrics.growth_rate ?? 0 }}%
                </p>
                <p
                  class="text-xs mt-1.5"
                  :class="(metrics.growth_rate ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'"
                >Prev: {{ formatCurrency(metrics.prev_total ?? 0) }}</p>
              </div>
            </div>
          </section>

          <!-- Charts Row -->
          <section class="px-6 pb-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

              <!-- Daily Sales -->
              <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div class="flex items-center justify-between mb-5">
                  <div>
                    <h3 class="text-sm font-bold text-gray-900">Daily Sales</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Revenue per day</p>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {{ dailySales.length }} days
                  </span>
                </div>

                <div v-if="dailySales.length === 0" class="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No data for this period
                </div>
                <div v-else class="h-48 flex items-end gap-1">
                  <div
                    v-for="(day, idx) in dailySales"
                    :key="idx"
                    class="flex flex-col items-center gap-1 flex-1 h-full justify-end group cursor-pointer"
                  >
                    <div
                      class="w-full rounded-t-md transition-all duration-300 group-hover:opacity-75 relative"
                      :style="{
                        height: maxDailySales ? `${Math.max(4, (day.value / maxDailySales) * 85)}%` : '4%',
                        background: 'linear-gradient(180deg, #3b82f6, #2563eb)'
                      }"
                      :title="`${day.date}: ${formatCurrency(day.value)}`"
                    >
                      <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        {{ formatCurrency(day.value) }}
                      </div>
                    </div>
                    <span class="text-gray-400 text-xs">{{ day.day }}</span>
                  </div>
                </div>
              </div>

              <!-- Top Products -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 class="text-sm font-bold text-gray-900 mb-1">Top Products</h3>
                <p class="text-xs text-gray-500 mb-5">By quantity sold</p>
                <div v-if="topProducts.length === 0" class="text-gray-400 text-sm text-center py-8">No data</div>
                <div v-else class="space-y-4">
                  <div v-for="(p, i) in topProducts.slice(0, 6)" :key="p.item_code">
                    <div class="flex justify-between items-center mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-gray-400 w-4">{{ i + 1 }}</span>
                        <span class="text-sm text-gray-700 truncate max-w-[120px]" :title="p.item_name">{{ p.item_name }}</span>
                      </div>
                      <span class="text-xs font-semibold text-gray-500">{{ p.quantity }} u</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        class="h-1.5 rounded-full transition-all duration-700 bg-blue-500"
                        :style="{ width: `${p.percentage}%`, opacity: 1 - i * 0.1 }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Bottom Row -->
          <section class="px-6 pb-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

              <!-- Sales by Category -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 class="text-sm font-bold text-gray-900 mb-1">By Category</h3>
                <p class="text-xs text-gray-500 mb-4">Item group breakdown</p>
                <div v-if="salesByCategory.length === 0" class="text-gray-400 text-sm text-center py-6">No data</div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(cat, i) in salesByCategory.slice(0, 6)"
                    :key="cat.name"
                    class="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="w-2 h-2 rounded-full bg-blue-500" :style="`opacity: ${1 - i * 0.12}`"></div>
                      <span class="text-sm text-gray-700 truncate max-w-[110px]" :title="cat.name">{{ cat.name }}</span>
                    </div>
                    <span class="text-sm font-bold text-gray-900">{{ formatCurrencyShort(cat.amount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 class="text-sm font-bold text-gray-900 mb-1">Payment Methods</h3>
                <p class="text-xs text-gray-500 mb-4">How customers pay</p>
                <div v-if="paymentMethods.length === 0" class="text-gray-400 text-sm text-center py-6">No data</div>
                <div v-else class="space-y-3">
                  <div v-for="(pm, i) in paymentMethods" :key="pm.name" class="space-y-1.5">
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-600 font-medium">{{ pm.name }}</span>
                      <span class="text-gray-900 font-semibold">{{ formatCurrencyShort(pm.amount) }}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="h-2 rounded-full bg-blue-500 transition-all"
                        :style="{ width: `${totalPayments ? (pm.amount / totalPayments) * 100 : 0}%`, opacity: 1 - i * 0.15 }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer Stats -->
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 class="text-sm font-bold text-gray-900 mb-1">Customers</h3>
                <p class="text-xs text-gray-500 mb-4">This period</p>
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span class="text-xs font-semibold text-blue-600">Total Active</span>
                    <span class="text-xl font-bold text-blue-900">{{ customerStats.total }}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                    <span class="text-xs font-semibold text-green-600">New</span>
                    <span class="text-xl font-bold text-green-900">{{ customerStats.new_this_period }}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                    <span class="text-xs font-semibold text-yellow-600">Loyal (2+ orders)</span>
                    <span class="text-xl font-bold text-yellow-900">{{ customerStats.loyal }}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <span class="text-xs font-semibold text-purple-600">Avg Order</span>
                    <span class="text-sm font-bold text-purple-900">{{ formatCurrency(customerStats.avg_order) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Export -->
          <section class="px-6 pb-8">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-700">Export Report</p>
              <div class="flex gap-2">
                <button class="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Excel
                </button>
                <button class="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  PDF
                </button>
                <button class="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </section>

        </template>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useToast } from 'vue-toastification'
import { getSalesAnalytics, getCompanies } from '@/services/api'

const toast = useToast()

const loading         = ref(false)
const companies       = ref([])
const selectedCompany = ref('')

const today        = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const dateFrom     = ref(firstOfMonth.toISOString().split('T')[0])
const dateTo       = ref(today.toISOString().split('T')[0])
const activeRange  = ref('This Month')

const metrics         = ref({})
const dailySales      = ref([])
const topProducts     = ref([])
const salesByCategory = ref([])
const paymentMethods  = ref([])
const customerStats   = ref({ total: 0, new_this_period: 0, loyal: 0, avg_order: 0 })

const quickRanges = [
  { label: 'Today',      days: 0 },
  { label: 'This Week',  days: 6 },
  { label: 'This Month', month: true },
  { label: 'Last 30d',   days: 29 },
]

const setRange = (r) => {
  activeRange.value = r.label
  const now = new Date()
  dateTo.value = now.toISOString().split('T')[0]
  if (r.month) {
    dateFrom.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  } else {
    const from = new Date(now)
    from.setDate(from.getDate() - (r.days || 0))
    dateFrom.value = from.toISOString().split('T')[0]
  }
  loadAll()
}

const maxDailySales = computed(() =>
  dailySales.value.reduce((max, d) => Math.max(max, d.value), 0)
)

const totalPayments = computed(() =>
  paymentMethods.value.reduce((sum, p) => sum + p.amount, 0)
)

const loadAll = async () => {
  loading.value = true
  const res = await getSalesAnalytics({
    fromDate: dateFrom.value,
    toDate: dateTo.value,
    company: selectedCompany.value || null,
  })
  if (res.success) {
    const d = res.data
    metrics.value         = d.metrics             || {}
    dailySales.value      = d.daily_sales         || []
    topProducts.value     = d.top_products        || []
    salesByCategory.value = d.sales_by_category   || []
    paymentMethods.value  = d.payment_methods     || []
    customerStats.value   = d.customer_stats      || { total: 0, new_this_period: 0, loyal: 0, avg_order: 0 }
  } else {
    toast.error('Failed to load analytics: ' + res.error)
  }
  loading.value = false
}

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0)

const formatCurrencyShort = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`
  return formatCurrency(v)
}

onMounted(async () => {
  companies.value = await getCompanies()
  await loadAll()
})
</script>
