<!-- Cart.vue -->
<template>
  <div :class="isDark ? 'theme-dark' : 'theme-light'"
    class="page-wrapper transition-colors duration-500" dir="rtl">
    <!-- Navigation -->
    <div class="fixed top-0 left-0 w-full z-50">
      <div class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg rounded-b-xl">
        <router-Link :to="{ name: 'Supermarket' }" class="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          العودة للتسوق
        </router-Link>
      </div>
    </div>

    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-40 sm:w-80 h-40 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <!-- Toast Message -->
    <Transition name="slide-fade">
      <div v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-4 sm:right-6 left-4 sm:left-auto px-4 sm:px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Shipping Address Modal -->
    <Transition name="modal">
      <div v-if="showAddressModal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showAddressModal = false"></div>
        <div class="relative modal-card rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg sm:text-xl font-bold heading-text mb-5 sm:mb-6 flex items-center gap-2">
            <span class="text-emerald-400">📍</span>
            {{ isAddingNewAddress ? 'إضافة عنوان جديد' : 'اختر عنوان الشحن' }}
          </h3>

          <!-- Existing Addresses -->
          <div v-if="!isAddingNewAddress">
            <div v-if="isLoadingAddresses" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
            <div v-else-if="customerAddresses.length === 0" class="text-center py-8">
              <p class="subtext mb-4">لا توجد عناوين محفوظة</p>
            </div>
            <div v-else class="space-y-3 mb-4 max-h-56 sm:max-h-64 overflow-y-auto">
              <div
                v-for="addr in customerAddresses"
                :key="addr.name"
                @click="selectAddress(addr)"
                class="addr-item p-4 rounded-xl cursor-pointer transition-all duration-200 group"
                :class="selectedAddress?.name === addr.name ? 'addr-item-active' : 'addr-item-inactive'"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0 ml-2">
                    <p class="font-bold heading-text group-hover:text-emerald-400 transition truncate">{{ addr.address_title }}</p>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span v-if="addr.is_primary_address" class="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">أساسي</span>
                      <span v-if="addr.is_shipping_address" class="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">شحن</span>
                    </div>
                    <p class="subtext text-sm mt-1">{{ addr.address_line1 }}</p>
                    <p class="subtext text-sm" v-if="addr.address_line2">{{ addr.address_line2 }}</p>
                    <p class="subtext text-sm">{{ addr.city }}{{ addr.state ? '، ' + addr.state : '' }}{{ addr.country ? '، ' + addr.country : '' }}</p>
                  </div>
                  <div v-if="selectedAddress?.name === addr.name" class="text-emerald-400 text-xl flex-shrink-0">✓</div>
                </div>
              </div>
            </div>
            <button @click="isAddingNewAddress = true" class="add-addr-btn w-full py-3 rounded-xl transition-all duration-200 font-medium">
              + إضافة عنوان جديد
            </button>
          </div>

          <!-- Add New Address Form -->
          <div v-else class="space-y-3">
            <div>
              <label class="label-text">اسم العنوان *</label>
              <input v-model="newAddress.title" type="text" placeholder="مثال: المنزل، العمل..." class="cart-input" />
            </div>
            <div>
              <label class="label-text">العنوان الأول *</label>
              <input v-model="newAddress.line1" type="text" placeholder="الشارع، رقم العمارة..." class="cart-input" />
            </div>
            <div>
              <label class="label-text">العنوان الثاني</label>
              <input v-model="newAddress.line2" type="text" placeholder="الدور، الشقة..." class="cart-input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-text">المدينة *</label>
                <input v-model="newAddress.city" type="text" placeholder="القاهرة..." class="cart-input" />
              </div>
              <div>
                <label class="label-text">المحافظة</label>
                <input v-model="newAddress.state" type="text" placeholder="الجيزة..." class="cart-input" />
              </div>
            </div>
            <div class="pt-3 border-t border-divider">
              <label class="label-text mb-3 block">نوع العنوان</label>
              <div class="flex gap-3">
                <span @click="newAddress.is_primary_address = newAddress.is_primary_address ? 0 : 1"
                  :class="newAddress.is_primary_address ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'badge-inactive'"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none">
                  أساسي
                </span>
                <span @click="newAddress.is_shipping_address = newAddress.is_shipping_address ? 0 : 1"
                  :class="newAddress.is_shipping_address ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'badge-inactive'"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none">
                  شحن
                </span>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <button @click="isAddingNewAddress = false" class="cancel-btn flex-1 py-3 rounded-xl transition font-medium">رجوع</button>
              <button @click="saveNewAddress" :disabled="isSavingAddress"
                class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold disabled:opacity-50">
                <span v-if="isSavingAddress" class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </span>
                <span v-else>حفظ العنوان</span>
              </button>
            </div>
          </div>

          <button v-if="!isAddingNewAddress && selectedAddress" @click="confirmAddress"
            class="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold">
            تأكيد العنوان
          </button>
          <button @click="showAddressModal = false" class="modal-close absolute top-4 left-4 transition text-xl">✕</button>
        </div>
      </div>
    </Transition>

    <!-- Empty Cart State -->
    <div v-if="cartStore.cart.length === 0" class="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
      <div class="text-center space-y-6">
        <div class="text-7xl sm:text-8xl animate-bounce">🛒</div>
        <div>
          <h1 class="text-4xl sm:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">السلة فارغة</h1>
          <p class="subtext text-base sm:text-lg font-light mb-8">لم تضف أي منتجات حتى الآن. ابدأ التسوق الآن!</p>
        </div>
        <router-link :to="{ name: 'Supermarket' }" class="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 font-bold text-base sm:text-lg">
          العودة للتسوق
        </router-link>
      </div>
    </div>

    <!-- Cart Content -->
    <div v-else class="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 pt-18 sm:pt-20">
      <!-- Header -->
      <div class="mt-4 mb-6 sm:mb-8">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">سلتي</h1>
        <p class="subtext font-light">{{ cartStore.cart.length }} منتج</p>
      </div>

      <!-- Shipping Address Card -->
      <div class="cart-card rounded-2xl p-4 sm:p-6 mb-4 transition-all duration-300"
          :class="!selectedAddress ? '!border-yellow-500/70 shadow-yellow-500/10 shadow-lg' : 'hover:!border-emerald-500/50'">
        <div class="flex items-start justify-between gap-3 sm:gap-4">
          <div class="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <span class="text-xl sm:text-2xl mt-1 flex-shrink-0">📍</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium mb-1" :class="!selectedAddress ? 'text-yellow-400' : 'subtext'">
                {{ !selectedAddress ? '⚠️ يجب تحديد عنوان الشحن' : 'عنوان الشحن' }}
              </p>
              <div v-if="selectedAddress">
                <div class="flex flex-wrap gap-1 mb-1">
                  <span v-if="selectedAddress.is_primary_address" class="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full">أساسي</span>
                  <span v-if="selectedAddress.is_shipping_address" class="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">شحن</span>
                </div>
                <p class="text-base sm:text-lg font-bold heading-text truncate">{{ selectedAddress.address_title }}</p>
                <p class="subtext text-sm mt-1">{{ selectedAddress.address_line1 }}</p>
                <p class="subtext text-sm" v-if="selectedAddress.address_line2">{{ selectedAddress.address_line2 }}</p>
                <p class="subtext text-sm">{{ selectedAddress.city }}{{ selectedAddress.state ? '، ' + selectedAddress.state : '' }}</p>
              </div>
              <p v-else class="subtext text-sm">اختر عنوان التوصيل لإتمام الطلب</p>
            </div>
          </div>
          <button @click="openAddressModal"
            class="flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap"
            :class="selectedAddress
              ? 'change-addr-btn'
              : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 animate-pulse'">
            {{ selectedAddress ? 'تغيير' : 'اختر عنواناً' }}
          </button>
        </div>
      </div>

      <!-- Delivery Date Card -->
      <div class="cart-card rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 hover:border-emerald-500/50 transition-all duration-300">
        <div class="flex items-center gap-2 sm:gap-3 mb-4">
          <span class="text-xl sm:text-2xl">📅</span>
          <div>
            <p class="subtext text-sm">تاريخ التسليم المطلوب</p>
            <p class="text-base sm:text-lg font-bold heading-text">اختر الموعد المناسب</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label class="label-text">التاريخ</label>
            <input v-model="deliveryDate" type="date" :min="minDeliveryDate"
              class="cart-select focus:border-emerald-500 focus:outline-none transition cursor-pointer" />
          </div>
          <div>
            <label class="label-text">الفترة الزمنية</label>
            <select v-model="deliverySlot" class="cart-select focus:border-emerald-500 focus:outline-none transition cursor-pointer">
              <option value="">اختر الفترة</option>
              <option value="morning">صباحاً (9 ص - 12 ظ)</option>
              <option value="afternoon">ظهراً (12 ظ - 4 م)</option>
              <option value="evening">مساءً (4 م - 8 م)</option>
            </select>
          </div>
        </div>
        <div v-if="deliveryDate && deliverySlot" class="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p class="text-emerald-400 text-sm font-medium">
            ✓ سيتم التسليم {{ formatDeliveryDate(deliveryDate) }} {{ getSlotLabel(deliverySlot) }}
          </p>
        </div>
      </div>

      <!-- Action Prompts -->
      <Transition name="fade">
        <div v-if="remainingAmount > 0" class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur border border-yellow-500/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold heading-text mb-1">هل أنت مستعد للدفع؟</h3>
            <p class="subtext text-sm sm:text-base">أضف منتجات بقيمة <span class="font-bold text-emerald-400">{{ remainingAmount.toFixed(2) }}</span> لإتمام الطلب</p>
          </div>
          <router-link :to="{ name: 'Supermarket' }" class="flex-shrink-0 px-5 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition whitespace-nowrap font-medium text-sm sm:text-base">
            أضف منتجات
          </router-link>
        </div>
        <div v-else class="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur border border-emerald-500/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold heading-text mb-1">هل تريد شيء آخر؟</h3>
            <p class="subtext text-sm">يمكنك إضافة منتجات أخرى قبل الدفع</p>
          </div>
          <router-link :to="{ name: 'Supermarket' }" class="flex-shrink-0 px-5 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition whitespace-nowrap font-medium text-sm sm:text-base">
            أضف منتجات
          </router-link>
        </div>
      </Transition>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <!-- Cart Items Section -->
        <div class="lg:col-span-2 space-y-4">
          <div class="cart-card rounded-2xl p-4 sm:p-6">
            <h2 class="text-xl sm:text-2xl font-bold heading-text mb-5 sm:mb-6">منتجاتي</h2>
            <div class="space-y-3 sm:space-y-4">
              <Transition-group name="list">
                <div v-for="(item, index) in cartStore.cart" :key="item.item_code + index"
                  class="cart-item rounded-xl p-3 sm:p-5 transition-all duration-300 group">
                  <div class="flex gap-3 sm:gap-4 items-start">
                    <div class="w-20 sm:w-28 h-20 sm:h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                      <img :src="item.image ? config.FRAPPE_URL + item.image : defaultImageSrc" :alt="item.item_name"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-bold heading-text mb-1 sm:mb-2 group-hover:text-emerald-400 transition line-clamp-2 text-sm sm:text-base">{{ item.item_name }}</h3>
                      <p class="subtext text-xs sm:text-sm mb-2 sm:mb-3">{{ item.category || 'بدون تصنيف' }}</p>
                      <p class="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">{{ item.rate }} {{item.currency}}</p>
                    </div>
                    <div class="flex flex-col items-end gap-2 sm:gap-4">
                      <div class="flex items-center gap-0.5 sm:gap-1 qty-control rounded-lg p-1">
                        <button @click="decreaseQuantity(index)" class="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center qty-btn rounded transition">
                          <svg class="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                        </button>
                        <span class="w-7 sm:w-8 text-center font-bold heading-text text-sm sm:text-base">{{ Math.abs(item.qty) }}</span>
                        <button @click="increaseQuantity(index)" class="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center qty-btn rounded transition">
                          <svg class="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <div class="text-right">
                        <p class="text-xs sm:text-sm subtext mb-1 sm:mb-2">الإجمالي: <span class="font-bold text-emerald-400">{{ (item.rate * Math.abs(item.qty)).toFixed(2) }}</span></p>
                        <button @click="removeItem(index)" class="text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium hover:bg-red-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition">✕ حذف</button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition-group>
            </div>
            <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-divider">
              <div class="flex justify-between items-center">
                <span class="subtext font-medium">الإجمالي الفرعي</span>
                <span class="text-xl sm:text-2xl font-black heading-text">{{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Mobile Checkout Button -->
            <button @click="handleCheckout" :disabled="!canCheckout"
              class="w-full mt-5 sm:mt-6 lg:hidden py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-base sm:text-lg disabled:opacity-40 disabled:cursor-not-allowed">
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري المعالجة...
              </span>
              <span v-else>{{ checkoutButtonLabel }}</span>
            </button>
          </div>

          <!-- Top Sellers -->
          <div v-if="productsStore.products.length > 0" class="cart-card rounded-2xl p-4 sm:p-6">
            <h3 class="text-xl sm:text-2xl font-bold heading-text mb-5 sm:mb-6">المنتجات الشهيرة</h3>
            <div class="relative">
              <button @click="scroll('topsellers', -1)" class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-emerald-500/50 transition">
                <svg class="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div ref="topsellersScroll" class="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide mx-7 sm:mx-8">
                <div v-for="product in productsStore.products.slice(0, 10)" :key="product.item_code"
                  class="flex-shrink-0 w-44 sm:w-56 cart-item rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col">
                  <div class="h-32 sm:h-40 overflow-hidden">
                    <img :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc" :alt="product.item_name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                  </div>
                  <div class="p-3 sm:p-4 flex-1 flex flex-col">
                    <h4 class="font-bold heading-text mb-2 line-clamp-2 group-hover:text-emerald-400 transition text-sm">{{ product.item_name }}</h4>
                    <p class="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-3 sm:mb-4 mt-auto">{{ product.rate }}</p>
                    <button @click="addProductToCart(product)" class="w-full py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition text-xs sm:text-sm font-bold">أضف للسلة</button>
                  </div>
                </div>
              </div>
              <button @click="scroll('topsellers', 1)" class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-emerald-500/50 transition">
                <svg class="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <!-- Mobile Substitutions -->
          <div class="cart-card rounded-2xl p-4 sm:p-6 lg:hidden">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input v-model="allowSubstitutions" type="checkbox" class="w-5 h-5 accent-emerald-500 cursor-pointer rounded">
              <span class="font-medium heading-text group-hover:text-emerald-400 transition text-sm sm:text-base">السماح باستبدال المنتجات</span>
              <span title="نسمح بـ استبدال المنتجات بمنتجات مشابهة في حالة عدم التوفر" class="subtext cursor-help hover:text-emerald-400 transition">ⓘ</span>
            </label>
          </div>
        </div>

        <!-- Order Summary (Desktop) -->
        <div class="hidden lg:block">
          <div class="cart-card rounded-2xl p-6 sticky top-24 space-y-6">
            <h2 class="text-2xl font-bold heading-text">ملخص الطلب</h2>

            <div class="pb-4 border-b border-divider">
              <p class="subtext text-sm mb-2">📍 عنوان الشحن</p>
              <div v-if="selectedAddress" class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p class="font-bold heading-text text-sm">{{ selectedAddress.address_title }}</p>
                <p class="subtext text-xs mt-1">{{ selectedAddress.address_line1 }}</p>
                <p class="subtext text-xs" v-if="selectedAddress.city">{{ selectedAddress.city }}</p>
              </div>
              <button v-else @click="openAddressModal" class="w-full p-3 border-2 border-dashed border-yellow-500/50 hover:border-yellow-400 text-yellow-400 rounded-xl transition text-sm font-medium animate-pulse">
                ⚠️ اختر عنوان الشحن
              </button>
            </div>

            <div class="pb-4 border-b border-divider">
              <p class="subtext text-sm mb-2">📅 موعد التسليم</p>
              <div v-if="deliveryDate && deliverySlot" class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p class="font-bold heading-text text-sm">{{ formatDeliveryDate(deliveryDate) }}</p>
                <p class="subtext text-xs mt-1">{{ getSlotLabel(deliverySlot) }}</p>
              </div>
              <p v-else class="subtext text-sm">لم يتم تحديد موعد التسليم بعد</p>
            </div>

            <label class="flex items-center gap-3 cursor-pointer group pb-6 border-b border-divider">
              <input v-model="allowSubstitutions" type="checkbox" class="w-5 h-5 accent-emerald-500 cursor-pointer rounded">
              <span class="font-medium heading-text group-hover:text-emerald-400 transition">السماح باستبدال المنتجات</span>
              <span title="نسمح بـ استبدال المنتجات بمنتجات مشابهة في حالة عدم التوفر" class="subtext cursor-help hover:text-emerald-400 transition">ⓘ</span>
            </label>

            <div class="space-y-3 pb-6 border-b border-divider">
              <div class="flex justify-between subtext">
                <span>الإجمالي الفرعي</span>
                <span class="font-bold heading-text">{{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between subtext">
                <span>رسوم التسليم</span>
                <span class="font-bold heading-text">{{ deliveryFee }}</span>
              </div>
              <div class="flex justify-between subtext">
                <span>الضريبة (14%)</span>
                <span class="font-bold heading-text">{{ cartStore.taxAmount?.toFixed(2) || 0 }}</span>
              </div>
            </div>

            <div class="flex justify-between items-end">
              <span class="heading-text">الإجمالي</span>
              <div class="text-right">
                <p class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                  {{ ((cartStore.totalPrice || cartStore.subtotal) + deliveryFee).toFixed(2) }}
                </p>
                <p class="subtext text-xs mt-1">(شامل الضريبة)</p>
              </div>
            </div>

            <button @click="handleCheckout" :disabled="!canCheckout"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-105 duration-300">
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري المعالجة...
              </span>
              <span v-else>{{ checkoutButtonLabel }}</span>
            </button>

            <div class="space-y-2">
              <div v-if="!selectedAddress" class="text-center text-sm text-yellow-400 px-4 py-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">⚠️ يجب تحديد عنوان الشحن</div>
              <div v-if="!deliveryDate || !deliverySlot" class="text-center text-sm text-yellow-400 px-4 py-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">⚠️ يجب تحديد موعد التسليم</div>
              <div v-if="remainingAmount > 0" class="text-center text-sm text-yellow-400 font-medium px-4 py-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                أضف منتجات بقيمة {{ remainingAmount.toFixed(2) }} لإتمام الطلب
              </div>
              <div v-if="canCheckout" class="text-center text-sm subtext px-4 py-3 bg-slate-500/10 rounded-lg">
                الحد الأدنى للطلب: {{ minOrderValue }}
              </div>
            </div>
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
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import { createAddressApi, getCustomerAddressesApi, getCustomerProfileApi } from '@/services/api'

const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = ref(`${config.VUE_URL}${defaultImage}`)

const cartStore = useCartStore()
const productsStore = useProductsStore()
const router = useRouter()
const settingsStore = useSettingsStore()

// ─── Theme ────────────────────────────────────────────────────────────────────
const settings = computed(() => settingsStore.settings)
const isDark    = computed(() => settings.value?.appearance?.theme !== 'light')

// ========== STATE ==========
const loading = ref(false)
const allowSubstitutions = ref(true)
const isProcessing = ref(false)
const showAddressModal = ref(false)
const isAddingNewAddress = ref(false)
const isLoadingAddresses = ref(false)
const isSavingAddress = ref(false)

const selectedAddress = ref(null)
const customerAddresses = ref([])
const deliveryDate = ref('')
const deliverySlot = ref('')

const newAddress = ref({ title: '', line1: '', line2: '', city: '', state: '', is_primary_address: 0, is_shipping_address: 0 })

const minOrderValue = 1000
const deliveryFee = 50

const message = ref({ show: false, text: '', type: 'success' })

const websiteCustomer = ref('')
const websiteCustomerInfo = ref({})

// ========== COMPUTED ==========
const remainingAmount = computed(() => Math.max(0, minOrderValue - cartStore.subtotal))
const minDeliveryDate = computed(() => {
  const t = new Date(); t.setDate(t.getDate() + 1)
  return t.toISOString().split('T')[0]
})
const canCheckout = computed(() =>
  !isProcessing.value && remainingAmount.value === 0 &&
  selectedAddress.value !== null && deliveryDate.value !== '' && deliverySlot.value !== ''
)
const checkoutButtonLabel = computed(() => {
  if (isProcessing.value) return 'جاري المعالجة...'
  if (remainingAmount.value > 0) return 'أضف منتجات إضافية'
  if (!selectedAddress.value) return 'اختر عنوان الشحن أولاً'
  if (!deliveryDate.value || !deliverySlot.value) return 'حدد موعد التسليم'
  return 'تأكيد الطلب'
})

// ========== METHODS ==========
const formatDeliveryDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
const getSlotLabel = (slot) => ({ morning: 'صباحاً (9 ص - 12 ظ)', afternoon: 'ظهراً (12 ظ - 4 م)', evening: 'مساءً (4 م - 8 م)' })[slot] || ''

const openAddressModal = async () => {
  isAddingNewAddress.value = false
  showAddressModal.value = true
  await loadCustomerAddresses()
}
const loadCustomerAddresses = async () => {
  isLoadingAddresses.value = true
  try {
    customerAddresses.value = await getCustomerAddressesApi(websiteCustomer.value)
  } catch (error) {
    customerAddresses.value = []
  } finally {
    isLoadingAddresses.value = false
  }
}
const selectAddress = (addr) => { selectedAddress.value = addr }
const confirmAddress = () => {
  showAddressModal.value = false
  isAddingNewAddress.value = false
  showMessage('تم تحديد عنوان الشحن بنجاح', 'success')
}
const saveNewAddress = async () => {
  if (!newAddress.value.title || !newAddress.value.line1 || !newAddress.value.city) {
    showMessage('يرجى تعبئة الحقول المطلوبة', 'error'); return
  }
  isSavingAddress.value = true
  try {
    const saved = await createAddressApi({ ...newAddress.value, customer: websiteCustomer.value })
    if (saved) {
      customerAddresses.value.push(saved)
      selectedAddress.value = saved
      isAddingNewAddress.value = false
      showMessage('تم حفظ العنوان بنجاح', 'success')
      newAddress.value = { title: '', line1: '', line2: '', city: '', state: '', is_primary_address: 0, is_shipping_address: 0 }
    }
  } catch (error) {
    showMessage('حدث خطأ أثناء حفظ العنوان', 'error')
  } finally {
    isSavingAddress.value = false
  }
}

const loadCustomerInfo = async () => {
  try {
    const profile = await getCustomerProfileApi()
    if (profile?.party_type === 'Customer' && profile?.party_name) {
      websiteCustomer.value = profile.party_name
      websiteCustomerInfo.value = profile
    }
  } catch (e) {}
}

const increaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (!item) return
  if (item.isReturn) { cartStore.updateQuantity(item.item_code, item.qty - 1, 'return') }
  else { item.qty += 1; cartStore.updateChange() }
}
const decreaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (!item) return
  if (item.isReturn) {
    if (Math.abs(item.qty) > 0) cartStore.updateQuantity(item.item_code, item.qty + 1, 'return')
  } else {
    if (item.qty > 1) { item.qty -= 1; cartStore.updateChange() }
    else removeItem(index)
  }
}
const removeItem = (index) => {
  const item = cartStore.cart[index]
  if (item) { cartStore.removeFromCart(item.item_code); showMessage('تم حذف المنتج من السلة', 'success') }
}
const addProductToCart = (product) => {
  cartStore.addToCart(product); showMessage('تم إضافة المنتج إلى السلة!', 'success')
}

const topsellersScroll = ref(null)
const scroll = (section, direction) => {
  if (topsellersScroll.value) topsellersScroll.value.scrollBy({ left: direction * 250, behavior: 'smooth' })
}

const handleCheckout = async () => {
  if (!canCheckout.value) {
    if (!selectedAddress.value) { showMessage('يرجى تحديد عنوان الشحن أولاً', 'error'); openAddressModal(); return }
    if (!deliveryDate.value || !deliverySlot.value) { showMessage('يرجى تحديد موعد التسليم', 'error'); return }
    if (remainingAmount.value > 0) { showMessage(`يرجى إضافة منتجات بقيمة ${remainingAmount.value.toFixed(2)} جنيه`, 'error'); return }
    return
  }
  isProcessing.value = true
  try {
    const payloadData = {
      shipping_address: selectedAddress.value.name,
      delivery_date: deliveryDate.value,
      delivery_slot: deliverySlot.value,
      allow_substitutions: allowSubstitutions.value
    }
    const transactionData = await cartStore.processTransaction(payloadData)
    if (websiteCustomer.value) {
      const orderResponse = await cartStore.processTransactionCreateOrder(websiteCustomer.value, transactionData)
      if (orderResponse.status === 'success') {
        showMessage(orderResponse.message, 'success')
        setTimeout(() => router.push({ name: 'CustomerOrders' }), 1500)
      } else {
        isProcessing.value = false
        showMessage(orderResponse.message, 'error')
      }
    }
  } catch (error) {
    showMessage('حدث خطأ أثناء معالجة الطلب', 'error')
    isProcessing.value = false
  }
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}

const loadProducts = async () => {
  loading.value = true
  try {
    const websitePriceList = 'Standard Selling'
    let customer = 'Guest'
    try {
      const profile = await getCustomerProfileApi()
      if (profile?.party_type === 'Customer' && profile?.party_name) customer = profile.party_name
    } catch (e) {}
    await productsStore.loadWebsiteProducts(websitePriceList, customer)
  } catch (error) {
    showMessage('خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCustomerInfo()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  deliveryDate.value = tomorrow.toISOString().split('T')[0]
  if (productsStore.products.length === 0) {
    try { await loadProducts() } catch (error) {}
  }
})
</script>

<style scoped>
/* ════════════════════════════════════════════
   THEME TOKENS
   ════════════════════════════════════════════ */
.theme-dark {
  --bg:             #0f172a;
  --card-bg:        rgba(30, 41, 59, 0.60);
  --card-border:    rgba(71, 85, 105, 0.50);
  --modal-bg:       #1e293b;
  --input-bg:       #334155;
  --input-border:   #475569;
  --input-color:    #f1f5f9;
  --heading:        #f1f5f9;
  --subtext:        #94a3b8;
  --divider:        rgba(71, 85, 105, 0.50);
  --cancel-bg:      #334155;
  --cancel-hover:   #475569;
  --cancel-border:  #475569;
  --cancel-color:   #f1f5f9;
  --qty-bg:         rgba(51, 65, 85, 0.80);
  --qty-btn-hover:  rgba(30, 41, 59, 0.80);
  --change-btn-bg:  rgba(51, 65, 85, 0.80);
  --change-btn-color:#f1f5f9;
  --badge-inactive-bg: rgba(51, 65, 85, 0.80);
  --badge-inactive-color: #94a3b8;
}

.theme-light {
  --bg:             #f0fdf4;
  --card-bg:        rgba(255, 255, 255, 0.85);
  --card-border:    rgba(209, 250, 229, 0.80);
  --modal-bg:       #ffffff;
  --input-bg:       #f8fafc;
  --input-border:   #d1fae5;
  --input-color:    #0f172a;
  --heading:        #0f172a;
  --subtext:        #475569;
  --divider:        rgba(209, 250, 229, 0.80);
  --cancel-bg:      #f1f5f9;
  --cancel-hover:   #e2e8f0;
  --cancel-border:  #e2e8f0;
  --cancel-color:   #334155;
  --qty-bg:         rgba(241, 245, 249, 0.90);
  --qty-btn-hover:  rgba(226, 232, 240, 0.80);
  --change-btn-bg:  rgba(241, 245, 249, 0.80);
  --change-btn-color:#0f172a;
  --badge-inactive-bg: rgba(241, 245, 249, 0.80);
  --badge-inactive-color: #334155;
}

/* ════════════════════════════════════════════
   LAYOUT
   ════════════════════════════════════════════ */
.page-wrapper {
  background: var(--bg);
  min-height: 100vh;
}

.heading-text { color: var(--heading); }
.subtext      { color: var(--subtext); }
.border-divider { border-color: var(--divider); }

/* Cards */
.cart-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);
  transition: background 0.4s, border-color 0.4s;
}

.cart-item {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  transition: all 0.3s;
}
.cart-item:hover {
  border-color: rgba(16, 185, 129, 0.50);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.10);
}

