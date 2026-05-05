<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
    <!-- go to Supmertmarket only -->
   <!-- Navigation -->
    <div class="fixed top-0 left-0 w-full z-50 mb-2">
      <div class="w-screen bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg rounded-b-xl z-50">
        <router-Link :to="{ name: 'Supermarket' }" class="block px-6 py-4 text-white font-bold text-lg">
          العودة للتسوق
        </router-Link>
        </div>
    </div>

    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <!-- Custom Message Toast -->
    <Transition name="slide-fade">
      <div v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Empty Cart State -->
    <div v-if="cartStore.cart.length === 0" class="relative z-20 flex flex-col items-center justify-center min-h-screen">
      <div class="text-center space-y-6">
        <div class="text-8xl animate-bounce">🛒</div>
        <div>
          <h1 class="text-5xl font-black text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            السلة فارغة
          </h1>
          <p class="text-slate-400 text-lg font-light mb-8">لم تضف أي منتجات حتى الآن. ابدأ التسوق الآن!</p>
        </div>
        <router-link :to="{ name: 'Supermarket' }" class="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 font-bold text-lg">
          العودة للتسوق
        </router-link>
      </div>
    </div>

    <!-- Cart Content -->
    <div v-else class="relative z-20 max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="m-8">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          سلتي
        </h1>
        <p class="text-slate-400 font-light">{{ cartStore.cart.length }} منتج</p>
      </div>

      <!-- Delivery Info Card -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8 hover:border-emerald-500/50 transition-all duration-300">
        <button @click="toggleDeliverySchedule" class="w-full flex items-center justify-between group">
          <div class="text-left">
            <p class="text-sm text-slate-400 group-hover:text-slate-300 transition">التسليم المجدول</p>
            <p class="text-2xl font-bold text-white mt-1">غداً من 10 صباحاً إلى 6 مساءً</p>
          </div>
          <svg class="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition transform duration-300" :class="{ 'rotate-180': showDeliveryDetails }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        <!-- Progress Bar -->
        <Transition name="slide-down">
          <div v-if="showDeliveryDetails" class="mt-6 pt-6 border-t border-slate-700">
            <div class="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
              <div class="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-400">ابدأ</span>
              <div class="text-center">
                <p class="font-bold text-white mb-1">الحد الأدنى للطلب</p>
                <p class="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  {{ minOrderValue }} ج.م
                </p>
              </div>
              <span class="text-slate-400">الدفع</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Action Prompts -->
      <Transition name="fade">
        <div v-if="remainingAmount > 0" class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur border border-yellow-500/50 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-white mb-1">هل أنت مستعد للدفع؟</h3>
            <p class="text-slate-300">أضف منتجات بقيمة <span class="font-bold text-emerald-400">{{ remainingAmount.toFixed(2) }} ج.م</span> لإتمام الطلب</p>
          </div>
          <router-link :to="{ name: 'Supermarket' }" class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition whitespace-nowrap font-medium">
            أضف منتجات
          </router-link>
        </div>
        <div v-else class="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur border border-emerald-500/50 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-white mb-1">هل تريد شيء آخر؟</h3>
            <p class="text-slate-300">يمكنك إضافة منتجات أخرى قبل الدفع</p>
          </div>
          <router-link :to="{ name: 'Supermarket' }" class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition whitespace-nowrap font-medium">
            أضف منتجات
          </router-link>
        </div>
      </Transition>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items Section -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-white mb-6">منتجاتي</h2>

            <!-- Cart Items List -->
            <div class="space-y-4">
              <Transition-group name="list">
                <div
                  v-for="(item, index) in cartStore.cart"
                  :key="item.item_code + index"
                  class="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group"
                >
                  <div class="flex gap-4 items-start">
                    <!-- Product Image -->
                    <div class="w-28 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        :src="item.image ? config.FRAPPE_URL + item.image : defaultImageSrc"
                        :alt="item.item_name"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      >
                    </div>

                    <!-- Product Details -->
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold text-white mb-2 group-hover:text-emerald-400 transition line-clamp-2">
                        {{ item.item_name }}
                      </h3>
                      <p class="text-sm text-slate-400 mb-3">{{ item.category || 'بدون تصنيف' }}</p>
                      <p class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        {{ item.rate }} ج.م
                      </p>
                    </div>

                    <!-- Quantity & Actions -->
                    <div class="flex flex-col items-end gap-4">
                      <!-- Quantity Controls -->
                      <div class="flex items-center gap-1 bg-slate-900 border border-slate-600 rounded-lg p-1">
                        <button
                          @click="decreaseQuantity(index)"
                          class="w-9 h-9 flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span class="w-8 text-center font-bold text-white">{{ Math.abs(item.qty) }}</span>
                        <button
                          @click="increaseQuantity(index)"
                          class="w-9 h-9 flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <!-- Item Total & Remove -->
                      <div class="text-right">
                        <p class="text-sm text-slate-400 mb-2">
                          الإجمالي: <span class="font-bold text-emerald-400">{{ (item.rate * Math.abs(item.qty)).toFixed(2) }} ج.م</span>
                        </p>
                        <button
                          @click="removeItem(index)"
                          class="text-red-400 hover:text-red-300 text-sm font-medium hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition"
                        >
                          ✕ حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition-group>
            </div>

            <!-- Subtotal -->
            <div class="mt-8 pt-6 border-t border-slate-700">
              <div class="flex justify-between items-center">
                <span class="text-slate-400 font-medium">الإجمالي الفرعي</span>
                <span class="text-2xl font-black text-white">{{ cartStore.subtotal.toFixed(2) }} ج.م</span>
              </div>
            </div>

            <!-- Mobile Checkout Button -->
            <button
              @click="handleCheckout"
              :disabled="isProcessing || remainingAmount > 0"
              class="w-full mt-6 lg:hidden py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
            >
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري المعالجة...
              </span>
              <span v-else>{{ remainingAmount > 0 ? 'أضف منتجات إضافية' : 'تأكيد الطلب' }}</span>
            </button>
          </div>

          <!-- Fresh Topsellers Section -->
          <div v-if="productsStore.products.length > 0" class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h3 class="text-2xl font-bold text-white mb-6">المنتجات الشهيرة</h3>
            <div class="relative">
              <!-- Scroll Buttons -->
              <button
                @click="scroll('topsellers', -1)"
                class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2 shadow-lg hover:shadow-emerald-500/50 transition hover:scale-110 duration-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <!-- Products Carousel -->
              <div ref="topsellersScroll" class="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide">
                <div
                  v-for="product in productsStore.products.slice(0, 10)"
                  :key="product.item_code"
                  class="flex-shrink-0 w-56 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  <div class="h-40 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden relative">
                    <img
                      :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc"
                      :alt="product.item_name"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    >
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div class="p-4 flex-1 flex flex-col">
                    <h4 class="font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition">
                      {{ product.item_name }}
                    </h4>
                    <p class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-4 mt-auto">
                      {{ product.rate }} ج.م
                    </p>
                    <button
                      @click="addProductToCart(product)"
                      class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition text-sm font-bold group-hover:scale-105 duration-300 transform"
                    >
                      أضف للسلة
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Scroll Button -->
              <button
                @click="scroll('topsellers', 1)"
                class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-2 shadow-lg hover:shadow-emerald-500/50 transition hover:scale-110 duration-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Substitutions -->
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 lg:hidden">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                v-model="allowSubstitutions"
                type="checkbox"
                class="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              >
              <span class="font-medium text-white group-hover:text-emerald-400 transition">السماح باستبدال المنتجات</span>
              <span
                title="نسمح بـ استبدال المنتجات بمنتجات مشابهة في حالة عدم التوفر"
                class="text-slate-400 cursor-help hover:text-slate-300 transition"
              >
                ⓘ
              </span>
            </label>
          </div>
        </div>

        <!-- Order Summary (Desktop) -->
        <div class="hidden lg:block">
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sticky top-4 space-y-6">
            <h2 class="text-2xl font-bold text-white">ملخص الطلب</h2>

            <!-- Substitutions -->
            <label class="flex items-center gap-3 cursor-pointer group pb-6 border-b border-slate-700">
              <input
                v-model="allowSubstitutions"
                type="checkbox"
                class="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              >
              <span class="font-medium text-white group-hover:text-emerald-400 transition">السماح باستبدال المنتجات</span>
              <span
                title="نسمح بـ استبدال المنتجات بمنتجات مشابهة في حالة عدم التوفر"
                class="text-slate-400 cursor-help hover:text-slate-300 transition"
              >
                ⓘ
              </span>
            </label>

            <!-- Price Breakdown -->
            <div class="space-y-3 pb-6 border-b border-slate-700">
              <div class="flex justify-between text-slate-400">
                <span>الإجمالي الفرعي</span>
                <span class="font-bold text-white">{{ cartStore.subtotal.toFixed(2) }} ج.م</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>رسوم التسليم</span>
                <span class="font-bold text-white">{{ deliveryFee }} ج.م</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>الضريبة (14%)</span>
                <span class="font-bold text-white">{{ cartStore.taxAmount?.toFixed(2) || 0 }} ج.م</span>
              </div>
            </div>

            <!-- Total -->
            <div class="space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-white">الإجمالي</span>
                <div class="text-right">
                  <p class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                    {{ ((cartStore.totalPrice || cartStore.subtotal) + deliveryFee).toFixed(2) }} ج.م
                  </p>
                  <p class="text-xs text-slate-400 mt-1">(شامل الضريبة)</p>
                </div>
              </div>
            </div>

            <!-- Checkout Button -->
            <button
              @click="handleCheckout"
              :disabled="isProcessing || remainingAmount > 0"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
            >
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري المعالجة...
              </span>
              <span v-else>{{ remainingAmount > 0 ? 'أضف منتجات إضافية' : 'تأكيد الطلب' }}</span>
            </button>

            <!-- Minimum Order Info -->
            <Transition name="fade">
              <div v-if="remainingAmount > 0" class="text-center text-sm text-yellow-400 font-medium px-4 py-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                أضف منتجات بقيمة {{ remainingAmount.toFixed(2) }} ج.م لإتمام الطلب
              </div>
              <div v-else class="text-center text-sm text-slate-400 px-4 py-3 bg-slate-700/50 rounded-lg">
                الحد الأدنى للطلب: {{ minOrderValue }} ج.م
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import config from '@/config/frappe'
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { useRouter } from 'vue-router'

