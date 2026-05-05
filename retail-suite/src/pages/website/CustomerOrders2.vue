<!-- CustomerOrders.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden" dir="ltr">
    <Navbar />

    <!-- Floating Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 left-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- ✅ Edit Shipping Address Modal -->
    <Transition name="modal">
      <div v-if="showEditAddressModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeEditModal"></div>
        <div class="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span class="text-emerald-400">📍</span>
            {{ isAddingNewAddress ? 'إضافة عنوان جديد' : 'تغيير عنوان الشحن' }}
          </h3>

          <!-- Existing Addresses -->
          <div v-if="!isAddingNewAddress">
            <div v-if="isLoadingAddresses" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
            <div v-else class="space-y-3 mb-4 max-h-64 overflow-y-auto">
              <div
                v-for="addr in customerAddresses"
                :key="addr.name"
                @click="editingSelectedAddress = addr"
                :class="editingSelectedAddress?.name === addr.name ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-slate-500'"
                class="p-4 border rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-bold text-white group-hover:text-emerald-400 transition">{{ addr.address_title }}</p>
                    <!-- Primary Badge -->
                    <span
                      v-if="addr.is_primary_address"
                      class="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full"
                    >
                      أساسي
                    </span>
                    <!-- Shipping Badge -->
                    <span
                      v-if="addr.is_shipping_address"
                      class="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full"
                    >
                      شحن
                    </span>
                    <p class="text-slate-400 text-sm mt-1">{{ addr.address_line1 }}</p>
                    <p class="text-slate-400 text-sm" v-if="addr.address_line2">{{ addr.address_line2 }}</p>
                    <p class="text-slate-400 text-sm">{{ addr.city }}{{ addr.state ? '، ' + addr.state : '' }}{{ addr.country ? '، ' + addr.country : '' }} </p>
                  </div>
                  <div v-if="editingSelectedAddress?.name === addr.name" class="text-emerald-400 text-xl">✓</div>
                </div>
              </div>
            </div>
            <button @click="isAddingNewAddress = true" class="w-full py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 rounded-xl transition-all duration-200 font-medium mb-4">
              + إضافة عنوان جديد
            </button>
            <button
              v-if="editingSelectedAddress"
              @click="confirmEditAddress"
              :disabled="isUpdatingAddress"
              class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold disabled:opacity-50"
            >
              <span v-if="isUpdatingAddress" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري التحديث...
              </span>
              <span v-else>تأكيد تغيير العنوان</span>
            </button>
          </div>

          <!-- Add New Address Form -->
          <div v-else class="space-y-3">
            <div>
              <label class="text-sm text-slate-400 mb-1 block">اسم العنوان *</label>
              <input v-model="newAddress.title" type="text" placeholder="مثال: المنزل، العمل..."
                class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" />
            </div>
            <div>
              <label class="text-sm text-slate-400 mb-1 block">العنوان الأول *</label>
              <input v-model="newAddress.line1" type="text" placeholder="الشارع، رقم العمارة..."
                class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" />
            </div>
            <div>
              <label class="text-sm text-slate-400 mb-1 block">العنوان الثاني</label>
              <input v-model="newAddress.line2" type="text" placeholder="الدور، الشقة..."
                class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-slate-400 mb-1 block">المدينة *</label>
                <input v-model="newAddress.city" type="text" placeholder="القاهرة..."
                  class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" />
              </div>
              <div>
                <label class="text-sm text-slate-400 mb-1 block">المحافظة</label>
                <input v-model="newAddress.state" type="text" placeholder="الجيزة..."
                  class="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition" />
              </div>
            </div>
            <div class="pt-2 border-t border-slate-700 mt-2">
                <label class="text-sm text-slate-400 mb-3 block"> نوع العنوان</label>
                <div class="flex flex-wrap gap-3">

                  <!-- Primary Badge -->
                  <span
                    @click="newAddress.is_primary_address = newAddress.is_primary_address ? 0 : 1"
                    :class="newAddress.is_primary_address
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                      : 'bg-slate-700 text-slate-400 border-slate-600'"
                    class="px-3 py-1 rounded-full text-xs border cursor-pointer transition-all duration-200 select-none"
                  >
                    عنوان أساسي
                  </span>

                  <!-- Shipping Badge -->
                  <span
                    @click="newAddress.is_shipping_address = newAddress.is_shipping_address ? 0 : 1"
                    :class="newAddress.is_shipping_address
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                      : 'bg-slate-700 text-slate-400 border-slate-600'"
                    class="px-3 py-1 rounded-full text-xs border cursor-pointer transition-all duration-200 select-none"
                  >
                    عنوان شحن
                  </span>

                </div>

            </div>

            <div class="flex gap-3 mt-4">
              <button @click="isAddingNewAddress = false" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition font-medium">رجوع</button>
              <button @click="saveNewAddressForOrder" :disabled="isSavingAddress"
                class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold disabled:opacity-50">
                <span v-if="isSavingAddress" class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </span>
                <span v-else>حفظ وتطبيق</span>
              </button>
            </div>
          </div>

          <button @click="closeEditModal" class="absolute top-4 left-4 text-slate-400 hover:text-white transition text-xl">✕</button>
        </div>
      </div>
    </Transition>

    <!-- ✅ Cancel Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showCancelModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showCancelModal = false"></div>
        <div class="relative bg-slate-800 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div class="text-center">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-bold text-white mb-3">إلغاء الطلب</h3>
            <p class="text-slate-300 mb-2">هل أنت متأكد من إلغاء الطلب</p>
            <p class="text-emerald-400 font-bold mb-6">#{{ cancelTargetOrder?.name }}</p>
            <p class="text-slate-400 text-sm mb-6">لا يمكن التراجع عن هذا الإجراء</p>
            <div class="flex gap-3">
              <button @click="showCancelModal = false" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition font-medium">
                تراجع
              </button>
              <button @click="confirmCancelOrder" :disabled="isCancelling"
                class="flex-1 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition font-bold disabled:opacity-50">
                <span v-if="isCancelling" class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الإلغاء...
                </span>
                <span v-else>تأكيد الإلغاء</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="relative z-20 max-w-7xl mx-auto px-4 py-8 pt-24">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          طلباتي
        </h1>
        <p class="text-slate-400 font-light">{{ orders.length }} طلب</p>
      </div>

      <!-- Filters -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="status in orderStatuses"
            :key="status.value"
            @click="selectedStatus = status.value"
            :class="selectedStatus === status.value
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'"
            class="px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
          >
            {{ status.label }}
            <span v-if="getStatusCount(status.value)" class="mr-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {{ getStatusCount(status.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mb-4"></div>
        <p class="text-slate-400 text-lg">جاري تحميل الطلبات...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="text-8xl animate-bounce mb-6">📦</div>
        <h2 class="text-3xl font-bold text-white mb-3">لا توجد طلبات</h2>
        <p class="text-slate-400 text-lg mb-8">لم تقم بأي طلبات حتى الآن</p>
        <router-link :to="{ name: 'Supermarket' }" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 font-bold">
          ابدأ التسوق الآن
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-6">
        <Transition-group name="list">
          <div
            v-for="order in filteredOrders"
            :key="order.name"
            class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
          >
            <!-- Order Header -->
            <div class="p-6 border-b border-slate-700/50">
              <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 class="text-xl font-bold text-white mb-1">طلب #{{ order.name }}</h3>
                  <p class="text-slate-400 text-sm">{{ formatDate(order.transaction_date) }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span :class="getStatusClass(order.workflow_state || order.status)" class="px-4 py-2 rounded-lg font-bold text-sm">
                    {{ getStatusLabel(order.workflow_state || order.status) }}
                  </span>
                  <button @click="toggleOrderDetails(order.name)" class="text-emerald-400 hover:text-emerald-300 transition">
                    <svg class="w-6 h-6 transform transition-transform duration-300"
                      :class="{ 'rotate-180': expandedOrders.includes(order.name) }"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Order Summary Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-slate-400 text-sm mb-1">عدد المنتجات</p>
                  <p class="text-white font-bold">{{ order.items?.length || 0 }} منتج</p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-1">الإجمالي</p>
                  <p class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                    {{ (order.grand_total || 0).toFixed(2) }} ج.م
                  </p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-1">عنوان الشحن</p>
                  <p class="text-white font-bold text-sm truncate max-w-[140px]">
                    {{ order.custom_shipping_address_name || '—' }}
                  </p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-1">التسليم</p>
                  <p class="text-white font-bold text-sm">{{ formatDate(order.delivery_date) }}</p>
                </div>
              </div>
            </div>

            <!-- Expandable Order Details -->
            <Transition name="slide-down">
              <div v-if="expandedOrders.includes(order.name)" class="p-6 bg-gradient-to-b from-slate-900/50 to-transparent">

                <!-- ✅ Shipping Address Section with Edit Option -->
                <div class="mb-6 p-4 bg-slate-800/50 rounded-xl border transition-all duration-300"
                  :class="canEditOrder(order) ? 'border-emerald-500/30 hover:border-emerald-500/60' : 'border-slate-700/50'">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3 flex-1">
                      <svg class="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <h4 class="text-white font-bold mb-1">عنوان التسليم</h4>
                        <div v-if="order.shipping_address">
                          <p class="text-slate-300 text-sm">{{ order.shipping_address.address_line1 }}</p>
                          <p class="text-slate-300 text-sm" v-if="order.shipping_address.address_line2">{{ order.shipping_address.address_line2 }}</p>
                          <p class="text-slate-300 text-sm">{{ order.shipping_address.city }}{{ order.shipping_address.state ? '، ' + order.shipping_address.state : '' }}</p>
                        </div>
                        <p v-else class="text-slate-400 text-sm">{{ order.custom_shipping_address_name || 'لم يتم تحديد العنوان' }}</p>
                      </div>
                    </div>

                    <!-- Edit Button - Only if order can be edited -->
                    <div class="flex-shrink-0">
                      <button
                        v-if="canEditOrder(order)"
                        @click="openEditAddressModal(order)"
                        class="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl transition-all duration-200 text-sm font-bold"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تغيير العنوان
                      </button>
                      <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-slate-500 rounded-lg text-xs">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        لا يمكن التعديل
                      </div>
                    </div>
                  </div>

                  <!-- Edit lock explanation -->
                  <div v-if="!canEditOrder(order)" class="mt-3 text-xs text-slate-500 border-t border-slate-700 pt-3">
                    {{ getEditLockReason(order) }}
                  </div>
                </div>

                <!-- Order Items -->
                <div class="space-y-3 mb-6">
                  <h4 class="text-white font-bold mb-4">المنتجات ({{ order.items?.length || 0 }})</h4>
                  <div v-for="item in order.items" :key="item.item_code"
                    class="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition">
                    <div class="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                    <img
                        :src="item.image ? config.FRAPPE_URL + item.image : defaultImageSrc"
                        :alt="item.item_name"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      >
                    </div>
                    <div class="flex-1 min-w-0">
                      <h5 class="text-white font-bold mb-1 truncate">{{ item.item_name }}</h5>
                      <p class="text-slate-400 text-sm">{{ item.item_code }} · الكمية: {{ item.qty }} {{ item.uom }}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="text-emerald-400 font-bold">{{ (item.rate || 0).toFixed(2) }}</p>
                      <p class="text-slate-500 text-sm">{{ (item.amount || 0).toFixed(2) }} </p>
                    </div>
                  </div>
                </div>

                <!-- Price Summary -->
                <div class="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 mb-6">
                  <div class="flex justify-between text-slate-400 mb-2">
                    <span>الإجمالي الفرعي</span>
                    <span class="text-white">{{ (order.net_total || 0).toFixed(2) }} ج.م</span>
                  </div>
                  <div class="flex justify-between text-slate-400 mb-2">
                    <span>الضريبة</span>
                    <span class="text-white">{{ (order.total_taxes_and_charges || 0).toFixed(2) }} ج.م</span>
                  </div>
                  <div class="flex justify-between font-bold border-t border-slate-700 pt-2 mt-2">
                    <span class="text-white">الإجمالي الكلي</span>
                    <span class="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                      {{ (order.grand_total || 0).toFixed(2) }} ج.م
                    </span>
                  </div>
                </div>

                <!-- ✅ Order Actions -->
                <div class="flex flex-wrap gap-3">
                  <!-- Reorder - only for delivered -->
                  <button
                    v-if="isDelivered(order)"
                    @click="reorderItems(order)"
                    class="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold transform hover:scale-105"
                  >
                    🔄 إعادة الطلب
                  </button>

                  <!-- Cancel - only if can cancel -->
                  <button
                    v-if="canCancelOrder(order)"
                    @click="initiateCancelOrder(order)"
                    class="flex-1 md:flex-none px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-500/30 transition font-bold"
                  >
                    ✕ إلغاء الطلب
                  </button>

                  <!-- Locked notice for confirmed+ -->
                  <div v-if="isOrderConfirmedOrBeyond(order) && !isDelivered(order) && !isCancelled(order)"
                    class="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 bg-slate-700/30 text-slate-500 rounded-xl text-sm">
                    🔒 الطلب مؤكد · للإلغاء تواصل مع الدعم
                  </div>

                  <!-- Track -->
                  <button @click="trackOrder(order.name)" class="flex-1 md:flex-none px-6 py-3 bg-slate-700/50 text-white border border-slate-600 rounded-xl hover:bg-slate-700 transition font-bold">
                    📍 تتبع الطلب
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/pages/website/components/navbar.vue'
import config from '@/config/frappe'
import { getCustomerProfileApi,getCustomerOrders, cancelOrderApi, getCustomerAddressesApi, createAddressApi, updateOrderAddressApi } from '@/services/api'

const router = useRouter()

// ========== STATE ==========
const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = ref(`${config.VUE_URL}${defaultImage}`)
const isLoading = ref(true)
const selectedStatus = ref('all')
const expandedOrders = ref([])
const orders = ref([])
const websiteCustomer = ref('')
const websiteCustomerInfo = ref(null)

// Edit address modal state
const showEditAddressModal = ref(false)
const isAddingNewAddress = ref(false)
const isLoadingAddresses = ref(false)
const isSavingAddress = ref(false)
const isUpdatingAddress = ref(false)
const editingOrder = ref(null)
const editingSelectedAddress = ref(null)
const customerAddresses = ref([])

// Cancel modal state
const showCancelModal = ref(false)
const cancelTargetOrder = ref(null)
const isCancelling = ref(false)

const newAddress = ref({ title: '', line1: '', line2: '', city: '', state: '' })

const message = ref({ show: false, text: '', type: 'success' })

const orderStatuses = [
  { value: 'all', label: 'الكل' },
  { value: 'In Review', label: 'قيد المراجعة' },
  { value: 'Confirmed', label: 'مؤكد' },
  { value: 'Preparing', label: 'قيد التحضير' },
  { value: 'Shipped', label: 'في الطريق' },
  { value: 'Delivered', label: 'تم التوصيل' },
  { value: 'Cancelled', label: 'ملغي' }
]

// ========== COMPUTED ==========
const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') return orders.value
  return orders.value.filter(o => (o.workflow_state || o.status) === selectedStatus.value)
})

