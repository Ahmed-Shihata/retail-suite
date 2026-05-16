<template>

    <div class="w-full min-h-screen flex" :style="{ background: 'var(--item-bg)' }">
      <div class="flex-1 p-4">
        <div class="max-w-2xl mx-auto">

          <div
            class="shadow-lg rounded-2xl p-6 space-y-6"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >

            <!-- Title -->
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                :style="{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }"
              >
                💳
              </div>
              <div>
                <h1 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">New Payment</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Record a customer payment — not linked to any invoice
                </p>
              </div>
            </div>

            <v-divider />

            <!-- Customer -->
            <Customer @customer-selected="handleCustomerSelected" />

            <v-divider />

            <!-- Mode of Payment -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-bold" :style="{ color: 'var(--text-main)' }">
                  Mode Of Payment
                </h3>
                <span
                  v-if="total_payment_amount > 0"
                  class="text-xs font-semibold px-2 py-1 rounded-full"
                  :style="{
                    background: 'var(--info-bg)',
                    color: 'var(--focus-ring)',
                    border: '1px solid var(--info-border)'
                  }"
                >
                  Total: {{ currencySymbol(pos_profile.currency) }} {{ formatCurrency(total_payment_amount) }}
                </span>
              </div>

              <!-- Loading -->
              <div v-if="modes_loading" class="flex items-center justify-center py-8 gap-3">
                <span class="inline-block animate-spin text-xl">⟳</span>
                <span class="text-sm" :style="{ color: 'var(--text-muted)' }">Loading payment methods...</span>
              </div>

              <!-- Payment Modes List -->
              <div v-else-if="payment_modes.length > 0" class="space-y-3">
                <div
                  v-for="(mode, index) in payment_modes"
                  :key="mode.name"
                  class="flex items-center justify-between p-4 rounded-lg transition duration-200"
                  :style="{
                    background: 'var(--item-bg)',
                    border: '1px solid var(--item-border)'
                  }"
                  @mouseover="$event.currentTarget.style.borderColor = 'var(--focus-ring)'"
                  @mouseleave="$event.currentTarget.style.borderColor = 'var(--item-border)'"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center"
                      :style="{
                        background: 'var(--info-bg)',
                        border: '1px solid var(--info-border)'
                      }"
                    >
                      <span class="text-sm">💳</span>
                    </div>
                    <span class="font-semibold text-sm" :style="{ color: 'var(--text-main)' }">
                      {{ mode.name }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium" :style="{ color: 'var(--text-sub)' }">
                      {{ currencySymbol(pos_profile.currency) }}
                    </span>
                    <input
                      type="number"
                      v-model.number="payment_modes[index].amount"
                      min="0"
                      class="w-32 rounded-lg p-2.5 text-right font-semibold text-sm transition"
                      :style="{
                        background: 'var(--input-bg)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--input-border)'
                      }"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <!-- No Modes -->
              <div
                v-else
                class="p-4 rounded-lg text-sm"
                :style="{
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)',
                  color: 'var(--focus-ring)'
                }"
              >
                No payment methods found.
              </div>
            </div>

            <v-divider />

            <!-- Total -->
            <div
              class="p-4 rounded-xl"
              :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }"
            >
              <div class="flex justify-between items-center">
                <span class="font-semibold" :style="{ color: 'var(--text-sub)' }">Total Payment</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">
                    {{ currencySymbol(pos_profile.currency) }}
                  </span>
                  <input
                    :value="formatCurrency(total_payment_amount)"
                    type="text"
                    readonly
                    class="w-32 rounded-lg p-2.5 text-right font-bold cursor-not-allowed"
                    :style="{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--focus-ring)'
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="submit"
                :disabled="!customer_name || total_payment_amount === 0 || isSubmitting"
                class="flex-1 py-3 px-4 text-white font-semibold rounded-lg transition duration-300 shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                :style="{ background: 'var(--btn-info)' }"
              >
                <span v-if="!isSubmitting">✓ Create Payment</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <span class="inline-block animate-spin">⟳</span>
                  Processing...
                </span>
              </button>

              <button
                type="button"
                @click="resetForm"
                class="px-6 py-3 font-semibold rounded-lg transition duration-200"
                :style="{
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  border: '2px solid var(--card-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--item-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
              >
                Reset
              </button>
            </div>

            <p class="text-xs text-center" :style="{ color: 'var(--text-muted)' }">
              This payment will be saved as unallocated and can be reconciled with invoices later.
            </p>

          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" position="top" rounded="lg">
      <span>{{ snackbarMessage }}</span>
    </v-snackbar>

    <!-- No Active Shift -->
    <div
      v-if="!isShiftOpen"
      class="fixed inset-0 flex items-center justify-center z-40"
      style="background: rgba(0,0,0,0.5)"
    >
      <div
        class="rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center"
        :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          :style="{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }"
        >
          <WarningIcon class="w-8 h-8" :style="{ color: 'var(--warning-border)' }" />
        </div>
        <h3 class="text-lg font-semibold mb-2" :style="{ color: 'var(--text-main)' }">No Active Shift</h3>
        <p class="text-sm" :style="{ color: 'var(--text-muted)' }">
          Please open a shift before creating payments.
        </p>
        <div class="flex justify-center mt-6">
          <button
            @click="showOpenShiftModal = true"
            class="px-6 py-2 rounded-lg text-white font-semibold text-sm"
            :style="{ background: 'var(--btn-primary)' }"
          >
            Open Shift
          </button>
        </div>
      </div>
    </div>

    <OpenShiftModal
      v-if="showOpenShiftModal"
      @success="() => { showOpenShiftModal = false }"
      @error="(err) => console.error(err)"
      @close="showOpenShiftModal = false"
    />

