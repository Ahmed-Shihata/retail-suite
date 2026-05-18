<template>
  <div
    ref="receiptRef"
    class="w-full max-w-[360px] mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800"
  >

    <!-- Header -->
    <div class="px-6 pt-6 pb-5 text-center bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">

      <div class="flex justify-center mb-3">
        <slot name="logo">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
            <svg viewBox="0 0 40 40" fill="none" class="w-8 h-8">
              <rect width="40" height="40" rx="8" fill="currentColor" opacity="0.1"/>
              <path
                d="M8 28V16l12-8 12 8v12H8z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <rect
                x="15"
                y="20"
                width="10"
                height="8"
                rx="1"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </div>
        </slot>
      </div>

      <h1 class="text-2xl font-bold tracking-wide uppercase">
        {{ storeName }}
      </h1>

      <p v-if="storeAddress" class="text-sm text-cyan-50 mt-2">
        {{ storeAddress }}
      </p>

      <p v-if="storePhone" class="text-sm text-cyan-100">
        {{ storePhone }}
      </p>
    </div>

    <!-- Content -->
    <div class="p-5">

      <!-- Invoice Info -->
      <div class="space-y-2 text-sm">

        <div class="flex justify-between">
          <span class="text-gray-500">Invoice</span>
          <span class="font-semibold">{{ invoiceNo }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-500">Date</span>
          <span>{{ formattedDate }}</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-500">Time</span>
          <span>{{ formattedTime }}</span>
        </div>

        <div
          v-if="cashier"
          class="flex justify-between"
        >
          <span class="text-gray-500">Cashier</span>
          <span>{{ cashier }}</span>
        </div>

        <div
          v-if="customer"
          class="flex justify-between"
        >
          <span class="text-gray-500">Customer</span>
          <span>{{ customer }}</span>
        </div>

      </div>

      <!-- Divider -->
      <div class="border-t border-dashed border-gray-300 my-5"></div>

      <!-- Items -->
      <div>

        <!-- Header -->
        <div class="grid grid-cols-12 gap-2 text-xs uppercase font-semibold text-gray-500 mb-3">
          <div class="col-span-5">Item</div>
          <div class="col-span-2 text-center">Qty</div>
          <div class="col-span-2 text-right">Price</div>
          <div class="col-span-3 text-right">Total</div>
        </div>

        <!-- Items -->
        <div
          v-for="(item, index) in items"
          :key="index"
          class="py-3 border-b border-gray-100 last:border-none"
        >

          <div class="font-medium text-sm truncate">
            {{ item.item_name }}
          </div>

          <div class="grid grid-cols-12 gap-2 mt-2 text-sm">

            <div class="col-span-5 text-gray-500 truncate">
              #{{ index + 1 }}
            </div>

            <div class="col-span-2 text-center">
              {{ item.qty }}
            </div>

            <div class="col-span-2 text-right">
              {{ formatPrice(item.rate) }}
            </div>

            <div class="col-span-3 text-right font-semibold">
              {{ formatPrice(item.qty * item.rate) }}
            </div>

          </div>

        </div>

      </div>

      <!-- Divider -->
      <div class="border-t border-dashed border-gray-300 my-5"></div>

      <!-- Summary -->
      <div class="space-y-3 text-sm">

        <div
          v-if="summary.subtotal !== undefined"
          class="flex justify-between"
        >
          <span class="text-gray-500">Subtotal</span>
          <span>{{ formatPrice(summary.subtotal || 0) }}</span>
        </div>

        <div
          v-if="summary.tax > 0"
          class="flex justify-between"
        >
          <span class="text-gray-500">Tax</span>
          <span>{{ formatPrice(summary.tax) }}</span>
        </div>

        <div
          v-if="summary.discount > 0"
          class="flex justify-between text-green-600"
        >
          <span>Discount</span>
          <span>-{{ formatPrice(summary.discount) }}</span>
        </div>

        <!-- Total -->
        <div class="border-t border-gray-200 pt-4 flex justify-between items-center">

          <span class="text-lg font-bold tracking-wide">
            TOTAL
          </span>

          <span class="text-xl font-bold text-cyan-600">
            {{ formatPrice(summary.total || 0) }}
          </span>

        </div>

        <!-- Payment -->
        <div class="flex justify-between pt-2">
          <span class="text-gray-500">
            {{ paymentMethod || 'Cash' }}
          </span>

          <span>
            {{ formatPrice(summary.cash || 0) }}
          </span>
        </div>

        <!-- Change -->
        <div
          v-if="changeAmount > 0"
          class="flex justify-between font-semibold text-green-600"
        >
          <span>Change</span>
          <span>{{ formatPrice(changeAmount) }}</span>
        </div>

      </div>

      <!-- Divider -->
      <div class="border-t border-dashed border-gray-300 my-5"></div>

      <!-- Footer -->
      <div class="text-center">

        <p class="font-semibold text-sm">
          Thank you for your purchase!
        </p>

        <p
          v-if="footerNote"
          class="text-xs text-gray-500 mt-2"
        >
          {{ footerNote }}
        </p>

        <!-- Barcode -->
        <div class="mt-5 flex flex-col items-center">

          <div class="flex items-end gap-[1px] h-12">
            <span
              v-for="n in 40"
              :key="n"
              :style="{ width: barcodeWidth(n) + 'px' }"
              class="bg-black inline-block h-full even:h-[70%]"
            />
          </div>

          <p class="text-[10px] tracking-[4px] mt-2 text-gray-500">
            {{ invoiceNo }}
          </p>

        </div>

      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  invoiceNo:    { type: String, default: '' },
  storeName:    { type: String, default: 'POS Store' },
  storeAddress: { type: String, default: '' },
  storePhone:   { type: String, default: '' },
  cashier:      { type: String, default: '' },
  customer:     { type: String, default: '' },
  items:        { type: Array,  default: () => [] },
  summary:      { type: Object, default: () => ({}) },
  paymentMethod:{ type: String, default: 'Cash' },
  timestamp:    { type: String, default: '' },
  footerNote:   { type: String, default: '' },
  currency:     { type: String, default: 'SAR' },
  isPrinting:   { type: Boolean, default: false },
})

const receiptRef = ref(null)

const print = async () => {
  if (!receiptRef.value) return

  const printWindow = window.open('', '_blank')

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        ${receiptRef.value.outerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()

  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 300)
}

defineExpose({
  print
})


const changeAmount = computed(() =>
  Math.max((props.summary.cash || 0) - (props.summary.total || 0), 0)
)

const formattedDate = computed(() => {
  const d = props.timestamp ? new Date(props.timestamp) : new Date()
  return d.toLocaleDateString('en-SA', { year: 'numeric', month: 'short', day: 'numeric' })
})

const formattedTime = computed(() => {
  const d = props.timestamp ? new Date(props.timestamp) : new Date()
  return d.toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit' })
})

function formatPrice(amount) {
  return new Intl.NumberFormat('en-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0) + ' ' + props.currency
}

// fake barcode pattern based on invoice number
function barcodeWidth(n) {
  const code = props.invoiceNo || 'INV'
  const char = code.charCodeAt(n % code.length) || 50
  return (char % 3) + 1
}
</script>
