<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">العروض الترويجية</h1>
        <p class="text-gray-600 mt-1">{{ promotions.length }} عرض نشط</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        عرض جديد
      </button>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow">
        <p class="text-green-600 text-sm font-semibold">العروض النشطة</p>
        <p class="text-3xl font-bold text-green-900 mt-2">{{ activePromotions }}</p>
      </div>

      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow">
        <p class="text-blue-600 text-sm font-semibold">المدخرات الإجمالية</p>
        <p class="text-3xl font-bold text-blue-900 mt-2">{{ formatCurrency(totalSavings) }}</p>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 shadow">
        <p class="text-purple-600 text-sm font-semibold">عدد الاستخدامات</p>
        <p class="text-3xl font-bold text-purple-900 mt-2">{{ totalUsage }}</p>
      </div>

      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 shadow">
        <p class="text-orange-600 text-sm font-semibold">منتهية الصلاحية</p>
        <p class="text-3xl font-bold text-orange-900 mt-2">{{ expiredCount }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث عن عرض..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          v-model="typeFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">جميع الأنواع</option>
          <option value="percentage">خصم نسبة</option>
          <option value="fixed">خصم ثابت</option>
          <option value="bundle">عرض مجمع</option>
        </select>

        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">معطل</option>
          <option value="expired">منتهي الصلاحية</option>
        </select>

        <button
          @click="resetFilters"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          🔄 إعادة تعيين
        </button>
      </div>
    </div>

    <!-- Promotions Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">اسم العرض</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">النوع</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">القيمة</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">من - إلى</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الاستخدام</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="promo in filteredPromotions" :key="promo.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ promo.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <span :class="getTypeClass(promo.type)" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ getTypeLabel(promo.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                {{ promo.type === 'percentage' ? promo.value + '%' : formatCurrency(promo.value) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(promo.startDate) }} - {{ formatDate(promo.endDate) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ promo.usageCount }} / {{ promo.usageLimit }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusClass(promo.status)" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ getStatusLabel(promo.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button @click="editPromotion(promo)" class="text-blue-600 hover:text-blue-900">✏️</button>
                <button @click="deletePromotion(promo.id)" class="text-red-600 hover:text-red-900">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredPromotions.length === 0" class="text-center py-12">
        <p class="text-gray-500">لا توجد عروض مطابقة</p>
      </div>
    </div>

    <!-- Modal -->
    <PromotionModal
      v-if="showModal"
      :promotion="editingPromotion"
      @save="savePromotion"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PromotionModal from '@/components/modals/PromotionModal.vue'


    const promotions = ref([
      {
        id: 1,
        name: 'خصم الجمعة البيضاء',
        description: 'خصم 30% على جميع المنتجات',
        type: 'percentage',
        value: 30,
        startDate: '2025-01-25',
        endDate: '2025-01-31',
        status: 'active',
        usageCount: 156,
        usageLimit: 500,
        applicableProducts: ['all']
      },
      {
        id: 2,
        name: 'اشتري 2 بـ السعر',
        description: 'عرض على المشروبات',
        type: 'bundle',
        value: 0,
        startDate: '2025-01-01',
        endDate: '2025-02-28',
        status: 'active',
        usageCount: 234,
        usageLimit: -1,
        applicableProducts: ['beverages']
      },
      {
        id: 3,
        name: 'خصم ثابت 50 جنيه',
        description: 'على الطلبات فوق 500 جنيه',
        type: 'fixed',
        value: 50,
        startDate: '2025-01-15',
        endDate: '2025-01-20',
        status: 'expired',
        usageCount: 89,
        usageLimit: 100,
        applicableProducts: ['all']
      }
    ])

    const searchQuery = ref('')
    const typeFilter = ref('')
    const statusFilter = ref('')
    const showModal = ref(false)
    const editingPromotion = ref(null)

    const filteredPromotions = computed(() => {
      return promotions.value.filter(p => {
        const matchSearch = !searchQuery.value || p.name.includes(searchQuery.value)
        const matchType = !typeFilter.value || p.type === typeFilter.value
        const matchStatus = !statusFilter.value || p.status === statusFilter.value
        return matchSearch && matchType && matchStatus
      })
    })

    const activePromotions = computed(() => {
      return promotions.value.filter(p => p.status === 'active').length
    })

    const totalSavings = computed(() => {
      return promotions.value.reduce((sum, p) => {
        if (p.type === 'percentage') return sum
        return sum + (p.value * p.usageCount)
      }, 0)
    })

    const totalUsage = computed(() => {
      return promotions.value.reduce((sum, p) => sum + p.usageCount, 0)
    })

    const expiredCount = computed(() => {
      return promotions.value.filter(p => p.status === 'expired').length
    })

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
      }).format(value)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ar-EG')
    }

    const getTypeClass = (type) => {
      const classes = {
        percentage: 'bg-green-100 text-green-800',
        fixed: 'bg-blue-100 text-blue-800',
        bundle: 'bg-purple-100 text-purple-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    const getTypeLabel = (type) => {
      const labels = {
        percentage: 'خصم نسبة',
        fixed: 'خصم ثابت',
        bundle: 'عرض مجمع'
      }
      return labels[type] || type
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        expired: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: 'نشط',
        inactive: 'معطل',
        expired: 'منتهي'
      }
      return labels[status] || status
    }

    const openCreateModal = () => {
      editingPromotion.value = null
      showModal.value = true
    }

    const editPromotion = (promo) => {
      editingPromotion.value = { ...promo }
      showModal.value = true
    }

    const savePromotion = (promo) => {
      if (promo.id) {
        const index = promotions.value.findIndex(p => p.id === promo.id)
        if (index >= 0) {
          promotions.value[index] = promo
        }
      } else {
        promo.id = Math.max(...promotions.value.map(p => p.id)) + 1
        promotions.value.push(promo)
      }
      showModal.value = false
    }

    const deletePromotion = (id) => {
      if (confirm('هل تريد حذف هذا العرض؟')) {
        promotions.value = promotions.value.filter(p => p.id !== id)
      }
    }

    const resetFilters = () => {
      searchQuery.value = ''
      typeFilter.value = ''
      statusFilter.value = ''
    }

</script>
