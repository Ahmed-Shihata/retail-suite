<template>
   <div>
      <Header pageTitle="Archive & History" icon="ArchiveIcon" color="blue" />
      <!-- Content -->
      <main class="flex flex-1 ml-6 mr-6 overflow-hidden">
        <div class="w-full px-2 sm:px-6 lg:px-8 py-8">

          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="rounded-lg shadow-sm p-6" style="background: var(--card-bg); border: 1px solid var(--card-border);">
              <div class="flex items-center">
                <div class="p-3 rounded-lg" :style="{ background: 'var(--icon-bg-blue)', color: 'var(--icon-color-blue)' }">
                  <ReceiptIcon class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-sub)' }">Total Transactions</p>
                  <p class="text-2xl font-semibold" :style="{ color: 'var(--text-main)' }">247</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg shadow-sm p-6" style="background: var(--card-bg); border: 1px solid var(--card-border);">
              <div class="flex items-center">
                <div class="p-3 rounded-lg" :style="{ background: 'var(--icon-bg-green)', color: 'var(--icon-color-green)' }">
                  <DollarIcon class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-sub)' }">Total Sales</p>
                  <p class="text-2xl font-semibold" :style="{ color: 'var(--text-main)' }">USD 12,450,000</p>
                </div>
              </div>
            </div>

            <div class="rounded-lg shadow-sm p-6" style="background: var(--card-bg); border: 1px solid var(--card-border);">
              <div class="flex items-center">
                <div class="p-3 rounded-lg" :style="{ background: 'var(--icon-bg-purple)', color: 'var(--icon-color-purple)' }">
                  <TrendingUpIcon class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-sub)' }">Average Transaction</p>
                  <p class="text-2xl font-semibold" :style="{ color: 'var(--text-main)' }">USD 50,405</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Coming Soon Message -->
          <div class="rounded-lg shadow-sm p-12 text-center" style="background: var(--card-bg); border: 1px solid var(--card-border);">
            <ArchiveIcon class="w-24 h-24 mx-auto mb-6" :style="{ color: 'var(--text-muted)' }" />
            <h2 class="text-2xl font-bold mb-4" :style="{ color: 'var(--text-main)' }">Archive & History</h2>
            <p class="mb-6 max-w-2xl mx-auto" :style="{ color: 'var(--text-sub)' }">
              This section will contain transaction history, sales reports, customer data, and backup management.
              Features include transaction search, date filtering, sales analytics, and data export capabilities.
            </p>

            <!-- Feature List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
              <div class="text-left">
                <h3 class="font-semibold mb-3" :style="{ color: 'var(--text-main)' }">Transaction History</h3>
                <ul class="space-y-2 text-sm" :style="{ color: 'var(--text-sub)' }">
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    View all past transactions
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    Search and filter by date, amount, items
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    Print or email past receipts
                  </li>
                </ul>
              </div>

              <div class="text-left">
                <h3 class="font-semibold mb-3" :style="{ color: 'var(--text-main)' }">Data Management</h3>
                <ul class="space-y-2 text-sm" :style="{ color: 'var(--text-sub)' }">
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    Export data to CSV/Excel
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    Backup and restore functionality
                  </li>
                  <li class="flex items-center">
                    <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                    Data analytics and reports
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-8">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style="background: var(--primary-100); color: var(--primary-700)">
                <ClockIcon class="w-4 h-4 mr-1" />
                Coming Soon
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
</template>

<script setup>
import ArchiveIcon from '@/components/icons/ArchiveIcon.svg'
import ExportIcon from '@/components/icons/ExportIcon.svg'
import RefreshIcon from '@/components/icons/RefreshIcon.svg'
import ReceiptIcon from '@/components/icons/ReceiptIcon.svg'
import DollarIcon from '@/components/icons/DollarIcon.svg'
import TrendingUpIcon from '@/components/icons/TrendingUpIcon.svg'
import CheckIcon from '@/components/icons/CheckIcon.svg'
import ClockIcon from '@/components/icons/ClockIcon.svg'
import Header from '@/layout/Header.vue'
</script>

<style scoped>
.bg-gray-50 {
  background-color: #f8fafc;
}

/* Additional color utilities */
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-600 { color: #16a34a; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-600 { color: #9333ea; }
.bg-cyan-100 { background-color: #cffafe; }
.text-cyan-800 { color: #155e75; }

/* Hover effects */
.hover\:bg-gray-600:hover {
  background-color: #4b5563;
}

.hover\:bg-cyan-600:hover {
  background-color: #0891b2;
}

/* Transition effects */
.transition-colors {
  transition: background-color 0.2s ease;
}
</style>
