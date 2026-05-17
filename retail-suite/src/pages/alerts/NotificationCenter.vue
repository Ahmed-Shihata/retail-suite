<template>
    <div class="w-full flex min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <router-link to="/dashboard" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7" />
                </svg>
              </router-link>
              <div>
                <h1 class="text-lg font-bold text-gray-900">🔔 جميع الإخطارات</h1>
                <p class="text-sm text-gray-600">إدارة جميع إخطاراتك وتنبيهاتك</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="notificationCount > 0"
                @click="markAllAsRead"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                ✓ وضع علامة الكل كمقروء
              </button>
              <button
                v-if="notifications.length > 0"
                @click="deleteAllNotifications"
                class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
              >
                🗑️ حذف جميع الإخطارات
              </button>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12 px-6">
          <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 font-medium">⚠️ {{ error }}</p>
          <button @click="fetchNotifications" class="mt-2 text-red-600 hover:text-red-900 text-sm font-medium underline">
            حاول مرة أخرى
          </button>
        </div>

        <!-- Main Content -->
        <div v-else class="flex-1 px-6 py-8 space-y-6">
          <!-- Filters Section -->
          <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div class="flex-1">
                <label class="text-sm font-semibold text-gray-700 block mb-2">البحث في الإخطارات</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ابحث عن طريق الموضوع أو المحتوى..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-2">النوع</label>
                <select
                  v-model="filterType"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">الكل</option>
                  <option value="alert">تنبيه</option>
                  <option value="purchase">توريد</option>
                  <option value="success">نجاح</option>
                  <option value="info">معلومة</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-2">الحالة</label>
                <select
                  v-model="filterStatus"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">الكل</option>
                  <option value="unread">غير مقروء</option>
                  <option value="read">مقروء</option>
                </select>
              </div>
            </div>
          </section>

          <!-- Empty State -->
          <div v-if="filteredNotifications.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📭</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">لا توجد إخطارات</h3>
            <p class="text-gray-600">جميع إخطاراتك محدثة وليس لديك أي تنبيهات جديدة</p>
          </div>

          <!-- Notifications List -->
          <div v-else class="space-y-3">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.name"
              :class="[
                'bg-white rounded-xl shadow-sm border transition hover:shadow-md cursor-pointer',
                notification.read
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-blue-200 bg-blue-50 hover:border-blue-300'
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="px-6 py-4 flex gap-4 items-start">
                <!-- Icon Badge -->
                <div
                  :class="[
                    'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-lg',
                    getNotificationIconBg(notification.type)
                  ]"
                >
                  {{ getNotificationIcon(notification.type) }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <h3 class="text-base font-semibold text-gray-900">{{ notification.subject }}</h3>
                    <div class="flex gap-2 items-center flex-shrink-0">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-semibold',
                          getTypeClass(notification.type)
                        ]"
                      >
                        {{ formatType(notification.type) }}
                      </span>
                      <span v-if="!notification.read" class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                  </div>

                  <p class="text-sm text-gray-700 mb-2 line-clamp-2">
                    {{ notification.email_content || 'بدون محتوى' }}
                  </p>

                  <!-- Meta Information -->
                  <div class="flex flex-wrap gap-3 items-center text-xs text-gray-600 mb-3">
                    <span class="flex items-center gap-1">
                      📅 {{ formatDate(notification.creation) }}
                    </span>
                    <span v-if="notification.document_type" class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      📄 {{ notification.document_type }}
                    </span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2 items-center">
                    <button
                      @click.stop="markAsRead(notification)"
                      :class="[
                        'px-3 py-1 rounded text-sm font-medium transition',
                        notification.read
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-blue-600 hover:bg-blue-100'
                      ]"
                    >
                      {{ notification.read ? '✓ مقروء' : '🔔 وضع علامة كمقروء' }}
                    </button>

                    <button
                      v-if="notification.document_name && notification.document_type"
                      @click.stop="openDocument(notification)"
                      class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium hover:bg-blue-200 transition"
                    >
                      عرض المستند →
                    </button>

                    <button
                      @click.stop="deleteNotification(notification)"
                      class="px-3 py-1 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredNotifications.length > 0" class="flex justify-center items-center gap-2 mt-8">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← السابق
            </button>
            <span class="text-sm text-gray-600">
              الصفحة {{ currentPage }} من {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              التالي →
            </button>
          </div>
        </div>
      </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNotifications, getCurrentUserInfoApi, updateNotificationStatus, deleteNotificationAPI } from '@/services/api'
import { useConfirm } from '@/composables/useConfirm'
const { confirm } = useConfirm()

const ITEMS_PER_PAGE = 10

const loading = ref(false)
const error = ref(null)
const notifications = ref([])
const currentUser = ref(null)

// Filters
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)

