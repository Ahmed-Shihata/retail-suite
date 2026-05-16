<template>
    <div class="w-full flex min-h-screen" :style="{ background: 'var(--item-bg)' }">
      <main class="w-full flex flex-col min-h-screen">

        <!-- Header -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)'
          }"
        >
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Users class="w-8 h-8" :style="{ color: 'var(--focus-ring)' }" />
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Attendance List</h1>
            </div>
            <button
              @click="openAddModal"
              class="px-4 py-2 text-white rounded-lg transition flex items-center gap-2 text-sm font-semibold"
              :style="{ background: 'var(--btn-primary)' }"
            >
              <Plus class="w-5 h-5" />
              Add Attendance Record
            </button>
          </div>
        </header>

        <!-- Statistics Cards -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <!-- Total Employees -->
            <div class="rounded-xl shadow-sm p-6" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">Total Employees</p>
                  <p class="text-3xl font-bold mt-2" :style="{ color: 'var(--text-main)' }">{{ totalEmployees }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :style="{ background: 'var(--info-bg)' }">
                  <Users class="w-6 h-6" :style="{ color: 'var(--focus-ring)' }" />
                </div>
              </div>
              <p class="text-xs mt-4" :style="{ color: 'var(--text-muted)' }">Unique employees</p>
            </div>

            <!-- Present Today -->
            <div class="rounded-xl shadow-sm p-6" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">Present Today</p>
                  <p class="text-3xl font-bold mt-2" :style="{ color: 'var(--icon-color-green)' }">{{ presentToday }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :style="{ background: 'var(--icon-bg-green)' }">
                  <Check class="w-6 h-6" :style="{ color: 'var(--icon-color-green)' }" />
                </div>
              </div>
              <p class="text-xs mt-4" :style="{ color: 'var(--text-muted)' }">{{ presentPercentage }}% attendance rate</p>
            </div>

            <!-- Absent Today -->
            <div class="rounded-xl shadow-sm p-6" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">Absent Today</p>
                  <p class="text-3xl font-bold mt-2" :style="{ color: 'var(--warning-border)' }">{{ absentToday }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :style="{ background: 'var(--warning-bg)' }">
                  <X class="w-6 h-6" :style="{ color: 'var(--warning-border)' }" />
                </div>
              </div>
              <p class="text-xs mt-4" :style="{ color: 'var(--text-muted)' }">{{ absentPercentage }}% absent rate</p>
            </div>

            <!-- Late Arrivals -->
            <div class="rounded-xl shadow-sm p-6" :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--text-muted)' }">Late Arrivals</p>
                  <p class="text-3xl font-bold mt-2" :style="{ color: 'var(--warning-border)' }">{{ lateToday }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :style="{ background: 'var(--warning-bg)' }">
                  <Clock class="w-6 h-6" :style="{ color: 'var(--warning-border)' }" />
                </div>
              </div>
              <p class="text-xs mt-4" :style="{ color: 'var(--text-muted)' }">{{ latePercentage }}% of total</p>
            </div>
          </div>
        </section>

        <!-- Filters -->
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
                v-model="filters.status"
                class="px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
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
              <button
                v-if="selectedAttendanceIds.length > 0"
                @click="deleteSelectedRecords"
                class="px-4 py-2 text-white rounded-lg transition text-sm font-medium"
                :style="{ background: 'var(--btn-danger)' }"
              >
                Delete Selected ({{ selectedAttendanceIds.length }})
              </button>
            </div>
          </div>
        </section>

        <!-- Attendance Table -->
        <section class="flex-1 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm overflow-hidden"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <!-- Loading -->
            <div v-if="isLoading && attendance.length === 0" class="flex items-center justify-center py-12">
              <svg class="w-8 h-8 animate-spin" :style="{ color: 'var(--focus-ring)' }"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>

            <!-- Table -->
            <div v-else-if="paginatedAttendance.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th class="px-6 py-4 text-center" :style="{ borderBottom: '1px solid var(--card-border)' }">
                      <input
                        type="checkbox"
                        :checked="paginatedAttendance.length > 0 && paginatedAttendance.every(r => selectedAttendanceIds.includes(r.name))"
                        @change="toggleSelectAll($event)"
                      />
                    </th>
                    <th
                      v-for="col in ['Attendance ID','Employee','Date','Check In','Check Out','Status','Department','Actions']"
                      :key="col"
                      class="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap"
                      :class="['Status','Actions'].includes(col) ? 'text-center' : ''"
                      :style="{
                        color: 'var(--text-sub)',
                        borderBottom: '1px solid var(--card-border)'
                      }"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="record in paginatedAttendance"
                    :key="record.name"
                    class="transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <td class="px-6 py-4 text-center">
                      <input type="checkbox" :value="record.name" v-model="selectedAttendanceIds" />
                    </td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-muted)' }">{{ record.name }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          :style="{ background: 'var(--info-bg)' }">
                          <User class="w-5 h-5" :style="{ color: 'var(--focus-ring)' }" />
                        </div>
                        <div>
                          <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">
                            {{ record.employee_name || record.employee }}
                          </p>
                          <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ record.name }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(record.attendance_date) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ record.in_time || '-' }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ record.out_time || '-' }}</td>
                    <td class="px-6 py-4 text-center">
                      <span :class="getStatusBadgeClass(record.status)" class="text-xs font-medium px-3 py-1 rounded-full">
                        {{ record.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ record.department || '-' }}</td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button @click="editRecord(record)"
                          class="p-2 rounded-lg transition"
                          :style="{ color: 'var(--focus-ring)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Edit"
                        ><Edit2 class="w-5 h-5" /></button>
                        <button @click="deleteRecord(record.name)"
                          class="p-2 rounded-lg transition"
                          :style="{ color: 'var(--warning-border)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Delete"
                        ><Trash2 class="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center py-12">
              <Users class="w-16 h-16 mb-4" :style="{ color: 'var(--text-muted)', opacity: 0.4 }" />
              <p class="text-lg" :style="{ color: 'var(--text-sub)' }">No attendance records found</p>
              <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">Try adjusting your filters or add a new record</p>
            </div>
          </div>
        </section>

        <!-- Pagination -->
        <section v-if="filteredAttendance.length > 0" class="px-6 pb-6">
          <div class="flex items-center justify-between">
            <p class="text-sm" :style="{ color: 'var(--text-sub)' }">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAttendance.length }} records
            </p>
            <div class="flex gap-2 items-center">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                :style="{
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-sub)',
                  background: 'var(--card-bg)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
              >Previous</button>
              <span class="px-3 py-2 text-sm" :style="{ color: 'var(--text-muted)' }">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                :style="{
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-sub)',
                  background: 'var(--card-bg)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
              >Next</button>
            </div>
          </div>
        </section>

      </main>

      <!-- Add/Edit Modal -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
        style="background: rgba(0,0,0,0.5)"
      >
        <div
          class="rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          :style="{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)'
          }"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">
              {{ editingRecord ? `Edit Attendance ${editingRecord}` : 'Add Attendance Record' }}
            </h2>
            <button
              @click="closeModal"
              :style="{ color: 'var(--text-muted)' }"
              @mouseover="$event.currentTarget.style.color = 'var(--text-main)'"
              @mouseleave="$event.currentTarget.style.color = 'var(--text-muted)'"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="saveRecord" class="space-y-4">

            <!-- Employee Search -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Employee <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.employeeSearch"
                  @input="searchEmployees"
                  @focus="showEmployeeDropdown = true"
                  @blur="hideEmployeeDropdown"
                  type="text"
                  required
                  :disabled="isLoading"
                  placeholder="Search by name, ID, or phone..."
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
                <div v-if="isLoading" class="absolute right-3 top-3">
                  <svg class="animate-spin h-5 w-5" :style="{ color: 'var(--focus-ring)' }"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>

                <!-- Employee Dropdown -->
                <div
                  v-if="showEmployeeDropdown && employeeSearchResults.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  :style="{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)'
                  }"
                >
                  <div
                    v-for="emp in employeeSearchResults"
                    :key="emp.name"
                    @click="selectEmployee(emp)"
                    class="px-4 py-3 cursor-pointer transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <p class="font-medium text-sm" :style="{ color: 'var(--text-main)' }">{{ emp.employee_name }}</p>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ emp.name }} • {{ emp.phone_number || 'N/A' }}</p>
                  </div>
                </div>

                <!-- No Results -->
                <div
                  v-if="showEmployeeDropdown && formData.employeeSearch && employeeSearchResults.length === 0"
                  class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 p-4"
                  :style="{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)'
                  }"
                >
                  <p class="text-sm text-center" :style="{ color: 'var(--text-muted)' }">No employees found</p>
                </div>
              </div>

              <!-- Selected Employee Display -->
              <transition name="fade">
                <div
                  v-if="formData.employee"
                  class="mt-2 p-3 rounded"
                  :style="{
                    background: 'var(--info-bg)',
                    border: '1px solid var(--info-border)'
                  }"
                >
                  <p class="text-xs" :style="{ color: 'var(--text-muted)' }">✓ Selected Employee:</p>
                  <p class="text-sm font-medium" :style="{ color: 'var(--focus-ring)' }">{{ selectedEmployeeName }}</p>
                  <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formData.employee }}</p>
                </div>
              </transition>
            </div>

            <!-- Attendance Date -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Attendance Date <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <input v-model="formData.attendance_date" type="date" required :disabled="isLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
            </div>

            <!-- Check In -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Check IN Date</label>
                <input type="date" v-model="formData.in_time_date"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Check IN Time</label>
                <input type="time" v-model="formData.in_time_time"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
            </div>

            <!-- Check Out -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Check Out Date</label>
                <input v-model="formData.out_time_date" type="date" :disabled="isLoading"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Check Out Time</label>
                <input v-model="formData.out_time_time" type="time" :disabled="isLoading"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Status <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <select v-model="formData.status" required :disabled="isLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <!-- Shift Type -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Shift Type <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <select v-model="formData.shift" :disabled="isLoading" required
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="" disabled>Choose shift type</option>
                <option v-for="shifttype in typeOfShifts" :key="shifttype.name" :value="shifttype.name">
                  {{ shifttype.name }} ({{ shifttype.start_time || '08:00' }} - {{ shifttype.end_time || '16:00' }})
                </option>
              </select>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Department</label>
              <select v-model="formData.department"
                class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="">All Departments</option>
                <option v-for="dept in departments" :key="dept.name" :value="dept.name">{{ dept.name }}</option>
              </select>
            </div>

            <!-- Error -->
            <div
              v-if="errorMessage"
              class="p-3 rounded-lg"
              :style="{
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)'
              }"
            >
              <p class="text-sm" :style="{ color: 'var(--warning-border)' }">{{ errorMessage }}</p>
            </div>

            <!-- Actions -->
            <div
              class="flex gap-3 pt-4"
              :style="{ borderTop: '1px solid var(--card-border)' }"
            >
              <button type="button" @click="closeModal" :disabled="isLoading"
                class="flex-1 px-4 py-2 rounded-lg disabled:opacity-50 transition font-medium text-sm"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--card-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >Cancel</button>
              <button type="submit"
                :disabled="isLoading || !formData.employee || !formData.attendance_date"
                class="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition font-medium flex items-center justify-center gap-2 text-sm"
                :style="{ background: 'var(--btn-primary)' }"
              >
                <span v-if="!isLoading">{{ editingRecord ? 'Update' : 'Save' }}</span>
                <span v-else>Saving...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast -->
      <transition name="slide">
        <div v-if="showToast" class="fixed bottom-4 right-4 z-50">
          <div
            class="px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 max-w-md"
            :style="{
              background: toastType === 'success' ? '#10b981' : 'var(--warning-border)'
            }"
          >
            <svg v-if="toastType === 'success'" class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </transition>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendence'
