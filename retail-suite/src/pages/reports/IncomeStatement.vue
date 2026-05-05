<!-- Reports/IncomeStatement.vue -->
<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header with Back Button -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft class="w-6 h-6 text-gray-600" />
              </button>
              <h1 class="text-lg font-bold text-gray-900">Income Statement</h1>
            </div>
            <div class="flex gap-2">
              <select
                v-model="selectedPeriod"
                @change="loadReport"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">This Month</option>
                <option value="quarterly">This Quarter</option>
                <option value="yearly">This Year</option>
              </select>
              <button
                @click="exportReport"
                :disabled="loading"
                class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <Download class="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading Income Statement...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex-1 px-6 py-8">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <p class="text-red-800 font-semibold">Error Loading Report</p>
            <p class="text-red-600 text-sm mt-2">{{ error }}</p>
            <button
              @click="loadReport"
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <section v-else class="flex-1 px-6 py-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <!-- Title -->
            <div class="mb-8 border-b-2 border-gray-200 pb-6">
              <h2 class="text-3xl font-bold text-gray-900">Income Statement</h2>
              <p class="text-gray-600 mt-1">
                For the period of {{ periodLabel }}
                <span v-if="reportData.period" class="text-sm text-gray-500 ml-2">
                  ({{ formatDate(reportData.period.start_date) }} to {{ formatDate(reportData.period.end_date) }})
                </span>
              </p>
            </div>

            <!-- Income Section -->
            <div v-if="incomeFlatted.length > 0" class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp class="w-6 h-6 text-green-600" />
                Revenue
              </h3>
              <div class="space-y-0 ml-4 border border-gray-200 rounded-lg overflow-hidden">
                <div
                  v-for="item in incomeFlatted"
                  :key="item.account"
                  class="border-b border-gray-100 last:border-b-0 transition"
                  :class="{
                    'bg-green-100 hover:bg-green-150': item.level === 0,
                    'bg-yellow-50 hover:bg-yellow-100': item.level > 0
                  }"
                >
                  <div
                    class="flex items-center justify-between px-4 py-3"
                    :class="{ 'cursor-pointer': item.hasChildren }"
                    @click="item.hasChildren && toggleAccount(item.account)"
                    :style="{ paddingLeft: `${(item.level || 0) * 32 + 16}px` }"
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <!-- Collapse/Expand Icon -->
                      <div v-if="item.hasChildren" class="w-5 flex-shrink-0">
                        <ChevronRight
                          :class="[
                            'w-5 h-5 text-gray-500 transition-transform',
                            expandedAccounts.includes(item.account) ? 'rotate-90' : ''
                          ]"
                        />
                      </div>
                      <div v-else class="w-5 flex-shrink-0"></div>

                      <!-- Account Name -->
                      <span
                        class="text-gray-700"
                        :class="{ 'font-bold': item.hasChildren, 'font-medium': !item.hasChildren }"
                      >
                        {{ item.account_name || item.account }}
                      </span>
                    </div>
                    <!-- Amount -->
                    <span class="font-semibold text-gray-900 ml-4">
                      {{ formatCurrency(item.total || 0) }}
                    </span>
                  </div>
                </div>

                <!-- Total Income Row -->
                <div class="flex items-center justify-between px-4 py-3 font-bold text-lg bg-green-50">
                  <span>Total Revenue</span>
                  <span class="text-green-600">{{ formatCurrency(reportData.summary?.total_income || 0) }}</span>
                </div>
              </div>
            </div>

            <!-- Expenses Section -->
            <div v-if="expenseFlatted.length > 0" class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown class="w-6 h-6 text-red-600" />
                Operating Expenses
              </h3>
              <div class="space-y-0 ml-4 border border-gray-200 rounded-lg overflow-hidden">
                <div
                  v-for="item in expenseFlatted"
                  :key="item.account"
                  class="border-b border-gray-100 last:border-b-0 transition"
                  :class="{
                    'bg-red-100 hover:bg-red-150': item.level === 0,
                    'bg-orange-50 hover:bg-orange-100': item.level > 0
                  }"
                >
                  <div
                    class="flex items-center justify-between px-4 py-3"
                    :class="{ 'cursor-pointer': item.hasChildren }"
                    @click="item.hasChildren && toggleAccount(item.account)"
                    :style="{ paddingLeft: `${(item.level || 0) * 32 + 16}px` }"
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <!-- Collapse/Expand Icon -->
                      <div v-if="item.hasChildren" class="w-5 flex-shrink-0">
                        <ChevronRight
                          :class="[
                            'w-5 h-5 text-gray-500 transition-transform',
                            expandedAccounts.includes(item.account) ? 'rotate-90' : ''
                          ]"
                        />
                      </div>
                      <div v-else class="w-5 flex-shrink-0"></div>

                      <!-- Account Name -->
                      <span
                        class="text-gray-700"
                        :class="{ 'font-bold': item.hasChildren, 'font-medium': !item.hasChildren }"
                      >
                        {{ item.account_name || item.account }}
                      </span>
                    </div>
                    <!-- Amount -->
                    <span class="font-semibold text-gray-900 ml-4">
                      {{ formatCurrency(Math.abs(item.total || 0)) }}
                    </span>
                  </div>
                </div>

                <!-- Total Expenses Row -->
                <div class="flex items-center justify-between px-4 py-3 font-bold text-lg bg-red-50">
                  <span>Total Expenses</span>
                  <span class="text-red-600">{{ formatCurrency(reportData.summary?.total_expenses || 0) }}</span>
                </div>
              </div>
            </div>

            <!-- Summary Section -->
            <div class="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-blue-200">
                  <span class="font-semibold text-gray-900">Gross Profit</span>
                  <span class="text-lg font-bold text-blue-600">{{ formatCurrency(grossProfit) }}</span>
                </div>
                <div class="flex justify-between items-center pb-3 border-b border-blue-200">
                  <span class="font-semibold text-gray-900">Operating Income</span>
                  <span class="text-lg font-bold text-blue-600">{{ formatCurrency(operatingIncome) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xl font-bold text-gray-900">Net Income</span>
                  <span
                    class="text-2xl font-bold"
                    :class="netIncome >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ formatCurrency(netIncome) }}
                  </span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-blue-200">
                  <span class="font-semibold text-gray-900">Profit Margin</span>
                  <span class="text-lg font-bold text-blue-600">{{ profitMargin.toFixed(2) }}%</span>
                </div>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p class="text-sm text-gray-600 mb-1">Expense Ratio</p>
                <p class="text-3xl font-bold text-green-600">{{ (reportData.summary?.expense_ratio || 0).toFixed(1) }}%</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p class="text-sm text-gray-600 mb-1">Monthly Average</p>
                <p class="text-3xl font-bold text-blue-600">{{ formatCurrency(monthlyAverage) }}</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p class="text-sm text-gray-600 mb-1">Profit Margin</p>
                <p class="text-3xl font-bold text-purple-600">{{ profitMargin.toFixed(1) }}%</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import { ArrowLeft, Download, TrendingUp, TrendingDown, ChevronRight } from 'lucide-vue-next'
import {
  getIncomeStatementYearly,
  getIncomeStatementMonthly,
  getIncomeStatementByPeriod
} from '@/services/api'

  const router = useRouter()
  const selectedPeriod = ref('yearly')
  const loading = ref(false)
  const error = ref(null)
  const expandedAccounts = ref(['Income - P', 'Expenses - P'])

  const reportData = ref({
    summary: {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0,
      profit_margin: 0,
      expense_ratio: 0
    },
    data: [],
    period: {
      start_date: '',
      end_date: ''
    }
  })

  // Build account tree from flat data
  const buildAccountTree = (accounts) => {
    const map = {}
    const tree = []

    // Create map
    accounts.forEach(account => {
      if (account.account) {
        map[account.account] = { ...account, children: [] }
      }
    })

    // Link children to parents
    accounts.forEach(account => {
      if (account.parent_account && map[account.parent_account]) {
        map[account.parent_account].children.push(map[account.account])
      } else if (account.account) {
        tree.push(map[account.account])
      }
    })

    return tree
  }

  // Flatten tree with visibility logic - RECURSIVE
  const flattenAccountTree = (tree, expandedSet = [], level = 0) => {
    const result = []

    const traverse = (items, currentLevel = 0) => {
      items.forEach(item => {
        result.push({
          ...item,
          level: currentLevel,
          hasChildren: item.children && item.children.length > 0,
          isExpanded: expandedSet.includes(item.account)
        })

        // Show children only if parent is expanded
        if (item.children && item.children.length > 0 && expandedSet.includes(item.account)) {
          traverse(item.children, currentLevel + 1)
        }
      })
    }

    traverse(tree, level)
    return result
  }

  // Get all parent accounts to include their parents too
// Get all accounts in the hierarchy (parents + all descendants)
  const getAccountHierarchy = (accounts, isIncome) => {
    // First find root accounts based on name
    const rootAccounts = accounts.filter(row => {
      const name = row.account_name || ''
      if (isIncome) {
        return (name.includes('Income') || name.includes('Sales')) &&
                !name.includes('Total') &&
                row.account &&
                !row.parent_account // Root level only
      } else {
        return (name.includes('Expense') || name.includes('Cost of')) &&
                !name.includes('Total') &&
                row.account &&
                !row.parent_account // Root level only
      }
    })

    const allAccounts = new Set()

    // Helper to add all descendants recursively
    const addDescendants = (accountKey) => {
      allAccounts.add(accountKey)
      const children = accounts.filter(a => a.parent_account === accountKey)
      children.forEach(child => {
        if (child.account) {
          addDescendants(child.account)
        }
      })
    }

    // Helper to add all parents up to root
    const addParents = (accountKey) => {
      const account = accounts.find(a => a.account === accountKey)
      if (account) {
        allAccounts.add(accountKey)
        if (account.parent_account) {
          addParents(account.parent_account)
        }
      }
    }

    // Start from root accounts and add all their descendants
    rootAccounts.forEach(root => {
      if (root.account) {
        addDescendants(root.account)
      }
    })

    // Also add any accounts that might be in the middle of the tree
    // but have the keyword in their name
    accounts.forEach(acc => {
      const name = acc.account_name || ''
      const hasKeyword = isIncome
        ? (name.includes('Income') || name.includes('Sales'))
        : (name.includes('Expense') || name.includes('Cost of'))

      if (hasKeyword && !name.includes('Total') && acc.account) {
        addDescendants(acc.account)
        addParents(acc.account)
      }
    })

    // Return all accounts in the hierarchy
    return accounts.filter(row => allAccounts.has(row.account))
  }
  // Filter and build income tree
  const incomeTree = computed(() => {
    const accounts = getAccountHierarchy(reportData.value.data || [], true)
    return buildAccountTree(accounts)
  })

  const incomeFlatted = computed(() => {
    return flattenAccountTree(incomeTree.value, expandedAccounts.value)
  })

  // Filter and build expense tree
  const expenseTree = computed(() => {
    const accounts = getAccountHierarchy(reportData.value.data || [], false)
    return buildAccountTree(accounts)
  })

  const expenseFlatted = computed(() => {
    return flattenAccountTree(expenseTree.value, expandedAccounts.value)
  })

  const getReportData = async () => {
    loading.value = true
    error.value = null

    try {
      let result

      switch (selectedPeriod.value) {
        case 'monthly':
          result = await getIncomeStatementMonthly()
          break
        case 'quarterly':
          const today = new Date()
          const quarter = Math.floor(today.getMonth() / 3)
          const startDate = new Date(today.getFullYear(), quarter * 3, 1)
          const endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0)

          result = await getIncomeStatementByPeriod({
            company: 'pos',
            from_date: startDate.toISOString().split('T')[0],
            to_date: endDate.toISOString().split('T')[0]
          })
          break
        case 'yearly':
        default:
          result = await getIncomeStatementYearly()
      }

      if (result?.status === 'success') {
        reportData.value = result
      } else {
        error.value = 'Failed to load report data'
      }
    } catch (err) {
      error.value = err.message || 'Error loading report'
      console.error('Error loading income statement:', err)
    } finally {
      loading.value = false
    }
  }

  const totalRevenue = computed(() => reportData.value.summary?.total_income || 0)
  const totalExpenses = computed(() => reportData.value.summary?.total_expenses || 0)
  const grossProfit = computed(() => totalRevenue.value - totalExpenses.value)
  const operatingIncome = computed(() => grossProfit.value)
  const netIncome = computed(() => reportData.value.summary?.net_profit || 0)

  const profitMargin = computed(() => {
    if (totalRevenue.value === 0) return 0
    return (netIncome.value / totalRevenue.value) * 100
  })

  const monthlyAverage = computed(() => netIncome.value / 12)

  const periodLabel = computed(() => {
    const labels = {
      monthly: 'Current Month',
      quarterly: 'Current Quarter',
      yearly: 'Current Year'
    }
    return labels[selectedPeriod.value]
  })

  const toggleAccount = (accountKey) => {
    const index = expandedAccounts.value.indexOf(accountKey)
    if (index > -1) {
      // Collapse
      expandedAccounts.value.splice(index, 1)
    } else {
      // Expand + auto-expand parent chain
      expandedAccounts.value.push(accountKey)

      // Find and expand parent chain
      const allData = reportData.value.data || []
      const accountData = allData.find(a => a.account === accountKey)

      if (accountData && accountData.parent_account) {
        let currentParent = accountData.parent_account
        while (currentParent) {
          if (!expandedAccounts.value.includes(currentParent)) {
            expandedAccounts.value.push(currentParent)
          }
          const parentData = allData.find(a => a.account === currentParent)
          currentParent = parentData?.parent_account
        }
      }
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const loadReport = async () => {
    await getReportData()
  }

  const goBack = () => {
    router.back()
  }

  const exportReport = () => {
    console.log('Exporting Income Statement...')
  }

  onMounted(() => {
    getReportData()
  })


</script>