// ========== STATUS HELPERS ==========
// Can edit: only In Review (before confirmation)
const canEditOrder = (order) => {
  const state = order.workflow_state || order.status
  return state === 'In Review' || state === 'pending'
}

// Can cancel: only In Review
const canCancelOrder = (order) => {
  const state = order.workflow_state || order.status
  return state === 'In Review' || state === 'pending'
}

const isOrderConfirmedOrBeyond = (order) => {
  const state = order.workflow_state || order.status
  return ['Confirmed', 'Preparing', 'Shipped'].includes(state)
}

const isDelivered = (order) => {
  const state = order.workflow_state || order.status
  return state === 'Delivered' || state === 'delivered'
}

const isCancelled = (order) => {
  const state = order.workflow_state || order.status
  return state === 'Cancelled' || state === 'cancelled'
}

const getEditLockReason = (order) => {
  const state = order.workflow_state || order.status
  if (state === 'Confirmed') return '🔒 تم تأكيد الطلب. لا يمكن تعديل العنوان.'
  if (state === 'Preparing') return '🔒 الطلب قيد التحضير. لا يمكن تعديل العنوان.'
  if (state === 'Shipped') return '🔒 الطلب في الطريق إليك. لا يمكن تعديل العنوان.'
  if (isDelivered(order)) return '✅ تم توصيل الطلب.'
  if (isCancelled(order)) return '✕ تم إلغاء الطلب.'
  return ''
}

