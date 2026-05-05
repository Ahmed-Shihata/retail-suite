<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden" dir="ltr">
    <Navbar />

    <!-- Floating Background Blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style="animation-delay:2s"></div>
    </div>

    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="toast.show"
        :class="toast.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        {{ toast.text }}
      </div>
    </Transition>

    <div class="relative z-20 max-w-5xl mx-auto px-4 py-8 pt-28">

      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <div class="relative">
          <div class="w-20 h-20 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
        </div>
        <p class="text-slate-400 mt-6 text-lg font-medium">جاري تحميل بيانات الطلب...</p>
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="!order" class="flex flex-col items-center justify-center py-32 text-center">
        <div class="text-8xl mb-6">😕</div>
        <h2 class="text-3xl font-bold text-white mb-3">الطلب غير موجود</h2>
        <p class="text-slate-400 mb-8">لم يتم العثور على طلب بهذا الرقم</p>
        <router-link :to="{ name: 'CustomerOrders' }"
          class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105">
          العودة لطلباتي
        </router-link>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">

        <!-- Page Header -->
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <router-link :to="{ name: 'CustomerOrders' }"
                class="text-slate-400 hover:text-emerald-400 transition text-sm flex items-center gap-1">
                ← طلباتي
              </router-link>
            </div>
            <h1 class="text-4xl font-black text-white">
              تتبع طلب
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                #{{ order.name }}
              </span>
            </h1>
            <p class="text-slate-400 mt-1">آخر تحديث: {{ lastUpdated }}</p>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center gap-3">
            <span :class="getStatusClass(currentStatus)" class="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-current animate-pulse inline-block"></span>
              {{ getStatusLabel(currentStatus) }}
            </span>
            <!-- Refresh -->
            <button @click="refreshOrder" :disabled="isRefreshing"
              class="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-200">
              <svg :class="{ 'animate-spin': isRefreshing }" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ─── Timeline Card ───────────────────────────────────────────────── -->
        <div class="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-6 overflow-hidden">
          <h2 class="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span class="text-emerald-400">🕐</span> مراحل الطلب
          </h2>

          <!-- Steps Row (Desktop) -->
          <div class="hidden md:flex items-center justify-between relative mb-4">
            <!-- Progress Bar -->
            <div class="absolute top-5 left-0 right-0 h-1 bg-slate-700 rounded-full mx-10 z-0">
              <div
                class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                :style="{ width: timelineProgress + '%' }"
              ></div>
            </div>

            <div v-for="(step, i) in timelineSteps" :key="step.key"
              class="flex flex-col items-center z-10 flex-1">
              <!-- Circle -->
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-lg mb-3 transition-all duration-500 border-2',
                step.done ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400 shadow-lg shadow-emerald-500/40' :
                step.active ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse-border' :
                'bg-slate-800 border-slate-600'
              ]">
                <span v-if="step.done">✓</span>
                <span v-else>{{ step.icon }}</span>
              </div>
              <!-- Label -->
              <p :class="step.done || step.active ? 'text-white' : 'text-slate-500'"
                class="text-xs font-bold text-center transition-colors duration-300">
                {{ step.label }}
              </p>
              <!-- Time -->
              <p v-if="step.time" class="text-emerald-400 text-xs mt-0.5 text-center">{{ step.time }}</p>
            </div>
          </div>

          <!-- Steps Column (Mobile) -->
          <div class="md:hidden space-y-0">
            <div v-for="(step, i) in timelineSteps" :key="step.key" class="flex gap-4">
              <!-- Left: circle + line -->
              <div class="flex flex-col items-center">
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 transition-all duration-500',
                  step.done ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400 shadow-lg shadow-emerald-500/40' :
                  step.active ? 'bg-slate-800 border-emerald-500 animate-pulse-border' :
                  'bg-slate-800 border-slate-600'
                ]">
                  <span v-if="step.done" class="text-white font-bold text-sm">✓</span>
                  <span v-else>{{ step.icon }}</span>
                </div>
                <div v-if="i < timelineSteps.length - 1"
                  :class="step.done ? 'bg-emerald-500' : 'bg-slate-700'"
                  class="w-0.5 flex-1 min-h-[32px] transition-colors duration-500 mt-1"></div>
              </div>
              <!-- Right: text -->
              <div class="pb-6 flex-1">
                <p :class="step.done || step.active ? 'text-white' : 'text-slate-500'"
                  class="font-bold transition-colors">{{ step.label }}</p>
                <p v-if="step.description" class="text-slate-400 text-sm">{{ step.description }}</p>
                <p v-if="step.time" class="text-emerald-400 text-xs mt-0.5">{{ step.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── ETA Banner (if active) ────────────────────────────────────── -->
        <div v-if="showETA"
          class="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4">
          <div class="text-4xl">🚚</div>
          <div>
            <p class="text-white font-bold text-lg">طلبك في الطريق!</p>
            <p class="text-slate-300 text-sm">التوصيل المتوقع: <span class="text-emerald-400 font-bold">{{ formatDate(order.delivery_date) }}</span></p>
          </div>
        </div>

        <!-- ─── Grid: Delivery + Driver ──────────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Delivery Address Card -->
          <div class="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-6">
            <h2 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span class="text-emerald-400">📍</span> عنوان التوصيل
            </h2>
            <div v-if="order.shipping_address || order.custom_shipping_address_name">
              <p class="text-white font-bold mb-1">{{ order.custom_shipping_address_name || '—' }}</p>
              <template v-if="order.shipping_address">
                <p class="text-slate-300 text-sm">{{ order.shipping_address.address_line1 }}</p>
                <p class="text-slate-300 text-sm" v-if="order.shipping_address.address_line2">{{ order.shipping_address.address_line2 }}</p>
                <p class="text-slate-300 text-sm">
                  {{ order.shipping_address.city }}{{ order.shipping_address.state ? '، ' + order.shipping_address.state : '' }}
                </p>
              </template>
            </div>
            <p v-else class="text-slate-400 text-sm">لم يتم تحديد العنوان</p>

            <!-- Mini Static Map Placeholder -->
            <div class="mt-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 h-36 flex items-center justify-center relative">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-teal-900/20"></div>
              <!-- Fake map grid lines -->
              <div class="absolute inset-0 opacity-10">
                <div v-for="i in 6" :key="'h'+i" class="absolute w-full border-t border-emerald-400"
                  :style="{ top: (i * 16.67) + '%' }"></div>
                <div v-for="i in 8" :key="'v'+i" class="absolute h-full border-l border-emerald-400"
                  :style="{ left: (i * 12.5) + '%' }"></div>
              </div>
              <div class="relative z-10 flex flex-col items-center">
                <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 animate-bounce-slow">
                  📍
                </div>
                <p class="text-slate-400 text-xs mt-2">موقع التوصيل</p>
              </div>
            </div>
          </div>

          <!-- Driver Info Card -->
          <div class="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-6">
            <h2 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span class="text-emerald-400">🚴</span> المندوب
            </h2>
            <div v-if="order.custom_driver_name || order.driver_name" class="flex items-center gap-4">
              <!-- Avatar -->
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                🧑
              </div>
              <div class="flex-1">
                <p class="text-white font-bold text-lg">{{ order.custom_driver_name || order.driver_name }}</p>
                <p class="text-slate-400 text-sm mb-3">مندوب التوصيل</p>
                <!-- Call Button -->
                <a v-if="order.custom_driver_phone || order.driver_phone"
                  :href="'tel:' + (order.custom_driver_phone || order.driver_phone)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl transition-all duration-200 text-sm font-bold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ order.custom_driver_phone || order.driver_phone }}
                </a>
              </div>
            </div>

            <!-- No driver yet -->
            <div v-else class="flex flex-col items-center justify-center py-8 text-center">
              <div class="text-5xl mb-3 opacity-40">🚴</div>
              <p class="text-slate-500 font-medium">لم يتم تعيين مندوب بعد</p>
              <p class="text-slate-600 text-sm mt-1">سيتم التعيين بعد تأكيد الطلب</p>
            </div>

            <!-- Estimated Time -->
            <div v-if="order.delivery_date" class="mt-4 pt-4 border-t border-slate-700/50">
              <div class="flex items-center justify-between">
                <span class="text-slate-400 text-sm">موعد التسليم المتوقع</span>
                <span class="text-emerald-400 font-bold text-sm">{{ formatDate(order.delivery_date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Order Items + Summary ──────────────────────────────────────── -->
        <div class="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl overflow-hidden">
          <div class="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h2 class="text-white font-bold text-lg flex items-center gap-2">
              <span class="text-emerald-400">🛒</span>
              المنتجات ({{ order.items?.length || 0 }})
            </h2>
            <span class="text-slate-400 text-sm">الإجمالي: <span class="text-emerald-400 font-bold">{{ (order.grand_total || 0).toFixed(2) }} ج.م</span></span>
          </div>

          <div class="divide-y divide-slate-700/40">
            <div v-for="item in order.items" :key="item.item_code"
              class="flex items-center gap-4 p-4 hover:bg-slate-700/20 transition-colors duration-200 group">
              <!-- Image -->
              <div class="w-14 h-14 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-600/50">
                <img
                  :src="item.image ? config.FRAPPE_URL + item.image : defaultImageSrc"
                  :alt="item.item_name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h5 class="text-white font-bold truncate group-hover:text-emerald-400 transition-colors">{{ item.item_name }}</h5>
                <p class="text-slate-400 text-sm">{{ item.item_code }} · الكمية: {{ item.qty }} {{ item.uom }}</p>
              </div>
              <!-- Price -->
              <div class="text-right flex-shrink-0">
                <p class="text-emerald-400 font-bold">{{ (item.rate || 0).toFixed(2) }} ج.م</p>
                <p class="text-slate-500 text-xs">الإجمالي: {{ (item.amount || 0).toFixed(2) }} ج.م</p>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="p-6 bg-slate-900/40 border-t border-slate-700/50">
            <div class="space-y-2 max-w-xs mr-auto">
              <div class="flex justify-between text-slate-400 text-sm">
                <span>الإجمالي الفرعي</span>
                <span class="text-white">{{ (order.net_total || 0).toFixed(2) }} ج.م</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>الضريبة</span>
                <span class="text-white">{{ (order.total_taxes_and_charges || 0).toFixed(2) }} ج.م</span>
              </div>
              <div class="flex justify-between font-bold text-base border-t border-slate-600 pt-2 mt-2">
                <span class="text-white">الإجمالي الكلي</span>
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 text-xl">
                  {{ (order.grand_total || 0).toFixed(2) }} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Actions Row ─────────────────────────────────────────────────── -->
        <div class="flex flex-wrap gap-3 pb-8">
          <router-link :to="{ name: 'CustomerOrders' }"
            class="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600 rounded-xl transition font-bold">
            ← العودة لطلباتي
          </router-link>
          <router-link :to="{ name: 'Supermarket' }"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition font-bold transform hover:scale-105">
            🛍️ تسوق أكثر
          </router-link>
        </div>

      </div><!-- /main content -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/pages/website/components/navbar.vue'
import config from '@/config/frappe'
import { getOrderDetailsApi } from '@/services/api'

const route  = useRoute()
const router = useRouter()

// ─── State ────────────────────────────────────────────────────────────────────
const isLoading   = ref(true)
const isRefreshing = ref(false)
const order       = ref(null)
const lastUpdated = ref('')
const defaultImageSrc = ref(`${config.VUE_URL}/src/assets/img/default-product.jpg`)
const toast = ref({ show: false, text: '', type: 'success' })

// ─── Auto-refresh every 60s ────────────────────────────────────────────────
let refreshInterval = null

// ─── Timeline Config ──────────────────────────────────────────────────────────
const STEPS = [
  { key: 'In Review',  label: 'قيد المراجعة', icon: '🔍', description: 'جاري مراجعة طلبك' },
  { key: 'Confirmed',  label: 'مؤكد',         icon: '✅', description: 'تم تأكيد طلبك'    },
  { key: 'Preparing',  label: 'قيد التحضير',  icon: '📦', description: 'جاري تحضير طلبك'  },
  { key: 'Shipped',    label: 'في الطريق',    icon: '🚚', description: 'طلبك في الطريق'   },
  { key: 'Delivered',  label: 'تم التوصيل',   icon: '🎉', description: 'تم توصيل طلبك'    },
]

const STATUS_ORDER = ['In Review','Confirmed','Preparing','Shipped','Delivered']

// ─── Computed ────────────────────────────────────────────────────────────────
const currentStatus = computed(() => order.value?.workflow_state || order.value?.status || '')

const currentStepIndex = computed(() => {
  const idx = STATUS_ORDER.indexOf(currentStatus.value)
  return idx === -1 ? 0 : idx
})

const timelineSteps = computed(() => {
  return STEPS.map((step, i) => ({
    ...step,
    done:   i < currentStepIndex.value,
    active: i === currentStepIndex.value,
    // Fake timestamps — replace with real ones from API if available
    time: i < currentStepIndex.value
      ? formatDate(order.value?.transaction_date)
      : i === currentStepIndex.value
        ? 'الآن'
        : null
  }))
})

const timelineProgress = computed(() => {
  if (currentStepIndex.value === 0) return 0
  return (currentStepIndex.value / (STEPS.length - 1)) * 100
})

const showETA = computed(() => {
  return ['Confirmed', 'Preparing', 'Shipped'].includes(currentStatus.value)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const now = () => {
  return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

const getStatusClass = (status) => {
  const map = {
    'In Review': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    Confirmed:   'bg-blue-500/20 text-blue-400 border border-blue-500/50',
    Preparing:   'bg-purple-500/20 text-purple-400 border border-purple-500/50',
    Shipped:     'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50',
    Delivered:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    Cancelled:   'bg-red-500/20 text-red-400 border border-red-500/50',
  }
  return map[status] || 'bg-slate-500/20 text-slate-400 border border-slate-500/50'
}

const getStatusLabel = (status) => {
  const map = {
    'In Review': 'قيد المراجعة',
    Confirmed:   'مؤكد',
    Preparing:   'قيد التحضير',
    Shipped:     'في الطريق',
    Delivered:   'تم التوصيل',
    Cancelled:   'ملغي',
    pending:     'قيد الانتظار',
  }
  return map[status] || status
}

const showToast = (text, type = 'success') => {
  toast.value = { show: true, text, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ─── API ─────────────────────────────────────────────────────────────────────
const loadOrder = async () => {
  try {
    const orderId = route.params.id
    const data = await getOrderDetailsApi(orderId)
    if (data) {
      order.value = data
      console.log("Data order", order.value)
      lastUpdated.value = now()
    }
  } catch (err) {
    console.error('Error loading order:', err)
    order.value = null
  } finally {
    isLoading.value = false
  }
}

const refreshOrder = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    const orderId = route.params.id
    const data = await getOrderDetailsApi(orderId)
    if (data) {
      order.value = data
      lastUpdated.value = now()
      showToast('تم تحديث البيانات', 'success')
    }
  } catch {
    showToast('خطأ في تحديث البيانات', 'error')
  } finally {
    isRefreshing.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadOrder()
  // Auto-refresh every 60 seconds
  refreshInterval = setInterval(refreshOrder, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
/* Slide-fade toast */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to       { transform: translateX(30px); opacity: 0; }

/* Modal */
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; transform: scale(0.95); }

/* Bounce slow for map pin */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

/* Pulse border for active step */
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}
.animate-pulse-border { animation: pulse-border 2s ease-in-out infinite; }
</style>
