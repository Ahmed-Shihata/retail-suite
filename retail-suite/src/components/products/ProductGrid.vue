<!-- ProductGrid.vue -->
<template>
  <div class="h-full flex flex-col overflow-hidden gap-3 mt-3">

    <!-- Filter Bar (pricelist + warehouse) -->
    <FilterBar
      v-model:selectedPriceList="productsStore.selectedPriceList"
      v-model:selectedWarehouse="productsStore.selectedWarehouse"
      :price-lists="productsStore.priceLists"
      :warehouses="productsStore.warehouses"
      :is-loading="productsStore.isLoading"
      @reload="productsStore.loadProductsFromFrappeDB()"
    />

    <!-- Category Filter -->
    <CategoryFilter v-model="selectedCategory" />

    <!-- Scrollable Grid Area -->
    <div class="flex-1 overflow-y-auto px-1">

      <!-- Empty DB -->
      <div
        v-if="productsStore.products.length === 0 && !productsStore.isLoading"
        class="select-none rounded-3xl flex flex-wrap content-center justify-center h-full opacity-25"
        :style="{ background: 'var(--item-bg)', color: 'var(--text-main)' }"
      >
        <div class="w-full text-center">
          <EmptyDatabaseIcon />
          <p class="text-xl mt-2">لا توجد منتجات</p>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-else-if="productsStore.isLoading"
        class="select-none flex flex-wrap content-center justify-center h-full opacity-40"
        :style="{ color: 'var(--text-main)' }"
      >
        <div class="w-full text-center">
          <LoadingSpinner />
          <p class="text-xl mt-4">جاري تحميل المنتجات...</p>
        </div>
      </div>

      <!-- No Search Results -->
      <div
        v-else-if="filteredProducts.length === 0 && (searchKeyword || selectedCategory)"
        class="select-none flex flex-wrap content-center justify-center h-full opacity-25"
        :style="{ color: 'var(--text-main)' }"
      >
        <div class="w-full text-center">
          <EmptySearchIcon />
          <p class="text-xl mt-2">لا توجد نتائج</p>
          <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">
            "{{ searchKeyword || selectedCategory }}"
          </p>
        </div>
      </div>

      <!-- Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.item_code"
          :product="product"
          :is-in-cart="cartStore.isInCart(product.item_code)"
          :cart-quantity="cartStore.getProductQuantity(product.item_code)"
          @add-to-cart="handleAddToCart"
          @remove-from-cart="handleRemoveFromCart"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Results count -->
      <div
        v-if="(searchKeyword || selectedCategory) && filteredProducts.length > 0"
        class="text-center text-xs mt-2 pb-2"
        :style="{ color: 'var(--text-muted)' }"
      >
        {{ filteredProducts.length }} منتج
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import CategoryFilter from './CategoryFilter.vue'
import FilterBar from './FilterBar.vue'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import EmptyDatabaseIcon from '@/components/icons/EmptyDatabaseIcon.svg'
import EmptySearchIcon from '@/components/icons/EmptySearchIcon.svg'

const props = defineProps({
  searchKeyword: { type: String, default: '' }
})
const emit = defineEmits(['add-to-cart', 'remove-from-cart', 'view-details'])

const productsStore = useProductsStore()
const cartStore = useCartStore()
const selectedCategory = ref('')

// فلترة محلية بالـ search + category
const filteredProducts = computed(() => {
  let list = productsStore.products

  if (selectedCategory.value) {
    list = list.filter(p => p.item_group === selectedCategory.value)
  }

  if (props.searchKeyword) {
    const kw = props.searchKeyword.toLowerCase().trim()
    list = list.filter(p =>
      p.item_code?.toLowerCase().includes(kw) ||
      p.item_name?.toLowerCase().includes(kw) ||
      p.description?.toLowerCase().includes(kw)
    )
  }

  return list
})

// لما يتغير الـ search keyword — reload لو فيه limit search
watch(
  () => props.searchKeyword,
  (kw) => {
    productsStore.setSearchKeyword(kw)
  }
)

const handleAddToCart    = (p) => { cartStore.addToCart(p);                emit('add-to-cart', p) }
const handleRemoveFromCart = (p) => { cartStore.removeFromCart(p.item_code); emit('remove-from-cart', p) }
const handleViewDetails  = (p) => emit('view-details', p)

// Loading Spinner inline component
const LoadingSpinner = {
  template: `
    <div style="
      display:inline-block; width:5rem; height:5rem;
      border-radius:9999px; border:3px solid transparent;
      border-bottom-color:var(--text-muted);
      animation:spin 1s linear infinite;
    "></div>
  `
}


onMounted(async () => {
  await productsStore.loadFilterOptions()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