const getStatusCount = (statusValue) => {
  if (statusValue === 'all') return null
  return orders.value.filter(o => (o.workflow_state || o.status) === statusValue).length || null
}

const getStatusClass = (status) => {
  const classes = {
    'In Review': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    Confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
    confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
    Preparing: 'bg-purple-500/20 text-purple-400 border border-purple-500/50',
    preparing: 'bg-purple-500/20 text-purple-400 border border-purple-500/50',
    Shipped: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50',
    shipped: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50',
    Delivered: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    delivered: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
    Cancelled: 'bg-red-500/20 text-red-400 border border-red-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/50',
  }
  return classes[status] || 'bg-slate-500/20 text-slate-400 border border-slate-500/50'
}

const getStatusLabel = (status) => {
  const labels = {
    'In Review': 'قيد المراجعة',
    pending: 'قيد الانتظار',
    Confirmed: 'مؤكد',
    confirmed: 'مؤكد',
    Preparing: 'قيد التحضير',
    preparing: 'قيد التحضير',
    Shipped: 'في الطريق',
    shipped: 'في الطريق',
    Delivered: 'تم التوصيل',
    delivered: 'تم التوصيل',
    Cancelled: 'ملغي',
    cancelled: 'ملغي',
  }
  return labels[status] || status
}

