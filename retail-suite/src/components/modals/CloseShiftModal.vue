<!-- CloseShiftModal.vue -->
<template>
  <div class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 shadow-2xl rounded-lg">
    <!-- Modal Background -->
    <div
      class="absolute inset-0"
      @click="handleBackgroundClick"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg mr-3">
              <StopIcon class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Close Shift</h3>
              <p class="text-sm text-gray-600">End current cashier shift</p>
            </div>
          </div>
          <div>

            <div>
              <span class="text-gray-600">Cashier:</span>
              <span class="font-medium ml-1">{{ currentShift?.user }}</span>
            </div>

            <div>
              <span class="text-gray-600">Duration:</span>
              <span class="font-medium ml-1">{{ shiftDuration }}</span>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
            :disabled="isLoading"
          >
            <CloseIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Shift Summary -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-2 gap-4 text-sm">

          <div>
            <span class="text-gray-600">Transactions:</span>
            <span class="font-medium ml-1">{{ currentShift?.totalTransactions || 0 }}</span>
          </div>
          <div>
            <span class="text-gray-600">Total Sales:</span>
            <span class="font-medium ml-1">{{ formatPrice(currentShift?.totalSales || 0) }}</span>
          </div>
        </div>
      </div>
      <!-- Loading state for Form Closing Open Shift -->
      <div v-if="isSummaryLoading" class="px-6 py-8 text-center text-gray-500">
          <LoadingSpinner class="w-6 h-6 mx-auto mb-2" />
          <p class="text-sm">Loading payment summary...</p>
      </div>
      <!-- Form Content -->
      <form @submit.prevent="getClosingShiftFromOpeningShift" class="px-6 py-6 space-y-6">
        <!-- Cash Reconciliation -->
        <div class="space-y-2">
          <h4 class="text-md font-semibold text-gray-900 flex items-center">
            <CashIcon class="w-5 h-5 text-green-600 mr-2" />
            Cash Reconciliation
          </h4>

          <!-- Opening Balance -->
          <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span class="text-sm text-gray-700">Opening Balance:</span>
            <span class="font-semibold text-blue-900">
              {{ formatPrice(currentShift?.openingBalance || 0) }}
            </span>
          </div>

          <!-- Sales Total -->
          <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span class="text-sm text-gray-700">Total Sales:</span>
            <span class="font-semibold text-green-900">
              {{ formatPrice(currentShift?.totalSales || 0) }}
            </span>
          </div>

          <!-- Expected Cash -->
          <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border">
            <span class="text-sm font-medium text-gray-700">Expected Cash:</span>
            <span class="font-bold text-yellow-900">
              {{ formatPrice(expectedCash) }}
            </span>
          </div>
        </div>
        <!-- بدل input واحد للـ Cash بس -->
        <!-- في الـ loop بتاع paymentModes -->
        <div v-for="mop in paymentModes" :key="mop" class="mb-4">
            <!-- Expected لهذا الـ mode -->
            <div class="flex justify-between items-center p-2 bg-yellow-50 rounded mb-2 text-sm">
                <span>Expected {{ mop }}:</span>
                <span class="font-semibold">{{ formatPrice(expectedPerMode[mop] || 0) }}</span>
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Actual {{ mop }} in Register *
            </label>
            <div class="relative">
                <input
                    v-model.number="form.closingBalances[mop]"
                    type="number"
                    min="0"
                    step="any"
                    required
                    class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg"
                    :placeholder="`Count actual ${mop} amount`"
                />
                <span class="absolute left-3 top-2.5 text-gray-500">{{ currency }}</span>
            </div>

            <!-- Difference لهذا الـ mode -->
            <div v-if="form.closingBalances[mop] !== undefined && form.closingBalances[mop] !== ''"
                class="mt-1 text-xs"
                :class="differencePerMode[mop] === 0 ? 'text-green-600' : differencePerMode[mop] > 0 ? 'text-blue-600' : 'text-red-600'">
                {{ differencePerMode[mop] === 0 ? '✅ Match' : differencePerMode[mop] > 0 ? `▲ Over by ${formatPrice(differencePerMode[mop])}` : `▼ Short by ${formatPrice(Math.abs(differencePerMode[mop]))}` }}
            </div>
        </div>
        <!-- Actual Cash Count -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Actual Cash in Register *
          </label>
          <h3>{{ form.closingBalance }}</h3>
          <div class="relative">
              <input
              v-model.number="form.closingBalance"
              type="number"
              min="0"
              step="any"
              required
              class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
              :class="getCashInputClass()"
              :disabled="isLoading"
              placeholder="Count actual cash in register"
              />
              <span class="absolute left-3 top-2.5 text-gray-500">{{ currency }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
                Enter the actual amount of cash counted in the register
            </p>
        </div> -->

        <!-- Cash Difference Display -->
        <!-- Cash Difference Display -->
        <div v-if="Object.keys(form.closingBalances).length > 0 && paymentModes.every(m => form.closingBalances[m] !== undefined)">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <!-- ✅ v-if بدل component :is -->
              <CheckIcon v-if="cashDifference === 0" class="w-5 h-5 mr-2 text-green-600" />
              <svg v-else-if="cashDifference > 0" class="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg v-else class="w-5 h-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>

              <span class="font-medium" :class="getDifferenceTextClass()">
                {{ getDifferenceLabel() }}
              </span>
            </div>
            <span class="font-bold text-lg" :class="getDifferenceTextClass()">
              {{ formatPrice(Math.abs(cashDifference)) }}
            </span>
          </div>
          <p class="text-sm mt-1" :class="getDifferenceDescriptionClass()">
            {{ getDifferenceDescription() }}
          </p>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Closing Notes <span class="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            v-model="form.notes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none"
            rows="3"
            :disabled="isLoading"
            placeholder="Any notes about cash difference, issues, or observations..."
          ></textarea>
        </div>

        <!-- Warning for Large Differences -->
        <div v-if="hasLargeDifference" class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-start">
            <WarningIcon class="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <h5 class="text-sm font-medium text-amber-800">Large Cash Difference Detected</h5>
              <p class="text-sm text-amber-700 mt-1">
                The cash difference is significant. Please double-check your count and add notes explaining the discrepancy.
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <AlertIcon class="w-5 h-5 text-red-600 mr-2" />
            <span class="text-sm text-red-800">{{ errorMessage }}</span>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <CheckIcon class="w-5 h-5 text-green-600 mr-2" />
            <span class="text-sm text-green-800">{{ successMessage }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canSubmit || isLoading"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <LoadingSpinner v-if="isLoading" class="w-4 h-4 mr-2" />
            <StopIcon v-else class="w-4 h-4 mr-2" />
            {{ isLoading ? 'Closing...' : 'Close Shift' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toRaw } from 'vue'
import { deepUnwrap } from '../../utils/utils'
import { useShiftStore } from '@/stores/shift'
import CashIcon from '@/components/icons/CashIcon.svg'
import CloseIcon from '@/components/icons/CloseIcon.svg'
import StopIcon from '@/components/icons/StopIcon.svg'
import CheckCircleIcon from '@/components/icons/CheckCircleIcon.svg'
import TrendingUpIcon from '@/components/icons/TrendingUpIcon.svg'
import WarningIcon from '@/components/icons/WarningIcon.svg'
import AlertIcon from '@/components/icons/AlertIcon.svg'
import CheckIcon from '@/components/icons/CheckIcon.svg'
import TrendingDownIcon from '@/components/icons/TrendingDownIcon.svg'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import { formatPrice } from '../../utils/formatters'
import { get_shift_payment_summary } from '@/composables/shift'
import { useConfirm } from '@/composables/useConfirm'

const emit = defineEmits(['close', 'success', 'error'])

const shiftStore = useShiftStore()
const { confirm } = useConfirm()
const form = ref({
    closingBalances: {},  // { 'Cash': 500, 'Credit Card': 1200 }
    notes: '',
    closedBy: ''
})


const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
// State
const paymentSummary = ref([])
const isSummaryLoading = ref(true)

const expectedPerMode = computed(() => {
    const result = {}
    paymentSummary.value.forEach(p => {
        result[p.mode_of_payment] = p.expected_amount
    })
    return result
})

const paymentModes = computed(() => {
    if (paymentSummary.value.length > 0) {
        return paymentSummary.value.map(p => p.mode_of_payment)
    }
    // fallback
    return currentShift.value?.balance_details?.map(b => b.mode_of_payment) || []
})


// Computed properties
const currency = computed(() => shiftStore.pos_profile.currency || 'SAR')
const currentShift = computed(() => shiftStore.currentShift)

const expectedCash = computed(() => {
  return (currentShift.value?.openingBalance || 0) + (currentShift.value?.totalSales || 0)
})

const differencePerMode = computed(() => {
    const result = {}
    paymentModes.value.forEach(mop => {
        const closing = Number(form.value.closingBalances[mop]) || 0
        result[mop] = closing - (expectedPerMode.value[mop] || 0)
    })
    return result
})

const cashDifference = computed(() => {
    return Object.values(differencePerMode.value).reduce((sum, d) => sum + d, 0)
})
const totalClosingBalance = computed(() => {
    return paymentModes.value.reduce((sum, mop) => {
        return sum + (Number(form.value.closingBalances[mop]) || 0)
    }, 0)
})

const hasLargeDifference = computed(() => {
    return Math.abs(cashDifference.value) > 50000
})
const shiftDuration = computed(() => {
  if (!currentShift.value?.period_start_date) return '0h 0m'
  return shiftStore.formatShiftDuration(currentShift.value)
})

const canSubmit = computed(() => {
    if (isLoading.value) return false
    return paymentModes.value.every(mop => {
        const val = form.value.closingBalances[mop]
        return val !== null && val !== '' && val !== undefined && val >= 0
    })
})

// Styling methods
const getCashInputClass = () => {
  if (form.value.closingBalance === null || form.value.closingBalance === '') return ''

const diff = cashDifference.value
  if (diff === 0) return 'border-green-300 ring-green-200'
  if (Math.abs(diff) > 10000) return 'border-red-300 ring-red-200'
  return 'border-yellow-300 ring-yellow-200'
}

const getDifferenceClass = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'border-green-300 bg-green-50'
  if (diff > 0) return 'border-blue-300 bg-blue-50'
  return 'border-red-300 bg-red-50'
}


const getDifferenceIcon = () => {
  const diff = cashDifference.value
  if (diff === 0) return CheckCircleIcon
  if (diff > 0) return TrendingUpIcon
  return TrendingDownIcon
}

const getDifferenceIconClass = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'text-green-600'
  if (diff > 0) return 'text-blue-600'
  return 'text-red-600'
}

const getDifferenceTextClass = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'text-green-800'
  if (diff > 0) return 'text-blue-800'
  return 'text-red-800'
}

