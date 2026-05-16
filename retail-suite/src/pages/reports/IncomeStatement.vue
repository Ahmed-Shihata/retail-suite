<!-- Reports/IncomeStatement.vue -->
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
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Income Statement</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ periodLabel }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <select
                v-model="selectedPeriod"
                @change="loadReport"
                class="px-2 py-1.5 text-xs rounded-md focus:outline-none"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
              </select>
              <button
                @click="exportReport"
                :disabled="loading"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                :style="{ background: 'var(--icon-color-green)' }"
              >
                <Download class="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        </header>

        <!-- ══════════════════ KEY METRICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Key Metrics
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <StatsCard title="Expense Ratio"    :value="`${(reportData.summary?.expense_ratio || 0).toFixed(1)}%`" icon="BarChart2"   color="green"  />
              <StatsCard title="Monthly Average"  :value="formatCurrency(monthlyAverage)"                            icon="TrendingUp" color="blue"   />
              <StatsCard title="Profit Margin"    :value="`${profitMargin.toFixed(1)}%`"                             icon="DollarSign" color="purple" />
            </div>
          </div>
        </section>

        <!-- ══════════════════ LOADING ══════════════════ -->
        <div v-if="loading" class="flex-1 flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Loading Income Statement...</p>
          </div>
        </div>

        <!-- ══════════════════ ERROR ══════════════════ -->
        <div v-else-if="error" class="px-3 pt-3">
          <div
            class="rounded-lg p-4"
            :style="{ background: '#fef2f2', border: '1px solid #fecaca' }"
          >
            <p class="text-xs font-semibold" style="color: #991b1b;">Error Loading Report</p>
            <p class="text-xs mt-1" style="color: #dc2626;">{{ error }}</p>
            <button
              @click="loadReport"
              class="mt-3 px-3 py-1.5 text-white text-xs rounded-md transition-colors"
              style="background: #dc2626;"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- ══════════════════ MAIN CONTENT ══════════════════ -->
        <section v-else class="px-3 pt-3 pb-6">
          <div
            class="rounded-lg shadow-sm p-4"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >

            <!-- Report Title -->
            <div class="mb-4 pb-3" :style="{ borderBottom: '2px solid var(--card-border)' }">
              <h2 class="text-base font-bold" :style="{ color: 'var(--text-main)' }">Income Statement</h2>
              <p class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">
                For the period of {{ periodLabel }}
                <span v-if="reportData.period" class="ml-1">
                  ({{ formatDate(reportData.period.start_date) }} to {{ formatDate(reportData.period.end_date) }})
                </span>
              </p>
            </div>

            <!-- ── Revenue ── -->
            <div v-if="incomeFlatted.length > 0" class="mb-4">
              <h3 class="text-xs font-bold mb-2 flex items-center gap-1.5" :style="{ color: 'var(--text-main)' }">
                <TrendingUp class="w-3.5 h-3.5" :style="{ color: 'var(--icon-color-green)' }" />
                Revenue
              </h3>
              <div
                class="rounded-md overflow-hidden"
                :style="{ border: '1px solid var(--card-border)' }"
              >
                <div
                  v-for="item in incomeFlatted"
                  :key="item.account"
                  :style="{
                    background: item.level === 0 ? 'var(--icon-bg-green)' : 'var(--item-bg)',
                    borderBottom: '1px solid var(--card-border)'
                  }"
                >
                  <div
                    class="flex items-center justify-between py-2 pr-3 transition-colors"
                    :class="{ 'cursor-pointer': item.hasChildren }"
                    :style="{ paddingLeft: `${(item.level || 0) * 24 + 12}px` }"
                    @click="item.hasChildren && toggleAccount(item.account)"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <div class="flex items-center gap-1.5 flex-1">
                      <div v-if="item.hasChildren" class="w-4 flex-shrink-0">
                        <ChevronRight
                          class="w-3.5 h-3.5 transition-transform"
                          :class="expandedAccounts.includes(item.account) ? 'rotate-90' : ''"
                          :style="{ color: 'var(--text-muted)' }"
                        />
                      </div>
                      <div v-else class="w-4 flex-shrink-0" />
                      <span
                        class="text-xs"
                        :class="item.hasChildren ? 'font-bold' : 'font-medium'"
                        :style="{ color: 'var(--text-sub)' }"
                      >
                        {{ item.account_name || item.account }}
                      </span>
                    </div>
                    <span class="text-xs font-semibold ml-4" :style="{ color: 'var(--text-main)' }">
                      {{ formatCurrency(item.total || 0) }}
                    </span>
                  </div>
                </div>

                <!-- Total Revenue -->
                <div
                  class="flex items-center justify-between px-3 py-2 font-bold"
                  :style="{ background: 'var(--icon-bg-green)', borderTop: '1px solid var(--icon-color-green)' }"
                >
                  <span class="text-xs" :style="{ color: 'var(--text-main)' }">Total Revenue</span>
                  <span class="text-xs" :style="{ color: 'var(--icon-color-green)' }">
                    {{ formatCurrency(reportData.summary?.total_income || 0) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ── Operating Expenses ── -->
            <div v-if="expenseFlatted.length > 0" class="mb-4">
              <h3 class="text-xs font-bold mb-2 flex items-center gap-1.5" :style="{ color: 'var(--text-main)' }">
                <TrendingDown class="w-3.5 h-3.5" style="color: #ef4444;" />
                Operating Expenses
              </h3>
              <div
                class="rounded-md overflow-hidden"
                :style="{ border: '1px solid var(--card-border)' }"
              >
                <div
                  v-for="item in expenseFlatted"
                  :key="item.account"
                  :style="{
                    background: item.level === 0 ? '#fef2f2' : 'var(--item-bg)',
                    borderBottom: '1px solid var(--card-border)'
                  }"
                >
                  <div
                    class="flex items-center justify-between py-2 pr-3 transition-colors"
                    :class="{ 'cursor-pointer': item.hasChildren }"
                    :style="{ paddingLeft: `${(item.level || 0) * 24 + 12}px` }"
                    @click="item.hasChildren && toggleAccount(item.account)"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <div class="flex items-center gap-1.5 flex-1">
                      <div v-if="item.hasChildren" class="w-4 flex-shrink-0">
                        <ChevronRight
                          class="w-3.5 h-3.5 transition-transform"
                          :class="expandedAccounts.includes(item.account) ? 'rotate-90' : ''"
                          :style="{ color: 'var(--text-muted)' }"
                        />
                      </div>
                      <div v-else class="w-4 flex-shrink-0" />
                      <span
                        class="text-xs"
                        :class="item.hasChildren ? 'font-bold' : 'font-medium'"
                        :style="{ color: 'var(--text-sub)' }"
                      >
                        {{ item.account_name || item.account }}
                      </span>
                    </div>
                    <span class="text-xs font-semibold ml-4" :style="{ color: 'var(--text-main)' }">
                      {{ formatCurrency(Math.abs(item.total || 0)) }}
                    </span>
                  </div>
                </div>

                <!-- Total Expenses -->
                <div
                  class="flex items-center justify-between px-3 py-2 font-bold"
                  style="background: #fef2f2; border-top: 1px solid #fca5a5;"
                >
                  <span class="text-xs" :style="{ color: 'var(--text-main)' }">Total Expenses</span>
                  <span class="text-xs" style="color: #ef4444;">
                    {{ formatCurrency(reportData.summary?.total_expenses || 0) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ── Summary ── -->
            <div
              class="rounded-md p-4"
              :style="{ background: 'var(--info-bg)', border: '2px solid var(--focus-ring)' }"
            >
              <div class="space-y-2.5">
                <div
                  class="flex justify-between items-center pb-2"
                  :style="{ borderBottom: '1px solid var(--info-border)' }"
                >
                  <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Gross Profit</span>
                  <span class="text-xs font-bold" :style="{ color: 'var(--focus-ring)' }">{{ formatCurrency(grossProfit) }}</span>
                </div>
                <div
                  class="flex justify-between items-center pb-2"
                  :style="{ borderBottom: '1px solid var(--info-border)' }"
                >
                  <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Operating Income</span>
                  <span class="text-xs font-bold" :style="{ color: 'var(--focus-ring)' }">{{ formatCurrency(operatingIncome) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Net Income</span>
                  <span
                    class="text-base font-bold"
                    :style="{ color: netIncome >= 0 ? 'var(--icon-color-green)' : '#ef4444' }"
                  >
                    {{ formatCurrency(netIncome) }}
                  </span>
                </div>
                <div
                  class="flex justify-between items-center pt-2"
                  :style="{ borderTop: '1px solid var(--info-border)' }"
                >
                  <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Profit Margin</span>
                  <span class="text-xs font-bold" :style="{ color: 'var(--focus-ring)' }">{{ profitMargin.toFixed(2) }}%</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import StatsCard from '@/layout/StatsCard.vue'
import { ArrowLeft, Download, TrendingUp, TrendingDown, ChevronRight } from 'lucide-vue-next'
import {
  getIncomeStatementYearly,
  getIncomeStatementMonthly,
  getIncomeStatementByPeriod,
} from '@/services/api'

const router         = useRouter()
const selectedPeriod = ref('yearly')
const loading        = ref(false)
const error          = ref(null)
const expandedAccounts = ref(['Income - P', 'Expenses - P'])

const reportData = ref({
  summary: { total_income: 0, total_expenses: 0, net_profit: 0, profit_margin: 0, expense_ratio: 0 },
  data: [],
  period: { start_date: '', end_date: '' },
})

// ── Tree helpers ──────────────────────────────────────
const buildAccountTree = (accounts) => {
  const map = {}
  const tree = []
  accounts.forEach(a => { if (a.account) map[a.account] = { ...a, children: [] } })
  accounts.forEach(a => {
    if (a.parent_account && map[a.parent_account]) map[a.parent_account].children.push(map[a.account])
    else if (a.account) tree.push(map[a.account])
  })
  return tree
}

const flattenAccountTree = (tree, expandedSet = [], level = 0) => {
  const result = []
  const traverse = (items, currentLevel = 0) => {
    items.forEach(item => {
      result.push({ ...item, level: currentLevel, hasChildren: !!(item.children?.length), isExpanded: expandedSet.includes(item.account) })
      if (item.children?.length && expandedSet.includes(item.account)) traverse(item.children, currentLevel + 1)
    })
  }
  traverse(tree, level)
  return result
}

const getAccountHierarchy = (accounts, isIncome) => {
  const rootAccounts = accounts.filter(row => {
    const name = row.account_name || ''
    return isIncome
      ? (name.includes('Income') || name.includes('Sales')) && !name.includes('Total') && row.account && !row.parent_account
      : (name.includes('Expense') || name.includes('Cost of')) && !name.includes('Total') && row.account && !row.parent_account
  })
  const allAccounts = new Set()
  const addDescendants = (key) => {
    allAccounts.add(key)
    accounts.filter(a => a.parent_account === key).forEach(c => { if (c.account) addDescendants(c.account) })
  }
  const addParents = (key) => {
    const acc = accounts.find(a => a.account === key)
    if (acc) { allAccounts.add(key); if (acc.parent_account) addParents(acc.parent_account) }
  }
  rootAccounts.forEach(r => { if (r.account) addDescendants(r.account) })
  accounts.forEach(acc => {
    const name = acc.account_name || ''
    const hasKeyword = isIncome ? (name.includes('Income') || name.includes('Sales')) : (name.includes('Expense') || name.includes('Cost of'))
    if (hasKeyword && !name.includes('Total') && acc.account) { addDescendants(acc.account); addParents(acc.account) }
  })
  return accounts.filter(row => allAccounts.has(row.account))
}

const incomeTree   = computed(() => buildAccountTree(getAccountHierarchy(reportData.value.data || [], true)))
const incomeFlatted = computed(() => flattenAccountTree(incomeTree.value, expandedAccounts.value))
const expenseTree  = computed(() => buildAccountTree(getAccountHierarchy(reportData.value.data || [], false)))
const expenseFlatted = computed(() => flattenAccountTree(expenseTree.value, expandedAccounts.value))

// ── Computed ──────────────────────────────────────────
const totalRevenue    = computed(() => reportData.value.summary?.total_income   || 0)
const totalExpenses   = computed(() => reportData.value.summary?.total_expenses || 0)
const grossProfit     = computed(() => totalRevenue.value - totalExpenses.value)
const operatingIncome = computed(() => grossProfit.value)
const netIncome       = computed(() => reportData.value.summary?.net_profit     || 0)
const profitMargin    = computed(() => totalRevenue.value === 0 ? 0 : (netIncome.value / totalRevenue.value) * 100)
const monthlyAverage  = computed(() => netIncome.value / 12)
const periodLabel     = computed(() => ({ monthly: 'Current Month', quarterly: 'Current Quarter', yearly: 'Current Year' })[selectedPeriod.value])

// ── Actions ───────────────────────────────────────────
const toggleAccount = (accountKey) => {
  const idx = expandedAccounts.value.indexOf(accountKey)
  if (idx > -1) {
    expandedAccounts.value.splice(idx, 1)
  } else {
    expandedAccounts.value.push(accountKey)
    const allData = reportData.value.data || []
    const acc = allData.find(a => a.account === accountKey)
    if (acc?.parent_account) {
      let cur = acc.parent_account
      while (cur) {
        if (!expandedAccounts.value.includes(cur)) expandedAccounts.value.push(cur)
        cur = allData.find(a => a.account === cur)?.parent_account
      }
    }
  }
}

const getReportData = async () => {
  loading.value = true; error.value = null
  try {
    let result
    if (selectedPeriod.value === 'monthly') {
      result = await getIncomeStatementMonthly()
    } else if (selectedPeriod.value === 'quarterly') {
      const today = new Date()
      const q = Math.floor(today.getMonth() / 3)
      result = await getIncomeStatementByPeriod({
        company:   'pos',
        from_date: new Date(today.getFullYear(), q * 3, 1).toISOString().split('T')[0],
        to_date:   new Date(today.getFullYear(), (q + 1) * 3, 0).toISOString().split('T')[0],
      })
    } else {
      result = await getIncomeStatementYearly()
    }
    if (result?.status === 'success') reportData.value = result
    else error.value = 'Failed to load report data'
  } catch (err) {
    error.value = err.message || 'Error loading report'
    console.error('Error loading income statement:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const loadReport   = async () => { await getReportData() }
const goBack       = () => router.back()
const exportReport = () => console.log('Exporting Income Statement...')

onMounted(() => { getReportData() })
</script>
