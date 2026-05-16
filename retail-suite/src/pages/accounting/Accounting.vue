<!-- Reports.vue -->
<template>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <FileText class="w-8 h-8 text-blue-600" />
              <h1 class="text-lg font-bold text-gray-900">Accounting Reports</h1>
            </div>
            <div class="flex gap-3">
              <button @click="toggleFilters" class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                <Filter class="w-4 h-4" />
                Filters
              </button>
              <button @click="exportReport('pdf')" class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
                <Download class="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </header>

        <!-- Filters Section -->
        <section v-if="showFilters" class="px-6 py-4 bg-white mx-6 my-4 rounded-xl shadow-sm border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select v-model="dateRange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="week">Last Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div v-if="dateRange === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input type="date" v-model="fromDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div v-if="dateRange === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input type="date" v-model="toDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        <!-- Report Type Selection -->
        <section class="px-6 py-6">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              v-for="report in reports"
              :key="report.id"
              @click="selectedReport = report.id"
              :class="[
                'p-4 rounded-lg border-2 transition text-center cursor-pointer',
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              ]"
            >
              <div class="text-2xl mb-2">{{ report.icon }}</div>
              <p class="text-xs font-medium text-gray-700">{{ report.label }}</p>
            </button>
          </div>
        </section>

        <!-- Report Content -->
        <section class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <!-- Income Statement -->
            <div v-if="selectedReport === 'income'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Income Statement</h2>
              <div class="bg-gray-50 rounded-lg p-6">
                <div class="space-y-3">
                  <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span class="text-gray-700 font-medium">Total Revenue</span>
                    <span class="text-lg font-bold text-green-600">$67,000</span>
                  </div>
                  <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span class="text-gray-700 font-medium">Total Expenses</span>
                    <span class="text-lg font-bold text-red-600">$38,000</span>
                  </div>
                  <div class="flex justify-between items-center pt-3">
                    <span class="text-gray-900 font-bold">Net Profit</span>
                    <span class="text-xl font-bold text-blue-600">$29,000</span>
                  </div>
                </div>
              </div>
              <div class="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>

            <!-- Expenses Breakdown -->
            <div v-if="selectedReport === 'expenses'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Expenses Breakdown</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div v-for="expense in expensesData" :key="expense.name" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: expense.color }"></div>
                      <span class="text-gray-700">{{ expense.name }}</span>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-gray-900">${{ expense.value }}</p>
                      <p class="text-xs text-gray-500">{{ expense.percentage }}%</p>
                    </div>
                  </div>
                </div>
                <div class="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p class="text-gray-500">Pie Chart visualization</p>
                </div>
              </div>
            </div>

            <!-- Cash Flow -->
            <div v-if="selectedReport === 'cashflow'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Cash Flow Statement</h2>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cash Inflow</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cash Outflow</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Net Cash Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(flow, idx) in cashFlowData" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-900 font-medium">{{ flow.month }}</td>
                      <td class="px-4 py-3 text-right text-green-600 font-medium">${{ flow.inflow }}</td>
                      <td class="px-4 py-3 text-right text-red-600 font-medium">${{ flow.outflow }}</td>
                      <td class="px-4 py-3 text-right font-bold" :class="flow.inflow - flow.outflow > 0 ? 'text-green-600' : 'text-red-600'">
                        ${{ flow.inflow - flow.outflow }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Balance Sheet -->
            <div v-if="selectedReport === 'balance'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Balance Sheet</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p class="text-sm text-gray-600 mb-2">Total Assets</p>
                  <p class="text-3xl font-bold text-blue-600">$250,000</p>
                </div>
                <div class="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <p class="text-sm text-gray-600 mb-2">Total Liabilities</p>
                  <p class="text-3xl font-bold text-red-600">$85,000</p>
                </div>
                <div class="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <p class="text-sm text-gray-600 mb-2">Total Equity</p>
                  <p class="text-3xl font-bold text-green-600">$165,000</p>
                </div>
              </div>
            </div>

            <!-- Accounts Receivable -->
            <div v-if="selectedReport === 'receivables'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Accounts Receivable Report</h2>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Outstanding</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Collected</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(rec, idx) in receivablesData" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-900 font-medium">{{ rec.month }}</td>
                      <td class="px-4 py-3 text-right text-orange-600 font-medium">${{ rec.outstanding }}</td>
                      <td class="px-4 py-3 text-right text-green-600 font-medium">${{ rec.collected }}</td>
                      <td class="px-4 py-3 text-right font-bold text-blue-600">{{ rec.collectionRate }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Accounts Payable -->
            <div v-if="selectedReport === 'payables'" class="space-y-6">
              <h2 class="text-xl font-bold text-gray-900">Accounts Payable Report</h2>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Outstanding</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Paid</th>
                      <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900">Payment Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(pay, idx) in payablesData" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="px-4 py-3 text-gray-900 font-medium">{{ pay.month }}</td>
                      <td class="px-4 py-3 text-right text-orange-600 font-medium">${{ pay.outstanding }}</td>
                      <td class="px-4 py-3 text-right text-green-600 font-medium">${{ pay.paid }}</td>
                      <td class="px-4 py-3 text-right font-bold text-blue-600">{{ pay.paymentRate }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { FileText, Filter, Download } from 'lucide-vue-next'


    const selectedReport = ref('income')
    const showFilters = ref(false)
    const dateRange = ref('month')
    const fromDate = ref('')
    const toDate = ref('')

    const reports = [
      { id: 'income', label: 'Income Statement', icon: '📊' },
      { id: 'expenses', label: 'Expenses Breakdown', icon: '💰' },
      { id: 'cashflow', label: 'Cash Flow', icon: '💵' },
      { id: 'balance', label: 'Balance Sheet', icon: '⚖️' },
      { id: 'receivables', label: 'A/R Report', icon: '📥' },
      { id: 'payables', label: 'A/P Report', icon: '📤' }
    ]

    const expensesData = [
      { name: 'Salaries', value: 35000, percentage: 35, color: '#3b82f6' },
      { name: 'Rent', value: 12000, percentage: 12, color: '#ef4444' },
      { name: 'Utilities', value: 5000, percentage: 5, color: '#10b981' },
      { name: 'Supplies', value: 8000, percentage: 8, color: '#f59e0b' },
      { name: 'Others', value: 40000, percentage: 40, color: '#8b5cf6' }
    ]

    const cashFlowData = [
      { month: 'Jan', inflow: 45000, outflow: 28000 },
      { month: 'Feb', inflow: 52000, outflow: 31000 },
      { month: 'Mar', inflow: 48000, outflow: 29000 },
      { month: 'Apr', inflow: 61000, outflow: 35000 },
      { month: 'May', inflow: 55000, outflow: 32000 },
      { month: 'Jun', inflow: 67000, outflow: 38000 }
    ]

    const receivablesData = [
      { month: 'Jan', outstanding: 12000, collected: 33000, collectionRate: 73 },
      { month: 'Feb', outstanding: 15000, collected: 37000, collectionRate: 71 },
      { month: 'Mar', outstanding: 10000, collected: 38000, collectionRate: 79 },
      { month: 'Apr', outstanding: 18000, collected: 43000, collectionRate: 70 },
      { month: 'May', outstanding: 14000, collected: 41000, collectionRate: 75 },
      { month: 'Jun', outstanding: 16000, collected: 51000, collectionRate: 76 }
    ]

    const payablesData = [
      { month: 'Jan', outstanding: 8000, paid: 20000, paymentRate: 71 },
      { month: 'Feb', outstanding: 10000, paid: 21000, paymentRate: 68 },
      { month: 'Mar', outstanding: 9000, paid: 20000, paymentRate: 69 },
      { month: 'Apr', outstanding: 12000, paid: 23000, paymentRate: 66 },
      { month: 'May', outstanding: 11000, paid: 21000, paymentRate: 66 },
      { month: 'Jun', outstanding: 13000, paid: 25000, paymentRate: 66 }
    ]

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }

    const exportReport = (format) => {
      console.log(`Exporting report as ${format}`)
      // Add export logic here (PDF, Excel, etc.)
    }

</script>
