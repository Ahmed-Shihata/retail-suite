<!-- CashFlow.vue -->

<template>

    <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">

        <!-- ══════════════════ HEADER ══════════════════ -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-lg shadow-sm"
          :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
        >
          <div class="px-4 py-2 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <button
                @click="goBack"
                class="p-1.5 rounded-md transition-colors"
                :style="{ color: 'var(--text-muted)' }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'transparent'"
              >
                <ArrowLeft class="w-4 h-4" />
              </button>
              <div>
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Cash Flow Statement</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Financial position overview</p>
              </div>
            </div>
            <button
              @click="exportReport"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors"
              :style="{ background: 'var(--focus-ring)' }"
            >
              <Download class="w-3 h-3" />
              Export
            </button>
          </div>
        </header>

        <!-- ══════════════════ STATISTICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Key Metrics
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <StatsCard title="Operating Cash Flow" :value="formatCurrency(totalOperating, currencyCode, locale)"  icon="TrendingUp"  color="green"  />
              <StatsCard title="Investing Activities" :value="formatCurrency(Math.abs(totalInvesting), currencyCode, locale)" icon="BarChart2"  color="blue"   />
              <StatsCard title="Financing Activities" :value="formatCurrency(Math.abs(totalFinancing), currencyCode, locale)" icon="DollarSign" color="purple" />
              <StatsCard title="Net Cash Change"      :value="formatCurrency(netCashChange, currencyCode, locale)"  icon="TrendingUp"  :color="netCashChange >= 0 ? 'green' : 'orange'" />
            </div>
          </div>
        </section>

        <!-- ══════════════════ FILTERS ══════════════════ -->
        <section class="px-3 pt-3">
          <CashFlowFilters @apply-filters="handleApplyFilters" />
        </section>

        <!-- ══════════════════ LOADING ══════════════════ -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>

        <!-- ══════════════════ CONTENT ══════════════════ -->
        <section v-else class="px-3 pt-3 pb-6">
          <div
            class="rounded-lg shadow-sm overflow-hidden"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >

            <!-- ── Operating Activities ── -->
            <div class="p-4" :style="{ borderBottom: '1px solid var(--card-border)' }">
              <h2 class="text-xs font-bold mb-3 flex items-center gap-2" :style="{ color: 'var(--text-main)' }">
                <span
                  class="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                  :style="{ background: 'var(--icon-bg-green)' }"
                >💼</span>
                Operating Activities
              </h2>

              <div class="space-y-1">
                <div
                  v-if="operatingActivities.length === 0"
                  class="text-xs italic py-3"
                  :style="{ color: 'var(--text-muted)' }"
                >
                  No operating activities found
                </div>
                <div
                  v-for="(item, index) in operatingActivities"
                  :key="index"
                  class="flex justify-between items-center py-2 px-3 rounded-md transition-colors"
                  :style="{ border: '1px solid transparent' }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'; $event.currentTarget.style.borderColor = 'var(--card-border)'"
                  @mouseleave="$event.currentTarget.style.background = 'transparent'; $event.currentTarget.style.borderColor = 'transparent'"
                >
                  <div>
                    <p class="text-xs font-medium" :style="{ color: 'var(--text-main)' }">{{ item.name }}</p>
                    <p class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">{{ item.description }}</p>
                  </div>
                  <span class="text-xs font-bold" :style="{ color: item.amount >= 0 ? 'var(--icon-color-green)' : '#ef4444' }">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>

              <!-- Subtotal -->
              <div
                class="flex justify-between items-center mt-3 px-3 py-2 rounded-md"
                :style="{ background: 'var(--icon-bg-green)', border: '1px solid var(--icon-color-green)' }"
              >
                <span class="text-xs font-bold" :style="{ color: 'var(--text-sub)' }">Net Cash from Operating</span>
                <span class="text-xs font-bold" :style="{ color: 'var(--icon-color-green)' }">
                  {{ formatCurrency(totalOperating, currencyCode, locale) }}
                </span>
              </div>
            </div>

            <!-- ── Investing Activities ── -->
            <div class="p-4" :style="{ borderBottom: '1px solid var(--card-border)' }">
              <h2 class="text-xs font-bold mb-3 flex items-center gap-2" :style="{ color: 'var(--text-main)' }">
                <span
                  class="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                  :style="{ background: 'var(--info-bg)' }"
                >📊</span>
                Investing Activities
              </h2>

              <div class="space-y-1">
                <div
                  v-if="investingActivities.length === 0"
                  class="text-xs italic py-3"
                  :style="{ color: 'var(--text-muted)' }"
                >
                  No investing activities found
                </div>
                <div
                  v-for="(item, index) in investingActivities"
                  :key="index"
                  class="flex justify-between items-center py-2 px-3 rounded-md transition-colors"
                  :style="{ border: '1px solid transparent' }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'; $event.currentTarget.style.borderColor = 'var(--card-border)'"
                  @mouseleave="$event.currentTarget.style.background = 'transparent'; $event.currentTarget.style.borderColor = 'transparent'"
                >
                  <div>
                    <p class="text-xs font-medium" :style="{ color: 'var(--text-main)' }">{{ item.name }}</p>
                    <p class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">{{ item.description }}</p>
                  </div>
                  <span class="text-xs font-bold" :style="{ color: item.amount >= 0 ? 'var(--icon-color-green)' : '#ef4444' }">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>

              <div
                class="flex justify-between items-center mt-3 px-3 py-2 rounded-md"
                :style="{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }"
              >
                <span class="text-xs font-bold" :style="{ color: 'var(--text-sub)' }">Net Cash from Investing</span>
                <span class="text-xs font-bold" :style="{ color: 'var(--focus-ring)' }">
                  {{ formatCurrency(totalInvesting, currencyCode, locale) }}
                </span>
              </div>
            </div>

            <!-- ── Financing Activities ── -->
            <div class="p-4" :style="{ borderBottom: '1px solid var(--card-border)' }">
              <h2 class="text-xs font-bold mb-3 flex items-center gap-2" :style="{ color: 'var(--text-main)' }">
                <span
                  class="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                  :style="{ background: 'var(--item-bg)' }"
                >🏦</span>
                Financing Activities
              </h2>

              <div class="space-y-1">
                <div
                  v-if="financingActivities.length === 0"
                  class="text-xs italic py-3"
                  :style="{ color: 'var(--text-muted)' }"
                >
                  No financing activities found
                </div>
                <div
                  v-for="(item, index) in financingActivities"
                  :key="index"
                  class="flex justify-between items-center py-2 px-3 rounded-md transition-colors"
                  :style="{ border: '1px solid transparent' }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'; $event.currentTarget.style.borderColor = 'var(--card-border)'"
                  @mouseleave="$event.currentTarget.style.background = 'transparent'; $event.currentTarget.style.borderColor = 'transparent'"
                >
                  <div>
                    <p class="text-xs font-medium" :style="{ color: 'var(--text-main)' }">{{ item.name }}</p>
                    <p class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">{{ item.description }}</p>
                  </div>
                  <span class="text-xs font-bold" :style="{ color: item.amount >= 0 ? 'var(--icon-color-green)' : '#ef4444' }">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>

              <div
                class="flex justify-between items-center mt-3 px-3 py-2 rounded-md"
                :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }"
              >
                <span class="text-xs font-bold" :style="{ color: 'var(--text-sub)' }">Net Cash from Financing</span>
                <span class="text-xs font-bold" :style="{ color: 'var(--focus-ring)' }">
                  {{ formatCurrency(totalFinancing, currencyCode, locale) }}
                </span>
              </div>
            </div>

            <!-- ── Summary ── -->
            <div class="p-4" :style="{ background: 'var(--item-bg)' }">
              <h2 class="text-xs font-bold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-muted)' }">Summary</h2>
              <div class="space-y-2">

                <div
                  class="flex justify-between items-center px-3 py-2 rounded-md"
                  :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
                >
                  <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Net increase in cash</span>
                  <span class="text-xs font-bold" :style="{ color: netCashChange >= 0 ? 'var(--icon-color-green)' : '#ef4444' }">
                    {{ formatCurrency(netCashChange, currencyCode, locale) }}
                  </span>
                </div>

                <div
                  class="flex justify-between items-center px-3 py-2 rounded-md"
                  :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
                >
                  <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Cash at beginning of period</span>
                  <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">
                    {{ formatCurrency(beginningCash, currencyCode, locale) }}
                  </span>
                </div>

                <div
                  class="flex justify-between items-center px-3 py-2 rounded-md"
                  :style="{ background: 'var(--info-bg)', border: '1px solid var(--focus-ring)' }"
                >
                  <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">Cash at end of period</span>
                  <span class="text-base font-bold" :style="{ color: 'var(--focus-ring)' }">
                    {{ formatCurrency(endingCash, currencyCode, locale) }}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </section>

      </main>
    </div>