</template>

<script setup>
import OpenShiftModal  from '@/components/modals/OpenShiftModal.vue'
import Customer        from '@/components/cart/CustomerSection.vue'
import MainLayout      from '@/layout/MainLayout.vue'
import WarningIcon     from '@/components/icons/WarningIcon.svg'
import { useShiftStore }            from '@/stores/shift'
import { useToast }                 from 'vue-toastification'
import { ref, computed, onMounted } from 'vue'
import { get_currency_symbol }      from '../utils/formatters'
import { storeToRefs } from 'pinia'
import { toRaw }       from 'vue'
import { processPayment, getPaymentModes } from '../composables/payment'

// ─── Store ────────────────────────────────────────────────────────
const shiftStore      = useShiftStore()
const toast           = useToast()
const { isShiftOpen } = storeToRefs(shiftStore)

// ─── UI State ─────────────────────────────────────────────────────
const showOpenShiftModal = ref(false)
const snackbar           = ref(false)
const snackbarMessage    = ref('')
const snackbarColor      = ref('info')
const isSubmitting       = ref(false)
const modes_loading      = ref(false)

// ─── Data ─────────────────────────────────────────────────────────
const customer_name = ref('')
const payment_modes = ref([])   // [{ name, type, amount }]

// ─── Computed ─────────────────────────────────────────────────────
const pos_profile = computed(() => shiftStore.pos_profile || {})

const total_payment_amount = computed(() =>
  payment_modes.value.reduce((s, m) => s + Number(m.amount || 0), 0)
)

// ─── Helpers ──────────────────────────────────────────────────────
const showToast      = (msg, type = 'info') => toast[type]?.(msg) ?? toast(msg)
const formatCurrency = (v) => v ? parseFloat(v).toFixed(2) : '0.00'
const currencySymbol = (c) => get_currency_symbol(c)

// ─── Fetch Mode of Payment ────────────────────────────────────────
const fetchPaymentModes = async () => {
  modes_loading.value = true
  try {
    const list = await getPaymentModes()   // ← من api.js
    payment_modes.value = list.map(mode => ({
      name:            mode.name,
      mode_of_payment: mode.name,
      type:            mode.type || '',
      amount:          0
    }))
  } catch (error) {
    console.error('Error fetching payment modes:', error)
    showToast('Failed to load payment methods.', 'error')
  } finally {
    modes_loading.value = false
  }
}

// ─── Handlers ─────────────────────────────────────────────────────
const handleCustomerSelected = (customer) => {
  customer_name.value = customer.customer_name
}

// ─── Validation ───────────────────────────────────────────────────
const validateForm = () => {
  if (!customer_name.value) {
    showToast('Please select a customer first.', 'error')
    return false
  }
  if (total_payment_amount.value === 0) {
    showToast('Please enter an amount for at least one payment method.', 'error')
    return false
  }
  return true
}

// ─── Submit ───────────────────────────────────────────────────────
const submit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  // بس اللي amount > 0
  const active_payments = toRaw(payment_modes.value)
    .filter(m => Number(m.amount) > 0)
    .map(m => ({
      mode_of_payment: m.name,
      amount:          parseFloat(m.amount),
      type:            m.type
    }))

  const payload = {
    customer:                    customer_name.value,
    company:                     pos_profile.value.company,
    currency:                    pos_profile.value.currency,
    pos_opening_shift_name:      shiftStore.pos_opening_shift?.name
                                   || toRaw(shiftStore.pos_opening_shift)?.name,
    pos_profile_name:            pos_profile.value.name,
    pos_profile:                 toRaw(pos_profile.value),

    payment_mode:                'new',
    is_new_payment:              true,

    payment_methods:             active_payments,

    selected_invoices:           [],
    selected_payments:           [],
    selected_mpesa_payments:     [],

    total_selected_invoices:       0,
    total_selected_payments:       0,
    total_selected_mpesa_payments: 0,
    total_payment_methods:         total_payment_amount.value
  }

  try {
    const result = await processPayment(payload)
    if (result) {
      showToast(`✅ Payment created — ${result.payment_entry_name || 'Done'}`, 'success')
      resetForm()
    } else {
      showToast('An error occurred while processing the payment.', 'error')
    }
  } catch (error) {
    showToast(`Error: ${error.message || 'Payment failed'}`, 'error')
    console.error('Payment error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// ─── Reset ────────────────────────────────────────────────────────
const resetForm = () => {
  customer_name.value = ''
  // مسح الـ amounts فقط — الـ modes تفضل
  payment_modes.value = payment_modes.value.map(m => ({ ...m, amount: 0 }))
}

// ─── Mount ────────────────────────────────────────────────────────
onMounted(async () => {
  await shiftStore.checkActiveShift()
  await fetchPaymentModes()
})
</script>
