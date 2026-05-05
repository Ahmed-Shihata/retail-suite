<template>
<MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <!-- <aside class="sm:block sm:w-[25%] md:w-[20%] lg:w-[8%] h-screen bg-gray-50">
        <Sidebar />
      </aside> -->

      <main class="flex flex-col flex-1 min-h-screen">
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <ArrowRightLeft class="w-8 h-8 text-cyan-600" />
              <h1 class="text-lg font-bold text-gray-900">Inventory Transfer</h1>
            </div>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus class="w-4 h-4" />
              New Transfer
            </button>
          </div>
        </header>

        <!-- Filters -->
        <section class="px-6 py-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Reference No.</label>
                <input
                  v-model="searchReference"
                  type="text"
                  placeholder="Search transfer..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">From Location</label>
                <select
                  v-model="fromLocation"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All</option>
                  <option value="main">Main Store</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">To Location</label>
                <select
                  v-model="toLocation"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All</option>
                  <option value="main">Main Store</option>
                  <option value="branch1">Branch 1</option>
                  <option value="branch2">Branch 2</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="statusFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Summary Cards -->
        <section class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Transfers</p>
              <p class="text-2xl font-bold text-blue-600">{{ transfers.length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-yellow-600">{{ summaryStats.pending }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">In Transit</p>
              <p class="text-2xl font-bold text-blue-600">{{ summaryStats.inTransit }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-green-600">{{ summaryStats.completed }}</p>
            </div>
          </div>
        </section>

        <!-- Transfer Table -->
        <section class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="transfer in filteredTransfers" :key="transfer.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ transfer.reference }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(transfer.date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ getLocationName(transfer.fromLocation) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ getLocationName(transfer.toLocation) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ transfer.items.length }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">
                      {{ transfer.items.reduce((sum, i) => sum + i.quantity, 0) }}
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getStatusBadge(transfer.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ transfer.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium">
                      <div class="flex gap-2">
                        <button
                          @click="viewTransfer(transfer)"
                          class="text-cyan-600 hover:text-cyan-900"
                          title="View"
                        >
                          <Eye class="w-4 h-4" />
                        </button>
                        <button
                          v-if="transfer.status !== 'completed'"
                          @click="editTransfer(transfer)"
                          class="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteTransfer(transfer)"
                          class="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Transfer Modal -->
        <TransferModal
          v-if="showAddModal || showEditModal"
          :show="showAddModal || showEditModal"
          :transfer="editingTransfer"
          :is-editing="showEditModal"
          @save="saveTransfer"
          @close="closeModal"
        />

        <!-- Transfer Detail Modal -->
        <TransferDetailModal
          v-if="showDetailModal"
          :transfer="selectedTransfer"
          @close="showDetailModal = false"
        />
      </main>
    </div>
</MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import Sidebar from '@/layout/Sidebar.vue'
import TransferModal from '@/components/modals/TransferModal.vue'
import TransferDetailModal from '@/components/modals/TransferDetailModal.vue'
import { ArrowRightLeft, Plus, Eye, Edit2, Trash2 } from 'lucide-vue-next'


  const searchReference = ref('')
  const fromLocation = ref('')
  const toLocation = ref('')
  const statusFilter = ref('')
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDetailModal = ref(false)
  const editingTransfer = ref(null)
  const selectedTransfer = ref(null)

  // Mock data - replace with actual API
  const transfers = ref([
    {
      id: 1,
      reference: 'TRF-001',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      fromLocation: 'main',
      toLocation: 'branch1',
      items: [
        { itemCode: 'ITEM001', itemName: 'Coffee Beans', quantity: 20 }
      ],
      status: 'completed'
    },
    {
      id: 2,
      reference: 'TRF-002',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      fromLocation: 'branch1',
      toLocation: 'branch2',
      items: [
        { itemCode: 'ITEM002', itemName: 'Tea Leaves', quantity: 15 }
      ],
      status: 'in-transit'
    },
    {
      id: 3,
      reference: 'TRF-003',
      date: new Date(),
      fromLocation: 'main',
      toLocation: 'branch2',
      items: [
        { itemCode: 'ITEM003', itemName: 'Pastry', quantity: 30 }
      ],
      status: 'pending'
    }
  ])

  const filteredTransfers = computed(() => {
    let data = [...transfers.value]

    if (searchReference.value) {
      data = data.filter(t => t.reference.toLowerCase().includes(searchReference.value.toLowerCase()))
    }

    if (fromLocation.value) {
      data = data.filter(t => t.fromLocation === fromLocation.value)
    }

    if (toLocation.value) {
      data = data.filter(t => t.toLocation === toLocation.value)
    }

    if (statusFilter.value) {
      data = data.filter(t => t.status === statusFilter.value)
    }

    return data.sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const summaryStats = computed(() => {
    return {
      pending: transfers.value.filter(t => t.status === 'pending').length,
      inTransit: transfers.value.filter(t => t.status === 'in-transit').length,
      completed: transfers.value.filter(t => t.status === 'completed').length
    }
  })

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getLocationName = (location) => {
    const names = {
      main: 'Main Store',
      branch1: 'Branch 1',
      branch2: 'Branch 2'
    }
    return names[location] || location
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const viewTransfer = (transfer) => {
    selectedTransfer.value = transfer
    showDetailModal.value = true
  }

  const editTransfer = (transfer) => {
    editingTransfer.value = { ...transfer }
    showEditModal.value = true
  }

  const saveTransfer = (transferData) => {
    if (showEditModal.value && editingTransfer.value) {
      const index = transfers.value.findIndex(t => t.id === editingTransfer.value.id)
      transfers.value[index] = { ...editingTransfer.value, ...transferData }
    } else {
      transfers.value.push({
        id: Math.max(...transfers.value.map(t => t.id), 0) + 1,
        ...transferData
      })
    }
    closeModal()
  }

  const deleteTransfer = (transfer) => {
    if (confirm(`Delete transfer ${transfer.reference}?`)) {
      transfers.value = transfers.value.filter(t => t.id !== transfer.id)
    }
  }

  const closeModal = () => {
    showAddModal.value = false
    showEditModal.value = false
    editingTransfer.value = null
  }

</script>