const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = ref(`${config.VUE_URL}${defaultImage}`)

const cartStore = useCartStore()
const productsStore = useProductsStore()
const router = useRouter()

// ========== STATE ==========
const showDeliveryDetails = ref(false)
const allowSubstitutions = ref(true)
const isProcessing = ref(false)

const minOrderValue = 1000
const deliveryFee = 50

const message = ref({
  show: false,
  text: '',
  type: 'success'
})

// ========== COMPUTED ==========
const remainingAmount = computed(() => {
  const needed = minOrderValue - cartStore.subtotal
  return needed > 0 ? needed : 0
})

const progressPercentage = computed(() => {
  return Math.min((cartStore.subtotal / minOrderValue) * 100, 100)
})

// ========== METHODS ==========
const toggleDeliverySchedule = () => {
  showDeliveryDetails.value = !showDeliveryDetails.value
}

const increaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    if (item.isReturn) {
      cartStore.updateQuantity(item.item_code, item.qty - 1, 'return')
    } else {
      item.qty += 1
      cartStore.updateChange()
    }
  }
}

const decreaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    if (item.isReturn) {
      if (Math.abs(item.qty) > 0) {
        cartStore.updateQuantity(item.item_code, item.qty + 1, 'return')
      }
    } else {
      if (item.qty > 1) {
        item.qty -= 1
        cartStore.updateChange()
      } else {
        removeItem(index)
      }
    }
  }
}

