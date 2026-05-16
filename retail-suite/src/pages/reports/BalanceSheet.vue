<!-- Reports/BalanceSheet.vue -->
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
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Balance Sheet</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Financial position overview</p>
              </div>
            </div>
            <button
              @click="exportReport"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors"
              :style="{ background: 'var(--icon-color-green)' }"
            >
              <Download class="w-3 h-3" />
              Export
            </button>
          </div>
        </header>

        <!-- ══════════════════ LOADING ══════════════════ -->
        <div v-if="loading" class="flex-1 flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Loading Balance Sheet...</p>
          </div>
        </div>

        <!-- ══════════════════ ERROR ══════════════════ -->
        <div v-else-if="error" class="px-3 pt-3">
          <div class="rounded-lg p-4" style="background: #fef2f2; border: 1px solid #fecaca;">
            <p class="text-xs font-semibold" style="color: #991b1b;">Error Loading Report</p>
            <p class="text-xs mt-1" style="color: #dc2626;">{{ error }}</p>
            <button
              @click="loadReport"
              class="mt-3 px-3 py-1.5 text-white text-xs rounded-md"
              style="background: #dc2626;"
            >
              Try Again
            </button>
          </div>
        </div>

        <template v-else>

          <!-- ══════════════════ STATISTICS ══════════════════ -->
          <section class="px-3 pt-3">
            <div
              class="rounded-lg shadow-sm p-3"
              :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
            >
              <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
                Key Metrics
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <StatsCard title="Total Assets"      :value="`$${formatNumber(totals.total_assets)}`"      icon="TrendingUp"  color="blue"   />
                <StatsCard title="Total Liabilities" :value="`$${formatNumber(totals.total_liabilities)}`" icon="TrendingDown" color="orange" />
                <StatsCard title="Total Equity"      :value="`$${formatNumber(totals.total_equity)}`"      icon="DollarSign"  color="green"  />
              </div>
            </div>
          </section>

          <!-- ══════════════════ CONTENT ══════════════════ -->
          <section class="px-3 pt-3 pb-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">

              <!-- Assets Column -->
              <div
                class="rounded-lg shadow-sm overflow-hidden"
                :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
              >
                <div
                  class="px-4 py-2.5"
                  :style="{ background: 'var(--info-bg)', borderBottom: '1px solid var(--card-border)' }"
                >
                  <h2 class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">Assets</h2>
                </div>
                <div class="p-3 space-y-0.5 max-h-96 overflow-y-auto" style="scrollbar-width: thin;">
                  <div
                    v-for="asset in assetsFlatted"
                    :key="asset.account"
                    class="flex items-center justify-between py-1.5 pr-3 rounded-md transition-colors"
                    :style="{ paddingLeft: `${(asset.level || 0) * 20 + 8}px` }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <div class="flex items-center gap-1.5 flex-1">
                      <button
                        v-if="asset.hasChildren"
                        @click="toggleAccount(asset.account)"
                        class="w-4 h-4 flex items-center justify-center rounded transition-colors"
                        :style="{ color: 'var(--text-muted)' }"
                        @mouseover="$event.currentTarget.style.background = 'var(--item-bg)'"
                        @mouseleave="$event.currentTarget.style.background = 'transparent'"
                      >
                        <ChevronRight
                          class="w-3.5 h-3.5 transition-transform"
                          :class="expandedAccounts.includes(asset.account) ? 'rotate-90' : ''"
                        />
                      </button>
                      <div v-else class="w-4" />
                      <span
                        class="text-xs"
                        :class="asset.hasChildren ? 'font-bold' : 'font-medium'"
                        :style="{ color: asset.hasChildren ? 'var(--focus-ring)' : 'var(--text-sub)' }"
                      >
                        {{ asset.account_name || asset.account }}
                      </span>
                    </div>
                    <span class="text-xs font-semibold ml-4" :style="{ color: 'var(--text-main)' }">
                      ${{ formatNumber(asset.total || 0) }}
                    </span>
                  </div>

                  <!-- Total Assets -->
                  <div
                    class="flex items-center justify-between px-3 py-2 rounded-md font-bold mt-2"
                    :style="{ background: 'var(--info-bg)', border: '1px solid var(--focus-ring)', marginTop: '8px' }"
                  >
                    <span class="text-xs" :style="{ color: 'var(--text-main)' }">Total Assets</span>
                    <span class="text-xs" :style="{ color: 'var(--focus-ring)' }">${{ formatNumber(totals.total_assets) }}</span>
                  </div>
                </div>
              </div>

              <!-- Liabilities + Equity Column -->
              <div class="space-y-3">

                <!-- Liabilities -->
                <div
                  class="rounded-lg shadow-sm overflow-hidden"
                  :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
                >
                  <div
                    class="px-4 py-2.5"
                    :style="{ background: 'var(--warning-bg)', borderBottom: '1px solid var(--card-border)' }"
                  >
                    <h2 class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">Liabilities</h2>
                  </div>
                  <div class="p-3 space-y-0.5 max-h-48 overflow-y-auto" style="scrollbar-width: thin;">
                    <div
                      v-for="liability in liabilitiesFlatted"
                      :key="liability.account"
                      class="flex items-center justify-between py-1.5 pr-3 rounded-md transition-colors"
                      :style="{ paddingLeft: `${(liability.level || 0) * 20 + 8}px` }"
                      @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'transparent'"
                    >
                      <div class="flex items-center gap-1.5 flex-1">
                        <button
                          v-if="liability.hasChildren"
                          @click="toggleAccount(liability.account)"
                          class="w-4 h-4 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--text-muted)' }"
                        >
                          <ChevronRight
                            class="w-3.5 h-3.5 transition-transform"
                            :class="expandedAccounts.includes(liability.account) ? 'rotate-90' : ''"
                          />
                        </button>
                        <div v-else class="w-4" />
                        <span
                          class="text-xs"
                          :class="liability.hasChildren ? 'font-bold' : 'font-medium'"
                          :style="{ color: liability.hasChildren ? 'var(--text-sub)' : 'var(--text-sub)' }"
                        >
                          {{ liability.account_name || liability.account }}
                        </span>
                      </div>
                      <span class="text-xs font-semibold ml-4" :style="{ color: 'var(--text-main)' }">
                        ${{ formatNumber(liability.total || 0) }}
                      </span>
                    </div>

                    <!-- Total Liabilities -->
                    <div
                      class="flex items-center justify-between px-3 py-2 rounded-md font-bold mt-2"
                      :style="{ background: 'var(--warning-bg)', border: '1px solid var(--text-sub)', marginTop: '8px' }"
                    >
                      <span class="text-xs" :style="{ color: 'var(--text-main)' }">Total Liabilities</span>
                      <span class="text-xs" :style="{ color: 'var(--warning-border)' }">${{ formatNumber(totals.total_liabilities) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Equity -->
                <div
                  class="rounded-lg shadow-sm overflow-hidden"
                  :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
                >
                  <div
                    class="px-4 py-2.5"
                    :style="{ background: 'var(--icon-bg-green)', borderBottom: '1px solid var(--card-border)' }"
                  >
                    <h2 class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">Equity</h2>
                  </div>
                  <div class="p-3 space-y-0.5 max-h-48 overflow-y-auto" style="scrollbar-width: thin;">
                    <div
                      v-for="eq in equityFlatted"
                      :key="eq.account"
                      class="flex items-center justify-between py-1.5 pr-3 rounded-md transition-colors"
                      :style="{ paddingLeft: `${(eq.level || 0) * 20 + 8}px` }"
                      @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'transparent'"
                    >
                      <div class="flex items-center gap-1.5 flex-1">
                        <button
                          v-if="eq.hasChildren"
                          @click="toggleAccount(eq.account)"
                          class="w-4 h-4 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--text-muted)' }"
                        >
                          <ChevronRight
                            class="w-3.5 h-3.5 transition-transform"
                            :class="expandedAccounts.includes(eq.account) ? 'rotate-90' : ''"
                          />
                        </button>
                        <div v-else class="w-4" />
                        <span
                          class="text-xs"
                          :class="eq.hasChildren ? 'font-bold' : 'font-medium'"
                          :style="{ color: eq.hasChildren ? 'var(--icon-color-green)' : 'var(--text-sub)' }"
                        >
                          {{ eq.account_name || eq.account }}
                        </span>
                      </div>
                      <span class="text-xs font-semibold ml-4" :style="{ color: 'var(--text-main)' }">
                        ${{ formatNumber(eq.total || 0) }}
                      </span>
                    </div>

                    <!-- Total Equity -->
                    <div
                      class="flex items-center justify-between px-3 py-2 rounded-md font-bold mt-2"
                      :style="{ background: 'var(--icon-bg-green)', border: '1px solid var(--icon-color-green)', marginTop: '8px' }"
                    >
                      <span class="text-xs" :style="{ color: 'var(--text-main)' }">Total Equity</span>
                      <span class="text-xs" :style="{ color: 'var(--icon-color-green)' }">${{ formatNumber(totals.total_equity) }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Balance Equation -->
            <div
              class="mt-3 rounded-lg shadow-sm p-4"
              :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                <div
                  class="text-center p-3 rounded-md"
                  :style="{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }"
                >
                  <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Total Assets</p>
                  <p class="text-lg font-bold" :style="{ color: 'var(--focus-ring)' }">${{ formatNumber(totals.total_assets) }}</p>
                </div>

                <div class="text-center">
                  <p class="text-2xl font-bold" :style="{ color: 'var(--text-muted)' }">=</p>
                </div>

                <div class="text-center p-3 rounded-md"
                  :style="{ background: 'var(--icon-bg-green)', border: '1px solid var(--icon-color-green)' }"
                >
                  <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Liabilities + Equity</p>
                  <p class="text-lg font-bold" :style="{ color: 'var(--icon-color-green)' }">
                    ${{ formatNumber(totals.total_liabilities + totals.total_equity) }}
                  </p>
                </div>

              </div>

              <div class="mt-3 text-center">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  :style="isBalanced
                    ? { background: 'var(--icon-bg-green)', color: 'var(--icon-color-green)', border: '1px solid var(--icon-color-green)' }
                    : { background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }"
                >
                  {{ isBalanced ? '✓ Balance Sheet is Balanced' : '✗ Balance Sheet is Not Balanced' }}
                </span>
              </div>
            </div>

          </section>

        </template>
      </main>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import StatsCard from '@/layout/StatsCard.vue'
import { ArrowLeft, Download, ChevronRight } from 'lucide-vue-next'
import { getDefaultCompany } from '@/services/api'
import { getBalanceSheetReport } from '@/composables/reports'
const router           = useRouter()
const loading          = ref(false)
const error            = ref(null)
const expandedAccounts = ref([])

const reportData = ref({
  assets:      [],
  liabilities: [],
  equity:      [],
  totals:      { total_assets: 0, total_liabilities: 0, total_equity: 0 },
})

// ── Tree helpers ──────────────────────────────────────
const buildAccountTree = (accounts) => {
  const map = {}, tree = []
  accounts.forEach(a => { if (a.account) map[a.account] = { ...a, children: [] } })
  accounts.forEach(a => {
    if (a.parent_account && map[a.parent_account]) map[a.parent_account].children.push(map[a.account])
    else if (a.account) tree.push(map[a.account])
  })
  return tree
}

const flattenAccountTree = (tree, expandedSet = []) => {
  const result = []
  const traverse = (items, level = 0) => {
    items.forEach(item => {
      result.push({ ...item, level, hasChildren: !!(item.children?.length) })
      if (item.children?.length && expandedSet.includes(item.account)) traverse(item.children, level + 1)
    })
  }
  traverse(tree)
  return result
}

const assetTree        = computed(() => buildAccountTree(reportData.value.assets))
const assetsFlatted    = computed(() => flattenAccountTree(assetTree.value, expandedAccounts.value))
const liabilityTree    = computed(() => buildAccountTree(reportData.value.liabilities))
const liabilitiesFlatted = computed(() => flattenAccountTree(liabilityTree.value, expandedAccounts.value))
const equityTree       = computed(() => buildAccountTree(reportData.value.equity))
const equityFlatted    = computed(() => flattenAccountTree(equityTree.value, expandedAccounts.value))
const totals           = computed(() => reportData.value.totals || {})
const isBalanced       = computed(() => Math.abs(totals.value.total_assets - (totals.value.total_liabilities + totals.value.total_equity)) < 1)

const toggleAccount = (key) => {
  const idx = expandedAccounts.value.indexOf(key)
  if (idx > -1) expandedAccounts.value.splice(idx, 1)
  else expandedAccounts.value.push(key)
}

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)

const loadReport = async () => {
  loading.value = true; error.value = null
  try {
    const defaultCompany = await getDefaultCompany()
    const result = await getBalanceSheetReport({
      company:          defaultCompany || 'pos',
      filter_based_on:  'Fiscal Year',
      from_fiscal_year: new Date().getFullYear().toString(),
      to_fiscal_year:   new Date().getFullYear().toString(),
      periodicity:      'Yearly',
    })
    if (result?.status === 'success') { reportData.value = result; expandedAccounts.value = [] }
    else error.value = result?.message || 'Failed to load balance sheet'
  } catch (err) {
    error.value = err.message || 'Error loading balance sheet'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const goBack       = () => router.back()
const exportReport = () => console.log('Exporting...')

onMounted(() => { loadReport() })
</script>
