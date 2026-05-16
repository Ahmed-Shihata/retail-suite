<template>

    <div class="w-full flex min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Clock class="w-8 h-8 text-indigo-600" />
               <h1 class="text-lg font-bold text-gray-900">
                Shift Schedule Management
              </h1>
            </div>
            <button
              @click="openAddModal"
              class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus class="w-5 h-5" />
              Add New Shift
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
          <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-wrap gap-6">

          <div class="month-selector flex items-center gap-4">
            <button @click="prevMonth" class="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md text-gray-500 text-base hover:bg-gray-200 hover:text-gray-700 transition">
              ◀
            </button>

            <span class="month-display font-semibold text-gray-800 text-base min-w-[200px] text-center">
              {{ monthLabel }}
            </span>

            <button @click="nextMonth" class="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md text-gray-500 text-base hover:bg-gray-200 hover:text-gray-700 transition">
              ▶
            </button>
          </div>


            <div class="week-selector" v-if="viewMode === 'week'">
              <button @click="prevWeek" class="btn-nav">◀</button>
              <button
                v-for="(week, index) in monthWeeks"
                :key="index"
                @click="currentWeekIndex = index"
                :class="['week-btn', { active: currentWeekIndex === index }]"
              >
                {{weekLabel(index)}}  {{ week.start }} - {{ week.end }}
              </button>

              <button @click="nextWeek" class="btn-nav">▶</button>
            </div>

            <div class="view-options">
              <button
                v-for="view in ['table', 'week', 'month']"
                :key="view"
                @click="viewMode = view"
                :class="['view-btn', { active: viewMode === view }]"
              >
                {{ view === 'table' ? 'جدول' : view === 'week' ? 'أسبوع' : 'شهر' }}
              </button>
            </div>

          </div>
        </section>

        {{ viewMode }}
        <!-- Shifts Table -->
        <section v-if="viewMode === 'table'" class="flex-1 px-6 pb-6">
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
        <!-- Calendar Weekly View -->

        <!-- Calendar Monthly View -->
        <section v-else class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <!-- Calendar Monthly Navigation -->
            <div v-if="viewMode === 'month'" class="flex justify-between items-center mb-6">
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
            <!-- Calendar Weekly Navigation -->
            <div v-else="viewMode === 'week'" class="flex justify-between items-center mb-6">
              <button
                @click="prevWeek"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                ←
              </button>
              <h2 class="text-xl font-bold text-gray-900">
            {{ weekLabel(currentWeekIndex) }}
             - {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button
                @click="nextWeek"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                →
              </button>
            </div>
            <!--  عرض الشهر   -->
            <div v-if="viewMode === 'month'" class="calendar-month">
              <div class="month-grid">
                <!-- Day Headers -->
                <div
                  v-for="dayName in ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']"
                  :key="dayName"
                  class="month-day-header"
                >
                  {{ dayName }}
                </div>

                <div
                  v-for="day in monthDays"
                  :key="day"
                  :class="['month-day', { 'other-month': !isCurrentMonth(day.date) }]"
                >
                  <div class="day-number">{{ day.day }} </div>
                  <div class="shifts-list">
                    <div
                      v-for="shift in getShiftsForDay(day.date)"
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

            <!-- عرض الأسبوع -->
            <div v-if="viewMode === 'week'" class="calendar-week">
              <div class="week-grid">

                  <div
                    v-for="dayName in ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']"
                    :key="dayName"
                    class="week-day-header"
                  >
                    {{ dayName }}
                  </div>
                  <div
                      v-for="n in getFirstDayOffset()"
                      :key="`empty-${n}`"
                      class="month-day empty-cell"
                    >
                  </div>
                  <div
                    v-for="day in currentWeek.weekDays"
                    :key="day"
                    :class="['month-day', { 'other-month': !isCurrentMonth(new Date(currentWeek.year, currentWeek.month)) }]"
                  >
                    <div class="day-number">{{ day }}</div>

                    <div class="shifts-list">
                      <div
                        v-for="shift in getShiftsForDay(new Date(currentWeek.year, currentWeek.month, day))"
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
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
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
    const currentDate = ref(new Date())
    const currentWeekIndex = ref(0)
    const monthNames = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ]

    const monthLabel = computed(() => {
      return `${monthNames[currentMonth.value]} ${currentYear.value}`
    })

    // 2- Weeks Calculation
    //  get weeks days filter depend on monthweeks []


const monthWeeks = computed(() => generateWeeks(currentYear.value,currentMonth.value))

