<!-- Reports/Dashboard.vue -->
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
          </div>
        </header>

        <!-- Key Metrics -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Revenue" :value="formatPrice(metrics.totalRevenue)" icon="TrendingUp" color="green" />
            <StatsCard title="Total Expenses" :value="formatPrice(metrics.totalExpenses)" icon="TrendingDown" color="red" />
            <StatsCard title="Net Profit" :value="formatPrice(metrics.netProfit)" icon="DollarSign" color="blue" />
            <StatsCard title="Cash Balance" :value="formatPrice(metrics.cashBalance)" icon="Wallet" color="purple" />
          </div>
        </section>

        <!-- Reports Grid -->
        <section class="flex-1 px-6 pb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Expenses Breakdown -->
            <DashboardCard
              title="Expenses Breakdown"
              description="Detailed expense categories"
              icon="💰"
              @click="navigateTo('Expenses')"
            />
            <!-- Income Statement -->
            <DashboardCard
              title="Income Statement"
              description="Revenue, expenses & profit analysis"
              icon="📊"
              @click="navigateTo('IncomeStatement')"
            />


            <!-- Cash Flow Statement -->
            <DashboardCard
              title="Cash Flow Statement"
              description="Inflow & outflow analysis"
              icon="💵"
              @click="navigateTo('CashFlowStatement')"
            />

            <!-- Balance Sheet -->
            <DashboardCard
              title="Balance Sheet"
              description="Assets, liabilities & equity"
              icon="⚖️"
              @click="navigateTo('BalanceSheet')"
            />

            <!-- Accounts Receivable -->
            <DashboardCard
              title="Accounts Receivable"
              description="Customer invoices & collections"
              icon="📥"
              @click="navigateTo('AccountsReceivable')"
            />

            <!-- Accounts Payable -->
            <DashboardCard
              title="Accounts Payable"
              description="Supplier bills & payments"
              icon="📤"
              @click="navigateTo('AccountsPayable')"
            />

            <!-- SalesAnalytics -->
            <DashboardCard
              title="Sales Analytics"
              description="Sales Analytics "
              icon="📤"
              @click="navigateTo('SalesAnalytics')"
            />
          </div>
        </section>

        <!-- Quick Summary -->
        <section class="flex-shrink-0 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p class="text-sm text-gray-600 mb-1">Current Month Revenue</p>
                <p class="text-2xl font-bold text-green-600">$67,000</p>
              </div>
              <div class="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p class="text-sm text-gray-600 mb-1">Current Month Expenses</p>
                <p class="text-2xl font-bold text-red-600">$38,000</p>
              </div>
              <div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p class="text-sm text-gray-600 mb-1">Current Month Net Profit</p>
                <p class="text-2xl font-bold text-blue-600">$29,000</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import DashboardCard from '@/components/modals/DashboardCard.vue'
import StatsCard from '@/layout/StatsCard.vue'
import { formatPrice } from '@/utils/formatters'
import { FileText } from 'lucide-vue-next'



    const router = useRouter()

    const metrics = reactive({
      totalRevenue: 67000,
      totalExpenses: 38000,
      netProfit: 29000,
      cashBalance: 85000
    })

    const navigateTo = (reportName) => {
      router.push({ name: reportName })
    }

</script>
