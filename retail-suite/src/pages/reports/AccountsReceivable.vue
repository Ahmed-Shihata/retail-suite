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
              <h1 class="text-lg font-bold text-gray-900">Accounts Receivable</h1>
            </div>
            <button @click="exportReport" class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              <Download class="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <!-- Key Metrics -->
        <section class="px-6 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 shadow-sm border border-orange-200">
              <p class="text-sm text-gray-600 mb-2">Total Receivable</p>
              <p v-if="loading" class="text-3xl font-bold text-orange-600 animate-pulse">--</p>
              <p v-else class="text-3xl font-bold text-orange-600">${{ totalReceivable.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">Outstanding invoices</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200">
              <p class="text-sm text-gray-600 mb-2">Collected This Month</p>
              <p v-if="loading" class="text-3xl font-bold text-green-600 animate-pulse">--</p>
              <p v-else class="text-3xl font-bold text-green-600">${{ collectedMonth.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">Current period</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm border border-blue-200">
              <p class="text-sm text-gray-600 mb-2">Collection Rate</p>
              <p v-if="loading" class="text-3xl font-bold text-blue-600 animate-pulse">--</p>
              <p v-else class="text-3xl font-bold text-blue-600">{{ collectionRate.toFixed(1) }}%</p>
              <p class="text-xs text-gray-500 mt-2">Efficiency metric</p>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-sm border border-red-200">
              <p class="text-sm text-gray-600 mb-2">Overdue Amount</p>
              <p v-if="loading" class="text-3xl font-bold text-red-600 animate-pulse">--</p>
              <p v-else class="text-3xl font-bold text-red-600">${{ overdueAmount.toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-2">Needs attention</p>
            </div>
          </div>
        </section>

        <!-- Content -->
        <section class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Receivables Table -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-orange-50">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 class="text-lg font-bold text-gray-900">Customer Invoices</h2>
                  <div class="relative w-full sm:w-64">
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by invoice, customer or amount..."
                      class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in paginatedInvoices" :key="invoice.id" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-900 font-medium">{{ invoice.customer }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ invoice.invoiceNo }}</td>
                      <td class="px-4 py-3 text-right text-gray-900 font-semibold">${{ invoice.amount.toLocaleString() }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ formatDate(invoice.dueDate) }}</td>
                      <td class="px-4 py-3 text-center">
                        <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(invoice.status)]">
                          {{ getStatusLabel(invoice.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right" :class="invoice.daysOverdue > 0 ? 'text-red-600 font-bold' : 'text-gray-600'">
                        {{ invoice.daysOverdue > 0 ? `${invoice.daysOverdue} days` : '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1 && !loading && filteredInvoices.length > 0" class="px-4 sm:px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div class="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                    Showing <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> to
                    <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }}</span> of
                    <span class="font-medium">{{ filteredInvoices.length }}</span> results
                    <span v-if="searchQuery" class="text-gray-500 ml-2">(filtered from {{ receivables.length }})</span>
                  </div>
                  <div class="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      @click="currentPage = Math.max(1, currentPage - 1)"
                      :disabled="currentPage === 1"
                      class="px-2 sm:px-3 py-1.5 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
                    >
                      <span class="hidden sm:inline">Previous</span>
                      <span class="sm:hidden">Prev</span>
                    </button>
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      @click="currentPage = page"
                      class="px-2 sm:px-3 py-1.5 border text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium"
                      :class="{
                        'bg-cyan-500 text-white border-cyan-500': currentPage === page,
                        'border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500': currentPage !== page
                      }"
                    >
                      {{ page }}
                    </button>
                    <button
                      @click="currentPage = Math.min(totalPages, currentPage + 1)"
                      :disabled="currentPage === totalPages"
                      class="px-2 sm:px-3 py-1.5 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
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
              <!-- Aging Report -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Aging Analysis</h3>
                <div v-if="loading" class="space-y-3">
                  <div v-for="i in 4" :key="i" class="p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div class="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div class="h-2 bg-gray-200 rounded-full w-full"></div>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="aging in agingData" :key="aging.id" class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-gray-700 font-medium">{{ aging.period }}</span>
                      <span class="text-sm font-bold" :class="aging.color">{{ aging.percentage }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div :style="{ width: aging.percentage + '%' }" :class="['h-2 rounded-full', aging.bgColor]"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${{ aging.amount.toLocaleString() }}</p>
                  </div>
                </div>
              </div>

              <!-- Top Customers -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Top Customers</h3>
                <div v-if="loading" class="space-y-3">
                  <div v-for="i in 5" :key="i" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="(customer, idx) in topCustomers" :key="idx" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-gray-400">{{ idx + 1 }}</span>
                      <span class="text-sm text-gray-700">{{ customer.name }}</span>
                    </div>
                    <span class="text-sm font-bold text-gray-900">${{ customer.amount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Collection Trend -->
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Trend</h3>
                <div class="space-y-2 text-sm">
                  <p class="text-gray-600">Last 30 Days Collection</p>
                  <p v-if="loading" class="text-2xl font-bold text-green-600 animate-pulse">--</p>
                  <p v-else class="text-2xl font-bold text-green-600">${{ last30DaysCollection.toLocaleString() }}</p>
                  <p class="text-xs text-gray-500 mt-2">📈 Collection improving</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Table -->
          <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Summary by Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p class="text-sm text-gray-600 mb-1">Paid</p>
                <p v-if="loading" class="text-2xl font-bold text-green-600 animate-pulse">--</p>
                <p v-else class="text-2xl font-bold text-green-600">{{ statusCounts.paid }}</p>
                <p v-if="!loading" class="text-xs text-gray-500 mt-1">${{ statusAmounts.paid.toLocaleString() }}</p>
              </div>
              <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p class="text-sm text-gray-600 mb-1">Due</p>
                <p v-if="loading" class="text-2xl font-bold text-blue-600 animate-pulse">--</p>
                <p v-else class="text-2xl font-bold text-blue-600">{{ statusCounts.due }}</p>
                <p v-if="!loading" class="text-xs text-gray-500 mt-1">${{ statusAmounts.due.toLocaleString() }}</p>
              </div>
              <div class="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p class="text-sm text-gray-600 mb-1">Overdue</p>
                <p v-if="loading" class="text-2xl font-bold text-orange-600 animate-pulse">--</p>
                <p v-else class="text-2xl font-bold text-orange-600">{{ statusCounts.overdue }}</p>
                <p v-if="!loading" class="text-xs text-gray-500 mt-1">${{ statusAmounts.overdue.toLocaleString() }}</p>
              </div>
              <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p class="text-sm text-gray-600 mb-1">Disputed</p>
                <p v-if="loading" class="text-2xl font-bold text-red-600 animate-pulse">--</p>
                <p v-else class="text-2xl font-bold text-red-600">{{ statusCounts.disputed }}</p>
                <p v-if="!loading" class="text-xs text-gray-500 mt-1">${{ statusAmounts.disputed.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import { ArrowLeft, Download } from 'lucide-vue-next'
import { getAccountsReceivableReport, getDefaultCompany, exportAccountsReceivableReport } from '@/services/api'

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