/* Inputs */
.cart-input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-color);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.cart-input:focus { border-color: #10b981; }
.cart-input::placeholder { color: var(--subtext); opacity: 0.7; }

.cart-select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-color);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.cart-select:focus { border-color: #10b981; }
.cart-select option { background: var(--modal-bg); color: var(--input-color); }

/* Quantity controls */
.qty-control {
  background: var(--qty-bg);
  border: 1px solid var(--card-border);
}
.qty-btn {
  color: var(--subtext);
  transition: all 0.2s;
}
.qty-btn:hover { background: var(--qty-btn-hover); color: #10b981; }

/* Modal */
.modal-card {
  background: var(--modal-bg);
  border: 1px solid var(--card-border);
}
.modal-close { color: var(--subtext); }
.modal-close:hover { color: var(--heading); }

/* Address items */
.addr-item { border: 1px solid var(--card-border); }
.addr-item-active { border-color: #10b981; background: rgba(16, 185, 129, 0.10); }
.addr-item-inactive:hover { border-color: var(--input-border); background: var(--cancel-hover); }

/* Add address button */
.add-addr-btn {
  border: 2px dashed var(--card-border);
  color: var(--subtext);
  background: transparent;
}
.add-addr-btn:hover { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.05); }

/* Cancel button */
.cancel-btn {
  background: var(--cancel-bg);
  border: 1px solid var(--cancel-border);
  color: var(--cancel-color);
}
.cancel-btn:hover { background: var(--cancel-hover); }

/* Change address button */
.change-addr-btn {
  background: var(--change-btn-bg);
  color: var(--change-btn-color);
  border: 1px solid var(--card-border);
}
.change-addr-btn:hover { background: var(--cancel-hover); }

/* Badge inactive */
.badge-inactive {
  background: var(--badge-inactive-bg);
  color: var(--badge-inactive-color);
}
.badge-inactive:hover { background: var(--cancel-hover); }

/* Labels */
.label-text {
  color: var(--subtext);
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.25rem;
}

/* ════════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════════ */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(-30px); opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to { opacity: 0; transform: translateX(-100px); }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
