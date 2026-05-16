<!-- Dashboard Inventory.vue -->
<template>

    <div>
      <!-- Main Content -->
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header
          class="mx-3 mt-1 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)'
          }"
        >
          <div class="px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Package class="w-8 h-8" :style="{color: primaryColor}" />
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">
                Inventory Management Dashboard
              </h1>
            </div>
          </div>
        </header>

        <!-- Dashboard Stats -->
        <section class="px-2 py-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <StatsCard title="Total Items" :value="stats.totalItems" icon="Package" color="blue" />
            <StatsCard title="Total Inventory Value" :value="formatPrice(stats.totalValue)" icon="DollarSign" color="green" />
            <StatsCard title="Low Stock Items" :value="stats.lowStock" icon="AlertCircle" color="yellow" />
            <StatsCard title="Out of Stock" :value="stats.outOfStock" icon="TrendingDown" color="red" />
          </div>
        </section>

        <!-- Dashboard Cards Grid -->
        <section class="px-2 pb-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <DashboardCard title="Barcodes Unified" description="Manage Items Generate, Scan Barcodes" icon="ScannerIcon" color="red" @click="navigateTo('inventory-Barcodesunified')" />
            <DashboardCard title="Item Price" description="Manage pricing per price list" icon="Tag" color="red" @click="navigateTo('Item-Price')" />
            <DashboardCard title="Inventory Tracking" description="Track inventory movements and history" icon="BarChart3" color="purple" @click="navigateTo('inventory-tracking')" />
            <DashboardCard title="Purchase Receipt" description="Manage incoming purchases" icon="ShoppingCart" color="green" @click="navigateTo('purchase-receipt')" />
            <DashboardCard title="Inventory Transfer" description="Transfer items between locations" icon="ArrowRightLeft" color="indigo" @click="navigateTo('inventory-transfer')" />
            <DashboardCard title="Inventory Balance" description="View current inventory balance" icon="Scale" color="orange" @click="navigateTo('inventory-balance')" />
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="px-2 pb-2">
          <div
            class="rounded-xl shadow-sm p-6"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <h2 class="text-lg font-semibold mb-4" :style="{ color: 'var(--text-main)' }">
              Recent Activity
            </h2>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-center justify-between pb-3"
                :style="{ borderBottom: '1px solid var(--card-border)' }"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-full flex items-center justify-center', activity.bgColor]">
                    <component :is="activity.icon" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">
                      {{ activity.title }}
                    </p>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ activity.timestamp }}
                    </p>
                  </div>
                </div>
                <span :class="['text-xs font-medium px-2 py-1 rounded', activity.badgeClass]">
                  {{ activity.status }}
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

import Sidebar from '@/layout/Sidebar.vue'
import StatsCard from '@/layout/StatsCard.vue'
import DashboardCard from '@/components/modals/DashboardCard.vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { formatPrice } from '@/utils/formatters'
import { Package } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const primaryColor = computed(() => settingsStore.settings.appearance.primaryColor || '#06b6d4')
const router = useRouter()
const productsStore = useProductsStore()

const stats = reactive({
  totalItems: 0,
  totalValue: 0,
  lowStock: 0,
  outOfStock: 0
})

const recentActivities = ref([

])

const calculateStats = () => {
  stats.totalItems = productsStore.products.length
  stats.totalValue = productsStore.products.reduce((total, product) => {
    return total + (product.rate * (product.actual_qty || 0))
  }, 0)
  stats.lowStock = productsStore.products.filter(p => (p.actual_qty || 0) > 0 && (p.actual_qty || 0) < 10).length
  stats.outOfStock = productsStore.products.filter(p => (p.actual_qty || 0) === 0).length
}

const navigateTo = (route) => {
  console.log('route',route)
  router.push({ name: route })
}

onMounted(() => {
  productsStore.loadProductsFromFrappeDB()
  calculateStats()
})

</script>