// ========== METHODS ==========
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const toggleOrderDetails = (orderId) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) expandedOrders.value.splice(index, 1)
  else expandedOrders.value.push(orderId)
}

// ========== ADDRESS EDIT ==========
const openEditAddressModal = async (order) => {
  editingOrder.value = order
  editingSelectedAddress.value = null
  isAddingNewAddress.value = false
  showEditAddressModal.value = true
  await loadCustomerAddresses()
}

const closeEditModal = () => {
  showEditAddressModal.value = false
  editingOrder.value = null
  editingSelectedAddress.value = null
  isAddingNewAddress.value = false
  newAddress.value = { title: '', line1: '', line2: '', city: '', state: '' }
}

const loadCustomerAddresses = async () => {
  isLoadingAddresses.value = true

  try {

    const addresses = await getCustomerAddressesApi(
      websiteCustomer.value
    )

    customerAddresses.value = addresses
  } catch (error) {
    customerAddresses.value = []
  } finally {
    isLoadingAddresses.value = false
  }
}
// ========== Update Address In ORDER ==========
const confirmEditAddress = async () => {
  if (!editingSelectedAddress.value || !editingOrder.value) return

  isUpdatingAddress.value = true

  try {
    const result = await updateOrderAddressApi(
      editingOrder.value.name,
      editingSelectedAddress.value.name
    )

    if (result?.status === 'success') {

      const orderInList = orders.value.find(
        o => o.name === editingOrder.value.name
      )

      if (orderInList) {
        orderInList.custom_shipping_address_name =
          editingSelectedAddress.value.address_title

        orderInList.shipping_address = {
          address_line1: editingSelectedAddress.value.address_line1,
          address_line2: editingSelectedAddress.value.address_line2,
          city: editingSelectedAddress.value.city,
          state: editingSelectedAddress.value.state
        }
      }

      showMessage('تم تحديث عنوان الشحن بنجاح', 'success')
      closeEditModal()

    } else {
      showMessage('حدث خطأ أثناء تحديث العنوان', 'error')
    }

  } catch (error) {
    console.error('Error updating address:', error)
    showMessage('حدث خطأ أثناء تحديث العنوان', 'error')
  } finally {
    isUpdatingAddress.value = false
  }
}

