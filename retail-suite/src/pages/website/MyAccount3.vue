<template>
  <div :class="isDark ? 'theme-dark' : 'theme-light'" class="page-wrapper min-h-screen overflow-hidden transition-colors duration-500">
    <!-- Navbar Component -->
    <Navbar
      :selected-category="'جميع التصنيفات'"
      :delivery-address="deliveryAddress"
      :categories="[]"
      @show-map-modal="openMapModal"
    />
    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="blob blob-1 absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"></div>
      <div class="blob blob-2 absolute bottom-40 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>

    <!-- Toast Message -->
    <Transition name="slide-fade">
      <div
        v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3"
      >
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="relative z-20 max-w-5xl mx-auto px-4 py-12">

      <!-- Breadcrumb -->
      <div class="mb-8 text-sm flex items-center gap-2 breadcrumb-text">
        <a href="#" class="text-emerald-500 hover:text-teal-400 transition">الرئيسية</a>
        <span class="opacity-40">/</span>
        <span>حسابي</span>
      </div>

      <!-- Page Header -->
      <div class="mb-10 flex items-center gap-5 flex-wrap">
        <!-- Avatar -->
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-emerald-500/30 select-none">
          {{ userInitials }}
        </div>

        <div>
          <h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            {{ form.fullName || 'مرحباً بك' }}
          </h1>
          <p class="subtext text-sm mt-1">{{ form.email }}</p>
        </div>

        <!-- Right side actions -->
        <div class="mr-auto flex items-center gap-3 flex-wrap">

          <!-- Edit button -->
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/30 hover:border-emerald-400 transition font-medium text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            تعديل الحساب
          </button>

          <!-- ===== DARK / LIGHT TOGGLE ===== -->
          <button
            @click="toggleTheme"
            :title="isDark ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'"
            class="theme-toggle relative w-[66px] h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <!-- Track background -->
            <span class="track absolute inset-0 rounded-full transition-all duration-500"></span>

            <!-- Emoji labels -->
            <span class="absolute inset-0 flex items-center justify-between px-2 pointer-events-none text-[13px] select-none">
              <span :class="isDark ? 'opacity-100' : 'opacity-25'" class="transition-opacity duration-300">🌙</span>
              <span :class="isDark ? 'opacity-25' : 'opacity-100'" class="transition-opacity duration-300">☀️</span>
            </span>

            <!-- Thumb pill -->
            <span class="thumb absolute top-[3px] w-[26px] h-[26px] rounded-full flex items-center justify-center text-sm shadow-md transition-all duration-500"
              :class="isDark ? 'translate-x-[3px]' : 'translate-x-[37px]'"
            >
              <span v-if="isDark">🌙</span>
              <span v-else>☀️</span>
            </span>
          </button>

        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-8 tab-bar rounded-xl p-1.5 w-fit overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
            : 'tab-inactive hover:text-emerald-500'"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== TAB: Profile ===== -->
      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'profile'" key="profile">
          <div class="card-panel rounded-2xl p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div class="field-group">
                <label class="field-label">الاسم الكامل</label>
                <input v-model="form.fullName" :disabled="!isEditing" type="text" class="field-input" placeholder="أدخل اسمك الكامل" />
              </div>

              <div class="field-group">
                <label class="field-label">رقم الهاتف</label>
                <input v-model="form.phone" :disabled="!isEditing" type="tel" class="field-input" placeholder="01xxxxxxxxx" dir="ltr" />
              </div>

              <div class="field-group">
                <label class="field-label">البريد الإلكتروني</label>
                <input v-model="form.email" :disabled="!isEditing" type="email" class="field-input" placeholder="example@email.com" dir="ltr" />
              </div>

              <div class="field-group">
                <label class="field-label">المدينة</label>
                <input v-model="form.city" :disabled="!isEditing" type="text" class="field-input" placeholder="القاهرة" />
              </div>

              <div class="field-group md:col-span-2">
                <label class="field-label">العنوان التفصيلي</label>
                <textarea v-model="form.address" :disabled="!isEditing" rows="3" class="field-input resize-none" placeholder="الشارع، المبنى، الطابق..."></textarea>
              </div>
            </div>

            <Transition name="slide-down">
              <div v-if="isEditing" class="flex gap-3 mt-8 pt-6 divider-top">
                <button @click="saveChanges" :disabled="saving" class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/40 transition disabled:opacity-60">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات' }}
                </button>
                <button @click="cancelEditing" class="btn-cancel px-6 py-3 rounded-xl transition font-medium">إلغاء</button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- ===== TAB: Security ===== -->
        <div v-else-if="activeTab === 'security'" key="security">
          <div class="card-panel rounded-2xl p-8 space-y-6">
            <h3 class="heading-text font-bold text-lg flex items-center gap-2">
              <span>🔐</span> تغيير كلمة المرور
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
              <div class="field-group md:col-span-2">
                <label class="field-label">كلمة المرور الحالية</label>
                <div class="relative">
                  <input v-model="passwordForm.current" :type="showPasswords.current ? 'text' : 'password'" class="field-input pr-4 pl-10" placeholder="••••••••" dir="ltr" />
                  <button @click="showPasswords.current = !showPasswords.current" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">كلمة المرور الجديدة</label>
                <div class="relative">
                  <input v-model="passwordForm.new" :type="showPasswords.new ? 'text' : 'password'" class="field-input pr-4 pl-10" placeholder="••••••••" dir="ltr" />
                  <button @click="showPasswords.new = !showPasswords.new" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                <div v-if="passwordForm.new" class="mt-2 space-y-1">
                  <div class="flex gap-1">
                    <div v-for="i in 4" :key="i" :class="passwordStrength >= i ? strengthColor : 'strength-empty'" class="h-1 flex-1 rounded-full transition-all duration-300"></div>
                  </div>
                  <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">تأكيد كلمة المرور</label>
                <div class="relative">
                  <input v-model="passwordForm.confirm" :type="showPasswords.confirm ? 'text' : 'password'" class="field-input pr-4 pl-10" :class="passwordForm.confirm && passwordForm.confirm !== passwordForm.new ? 'border-red-500/70' : ''" placeholder="••••••••" dir="ltr" />
                  <button @click="showPasswords.confirm = !showPasswords.confirm" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
                <p v-if="passwordForm.confirm && passwordForm.confirm !== passwordForm.new" class="text-red-500 text-xs mt-1">كلمتا المرور غير متطابقتين</p>
              </div>
            </div>

            <button @click="changePassword" :disabled="!canChangePassword || savingPassword" class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="savingPassword" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              {{ savingPassword ? 'جارٍ التغيير...' : 'تغيير كلمة المرور' }}
            </button>

            <div class="mt-10 pt-8 divider-top">
              <h3 class="text-red-500 font-bold text-lg flex items-center gap-2 mb-4"><span>⚠️</span> منطقة الخطر</h3>
              <p class="subtext text-sm mb-4">حذف الحساب نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
              <button @click="showDeleteModal = true" class="px-5 py-2.5 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-400 transition font-medium text-sm">
                🗑️ حذف الحساب
              </button>
            </div>
          </div>
        </div>

        <!-- ===== TAB: Orders ===== -->
        <div v-else-if="activeTab === 'orders'" key="orders">
          <div class="space-y-4">
            <div v-if="orders.length === 0" class="text-center py-20">
              <div class="text-6xl mb-4">📦</div>
              <p class="heading-text text-xl font-bold mb-2">لا توجد طلبات بعد</p>
              <p class="subtext mb-6">ابدأ التسوق الآن!</p>
              <a href="#" class="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition">تسوق الآن</a>
            </div>

            <div v-for="order in orders" :key="order.id" class="card-panel rounded-xl p-6 hover:border-emerald-500/40 transition">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="heading-text font-bold"># {{ order.id }}</p>
                  <p class="subtext text-sm mt-1">{{ order.date }}</p>
                </div>
                <span :class="{
                  'bg-emerald-500/20 text-emerald-500 border-emerald-500/40': order.status === 'delivered',
                  'bg-blue-500/20 text-blue-500 border-blue-500/40': order.status === 'processing',
                  'bg-yellow-500/20 text-yellow-600 border-yellow-500/40': order.status === 'pending',
                  'bg-red-500/20 text-red-500 border-red-500/40': order.status === 'cancelled',
                }" class="px-3 py-1 rounded-full text-xs font-bold border">
                  {{ orderStatusLabel(order.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <p class="subtext text-sm">{{ order.items }} منتجات</p>
                <p class="text-emerald-500 font-bold">{{ order.total.toLocaleString() }} ج.م</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== TAB: Loyalty ===== -->
        <div v-else-if="activeTab === 'loyalty'" key="loyalty">
          <div class="space-y-6">
            <div class="relative overflow-hidden bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur border border-emerald-500/30 rounded-2xl p-8">
              <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div class="relative z-10">
                <p class="text-emerald-500 text-sm font-medium mb-2">رصيد نقاط الولاء</p>
                <div class="flex items-end gap-3 mb-4">
                  <span class="text-6xl font-black" :class="isDark ? 'text-white' : 'text-slate-800'">{{ loyalty.points.toLocaleString() }}</span>
                  <span class="text-emerald-500 font-bold mb-2">نقطة</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700" :style="{ width: loyaltyProgress + '%' }"></div>
                  </div>
                  <span class="text-emerald-600 text-xs">{{ loyalty.points }} / {{ loyalty.nextTierAt }}</span>
                </div>
                <p class="subtext text-xs mt-2">تحتاج {{ loyalty.nextTierAt - loyalty.points }} نقطة للوصول إلى {{ loyalty.nextTier }}</p>
              </div>
            </div>

            <div class="card-panel rounded-xl p-5 flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">{{ loyalty.tierIcon }}</div>
              <div>
                <p class="subtext text-sm">مستواك الحالي</p>
                <p class="heading-text font-black text-xl">{{ loyalty.tier }}</p>
              </div>
              <div class="mr-auto text-right">
                <p class="subtext text-xs">كل 100 جنيه = 10 نقاط</p>
              </div>
            </div>

            <div class="card-panel rounded-xl p-6">
              <h3 class="heading-text font-bold mb-4">سجل النقاط</h3>
              <div class="space-y-1">
                <div v-for="entry in loyalty.history" :key="entry.id" class="flex items-center justify-between py-3 divider-bottom last:border-b-0">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{ entry.icon }}</span>
                    <div>
                      <p class="heading-text text-sm font-medium">{{ entry.label }}</p>
                      <p class="subtext text-xs">{{ entry.date }}</p>
                    </div>
                  </div>
                  <span :class="entry.points > 0 ? 'text-emerald-500' : 'text-red-500'" class="font-bold text-sm">
                    {{ entry.points > 0 ? '+' : '' }}{{ entry.points }} نقطة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Delete Confirm Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="modal-panel rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-red-500/30">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">⚠️</div>
            <h2 class="heading-text text-xl font-bold mb-2">هل أنت متأكد؟</h2>
            <p class="subtext text-sm">سيتم حذف حسابك نهائياً ولا يمكن استعادته.</p>
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-cancel flex-1 px-4 py-3 rounded-xl transition font-medium">إلغاء</button>
            <button @click="deleteAccount" class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold">نعم، احذف</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="relative z-20 footer-bg footer-border border-t mt-20">
      <div class="max-w-7xl mx-auto px-4 py-8 text-center subtext text-sm">
        All rights reserved © 2024 Hypermarket
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from '@/pages/website/components/navbar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useShiftStore } from '@/stores/shift'
import {getCustomerProfileApi} from '@/services/api'
const router = useRouter()
// ================= Store =================
const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)
const isDark =  computed(() => {
      return settings.value?.appearance?.theme == 'dark'
    })


const primaryColor = computed(() => {
  return settings.value?.appearance?.primaryColor || '#06b6d4'
})

// ================= THEME =================
const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  settingsStore.updateSettings({
    appearance: {
      ...settings.value.appearance,
      theme: newTheme
    }
  })
}

