<!-- Reports/Expenses.vue -->
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
              <h1 class="text-lg font-bold text-gray-900">Expenses Breakdown</h1>
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
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p class="text-sm text-gray-600 mb-2">Total Expenses</p>
              <p class="text-3xl font-bold text-red-600">$38,000</p>
              <p class="text-xs text-gray-500 mt-2">Current Month</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p class="text-sm text-gray-600 mb-2">Average Daily</p>
              <p class="text-3xl font-bold text-orange-600">$1,267</p>
              <p class="text-xs text-gray-500 mt-2">30 days</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p class="text-sm text-gray-600 mb-2">Highest Category</p>
              <p class="text-3xl font-bold text-purple-600">$8,000</p>
              <p class="text-xs text-gray-500 mt-2">Salaries & Wages</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <p class="text-sm text-gray-600 mb-2">vs. Last Month</p>
              <p class="text-3xl font-bold text-green-600">-5.2%</p>
              <p class="text-xs text-gray-500 mt-2">Decrease</p>
            </div>
          </div>
        </section>

        <!-- Content -->
        <section class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Expenses List -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Expense Categories</h2>
              <div class="space-y-4">
                <div v-for="expense in expenseCategories" :key="expense.id" class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div :style="{ backgroundColor: expense.color }" class="w-4 h-4 rounded-full"></div>
                      <div>
                        <p class="font-semibold text-gray-900">{{ expense.name }}</p>
                        <p class="text-sm text-gray-500">{{ expense.description }}</p>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-gray-900">${{ expense.amount.toLocaleString() }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div :style="{ width: expense.percentage + '%', backgroundColor: expense.color }" class="h-2 rounded-full transition-all"></div>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">{{ expense.percentage }}% of total</span>
                    <span class="text-xs font-medium text-gray-600">{{ expense.count }} transactions</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary Card -->
            <div class="space-y-6">
              <!-- Pie Chart Alternative -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-6">Distribution</h3>
                <div class="space-y-3">
                  <div v-for="expense in expenseCategories" :key="expense.id" class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div :style="{ backgroundColor: expense.color }" class="w-3 h-3 rounded-full"></div>
                      <span class="text-sm text-gray-700">{{ expense.name }}</span>
                    </div>
                    <span class="text-sm font-semibold text-gray-900">{{ expense.percentage }}%</span>
                  </div>
                </div>
              </div>

              <!-- Top 3 Expenses -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Top 3 Expenses</h3>
                <div class="space-y-3">
                  <div v-for="(expense, idx) in topExpenses" :key="idx" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-bold text-gray-400">{{ idx + 1 }}</span>
                      <span class="text-sm text-gray-700">{{ expense.name }}</span>
                    </div>
                    <span class="text-sm font-bold text-gray-900">${{ expense.amount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Trends -->
              <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Monthly Trend</h3>
                <div class="space-y-2 text-sm">
                  <p class="text-gray-600">Last 3 Months Average</p>
                  <p class="text-2xl font-bold text-red-600">$36,500</p>
                  <p class="text-xs text-gray-500 mt-2">📈 Current: $38,000</p>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import { ArrowLeft, Download } from 'lucide-vue-next'


    const router = useRouter()

    const expenseCategories = [
      { id: 1, name: 'Salaries & Wages', description: '12 employees + benefits', amount: 8000, percentage: 21, color: '#3b82f6', count: 12 },
      { id: 2, name: 'Rent & Lease', description: 'Office space + parking', amount: 3500, percentage: 9, color: '#ef4444', count: 2 },
      { id: 3, name: 'Utilities', description: 'Electric, water, internet', amount: 1200, percentage: 3, color: '#10b981', count: 5 },
      { id: 4, name: 'Marketing & Ads', description: 'Digital & print campaigns', amount: 5500, percentage: 14, color: '#f59e0b', count: 18 },
      { id: 5, name: 'Office Supplies', description: 'Equipment & materials', amount: 2100, percentage: 6, color: '#8b5cf6', count: 24 },
      { id: 6, name: 'Travel & Transport', description: 'Client meetings & deliveries', amount: 4200, percentage: 11, color: '#ec4899', count: 8 },
      { id: 7, name: 'Professional Services', description: 'Legal, accounting, consulting', amount: 3900, percentage: 10, color: '#06b6d4', count: 6 },
      { id: 8, name: 'Software & Licenses', description: 'Tools & subscriptions', amount: 1600, percentage: 4, color: '#14b8a6', count: 9 },
      { id: 9, name: 'Insurance', description: 'Liability & property', amount: 1500, percentage: 4, color: '#f97316', count: 1 },
      { id: 10, name: 'Miscellaneous', description: 'Other expenses', amount: 1000, percentage: 3, color: '#6b7280', count: 7 }
    ]

    const topExpenses = computed(() => {
      return [...expenseCategories]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
    })

    const goBack = () => {
      router.back()
    }

    const exportReport = () => {
      console.log('Exporting Expenses Report...')
    }


</script>
