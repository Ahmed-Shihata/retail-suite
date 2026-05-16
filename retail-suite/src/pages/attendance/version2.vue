<template>

    <div class="w-full flex min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Clock class="w-8 h-8 text-indigo-600" />
              <h1 class="text-2xl font-bold text-gray-900">إدارة جداول الورديات</h1>
            </div>
            <button
              @click="openAddModal"
              class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus class="w-5 h-5" />
              إضافة وردية جديدة
            </button>
          </div>
        </header>

        <!-- Stats Section -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="إجمالي الورديات"
              :value="shifts.length"
              icon="Briefcase"
              color="blue"
            />
            <StatsCard
              title="الموظفون المجدولون"
              :value="totalEmployeesScheduled"
              icon="Users"
              color="green"
            />
            <StatsCard
              title="الورديات النشطة"
              :value="activeShifts"
              icon="CheckCircle"
              color="cyan"
            />
            <StatsCard
              title="متوسط ساعات الوردية"
              :value="averageHours.toFixed(1)"
              icon="Clock"
              color="purple"
            />
          </div>
        </section>

        <!-- Filters Section -->
        <section class="flex-shrink-0 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">بحث عن موظف</label>
                <input
                  v-model="searchEmployee"
                  type="text"
                  placeholder="ابحث باسم الموظف..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">نوع الوردية</label>
                <select
                  v-model="filterShiftType"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">الكل</option>
                  <option value="صباحي">صباحي</option>
                  <option value="مسائي">مسائي</option>
                  <option value="ليلي">ليلي</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  v-model="filterDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Controls -->
        <section class="flex-shrink-0 px-6 pb-4">
          <div class="controls">
            <div class="month-selector">
              <button @click="previousMonth" class="btn-nav">◀</button>
              <span class="month-display">{{ monthLabel }}</span>
              <button @click="nextMonth" class="btn-nav">▶</button>
            </div>
            <div class="view-options">
              <button
                v-for="view in ['week', 'month']"
                :key="view"
                @click="viewMode = view"
                :class="['view-btn', { active: viewMode === view }]"
              >
                {{ view === 'week' ? 'أسبوع' : 'شهر' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Calendar Views -->
        <section class="flex-1 px-6 pb-6">
          <!-- عرض الأسبوع -->
          <div v-if="viewMode === 'week'" class="calendar-week">
            <div class="week-header">
              <div v-for="day in weekDays" :key="day.toISOString()" class="day-header">
                {{ getDayName(day) }}
                <span class="date">{{ formatDate(day) }}</span>
              </div>
            </div>
            <div class="week-body">
              <div v-for="day in weekDays" :key="day.toISOString()" class="day-column">
                <div
                  v-for="shift in getShiftsForDay(day)"
                  :key="shift.id"
                  :class="['shift-card', `shift-${shift.shiftType.toLowerCase()}`]"
                  @click="editShift(shift)"
                >
                  <div class="shift-time">{{ shift.startTime }} - {{ shift.endTime }}</div>
                  <div class="shift-employee">{{ shift.employeeName }}</div>
                  <div class="shift-type">{{ shift.shiftType }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- عرض الشهر -->
          <div v-else class="calendar-month">
            <div class="month-grid">
              <div class="month-day-header" v-for="dayName in ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']" :key="dayName">
                {{ dayName }}
              </div>
              <div
                v-for="day in monthDays"
                :key="day.toISOString()"
                :class="['month-day', { 'other-month': !isCurrentMonth(day) }]"
              >
                <div class="day-number">{{ day.getDate() }}</div>
                <div class="shifts-list">
                  <div
                    v-for="shift in getShiftsForDay(day)"
                    :key="shift.id"
                    :class="['mini-shift', `shift-${shift.shiftType.toLowerCase()}`]"
                    @click="editShift(shift)"
                  >
                    {{ shift.employeeName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Old Table View - Hidden -->
        <section v-show="false" class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">الموظف</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">نوع الوردية</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوقت</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">الساعات</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    <th class="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="shift in filteredShifts" :key="shift.id" class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ shift.employeeName }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getShiftTypeColor(shift.shiftType)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ shift.shiftType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(shift.date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ shift.startTime }} - {{ shift.endTime }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ shift.hours }} ساعة</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getStatusColor(shift.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ shift.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm flex gap-2">
                      <button
                        @click="editShift(shift)"
                        class="text-indigo-600 hover:text-indigo-800 transition"
                        title="تعديل"
                      >
                        <Edit3 class="w-4 h-4" />
                      </button>
                      <button
                        @click="deleteShift(shift.id)"
                        class="text-red-600 hover:text-red-800 transition"
                        title="حذف"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="filteredShifts.length === 0" class="px-6 py-8 text-center text-gray-500">
              لا توجد ورديات مطابقة للبحث
            </div>
          </div>
        </section>

        <!-- Calendar View -->
        <section v-else class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <!-- Calendar Navigation -->
            <div class="flex justify-between items-center mb-6">
              <button
                @click="prevMonth"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                ←
              </button>
              <h2 class="text-xl font-bold text-gray-900">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button
                @click="nextMonth"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                →
              </button>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-month">
              <div class="month-grid">
                <!-- Day Headers -->
                <div
                  v-for="dayName in ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']"
                  :key="dayName"
                  class="month-day-header"
                >
                  {{ dayName }}
                </div>

                <!-- Calendar Days -->
                <div
                  v-for="day in monthDays"
                  :key="day.toISOString()"
                  :class="['month-day', { 'other-month': !isCurrentMonth(day) }]"
                >
                  <div class="day-number">{{ day.getDate() }}</div>
                  <div class="shifts-list">
                    <div
                      v-for="shift in getShiftsForDay(day)"
                      :key="shift.id"
                      :class="['mini-shift', `shift-${shift.shiftType.toLowerCase()}`]"
                      @click="editShift(shift)"
                    >
                      {{ shift.employeeName }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>


    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          {{ isEditing ? 'تعديل الوردية' : 'إضافة وردية جديدة' }}
        </h2>

        <form @submit.prevent="saveShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">الموظف</label>
            <select
              v-model="formData.employeeName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">اختر موظفاً</option>
              <option>أحمد محمد</option>
              <option>فاطمة علي</option>
              <option>محمود حسن</option>
              <option>نور الدين</option>
              <option>ليلى سالم</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">نوع الوردية</label>
            <select
              v-model="formData.shiftType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">اختر نوع الوردية</option>
              <option value="صباحي">صباحي (6AM - 2PM)</option>
              <option value="مسائي">مسائي (2PM - 10PM)</option>
              <option value="ليلي">ليلي (10PM - 6AM)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
            <input
              v-model="formData.date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">وقت البداية</label>
              <input
                v-model="formData.startTime"
                type="time"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">وقت النهاية</label>
              <input
                v-model="formData.endTime"
                type="time"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              v-model="formData.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="مجدولة">مجدولة</option>
              <option value="مكتملة">مكتملة</option>
              <option value="ملغاة">ملغاة</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {{ isEditing ? 'تحديث' : 'إضافة' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

import StatsCard from '@/layout/StatsCard.vue'
import {
  Clock,
  Plus,
  Edit3,
  Trash2,
  Briefcase,
  Users,
  CheckCircle
} from 'lucide-vue-next'

    const shifts = ref([])
    const showModal = ref(false)
    const isEditing = ref(false)
    const editingId = ref(null)
    const searchEmployee = ref('')
    const filterShiftType = ref('')
    const filterDate = ref('')
    const viewMode = ref('table')
    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())

    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
  const monthLabel = computed(() => {
      return `${monthNames[currentMonth.value]} ${currentYear.value}`
    })


  const weekDays = computed(() => {
      const today = new Date(currentYear.value, currentMonth.value, 1)
      const firstDay = new Date(today)
      firstDay.setDate(today.getDate() - today.getDay() + 6)

      const days = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(firstDay)
        day.setDate(firstDay.getDate() + i)
        days.push(day)
      }
      return days
    })

  const getDayName = (date) => {
      const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      return dayNames[date.getDay()]
    }
    const formData = reactive({
      employeeName: '',
      shiftType: '',
      date: '',
      startTime: '',
      endTime: '',
      status: 'مجدولة'
    })

    const resetForm = () => {
      formData.employeeName = ''
      formData.shiftType = ''
      formData.date = ''
      formData.startTime = ''
      formData.endTime = ''
      formData.status = 'مجدولة'
    }

    const openAddModal = () => {
      isEditing.value = false
      editingId.value = null
      resetForm()
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const calculateHours = (startTime, endTime) => {
      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      let diff = (end - start) / (1000 * 60 * 60)
      if (diff < 0) diff += 24
      return parseFloat(diff.toFixed(2))
    }

    const saveShift = () => {
      const hours = calculateHours(formData.startTime, formData.endTime)
      const newShift = {
        id: isEditing.value ? editingId.value : Date.now(),
        ...formData,
        hours
      }

      if (isEditing.value) {
        const index = shifts.value.findIndex(s => s.id === editingId.value)
        shifts.value[index] = newShift
      } else {
        shifts.value.push(newShift)
      }

      closeModal()
    }

    const editShift = (shift) => {
      isEditing.value = true
      editingId.value = shift.id
      formData.employeeName = shift.employeeName
      formData.shiftType = shift.shiftType
      formData.date = shift.date
      formData.startTime = shift.startTime
      formData.endTime = shift.endTime
      formData.status = shift.status
      showModal.value = true
    }

    const deleteShift = (id) => {
      if (confirm('هل أنت متأكد من حذف هذه الوردية؟')) {
        shifts.value = shifts.value.filter(s => s.id !== id)
      }
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ar-SA')
    }

    const getShiftTypeColor = (type) => {
      const colors = {
        'صباحي': 'bg-yellow-100 text-yellow-800',
        'مسائي': 'bg-orange-100 text-orange-800',
        'ليلي': 'bg-indigo-100 text-indigo-800'
      }
      return colors[type] || 'bg-gray-100 text-gray-800'
    }

    const getStatusColor = (status) => {
      const colors = {
        'مجدولة': 'bg-blue-100 text-blue-800',
        'مكتملة': 'bg-green-100 text-green-800',
        'ملغاة': 'bg-red-100 text-red-800'
      }
      return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const filteredShifts = computed(() => {
      return shifts.value.filter(shift => {
        const matchEmployee = shift.employeeName.includes(searchEmployee.value)
        const matchType = !filterShiftType.value || shift.shiftType === filterShiftType.value
        const matchDate = !filterDate.value || shift.date === filterDate.value
        return matchEmployee && matchType && matchDate
      })
    })

    const totalEmployeesScheduled = computed(() => {
      return new Set(shifts.value.map(s => s.employeeName)).size
    })

    const activeShifts = computed(() => {
      return shifts.value.filter(s => s.status === 'مجدولة').length
    })

    const averageHours = computed(() => {
      if (shifts.value.length === 0) return 0
      const total = shifts.value.reduce((sum, s) => sum + s.hours, 0)
      return total / shifts.value.length
    })

    const monthDays = computed(() => {
      const firstDay = new Date(currentYear.value, currentMonth.value, 1)
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()

      const days = []

      // Add previous month days
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = new Date(firstDay)
        day.setDate(day.getDate() - i - 1)
        days.push(day)
      }

      // Add current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentYear.value, currentMonth.value, i))
      }

      // Add next month days to fill grid
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(currentYear.value, currentMonth.value + 1, i))
      }

      return days
    })

    const isCurrentMonth = (date) => {
      return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
    }

    const getShiftsForDay = (day) => {
      const dayStr = day.toISOString().split('T')[0]
      return shifts.value.filter(shift => shift.date === dayStr)
    }

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    onMounted(() => {
      // تحميل البيانات من قاعدة البيانات
      shifts.value = [
        {
          id: 1,
          employeeName: 'أحمد محمد',
          shiftType: 'صباحي',
          date: '2025-01-01',
          startTime: '06:00',
          endTime: '14:00',
          hours: 8,
          status: 'مكتملة'
        },
        {
          id: 2,
          employeeName: 'فاطمة علي',
          shiftType: 'مسائي',
          date: '2025-01-01',
          startTime: '14:00',
          endTime: '22:00',
          hours: 8,
          status: 'مجدولة'
        }
      ]
    })
</script>
<!-- Calendar Styles -->
<style scoped>
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .month-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-nav {
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    color: #6b7280;
  }

  .btn-nav:hover {
    background-color: #e5e7eb;
    color: #374151;
  }

  .month-display {
    font-weight: 600;
    color: #1f2937;
    min-width: 200px;
    text-align: center;
    font-size: 1rem;
  }

  .view-options {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    color: #6b7280;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .view-btn:hover {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .view-btn.active {
    background-color: #4f46e5;
    color: white;
    border-color: #4f46e5;
  }

  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      gap: 1rem;
    }

    .month-selector {
      width: 100%;
      justify-content: center;
    }

    .month-display {
      min-width: auto;
    }

    .view-options {
      width: 100%;
      justify-content: center;
    }
  }


  .month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #e5e7eb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .month-day-header {
    background-color: #f3f4f6;
    padding: 1rem;
    font-weight: 600;
    text-align: center;
    color: #4b5563;
    font-size: 0.875rem;
  }

  .month-day {
    background-color: white;
    padding: 0.75rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: background-color 0.2s;
  }

  .month-day:hover {
    background-color: #f9fafb;
  }

  .month-day.other-month {
    background-color: #f9fafb;
    opacity: 0.5;
  }

  .day-number {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .shifts-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    overflow-y: auto;
    max-height: 80px;
  }

  .mini-shift {
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.2s;
  }

  .mini-shift:hover {
    opacity: 0.8;
  }

  .shift-صباحي {
    background-color: #fef3c7;
    color: #92400e;
  }

  .shift-مسائي {
    background-color: #fed7aa;
    color: #92400e;
  }

  .shift-ليلي {
    background-color: #e0e7ff;
    color: #3730a3;
  }

  @media (max-width: 768px) {
    .month-grid {
      gap: 0;
    }

    .month-day {
      min-height: 80px;
      padding: 0.5rem;
    }

    .day-number {
      font-size: 0.75rem;
    }

    .mini-shift {
      font-size: 0.625rem;
      padding: 0.25rem 0.375rem;
    }

    .shifts-list {
      max-height: 50px;
    }
  }
</style>