// ================= STATE =================
const shiftStore = useShiftStore()
// const userInfo = computed(()=> shiftStore.CurrentUserInfo)
// console.log('==> shiftStore.$state.CurrentUserInfo',shiftStore.$state.CurrentUserInfo)
// console.log("userInfo",userInfo.value )
onMounted(async() => {
  // const user = JSON.parse(localStorage.getItem('CurrentUserInfo'))
  // if (user) shiftStore.setUser(user)
 const userInfo =  await shiftStore.getCurrentUserInfo()
 console.log("userInfo",userInfo )
   const customerProfile = await getCustomerProfileApi()
  console.log("customerProfile", customerProfile)
})

// ================= STATE =================
const isEditing   = ref(false)
const saving      = ref(false)
const savingPassword = ref(false)
const showDeleteModal = ref(false)
const activeTab   = ref('profile')
const message     = ref({ show: false, text: '', type: 'success' })

const form = ref({
  fullName: 'أحمد محمد',
  phone:    '01012345678',
  email:    'ahmed@example.com',
  dob:      '1995-06-15',
  gender:   'male',
  city:     'القاهرة',
  address:  'شارع التحرير، الدقي، الجيزة',
})

let formSnapshot = {}
const passwordForm  = ref({ current: '', new: '', confirm: '' })
const showPasswords = ref({ current: false, new: false, confirm: false })

