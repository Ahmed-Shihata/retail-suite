<!-- ProductCard.vue -->
<template>
  <div
    class="select-none cursor-pointer relative overflow-hidden rounded-2xl group transition-all duration-300"
    :style="{
      background: 'var(--card-bg)',
      color: 'var(--text-main)',
      border: '1.5px solid var(--card-border)',
      boxShadow: isInCart ? '0 0 0 2px var(--accent-cyan)' : '0 2px 8px rgba(0,0,0,0.07)'
    }"
    :title="product.item_name"
    @click="handleClick"
  >
    <!-- Image Area -->
    <div class="relative overflow-hidden" style="background: var(--item-bg);">
      <img
        :src="currentSrc"
        :alt="product.item_name"
        class="w-10/12 mx-auto h-24 sm:h-28 md:h-36 object-contain transition-transform duration-300 group-hover:scale-105"
        style="padding: 6px;"
        @error="handleImageError"
      />

      <!-- Stock Badge — top left -->
      <div
        class="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold"
        :style="stockBadgeStyle"
      >
        {{ stockLabel }}
      </div>

      <!-- Cart Qty Badge — top right -->
      <transition name="pop">
        <div
          v-if="cartQuantity > 0"
          class="absolute top-2 right-2 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold"
          :style="{ background: 'var(--accent-green)', color: '#fff' }"
        >
          {{ cartQuantity }}
        </div>
      </transition>

      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :style="{ background: 'var(--overlay-dark)' }"
      >
        <button
          class="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-transform duration-150 active:scale-95"
          :style="{ background: 'var(--accent-cyan)', color: '#fff' }"
          :disabled="outOfStock"
          @click.stop="handleQuickAdd"
        >
          <PlusIcon class="w-3 h-3" />
          {{ outOfStock ? 'Out of Stock' : 'Add to Cart' }}
        </button>
      </div>
    </div>

    <!-- Info Area -->
    <div class="px-3 pt-2 pb-3" :style="{ background: 'var(--card-bg)' }">
      <!-- Name -->
      <p
        class="font-semibold text-sm truncate leading-tight"
        :style="{ color: 'var(--text-main)' }"
        :title="product.item_name"
      >
        {{ product.item_name }}
      </p>

      <!-- Description -->
      <p
        v-if="product.description && product.description !== product.item_name"
        class="text-xs truncate mt-0.5"
        :style="{ color: 'var(--text-muted)' }"
      >
        {{ product.description }}
      </p>

      <!-- Price Row -->
      <div class="flex items-end justify-between mt-2">
        <div>
          <!-- Original price (crossed) if discounted -->
          <p
            v-if="product.discount_percentage > 0 || product.discount_amount > 0"
            class="text-xs line-through"
            :style="{ color: 'var(--text-muted)' }"
          >
            {{ formatPrice(product.original_rate) }}
          </p>
          <p
            class="font-bold text-sm"
            :style="{ color: discounted ? 'var(--accent-red, #ef4444)' : 'var(--primary-600)' }"
          >
            {{ formatPrice(product.rate) }}
          </p>
        </div>

        <!-- Qty / Stock -->
        <div class="flex flex-col items-end gap-0.5">
          <span
            v-if="product.actual_qty !== undefined"
            class="text-xs font-medium px-1.5 py-0.5 rounded"
            :style="qtyChipStyle"
          >
            {{ product.actual_qty }} {{ product.stock_uom || '' }}
          </span>
          <span
            v-if="isInCart"
            class="text-xs font-semibold"
            :style="{ color: 'var(--accent-green)' }"
          >
            ✓ In Cart
          </span>
        </div>
      </div>

      <!-- Discount Badge -->
      <div
        v-if="discounted"
        class="mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
        :style="{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red, #ef4444)' }"
      >
        <span v-if="product.discount_percentage > 0">-{{ product.discount_percentage }}%</span>
        <span v-else-if="product.discount_amount > 0">-{{ formatPrice(product.discount_amount) }}</span>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ background: 'var(--card-bg)', opacity: 0.9 }"
    >
      <LoadingSpinner class="w-6 h-6" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatPrice } from '@/utils/formatters'
import PlusIcon from '@/components/icons/PlusIcon.svg'
import LoadingSpinner from '../icons/LoadingSpinner.vue'
import config from '@/config/frappe'

const props = defineProps({
  product: { type: Object, required: true },
  isInCart: { type: Boolean, default: false },
  cartQuantity: { type: Number, default: 0 }
})

const emit = defineEmits(['add-to-cart', 'remove-from-cart', 'view-details'])

const isLoading = ref(false)
const imageError = ref(false)

const defaultImageSrc = `${config.VUE_URL}/src/assets/img/default-product.jpg`

const currentSrc = computed(() => {
  if (imageError.value) return defaultImageSrc
  if (!props.product?.image) return defaultImageSrc
  if (props.product.image.startsWith('http')) return props.product.image
  return `${config.FRAPPE_URL}${props.product.image}`
})

const discounted = computed(() =>
  props.product.discount_percentage > 0 || props.product.discount_amount > 0
)

const outOfStock = computed(() =>
  props.product.actual_qty !== undefined && props.product.actual_qty <= 0
)

// Stock badge label + style
const stockLabel = computed(() => {
  const qty = props.product.actual_qty
  if (qty === undefined || qty === null) return ''
  if (qty <= 0) return 'نفذ'
  if (qty <= 5) return 'كمية محدودة'
  return 'متوفر'
})

const stockBadgeStyle = computed(() => {
  const qty = props.product.actual_qty
  if (qty === undefined || qty === null) return { display: 'none' }
  if (qty <= 0) return { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  if (qty <= 5) return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
  return { background: 'rgba(16,185,129,0.15)', color: '#10b981' }
})

// Qty chip color
const qtyChipStyle = computed(() => {
  const qty = props.product.actual_qty
  if (qty === undefined || qty === null) return {}
  if (qty <= 0) return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
  if (qty <= 5) return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
  return { background: 'rgba(16,185,129,0.1)', color: '#10b981' }
})

const handleClick = () => emit('view-details', props.product)

const handleQuickAdd = async () => {
  if (isLoading.value || outOfStock.value) return
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 150))
    emit('add-to-cart', props.product)
  } finally {
    isLoading.value = false
  }
}

const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.pop-enter-active { animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: popIn 0.15s ease reverse; }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.4); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