// Fetch notifications
const fetchNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    if (!currentUser.value) {
      error.value = 'لم يتم العثور على المستخدم الحالي'
      return
    }

    const data = await getNotifications(currentUser.value)
    notifications.value = data || []

    if (notifications.value.length === 0) {
      console.log('لا توجد إخطارات')
    }
  } catch (err) {
    console.error('Error fetching notifications:', err)
    error.value = 'حدث خطأ في جلب الإخطارات. يرجى المحاولة مرة أخرى'
  } finally {
    loading.value = false
  }
}

// Filter notifications
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      n =>
        n.subject?.toLowerCase().includes(query) ||
        n.email_content?.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter(n => n.type === filterType.value)
  }

  // Status filter
  if (filterStatus.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (filterStatus.value === 'read') {
    filtered = filtered.filter(n => n.read)
  }

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / ITEMS_PER_PAGE))
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredNotifications.value.slice(start, start + ITEMS_PER_PAGE)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Mark notification as read
const markAsRead = async (notification) => {
  if (notification.read) return

  try {
    await updateNotificationStatus(notification.name, true)
    notification.read = true
  } catch (err) {
    console.error('Error marking notification as read:', err)
    error.value = 'خطأ في تحديث الإخطار'
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter(n => !n.read)

    for (const notification of unreadNotifications) {
      await updateNotificationStatus(notification.name, true)
      notification.read = true
    }
  } catch (err) {
    console.error('Error marking all as read:', err)
    error.value = 'خطأ في تحديث الإخطارات'
  }
}

// Delete notification
const deleteNotification = async (notification) => {
  try {
    await deleteNotificationAPI(notification.name)
    notifications.value = notifications.value.filter(n => n.name !== notification.name)
  } catch (err) {
    console.error('Error deleting notification:', err)
    error.value = 'خطأ في حذف الإخطار'
  }
}

// Delete all notifications
const deleteAllNotifications = async () => {
  const confirmed = await confirm({
    type: 'delete',
    title: 'حذف جميع الإخطارات',
    message: 'هل أنت متأكد من رغبتك في حذف جميع الإخطارات؟',
    confirmLabel: 'حذف',
  })
  if (!confirmed) return
    try {
      for (const notification of notifications.value) {
        await deleteNotificationAPI(notification.name)
      }
      notifications.value = []
    } catch (err) {
      console.error('Error deleting all notifications:', err)
      error.value = 'خطأ في حذف الإخطارات'
    }

}


// Handle notification click
const handleNotificationClick = (notification) => {
  markAsRead(notification)
  if (notification.document_name && notification.document_type) {
    openDocument(notification)
  }
}

const openDocument = (notification) => {
  if (!notification.document_type || !notification.document_name) return

  const url = `/app/${notification.document_type.toLowerCase().replace(/ /g, '-')}/${notification.document_name}`
  window.open(url, '_blank')
}

// Notification counter
const notificationCount = computed(() => notifications.value.filter(n => !n.read).length)

// Utility: Format Type
const formatType = (type) => {
  if (!type) return 'إخطار'
  const typeMap = {
    alert: 'تنبيه',
    purchase: 'توريد',
    success: 'نجاح',
    info: 'معلومة'
  }
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

// Utility: Get Type Class
const getTypeClass = (type) => {
  const classMap = {
    alert: 'bg-red-100 text-red-800',
    purchase: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-gray-100 text-gray-800'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800'
}

// Utility: Format Date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 7) return `منذ ${days} يوم`

  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Utility: Get Notification Icon
const getNotificationIcon = (type) => {
  const iconMap = {
    alert: '⚠️',
    purchase: '📦',
    success: '✅',
    info: 'ℹ️'
  }
  return iconMap[type] || '🔔'
}

// Utility: Get Notification Icon BG
const getNotificationIconBg = (type) => {
  const bgMap = {
    alert: 'bg-red-100',
    purchase: 'bg-blue-100',
    success: 'bg-green-100',
    info: 'bg-gray-100'
  }
  return bgMap[type] || 'bg-gray-100'
}

// Get current user
const getCurrentUser = async () => {
  try {
    const userInfo = await getCurrentUserInfoApi()
    if (userInfo) {
      return userInfo.user
    }
    return null
  } catch (err) {
    console.error('Error getting current user:', err)
    return null
  }
}

// Lifecycle hook
onMounted(async () => {
  currentUser.value = await getCurrentUser()
  if (currentUser.value) {
    await fetchNotifications()
  } else {
    error.value = 'لم يتم العثور على بيانات المستخدم'
  }
})

</script>

<style scoped>
/* Smooth transitions */
.transition {
  transition: all 0.2s ease;
}

/* Line clamp for preview text */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Scrollbar styling */
main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: #f3f4f6;
}

main::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