const generateWeeks = (year, month) => {
    const weeks = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // عدد أيام الشهر
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // يوم بداية الشهر (0 = الأحد)

    // تحويل إلى نظام الأسبوع العربي (0 = الاثنين)
  //   let startDay = (firstDayOfMonth + 6) % 7;
    let startDay = firstDayOfMonth
    let dayCounter = 1;

    // إذا لم يبدأ من الاثنين، نملأ الأيام السابقة من الشهر السابق
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      const weekDaysLabels = [];
      const dayObjects = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        // في الأسبوع الأول، نبدأ من اليوم الأول للشهر
        if (week === 0 && dayOfWeek < startDay) {
          // تخطي الأيام قبل بداية الشهر
          continue;
        }

        if (dayCounter > daysInMonth) {
          break;
        }

        const date = new Date(year, month, dayCounter);
        weekDays.push(dayCounter);
        weekDaysLabels.push(
          date.toLocaleDateString("ar-EG", { weekday: "long" })
        );
        dayObjects.push(date);
        dayCounter++;
      }

      if (weekDays.length > 0) {
        weeks.push({
          month,
          year,
          start: weekDays[0],
          end: weekDays[weekDays.length - 1],
          label: weekLabel(weeks.length),
          weekDays,
          weekDaysLabels
        });
      }

      if (dayCounter > daysInMonth) break;
    }

    return weeks;
  };

const weekLabel = (weekIndex) => {
  const names = [
    "الأسبوع الأول",
    "الأسبوع الثاني",
    "الأسبوع الثالث",
    "الأسبوع الرابع",
    "الأسبوع الخامس",
    "الأسبوع السادس"
  ];
  return names[weekIndex] || "";
};

const currentWeekDays = computed(() => {
  const week = monthWeeks.value[currentWeekIndex.value]
  if (!week) return []
  return week
})

const currentWeek = computed(() => {
  return monthWeeks.value[currentWeekIndex.value] || monthWeeks.value[0]
})

const getFirstDayOffset = () => {
  if (!currentWeek.value || !currentWeek.value.weekDaysLabels) return 0

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const firstDayLabel = currentWeek.value.weekDaysLabels[0]
  const firstDayIndex = dayNames.indexOf(firstDayLabel)

  return firstDayIndex
}
    const isCurrentWeek = (date) => {
      const weekStart = new Date(currentYear.value, currentMonth.value, currentWeek.value.start)
      const weekEnd = new Date(currentYear.value, currentMonth.value, currentWeek.value.end)
      return date >= weekStart && date <= weekEnd
    }
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

    //1-  Month Days Calculation
    const monthDays = computed(() => {
      const y = currentYear.value
      const m = currentMonth.value

      const firstDay = new Date(y, m, 1)
      const startingDayOfWeek = firstDay.getDay()
      const daysInMonth = new Date(y, m + 1, 0).getDate()

      const days = []

      // الأيام السابقة
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(y, m, 1)
        d.setDate(d.getDate() - (i + 1))
        days.push(makeMonthDay(new Date(d), m))
      }

      // أيام الشهر الحالي
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(y, m, i)
        days.push(makeMonthDay(d, m))
      }

      // الأيام التالية
      const remaining = 42 - days.length
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(y, m + 1, i)
        days.push(makeMonthDay(d, m))
      }

      return days
    })

    function makeMonthDay(date, currentMonth) {
      return {
        date,                           // الـ Date نفسه
        day: date.getDate(),            // رقم اليوم
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: date.getMonth() === currentMonth
      };
    }

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
    const prevWeek = () => {
      if (currentWeekIndex.value > 0) {
        currentWeekIndex.value--
      } else {
        // اختياري: لو عايز ترجع للشهر السابق
        prevMonth()
        currentWeekIndex.value = monthWeeks.value.length - 1
      }
    }

    const nextWeek = () => {
      if (currentWeekIndex.value < monthWeeks.value.length - 1) {
        currentWeekIndex.value++
      } else {
        // اختياري: لو عايز تروح للشهر التالي
        nextMonth()
        currentWeekIndex.value = 0
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
<style scoped>

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

  .month-grid, .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #e5e7eb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .month-day-header, .week-day-header {
    background-color: #f3f4f6;
    padding: 1rem;
    font-weight: 600;
    text-align: center;
    color: #4b5563;
    font-size: 0.875rem;
  }

  .month-day, .week-day {
    background-color: white;
    padding: 0.75rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: background-color 0.2s;
  }

  .month-day:hover, .week-day:hover {
    background-color: #f9fafb;
  }

  .month-day.other-month, .week-day.other-week {
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

  /* -==== */

.calendar-week {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9f9f9;
  border-bottom: 2px solid #eee;
}

.date {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 300px;
}

.day-column {
  padding: 10px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shift-card {
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.shift-morning { background: #e3f2fd; color: #1976d2; }
.shift-evening { background: #fff3e0; color: #f57c00; }
.shift-night { background: #f3e5f5; color: #7b1fa2; }

.shift-card:hover { transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.shift-time {
  font-weight: 600;
  margin-bottom: 4px;
}

.shift-employee {
  font-size: 11px;
}

.shift-type {
  font-size: 10px;
  margin-top: 4px;
}

/* ============================ */
.week-btn {
  padding: 0.5rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.week-btn.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}
.empty-cell {
  background-color: #f9fafb;
  opacity: 0;
  pointer-events: none;
}
</style>
