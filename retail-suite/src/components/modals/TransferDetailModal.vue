<template>
  <div v-if="transfer" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Transfer Details</h3>
          <p class="text-sm text-gray-500 mt-1">Reference: {{ transfer.reference }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl font-light"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Status Badge -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Status</span>
          <span :class="getStatusBadge(transfer.status)" class="px-3 py-1 rounded-full text-sm font-medium">
            {{ capitalizeStatus(transfer.status) }}
          </span>
        </div>

        <!-- Main Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
          <!-- Transfer Info -->
          <div class="space-y-4">
            <h4 class="font-semibold text-gray-900 text-sm uppercase tracking-wide">Transfer Information</h4>

            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Reference Number</p>
                <p class="text-sm font-medium text-gray-900">{{ transfer.reference }}</p>
              </div>

              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Transfer Date</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDate(transfer.date) }}</p>
              </div>

              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <div class="mt-1">
                  <span :class="getStatusBadge(transfer.status)" class="inline-block px-2 py-1 rounded text-xs font-medium">
                    {{ capitalizeStatus(transfer.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Info -->
          <div class="space-y-4">
            <h4 class="font-semibold text-gray-900 text-sm uppercase tracking-wide">Locations</h4>

            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">From Location</p>
                <p class="text-sm font-medium text-gray-900">{{ getLocationName(transfer.from_location) }}</p>
              </div>

              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide">To Location</p>
                <p class="text-sm font-medium text-gray-900">{{ getLocationName(transfer.to_location) }}</p>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
                <span class="text-xs text-gray-600">Transfer direction</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Section -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Transfer Items</h4>

          <div class="overflow-x-auto border border-gray-200 rounded-lg">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Item Code</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700">Item Name</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(item, index) in transfer.items" :key="index" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.item_code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.item_name }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Items Summary -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Items</p>
                <p class="text-2xl font-bold text-gray-900">{{ transfer.items?.length || 0 }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Quantity</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0 }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Transfer Type</p>
                <p class="text-sm font-medium text-gray-900">Inter-location Transfer</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div v-if="transfer.notes" class="pt-4 border-t border-gray-200">
          <h4 class="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Notes</h4>
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-gray-700">{{ transfer.notes }}</p>
          </div>
        </div>

        <!-- Additional Info -->
        <div v-if="transfer.created_at || transfer.updated_at" class="pt-4 border-t border-gray-200">
          <h4 class="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Record Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p class="text-gray-500 uppercase tracking-wide">Created Date</p>
              <p class="text-gray-700 font-medium">{{ formatDateTime(transfer.created_at || transfer.date) }}</p>
            </div>
            <div v-if="transfer.updated_at">
              <p class="text-gray-500 uppercase tracking-wide">Last Updated</p>
              <p class="text-gray-700 font-medium">{{ formatDateTime(transfer.updated_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Printable Section (Hidden in view) -->
        <div id="printable-transfer" class="hidden">
          <div class="p-8">
            <!-- Header -->
            <div class="border-b-2 border-gray-900 pb-4 mb-6">
              <h1 class="text-lg font-bold text-gray-900">Stock Transfer</h1>
              <p class="text-gray-600">Reference: {{ transfer.reference }}</p>
            </div>

            <!-- Info -->
            <div class="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p class="text-xs text-gray-600 uppercase">Transfer Date</p>
                <p class="text-sm font-semibold">{{ formatDate(transfer.date) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase">Status</p>
                <p class="text-sm font-semibold">{{ capitalizeStatus(transfer.status) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase">From</p>
                <p class="text-sm font-semibold">{{ getLocationName(transfer.from_location) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 uppercase">To</p>
                <p class="text-sm font-semibold">{{ getLocationName(transfer.to_location) }}</p>
              </div>
            </div>

            <!-- Items Table -->
            <table class="w-full mb-8 border border-gray-900">
              <thead>
                <tr class="border-b border-gray-900">
                  <th class="p-2 text-left text-xs font-semibold">Item Code</th>
                  <th class="p-2 text-left text-xs font-semibold">Item Name</th>
                  <th class="p-2 text-right text-xs font-semibold">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in transfer.items" :key="index" class="border-b border-gray-300">
                  <td class="p-2 text-xs">{{ item.item_code }}</td>
                  <td class="p-2 text-xs">{{ item.item_name }}</td>
                  <td class="p-2 text-xs text-right">{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Notes -->
            <div v-if="transfer.notes" class="mb-8">
              <p class="text-xs font-semibold uppercase mb-2">Notes</p>
              <p class="text-sm">{{ transfer.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          @click="printTransfer"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2.5"></path>
          </svg>
          Print
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps ({
    transfer: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits(['close'])

    const getLocationName = (location) => {
      const names = {
        main: 'Main Store',
        branch1: 'Branch 1',
        branch2: 'Branch 2',
        warehouse: 'Warehouse'
      }
      return names[location] || location
    }

    const getStatusBadge = (status) => {
      const badges = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in-transit': 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800'
      }
      return badges[status] || 'bg-gray-100 text-gray-800'
    }

    const capitalizeStatus = (status) => {
      return status
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateTime = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const printTransfer = () => {
      const printElement = document.getElementById('printable-transfer')
      if (printElement) {
        const printWindow = window.open('', '', 'height=600,width=800')
        printWindow.document.write(printElement.innerHTML)
        printWindow.document.close()
        printWindow.print()
      }
    }
</script>

<style scoped>
@media print {
  body {
    margin: 0;
    padding: 0;
  }
}
</style>
