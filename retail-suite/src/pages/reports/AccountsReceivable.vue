<template>

       <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">
        <!--══════════════════ Header ═══════════════════════ -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10  rounded-xl shadow-sm border-b"
          :style="{ background: 'var(--header-bg)', border: '1px solid var(--header-border)' }">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button
                @click="goBack"
                class="p-1.5 rounded-md transition-colors"
                :style="{ color: 'var(--text-muted)' }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'transparent'"
>
                <ArrowLeft class="w-6 h-6" :style="{ color: 'var(--text-muted)' }"/>
              </button>
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Accounts Receivable</h1>
            </div>
            <button
              @click="exportReport"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition"
              :style="{
                background: 'var(--btn-success)',
                color: '#fff'
              }"
              @mouseenter="$event.currentTarget.style.filter = 'brightness(1.05)'"
              @mouseleave="$event.currentTarget.style.filter = 'none'"
            >
              <Download class="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <!--══════════════════ Key Metrics ═══════════════════════-->
        <section class="px-6 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
              title="Total Receivable"
              :value="totalReceivable"
              subtitle="Outstanding invoices"
              icon="Wallet"
              color="purple"
            />
            <StatsCard
              title="Collected This Month"
              :value="collectedMonth"
              subtitle="Current period"
              icon="Banknote"
              color="green"
            />
            <StatsCard
              title="Collection Rate"
              :value="collectionRate.toFixed(1) + '%'"
              subtitle="Efficiency metric"
              icon="TrendingUp"
              color="blue"
            />
            <StatsCard
              title="Overdue Amount"
              :value="overdueAmount"
              subtitle="Needs attention"
              icon="AlertTriangle"
              color="red"
            />
          </div>
        </section>

        <!--══════════════════ Main Content ═══════════════════════-->
        <section class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!--══════════════════ Receivables Table ══════════════════-->
            <div
                class="lg:col-span-2 rounded-xl overflow-hidden"
                :style="{
                  background: 'var(--content-panel-bg)',
                  border: '1px solid var(--content-panel-border)',
                  boxShadow: 'var(--content-panel-shadow)'
                }"
              >
              <!-- Table Header -->
              <div
                  class="px-6 py-4 border-b "
                  :style="{
                  background: 'var(--pt-table-header-bg)',
                  borderColor: 'var(--pt-table-header-border)'
                }">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Customer Invoices</h2>
                  <div class="relative w-full sm:w-64">
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by invoice, customer or amount..."
                      class="w-full px-4 py-2 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      :style="{
                        background: 'var(--pt-search-bg)',
                        border: '1px solid var(--pt-search-border)',
                        color: 'var(--pt-search-text)',
                        '--tw-ring-color': 'var(--pt-focus-ring)'
                      }"
                    />
                    <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
                <svg class="w-10 h-10 animate-spin text-cyan-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <h2 class="text-base sm:text-lg font-medium text-gray-600">Loading invoices...</h2>
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredInvoices.length === 0" class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <div class="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                  <svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A2 2 0 0010.586 3H6a2 2 0 00-2 2v6m16 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                  </svg>
                </div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-700">No Invoices Found</h3>
                <p class="text-sm sm:text-base text-gray-500 mt-1">No outstanding invoices found</p>
              </div>

              <!-- Table -->
              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead :style="{
                      background: 'var(--section-bg)',
                      borderBottom: '1px solid var(--item-border)'
                    }">
                    <tr>
                      <th
                          v-for="(col, idx) in ['Customer', 'Invoice No.', 'Amount', 'Due Date', 'Status', 'Days Overdue']"
                          :key="idx"
                          :class="['Status'].includes(col) ? 'text-center' : ''"
                          class="px-4 py-3 text-left text-sm font-semibold"
                          :style="{ color: 'var(--text-main)' }">

                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="invoice in paginatedInvoices"
                      :key="invoice.id"
                      class="border-b transition-colors"
                      :style="{
                        borderColor: 'var(--item-border)'
                      }"
                      @mouseenter="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'transparent'"
                    >
                      <td class="px-4 py-3 font-medium"
                        :style="{ color: 'var(--text-main)' }"
                      >{{ invoice.customer }}</td>
                      <td class="px-4 py-3 font-medium" :style="{ color: 'var(--text-main)' }">{{ invoice.invoiceNo }}</td>
                      <td class="px-4 py-3 font-medium" :style="{ color: 'var(--text-main)' }">${{ invoice.amount.toLocaleString() }}</td>
                      <td class="px-4 py-3 text-gray-600" :style="{ color: 'var(--text-main)' }">{{ formatDate(invoice.dueDate) }}</td>
                      <td class="px-4 py-3 text-center" :style="{ color: 'var(--text-main)' }">
                        <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(invoice.status)]">
                          {{ getStatusLabel(invoice.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 font-medium " :style="{ color: 'var(--text-main)' }">
                        {{ invoice.daysOverdue > 0 ? `${invoice.daysOverdue} days` : '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1 && !loading && filteredInvoices.length > 0"
              class="px-4 sm:px-6 py-4 border-t flex-shrink-0"
              :style="{
                background: 'var(--section-bg)',
                borderColor: 'var(--item-border)'
              }"
            >
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">

                <!-- Info -->
                <div
                  class="text-xs sm:text-sm order-2 sm:order-1"
                  :style="{ color: 'var(--text-sub)' }"
                >
                  Showing
                  <span class="font-medium" :style="{ color: 'var(--text-main)' }">
                    {{ ((currentPage - 1) * itemsPerPage) + 1 }}
                  </span>
                  to
                  <span class="font-medium" :style="{ color: 'var(--text-main)' }">
                    {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }}
                  </span>
                  of
                  <span class="font-medium" :style="{ color: 'var(--text-main)' }">
                    {{ filteredInvoices.length }}
                  </span>
                  results

                  <span
                    v-if="searchQuery"
                    class="ml-2"
                    :style="{ color: 'var(--text-muted)' }"
                  >
                    (filtered from {{ receivables.length }})
                  </span>
                </div>

                <!-- Controls -->
                <div class="flex items-center gap-2 order-1 sm:order-2">

                  <!-- Prev -->
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{
                      background: 'var(--item-bg)',
                      border: '1px solid var(--item-border)',
                      color: 'var(--text-main)'
                    }"
                  >
                    <span class="hidden sm:inline">Previous</span>
                    <span class="sm:hidden">Prev</span>
                  </button>

                  <!-- Pages -->
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200"
                    :style="
                      currentPage === page
                        ? {
                            background: 'var(--btn-info)',
                            border: '1px solid var(--focus-ring)',
                            color: '#fff'
                          }
                        : {
                            background: 'var(--item-bg)',
                            border: '1px solid var(--item-border)',
                            color: 'var(--text-main)'
                          }
                    "
                  >
                    {{ page }}
                  </button>

                  <!-- Next -->
                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{
                      background: 'var(--item-bg)',
                      border: '1px solid var(--item-border)',
                      color: 'var(--text-main)'
                    }"
                  >
                    <span class="hidden sm:inline">Next</span>
                    <span class="sm:hidden">Next</span>
                  </button>

                </div>
              </div>
            </div>
            </div>

            <!-- Sidebar Analytics -->
            <div class="space-y-6">
              <!--=═════════════════ Aging Analysis ══════════════════ -->
              <div
                class="rounded-xl shadow-sm border p-6"
                :style="{
                  background: 'var(--content-panel-bg)',
                  border: '1px solid var(--content-panel-border)'
                }"
              >
                <h3
                  class="text-lg font-bold mb-4"
                  :style="{ color: 'var(--text-main)' }"
                >
                  Aging Analysis
                </h3>
                <div v-if="loading" class="space-y-3">
                  <div
                    v-for="i in 4" :key="i"
                    class="p-3 rounded-lg animate-pulse"
                    :style="{ background: 'var(--item-bg)' }">
                    <div class="h-4 rounded mb-2 w-3/4" :style="{ background: 'var(--item-border)' }"></div>
                  <div class="h-2 rounded-full w-full" :style="{ background: 'var(--track-bg)' }"></div>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="aging in agingData"
                    :key="aging.id"
                    class="p-3 rounded-lg"
                    :style="{ background: 'var(--item-bg)' }">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium" :style="{ color: 'var(--text-sub)' }">{{ aging.period }}</span>
                        <span class="text-sm font-bold" :class="aging.color">{{ aging.percentage }}%</span>
                      </div>
                      <div class="w-full rounded-full h-2" :style="{ background: 'var(--track-bg)' }">
                        <div
                          class="h-2 rounded-full"
                          :style="{ width: aging.percentage + '%' }"
                          :class="aging.bgColor">
                        </div>
                      </div>
                      <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }"
                      >${{ aging.amount.toLocaleString() }}</p>
                  </div>
                </div>
              </div>

              <!-- Top Customers -->
              <div
                class="rounded-xl shadow-sm border p-6"
                :style="{
                  background: 'var(--content-panel-bg)',
                  border: '1px solid var(--content-panel-border)'
                }"
              >
                <h3
                  class="text-lg font-bold mb-4"
                  :style="{ color: 'var(--text-main)' }"
                >
                  Top Customers
                </h3>
                <div v-if="loading" class="space-y-3">
                   <div
                    v-for="i in 5"
                    :key="i"
                    class="flex items-center justify-between p-3 rounded-lg animate-pulse"
                    :style="{ background: 'var(--item-bg)' }"
                  >
                    <div class="h-4 w-1/2 rounded" :style="{ background: 'var(--item-border)' }"></div>
                    <div class="h-4 w-1/4 rounded" :style="{ background: 'var(--item-border)' }"></div>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="(customer, idx) in topCustomers" :key="idx" class="flex items-center justify-between p-3 rounded-lg" :style="{ background: 'var(--item-bg)' }">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">{{ idx + 1 }}</span>
                      <span class="text-sm" :style="{ color: 'var(--text-sub)' }">{{ customer.name }}</span>
                    </div>
                    <span class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">${{ customer.amount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Collection Trend -->
              <div
                class="rounded-xl shadow-sm border p-6"
                :style="{
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)'
                }"
              >
                <h3
                  class="text-lg font-bold mb-3"
                  :style="{ color: 'var(--text-main)' }"
                >
                  Collection Trend
                </h3>
                <div class="space-y-2 text-sm">
                  <p
                    :style="{ color: 'var(--text-sub)' }">Last 30 Days Collection</p>
                  <p v-if="loading"  class="text-2xl font-bold animate-pulse"
                    :style="{ color: 'var(--primary-600)' }">--</p>
                  <p v-else  class="text-2xl font-bold"
                    :style="{ color: 'var(--primary-600)' }"">${{ last30DaysCollection.toLocaleString() }}</p>
                  <p
                    class="text-xs mt-2"
                    :style="{ color: 'var(--text-muted)' }">📈 Collection improving</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Table -->
          <div class="mt-6 rounded-xl shadow-sm border p-6"
              :style="{
                background: 'var(--content-panel-bg)',
                borderColor: 'var(--content-panel-border)',
                boxShadow: 'var(--content-panel-shadow)'
              }"
          >
            <h2 class="text-lg font-bold mb-4" :style="{ color: 'var(--text-main)' }">Summary by Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Paid"
                :value="statusCounts.paid"
                :subtitle="'$' + (statusAmounts?.paid ?? 0).toLocaleString()"
                icon="CheckCircle"
                color="green"
              />
              <StatsCard
                title="Due"
                :value="statusCounts.due"
                :subtitle="'$' + (statusAmounts?.due ?? 0).toLocaleString()"
                icon="Clock"
                color="blue"
              />
              <StatsCard
                title="Overdue"
                :value="statusCounts.overdue"
                :subtitle="'$' + statusAmounts.overdue.toLocaleString()"
                icon="AlertTriangle"
                color="orange"
              />
              <StatsCard
                title="Disputed"
                :value="statusCounts.disputed"
                :subtitle="'$' + (statusAmounts?.disputed ?? 0).toLocaleString()"
                icon="XCircle"
                color="red"
              />
            </div>
          </div>
        </section>
      </main>
    </div>