import { useShiftStore } from '@/stores/shift'
import { useStaffStore } from '@/stores/staff'
import {
  Users,
  Plus,
  User,
  Edit2,
  Trash2,
  X,
  Check,
  Clock
} from 'lucide-vue-next'

/* ========================
   Stores
======================== */
const attendanceStore = useAttendanceStore()
const shiftStore = useShiftStore()
const staffStore = useStaffStore()

/* ========================
   State UI
======================== */
const attendance = ref([])
const showAddModal = ref(false)
const editingRecord = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)
const errorMessage = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const showEmployeeDropdown = ref(false)

/* ========================
   State - Filters
======================== */
const searchEmployee = ref('')
const selectedEmployeeName = ref('')
const employeeSearchResults = ref([])
/* ========================
   State - Data
======================== */
const shifts = ref([])
const typeOfShifts = ref([])
const allEmployees = ref([])
const departments = ref([])

/* ========================
   Reactive Objects
======================== */
const filters = reactive({
  employee: '',
  status: '',
  date: ''
})

const formData = reactive({
  employee: '',
  employee_name: '',
  attendance_date: '',   // YYYY-MM-DD
  in_time_date: '',      // YYYY-MM-DD
  in_time_time: '',      // HH:mm
  out_time_date: '',
  out_time_time: '',
  status: '',
  department: '',
  shift: '',
  working_hours: 0
})


