
<!-- CheckinList.vue -->
<template>

    <div class="w-full flex min-h-screen" :style="{ background: 'var(--item-bg)' }">
      <!-- Main Content -->
      <main class="w-full flex flex-col min-h-screen">
        <!-- Header -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
              background: 'var(--card-bg)',
              borderBottom: '1px solid var(--card-border)'
            }">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Users class="w-8 h-8 text-cyan-600" />
             <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Employee Checkin</h1>
            </div>
            <button
              @click="openAddModal"
              class="px-4 py-2 text-white rounded-lg transition flex items-center gap-2 text-sm font-semibold"
              :style="{
                background: 'var(--btn-primary)',
                border: '1px solid var(--btn-primary-border)'
              }"
              @mouseover="$event.currentTarget.style.background = 'var(--btn-primary-hover)'"
              @mouseleave="$event.currentTarget.style.background = 'var(--btn-primary)'"
            >
              <Plus class="w-5 h-5" />
              Add Checkin Record
            </button>
          </div>
        </header>

        <!-- Statistics Cards -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatsCard
              title="Total Checkins"
              :value="totalCheckins"
              subtitle="Today's records"
              icon="Clock"
              color="info"
            />

            <StatsCard
              title="Check In"
              :value="checkInCount"
              subtitle="Entry logs"
              icon="LogIn"
              color="success"
            />

            <StatsCard
              title="Check Out"
              :value="checkOutCount"
              subtitle="Exit logs"
              icon="LogOut"
              color="warning"
            />

            <StatsCard
              title="Unique Employees"
              :value="uniqueEmployees"
              subtitle="Employees today"
              icon="Users"
              color="purple"
            />

          </div>
        </section>

        <!-- Filters Section -->
        <section class="px-6 pb-6">
          <div
            class="rounded-xl shadow-sm p-6"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                v-model="filters.employee"
                type="text"
                placeholder="Search by employee name..."
                 class="px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
              <select
                v-model="filters.logType"
                class="px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }">
                <option value="">All Log Types</option>
                <option value="IN">Check In</option>
                <option value="OUT">Check Out</option>
              </select>
              <input
                v-model="filters.date"
                type="date"
                 class="px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
              <button
                @click="resetFilters"
                class="px-4 py-2 rounded-lg transition text-sm font-medium"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-sub)',
                  border: '1px solid var(--item-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </section>

        <!-- Checkins Table -->
        <section class="flex-1 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm overflow-hidden"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <!-- Table -->
            <div v-else-if="paginatedCheckins.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th
                        v-for="col in ['Employee','Date','Time','Log Type','Attendance Linked', 'Shift Name', 'Shift Name- start','Shift Name- end','AC-Start','AC-End','Device', 'AUTO Attendance','Actions']"
                        :key="col"
                        class="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap"
                        :class="['Log Type','Attendance Linked','Actions'].includes(col) ? 'text-center' : ''"
                        :style="{
                            color: 'var(--text-sub)',
                            borderBottom: '1px solid var(--card-border)'
                          }"
                      >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="record in paginatedCheckins"
                    :key="record.name"
                    class="transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          :style="{ background: 'var(--info-bg)' }">
                          <User class="w-5 h-5 text-blue-600" :style="{ color: 'var(--focus-ring)' }"/>
                        </div>
                       <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">{{ record.employee_name }}</p>
                       <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ record.employee }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(record.time) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatTime(record.time) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">
                      <span :class="getLogTypeBadgeClass(record.log_type)" class="text-xs font-medium px-3 py-1 rounded-full">
                        {{ record.log_type === 'IN' ? 'Check In' : 'Check Out' }}
                      </span>
                    </td>
                    <!-- Attendance Linked  -->
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">
                      <span v-if="record.attendance" class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        ✓ {{ record.attendance }}
                      </span>
                      <span v-else class="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        Not linked
                      </span>
                    </td>

                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {{ record.shift }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {{ record.shift_start }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {{ record.shift_end }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                         {{ record.shift_actual_start }}
                      </span>
                    </td>

                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1  bg-green-100 text-green-700">
                         {{ record.shift_actual_end }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {{ record.device_id }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {{ record.skip_auto_attendance }}
                      </span>
                    </td>
                    <!-- Actions -->
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <!-- Edit  Action -->
                        <button
                          @click="editRecord(record)"
                          :disable="Loading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
                          :style="{ color: 'var(--focus-ring)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Edit"
                        ><Edit2 class="w-5 h-5" /></button>
                        <!-- Delete  Action -->
                        <button
                          @click="deleteRecord(record.name)"
                          :disable="Loading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
                          :style="{ color: 'var(--warning-border)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Reject"
                        ><Trash2 class="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center py-12">
              <Clock class="w-16 h-16 text-gray-300 mb-4" />
              <p class="text-gray-500 text-lg">No checkin records found</p>
              <p class="text-gray-400 text-sm">Try adjusting your filters or add a new record</p>
            </div>
          </div>
        </section>

        <!-- Pagination -->
        <section v-if="filteredCheckins.length > 0" class="px-6 pb-6">
          <div class="flex items-center justify-between">
             <p class="text-sm" :style="{ color: 'var(--text-sub)' }">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredCheckins.length }} records
            </p>
            <div class="flex gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                 class="px-3 py-2 rounded-lg transition"
                :style="{
                  border: '1px solid var(--input-border)',
                  background: currentPage === 1 ? 'var(--card-bg)' : 'var(--input-bg)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)'
                }"
              >
                Previous
              </button>
              <span class="px-3 py-2 text-sm" :style="{ color: 'var(--text-sub)' }">Page {{ currentPage }} of {{ totalPages }}</span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-lg transition"
                :style="{
                  border: '1px solid var(--input-border)',
                  background: currentPage === totalPages ? 'var(--card-bg)' : 'var(--input-bg)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)'
                }"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :style="{ background: 'rgba(10,28,34,0.5)' }"
    >
      <div
        class="rounded-xl shadow-lg p-8 max-w-md w-full"
        :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">
            {{ editingRecord ? 'Edit Checkin' : 'Add Checkin Record' }}
          </h2>
          <button @click="closeModal" :style="{ color: 'var(--text-sub)' }" class="hover:opacity-80 transition">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveRecord" class="space-y-4">
          <!-- Employee Input -->
          <div>
            <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Employee</label>
            <div class="relative">
              <input
                v-model="formData.employeeSearch"
                @input="searchEmployees"
                @focus="showEmployeeDropdown = true"
                @blur="hideEmployeeDropdown"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  caretColor: 'var(--focus-ring)'
                }"
                placeholder="Search by name, ID, or phone..."
              />

              <!-- Employee Dropdown -->
              <div
                v-if="showEmployeeDropdown && employeeSearchResults.length > 0"
                class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                :style="{ background: 'var(--card-bg)', border: '1px solid var(--input-border)' }"
              >
                <div
                  v-for="emp in employeeSearchResults"
                  :key="emp.name"
                  @click="selectEmployee(emp)"
                  class="px-4 py-3 cursor-pointer border-b last:border-b-0 transition"
                  :style="{
                    color: 'var(--text-main)',
                    borderColor: 'var(--choice-border)',
                  }"
                  @mouseover="($event.target.style.background = 'var(--choice-hover)')"
                  @mouseleave="($event.target.style.background = 'transparent')"
                >
                  <p class="font-medium">{{ emp.employee_name }}</p>
                  <p class="text-xs" :style="{ color: 'var(--text-sub)' }">{{ emp.name }} • {{ emp.phone_number || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Selected Employee Display -->
            <div
              v-if="formData.employee"
              class="mt-2 p-2 rounded border"
              :style="{ background: 'var(--choice-active-bg)', borderColor: 'var(--choice-active-border)' }"
            >
              <p class="text-xs" :style="{ color: 'var(--text-sub)' }">Selected:</p>
              <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">{{ selectedEmployeeName }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-sub)' }">{{ formData.employee }}</p>
            </div>
          </div>

          <!-- Date & Time -->
          <div>
            <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Date & Time</label>
            <input
              v-model="formData.time"
              type="datetime-local"
              required
              class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
              :style="{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-main)', caretColor: 'var(--focus-ring)' }"
            />
          </div>

          <!-- Log Type -->
          <div>
            <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Log Type</label>
            <select
              v-model="formData.logType"
              required
              class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
              :style="{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-main)' }"
            >
              <option value="IN">Check In</option>
              <option value="OUT">Check Out</option>
            </select>
          </div>

          <!-- Skip Auto Attendance -->
          <label class="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              v-model="formData.skip_auto_attendance"
              type="checkbox"
              :true-value="1"
              :false-value="0"
              class="w-5 h-5 rounded focus:ring-2"
              :style="{ accentColor: 'var(--focus-ring)' }"
            />
            <span :style="{ color: 'var(--text-main)', fontWeight: '600' }">
              Skip Auto Attendance
            </span>
          </label>

          <!-- Actions -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 rounded-lg transition font-medium"
              :style="{ border: '1px solid var(--input-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2 rounded-lg transition font-medium"
              :style="{ background: 'var(--focus-ring)', color: 'var(--text-main)', opacity: saving ? 0.5 : 1 }"
            >
              {{ saving ? 'Saving...' : editingRecord ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>

</template>

<script setup>

import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Users, Plus, Clock, LogIn, LogOut, Edit2, Trash2, User, X } from 'lucide-vue-next'
import {
  getAllCheckinsApi,
  createCheckinApi,
  updateCheckinApi,
  deleteCheckinApi,
} from '@/services/api.js'
import { useStaffStore } from '@/stores/staff'
import StatsCard from '@/layout/StatsCard.vue'
// Store
const staffStore = useStaffStore();

/* STATE */
const checkins = ref([])
const filteredCheckins = ref([])
const allEmployees = ref([])
const employeeSearchResults = ref([])

const showAddModal = ref(false)
const showEmployeeDropdown = ref(false)
const editingRecord = ref(null)

const loading = ref(false)
const saving = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  employee: '',
  logType: '',
  date: new Date().toISOString().split('T')[0]
})

const formData = reactive({
  employee: '',
  employeeSearch: '',
  time: '',
  logType: 'IN',
  skip_auto_attendance: 0,
})

const selectedEmployeeName = ref('')

/* COMPUTED */
const totalCheckins = computed(() => checkins.value.length)

const checkInCount = computed(() =>
  checkins.value.filter(c => c.log_type === 'IN').length
)

const checkOutCount = computed(() =>
  checkins.value.filter(c => c.log_type === 'OUT').length
)

const uniqueEmployees = computed(() =>
  new Set(checkins.value.map(c => c.employee)).size
)

const totalPages = computed(() =>
  Math.ceil(filteredCheckins.value.length / pageSize.value)
)

const startIndex = computed(() =>
  (currentPage.value - 1) * pageSize.value
)

const endIndex = computed(() =>
  Math.min(startIndex.value + pageSize.value, filteredCheckins.value.length)
)

const paginatedCheckins = computed(() =>
  filteredCheckins.value.slice(startIndex.value, endIndex.value)
)

/* WATCHERS */
watch(
  filters,
  () => applyFilters(),
  { deep: true }
)

/* METHODS */
const fetchCheckins = () => {
  loading.value = true
  getAllCheckinsApi()
    .then(data => {
      checkins.value = data || []
      applyFilters()
    })
    .catch(error => {
      console.error('Error fetching checkins:', error)
      window.$toast?.error?.('Failed to load checkin records')
    })
    .finally(() => {
      loading.value = false
    })
}
const getAllEmployees = async()=>{
      try {
        const staffRequest = await staffStore.fetchStaff();
        console.log('Staff Request Data:', staffRequest);
        return staffRequest.data

      } catch (error) {
        console.error('Error fetching All Employees data:', error);
      }
}
const fetchAllEmployees = async() => {
  getAllEmployees()
    .then(data => {
      allEmployees.value = data || []
      console.log("allEmployees",allEmployees.value)

    })
    .catch(error => {
      console.error('Error fetching employees:', error)
    })
}

const applyFilters = () => {
  filteredCheckins.value = checkins.value.filter(r => {
    const employeeMatch =
      !filters.employee ||
      r.employee_name.toLowerCase().includes(filters.employee.toLowerCase())

    const logTypeMatch = !filters.logType || r.log_type === filters.logType

    return employeeMatch && logTypeMatch
  })

  currentPage.value = 1
}

const searchEmployees = () => {
  const query = formData.employeeSearch.toLowerCase().trim()

  if (!query) {
    employeeSearchResults.value = []
    return
  }

  employeeSearchResults.value = allEmployees.value
    .filter(emp => {
      const name = emp.employee_name?.toLowerCase() || ''
      const id = emp.name?.toLowerCase() || ''
      const phone = emp.phone_number?.toLowerCase() || ''
      const firstName = emp.first_name?.toLowerCase() || ''
      const middleName = emp.middle_name?.toLowerCase() || ''

      return (
        name.includes(query) ||
        id.includes(query) ||
        phone.includes(query) ||
        firstName.includes(query) ||
        middleName.includes(query)
      )
    })
    .slice(0, 10)
}

const selectEmployee = emp => {
  formData.employee = emp.name
  formData.employeeSearch = emp.employee_name
  selectedEmployeeName.value = emp.employee_name
  showEmployeeDropdown.value = false
  employeeSearchResults.value = []
}

const openAddModal = () => {
  editingRecord.value = null
  formData.employee = ''
  formData.employeeSearch = ''
  formData.time = new Date().toISOString().slice(0, 16)
  formData.logType = 'IN'
  selectedEmployeeName.value = ''
  showAddModal.value = true
}

const editRecord = record => {
  editingRecord.value = record
  formData.employee = record.employee
  formData.employeeSearch = record.employee_name
  formData.time = record.time.replace(' ', 'T')
  formData.logType = record.log_type
  formData.skip_auto_attendance = record.skip_auto_attendance
  selectedEmployeeName.value = record.employee_name
  showAddModal.value = true
}

const saveRecord = () => {
  saving.value = true

  const data = {
    employee: formData.employee,
    logType: formData.logType,
    time: formData.time,
    skip_auto_attendance: formData.skip_auto_attendance
  }

  const promise = editingRecord.value
    ? updateCheckinApi(editingRecord.value.name, data)
    : createCheckinApi(data)

  promise
    .then(() => {
      window.$toast?.success?.(
        editingRecord.value ? 'Checkin updated successfully' : 'Checkin created successfully'
      )
      closeModal()
      fetchCheckins()
    })
    .catch(error => {
      console.error('Error saving checkin:', error)
      window.$toast?.error?.('Failed to save checkin')
    })
    .finally(() => {
      saving.value = false
    })
}

const deleteRecord = name => {
  if (!confirm('Are you sure you want to delete this record?')) return

  deleteCheckinApi(name)
    .then(() => {
      window.$toast?.success?.('Checkin deleted successfully')
      fetchCheckins()
    })
    .catch(error => {
      console.error('Error deleting checkin:', error)
      window.$toast?.error?.('Failed to delete checkin')
    })
}

const closeModal = () => {
  showAddModal.value = false
  editingRecord.value = null
}

const resetFilters = () => {
  filters.employee = ''
  filters.logType = ''
  filters.date = new Date().toISOString().split('T')[0]
}

const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = dateString => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getLogTypeBadgeClass = logType =>
  logType === 'IN'
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700'

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const hideEmployeeDropdown = () => {
  // انتظر قليلاً قبل إخفاء الـ dropdown
  // حتى يتمكن من الضغط على العنصر قبل اختفاؤه
  setTimeout(() => {
    showEmployeeDropdown.value = false
  }, 200)
}
/* LIFECYCLE */
onMounted(() => {
  fetchCheckins()
  fetchAllEmployees()
})
</script>
