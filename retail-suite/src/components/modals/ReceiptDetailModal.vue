<template>
  <Teleport to="body">
    <div
      v-if="receipt && Object.keys(receipt).length"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @mousedown.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">

        <!-- ── Header — same as Edit Modal ── -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-3">
            <div class="bg-cyan-100 p-2 rounded-xl">
              <FileText class="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900">Purchase Receipt</h2>
              <p class="text-xs text-gray-400 font-mono">{{ receipt.name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span :class="statusBadge(receipt.status)" class="px-2.5 py-1 rounded-lg text-xs font-semibold">
              {{ receipt.status }}
            </span>
            <button
              @click="$emit('close')"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- ── Scrollable Body ── -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- Section 1: Key Info — same grid as Edit Modal -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Supplier -->
            <div class="md:col-span-2">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier</p>
              <div class="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 font-medium">
                {{ receipt.supplier_name || receipt.supplier || '—' }}
                <span v-if="receipt.supplier_name && receipt.supplier_name !== receipt.supplier" class="ml-1 text-xs text-gray-400 font-normal font-mono">
                  ({{ receipt.supplier }})
                </span>
              </div>
            </div>

            <!-- Posting Date -->
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Receipt Date</p>
              <div class="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900">
                {{ formatDate(receipt.posting_date) }}
              </div>
            </div>

            <!-- Company -->
            <div v-if="receipt.company">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Company</p>
              <div class="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900">
                {{ receipt.company }}
              </div>
            </div>

            <!-- Supplier Invoice No -->
            <div v-if="receipt.bill_no">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier Invoice No.</p>
              <div class="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 font-mono">
                {{ receipt.bill_no }}
              </div>
            </div>

            <!-- Posting Time -->
            <div v-if="receipt.posting_time">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Posting Time</p>
              <div class="px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 font-mono">
                {{ receipt.posting_time }}
              </div>
            </div>

          </div>

          <!-- Divider -->
          <div class="border-t border-gray-100" />

          <!-- Section 2: Items Table — same style as Edit Modal table -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Items
                <span v-if="receipt.items?.length" class="ml-1 text-cyan-600">({{ receipt.items.length }})</span>
              </h4>
            </div>

            <!-- Empty -->
            <div
              v-if="!receipt.items?.length"
              class="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center"
            >
              <Package class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-400">No items found.</p>
            </div>

            <!-- Table -->
            <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500">Item</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-28">UOM</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-36 hidden md:table-cell">Warehouse</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-20">Qty</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-28">Rate</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr
                      v-for="(item, index) in receipt.items"
                      :key="index"
                      class="hover:bg-gray-50/50 transition-colors"
                    >
                      <td class="px-3 py-3 text-xs text-gray-400">{{ index + 1 }}</td>
                      <td class="px-3 py-3">
                        <p class="font-medium text-gray-900">{{ item.item_code }}</p>
                        <p v-if="item.item_name && item.item_name !== item.item_code" class="text-xs text-gray-400 mt-0.5">
                          {{ item.item_name }}
                        </p>
                      </td>
                      <td class="px-3 py-3 text-xs text-gray-500">{{ item.uom || item.stock_uom || '—' }}</td>
                      <td class="px-3 py-3 hidden md:table-cell">
                        <span v-if="item.warehouse" class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                          {{ item.warehouse }}
                        </span>
                        <span v-else class="text-gray-300">—</span>
                      </td>
                      <td class="px-3 py-3 text-right text-sm font-medium text-gray-900">
                        {{ item.qty ?? item.received_qty ?? '—' }}
                      </td>
                      <td class="px-3 py-3 text-right text-sm text-gray-600">
                        {{ formatPrice(item.rate ?? item.valuation_rate ?? 0) }}
                      </td>
                      <td class="px-3 py-3 text-right text-sm font-semibold text-gray-900">
                        {{ formatPrice(item.amount ?? ((item.qty ?? 0) * (item.rate ?? 0))) }}
                      </td>
                    </tr>
                  </tbody>

                  <!-- Subtotal footer — same as Edit Modal tfoot -->
                  <tfoot class="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colspan="6" class="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Net Total</td>
                      <td class="px-3 py-2.5 text-right text-sm font-bold text-gray-900">
                        {{ formatPrice(receipt.net_total || 0) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Section 3: Totals — same summary cards as Edit Modal -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Net Total</p>
              <p class="text-base font-bold text-gray-900">{{ formatPrice(receipt.net_total || 0) }}</p>
            </div>
            <div class="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <p class="text-xs text-gray-500 mb-1">Discount</p>
              <p class="text-base font-bold text-orange-600">
                {{ receipt.discount_amount > 0 ? '−' + formatPrice(receipt.discount_amount) : '—' }}
              </p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p class="text-xs text-gray-500 mb-1">Tax</p>
              <p class="text-base font-bold text-blue-600">
                {{ taxTotal > 0 ? '+' + formatPrice(taxTotal) : '—' }}
              </p>
            </div>
            <!-- Grand Total — same cyan card as Edit Modal -->
            <div class="bg-cyan-600 rounded-xl p-3">
              <p class="text-xs text-cyan-100 mb-1">Grand Total</p>
              <p class="text-lg font-bold text-white">{{ formatPrice(receipt.grand_total || 0) }}</p>
            </div>
          </div>

          <!-- Remarks -->
          <div v-if="receipt.remarks || receipt.notes" class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p class="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Remarks</p>
            <p class="text-sm text-amber-900">{{ receipt.remarks || receipt.notes }}</p>
          </div>

        </div>

        <!-- ── Footer — same as Edit Modal ── -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/80 rounded-b-2xl">
          <button
            @click="printReceipt"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Printer class="w-4 h-4" />
            Print
          </button>
          <button
            @click="$emit('close')"
            class="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>

    <!-- Hidden printable -->
    <div id="printable-receipt-detail" class="hidden">
      <div style="font-family: sans-serif; padding: 32px; font-size: 12px;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0;">PURCHASE RECEIPT</h1>
          <p style="color: #666; margin: 4px 0 0;">{{ receipt?.name }} — {{ formatDate(receipt?.posting_date) }}</p>
        </div>
        <p><strong>Supplier:</strong> {{ receipt?.supplier_name || receipt?.supplier }}</p>
        <p v-if="receipt?.company"><strong>Company:</strong> {{ receipt?.company }}</p>
        <br/>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #000;">
              <th style="padding: 6px 8px; text-align: left;">#</th>
              <th style="padding: 6px 8px; text-align: left;">Item</th>
              <th style="padding: 6px 8px; text-align: left;">UOM</th>
              <th style="padding: 6px 8px; text-align: right;">Qty</th>
              <th style="padding: 6px 8px; text-align: right;">Rate</th>
              <th style="padding: 6px 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in receipt?.items" :key="i" style="border-bottom: 1px solid #eee;">
              <td style="padding: 5px 8px;">{{ i + 1 }}</td>
              <td style="padding: 5px 8px;">
                {{ item.item_code }}
                <span v-if="item.item_name && item.item_name !== item.item_code" style="color: #888;"> — {{ item.item_name }}</span>
              </td>
              <td style="padding: 5px 8px;">{{ item.uom || item.stock_uom }}</td>
              <td style="padding: 5px 8px; text-align: right;">{{ item.qty }}</td>
              <td style="padding: 5px 8px; text-align: right;">{{ formatPrice(item.rate) }}</td>
              <td style="padding: 5px 8px; text-align: right;">{{ formatPrice(item.amount) }}</td>
            </tr>
          </tbody>
        </table>
        <br/>
        <div style="margin-left: auto; width: 260px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>Net Total:</span><span>{{ formatPrice(receipt?.net_total) }}</span>
          </div>
          <div v-for="tax in (receipt?.taxes || [])" :key="tax.name" style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span>{{ tax.description }}:</span><span>{{ formatPrice(tax.tax_amount) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 8px; margin-top: 4px;">
            <span>GRAND TOTAL:</span><span>{{ formatPrice(receipt?.grand_total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, X, Package, Printer } from 'lucide-vue-next'
import { formatPrice } from '@/utils/formatters'

const props = defineProps({
  receipt: { type: Object, required: true }
})
defineEmits(['close'])

const taxTotal = computed(() =>
  (props.receipt?.taxes || []).reduce((sum, t) => sum + (t.tax_amount || 0), 0)
)

const statusBadge = (status) => {
  const map = {
    'Draft':         'bg-gray-100 text-gray-700',
    'To Bill':       'bg-blue-100 text-blue-700',
    'Partly Billed': 'bg-yellow-100 text-yellow-700',
    'Completed':     'bg-green-100 text-green-700',
    'Cancelled':     'bg-red-100 text-red-700',
    'Closed':        'bg-gray-200 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

const printReceipt = () => {
  const el = document.getElementById('printable-receipt-detail')
  if (!el) return
  const win = window.open('', '', 'height=700,width=900')
  win.document.write('<html><head><title>Receipt ' + (props.receipt?.name || '') + '</title></head><body>')
  win.document.write(el.innerHTML)
  win.document.write('</body></html>')
  win.document.close()
  win.print()
}
</script>
