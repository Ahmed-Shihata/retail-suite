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

    <!-- Global Loading Skeleton -->
    <div v-if="loading.page" class="relative z-20 max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8 text-center">
        <div class="h-12 w-64 bg-slate-700/50 rounded-xl mx-auto mb-3 animate-pulse"></div>
        <div class="h-5 w-96 bg-slate-700/30 rounded-lg mx-auto animate-pulse"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="i in 3" :key="i" class="bg-slate-800/50 rounded-2xl p-8 animate-pulse">
          <div class="h-6 w-32 bg-slate-700 rounded mb-4"></div>
          <div class="h-12 w-24 bg-slate-700 rounded mb-2"></div>
          <div class="h-4 w-16 bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="relative z-20 max-w-7xl mx-auto px-4 py-8">
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
          <p class="text-4xl font-black text-white mb-2">
            {{ loyaltyData.nextTier ? loyaltyData.pointsToNextTier : '🏆' }}
          </p>
          <p class="text-sm text-slate-400">
            {{ loyaltyData.nextTier ? 'نقطة متبقية' : 'أعلى مستوى!' }}
          </p>
        </div>
      </div>

      <!-- Membership Tier Progress -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">مستوى العضوية</h2>
            <p class="text-slate-400">المستوى الحالي:
              <span class="text-emerald-400 font-bold">
                {{ loyaltyData.currentTier.icon }} {{ loyaltyData.currentTier.name }}
              </span>
            </p>
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
            <span class="text-sm text-slate-400">
              {{ loyaltyData.nextTier ? `المستوى القادم: ${loyaltyData.nextTier}` : 'المستوى الأعلى 🏆' }}
            </span>
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

            <!-- History Loading -->
            <div v-if="loading.history" class="space-y-4">
              <div v-for="i in 4" :key="i" class="bg-slate-900/50 rounded-xl p-5 animate-pulse">
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-slate-700 rounded-xl flex-shrink-0"></div>
                  <div class="flex-1">
                    <div class="h-4 w-40 bg-slate-700 rounded mb-2"></div>
                    <div class="h-3 w-24 bg-slate-700/50 rounded"></div>
                  </div>
                  <div class="h-8 w-16 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="pointsHistory.length === 0" class="text-center py-12">
              <div class="text-5xl mb-4">📋</div>
              <p class="text-slate-400">لا يوجد سجل نقاط بعد</p>
              <p class="text-slate-500 text-sm mt-1">ابدأ التسوق واكسب أول نقاطك!</p>
            </div>

            <div v-else class="space-y-4">
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

              <!-- Load More -->
              <div v-if="hasMoreHistory" class="text-center pt-2">
                <button
                  @click="loadMoreHistory"
                  :disabled="loading.moreHistory"
                  class="px-6 py-2 border border-slate-600 text-slate-300 rounded-xl text-sm hover:border-emerald-500 hover:text-emerald-400 transition disabled:opacity-50"
                >
                  {{ loading.moreHistory ? 'جاري التحميل...' : 'تحميل المزيد' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rewards Section -->
        <div class="space-y-6">
          <!-- Available Rewards -->
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-white mb-4">المكافآت المتاحة</h3>

            <!-- Rewards Loading -->
            <div v-if="loading.rewards" class="space-y-3">
              <div v-for="i in 3" :key="i" class="bg-slate-900/50 rounded-xl p-4 animate-pulse">
                <div class="flex gap-3 mb-3">
                  <div class="w-10 h-10 bg-slate-700 rounded-lg"></div>
                  <div class="flex-1">
                    <div class="h-4 w-28 bg-slate-700 rounded mb-1"></div>
                    <div class="h-3 w-20 bg-slate-700/50 rounded"></div>
                  </div>
                </div>
                <div class="h-8 bg-slate-700/50 rounded-lg"></div>
              </div>
            </div>

            <div v-else class="space-y-3">
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
                    @click="handleRedeemReward(reward)"
                    :disabled="loyaltyData.totalPoints < reward.points || loading.redeeming === reward.id"
                    class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {{ loading.redeeming === reward.id ? '...' : 'استبدال' }}
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
              <code v-if="referralCode" class="text-emerald-400 text-sm font-mono">{{ referralCode }}</code>
              <div v-else class="h-5 w-32 bg-slate-700 rounded animate-pulse"></div>
              <button
                @click="copyReferralCode"
                :disabled="!referralCode"
                class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition disabled:opacity-50"
              >
                نسخ
              </button>
            </div>
            <button
              @click="shareReferralCode"
              :disabled="!referralCode"
              class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50"
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
import { ref, onMounted } from 'vue'
import Navbar from "@/pages/website/components/navbar.vue"
import {
  getLoyaltySummary,
  getPointsHistory,
  getAvailableRewards,
  redeemReward as redeemRewardApi,
  getReferralCode,
} from "@/services/api"

// ── State ──────────────────────────────────────
const message = ref({ show: false, text: '', type: 'success' })

const loading = ref({
  page: true,
  history: false,
  rewards: false,
  moreHistory: false,
  redeeming: null,   // reward.id currently being redeemed
})

const loyaltyData = ref({
  totalPoints: 0,
  pointsValue: 0,
  pointsToNextTier: 0,
  currentTier: { name: '—', icon: '', multiplier: 1 },
  nextTier: null,
  tierProgress: 0,
})

const tiers = ref([])
const pointsHistory = ref([])
const availableRewards = ref([])
const referralCode = ref('')

// Pagination
const historyOffset = ref(0)
const historyTotal = ref(0)
const HISTORY_LIMIT = 10
const hasMoreHistory = ref(false)

// ── Data Loaders ───────────────────────────────
const loadSummary = async () => {
  const res = await getLoyaltySummary()
  if (res.status === 'success' && res.data) {
    const d = res.data
    loyaltyData.value = {
      totalPoints: d.total_points || 0,
      pointsValue: d.points_value || 0,
      pointsToNextTier: d.points_to_next_tier || 0,
      currentTier: {
        name: d.current_tier?.name || '—',
        icon: d.current_tier?.icon || '',
        multiplier: d.current_tier?.multiplier || 1,
      },
      nextTier: d.next_tier || null,
      tierProgress: d.tier_progress || 0,
    }
    tiers.value = (d.tiers || []).map(t => ({
      name: t.name,
      icon: t.icon,
      minPoints: t.min_points,
      multiplier: t.multiplier,
    }))
  } else {
    showMessage('خطأ في تحميل بيانات الولاء', 'error')
  }
}

const loadHistory = async (reset = false) => {
  if (reset) {
    historyOffset.value = 0
    pointsHistory.value = []
    loading.value.history = true
  } else {
    loading.value.moreHistory = true
  }

  const res = await getPointsHistory(HISTORY_LIMIT, historyOffset.value)

  if (res.status === 'success') {
    pointsHistory.value.push(...res.data)
    historyTotal.value = res.total
    historyOffset.value += res.data.length
    hasMoreHistory.value = historyOffset.value < historyTotal.value
  } else {
    showMessage('خطأ في تحميل السجل', 'error')
  }

  loading.value.history = false
  loading.value.moreHistory = false
}

const loadRewards = async () => {
  loading.value.rewards = true
  const res = await getAvailableRewards()
  if (res.status === 'success') {
    availableRewards.value = res.data
  } else {
    showMessage('خطأ في تحميل المكافآت', 'error')
  }
  loading.value.rewards = false
}

const loadReferralCode = async () => {
  const res = await getReferralCode()
  if (res.status === 'success') {
    referralCode.value = res.data.referral_code || ''
  }
}

// ── Actions ────────────────────────────────────
const handleRedeemReward = async (reward) => {
  loading.value.redeeming = reward.id

  const res = await redeemRewardApi(reward.id)

  if (res.status === 'success') {
    const d = res.data
    // Update balance locally (optimistic)
    loyaltyData.value.totalPoints = d.new_balance
    loyaltyData.value.pointsValue = d.new_points_value

    // Add to history list instantly
    pointsHistory.value.unshift({
      id: d.entry_id,
      type: 'redeemed',
      description: `استبدال - ${d.reward_title}`,
      points: d.points_deducted,
      balance: d.new_balance,
      date: new Date().toLocaleString('ar-EG'),
    })

    showMessage(`تم استبدال ${d.reward_title} بنجاح!`, 'success')
  } else {
    showMessage(res.message || 'حدث خطأ أثناء الاستبدال', 'error')
  }

  loading.value.redeeming = null
}

const loadMoreHistory = () => loadHistory(false)

const copyReferralCode = () => {
  if (!referralCode.value) return
  navigator.clipboard.writeText(referralCode.value)
  showMessage('تم نسخ كود الإحالة!', 'success')
}

const shareReferralCode = () => {
  if (!referralCode.value) return
  const text = `استخدم كودي ${referralCode.value} واحصل على خصم عند أول طلب!`
  if (navigator.share) {
    navigator.share({ title: 'كود الإحالة', text })
  } else {
    navigator.clipboard.writeText(text)
    showMessage('تم نسخ رسالة المشاركة!', 'success')
  }
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}

// ── Init ───────────────────────────────────────
onMounted(async () => {
  loading.value.page = true
  await Promise.all([
    loadSummary(),
    loadHistory(true),
    loadRewards(),
    loadReferralCode(),
  ])
  loading.value.page = false
})
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
