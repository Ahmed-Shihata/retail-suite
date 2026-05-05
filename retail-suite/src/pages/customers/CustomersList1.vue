<!-- CustomerList.vue -->
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
        <p class="text-gray-600 mt-1">{{ customers.length }} عميل مسجل</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        عميل جديد
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث باسم أو رقم العميل..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="blocked">محظور</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="recent">الأحدث</option>
          <option value="name">الاسم</option>
          <option value="purchase">أعلى مشتريات</option>
          <option value="debt">أعلى ديون</option>
        </select>

        <!-- Export -->
        <button
          @click="exportCustomers"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          📥 تصدير
        </button>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">اسم العميل</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الهاتف</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الديون</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">إجمالي المشتريات</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ customer.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ customer.phone }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="customer.debt > 0 ? 'text-red-600 font-semibold' : 'text-green-600'">
                  {{ formatCurrency(customer.debt) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(customer.totalPurchases) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusClass(customer.status)" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ getStatusLabel(customer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button
                  @click="viewCustomer(customer)"
                  class="text-blue-600 hover:text-blue-900 transition"
                  title="عرض الملف"
                >
                  👁️
                </button>
                <button
                  @click="editCustomer(customer)"
                  class="text-orange-600 hover:text-orange-900 transition"
                  title="تعديل"
                >
                  ✏️
                </button>
                <button
                  @click="deleteCustomer(customer.id)"
                  class="text-red-600 hover:text-red-900 transition"
                  title="حذف"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCustomers.length === 0" class="text-center py-12">
        <p class="text-gray-500">لا توجد عملاء مطابقة</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">عرض {{ filteredCustomers.length }} من {{ customers.length }} عميل</p>
      <div class="space-x-2">
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">السابق</button>
        <button class="px-3 py-1 bg-blue-600 text-white rounded">1</button>
        <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">التالي</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <CustomerModal
      v-if="showModal"
      :customer="editingCustomer"
      @save="saveCustomer"
      @close="showModal = false"
    />

    <!-- View Profile Modal -->
    <CustomerProfileModal
      v-if="showProfileModal"
      :customer="selectedCustomer"
      @close="showProfileModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomerModal from '@/components/modals/CustomerModal.vue'
import CustomerProfileModal from '@/components/modals/CustomerProfileModal.vue'

    const customers = ref([
      {
        id: 1,
        name: 'أحمد محمد',
        phone: '01234567890',
        email: 'ahmed@example.com',
        address: 'القاهرة',
        debt: 500,
        totalPurchases: 5000,
        status: 'active',
        createdAt: '2025-01-15'
      },
      {
        id: 2,
        name: 'فاطمة علي',
        phone: '01111111111',
        email: 'fatima@example.com',
        address: 'الجيزة',
        debt: 0,
        totalPurchases: 8500,
        status: 'active',
        createdAt: '2025-01-10'
      },
      {
        id: 3,
        name: 'محمود حسن',
        phone: '01555555555',
        email: 'mahmoud@example.com',
        address: 'الإسكندرية',
        debt: 1200,
        totalPurchases: 3000,
        status: 'inactive',
        createdAt: '2025-01-05'
      }
    ])

    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortBy = ref('recent')
    const showModal = ref(false)
    const showProfileModal = ref(false)
    const editingCustomer = ref(null)
    const selectedCustomer = ref(null)

    const filteredCustomers = computed(() => {
      let filtered = customers.value.filter(c => {
        const matchSearch = !searchQuery.value ||
          c.name.includes(searchQuery.value) ||
          c.phone.includes(searchQuery.value)

        const matchStatus = !statusFilter.value || c.status === statusFilter.value

        return matchSearch && matchStatus
      })

      // Sort
      if (sortBy.value === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      } else if (sortBy.value === 'purchase') {
        filtered.sort((a, b) => b.totalPurchases - a.totalPurchases)
      } else if (sortBy.value === 'debt') {
        filtered.sort((a, b) => b.debt - a.debt)
      } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return filtered
    })

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
      }).format(value)
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        blocked: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: 'نشط',
        inactive: 'غير نشط',
        blocked: 'محظور'
      }
      return labels[status] || status
    }

    const openCreateModal = () => {
      editingCustomer.value = null
      showModal.value = true
      console.log("Open showModal",showModal.value)
    }

    const editCustomer = (customer) => {
      editingCustomer.value = { ...customer }
      showModal.value = true
    }

    const viewCustomer = (customer) => {
      selectedCustomer.value = customer
      showProfileModal.value = true
    }

    const deleteCustomer = async (id) => {
      if (confirm('هل تريد حذف هذا العميل؟')) {
        customers.value = customers.value.filter(c => c.id !== id)
      }
    }

    const saveCustomer = (customer) => {
      if (customer.id) {
        // Update existing
        const index = customers.value.findIndex(c => c.id === customer.id)
        if (index >= 0) {
          customers.value[index] = customer
        }
      } else {
        // Create new
        customer.id = Math.max(...customers.value.map(c => c.id)) + 1
        customers.value.push(customer)
      }
      showModal.value = false
    }

    const exportCustomers = () => {
      const csv = [
        ['اسم العميل', 'الهاتف', 'البريد', 'الديون', 'إجمالي المشتريات'],
        ...filteredCustomers.value.map(c => [
          c.name,
          c.phone,
          c.email,
          c.debt,
          c.totalPurchases
        ])
      ]
      const csvContent = csv.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'customers.csv'
      a.click()
    }
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