</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ArrowLeft, Download } from 'lucide-vue-next'
import { getDefaultCompany } from '@/services/api'
import { getAccountsReceivableReport, exportAccountsReceivableReport } from '@/composables/reports'
import StatsCard from '@/layout/StatsCard.vue'
    const loading = ref(true)
    const error = ref(null)
    const router = useRouter()

    // Data
    const receivables = ref([])
    const agingData = ref([])

    // Metrics
    const totalReceivable = ref(0)
    const collectedMonth = ref(0)
    const overdueAmount = ref(0)
    const collectionRate = ref(0)
    const topCustomers = ref([])
    const statusCounts = ref({ paid: 0, due: 0, overdue: 0, disputed: 0 })
    const statusAmounts = ref({ paid: 0, due: 0, overdue: 0, disputed: 0 })
    const last30DaysCollection = ref(0)

    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(14)
    const searchQuery = ref('')

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getStatusClass = (status) => {
      const classes = {
        'Paid': 'bg-green-100 text-green-800',
        'Due': 'bg-blue-100 text-blue-800',
        'Overdue': 'bg-orange-100 text-orange-800',
        'Disputed': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      return status || 'Unknown'
    }

    const goBack = () => {
      router.back()
    }

    const exportReport = async () => {
      try {
       const response = await exportAccountsReceivableReport()
       console.log("response Export",response )
      } catch (err) {
        console.error('Export error:', err)
      }
    }

    const fetchARData = async () => {
      try {
        loading.value = true
        error.value = null

        const defaultCompany = await getDefaultCompany()
        const filters = {
          company: defaultCompany || 'pos',
          filter_based_on: 'Fiscal Year',
          from_fiscal_year: new Date().getFullYear().toString(),
          to_fiscal_year: new Date().getFullYear().toString(),
          periodicity: 'Yearly'
        }

        const data = await getAccountsReceivableReport(filters)
        console.log("data =>", data)

        receivables.value = data.receivables || []
        agingData.value = data.agingData || []
        totalReceivable.value = data.totalReceivable || 0
        collectedMonth.value = data.collectedMonth || 0
        overdueAmount.value = data.overdueAmount || 0
        collectionRate.value = data.collectionRate || 0
        topCustomers.value = data.topCustomers || []
        statusCounts.value = data.statusCounts || { paid: 0, due: 0, overdue: 0, disputed: 0 }
        statusAmounts.value = data.statusAmounts || { paid: 0, due: 0, overdue: 0, disputed: 0 }

        // Calculate last 30 days collection
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        last30DaysCollection.value = (receivables.value || [])
          .filter(inv => {
            const dueDate = new Date(inv.dueDate)
            return dueDate >= thirtyDaysAgo && dueDate <= today && inv.status === 'Paid'
          })
          .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)

        currentPage.value = 1
      } catch (err) {
        error.value = 'Failed to load Accounts Receivable data'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const filteredInvoices = computed(() => {
      if (!searchQuery.value.trim()) {
        return receivables.value
      }

      const query = searchQuery.value.toLowerCase()
      return receivables.value.filter(invoice => {
        const invoiceNo = (invoice.invoiceNo || '').toLowerCase()
        const customerName = (invoice.customer || '').toLowerCase()
        const amount = (invoice.amount || 0).toString()

        return (
          invoiceNo.includes(query) ||
          customerName.includes(query) ||
          amount.includes(query)
        )
      })
    })

    const totalPages = computed(() => {
      return Math.ceil((filteredInvoices.value || []).length / itemsPerPage.value)
    })

    const paginatedInvoices = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return (filteredInvoices.value || []).slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxPagesToShow = 5
      let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
      let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    onMounted(async () => {
      await fetchARData()
    })


</script>