</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import StatsCard from '@/layout/StatsCard.vue'
import { ArrowLeft, Download } from 'lucide-vue-next'
import { getDefaultCompany } from '@/services/api'
import { getCashFlowReport } from '@/composables/reports'
import { getBeginningCashBalance } from '@/composables/shift'
import { formatCurrency } from '@/utils/formatters.js'
import { useSettingsStore } from '@/stores/settings'
import CashFlowFilters from '@/pages/reports/CashFlowFilters.vue'

const router        = useRouter()
const settingsStore = useSettingsStore()
const currencyCode  = settingsStore?.settings?.store?.currencyCode || 'USD'
const locale        = settingsStore?.settings?.store?.local        || 'en-US'

const operatingActivities = ref([])
const investingActivities = ref([])
const financingActivities = ref([])
const beginningCash       = ref(0)
const loading             = ref(false)

const totalOperating = computed(() => operatingActivities.value.reduce((s, i) => s + (i.amount || 0), 0))
const totalInvesting = computed(() => investingActivities.value.reduce((s, i) => s + (i.amount || 0), 0))
const totalFinancing = computed(() => financingActivities.value.reduce((s, i) => s + (i.amount || 0), 0))
const netCashChange  = computed(() => totalOperating.value + totalInvesting.value + totalFinancing.value)
const endingCash     = computed(() => beginningCash.value + netCashChange.value)

const goBack       = () => router.back()
const exportReport = () => console.log('Exporting...')

const handleApplyFilters = async (filters) => {
  if (!filters) return
  loading.value = true
  try {
    await Promise.all([fetchOpeningBalance(filters), fetchCashFlow(filters)])
  } catch (err) {
    console.error('Error applying filters:', err)
  } finally {
    loading.value = false
  }
}

const fetchCashFlow = async (filters) => {
  const res = await getCashFlowReport(filters)
  operatingActivities.value = res.operating || []
  investingActivities.value = res.investing  || []
  financingActivities.value = res.financing  || []
}

const fetchOpeningBalance = async (filters) => {
  const res = await getBeginningCashBalance(filters)
  beginningCash.value = res.beginning_balance || 0
}

onMounted(async () => {
  try {
    const defaultCompany = await getDefaultCompany()
    await handleApplyFilters({
      company:          defaultCompany || 'pos',
      filter_based_on:  'Fiscal Year',
      from_fiscal_year: new Date().getFullYear().toString(),
      to_fiscal_year:   new Date().getFullYear().toString(),
      periodicity:      'Yearly',
      accumulated_values: false,
    })
  } catch (err) {
    console.error('Error during initialization:', err)
  }
})
</script>