const tabs = [
  { key: 'profile',  label: 'بياناتي',     icon: '👤' },
  { key: 'orders',   label: 'طلباتي',      icon: '📦' },
  { key: 'loyalty',  label: 'نقاط الولاء', icon: '⭐' },
  { key: 'security', label: 'الأمان',       icon: '🔐' },
]

const orders = ref([
  { id: 'ORD-2024-001', date: '١٠ فبراير ٢٠٢٤', status: 'delivered',  items: 5, total: 1250 },
  { id: 'ORD-2024-002', date: '١٥ يناير ٢٠٢٤',  status: 'processing', items: 3, total: 780  },
  { id: 'ORD-2023-018', date: '٢٠ ديسمبر ٢٠٢٣', status: 'cancelled',  items: 2, total: 320  },
])

const loyalty = ref({
  points: 1240, tier: 'فضي', tierIcon: '🥈', nextTier: 'ذهبي', nextTierAt: 2000,
  history: [
    { id: 1, icon: '🛒', label: 'طلب #ORD-2024-001', date: '١٠ فبراير ٢٠٢٤', points: +125 },
    { id: 2, icon: '🎁', label: 'مكافأة ترحيبية',   date: '١ يناير ٢٠٢٤',   points: +200 },
    { id: 3, icon: '🛒', label: 'طلب #ORD-2023-018', date: '٢٠ ديسمبر ٢٠٢٣', points: +80  },
    { id: 4, icon: '💳', label: 'استبدال نقاط',      date: '١٥ نوفمبر ٢٠٢٣', points: -100 },
  ]
})