// ========== Save New Address ORDER ==========
const saveNewAddressForOrder = async () => {
  if (!newAddress.value.title || !newAddress.value.line1 || !newAddress.value.city) {
    showMessage('يرجى تعبئة الحقول المطلوبة', 'error')
    return
  }

  isSavingAddress.value = true

  try {

    const saved = await createAddressApi({
      ...newAddress.value,
      customer: websiteCustomer.value
    })

    if (saved) {
      customerAddresses.value.push(saved)
      editingSelectedAddress.value = saved
      isAddingNewAddress.value = false

      newAddress.value = {
        title: '',
        line1: '',
        line2: '',
        city: '',
        state: ''
      }

      showMessage('تم حفظ العنوان', 'success')
    }

  } catch (error) {
    console.error(error)
    showMessage('خطأ في حفظ العنوان', 'error')
  } finally {
    isSavingAddress.value = false
  }
}

// ========== CANCEL ORDER ==========
const initiateCancelOrder = (order) => {
  cancelTargetOrder.value = order
  showCancelModal.value = true
}

const confirmCancelOrder = async () => {
  if (!cancelTargetOrder.value) return
      isCancelling.value = true
  try {

    const result = await cancelOrderApi(cancelTargetOrder.value.name)
    console.log("cancel Order response ", result)
        if (result?.status === 'success') {
          const order = orders.value.find(
            o => o.name === cancelTargetOrder.value.name
          )

          if (order) order.workflow_state = 'Cancelled'

          showMessage('تم إلغاء الطلب بنجاح', 'success')
          showCancelModal.value = false
          cancelTargetOrder.value = null
        } else {
          showMessage('حدث خطأ أثناء إلغاء الطلب', 'error')
        }

  } catch (error) {
    console.error('Error cancelling order:', error)
    showMessage('حدث خطأ أثناء إلغاء الطلب', 'error')
  } finally {
    isCancelling.value = false
  }
}