const getDifferenceDescriptionClass = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'text-green-700'
  if (diff > 0) return 'text-blue-700'
  return 'text-red-700'
}

const getDifferenceLabel = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'Perfect Match!'
  if (diff > 0) return 'Cash Over'
  return 'Cash Short'
}

const getDifferenceDescription = () => {
  const diff = cashDifference.value
  if (diff === 0) return 'Cash count matches expected amount exactly.'
  if (diff > 0) return 'More cash found than expected. Please verify count.'
  return 'Less cash found than expected. Please recount and check for missing transactions.'
}

// Clear messages
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// Handle background click
const handleBackgroundClick = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

// Handle form submission
const handleSubmit = async () => {

    clearMessages()
    // Validation
    if (form.value.closingBalance === null || form.value.closingBalance === '' || form.value.closingBalance < 0) {
      errorMessage.value = 'Please enter a valid closing balance'
      return
    }

    // Additional validation through store
    const validation = shiftStore.validateShiftOperation('close', form.value)
    if (!validation.valid) {
      errorMessage.value = validation.message
      return
    }

    // Confirmation for large differences
    if (hasLargeDifference.value) {
      const confirmed = await confirm({
        type: 'confirm',
        title: 'Close Shift',
        message: `Large cash difference detected (${formatPrice(Math.abs(cashDifference.value))}). ` +
        'Are you sure you want to close the shift with this amount?',
        confirmLabel: 'close shift',
      })
      if (!confirmed) return
    }

    isLoading.value = true

    try {
      // Prepare close data
      const closeData = {
        modeOfPayment: "Cash",
        closingBalance: form.value.closingBalance,
        notes: form.value.notes,
        closedBy: currentShift.value?.user || 'Unknown'
      }

      // Close shift
      const closedShift = await shiftStore.closeShift(closeData)

      successMessage.value = 'Shift closed successfully!'

      // Emit success and close modal after a brief delay
      setTimeout(() => {
        emit('success', closedShift)
        emit('close')
      }, 1500)

    } catch (error) {
      console.error('Failed to close shift:', error)
      errorMessage.value = error.message || 'Failed to close shift. Please try again.'
    } finally {
      isLoading.value = false
    }
}

