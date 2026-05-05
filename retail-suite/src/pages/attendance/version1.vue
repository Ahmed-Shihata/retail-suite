<!-- ShiftSchedule.vue -->
<template>
  <div class="shift-schedule">
    <div class="header">
      <h1>📅 جدول المناوبات</h1>
      <button @click="showAddShift = true" class="btn-add">+ إضافة مناوبة</button>
    </div>

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

    <!-- عرض الأسبوع -->
    <div v-if="viewMode === 'week'" class="calendar-week">
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="day-header">
          {{ getDayName(day) }}
          <span class="date">{{ formatDate(day) }}</span>
        </div>
      </div>

      <div class="week-body">
        <div v-for="day in weekDays" :key="day" class="day-column">
          <div
            v-for="shift in getShiftsForDay(day)"
            :key="shift.id"
            :class="['shift-card', `shift-${shift.type}`]"
            @click="editShift(shift)"
          >
            <div class="shift-time">{{ shift.startTime }} - {{ shift.endTime }}</div>
            <div class="shift-employee">{{ shift.employeeName }}</div>
            <div class="shift-type">{{ getShiftTypeLabel(shift.type) }}</div>
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
          :key="day"
          :class="['month-day', { 'other-month': !isCurrentMonth(day) }]"
        >
          <div class="day-number">{{ day.getDate() }}</div>
          <div class="shifts-list">
            <div
              v-for="shift in getShiftsForDay(day)"
              :key="shift.id"
              :class="['mini-shift', `shift-${shift.type}`]"
              @click="editShift(shift)"
            >
              {{ shift.employeeName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- إحصائيات -->
    <div class="statistics">
      <div class="stat-card">
        <h3>إجمالي المناوبات</h3>
        <p class="stat-value">{{ shifts.length }}</p>
      </div>
      <div class="stat-card">
        <h3>الموظفون النشطون</h3>
        <p class="stat-value">{{ activeEmployees }}</p>
      </div>
      <div class="stat-card">
        <h3>المناوبات هذا الأسبوع</h3>
        <p class="stat-value">{{ shiftsThisWeek }}</p>
      </div>
    </div>

    <!-- نموذج إضافة/تعديل مناوبة -->
    <div v-if="showAddShift" class="modal-overlay" @click.self="showAddShift = false">
      <div class="modal">
        <h2>{{ editingShift ? 'تعديل المناوبة' : 'إضافة مناوبة جديدة' }}</h2>
        <form @submit.prevent="submitShift">
          <label>الموظف</label>
          <select v-model="formData.employeeId" required>
            <option value="">اختر موظفاً</option>
            <option value="1">أحمد محمد</option>
            <option value="2">فاطمة علي</option>
            <option value="3">محمود سالم</option>
            <option value="4">سارة حسن</option>
          </select>

          <label>التاريخ</label>
          <input v-model="formData.date" type="date" required>

          <label>الوقت</label>
          <select v-model="formData.type" required>
            <option value="">اختر نوع المناوبة</option>
            <option value="morning">صباحية (08:00 - 16:00)</option>
            <option value="evening">مسائية (16:00 - 00:00)</option>
            <option value="night">ليلية (00:00 - 08:00)</option>
            <option value="custom">مخصصة</option>
          </select>

          <div v-if="formData.type === 'custom'">
            <label>من الساعة</label>
            <input v-model="formData.startTime" type="time" required>

            <label>إلى الساعة</label>
            <input v-model="formData.endTime" type="time" required>
          </div>

          <label>ملاحظات</label>
          <textarea v-model="formData.notes" rows="2"></textarea>

          <div class="modal-buttons">
            <button type="submit" class="btn-primary">{{ editingShift ? 'حفظ التعديلات' : 'إضافة' }}</button>
            <button v-if="editingShift" type="button" @click="deleteShift" class="btn-danger">حذف</button>
            <button type="button" @click="closeModal" class="btn-secondary">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const viewMode = ref('month')
const showAddShift = ref(false)
const editingShift = ref(null)
const currentDate = ref(new Date())

const formData = ref({
  employeeId: '',
  date: '',
  type: '',
  startTime: '',
  endTime: '',
  notes: ''
})

const shifts = ref([
  { id: 1, employeeId: '1', employeeName: 'أحمد محمد', date: '2025-01-25', startTime: '08:00', endTime: '16:00', type: 'morning' },
  { id: 2, employeeId: '2', employeeName: 'فاطمة علي', date: '2025-01-25', startTime: '16:00', endTime: '00:00', type: 'evening' },
  { id: 3, employeeId: '3', employeeName: 'محمود سالم', date: '2025-01-26', startTime: '08:00', endTime: '16:00', type: 'morning' },
  { id: 4, employeeId: '4', employeeName: 'سارة حسن', date: '2025-01-27', startTime: '00:00', endTime: '08:00', type: 'night' },
])

const monthLabel = computed(() => {
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const weekDays = computed(() => {
  const days = []
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - d.getDay())
  for (let i = 0; i < 7; i++) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
})

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  for (let i = 0; i < 42; i++) {
    days.push(new Date(startDate))
    startDate.setDate(startDate.getDate() + 1)
  }
  return days
})

const activeEmployees = computed(() => {
  return new Set(shifts.value.map(s => s.employeeId)).size
})

const shiftsThisWeek = computed(() => {
  const start = weekDays.value[0].toISOString().split('T')[0]
  const end = weekDays.value[6].toISOString().split('T')[0]
  return shifts.value.filter(s => s.date >= start && s.date <= end).length
})

const getDayName = (date) => {
  const names = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
  return names[date.getDay()]
}

const formatDate = (date) => {
  return date.toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit' })
}

const isCurrentMonth = (date) => {
  return date.getMonth() === currentDate.value.getMonth()
}

const getShiftTypeLabel = (type) => {
  const labels = { morning: 'صباحية', evening: 'مسائية', night: 'ليلية' }
  return labels[type] || type
}

const getShiftsForDay = (day) => {
  const dateStr = day.toISOString().split('T')[0]
  return shifts.value.filter(s => s.date === dateStr)
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const editShift = (shift) => {
  editingShift.value = shift
  formData.value = {
    employeeId: shift.employeeId,
    date: shift.date,
    type: shift.type,
    startTime: shift.startTime,
    endTime: shift.endTime,
    notes: shift.notes || ''
  }
  showAddShift.value = true
}

const submitShift = () => {
  const employees = { '1': 'أحمد محمد', '2': 'فاطمة علي', '3': 'محمود سالم', '4': 'سارة حسن' }

  let startTime = formData.value.startTime
  let endTime = formData.value.endTime

  if (formData.value.type !== 'custom') {
    const times = { morning: ['08:00', '16:00'], evening: ['16:00', '00:00'], night: ['00:00', '08:00'] }
    ;[startTime, endTime] = times[formData.value.type]
  }

  if (editingShift.value) {
    const shift = shifts.value.find(s => s.id === editingShift.value.id)
    if (shift) {
      Object.assign(shift, {
        employeeId: formData.value.employeeId,
        employeeName: employees[formData.value.employeeId],
        date: formData.value.date,
        startTime,
        endTime,
        type: formData.value.type
      })
    }
  } else {
    shifts.value.push({
      id: Math.max(...shifts.value.map(s => s.id), 0) + 1,
      employeeId: formData.value.employeeId,
      employeeName: employees[formData.value.employeeId],
      date: formData.value.date,
      startTime,
      endTime,
      type: formData.value.type
    })
  }

  closeModal()
}

const deleteShift = () => {
  if (confirm('هل تريد حذف هذه المناوبة؟')) {
    shifts.value = shifts.value.filter(s => s.id !== editingShift.value.id)
    closeModal()
  }
}

const closeModal = () => {
  showAddShift.value = false
  editingShift.value = null
  formData.value = { employeeId: '', date: '', type: '', startTime: '', endTime: '', notes: '' }
}
</script>

<style scoped>
.shift-schedule {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.btn-add {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #218838;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-nav {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-nav:hover {
  background: #f0f0f0;
}

.month-display {
  font-weight: 600;
  min-width: 150px;
  text-align: center;
  color: #333;
}

.view-options {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

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

.day-header {
  padding: 15px;
  text-align: center;
  font-weight: 600;
  color: #333;
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

.calendar-month {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.month-day-header {
  font-weight: 600;
  text-align: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.month-day {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  min-height: 80px;
  background: white;
}

.month-day.other-month {
  background: #fafafa;
  opacity: 0.5;
}

.day-number {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.shifts-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-shift {
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1976d2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
}

.modal h2 {
  margin-bottom: 20px;
  color: #333;
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal label {
  font-weight: 600;
  color: #555;
}

.modal input, .modal select, .modal textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-danger {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.btn-danger:hover {
  background: #c62828;
}
</style>
