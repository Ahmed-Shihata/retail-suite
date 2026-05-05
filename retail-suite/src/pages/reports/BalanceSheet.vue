<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft class="w-6 h-6 text-gray-600" />
              </button>
              <h1 class="text-lg font-bold text-gray-900">Balance Sheet</h1>
            </div>
            <button @click="exportReport" class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              <Download class="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading Balance Sheet...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex-1 px-6 py-8">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <p class="text-red-800 font-semibold">Error Loading Report</p>
            <p class="text-red-600 text-sm mt-2">{{ error }}</p>
            <button @click="loadReport" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Try Again
            </button>
          </div>
        </div>

        <!-- Key Metrics -->
        <section v-else class="px-6 py-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm border border-blue-200">
              <p class="text-sm text-gray-600 mb-2">Total Assets</p>
              <p class="text-3xl font-bold text-blue-600">${{ formatNumber(totals.total_assets) }}</p>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-sm border border-red-200">
              <p class="text-sm text-gray-600 mb-2">Total Liabilities</p>
              <p class="text-3xl font-bold text-red-600">${{ formatNumber(totals.total_liabilities) }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200">
              <p class="text-sm text-gray-600 mb-2">Total Equity</p>
              <p class="text-3xl font-bold text-green-600">${{ formatNumber(totals.total_equity) }}</p>
            </div>
          </div>
        </section>

        <!-- Content -->
        <section v-if="!loading && !error" class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Assets Column -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Assets</h2>
              </div>
              <div class="p-6 space-y-2 max-h-96 overflow-y-auto">
                <div v-for="asset in assetsFlatted" :key="asset.account"
                     class="flex items-center justify-between p-3 rounded hover:bg-blue-50 transition"
                     :style="{ paddingLeft: `${(asset.level || 0) * 24 + 12}px` }">
                  <div class="flex items-center gap-2 flex-1">
                    <!-- Expand/Collapse Button -->
                    <button v-if="asset.hasChildren"
                            @click="toggleAccount(asset.account)"
                            class="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded">
                      <ChevronRight :class="['w-4 h-4 transition-transform', expandedAccounts.includes(asset.account) ? 'rotate-90' : '']" />
                    </button>
                    <div v-else class="w-5"></div>

                    <!-- Account Name -->
                    <span :class="['text-gray-700', { 'font-bold text-blue-600': asset.hasChildren, 'font-medium': !asset.hasChildren }]">
                      {{ asset.account_name || asset.account }}
                    </span>
                  </div>
                  <!-- Amount -->
                  <span class="font-semibold text-gray-900 ml-4">${{ formatNumber(asset.total || 0) }}</span>
                </div>

                <!-- Total Assets -->
                <div class="flex items-center justify-between p-3 font-bold text-lg bg-blue-50 rounded mt-4 border-t-2 border-blue-200">
                  <span>Total Assets</span>
                  <span class="text-blue-600">${{ formatNumber(totals.total_assets) }}</span>
                </div>
              </div>
            </div>

            <!-- Liabilities & Equity Column -->
            <div class="space-y-6">
              <!-- Liabilities -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-red-50 px-6 py-4 border-b border-gray-200">
                  <h2 class="text-xl font-bold text-gray-900">Liabilities</h2>
                </div>
                <div class="p-6 space-y-2 max-h-48 overflow-y-auto">
                  <div v-for="liability in liabilitiesFlatted" :key="liability.account"
                       class="flex items-center justify-between p-3 rounded hover:bg-red-50 transition"
                       :style="{ paddingLeft: `${(liability.level || 0) * 24 + 12}px` }">
                    <div class="flex items-center gap-2 flex-1">
                      <!-- Expand/Collapse Button -->
                      <button v-if="liability.hasChildren"
                              @click="toggleAccount(liability.account)"
                              class="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded">
                        <ChevronRight :class="['w-4 h-4 transition-transform', expandedAccounts.includes(liability.account) ? 'rotate-90' : '']" />
                      </button>
                      <div v-else class="w-5"></div>

                      <!-- Account Name -->
                      <span :class="['text-gray-700', { 'font-bold text-red-600': liability.hasChildren, 'font-medium': !liability.hasChildren }]">
                        {{ liability.account_name || liability.account }}
                      </span>
                    </div>
                    <!-- Amount -->
                    <span class="font-semibold text-gray-900 ml-4">${{ formatNumber(liability.total || 0) }}</span>
                  </div>

                  <!-- Total Liabilities -->
                  <div class="flex items-center justify-between p-3 font-bold text-lg bg-red-50 rounded mt-4 border-t-2 border-red-200">
                    <span>Total Liabilities</span>
                    <span class="text-red-600">${{ formatNumber(totals.total_liabilities) }}</span>
                  </div>
                </div>
              </div>

              <!-- Equity -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-green-50 px-6 py-4 border-b border-gray-200">
                  <h2 class="text-xl font-bold text-gray-900">Equity</h2>
                </div>
                <div class="p-6 space-y-2 max-h-48 overflow-y-auto">
                  <div v-for="eq in equityFlatted" :key="eq.account"
                       class="flex items-center justify-between p-3 rounded hover:bg-green-50 transition"
                       :style="{ paddingLeft: `${(eq.level || 0) * 24 + 12}px` }">
                    <div class="flex items-center gap-2 flex-1">
                      <!-- Expand/Collapse Button -->
                      <button v-if="eq.hasChildren"
                              @click="toggleAccount(eq.account)"
                              class="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded">
                        <ChevronRight :class="['w-4 h-4 transition-transform', expandedAccounts.includes(eq.account) ? 'rotate-90' : '']" />
                      </button>
                      <div v-else class="w-5"></div>

                      <!-- Account Name -->
                      <span :class="['text-gray-700', { 'font-bold text-green-600': eq.hasChildren, 'font-medium': !eq.hasChildren }]">
                        {{ eq.account_name || eq.account }}
                      </span>
                    </div>
                    <!-- Amount -->
                    <span class="font-semibold text-gray-900 ml-4">${{ formatNumber(eq.total || 0) }}</span>
                  </div>

                  <!-- Total Equity -->
                  <div class="flex items-center justify-between p-3 font-bold text-lg bg-green-50 rounded mt-4 border-t-2 border-green-200">
                    <span>Total Equity</span>
                    <span class="text-green-600">${{ formatNumber(totals.total_equity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Balance Equation -->
          <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Total Assets</p>
                <p class="text-2xl font-bold text-blue-600">${{ formatNumber(totals.total_assets) }}</p>
              </div>
              <div class="text-center p-4">
                <p class="text-3xl font-bold text-gray-400">=</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-1">Liabilities + Equity</p>
                <p class="text-2xl font-bold text-green-600">${{ formatNumber(totals.total_liabilities + totals.total_equity) }}</p>
              </div>
            </div>
            <div class="mt-4 text-center">
              <p class="text-sm" :class="isBalanced ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                {{ isBalanced ? '✓ Balance Sheet is Balanced' : '✗ Balance Sheet is Not Balanced' }}
              </p>
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
import { ArrowLeft, Download, ChevronRight } from 'lucide-vue-next'
import { getBalanceSheetReport, getDefaultCompany } from '@/services/api'


    const router = useRouter()
    const loading = ref(false)
    const error = ref(null)
    const expandedAccounts = ref([])

    const reportData = ref({
      assets: [],
      liabilities: [],
      equity: [],
      totals: {
        total_assets: 0,
        total_liabilities: 0,
        total_equity: 0
      }
    })

    // Step 1: فلتر البيانات بطريقة قوية
    const getAccountHierarchy = (accounts, isAssets) => {
      const allAccounts = new Set()

      // أوجد ROOT accounts
      const rootAccounts = accounts.filter(row => {
        const name = row.account_name || ''
        if (isAssets) {
          return (name.includes('Application of Funds') || name.includes('Assets')) &&
                 !name.includes('Total') &&
                 row.account &&
                 !row.parent_account
        } else {
          return (name.includes('Source of Funds') || name.includes('Liabilities')) &&
                 !name.includes('Total') &&
                 row.account &&
                 !row.parent_account
        }
      })

      // أضف جميع الأطفال (descendants)
      const addDescendants = (accountKey) => {
        allAccounts.add(accountKey)
        const children = accounts.filter(a => a.parent_account === accountKey)
        children.forEach(child => {
          if (child.account) {
            addDescendants(child.account)
          }
        })
      }

      // أضف جميع الآباء (ancestors)
      const addParents = (accountKey) => {
        const account = accounts.find(a => a.account === accountKey)
        if (account) {
          allAccounts.add(accountKey)
          if (account.parent_account) {
            addParents(account.parent_account)
          }
        }
      }

      // ابدأ من ROOT
      rootAccounts.forEach(root => {
        if (root.account) {
          addDescendants(root.account)
        }
      })

      // ابحث عن حسابات وسطية
      accounts.forEach(acc => {
        const name = acc.account_name || ''
        const hasKeyword = isAssets
          ? (name.includes('Application of Funds') || name.includes('Assets'))
          : (name.includes('Source of Funds') || name.includes('Liabilities'))

        if (hasKeyword && !name.includes('Total') && acc.account) {
          addDescendants(acc.account)
          addParents(acc.account)
        }
      })

      return accounts.filter(row => allAccounts.has(row.account))
    }

    // Step 2: بناء الشجرة من البيانات المُفلترة
    const buildAccountTree = (accounts) => {
      const map = {}
      const tree = []

      accounts.forEach(account => {
        if (account.account) {
          map[account.account] = { ...account, children: [] }
        }
      })

      accounts.forEach(account => {
        if (account.parent_account && map[account.parent_account]) {
          map[account.parent_account].children.push(map[account.account])
        } else if (account.account) {
          tree.push(map[account.account])
        }
      })

      return tree
    }

    // Flatten tree with expand/collapse logic
    const flattenAccountTree = (tree, expandedSet = []) => {
      const result = []

      const traverse = (items, level = 0) => {
        items.forEach(item => {
          result.push({
            ...item,
            level,
            hasChildren: item.children && item.children.length > 0
          })

          if (item.children && item.children.length > 0 && expandedSet.includes(item.account)) {
            traverse(item.children, level + 1)
          }
        })
      }

      traverse(tree)
      return result
    }

    const assetTree = computed(() => {
      // لا تفلتر البيانات، خذ كلها كما هي من الـ API
      return buildAccountTree(reportData.value.assets)
    })
    const assetsFlatted = computed(() => flattenAccountTree(assetTree.value, expandedAccounts.value))

    const liabilityTree = computed(() => {
      // لا تفلتر البيانات، خذ كلها كما هي من الـ API
      return buildAccountTree(reportData.value.liabilities)
    })
    const liabilitiesFlatted = computed(() => flattenAccountTree(liabilityTree.value, expandedAccounts.value))

    const equityTree = computed(() => {
      // لا تفلتر البيانات، خذ كلها كما هي من الـ API
      return buildAccountTree(reportData.value.equity)
    })
    const equityFlatted = computed(() => flattenAccountTree(equityTree.value, expandedAccounts.value))

    const totals = computed(() => reportData.value.totals || {})

    const isBalanced = computed(() => {
      const diff = Math.abs(totals.value.total_assets - (totals.value.total_liabilities + totals.value.total_equity))
      return diff < 1
    })

    const toggleAccount = (accountKey) => {
      const index = expandedAccounts.value.indexOf(accountKey)
      if (index > -1) {
        expandedAccounts.value.splice(index, 1)
      } else {
        expandedAccounts.value.push(accountKey)
      }
    }

    const formatNumber = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    }

    const loadReport = async () => {
      loading.value = true
      error.value = null

      try {
          const defaultCompany = await getDefaultCompany()
          const filters = {
            company: defaultCompany || 'pos',
            filter_based_on: 'Fiscal Year',
            from_fiscal_year: new Date().getFullYear().toString(),
            to_fiscal_year: new Date().getFullYear().toString(),
            periodicity: 'Yearly'
          }

          const result = await getBalanceSheetReport(filters)
        if (result?.status === 'success') {
            reportData.value = result
            expandedAccounts.value = []
          } else {
            error.value = result?.message || 'Failed to load balance sheet'
          }
        } catch (err) {
          error.value = err.message || 'Error loading balance sheet'
          console.error('Error:', err)
        } finally {
          loading.value = false
        }
      }

    const goBack = () => router.back()
    const exportReport = () => console.log('Exporting...')

    onMounted(() => {
      loadReport()
    })


</script>