// ================= COMPUTED =================
const userInitials = computed(() => {
  const parts = form.value.fullName?.trim().split(' ')
  if (!parts?.length) return '؟'
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
})

const passwordStrength = computed(() => {
  const p = passwordForm.value.new
  if (!p) return 0
  let s = 0
  if (p.length >= 8)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel     = computed(() => ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية جداً'][passwordStrength.value] || '')
const strengthColor     = computed(() => ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'][passwordStrength.value] || '')
const strengthTextColor = computed(() => ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-emerald-500'][passwordStrength.value] || '')

const canChangePassword = computed(() =>
  passwordForm.value.current &&
  passwordForm.value.new &&
  passwordForm.value.confirm === passwordForm.value.new &&
  passwordStrength.value >= 2
)

const loyaltyProgress = computed(() =>
  Math.min((loyalty.value.points / loyalty.value.nextTierAt) * 100, 100)
)

// ================= METHODS =================
const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}

const startEditing  = () => { formSnapshot = { ...form.value }; isEditing.value = true  }
const cancelEditing = () => { form.value = { ...formSnapshot };  isEditing.value = false }

const saveChanges = async () => {
  saving.value = true
  await new Promise(r => setTimeout(r, 1200))
  saving.value = false; isEditing.value = false
  showMessage('تم حفظ التغييرات بنجاح ✓', 'success')
}

const changePassword = async () => {
  savingPassword.value = true
  await new Promise(r => setTimeout(r, 1200))
  savingPassword.value = false
  passwordForm.value = { current: '', new: '', confirm: '' }
  showMessage('تم تغيير كلمة المرور بنجاح ✓', 'success')
}

const orderStatusLabel = (s) => ({ delivered: 'تم التسليم', processing: 'جارٍ التجهيز', pending: 'قيد الانتظار', cancelled: 'ملغي' }[s] || s)

const deleteAccount = async () => {
  showDeleteModal.value = false
  await new Promise(r => setTimeout(r, 800))
  showMessage('تم حذف الحساب', 'error')
  setTimeout(() => router.push({ name: 'Supermarket' }), 1500)
}
</script>

<style scoped>
/* =========================================================
   CSS VARIABLES — DARK / LIGHT
   ========================================================= */
.theme-dark {
  --bg:             linear-gradient(to bottom, #0f172a, #1e293b, #0f172a);
  --blob1:          rgba(16,185,129,.10);
  --blob2:          rgba(59,130,246,.10);
  --card-bg:        rgba(30,41,59,.65);
  --card-border:    rgba(71,85,105,.50);
  --heading:        #f1f5f9;
  --subtext:        #94a3b8;
  --input-bg:       rgba(15,23,42,.80);
  --input-border:   rgba(71,85,105,.70);
  --input-color:    #f1f5f9;
  --input-disabled: rgba(15,23,42,.45);
  --tab-bar:        rgba(30,41,59,.65);
  --tab-bar-border: rgba(71,85,105,.50);
  --tab-inactive:   #94a3b8;
  --divider:        rgba(71,85,105,.40);
  --cancel-border:  rgba(71,85,105,.80);
  --cancel-color:   #cbd5e1;
  --cancel-hover:   rgba(51,65,85,.55);
  --footer-bg:      linear-gradient(to top,#020617,#0f172a);
  --footer-border:  #1e293b;
  --modal-bg:       #0f172a;
  --strength-empty: #334155;
  --track-bg:       #334155;
  --track-border:   #475569;
  --thumb-bg:       linear-gradient(135deg,#64748b,#94a3b8);
}

.theme-light {
  --bg:             linear-gradient(to bottom,#f0fdf4,#ecfdf5,#f0fdf4);
  --blob1:          rgba(16,185,129,.14);
  --blob2:          rgba(59,130,246,.08);
  --card-bg:        rgba(255,255,255,.88);
  --card-border:    rgba(110,231,183,.55);
  --heading:        #0f172a;
  --subtext:        #64748b;
  --input-bg:       rgba(248,250,252,.95);
  --input-border:   rgba(110,231,183,.80);
  --input-color:    #0f172a;
  --input-disabled: rgba(241,245,249,.90);
  --tab-bar:        rgba(255,255,255,.80);
  --tab-bar-border: rgba(110,231,183,.60);
  --tab-inactive:   #475569;
  --divider:        rgba(110,231,183,.50);
  --cancel-border:  rgba(100,116,139,.50);
  --cancel-color:   #475569;
  --cancel-hover:   rgba(241,245,249,.95);
  --footer-bg:      linear-gradient(to top,#d1fae5,#ecfdf5);
  --footer-border:  rgba(110,231,183,.70);
  --modal-bg:       #ffffff;
  --strength-empty: #e2e8f0;
  --track-bg:       #fef3c7;
  --track-border:   #fcd34d;
  --thumb-bg:       linear-gradient(135deg,#fbbf24,#f97316);
}

/* =========================================================
   PAGE SHELL
   ========================================================= */
.page-wrapper { background: var(--bg); }
.blob-1 { background: var(--blob1); }
.blob-2 { background: var(--blob2); }

/* =========================================================
   TYPOGRAPHY
   ========================================================= */
.heading-text   { color: var(--heading);  transition: color .4s; }
.subtext        { color: var(--subtext);  transition: color .4s; }
.breadcrumb-text{ color: var(--subtext);  transition: color .4s; }

/* =========================================================
   CARDS / PANELS
   ========================================================= */
.card-panel {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(12px);
  transition: background .4s, border-color .4s;
}
.modal-panel {
  background: var(--modal-bg);
  transition: background .4s;
}

/* =========================================================
   TABS
   ========================================================= */
.tab-bar {
  background: var(--tab-bar);
  border: 1px solid var(--tab-bar-border);
  backdrop-filter: blur(8px);
  transition: background .4s, border-color .4s;
}
.tab-inactive { color: var(--tab-inactive); transition: color .2s; }

/* =========================================================
   FORM FIELDS
   ========================================================= */
.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: .78rem; font-weight: 600;
  color: var(--subtext); letter-spacing: .03em; transition: color .4s;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  background:  var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 10px;
  color: var(--input-color);
  font-size: .9rem;
  outline: none;
  transition: border-color .25s, box-shadow .25s, background .4s, color .4s;
}
.field-input::placeholder { color: var(--subtext); opacity: .7; }
.field-input option { background: var(--modal-bg); color: var(--input-color); }
.field-input:focus { border-color:#10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.18); }
.field-input:disabled { background: var(--input-disabled); opacity: .65; cursor: not-allowed; }

/* =========================================================
   BUTTONS
   ========================================================= */
.btn-cancel {
  border: 1px solid var(--cancel-border);
  color: var(--cancel-color);
  transition: background .2s, color .2s, border-color .2s;
}
.btn-cancel:hover { background: var(--cancel-hover); }

/* =========================================================
   DIVIDERS
   ========================================================= */
.divider-top    { border-top:    1px solid var(--divider); transition: border-color .4s; }
.divider-bottom { border-bottom: 1px solid var(--divider); transition: border-color .4s; }

/* =========================================================
   STRENGTH METER
   ========================================================= */
.strength-empty { background: var(--strength-empty); }

/* =========================================================
   FOOTER
   ========================================================= */
.footer-bg     { background: var(--footer-bg);     transition: background .4s; }
.footer-border { border-color: var(--footer-border); transition: border-color .4s; }

/* =========================================================
   THEME TOGGLE BUTTON
   ========================================================= */
.theme-toggle { cursor: pointer; }

.theme-toggle .track {
  background: var(--track-bg);
  border: 1px solid var(--track-border);
  transition: background .5s, border-color .5s;
}

.theme-toggle .thumb {
  background: var(--thumb-bg);
  transition: transform .5s cubic-bezier(.34,1.56,.64,1), background .5s;
}

/* =========================================================
   TRANSITIONS
   ========================================================= */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from,  .slide-fade-leave-to      { transform: translateX(30px); opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all .35s ease; }
.slide-down-enter-from,  .slide-down-leave-to      { transform: translateY(-12px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

/* =========================================================
   SCROLLBAR
   ========================================================= */
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: rgba(15,23,42,.5); }
::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
</style>
