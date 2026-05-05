<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <BarChart3 class="w-8 h-8 text-cyan-600" />
              <h1 class="text-lg font-bold text-gray-900">Inventory Tracking</h1>
            </div>
          </div>
        </header>

        <!-- Filters -->
        <section class="px-6 py-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
               <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                <select
                  v-model="selectedWarehouse"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option disabled value="">All Warehouses</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.name" :value="warehouse.name">
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Item</label>
                <select
                  v-model="selectedItem"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option disabled value="">All Items</option>
                  <option v-for="item in items" :key="item.item_code" :value="item.item_code">
                    {{ item.item_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
                <select
                  v-model="movementType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option disabled value="">All Types</option>
                  <option value="purchase">Purchase</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  v-model="fromDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  v-model="toDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>

                <div class="block mb-6"></div>
                <button
                @click="resetFilters"
                class="px-2 py-2 mt-1 bg-gray-100 text-red-500 rounded-lg hover:bg-blue-gray-50 transition"
              >
                <FilterX />
              </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Summary Cards -->
        <section class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Inbound</p>
              <p class="text-2xl font-bold text-green-600">{{ trackingSummary.totalInbound }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Outbound</p>
              <p class="text-2xl font-bold text-red-600">{{ trackingSummary.totalOutbound }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Net Change</p>
              <p :class="['text-2xl font-bold', trackingSummary.netChange >= 0 ? 'text-blue-600' : 'text-orange-600']">
                {{ trackingSummary.netChange }}
              </p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Transactions</p>
              <p class="text-2xl font-bold text-purple-600">{{ filteredTracking.length }}</p>
            </div>
          </div>
        </section>

        <!-- Tracking Table -->
        <section class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="tracking in filteredTracking" :key="tracking.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(tracking.date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ tracking.itemCode }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ tracking.itemName }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ tracking.warehouse }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getMovementBadge(tracking.type)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ tracking.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium">
                      <span :class="tracking.quantity >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ tracking.quantity >= 0 ? '+' : '' }}{{ tracking.quantity }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ tracking.reference }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ tracking.notes }}</td>
                  </tr>
                  <tr v-if="filteredTracking.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center">
                      <p class="text-gray-500">No tracking records found</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '@/layout/Sidebar.vue'
import { useInventoryStore } from '@/stores/inventory'
import { BarChart3, FilterX, Trash2  } from 'lucide-vue-next'
import MainLayout from '@/layout/MainLayout.vue'

    const inventoryStore = useInventoryStore()
    const selectedWarehouse = ref('')
    const selectedItem = ref('')
    const movementType = ref('')
    const fromDate = ref('')
    const toDate = ref('')
    const filter = ref({
           "item_code": null,
            "warehouse": null,
            "from_date": null,
            "to_date": null,
            "movement_type": null,
    })
    const trackingData = ref([])
    watch([selectedItem, selectedWarehouse, movementType, fromDate, toDate], ([newItem, newWarehouse,newMovement, newFrom, newTo]) => {
     console.log('New Values:', {
      newItem,
      newWarehouse,
      newMovement,
      newFrom,
      newTo
    })
      if (newItem || newWarehouse) {
        // fetchData()
        filter.value = {
            "item_code": newItem || null,
            "warehouse": newWarehouse || null,
            "from_date": newFrom || null,
            "to_date": newTo || null,
            "movement_type": newMovement || null,
        }
      }else{
        filter.value = {
           "item_code": null,
            "warehouse": null,
            "from_date": null,
            "to_date": null,
            "movement_type": null,
        }
      }
      // نفّذ أي لوجيك هنا
    })

    const warehouses = computed(() => inventoryStore.warehouses)
    const items = computed(() => inventoryStore.items)

    const filteredTracking = computed(() => {
      let data = [...trackingData.value]

      if (selectedItem.value) {
        data = data.filter(t => t.itemCode === selectedItem.value)
      }
      if(selectedWarehouse.value){
         data = data.filter(w => w.warehouse === selectedWarehouse.value)
         console.log('data (* warehouse)',data)
      }
      if (movementType.value) {
        data = data.filter(t => t.type === movementType.value)
      }

      if (fromDate.value) {
        data = data.filter(t => new Date(t.date) >= new Date(fromDate.value))
      }

      if (toDate.value) {
        data = data.filter(t => new Date(t.date) <= new Date(toDate.value))
      }

      return data.sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const trackingSummary = computed(() => {
      let totalInbound = 0
      let totalOutbound = 0

      filteredTracking.value.forEach(t => {
        if (t.quantity > 0) totalInbound += t.quantity
        else totalOutbound += Math.abs(t.quantity)
      })

      return {
        totalInbound,
        totalOutbound,
        netChange: totalInbound - totalOutbound
      }
    })

    const getMovementBadge = (type) => {
      const badges = {
        purchase: 'bg-green-100 text-green-800',
        transfer: 'bg-blue-100 text-blue-800',
        adjustment: 'bg-yellow-100 text-yellow-800',
        sale: 'bg-red-100 text-red-800'
      }
      return badges[type] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    const resetFilters = () => {
      selectedItem.value = ''
      selectedWarehouse.value = ''
      movementType.value = ''
      fromDate.value = ''
      toDate.value = ''
    }
    onMounted(async () => {
      await inventoryStore.loadItems()
      await inventoryStore.loadWarehouses()
      trackingData.value = await inventoryStore.logTracking(filter.value)
      console.log("Filter",filter.value)
      console.log("response log Tracking", trackingData.value)
    })

</script>