const removeItem = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    cartStore.removeFromCart(item.item_code)
    showMessage('تم حذف المنتج من السلة', 'success')
  }
}

const addProductToCart = (product) => {
  cartStore.addToCart(product)
  showMessage('تم إضافة المنتج إلى السلة!', 'success')
}

const scroll = (section, direction) => {
  const ref = document.querySelector('[data-ref="' + section + '"]')
  if (!ref) {
    const scrollable = document.querySelector('.overflow-x-auto')
    if (scrollable) {
      const scrollAmount = direction === 1 ? 250 : -250
      scrollable.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  } else {
    const scrollAmount = direction === 1 ? 250 : -250
    ref.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const handleCheckout = async () => {
  if (remainingAmount.value > 0) {
    showMessage(`يرجى إضافة منتجات بقيمة ${remainingAmount.value.toFixed(2)} جنيه`, 'error')
    return
  }

  isProcessing.value = true

  try {
    // Process transaction through cart store
    const transactionData = await cartStore.processTransaction(payloadData)

    showMessage('جاري الانتقال إلى الدفع...', 'success')

    // Clear cart and redirect
    setTimeout(() => {
      isProcessing.value = false
    }, 1000)

  } catch (error) {
    console.error('Error during checkout:', error)
    showMessage('حدث خطأ أثناء معالجة الطلب', 'error')
    isProcessing.value = false
  }
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// ========== LIFECYCLE ==========
onMounted(async () => {
  // Load products if not already loaded
  if (productsStore.products.length === 0) {
    try {
      await productsStore.loadProductsFromFrappeDB()
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }
})
</script>

<style scoped>
/* =================== ANIMATIONS =================== */
@keyframes slide-fade {
  enter-active { transition: all 0.3s ease; }
  enter-from { transform: translateX(30px); opacity: 0; }
  leave-to { transform: translateX(30px); opacity: 0; }
}

@keyframes slide-down {
  enter-active { transition: all 0.3s ease; }
  enter-from { transform: translateY(-20px); opacity: 0; }
}

@keyframes fade {
  enter-active { transition: opacity 0.3s ease; }
  enter-from { opacity: 0; }
  leave-to { opacity: 0; }
}

@keyframes list {
  enter-active { transition: all 0.3s ease; }
  enter-from { opacity: 0; transform: translateY(10px); }
  leave-to { opacity: 0; transform: translateX(-100px); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

/* =================== UTILITIES =================== */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scroll-smooth {
  scroll-behavior: smooth;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Global Animations and Effects */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes wiggle {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Utility Classes */

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fadeInDown {
  animation: fadeInDown 0.6s ease-out;
}

.animate-slideInLeft {
  animation: slideInLeft 0.6s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.6s ease-out;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-wiggle {
  animation: wiggle 0.3s ease-in-out;
}

.animate-shimmer {
  background: linear-gradient(90deg, #374151, #4b5563, #374151);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Smooth Transitions */

* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Backdrop Blur Effects */

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Gradient Text Effects */

.text-gradient {
  background: linear-gradient(135deg, #10b981, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-white {
  background: linear-gradient(135deg, #ffffff, #e5e7eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass Morphism */

.glass {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.glass-hover:hover {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(16, 185, 129, 0.5);
}

/* Smooth Hover Effects */

.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.hover-scale {
  transition: all 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

/* Loading States */

.loading-shimmer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    #374151 0%,
    #4b5563 50%,
    #374151 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* Scrollbar Styling */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* Selection Styles */

::selection {
  background-color: #10b981;
  color: white;
}

::-moz-selection {
  background-color: #10b981;
  color: white;
}

/* Input Focus States */

input:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Button States */

button:active {
  transform: scale(0.98);
}

/* Accessibility */

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* Dark Mode Text Readability */

.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Custom Gradients */

.gradient-emerald-teal {
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
}

.gradient-emerald-teal-hover:hover {
  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
}

.gradient-slate-dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

/* Card Hover Effects */

.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.5);
}
</style>