// ========== OTHER ACTIONS ==========
const reorderItems = (order) => {
  showMessage('جاري إضافة المنتجات للسلة...', 'success')
  // TODO: Add all order items to cart store
  setTimeout(() => router.push({ name: 'Cart' }), 1000)
}

const trackOrder = (orderId) => {
  showMessage('جاري فتح صفحة التتبع...', 'success')
  router.push({ name: 'TrackOrder', params: { id: orderId } })
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}
// ========== LOAD Customer info ==========
const loadCustomerInfo = async()=>{
    try {
          const profile = await getCustomerProfileApi()
          console.log("Prooooofile",profile)
          if (profile?.party_type === "Customer" && profile?.party_name) {
            websiteCustomer.value = profile.party_name
             websiteCustomerInfo.value = profile
          }

    } catch (e) {
      console.log("User not logged in → Guest mode")
    }
}

// ========== LOAD ORDERS ==========
const loadOrders = async () => {
  isLoading.value = true
  try {
    const customer = websiteCustomer.value
    const response = await getCustomerOrders(customer)
    if (response) {
      console.log('response ORders',response)
      orders.value = response || []
    }
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async() => {
  await loadCustomerInfo()
  await loadOrders()
})
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(-30px); opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 2000px; }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to { opacity: 0; transform: translateX(-100px); }
</style>