/* ========================
   Computed - Filtering
======================== */
const filteredAttendance = computed(() => {
  return attendance.value.filter(record => {
    const employeeMatch = (record.employee_name || record.employee)
      ?.toLowerCase()
      .includes(filters.employee.toLowerCase()) || false
    const statusMatch = !filters.status || record.status === filters.status
    const dateMatch = !filters.date || record.attendance_date === filters.date
    return employeeMatch && statusMatch && dateMatch
  })
})

/* ========================
   Computed - Pagination
======================== */
const totalPages = computed(() => Math.ceil(filteredAttendance.value.length / itemsPerPage.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredAttendance.value.length))

const paginatedAttendance = computed(() => {
  return filteredAttendance.value.slice(startIndex.value, endIndex.value)
})

/* ========================
   Computed - Statistics
======================== */
const today = new Date().toISOString().split('T')[0]

const todayRecords = computed(() =>
  attendance.value.filter(r => r.attendance_date === today)
)

const totalEmployees = computed(() => {
  const uniqueIds = new Set(attendance.value.map(r => r.employee))
  return uniqueIds.size || 0
})

const presentToday = computed(() =>
  todayRecords.value.filter(r => r.status === 'Present').length
)

const absentToday = computed(() =>
  todayRecords.value.filter(r => r.status === 'Absent').length
)

