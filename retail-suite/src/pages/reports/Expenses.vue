<!-- Reports/Expenses.vue -->
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
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Expenses Breakdown</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Category expense analysis</p>
              </div>
            </div>
            <button
              @click="exportReport"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors"
              :style="{ background: 'var(--icon-color-green)' }"
              @mouseover="$event.currentTarget.style.opacity = '0.85'"
              @mouseleave="$event.currentTarget.style.opacity = '1'"
            >
              <Download class="w-3 h-3" />
              Export
            </button>
          </div>
        </header>

        <!-- ══════════════════ STATISTICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Key Metrics
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <StatsCard title="Total Expenses"    value="$38,000" icon="TrendingDown" color="orange" />
              <StatsCard title="Average Daily"     value="$1,267"  icon="BarChart2"   color="blue"   />
              <StatsCard title="Highest Category"  value="$8,000"  icon="AlertCircle" color="purple" />
              <StatsCard title="vs. Last Month"    value="-5.2%"   icon="TrendingUp"  color="green"  />
            </div>
          </div>
        </section>

        <!-- ══════════════════ CONTENT ══════════════════ -->
        <section class="px-3 pt-3 pb-4">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">

            <!-- Expense Categories List -->
            <div
              class="lg:col-span-2 rounded-lg shadow-sm p-4"
              :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
            >
              <h2 class="text-xs font-bold mb-3" :style="{ color: 'var(--text-main)' }">Expense Categories</h2>

              <div class="space-y-2">
                <div
                  v-for="expense in expenseCategories"
                  :key="expense.id"
                  class="p-3 rounded-md transition-colors"
                  :style="{ border: '1px solid var(--card-border)' }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                  @mouseleave="$event.currentTarget.style.background = 'transparent'"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: expense.color }" />
                      <div>
                        <p class="text-xs font-semibold" :style="{ color: 'var(--text-main)' }">{{ expense.name }}</p>
                        <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ expense.description }}</p>
                      </div>
                    </div>
                    <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">
                      ${{ expense.amount.toLocaleString() }}
                    </span>
                  </div>
                  <!-- Progress bar -->
                  <div class="w-full rounded-full h-1.5" :style="{ background: 'var(--item-bg)' }">
                    <div
                      class="h-1.5 rounded-full transition-all"
                      :style="{ width: expense.percentage + '%', background: expense.color }"
                    />
                  </div>
                  <div class="flex justify-between items-center mt-1.5">
                    <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ expense.percentage }}% of total</span>
                    <span class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">{{ expense.count }} transactions</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-3">

              <!-- Distribution -->
              <div
                class="rounded-lg shadow-sm p-4"
                :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
              >
                <h3 class="text-xs font-bold mb-3" :style="{ color: 'var(--text-main)' }">Distribution</h3>
                <div class="space-y-2">
                  <div
                    v-for="expense in expenseCategories"
                    :key="expense.id"
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: expense.color }" />
                      <span class="text-xs truncate max-w-[120px]" :style="{ color: 'var(--text-sub)' }">{{ expense.name }}</span>
                    </div>
                    <span class="text-xs font-semibold" :style="{ color: 'var(--text-main)' }">{{ expense.percentage }}%</span>
                  </div>
                </div>
              </div>

              <!-- Top 3 -->
              <div
                class="rounded-lg shadow-sm p-4"
                :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
              >
                <h3 class="text-xs font-bold mb-3" :style="{ color: 'var(--text-main)' }">Top 3 Expenses</h3>
                <div class="space-y-2">
                  <div
                    v-for="(expense, idx) in topExpenses"
                    :key="idx"
                    class="flex items-center justify-between px-3 py-2 rounded-md"
                    :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold" :style="{ color: 'var(--text-muted)' }">{{ idx + 1 }}</span>
                      <span class="text-xs" :style="{ color: 'var(--text-sub)' }">{{ expense.name }}</span>
                    </div>
                    <span class="text-xs font-bold" :style="{ color: 'var(--text-main)' }">
                      ${{ expense.amount.toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Monthly Trend -->
              <div
                class="rounded-lg shadow-sm p-4"
                :style="{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }"
              >
                <h3 class="text-xs font-bold mb-2" :style="{ color: 'var(--text-main)' }">Monthly Trend</h3>
                <div class="space-y-1">
                  <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Last 3 Months Average</p>
                  <p class="text-xl font-bold" style="color: #ef4444;">$36,500</p>
                  <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">📈 Current: $38,000</p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>

</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import StatsCard from '@/layout/StatsCard.vue'
import { ArrowLeft, Download } from 'lucide-vue-next'

const router = useRouter()

const expenseCategories = [
  { id: 1,  name: 'Salaries & Wages',      description: '12 employees + benefits',       amount: 8000, percentage: 21, color: '#3b82f6', count: 12 },
  { id: 2,  name: 'Rent & Lease',           description: 'Office space + parking',         amount: 3500, percentage: 9,  color: '#ef4444', count: 2  },
  { id: 3,  name: 'Utilities',              description: 'Electric, water, internet',       amount: 1200, percentage: 3,  color: '#10b981', count: 5  },
  { id: 4,  name: 'Marketing & Ads',        description: 'Digital & print campaigns',       amount: 5500, percentage: 14, color: '#f59e0b', count: 18 },
  { id: 5,  name: 'Office Supplies',        description: 'Equipment & materials',           amount: 2100, percentage: 6,  color: '#8b5cf6', count: 24 },
  { id: 6,  name: 'Travel & Transport',     description: 'Client meetings & deliveries',    amount: 4200, percentage: 11, color: '#ec4899', count: 8  },
  { id: 7,  name: 'Professional Services',  description: 'Legal, accounting, consulting',   amount: 3900, percentage: 10, color: '#06b6d4', count: 6  },
  { id: 8,  name: 'Software & Licenses',    description: 'Tools & subscriptions',           amount: 1600, percentage: 4,  color: '#14b8a6', count: 9  },
  { id: 9,  name: 'Insurance',              description: 'Liability & property',            amount: 1500, percentage: 4,  color: '#f97316', count: 1  },
  { id: 10, name: 'Miscellaneous',          description: 'Other expenses',                  amount: 1000, percentage: 3,  color: '#6b7280', count: 7  },
]

const topExpenses = computed(() =>
  [...expenseCategories].sort((a, b) => b.amount - a.amount).slice(0, 3)
)

const goBack       = () => router.back()
const exportReport = () => console.log('Exporting Expenses Report...')
</script>
