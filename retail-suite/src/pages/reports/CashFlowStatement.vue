<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft class="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 class="text-lg font-bold text-gray-900">Cash Flow Statement</h1>
                <p class="text-gray-500 text-sm mt-0.5">Financial position overview</p>
              </div>
            </div>
            <button
              @click="exportReport"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Download class="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <!-- Key Metrics -->
        <section class="px-6 py-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Operating Cash Flow</p>
              <p class="text-2xl font-bold text-green-900 mt-1.5">{{ formatCurrency(totalOperating, currencyCode, locale) }}</p>
              <p class="text-xs text-green-600 mt-1.5">Current period</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Investing Activities</p>
              <p class="text-2xl font-bold text-blue-900 mt-1.5">{{ formatCurrency(Math.abs(totalInvesting), currencyCode, locale) }}</p>
              <p class="text-xs text-blue-600 mt-1.5">Asset purchases</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Financing Activities</p>
              <p class="text-2xl font-bold text-purple-900 mt-1.5">{{ formatCurrency(Math.abs(totalFinancing), currencyCode, locale) }}</p>
              <p class="text-xs text-purple-600 mt-1.5">Debt & equity</p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-orange-600 uppercase tracking-wide">Net Cash Change</p>
              <p class="text-2xl font-bold text-orange-900 mt-1.5">{{ formatCurrency(netCashChange, currencyCode, locale) }}</p>
              <p class="text-xs text-orange-600 mt-1.5">Balance change</p>
            </div>
          </div>
        </section>

        <!-- Filters -->
        <section class="px-6 pb-4">
          <CashFlowFilters @apply-filters="handleApplyFilters" />
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Content -->
        <section v-else class="flex-1 px-6 pb-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            <!-- Operating Activities -->
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-sm">💼</span>
                Operating Activities
              </h2>
              <div class="space-y-2">
                <div v-if="operatingActivities.length === 0" class="text-gray-400 text-sm italic py-3">
                  No operating activities found
                </div>
                <div
                  v-for="(item, index) in operatingActivities"
                  :key="index"
                  class="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ item.description }}</p>
                  </div>
                  <span :class="['text-sm font-bold', item.amount >= 0 ? 'text-green-600' : 'text-red-500']">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center mt-4 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                <span class="text-sm font-bold text-gray-700">Net Cash from Operating</span>
                <span class="text-sm font-bold text-green-700">{{ formatCurrency(totalOperating, currencyCode, locale) }}</span>
              </div>
            </div>

            <!-- Investing Activities -->
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">📊</span>
                Investing Activities
              </h2>
              <div class="space-y-2">
                <div v-if="investingActivities.length === 0" class="text-gray-400 text-sm italic py-3">
                  No investing activities found
                </div>
                <div
                  v-for="(item, index) in investingActivities"
                  :key="index"
                  class="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ item.description }}</p>
                  </div>
                  <span :class="['text-sm font-bold', item.amount >= 0 ? 'text-green-600' : 'text-red-500']">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center mt-4 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                <span class="text-sm font-bold text-gray-700">Net Cash from Investing</span>
                <span class="text-sm font-bold text-blue-700">{{ formatCurrency(totalInvesting, currencyCode, locale) }}</span>
              </div>
            </div>

            <!-- Financing Activities -->
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-sm">🏦</span>
                Financing Activities
              </h2>
              <div class="space-y-2">
                <div v-if="financingActivities.length === 0" class="text-gray-400 text-sm italic py-3">
                  No financing activities found
                </div>
                <div
                  v-for="(item, index) in financingActivities"
                  :key="index"
                  class="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ item.description }}</p>
                  </div>
                  <span :class="['text-sm font-bold', item.amount >= 0 ? 'text-green-600' : 'text-red-500']">
                    {{ item.amount >= 0 ? '+' : '' }}{{ formatCurrency(item.amount, currencyCode, locale) }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center mt-4 px-4 py-3 bg-purple-50 rounded-xl border border-purple-100">
                <span class="text-sm font-bold text-gray-700">Net Cash from Financing</span>
                <span class="text-sm font-bold text-purple-700">{{ formatCurrency(totalFinancing, currencyCode, locale) }}</span>
              </div>
            </div>

            <!-- Summary -->
            <div class="p-6 bg-gray-50">
              <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Summary</h2>
              <div class="space-y-2.5">
                <div class="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <span class="text-sm font-semibold text-gray-700">Net increase in cash</span>
                  <span class="text-sm font-bold" :class="netCashChange >= 0 ? 'text-green-600' : 'text-red-500'">
                    {{ formatCurrency(netCashChange, currencyCode, locale) }}
                  </span>
                </div>
                <div class="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-200">
                  <span class="text-sm font-semibold text-gray-700">Cash at beginning of period</span>
                  <span class="text-sm font-bold text-gray-900">{{ formatCurrency(beginningCash, currencyCode, locale) }}</span>
                </div>
                <div class="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span class="text-sm font-bold text-gray-900">Cash at end of period</span>
                  <span class="text-lg font-bold text-blue-700">{{ formatCurrency(endingCash, currencyCode, locale) }}</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import { ArrowLeft, Download } from 'lucide-vue-next'
import { getCashFlowReport, getBeginningCashBalance, getDefaultCompany } from '@/services/api'
import { formatCurrency } from '@/utils/formatters.js'
import { useSettingsStore } from '@/stores/settings'
import CashFlowFilters from '@/pages/reports/CashFlowFilters.vue'


    const router = useRouter()
    const settingsStore = useSettingsStore()
    const currencyCode = settingsStore?.settings?.store?.currencyCode || 'USD'
    const locale       = settingsStore?.settings?.store?.local || 'en-US'

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

    const goBack = () => router.back()
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
          company: defaultCompany || 'pos',
          filter_based_on: 'Fiscal Year',
          from_fiscal_year: new Date().getFullYear().toString(),
          to_fiscal_year: new Date().getFullYear().toString(),
          periodicity: 'Yearly',
          accumulated_values: false,
        })
      } catch (err) {
        console.error('Error during initialization:', err)
      }
    })
</script>