const lateToday = computed(() =>
  todayRecords.value.filter(r => r.status === 'Late').length
)

const presentPercentage = computed(() => {
  if (todayRecords.value.length === 0) return 0
  return Math.round((presentToday.value / todayRecords.value.length) * 100)
})

const absentPercentage = computed(() => {
  if (todayRecords.value.length === 0) return 0
  return Math.round((absentToday.value / todayRecords.value.length) * 100)
})

const latePercentage = computed(() => {
  if (todayRecords.value.length === 0) return 0
  return Math.round((lateToday.value / todayRecords.value.length) * 100)
})

/* ========================
   Methods - UI
======================== */
const getStatusBadgeClass = (status) => {
  const classes = {
    'Present': 'bg-green-100 text-green-800',
    'Absent': 'bg-red-100 text-red-800',
    'Late': 'bg-yellow-100 text-yellow-800',
    'Leave': 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/* ========================
   Methods - Filter Management
======================== */
const resetFilters = () => {
  filters.employee = ''
  filters.status = ''
  filters.date = ''
  currentPage.value = 1
}

/* ========================
   Methods - Pagination
======================== */
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

/* ========================
   Methods - Form Management
======================== */
const isOutBeforeIn = () => {
  if (!formData.in_time_date || !formData.in_time_time) return false
  if (!formData.out_time_date || !formData.out_time_time) return false

  const inDt = new Date(`${formData.in_time_date} ${formData.in_time_time}`)
  const outDt = new Date(`${formData.out_time_date} ${formData.out_time_time}`)

  return outDt < inDt
}

const resetFormData = () => {
  formData.employee = ''
  formData.attendance_date = ''
  formData.in_time_time = ''
  formData.out_time_time = ''
  formData.status = 'Present'
  formData.department = ''
  errorMessage.value = ''
}

const openAddModal = () => {
  resetFormData()
  editingRecord.value = null
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingRecord.value = null
  resetFormData()
}

const editRecord = (record) => {
  console.log("record",record)
  editingRecord.value = record.name
  formData.employee = record.employee || ''
  formData.employeeSearch= record.employee || ''
  formData.employee_name = record.employee_name || ''
  formData.attendance_date = record.attendance_date

  if (record.in_time) {
    const [date, time] = record.in_time.split(' ')
    formData.in_time_date = date
    formData.in_time_time = time.slice(0, 5)
  }

  if (record.out_time) {
    const [date, time] = record.out_time.split(' ')
    formData.out_time_date = date
    formData.out_time_time = time.slice(0, 5)
  }

  formData.status = record.status
  formData.department = record.department || ''
  formData.shift = record.shift
  formData.working_hours = record.working_hours
  showAddModal.value = true
}

const buildDateTime = (date, time) => {
  return date && time ? `${date} ${time}:00` : null
}


/* ========================
   Methods - CRUD Operations
======================== */
const saveRecord = async () => {
  try {
    if (!formData.employee || !formData.attendance_date) {
      errorMessage.value = 'Please fill in all required fields'
      return
    }
    if (isOutBeforeIn()) {
      errorMessage.value = 'Check-out time cannot be before check-in time'
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    const attendanceData = {
      employee: formData.employee,
      attendance_date: formData.attendance_date,
      in_time: buildDateTime(
        formData.in_time_date,
        formData.in_time_time
      ),
      out_time: buildDateTime(
        formData.out_time_date,
        formData.out_time_time
      ),
      status: formData.status,
      department: formData.department || ''
    }

    if (editingRecord.value) {
      // Update existing record - local state only
      attendanceData["name"] = editingRecord.value
      console.log("attendanceData when (edit)",attendanceData)
      const response = await attendanceStore.editAttendanceRecord(attendanceData)
      if (response?.status === 'success') {
          console.log("ressssss",response)
          const attendanceData = await loadAttendanceData()
          attendance.value = attendanceData.data || []
          showSuccessToast('Attendance record added successfully')
      } else {
         console.log(response)
         showErrorToast(response.message)
      }

    } else {
      // Create new record via API
      const response = await attendanceStore.addAttendanceRecord(attendanceData)

      if (response?.status === 'success') {
        console.log("ressssss",response)
        const attendanceData = await loadAttendanceData()
        attendance.value = attendanceData.data || []
        showSuccessToast('Attendance record added successfully')
      } else {
         console.log(response)
         showErrorToast(response.message)
      }
    }

    closeModal()
  } catch (error) {
    console.error('Error saving attendance record:', error)
    errorMessage.value = error.message || 'Failed to save attendance record'
    showErrorToast(error.message || 'Error saving record')
  } finally {
    isLoading.value = false
  }
}

const deleteRecord = async (recordId) => {
  if (!confirm('Are you sure you want to delete this record?')) {
    return
  }

  try {
    isLoading.value = true
    const response = await attendanceStore.deleteAttendance(recordId)

    if (response.status === 'success') {
        const attendanceData = await loadAttendanceData()
        attendance.value = attendanceData.data || []
        showSuccessToast('Attendance record deleted successfully')
    } else {
      throw new Error(response.message || 'Failed to delete record')
    }
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    showErrorToast(error.message || 'Failed to delete record')
  } finally {
    isLoading.value = false
  }
}

/* ========================
   Methods - Notifications
======================== */
const showSuccessToast = (message) => {
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const showErrorToast = (message) => {
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

/* ========================
   Methods - Data Loading
======================== */
const loadDepartments = async () => {
  try {
    const response = await staffStore.getDepartments()
    if (response.status === 'error') {
      console.error("Error loading departments:", response.message)
      return
    }else{
      console.log("Departments loaded:", response)
      return response
    }
  } catch (error) {
    console.error("Error loading departments:", error)
  }
}
const loadAttendanceData = async () => {
  try {
    isLoading.value = true
    const response = await attendanceStore.fetchAttendences()

    if (response.status === 'success') {

      console.log('Attendance records loaded:', response.data.length)

      return response || []
    } else {
      throw new Error(response.message || 'Failed to fetch attendance')
    }
  } catch (error) {
    console.error('Error loading attendance data:', error)
    showErrorToast('Failed to load attendance records')
  } finally {
    isLoading.value = false
  }
}
/* ========================
   Methods - Employee Search
======================== */
function searchEmployees() {
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

      return name.includes(query) || id.includes(query) || phone.includes(query)
    })
    .slice(0, 10)
}

function selectEmployee(emp) {
  formData.employee = emp.name
  formData.employeeSearch = emp.employee_name
  selectedEmployeeName.value = emp.employee_name
  showEmployeeDropdown.value = false
  employeeSearchResults.value = []
  errorMessage.value = ''
}

function hideEmployeeDropdown() {
  setTimeout(() => {
    showEmployeeDropdown.value = false
  }, 200)
}

const selectedAttendanceIds = ref([])

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedAttendanceIds.value = paginatedAttendance.value.map(r => r.name)
    console.log("selectedAttendanceIds",selectedAttendanceIds.value)
  } else {
    selectedAttendanceIds.value = []
  }
}

const deleteSelectedRecords = async () => {
  if (!confirm(`Delete ${selectedAttendanceIds.value.length} attendance records?`)) {
    return
  }

  try {
    isLoading.value = true

    const response = await attendanceStore.deleteMultipleAttendance(
      selectedAttendanceIds.value
    )

    if (response.status === 'success' || response.status === 'partial') {
      // إعادة تحميل البيانات
      const attendanceData = await loadAttendanceData()
      attendance.value = attendanceData.data || []

      showSuccessToast(response.message)
      selectedAttendanceIds.value = []
    } else {
      showErrorToast(response.message)
    }
  } catch (error) {
    console.error(error)
    showErrorToast('Failed to delete selected records')
  } finally {
    isLoading.value = false
  }
}

/* ========================
   Lifecycle
======================== */
onMounted(async () => {

    try {
    isLoading.value = true

    const [shiftsTypesResponse, shiftAssignmentResponse, staffResponse, attendanceResponse, departmentResponse] = await Promise.all([
      shiftStore.fetchShifts(),
      shiftStore.fetchShiftsAssignments('pos'),
      staffStore.fetchStaff(),
      loadAttendanceData(),
      loadDepartments()

    ])

    if (shiftsTypesResponse?.data) {
      typeOfShifts.value = shiftsTypesResponse.data
      console.log('Shift types loaded:', typeOfShifts.value)
    }

    if (shiftAssignmentResponse?.data) {
      shifts.value = shiftAssignmentResponse.data
      console.log('Shift assignments loaded:', shifts.value)
    }

    if (staffResponse?.data) {
      allEmployees.value = staffResponse.data
      console.log('Employees loaded:', allEmployees.value)
    }
    if (attendanceResponse?.data){
      attendance.value = attendanceResponse.data || []
    }
    if (departmentResponse?.data){
        departments.value = departmentResponse.data
    }
    showSuccessToast('Data loaded successfully')
  } catch (error) {
    console.error('Error loading initial data:', error)
    showErrorToast('Failed to load data. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input:disabled,
select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