const getClosingShiftFromOpeningShift = async () => {
    try {
        clearMessages()
        isLoading.value = true

        const missingModes = paymentModes.value.filter(mop => {
            const val = form.value.closingBalances[mop]
            return val === null || val === undefined || val === '' || val < 0
        })
        if (missingModes.length > 0) {
            errorMessage.value = `Please enter closing balance for: ${missingModes.join(', ')}`
            return
        }

        const closing_details = paymentModes.value.map(mop => ({
            modeOfPayment: mop,
            closingBalance: form.value.closingBalances[mop] || 0,
            notes: form.value.notes,
            closedBy: currentShift.value?.user || 'Unknown'
        }))

        currentShift.value.closing_details = closing_details

        if (!shiftStore.pos_opening_shift) {
            throw new Error("No opening shift found")
        }

        const closedShift = await shiftStore.closingOpenShift(deepUnwrap(currentShift.value))
        successMessage.value = 'Shift closed successfully!'
        setTimeout(() => {
            emit('success', closedShift)
            emit('close')
        }, 1500)

    } catch (e) {
        console.error('Closing shift failed:', e)
        errorMessage.value = e.message || 'Failed to close shift.'
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    try {
        console.log("**shiftStore.pos_opening_shift**", shiftStore.pos_opening_shift.name)
        const data = await get_shift_payment_summary(shiftStore.pos_opening_shift.name)
        paymentSummary.value = data || []
        console.log('payment summary:', paymentSummary.value)
    } catch (e) {
        console.error('Failed to load payment summary:', e)
    } finally {
        isSummaryLoading.value = false
    }
})
</script>

<style scoped>
/* Animation classes */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus states */
input:focus, select:focus, textarea:focus {
  outline: none;
}

/* Disabled states */
input:disabled, select:disabled, textarea:disabled, button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Gradient backgrounds */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-red-50 {
  --tw-gradient-from: #fef2f2;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(254, 242, 242, 0));
}

.to-orange-50 {
  --tw-gradient-to: #fff7ed;
}

/* Ring colors for inputs */
.ring-green-200 {
  --tw-ring-color: #bbf7d0;
}

.ring-yellow-200 {
  --tw-ring-color: #fef08a;
}

.ring-red-200 {
  --tw-ring-color: #fecaca;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-lg {
    max-width: calc(100vw - 2rem);
  }

  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
