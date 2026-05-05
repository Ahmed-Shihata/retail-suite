<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[9999] p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-cyan-50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Invoice Details</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <CloseIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-96 p-6">
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><strong>Receipt No:</strong> {{ invoice.name }}</div>
          <div><strong>Date:</strong> {{ formatDateTime(invoice.posting_date || invoice.createdAt) }}</div>
          <div><strong>Cashier:</strong> {{ invoice.owner || invoice.cashier }}</div>
          <div><strong>Payment:</strong> {{ invoice.paymentMethod || 'Cash' }}</div>
        </div>

        <div class="mb-6">
          <h4 class="font-medium mb-3">Items</h4>
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left">Item</th>
                  <th class="px-3 py-2 text-center">Qty</th>
                  <th class="px-3 py-2 text-right">Price</th>
                  <th class="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in invoice.items" :key="item.item_code || item.item_name" class="border-t">
                  <td class="px-3 py-2">{{ item.item_name }}</td>
                  <td class="px-3 py-2 text-center">{{ item.qty }}</td>
                  <td class="px-3 py-2 text-right">{{ formatPrice(item.rate) }}</td>
                  <td class="px-3 py-2 text-right">{{ formatPrice(item.qty * item.rate) }}</td>
                </tr>
                <tr class="border-t bg-gray-50 font-semibold">
                  <td colspan="3" class="px-3 py-2">Total</td>
                  <td class="px-3 py-2 text-right">{{ formatPrice(invoice.grand_total || invoice.summary?.total || 0) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
        <button
          @click="$emit('print', invoice)"
          class="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          Print Invoice
        </button>
        <button
          @click="$emit('close')"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import CloseIcon from '@/components/icons/CloseIcon.svg'
import { formatPrice } from '../../utils/formatters';

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close', 'print'])

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-SA')
}


</script>

<style scoped>
/* Optional: Add smooth scroll behavior */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f7fafc;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}
</style>
