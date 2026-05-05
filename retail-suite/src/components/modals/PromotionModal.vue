<!-- PromotionModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">
          {{ promotion ? 'تعديل العرض' : 'عرض ترويجي جديد' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">اسم العرض *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: خصم الجمعة البيضاء"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">نوع العرض *</label>
            <select
              v-model="form.type"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر النوع</option>
              <option value="percentage">خصم نسبة (%)</option>
              <option value="fixed">خصم ثابت (ج.م)</option>
              <option value="bundle">عرض مجمع</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="وصف العرض"
          ></textarea>
        </div>

        <div v-if="form.type !== 'bundle'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              قيمة العرض *
              <span class="text-gray-500 text-xs">({{ form.type === 'percentage' ? '%' : 'ج.م' }})</span>
            </label>
            <input
              v-model.number="form.value"
              type="number"
              min="0"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للمبلغ</label>
            <input
              v-model.number="form.minAmount"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية *</label>
            <input
              v-model="form.startDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ النهاية *</label>
            <input
              v-model="form.endDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">حد الاستخدام</label>
            <input
              v-model.number="form.usageLimit"
              type="number"
              min="-1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-1 لـ غير محدود"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">المنتجات المشمولة *</label>
            <select
              v-model="form.applicableProducts"
              multiple
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المنتجات</option>
              <option value="beverages">المشروبات</option>
              <option value="food">الطعام</option>
              <option value="desserts">الحلويات</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <input v-model="form.status" value="active" type="radio" id="active" class="w-4 h-4" />
          <label for="active" class="text-sm font-medium text-gray-700">نشط</label>

          <input v-model="form.status" value="inactive" type="radio" id="inactive" class="w-4 h-4" />
          <label for="inactive" class="text-sm font-medium text-gray-700">معطل</label>
        </div>

        <!-- Actions -->
        <div class="border-t pt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {{ promotion ? 'تحديث' : 'إضافة' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
  const props = defineProps( {
    promotion: {
      type: Object,
      default: null
    }
  })
  const emit = defineEmits(['save', 'close'])

    const form = ref({
      id: null,
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      usageLimit: 100,
      usageCount: 0,
      applicableProducts: ['all']
    })

    watch(() => props.promotion, (newPromo) => {
      if (newPromo) {
        form.value = { ...newPromo }
      } else {
        resetForm()
      }
    }, { immediate: true })

    const resetForm = () => {
      form.value = {
        id: null,
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        minAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        usageLimit: 100,
        usageCount: 0,
        applicableProducts: ['all']
      }
    }

    const handleSubmit = () => {
      if (!form.value.name) {
        alert('الرجاء إدخال اسم العرض')
        return
      }
      if (!form.value.type) {
        alert('الرجاء اختيار نوع العرض')
        return
      }
      emit('save', { ...form.value })
    }
</script>

---
