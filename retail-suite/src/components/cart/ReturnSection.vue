<template>
  <div
    v-if="cartStore.isReturn"
    class="select-none h-auto w-full text-center pt-3 pb-4 px-4"
    :style="{
      borderTop: '1px solid var(--card-border)',
      color: 'var(--text-main)'
    }"
  >
    <div class="mb-4">

      <!-- Original Invoice Row -->
      <div class="flex mb-2 text-sm" :style="{ color: 'var(--text-sub)' }">
        <div>Original Invoice:</div>
        <div class="text-right w-full font-semibold" :style="{ color: 'var(--text-main)' }">
          {{ returnAgainstValue }} ({{ customerValue }})
        </div>
      </div>

      <!-- Total Return Row -->
      <div
        class="flex mb-3 text-lg font-semibold pt-2"
        :style="{
          color: 'var(--text-main)',
          borderTop: '1px solid var(--card-border)'
        }"
      >
        <div>Total Return</div>
        <div class="text-right w-full">{{ formatPrice(cartStore.totalPrice) }}</div>
      </div>
    </div>

    <!-- Confirm Return Button -->
    <button
      class="text-white rounded-2xl text-lg w-full py-3 focus:outline-none transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
      :style="{ background: 'var(--btn-danger)' }"
      :disabled="cartStore.isProcessing"
      @click="cartStore.handleReturnSubmit"
    >
      <ArrowUturnLeftIcon class="w-6 h-6 mr-2 inline-block" />
      CONFIRM RETURN
    </button>

    <div
      v-if="cartStore.isProcessing"
      class="mt-2 text-sm"
      :style="{ color: 'var(--text-muted)' }"
    >
      Processing return...
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { ArrowUturnLeftIcon } from '@heroicons/vue/24/outline'
import {formatPrice} from '../../utils/formatters.js'
const cartStore = useCartStore()
// const returnAgainstValue = ref('N/A')
// const customerValue = ref('N/A')
const returnAgainstValue = computed(() => cartStore.returnAgainst?.name || 'N/A')
const customerValue = computed(() => cartStore.returnAgainst?.customer || 'N/A')
// watch(
//   () => cartStore.returnAgainst,
//   (newVal) => {
//     console.log('🟢 returnAgainst changed:', newVal)
//     returnAgainstValue.value = newVal?.name || 'N/A'
//     customerValue.value = newVal?.customer || 'N/A'
//   },
//   { immediate: true, deep: true }
// )
// watch(() => cartStore.returnAgainst, (newVal, oldVal) => {
//   console.log('🟢 returnAgainst changed:', newVal, ' | old:', oldVal)
// })


// watch(
//   () => cartStore.returnAgainst,
//   (newVal, oldVal) => {
//     console.log('🟢 returnAgainst changed:', newVal)
//     if (newVal) {
//       console.log('Customer:', newVal.customer)
//     }
//   },
//   { deep: true }
// )

</script>
