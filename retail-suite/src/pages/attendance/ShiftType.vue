<template>

    <div>
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-xl shadow-sm border-b transition"
          :style="{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)'
          }"
        >
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button
                @click="goBack"
                class="p-2 rounded-lg transition"
                :style="{ color: 'var(--text-main)' }"
              >
                <ArrowLeft class="w-6 h-6" />
              </button>
              <div>
                <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Shift Management</h1>
                <p class="text-sm" :style="{ color: 'var(--text-sub)' }">{{ shifts.length }} Registered Shifts</p>
              </div>
            </div>
            <button
              @click="openCreateModal"
              class="px-4 py-2 text-white rounded-lg transition flex items-center gap-2 text-sm font-semibold"
                :style="{
                  background: 'var(--btn-primary)',
                  border: '1px solid var(--btn-primary-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--btn-primary-hover)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--btn-primary)'"
            >
              <Plus class="w-5 h-5" />
              New Shift
            </button>
          </div>
        </header>

        <!-- Statistics Cards -->
        <section class="px-6 py-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Shifts"
              :value="shifts.length"
              subtitle="All registered shifts"
              icon="Clock"
              color="blue"
            />

            <StatsCard
              title="Active Shifts"
              :value="activeShifts"
              subtitle="Currently active"
              icon="CheckCircle"
              color="green"
            />

            <StatsCard
              title="Auto Attendance Shifts"
              :value="autoAttendanceShifts"
              subtitle="Attendance enabled"
              icon="Activity"
              color="purple"
            />

            <StatsCard
              title="Disabled Shifts"
              :value="disabledShifts"
              subtitle="Inactive shifts"
              icon="Slash"
              color="orange"
            />
          </div>
        </section>

        <!-- Filters Section -->
        <section class="px-6 py-6">
          <div
            class="rounded-xl shadow-sm border p-6 transition"
            :style="{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by shift name..."
                  class="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--input-border)',
                    placeholderColor: 'var(--text-sub)'
                  }"
                />
                <span
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                <Search class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </span>
              </div>

              <!-- Sort -->
              <select
                v-model="sortBy"
                class="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--input-border)'
                }"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
              </select>

              <!-- Status Filter -->
              <select
                v-model="statusFilter"
                class="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--input-border)'
                }"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Shifts Grid -->
        <section class="px-6 pb-6">
          <div v-if="filteredShifts.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
            v-for="shift in filteredShifts"
            :key="shift.name"
            class="rounded-xl shadow-sm transition hover:shadow-md"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
            >
              <div class="p-6">
                <!-- Shift Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h2 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">{{ shift.name }}</h2>
                    <p class="text-sm mt-1" :style="{ color: 'var(--text-sub)' }">
                      {{ formatTime(shift.period_start_date) }} - {{ formatTime(shift.period_end_time) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="editShift(shift)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 class="w-5 h-5" />
                    </button>
                    <button
                      @click="deleteShift(shift.name)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <!-- Shift Details -->
                <div class="space-y-3 mb-4">
                  <DetailItem label="Start Time" :value="formatTime(shift.period_start_time)" />
                  <DetailItem label="End Time" :value="formatTime(shift.period_end_time)" />

                  <div class="pt-3 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-600 text-sm">Auto Attendance</span>
                          <span
                            class="px-3 py-1 rounded-full text-xs font-semibold"
                            :class="shift.enable_auto_attendance ? 'text-green-800' : 'text-gray-800'"
                            :style="{
                              background: shift.enable_auto_attendance ? 'var(--icon-bg-green)' : 'var(--choice-border)'
                            }"
                          >
                        {{ shift.enable_auto_attendance ? 'Enabled' : 'Disabled' }}
                      </span>
                    </div>
                  </div>

                  <div v-if="shift.enable_auto_attendance" class="pt-3 border-t border-gray-200">
                    <DetailItem
                      label="Process Attendance After"
                      :value="formatDate(shift.process_attendance_after)"
                    />
                  </div>

                  <div v-if="shift.holiday_list" class="pt-3 border-t border-gray-200">
                    <DetailItem label="Holiday List" :value="shift.holiday_list" />
                  </div>
                </div>

                <!-- Action Buttons -->
                <div v-if="shift.enable_auto_attendance" class="mt-6 pt-4 border-t border-gray-200">
                  <button
                    @click="processAutoAttendance(shift.name)"
                    :disabled="processingShift === shift.name"
                    class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Check v-if="processingShift !== shift.name" class="w-4 h-4" />
                    <Loader v-else class="w-4 h-4 animate-spin" />
                    {{ processingShift === shift.name ? 'Processing...' : 'Process Attendance' }}
                  </button>
                </div>

                <!-- Last Sync Info -->
                <div
                  v-if="shift.last_sync_of_checkin"
                  class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500"
                >
                  Last Update: {{ formatDateTime(shift.last_sync_of_checkin) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-6 rounded-xl p-12 shadow-sm transition hover:shadow-md text-center"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <!-- Message -->
            <p class="text-lg font-medium" :style="{ color: 'var(--text-sub)' }">
              {{ message || 'No shifts available yet.' }}
            </p>

            <!-- Button -->
            <button
              @click="openCreateModal"
              class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              :style="{
                background: 'var(--btn-primary)',
                color: 'var(--btn-primary-text)',
                border: '1px solid var(--btn-primary-border)'
              }"
              @mouseover="$event.currentTarget.style.background = 'var(--btn-primary-hover)'"
              @mouseleave="$event.currentTarget.style.background = 'var(--btn-primary)'"
            >
              Create Shift Now
            </button>
          </div>
        </section>
      </main>
    </div>

    <!-- Shift Modal -->
    <ShiftModal
      v-if="showModal"
      :shift="editingShift"
      :loading="isLoading"
      :holidayLists="holidayLists"
      @save="saveShift"
      @close="closeModal"
    />

    <!-- Processing Modal -->
    <ProcessingModal
      v-if="showProcessingModal"
      :shift-name="processingShift"
      :progress="processingProgress"
      @close="showProcessingModal = false"
    />

    <!-- Toast -->
    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit2, Trash2, Check, Loader, ArrowLeft, Search} from 'lucide-vue-next'


import ShiftModal from '@/components/modals/ShiftModal.vue'
import ProcessingModal from '@/components/modals/ProcessingModal.vue'
import DetailItem from '@/components/modals/DetailItem.vue'
import StatsCard from '@/layout/StatsCard.vue'
import Toast from '@/components/modals/Toast.vue'

import { useShiftStore } from '@/stores/shift'

/* ========================
   Initialization
======================== */
const router = useRouter()
const shiftStore = useShiftStore()
const message = ref("")
/* ========================
   State - Data
======================== */
const shifts = ref([])

/* ========================
   State - UI
======================== */
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('recent')

const showModal = ref(false)
const showProcessingModal = ref(false)
const editingShift = ref(null)
const isLoading = ref(false)
const processingShift = ref(null)
const processingProgress = ref(0)

/* ========================
   State - Notifications
======================== */
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

/* ========================
   Computed - Statistics
======================== */
const activeShifts = computed(() =>
  shifts.value.filter(s => !s.disabled).length
)

const autoAttendanceShifts = computed(() =>
  shifts.value.filter(s => s.enable_auto_attendance).length
)

const disabledShifts = computed(() =>
  shifts.value.filter(s => s.disabled).length
)

/* ========================
   Computed - Filtered Data
======================== */
const filteredShifts = computed(() => {
  let filtered = shifts.value.filter(s => {
    const searchTerm = searchQuery.value.toLowerCase()
    const matchSearch = !searchQuery.value ||
      s.name.toLowerCase().includes(searchTerm)

    return matchSearch
  })

  // Apply sorting
  const sortMap = {
    name: (a, b) => a.name.localeCompare(b.name, 'ar'),
    recent: (a, b) => new Date(b.modified) - new Date(a.modified)
  }

  if (sortMap[sortBy.value]) {
    filtered.sort(sortMap[sortBy.value])
  }

  return filtered
})

/* ========================
   Methods - Data Loading
======================== */
const loadShifts = async () => {
  try {
    isLoading.value = true
    const response = await shiftStore.fetchShifts()
    console.log("e",response)
    if (response.status === 'success') {
      shifts.value = response.data
      message.value = response.message
    } else {
      showNotification('خطأ في تحميل الورديات', 'error')
    }
  } catch (error) {
    console.error('Error loading shifts:', error)
    showNotification('حدث خطأ أثناء تحميل الورديات', 'error')
  } finally {
    isLoading.value = false
  }
}

/* ========================
   Methods - CRUD Operations
======================== */
const openCreateModal = () => {
  editingShift.value = null
  showModal.value = true
}

const editShift = (shift) => {
  editingShift.value = { ...shift }
  showModal.value = true
}

const saveShift = async (shiftData) => {
  try {
    isLoading.value = true
    const isEditing = editingShift.value?.name
    console.log("shiftData",shiftData)
    const response = isEditing
      ? await shiftStore.updateShift(shiftData)
      : await shiftStore.createShift(shiftData)

    if (response.status === 'success') {
      await loadShifts()
      closeModal()
      showNotification(
        isEditing ? 'تم تحديث الوردية بنجاح' : 'تم إنشاء الوردية بنجاح',
        'success'
      )
    } else {
      showNotification(response.message || 'خطأ في حفظ الوردية', 'error')
    }
  } catch (error) {
    console.error('Error saving shift:', error)
    showNotification('حدث خطأ أثناء حفظ الوردية', 'error')
  } finally {
    isLoading.value = false
  }
}

const deleteShift = async (shiftName) => {
  if (!confirm('هل تريد حذف هذه الوردية؟')) return

  try {
    const response = await shiftStore.deleteShift(shiftName)

    if (response.status === 'success') {
      await loadShifts()
      showNotification('تم حذف الوردية بنجاح', 'success')
    } else {
      showNotification(response.message || 'خطأ في حذف الوردية', 'error')
    }
  } catch (error) {
    console.error('Error deleting shift:', error)
    showNotification('حدث خطأ أثناء حذف الوردية', 'error')
  }
}

/* ========================
   Methods - Auto Attendance
======================== */
const processAutoAttendance = async (shiftName) => {
  try {
    processingShift.value = shiftName
    showProcessingModal.value = true
    processingProgress.value = 0

    const response = await shiftStore.processAutoAttendance(shiftName)

    if (response.status === 'success') {
      processingProgress.value = 100
      setTimeout(() => {
        showProcessingModal.value = false
        processingShift.value = null
        showNotification('تم معالجة الحضور بنجاح', 'success')
        loadShifts()
      }, 1000)
    } else {
      showNotification(response.message || 'خطأ في معالجة الحضور', 'error')
      showProcessingModal.value = false
      processingShift.value = null
    }
  } catch (error) {
    console.error('Error processing attendance:', error)
    showNotification('حدث خطأ أثناء معالجة الحضور', 'error')
    showProcessingModal.value = false
    processingShift.value = null
  }
}

/* ========================
   Methods - Utility
======================== */
const formatTime = (time) => {
  if (!time) return '-'
  try {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  } catch {
    return time
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showNotification = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const closeModal = () => {
  showModal.value = false
  editingShift.value = null
}

const goBack = () => {
  router.back()
}

const holidayLists = ref([])
const fetchHolidayLists = async () => {
  try {
    const response = await shiftStore.loadHolidayLists()
    console.log("holidayLists aaa ress",response)
    if (response.status === 200) {
      holidayLists.value = response.data.data
    }
  } catch (err) {
    console.error('Error loading holiday lists:', err)
  }
}

/* ========================
   Lifecycle
======================== */
onMounted(async () => {
  await loadShifts()
  await fetchHolidayLists()
})
</script>

<style scoped>
/* Tailwind CSS styles */
</style>
