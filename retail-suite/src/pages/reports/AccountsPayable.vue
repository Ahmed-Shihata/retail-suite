<!-- ============================================
FRONTEND - AccountsPayable.vue Component
============================================ -->

<template>

   <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">
        <!--══════════════════ Header ═══════════════════════ -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10  rounded-xl shadow-sm border-b"
          :style="{ background: 'var(--header-bg)', borderColor: 'var(--header-border)' }">
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
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Accounts Payable</h1>
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

        <!--══════════════════ Key Metrics ═══════════════════════ -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Payable"
              :value="totalPayable"
              subtitle="Outstanding bills"
              icon="Receipt"
              color="purple"
            />
              <StatsCard
                title="Paid This Month"
                :value="paidMonth"
                subtitle="Current period"
                icon="CheckCircle2"
                color="blue"
              />
              <StatsCard
                title="Overdue Amount"
                :value="overdueAmount"
                subtitle="Needs immediate action"
                icon="AlertTriangle"
                color="red"
              />
              <StatsCard
                title="Payment Rate"
                :value="paymentRate.toFixed(1) + '%'"
                subtitle="Efficiency metric"
                icon="TrendingUp"
                color="green"
              />

          </div>
        </section>

        <!--══════════════════ Main Content ═══════════════════════ -->
        <section class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

             <!-- ══════════════════ Payables Table ══════════════════ -->
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
                  <h2 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Supplier Bills</h2>
                  <div class="relative w-full sm:w-64">
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search by invoice, customer or amount..."
                        class="w-full px-4 py-2 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
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
                <h2 class="text-base sm:text-lg font-medium text-gray-600">Loading bills...</h2>
              </div>

              <!-- Empty State -->
              <div v-else-if="payables.length === 0" class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <div class="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                  <svg class="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A2 2 0 0010.586 3H6a2 2 0 00-2 2v6m16 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                  </svg>
                </div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-700">No Bills Found</h3>
                <p class="text-sm sm:text-base text-gray-500 mt-1">No outstanding bills</p>
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
                          v-for="tab in ['Supplier', 'Bill #', 'Amount', 'Due Date', 'Status', 'Days Overdue']"
                          :key="tab"
                          :class="['Status','Amount','Days Overdue'].includes(col) ? 'text-center' : ''"
                          class="px-4 py-3 text-left text-sm font-semibold"
                          :style="{ color: 'var(--text-main)' }">
                        {{ tab }}
                    </th>

                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="bill in paginatedInvoices"
                      :key="bill.id"
                      class="border-b transition-colors"
                      :style="{
                        borderColor: 'var(--item-border)'
                      }"
                      @mouseenter="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'transparent'"
                    >
                      <td class="px-4 py-3 font-medium"
                        :style="{ color: 'var(--text-main)' }"
                      >
                        {{ bill.supplier }}
                      </td>
                      <td class="px-4 py-3 font-medium" :style="{ color: 'var(--text-main)' }">
                        {{ bill.invoiceNo }}
                      </td>
                      <td class="px-4 py-3 text-left font-semibold" :style="{ color: 'var(--text-main)' }">
                        ${{ bill.amount.toLocaleString() }}
                      </td>
                      <td class="px-4 py-3 text-gray-600" :style="{ color: 'var(--text-main)' }">
                        {{ formatDate(bill.dueDate) }}
                      </td>
                      <td class="px-4 py-3">
                        <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(bill.status)]">
                          {{ bill.status }}
                        </span>
                      </td>
                      <td class="px-4 py-3" :style="{ color: 'var(--text-main)' }">
                        {{ bill.daysOverdue > 0 ? `${bill.daysOverdue} days` : '-' }}
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
                      (filtered from {{ payables.length }})
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

                <!-- Loading -->
                <div v-if="loading" class="space-y-3">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="p-3 rounded-lg animate-pulse"
                    :style="{ background: 'var(--item-bg)' }"
                  >
                    <div class="h-4 rounded mb-2 w-3/4" :style="{ background: 'var(--item-border)' }"></div>
                    <div class="h-2 rounded-full w-full" :style="{ background: 'var(--track-bg)' }"></div>
                  </div>
                </div>

                <!-- Data -->
                <div v-else class="space-y-3">
                  <div
                    v-for="aging in agingData"
                    :key="aging.id"
                    class="p-3 rounded-lg"
                    :style="{ background: 'var(--item-bg)' }"
                  >
                    <div class="flex justify-between items-center mb-2">

                      <span
                        class="text-sm font-medium"
                        :style="{ color: 'var(--text-sub)' }"
                      >
                        {{ aging.period }}
                      </span>

                      <span class="text-sm font-bold" :class="aging.color">
                        {{ aging.percentage }}%
                      </span>
                    </div>

                    <!-- Progress -->
                    <div
                      class="w-full rounded-full h-2"
                      :style="{ background: 'var(--track-bg)' }"
                    >
                      <div
                        class="h-2 rounded-full"
                        :style="{ width: aging.percentage + '%' }"
                        :class="aging.bgColor"
                      ></div>
                    </div>

                    <p
                      class="text-xs mt-1"
                      :style="{ color: 'var(--text-muted)' }"
                    >
                      ${{ aging.amount.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Top Suppliers -->
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
                  Top Suppliers
                </h3>

                <!-- Loading -->
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

                <!-- Data -->
                <div v-else class="space-y-3">
                  <div
                    v-for="(supplier, idx) in topSuppliers"
                    :key="idx"
                    class="flex items-center justify-between p-3 rounded-lg"
                    :style="{ background: 'var(--item-bg)' }"
                  >
                    <div class="flex items-center gap-2">

                      <span
                        class="text-sm font-bold"
                        :style="{ color: 'var(--text-muted)' }"
                      >
                        {{ idx + 1 }}
                      </span>

                      <span
                        class="text-sm"
                        :style="{ color: 'var(--text-sub)' }"
                      >
                        {{ supplier.name }}
                      </span>
                    </div>

                    <span
                      class="text-sm font-bold"
                      :style="{ color: 'var(--text-main)' }"
                    >
                      ${{ supplier.amount.toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Payment Trend -->
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
                  Payment Trend
                </h3>

                <div class="space-y-2 text-sm">

                  <p :style="{ color: 'var(--text-sub)' }">
                    Last 30 Days Payments
                  </p>

                  <p
                    v-if="loading"
                    class="text-2xl font-bold animate-pulse"
                    :style="{ color: 'var(--primary-600)' }"
                  >
                    --
                  </p>

                  <p
                    v-else
                    class="text-2xl font-bold"
                    :style="{ color: 'var(--primary-600)' }"
                  >
                    ${{ last30DaysPayments.toLocaleString() }}
                  </p>

                  <p
                    class="text-xs mt-2"
                    :style="{ color: 'var(--text-muted)' }"
                  >
                    📈 Payment rate stable
                  </p>

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
                icon="CheckCircle2"
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
                :subtitle="'$' + (statusAmounts?.overdue ?? 0).toLocaleString()"
                icon="AlertTriangle"
                color="orange"
              />
              <StatsCard
                title="In Dispute"
                :value="statusCounts.disputed"
               :subtitle="'$' + (statusAmounts?.disputed ?? 0).toLocaleString()"
                icon="MessageSquare"
                color="red"
              />

            </div>
          </div>

          <!-- Cash Flow Impact -->
         <div class="mt-6 rounded-xl shadow-sm border p-6"
              :style="{
                background: 'var(--content-panel-bg)',
                borderColor: 'var(--content-panel-border)',
                boxShadow: 'var(--content-panel-shadow)'
              }"
          >
            <h2 class="text-lg font-bold mb-4" :style="{ color: 'var(--text-main)' }">Cash Flow Planning</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Due This Week"
                :value="dueThisWeek.toLocaleString()"
                subtitle=""
                icon="Receipt"
                color="purple"
              />
              <StatsCard
                title="Due This Month"
                :value="dueThisMonth.toLocaleString()"
                subtitle=""
                icon="Receipt"
                color="purple"
              />
              <StatsCard
                title="Due Next Month"
                :value="dueNextMonth.toLocaleString()"
                subtitle=""
                icon="Receipt"
                color="purple"
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
import { getAccountsPayableReport, exportAccountsPayableReport } from '@/composables/reports'
import StatsCard from '@/layout/StatsCard.vue'

    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)

    // Data
    const payables = ref([])
    const agingData = ref([])

    // Metrics
    const totalPayable = ref(0)
    const paidMonth = ref(0)
    const overdueAmount = ref(0)
    const paymentRate = ref(0)
    const topSuppliers = ref([])
    const statusCounts = ref({ paid: 0, due: 0, overdue: 0, disputed: 0 })
    const statusAmounts = ref({ paid: 0, due: 0, overdue: 0, disputed: 0 })
    const last30DaysPayments = ref(0)

        // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(14)
    const searchQuery = ref('')

     const filteredInvoices = computed(() => {
      if (!searchQuery.value.trim()) {
        return payables.value
      }

      const query = searchQuery.value.toLowerCase()
      return payables.value.filter(invoice => {
        const invoiceNo = (invoice.invoiceNo || '').toLowerCase()
        const supplierName = (invoice.supplier || '').toLowerCase()
        const amount = (invoice.amount || 0).toString()

        return (
          invoiceNo.includes(query) ||
          supplierName.includes(query) ||
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
        'In Dispute': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const goBack = () => {
      router.back()
    }

    const exportReport = async () => {
      try {
        await exportAccountsPayableReport()
        frappe.toast({
          title: 'Success',
          message: 'Report exported successfully',
          indicator: 'green'
        })
      } catch (err) {
        console.error('Export error:', err)
        frappe.toast({
          title: 'Error',
          message: 'Failed to export report',
          indicator: 'red'
        })
      }
    }

    const fetchAPData = async () => {
      try {
        loading.value = true
        error.value = null

        const data = await getAccountsPayableReport({})
        console.log("AP Data =>", data)

        payables.value = data.payables || []
        agingData.value = data.agingData || []
        totalPayable.value = data.totalPayable || 0
        paidMonth.value = data.paidMonth || 0
        overdueAmount.value = data.overdueAmount || 0
        paymentRate.value = data.paymentRate || 0
        topSuppliers.value = data.topSuppliers || []
        statusCounts.value = data.statusCounts || { paid: 0, due: 0, overdue: 0, disputed: 0 }
        statusAmounts.value = data.statusAmounts || { paid: 0, due: 0, overdue: 0, disputed: 0 }

        // Calculate last 30 days payments
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        last30DaysPayments.value = (payables.value || [])
          .filter(inv => {
            const dueDate = new Date(inv.dueDate)
            return dueDate >= thirtyDaysAgo && dueDate <= today && inv.status === 'Paid'
          })
          .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)

      } catch (err) {
        error.value = 'Failed to load Accounts Payable data'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const dueThisWeek = computed(() => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return (payables.value || [])
        .filter(bill => {
          const dueDate = new Date(bill.dueDate)
          return dueDate >= today && dueDate <= nextWeek && bill.status === 'Due'
        })
        .reduce((sum, bill) => sum + bill.amount, 0)
    })

    const dueThisMonth = computed(() => {
      const today = new Date()
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return (payables.value || [])
        .filter(bill => {
          const dueDate = new Date(bill.dueDate)
          return dueDate >= today && dueDate <= endOfMonth && bill.status === 'Due'
        })
        .reduce((sum, bill) => sum + bill.amount, 0)
    })

    const dueNextMonth = computed(() => {
      const today = new Date()
      const startNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const endNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      return (payables.value || [])
        .filter(bill => {
          const dueDate = new Date(bill.dueDate)
          return dueDate >= startNextMonth && dueDate <= endNextMonth && bill.status === 'Due'
        })
        .reduce((sum, bill) => sum + bill.amount, 0)
    })

    onMounted(async () => {
      await fetchAPData()
    })

</script>
