<!-- SalesAnalytics.vue -->
<template>

    <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">

        <!-- HEADER -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-lg shadow-sm"
          :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
        >
          <div class="px-4 py-2 flex justify-between items-center flex-wrap gap-2"
            :style="{ borderBottom: '1px solid var(--card-border)' }"
          >
            <div class="flex items-center gap-2">
              <BarChart3 class="w-5 h-5" :style="{ color: 'var(--focus-ring)' }" />
              <div>
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Sales Analytics</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Comprehensive store performance</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <select
                v-model="selectedCompany"
                class="px-2 py-1.5 text-xs rounded-md focus:outline-none"
                :style="{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--input-border)' }"
              >
                <option value="">All Companies</option>
                <option v-for="c in companies" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <button
                @click="loadAll"
                :disabled="loading"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                :style="{ background: 'var(--focus-ring)' }"
              >
                <svg :class="['w-3 h-3', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ loading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <!-- Filters Row -->
          <div class="px-4 py-2 flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">From</span>
              <input v-model="dateFrom" type="date"
                class="px-2 py-1.5 text-xs rounded-md focus:outline-none"
                :style="{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--input-border)' }"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">To</span>
              <input v-model="dateTo" type="date"
                class="px-2 py-1.5 text-xs rounded-md focus:outline-none"
                :style="{ background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--input-border)' }"
              />
            </div>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="r in quickRanges" :key="r.label"
                @click="setRange(r)"
                class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                :style="activeRange === r.label
                  ? { background: 'var(--focus-ring)', color: '#fff', border: '1px solid var(--focus-ring)' }
                  : { background: 'var(--item-bg)', color: 'var(--text-sub)', border: '1px solid var(--item-border)' }"
              >{{ r.label }}</button>
            </div>
          </div>
        </header>

        <!-- LOADING -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>

        <template v-else>

          <!-- KEY METRICS -->
          <section class="px-3 pt-3">
            <div class="rounded-lg shadow-sm p-3" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">Key Metrics</h2>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <StatsCard title="Total Sales"  :value="formatCurrency(metrics.total_sales ?? 0)" icon="TrendingUp" color="green"  />
                <StatsCard title="Invoices"     :value="metrics.invoice_count ?? 0"               icon="FileText"  color="blue"   />
                <StatsCard title="Customers"    :value="customerStats.total"                      icon="Users"     color="purple" />
                <StatsCard
                  :title="`Growth ${(metrics.growth_rate ?? 0) >= 0 ? 'Up' : 'Down'}`"
                  :value="`${(metrics.growth_rate ?? 0) >= 0 ? '+' : ''}${metrics.growth_rate ?? 0}%`"
                  icon="BarChart3"
                  :color="(metrics.growth_rate ?? 0) >= 0 ? 'green' : 'orange'"
                />
              </div>
            </div>
          </section>

          <!-- CHARTS ROW -->
          <section class="px-3 pt-3">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">

              <!-- Daily Sales -->
              <div class="lg:col-span-2 rounded-lg shadow-sm p-4" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">Daily Sales</h3>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Revenue per day</p>
                  </div>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :style="{ background: 'var(--info-bg)', color: 'var(--focus-ring)', border: '1px solid var(--info-border)' }">
                    {{ dailySales.length }} days
                  </span>
                </div>
                <div v-if="dailySales.length === 0" class="h-40 flex items-center justify-center text-xs" :style="{ color: 'var(--text-muted)' }">
                  No data for this period
                </div>
                <div v-else class="h-40 flex items-end gap-0.5">
                  <div
                    v-for="(day, idx) in dailySales" :key="idx"
                    class="flex flex-col items-center gap-0.5 flex-1 h-full justify-end group cursor-pointer"
                  >
                    <div
                      class="w-full rounded-t transition-all duration-300 relative"
                      :style="{
                        height: maxDailySales ? `${Math.max(4, (day.value / maxDailySales) * 85)}%` : '4%',
                        background: 'var(--focus-ring)', opacity: 0.85
                      }"
                      :title="`${day.date}: ${formatCurrency(day.value)}`"
                      @mouseover="$event.currentTarget.style.opacity = '1'"
                      @mouseleave="$event.currentTarget.style.opacity = '0.85'"
                    >
                      <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10"
                        style="background: rgba(0,0,0,0.75); font-size: 10px;">
                        {{ formatCurrencyShort(day.value) }}
                      </div>
                    </div>
                    <span style="font-size: 9px;" :style="{ color: 'var(--text-muted)' }">{{ day.day }}</span>
                  </div>
                </div>
              </div>

              <!-- Top Products -->
              <div class="rounded-lg shadow-sm p-4" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
                <h3 class="text-xs font-bold mb-0.5" :style="{ color: 'var(--text-main)' }">Top Products</h3>
                <p class="text-xs mb-3" :style="{ color: 'var(--text-muted)' }">By quantity sold</p>
                <div v-if="topProducts.length === 0" class="text-xs text-center py-8" :style="{ color: 'var(--text-muted)' }">No data</div>
                <div v-else class="space-y-3">
                  <div v-for="(p, i) in topProducts.slice(0, 6)" :key="p.item_code">
                    <div class="flex justify-between items-center mb-1">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-bold w-3" :style="{ color: 'var(--text-muted)' }">{{ i + 1 }}</span>
                        <span class="text-xs truncate max-w-[100px]" :style="{ color: 'var(--text-sub)' }" :title="p.item_name">{{ p.item_name }}</span>
                      </div>
                      <span class="text-xs font-semibold" :style="{ color: 'var(--text-muted)' }">{{ p.quantity }}u</span>
                    </div>
                    <div class="w-full rounded-full h-1.5" :style="{ background: 'var(--item-bg)' }">
                      <div class="h-1.5 rounded-full transition-all duration-700"
                        :style="{ width: `${p.percentage}%`, background: 'var(--focus-ring)', opacity: 1 - i * 0.1 }" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- BOTTOM ROW -->
          <section class="px-3 pt-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

              <!-- By Category -->
              <div class="rounded-lg shadow-sm p-4" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
                <h3 class="text-xs font-bold mb-0.5" :style="{ color: 'var(--text-main)' }">By Category</h3>
                <p class="text-xs mb-3" :style="{ color: 'var(--text-muted)' }">Item group breakdown</p>
                <div v-if="salesByCategory.length === 0" class="text-xs text-center py-6" :style="{ color: 'var(--text-muted)' }">No data</div>
                <div v-else class="space-y-1.5">
                  <div v-for="(cat, i) in salesByCategory.slice(0, 6)" :key="cat.name"
                    class="flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-default"
                    :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :style="{ background: 'var(--focus-ring)', opacity: 1 - i * 0.12 }" />
                      <span class="text-xs truncate max-w-[100px]" :style="{ color: 'var(--text-sub)' }" :title="cat.name">{{ cat.name }}</span>
                    </div>
                    <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">{{ formatCurrencyShort(cat.amount) }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="rounded-lg shadow-sm p-4" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
                <h3 class="text-xs font-bold mb-0.5" :style="{ color: 'var(--text-main)' }">Payment Methods</h3>
                <p class="text-xs mb-3" :style="{ color: 'var(--text-muted)' }">How customers pay</p>
                <div v-if="paymentMethods.length === 0" class="text-xs text-center py-6" :style="{ color: 'var(--text-muted)' }">No data</div>
                <div v-else class="space-y-2.5">
                  <div v-for="(pm, i) in paymentMethods" :key="pm.name" class="space-y-1">
                    <div class="flex justify-between text-xs">
                      <span :style="{ color: 'var(--text-sub)' }">{{ pm.name }}</span>
                      <span class="font-semibold" :style="{ color: 'var(--text-main)' }">{{ formatCurrencyShort(pm.amount) }}</span>
                    </div>
                    <div class="w-full rounded-full h-1.5" :style="{ background: 'var(--item-bg)' }">
                      <div class="h-1.5 rounded-full transition-all"
                        :style="{ width: `${totalPayments ? (pm.amount / totalPayments) * 100 : 0}%`, background: 'var(--focus-ring)', opacity: 1 - i * 0.15 }" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer Stats -->
              <div class="rounded-lg shadow-sm p-4" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
                <h3 class="text-xs font-bold mb-0.5" :style="{ color: 'var(--text-main)' }">Customers</h3>
                <p class="text-xs mb-3" :style="{ color: 'var(--text-muted)' }">This period</p>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between px-3 py-2 rounded-md"
                    :style="{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }">
                    <span class="text-xs font-semibold" :style="{ color: 'var(--focus-ring)' }">Total Active</span>
                    <span class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">{{ customerStats.total }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2 rounded-md"
                    :style="{ background: 'var(--icon-bg-green)', border: '1px solid var(--icon-color-green)' }">
                    <span class="text-xs font-semibold" :style="{ color: 'var(--icon-color-green)' }">New</span>
                    <span class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">{{ customerStats.new_this_period }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2 rounded-md"
                    :style="{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }">
                    <span class="text-xs font-semibold" :style="{ color: 'var(--warning-border)' }">Loyal (2+ orders)</span>
                    <span class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">{{ customerStats.loyal }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2 rounded-md"
                    :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }">
                    <span class="text-xs font-semibold" :style="{ color: 'var(--text-muted)' }">Avg Order</span>
                    <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">{{ formatCurrency(customerStats.avg_order) }}</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <!-- EXPORT -->
          <section class="px-3 pt-3 pb-4">
            <div class="rounded-lg shadow-sm p-3 flex items-center justify-between"
              :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <p class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Export Report</p>
              <div class="flex gap-2">
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
                  style="background: #16a34a;"
                  @mouseover="$event.currentTarget.style.background = '#15803d'"
                  @mouseleave="$event.currentTarget.style.background = '#16a34a'">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Excel
                </button>
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
                  style="background: #dc2626;"
                  @mouseover="$event.currentTarget.style.background = '#b91c1c'"
                  @mouseleave="$event.currentTarget.style.background = '#dc2626'">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  PDF
                </button>
                <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                  :style="{ background: 'var(--item-bg)', color: 'var(--text-sub)', border: '1px solid var(--item-border)' }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                  @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import StatsCard from '@/layout/StatsCard.vue'
import { BarChart3 } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { getCompanies } from '@/services/api'
import { getSalesAnalytics } from '@/composables/reports'
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
    toDate:   dateTo.value,
    company:  selectedCompany.value || null,
  })
  if (res.success) {
    const d = res.data
    metrics.value         = d.metrics           || {}
    dailySales.value      = d.daily_sales       || []
    topProducts.value     = d.top_products      || []
    salesByCategory.value = d.sales_by_category || []
    paymentMethods.value  = d.payment_methods   || []
    customerStats.value   = d.customer_stats    || { total: 0, new_this_period: 0, loyal: 0, avg_order: 0 }
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
