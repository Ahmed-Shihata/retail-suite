<!--LoyaltyPoints.vue  -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
    <!-- Navbar Component -->
    <Navbar />

    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Toast Message -->
    <Transition name="slide-fade">
      <div v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <div class="relative z-20 max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          نقاط الولاء
        </h1>
        <p class="text-slate-400 text-lg font-light">اربح نقاط مع كل عملية شراء واستبدلها بمكافآت رائعة</p>
      </div>

      <!-- Points Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Points Card -->
        <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-lg shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium opacity-90">إجمالي النقاط</h3>
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p class="text-5xl font-black mb-2">{{ loyaltyData.totalPoints.toLocaleString() }}</p>
          <p class="text-sm opacity-90">نقطة</p>
        </div>

        <!-- Points Value Card -->
        <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-white">قيمة النقاط</h3>
            <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
            {{ loyaltyData.pointsValue.toFixed(2) }}
          </p>
          <p class="text-sm text-slate-400">جنيه مصري</p>
        </div>

        <!-- Next Tier Card -->
        <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-white">المستوى القادم</h3>
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p class="text-4xl font-black text-white mb-2">{{ loyaltyData.pointsToNextTier }}</p>
          <p class="text-sm text-slate-400">نقطة متبقية</p>
        </div>
      </div>

      <!-- Membership Tier Progress -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">مستوى العضوية</h2>
            <p class="text-slate-400">المستوى الحالي: <span class="text-emerald-400 font-bold">{{ loyaltyData.currentTier.name }}</span></p>
          </div>
          <div class="text-right">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
              </svg>
              {{ loyaltyData.currentTier.multiplier }}x
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="relative">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm text-slate-400">{{ loyaltyData.tierProgress }}%</span>
            <span class="text-sm text-slate-400">المستوى القادم: {{ loyaltyData.nextTier }}</span>
          </div>
          <div class="relative h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="absolute h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: loyaltyData.tierProgress + '%' }"
            >
              <div class="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Tiers List -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            :class="tier.name === loyaltyData.currentTier.name
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-900/30'"
            class="border-2 rounded-xl p-4 text-center transition-all duration-300 hover:border-emerald-500/50"
          >
            <div class="text-3xl mb-2">{{ tier.icon }}</div>
            <h4 class="font-bold text-white mb-1">{{ tier.name }}</h4>
            <p class="text-xs text-slate-400 mb-2">{{ tier.minPoints }}+ نقطة</p>
            <div class="inline-block px-3 py-1 bg-emerald-500/20 rounded-lg">
              <span class="text-emerald-400 font-bold text-sm">{{ tier.multiplier }}x</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Points History -->
        <div class="lg:col-span-2">
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-white mb-6">سجل النقاط</h2>

            <div class="space-y-4">
              <Transition-group name="list">
                <div
                  v-for="transaction in pointsHistory"
                  :key="transaction.id"
                  class="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1">
                      <div :class="transaction.type === 'earned'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'"
                        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg v-if="transaction.type === 'earned'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-bold text-white mb-1">{{ transaction.description }}</h4>
                        <p class="text-sm text-slate-400">{{ transaction.date }}</p>
                        <p v-if="transaction.orderId" class="text-xs text-slate-500 mt-1">طلب #{{ transaction.orderId }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p :class="transaction.type === 'earned' ? 'text-emerald-400' : 'text-red-400'"
                        class="text-2xl font-black">
                        {{ transaction.type === 'earned' ? '+' : '-' }}{{ transaction.points }}
                      </p>
                      <p class="text-xs text-slate-500 mt-1">{{ transaction.balance }} رصيد</p>
                    </div>
                  </div>
                </div>
              </Transition-group>
            </div>
          </div>
        </div>

        <!-- Rewards Section -->
        <div class="space-y-6">
          <!-- Available Rewards -->
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">المكافآت المتاحة</h3>
            <div class="space-y-3">
              <div
                v-for="reward in availableRewards"
                :key="reward.id"
                class="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/50 transition"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="text-3xl">{{ reward.icon }}</div>
                  <div class="flex-1">
                    <h4 class="font-bold text-white text-sm">{{ reward.title }}</h4>
                    <p class="text-xs text-slate-400">{{ reward.description }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-emerald-400 font-bold text-sm">{{ reward.points }} نقطة</span>
                  <button
                    @click="redeemReward(reward)"
                    :disabled="loyaltyData.totalPoints < reward.points"
                    class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    استبدال
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- How to Earn -->
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              كيف تربح النقاط؟
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <p class="text-white font-medium text-sm">كل 10 جنيه = نقطة واحدة</p>
                  <p class="text-xs text-slate-400">عند كل عملية شراء</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <p class="text-white font-medium text-sm">100 نقطة ترحيبية</p>
                  <p class="text-xs text-slate-400">عند التسجيل لأول مرة</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <p class="text-white font-medium text-sm">50 نقطة إضافية</p>
                  <p class="text-xs text-slate-400">عند دعوة صديق</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <p class="text-white font-medium text-sm">مضاعفة النقاط</p>
                  <p class="text-xs text-slate-400">حسب مستوى العضوية</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Referral Card -->
          <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border border-purple-500/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-3">ادعُ أصدقاءك</h3>
            <p class="text-slate-300 text-sm mb-4">احصل على 50 نقطة عن كل صديق يسجل ويشتري</p>
            <div class="bg-slate-900/50 rounded-lg p-3 mb-3 flex items-center justify-between">
              <code class="text-emerald-400 text-sm font-mono">{{ referralCode }}</code>
              <button
                @click="copyReferralCode"
                class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition"
              >
                نسخ
              </button>
            </div>
            <button
              class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              مشاركة الرابط
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from "@/pages/website/components/navbar.vue"

// State
const message = ref({
  show: false,
  text: '',
  type: 'success'
})

const loyaltyData = ref({
  totalPoints: 2450,
  pointsValue: 245.00,
  pointsToNextTier: 550,
  currentTier: {
    name: 'ذهبي',
    multiplier: 2
  },
  nextTier: 'بلاتيني',
  tierProgress: 75
})

const referralCode = ref('SUPER2026XYZ')

const tiers = [
  { name: 'برونزي', icon: '🥉', minPoints: 0, multiplier: 1 },
  { name: 'فضي', icon: '🥈', minPoints: 500, multiplier: 1.5 },
  { name: 'ذهبي', icon: '🥇', minPoints: 1500, multiplier: 2 },
  { name: 'بلاتيني', icon: '💎', minPoints: 3000, multiplier: 3 }
]

const pointsHistory = ref([
  {
    id: 1,
    type: 'earned',
    description: 'شراء من المتجر',
    points: 125,
    balance: 2450,
    date: '2026-02-07 14:30',
    orderId: '1001'
  },
  {
    id: 2,
    type: 'redeemed',
    description: 'استبدال - خصم 50 جنيه',
    points: 500,
    balance: 2325,
    date: '2026-02-05 10:15'
  },
  {
    id: 3,
    type: 'earned',
    description: 'شراء من المتجر',
    points: 89,
    balance: 2825,
    date: '2026-02-03 16:45',
    orderId: '1002'
  },
  {
    id: 4,
    type: 'earned',
    description: 'مكافأة دعوة صديق',
    points: 50,
    balance: 2736,
    date: '2026-02-01 09:20'
  },
  {
    id: 5,
    type: 'earned',
    description: 'مكافأة ترحيبية',
    points: 100,
    balance: 2686,
    date: '2026-01-28 12:00'
  }
])

const availableRewards = ref([
  {
    id: 1,
    icon: '💰',
    title: 'خصم 50 جنيه',
    description: 'على طلبك القادم',
    points: 500
  },
  {
    id: 2,
    icon: '🎁',
    title: 'خصم 100 جنيه',
    description: 'على طلبك القادم',
    points: 1000
  },
  {
    id: 3,
    icon: '🚚',
    title: 'توصيل مجاني',
    description: 'لمدة شهر',
    points: 1500
  },
  {
    id: 4,
    icon: '⭐',
    title: 'خصم 20%',
    description: 'على الطلب التالي',
    points: 2000
  }
])

// Methods
const redeemReward = (reward) => {
  if (loyaltyData.value.totalPoints >= reward.points) {
    loyaltyData.value.totalPoints -= reward.points
    loyaltyData.value.pointsValue = loyaltyData.value.totalPoints * 0.1

    pointsHistory.value.unshift({
      id: Date.now(),
      type: 'redeemed',
      description: `استبدال - ${reward.title}`,
      points: reward.points,
      balance: loyaltyData.value.totalPoints,
      date: new Date().toLocaleString('ar-EG')
    })

    showMessage(`تم استبدال ${reward.title} بنجاح!`, 'success')
  } else {
    showMessage('نقاطك غير كافية لهذه المكافأة', 'error')
  }
}

const copyReferralCode = () => {
  navigator.clipboard.writeText(referralCode.value)
  showMessage('تم نسخ كود الإحالة!', 'success')
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
</style>
