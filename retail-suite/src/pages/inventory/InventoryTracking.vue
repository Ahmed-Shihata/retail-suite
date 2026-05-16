<!-- InventoryTracking.vue -->
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
              <BarChart3 class="w-5 h-5" :style="{ color: 'var(--focus-ring)' }" />
              <div>
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Inventory Tracking</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ filteredTracking.length }} transactions</p>
              </div>
            </div>
          </div>
        </header>

        <!-- ══════════════════ STATISTICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Statistics
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <StatsCard title="Total Inbound"     :value="trackingSummary.totalInbound"    icon="TrendingUp"  color="green"  />
              <StatsCard title="Total Outbound"    :value="trackingSummary.totalOutbound"   icon="TrendingDown" color="orange" />
              <StatsCard title="Net Change"        :value="trackingSummary.netChange"       icon="BarChart3"   color="blue"   />
              <StatsCard title="Transactions"      :value="filteredTracking.length"         icon="Package"     color="purple" />
            </div>
          </div>
        </section>

        <!-- ══════════════════ FILTERS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">

              <!-- Warehouse -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Warehouse</label>
                <select
                  v-model="selectedWarehouse"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                >
                  <option value="">All Warehouses</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.name" :value="warehouse.name">
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>

              <!-- Item -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Item</label>
                <select
                  v-model="selectedItem"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                >
                  <option value="">All Items</option>
                  <option v-for="item in items" :key="item.item_code" :value="item.item_code">
                    {{ item.item_name }}
                  </option>
                </select>
              </div>

              <!-- Movement Type -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Movement Type</label>
                <select
                  v-model="movementType"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                >
                  <option value="">All Types</option>
                  <option value="purchase">Purchase</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="sale">Sale</option>
                </select>
              </div>

              <!-- From Date -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">From</label>
                <input
                  v-model="fromDate"
                  type="date"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

              <!-- To Date -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">To</label>
                <input
                  v-model="toDate"
                  type="date"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

            </div>

            <!-- Second Row: Count + Clear -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Count</label>
                <div
                  class="px-2 py-1.5 rounded-md font-semibold text-xs"
                  :style="{
                    background: 'var(--item-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--item-border)'
                  }"
                >
                  {{ filteredTracking.length }} records
                </div>
              </div>

              <div></div>

              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="w-full px-3 py-1.5 rounded-md text-xs transition-colors"
                  :style="{
                    background: 'var(--item-bg)',
                    color: 'var(--text-sub)',
                    border: '1px solid var(--item-border)'
                  }"
                  @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                  @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ══════════════════ TABLE ══════════════════ -->
        <section class="px-3 pt-3 pb-3">
          <div
            class="rounded-lg shadow-sm flex flex-col overflow-hidden"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <!-- Table Header Bar -->
            <div
              class="px-4 py-2 flex items-center gap-2"
              :style="{ borderBottom: '1px solid var(--card-border)' }"
            >
              <BarChart3 class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
              <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">Tracking Records</span>
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">({{ filteredTracking.length }})</span>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto" style="scrollbar-width: thin;">
              <table class="w-full border-collapse" style="font-size: 12px; min-width: 750px;">
                <thead class="sticky top-0 z-10" :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th
                      v-for="label in ['Date', 'Item Code', 'Item Name', 'Warehouse', 'Type', 'Quantity', 'Reference', 'Notes']"
                      :key="label"
                      class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      :style="{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }"
                    >
                      {{ label }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <!-- Empty -->
                  <tr v-if="paginatedTracking.length === 0">
                    <td colspan="8" class="py-14 text-center">
                      <div class="flex flex-col items-center gap-2">
                        <div
                          class="w-10 h-10 flex items-center justify-center rounded-full mb-1"
                          :style="{ background: 'var(--item-bg)' }"
                        >
                          <BarChart3 class="w-5 h-5" :style="{ color: 'var(--text-muted)', opacity: 0.5 }" />
                        </div>
                        <p class="text-xs font-medium" :style="{ color: 'var(--text-sub)' }">No Tracking Records Found</p>
                        <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Rows -->
                  <tr
                    v-else
                    v-for="tracking in paginatedTracking"
                    :key="tracking.id"
                    class="transition-colors"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
                  >
                    <!-- Date -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ formatDate(tracking.date) }}
                    </td>

                    <!-- Item Code -->
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span
                        class="font-mono text-xs px-2 py-0.5 rounded"
                        :style="{ background: 'var(--item-bg)', color: 'var(--text-sub)', border: '1px solid var(--item-border)' }"
                      >{{ tracking.itemCode }}</span>
                    </td>

                    <!-- Item Name -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-sub)' }">
                      {{ tracking.itemName }}
                    </td>

                    <!-- Warehouse -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-sub)' }">
                      {{ tracking.warehouse }}
                    </td>

                    <!-- Type Badge -->
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
                        style="font-size: 10px;"
                        :style="getMovementStyle(tracking.type)"
                      >
                        {{ tracking.type }}
                      </span>
                    </td>

                    <!-- Quantity -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs font-semibold">
                      <span :style="{ color: tracking.quantity >= 0 ? 'var(--icon-color-green)' : 'var(--warning-border)' }">
                        {{ tracking.quantity >= 0 ? '+' : '' }}{{ tracking.quantity }}
                      </span>
                    </td>

                    <!-- Reference -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ tracking.reference || '—' }}
                    </td>

                    <!-- Notes -->
                    <td class="px-3 py-2 text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ tracking.notes || '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="px-4 py-2.5"
              :style="{ borderTop: '1px solid var(--card-border)', background: 'var(--item-bg)' }"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}–{{ Math.min(currentPage * itemsPerPage, filteredTracking.length) }}
                  of {{ filteredTracking.length }}
                </span>
                <div class="flex items-center gap-1">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                    :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                  >Prev</button>

                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    class="px-2 py-1 text-xs rounded transition-colors font-medium"
                    :style="currentPage === page
                      ? { background: 'var(--focus-ring)', color: '#fff', border: '1px solid var(--focus-ring)' }
                      : { background: 'var(--card-bg)', color: 'var(--text-sub)', border: '1px solid var(--card-border)' }"
                  >{{ page }}</button>

                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                    :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                  >Next</button>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import StatsCard from '@/layout/StatsCard.vue'
