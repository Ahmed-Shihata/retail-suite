<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @mousedown.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div class="flex items-center gap-3">
            <div class="bg-purple-100 p-2 rounded-lg">
              <FileText class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">Create Purchase Invoice</h2>
              <p class="text-sm text-gray-500">From Receipt: <span class="font-medium text-purple-600">{{ receipt?.name }}</span></p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- Supplier Info (read-only) -->
          <div class="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Supplier</p>
              <p class="font-semibold text-gray-900">{{ receipt?.supplier }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Original Receipt Date</p>
              <p class="font-semibold text-gray-900">{{ formatDate(receipt?.posting_date) }}</p>
            </div>
          </div>

          <!-- Posting Date & Time -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <Clock class="w-4 h-4 text-cyan-600" />
              <h3 class="font-semibold text-gray-800">Posting Date & Time</h3>
              <label class="ml-auto flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="form.set_posting_time"
                  class="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                Override Date/Time
              </label>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Posting Date</label>
                <input
                  v-model="form.posting_date"
                  type="date"
                  :disabled="!form.set_posting_time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Posting Time</label>
                <input
                  v-model="form.posting_time"
                  type="time"
                  step="1"
                  :disabled="!form.set_posting_time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                />
              </div>
            </div>

            <p v-if="!form.set_posting_time" class="text-xs text-gray-400 mt-1.5">
              Enable override to customize the posting date and time.
            </p>
          </div>

          <!-- Items Table -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <Package class="w-4 h-4 text-cyan-600" />
              <h3 class="font-semibold text-gray-800">Items</h3>
              <span class="ml-auto text-xs text-gray-400">You can edit Rate and Qty for this invoice</span>
            </div>

            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">UOM</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-28">Qty</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-32">Rate</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="(item, index) in form.items"
                    :key="index"
                    class="hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-3 text-gray-400 text-xs">{{ index + 1 }}</td>
                    <td class="px-4 py-3">
                      <p class="font-medium text-gray-900">{{ item.item_code }}</p>
                      <p v-if="item.item_name && item.item_name !== item.item_code" class="text-xs text-gray-400">{{ item.item_name }}</p>
                    </td>
                    <td class="px-4 py-3 text-gray-600">

                    <select
                    v-model="item.uom"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Select UOM</option>
                    <option v-for="uom in uoms" :key="uom.name" :value="uom.name">{{ uom.name }}</option>
                </select>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-model.number="item.qty"
                        type="number"
                        min="0.001"
                        step="any"
                        class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        @input="recalcItem(item)"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-model.number="item.rate"
                        type="number"
                        min="0"
                        step="any"
                        class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        @input="recalcItem(item)"
                      />
                    </td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-900">
                      {{ formatPrice(item.amount) }}
                    </td>
                  </tr>
                </tbody>

                <!-- Totals footer -->
                <tfoot class="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colspan="5" class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                    <td class="px-4 py-3 text-right text-base font-bold text-purple-600">
                      {{ formatPrice(invoiceTotal) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Additional Info -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <FileText class="w-4 h-4 text-cyan-600" />
              <h3 class="font-semibold text-gray-800">Additional Info</h3>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Remarks <span class="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  v-model="form.remarks"
                  rows="2"
                  placeholder="Add any notes for this invoice..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0 bg-gray-50 rounded-b-2xl">
          <div class="text-sm text-gray-500">
            Total: <span class="font-bold text-purple-600 text-base">{{ formatPrice(invoiceTotal) }}</span>
          </div>
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              :disabled="submitting"
              class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting || form.items.length === 0"
              class="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <CheckCircle v-else class="w-4 h-4" />
              {{ submitting ? 'Creating...' : 'Create Invoice' }}
            </button>
          </div>
        </div>


        <div v-if="errorMessage" class="mx-6 mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle class="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            <div>
            <p class="font-semibold">Failed to create invoice</p>
            <p class="text-red-600 mt-0.5">{{ errorMessage }}</p>
            </div>
        </div>

        <div v-if="successMessage" class="mx-6 mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle class="w-4 h-4 shrink-0 text-green-500" />
            <p class="font-semibold">{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FileText, X, Clock, Package, CheckCircle, Loader2 } from 'lucide-vue-next'
import { formatPrice } from '@/utils/formatters'
// Props:


// ─── Props & Emits ────────────────────────────────────
const props = defineProps({
  show:    { type: Boolean, default: false },
  receipt: { type: Object,  default: null  },
  uoms: {type: Array,default: () => [] },
  errorMessage: { type: String,  default: null  },
  successMessage:{ type: String, default: null  },
})

const emit = defineEmits(['close', 'submit'])

// ─── State ────────────────────────────────────────────
const submitting = ref(false)

const form = ref({
  set_posting_time: false,
  posting_date:     '',
  posting_time:     '',
  items:            [],
  remarks:          '',
})

// ─── Watchers ─────────────────────────────────────────
watch(
  () => props.receipt,
  (receipt) => {
    if (!receipt) return

    const now  = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0] // HH:MM:SS

    form.value = {
      set_posting_time: false,
      posting_date:     date,
      posting_time:     time,
      remarks:          '',
      items: (receipt.items || []).map(item => ({
        item_code: item.item_code,
        item_name: item.item_name || item.item_code,
        uom:       item.uom || item.stock_uom || '',
        qty:       item.qty ?? item.qty ?? 1,
        rate:      item.rate ?? item.rate ?? 0,
        amount:    (item.qty ?? 1) * (item.rate ?? 0),
        // preserve originals for reference
        warehouse: item.warehouse || '',
      })),
    }
  },
  { immediate: true }
)

// ─── Computed ─────────────────────────────────────────
const invoiceTotal = computed(() =>
  form.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
)

// ─── Helpers ──────────────────────────────────────────
const recalcItem = (item) => {
  item.amount = (item.qty || 0) * (item.rate || 0)
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : '-'

// ─── Submit ───────────────────────────────────────────
const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      items: form.value.items.map(item => ({
        item_code: item.item_code,
        qty:       item.qty,
        rate:      item.rate,
        uom:       item.uom,
        warehouse: item.warehouse,
      })),
      remarks: form.value.remarks || undefined,
      ...(form.value.set_posting_time
        ? {
            set_posting_time: 1,
            posting_date:     form.value.posting_date,
            posting_time:     form.value.posting_time,
          }
        : {}),
    }

    emit('submit', payload)
  } finally {
    submitting.value = false
  }
}
</script>