import { useInventoryStore } from '@/stores/inventory'
import { BarChart3 } from 'lucide-vue-next'

const inventoryStore    = useInventoryStore()
const selectedWarehouse = ref('')
const selectedItem      = ref('')
const movementType      = ref('')
const fromDate          = ref('')
const toDate            = ref('')
const trackingData      = ref([])

// Pagination
const currentPage  = ref(1)
const itemsPerPage = ref(20)

const filter = ref({
  item_code:     null,
  warehouse:     null,
  from_date:     null,
  to_date:       null,
  movement_type: null,
})

watch([selectedItem, selectedWarehouse, movementType, fromDate, toDate], ([newItem, newWarehouse, newMovement, newFrom, newTo]) => {
  currentPage.value = 1
  if (newItem || newWarehouse) {
    filter.value = {
      item_code:     newItem      || null,
      warehouse:     newWarehouse || null,
      from_date:     newFrom      || null,
      to_date:       newTo        || null,
      movement_type: newMovement  || null,
    }
  } else {
    filter.value = { item_code: null, warehouse: null, from_date: null, to_date: null, movement_type: null }
  }
})

const warehouses = computed(() => inventoryStore.warehouses)
const items      = computed(() => inventoryStore.items)

const filteredTracking = computed(() => {
  let data = [...trackingData.value]
  if (selectedItem.value)      data = data.filter(t => t.itemCode  === selectedItem.value)
  if (selectedWarehouse.value) data = data.filter(t => t.warehouse === selectedWarehouse.value)
  if (movementType.value)      data = data.filter(t => t.type      === movementType.value)
  if (fromDate.value)          data = data.filter(t => new Date(t.date) >= new Date(fromDate.value))
  if (toDate.value)            data = data.filter(t => new Date(t.date) <= new Date(toDate.value))
  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const paginatedTracking = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTracking.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
  Math.ceil(filteredTracking.value.length / itemsPerPage.value)
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end   = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const trackingSummary = computed(() => {
  let totalInbound = 0, totalOutbound = 0
  filteredTracking.value.forEach(t => {
    if (t.quantity > 0) totalInbound  += t.quantity
    else                totalOutbound += Math.abs(t.quantity)
  })
  return { totalInbound, totalOutbound, netChange: totalInbound - totalOutbound }
})

// CSS-variable-based badge styles instead of hardcoded Tailwind colors
const getMovementStyle = (type) => {
  const styles = {
    purchase:   { background: 'var(--icon-bg-green)',  color: 'var(--icon-color-green)' },
    transfer:   { background: 'var(--info-bg)',        color: 'var(--focus-ring)'       },
    adjustment: { background: 'var(--warning-bg)',     color: 'var(--warning-border)'   },
    sale:       { background: 'var(--error-bg, #fef2f2)', color: '#ef4444'              },
  }
  return styles[type] || { background: 'var(--item-bg)', color: 'var(--text-muted)' }
}

const formatDate  = (date) => new Date(date).toLocaleDateString()

const resetFilters = () => {
  selectedItem.value      = ''
  selectedWarehouse.value = ''
  movementType.value      = ''
  fromDate.value          = ''
  toDate.value            = ''
  currentPage.value       = 1
}

onMounted(async () => {
  await inventoryStore.loadItems()
  await inventoryStore.loadWarehouses()
  trackingData.value = await inventoryStore.logTracking(filter.value)
})
</script>
