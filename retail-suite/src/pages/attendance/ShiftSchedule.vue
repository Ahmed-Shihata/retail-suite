<template>

    <div class="w-full flex min-h-screen" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1 min-h-screen">

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
              <Clock class="w-8 h-8" :style="{ color: 'var(--icon-color-purple)' }" />
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">
                Shift Schedule Management
              </h1>
            </div>
            <button
              @click="openAddModal"
              class="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
              :style="{ background: 'var(--btn-primary)' }"
            >
              <Plus class="w-5 h-5" />
              Add New Shift
            </button>
          </div>
        </header>

        <!-- Stats -->
        <section class="flex-shrink-0 px-6 py-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Shifts"          :value="shifts.length"                   icon="Briefcase"   color="blue" />
            <StatsCard title="Employees Scheduled"   :value="totalEmployeesScheduled"          icon="Users"       color="green" />
            <StatsCard title="Active Shifts"         :value="activeShifts"                     icon="CheckCircle" color="cyan" />
            <StatsCard title="Average Hours"         :value="averageHours.toFixed(1)"          icon="Clock"       color="purple" />
          </div>
        </section>

        <!-- Filters -->
        <section class="flex-shrink-0 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm p-4"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

              <!-- Search Employee -->
              <div class="relative">
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                  Search Employee
                </label>
                <input
                  v-model="searchEmployee"
                  @input="searchFilterEmployees"
                  @focus="showFilterEmployeeDropdownOnFocus"
                  @blur="hideFilterEmployeeDropdown"
                  type="text"
                  placeholder="Search by name, ID, or phone..."
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />

                <!-- Dropdown Results -->
                <div
                  v-if="showFilterEmployeeDropdown && filterEmployeeSearchResults.length > 0"
                  class="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  :style="{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)'
                  }"
                >
                  <div
                    v-for="emp in filterEmployeeSearchResults"
                    :key="emp.name"
                    @mousedown.prevent="selectFilterEmployee(emp)"
                    class="px-4 py-3 cursor-pointer transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">{{ emp.employee_name }}</p>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ emp.name }} • {{ emp.phone_number || 'N/A' }}
                    </p>
                  </div>
                </div>

                <!-- No Results -->
                <div
                  v-if="showFilterEmployeeDropdown && searchEmployee.trim() && filterEmployeeSearchResults.length === 0"
                  class="absolute z-50 w-full mt-1 rounded-lg shadow-lg p-4"
                  :style="{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)'
                  }"
                >
                  <p class="text-sm text-center" :style="{ color: 'var(--text-muted)' }">No employees found</p>
                </div>

                <!-- Selected Employee Chip -->
                <div
                  v-if="selectedEmployeeFilter"
                  class="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg"
                  :style="{
                    background: 'var(--info-bg)',
                    border: '1px solid var(--info-border)'
                  }"
                >
                  <div class="flex-1">
                    <p class="text-xs font-medium" :style="{ color: 'var(--focus-ring)' }">
                      {{ selectedEmployeeFilter.employee_name }}
                    </p>
                    <p class="text-xs" :style="{ color: 'var(--focus-ring)', opacity: 0.7 }">
                      {{ selectedEmployeeFilter.name }}
                    </p>
                  </div>
                  <button
                    @click="clearSelectedFilterEmployee"
                    type="button"
                    class="p-1 transition"
                    :style="{ color: 'var(--focus-ring)' }"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Shift Type Filter -->
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Shift Type</label>
                <select
                  v-model="filterShiftType"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                >
                  <option value="">All Shifts</option>
                  <option v-for="shifttype in typeOfShifts" :key="shifttype.name" :value="shifttype.name">
                    {{ shifttype.name }}
                  </option>
                </select>
              </div>

              <!-- From Date -->
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">From Date</label>
                <input v-model="filterFromDate" type="date"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

              <!-- To Date -->
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">To Date</label>
                <input v-model="filterToDate" type="date" :min="filterFromDate"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none transition"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
            </div>

            <!-- Clear Filters -->
            <div class="mt-4 flex justify-end">
              <button
                @click="clearFilters"
                class="px-4 py-2 text-sm font-medium rounded-lg transition"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-sub)',
                  border: '1px solid var(--item-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        <!-- Controls -->
        <section class="flex-shrink-0 px-6 pb-4">
          <div
            class="flex justify-between items-center p-4 rounded-xl shadow-sm flex-wrap gap-6"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <!-- Month Selector -->
            <div class="flex items-center gap-4">
              <button
                @click="prevMonth"
                class="px-3 py-2 rounded-md text-base transition"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--item-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >◀</button>
              <span class="font-semibold text-base min-w-[200px] text-center" :style="{ color: 'var(--text-main)' }">
                {{ monthLabel }}
              </span>
              <button
                @click="nextMonth"
                class="px-3 py-2 rounded-md text-base transition"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--item-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >▶</button>
            </div>

            <!-- Week Selector -->
            <div v-if="viewMode === 'week'" class="flex items-center gap-2">
              <button @click="prevWeek" class="btn-nav">◀</button>
              <button
                v-for="(week, index) in monthWeeks"
                :key="index"
                @click="currentWeekIndex = index"
                :class="['week-btn', { active: currentWeekIndex === index }]"
              >
                {{ weekLabel(index) }} {{ week.start }} - {{ week.end }}
              </button>
              <button @click="nextWeek" class="btn-nav">▶</button>
            </div>

            <!-- View Options -->
            <div class="flex gap-1">
              <button
                v-for="view in ['table', 'week', 'month']"
                :key="view"
                @click="viewMode = view"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :style="viewMode === view
                  ? { background: 'var(--btn-primary)', color: '#fff' }
                  : {
                      background: 'var(--item-bg)',
                      color: 'var(--text-sub)',
                      border: '1px solid var(--item-border)'
                    }
                "
              >
                {{ view === 'table' ? 'Table' : view === 'week' ? 'Week' : 'Month' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Shifts Table -->
        <section v-if="viewMode === 'table'" class="flex-1 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm overflow-hidden"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th
                      v-for="col in ['Employee','Shift Type','From Date','To Date','Time','Hours','Status','Actions']"
                      :key="col"
                      class="px-6 py-4 text-left text-sm font-semibold"
                      :style="{
                        color: 'var(--text-sub)',
                        borderBottom: '1px solid var(--card-border)'
                      }"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="shift in filteredShifts"
                    :key="shift.id"
                    class="transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <td class="px-6 py-4 text-sm font-medium" :style="{ color: 'var(--text-main)' }">{{ shift.employeeName }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getShiftTypeColor(shift.shiftType)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ shift.shiftType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(shift.startDate) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(shift.endDate) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ shift.startTime }} - {{ shift.endTime }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ shift.hours }} hrs</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getStatusColor(shift.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                        {{ shift.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm flex gap-2">
                      <button @click="editShift(shift)"
                        class="rounded p-1 transition"
                        :style="{ color: 'var(--focus-ring)' }"
                        @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                        @mouseleave="$event.currentTarget.style.background = 'transparent'"
                        title="Edit"
                      ><Edit3 class="w-4 h-4" /></button>
                      <button @click="deleteShift(shift.id)"
                        class="rounded p-1 transition"
                        :style="{ color: 'var(--warning-border)' }"
                        @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                        @mouseleave="$event.currentTarget.style.background = 'transparent'"
                        title="Delete"
                      ><Trash2 class="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="filteredShifts.length === 0" class="px-6 py-8 text-center" :style="{ color: 'var(--text-muted)' }">
              No shifts matching your search
            </div>
          </div>
        </section>

        <!-- Calendar View -->
        <section v-else class="flex-1 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm p-6"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div v-if="viewMode === 'month'" class="calendar-month">
              <div class="month-grid">
                <div v-for="dayName in ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']"
                  :key="dayName" class="month-day-header">{{ dayName }}</div>
                <div v-for="day in monthDays" :key="day.day"
                  :class="['month-day', { 'other-month': !isCurrentMonth(day.date) }]">
                  <div class="day-number">{{ day.day }}</div>
                  <div class="shifts-list">
                    <div v-for="shift in getShiftsForDay(day.date)" :key="shift.id"
                      :class="['mini-shift', `shift-${shift.shiftType.toLowerCase()}`]"
                      @click="editShift(shift)">
                      {{ shift.employeeName }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="viewMode === 'week'" class="calendar-week">
              <div class="week-grid">
                <div v-for="dayName in ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']"
                  :key="dayName" class="week-day-header">{{ dayName }}</div>
                <div v-for="n in getFirstDayOffset()" :key="`empty-${n}`" class="month-day empty-cell" />
                <div v-for="day in currentWeek.weekDays" :key="day"
                  :class="['month-day', { 'other-month': !isCurrentMonth(new Date(currentWeek.year, currentWeek.month)) }]">
                  <div class="day-number">{{ day }}</div>
                  <div class="shifts-list">
                    <div v-for="shift in getShiftsForDay(new Date(currentWeek.year, currentWeek.month, day))"
                      :key="shift.id"
                      :class="['mini-shift', `shift-${shift.shiftType.toLowerCase()}`]"
                      @click="editShift(shift)">
                      {{ shift.employeeName }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5)"
      >
        <div
          class="rounded-xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          :style="{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)'
          }"
        >
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">
              {{ isEditing ? 'Edit Shift Assignment' : 'Add New Shift Assignment' }}
            </h2>
            <button
              @click="closeModal"
              :disabled="isLoading"
              class="transition"
              :style="{ color: 'var(--text-muted)' }"
              @mouseover="$event.currentTarget.style.color = 'var(--text-main)'"
              @mouseleave="$event.currentTarget.style.color = 'var(--text-muted)'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveShift" class="space-y-4">

            <!-- Employee Search -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Employee <span style="color: var(--warning-border)">*</span>
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

            <!-- Shift Type -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Shift Type <span style="color: var(--warning-border)">*</span>
              </label>
              <select
                v-model="formData.shiftType"
                :disabled="isLoading"
                required
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

            <!-- Assignment Period -->
            <div
              class="pt-4"
              :style="{ borderTop: '1px solid var(--card-border)' }"
            >
              <h3 class="text-sm font-semibold mb-4" :style="{ color: 'var(--text-main)' }">Assignment Period</h3>

              <div class="mb-4">
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                  Start Date <span style="color: var(--warning-border)">*</span>
                </label>
                <input v-model="formData.startDate" type="date" :disabled="isLoading" required
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                  End Date <span :style="{ color: 'var(--text-muted)' }">(Optional)</span>
                </label>
                <input v-model="formData.endDate" type="date" :disabled="isLoading" :min="formData.startDate"
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
                <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">Leave empty for permanent assignment</p>
              </div>
            </div>

            <!-- Time Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Start Time</label>
                <input v-model="formData.startTime" type="time" :disabled="isLoading" required
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">End Time</label>
                <input v-model="formData.endTime" type="time" :disabled="isLoading" required
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>
            </div>

            <!-- Hours Display -->
            <div
              class="p-3 rounded"
              :style="{
                background: 'var(--item-bg)',
                border: '1px solid var(--item-border)'
              }"
            >
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Total Hours:</p>
              <p class="text-lg font-semibold" :style="{ color: 'var(--text-main)' }">{{ calculatedHours }} hrs</p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Status</label>
              <select v-model="formData.status" :disabled="isLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: isLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <!-- Error Message -->
            <transition name="fade">
              <div
                v-if="errorMessage"
                class="p-3 rounded"
                :style="{
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)'
                }"
              >
                <p class="text-sm" :style="{ color: 'var(--warning-border)' }">⚠️ {{ errorMessage }}</p>
              </div>
            </transition>

            <!-- Action Buttons -->
            <div
              class="flex gap-3 pt-4"
              :style="{ borderTop: '1px solid var(--card-border)' }"
            >
              <button
                type="submit"
                :disabled="isLoading || !formData.employee || !formData.shiftType || !formData.startDate"
                class="flex-1 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                :style="{ background: 'var(--btn-primary)' }"
              >
                <svg v-if="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <svg v-else class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                :disabled="isLoading"
                class="flex-1 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                :style="{
                  background: 'var(--item-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--card-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--item-bg)'"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast -->
      <transition name="slide">
        <div v-if="showToast" class="fixed bottom-4 right-4 z-50">
          <div
            class="px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2"
            :style="{
              background: toastType === 'success' ? '#10b981' : 'var(--warning-border)'
            }"
          >
            <svg v-if="toastType === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ toastMessage }}</span>
          </div>
        </div>
      </transition>

    </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

import StatsCard from '@/layout/StatsCard.vue'
import { useShiftStore } from '@/stores/shift'
import { useStaffStore } from '@/stores/staff'
import {
  Clock,
  Plus,
  Edit3,
  Trash2
} from 'lucide-vue-next'
/* ========================
   Initialization
======================== */
const shiftStore = useShiftStore()
const staffStore = useStaffStore()

/* ========================
   State - Data
======================== */
const shifts = ref([])
const typeOfShifts = ref([])
const allEmployees = ref([])

/* ========================
   State - UI/Modal
======================== */
const showModal = ref(false)
const showEmployeeDropdown = ref(false)  // للفورم فقط
const isEditing = ref(false)
const editingId = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

/* ========================
   State - Notifications
======================== */
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

/* ========================
   State - Form Data
======================== */
const formData = reactive({
  employee: '',
  employeeSearch: '',
  shiftType: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  status: 'Active',
  hours: 0
})

/* ========================
   State - Form Search
======================== */
const employeeSearchResults = ref([])  // نتائج البحث في الفورم
const selectedEmployeeName = ref('')

/* ========================
   State - Filters
======================== */
const searchEmployee = ref('')
const filterShiftType = ref('')
const filterFromDate = ref('')
const filterToDate = ref('')
const selectedEmployeeFilter = ref(null)

/* ========================
   State - Filter Search
======================== */
const filterEmployeeSearchResults = ref([])  // نتائج البحث في الفلاتر
const showFilterEmployeeDropdown = ref(false)

/* ========================
   State - Calendar
======================== */
const viewMode = ref('table')
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const currentWeekIndex = ref(0)

/* ========================
   Month Names
======================== */
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/* ========================
   Computed - Calendar
======================== */
const monthLabel = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`)

const monthWeeks = computed(() => generateWeeks(currentYear.value, currentMonth.value))

const monthDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m, 1)
  const startingDayOfWeek = firstDay.getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const days = []

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(y, m, 1)
    d.setDate(d.getDate() - (i + 1))
    days.push(makeMonthDay(new Date(d), m))
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m, i)
    days.push(makeMonthDay(d, m))
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(y, m + 1, i)
    days.push(makeMonthDay(d, m))
  }

  return days
})

const currentWeek = computed(() => monthWeeks.value[currentWeekIndex.value] || monthWeeks.value[0])

/* ========================
   Computed - Data Filtering
======================== */
const filteredShifts = computed(() => {
  return shifts.value.filter(shift => {
    // تصفية الموظف
    let matchEmployee = true
    if (selectedEmployeeFilter.value) {
      matchEmployee = shift.employeeId === selectedEmployeeFilter.value.name
    } else if (searchEmployee.value.trim()) {
      matchEmployee = shift.employeeName.toLowerCase().includes(searchEmployee.value.toLowerCase())
    }

    // تصفية نوع الشيفت
    const matchType = !filterShiftType.value || shift.shiftType === filterShiftType.value

    // تصفية التاريخ
    const shiftDate = new Date(shift.startDate)
    const fromDate = filterFromDate.value ? new Date(filterFromDate.value) : null
    const toDate = filterToDate.value ? new Date(filterToDate.value) : null

    let matchDate = true
    if (fromDate) {
      matchDate = matchDate && shiftDate >= fromDate
    }
    if (toDate) {
      toDate.setHours(23, 59, 59, 999)
      matchDate = matchDate && shiftDate <= toDate
    }

    return matchEmployee && matchType && matchDate
  })
})

/* ========================
   Computed - Statistics
======================== */
const totalEmployeesScheduled = computed(() => new Set(shifts.value.map(s => s.employeeName)).size)
const activeShifts = computed(() => shifts.value.filter(s => s.status === 'Active').length)
const averageHours = computed(() => {
  if (shifts.value.length === 0) return 0
  const total = shifts.value.reduce((sum, s) => sum + s.hours, 0)
  return total / shifts.value.length
})

/* ========================
   Computed - Form Validation
======================== */
const calculatedHours = computed(() => {
  if (!formData.startTime || !formData.endTime) return 0
  return calculateHours(formData.startTime, formData.endTime)
})

const pos_profile = computed(() => shiftStore.pos_profile || {})

/* ========================
   Methods - Form Management
======================== */
function resetForm() {
  formData.employee = ''
  formData.employeeSearch = ''
  formData.shiftType = ''
  formData.startDate = ''
  formData.endDate = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.status = 'Active'
  formData.hours = 0
  selectedEmployeeName.value = ''
  errorMessage.value = ''
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

/* ========================
   Methods - Form Employee Search
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

/* ========================
   Methods - Filter Employee Search
======================== */
function searchFilterEmployees() {
  const query = searchEmployee.value.toLowerCase().trim()

  if (!query) {
    filterEmployeeSearchResults.value = []
    showFilterEmployeeDropdown.value = false
    return
  }

  filterEmployeeSearchResults.value = allEmployees.value
    .filter(emp => {
      const name = emp.employee_name?.toLowerCase() || ''
      const id = emp.name?.toLowerCase() || ''
      const phone = emp.phone_number?.toLowerCase() || ''

      return name.includes(query) || id.includes(query) || phone.includes(query)
    })
    .slice(0, 10)

  if (filterEmployeeSearchResults.value.length > 0) {
    showFilterEmployeeDropdown.value = true
  }
}

function selectFilterEmployee(emp) {
  selectedEmployeeFilter.value = emp
  searchEmployee.value = emp.employee_name
  filterEmployeeSearchResults.value = []
  showFilterEmployeeDropdown.value = false
}

function clearSelectedFilterEmployee() {
  selectedEmployeeFilter.value = null
  searchEmployee.value = ''
  filterEmployeeSearchResults.value = []
}

function hideFilterEmployeeDropdown() {
  setTimeout(() => {
    showFilterEmployeeDropdown.value = false
  }, 200)
}

function showFilterEmployeeDropdownOnFocus() {
  if (searchEmployee.value.trim() && filterEmployeeSearchResults.value.length > 0) {
    showFilterEmployeeDropdown.value = true
  }
}

/* ========================
   Methods - Filter Management
======================== */
function clearFilters() {
  searchEmployee.value = ''
  filterShiftType.value = ''
  filterFromDate.value = ''
  filterToDate.value = ''
  selectedEmployeeFilter.value = null
  filterEmployeeSearchResults.value = []
}

/* ========================
   Methods - Shift Operations
======================== */
function calculateHours(startTime, endTime) {
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  let diff = (end - start) / (1000 * 60 * 60)
  if (diff < 0) diff += 24
  return parseFloat(diff.toFixed(2))
}

async function saveShift() {
  try {
    if (!formData.employee || !formData.shiftType || !formData.startDate) {
      errorMessage.value = 'Please fill in all required fields'
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    const hours = calculateHours(formData.startTime, formData.endTime)

    const shiftAssignmentData = {
      employee: formData.employee,
      shiftType: formData.shiftType,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      status: formData.status,
      company: pos_profile.value.company,
      employeeName: selectedEmployeeName.value,
      startTime: formData.startTime,
      endTime: formData.endTime,
      hours: hours
    }

    let response

    if (isEditing.value) {
      shiftAssignmentData.id = editingId.value
      response = await shiftStore.updateShiftAssignment(shiftAssignmentData)
    } else {
      response = await shiftStore.createShiftAssignment(shiftAssignmentData)
    }

    if (response.status === 'success') {
      const res = await shiftStore.fetchShiftsAssignments(pos_profile.value.company)
      shifts.value = res?.data || []

      showSuccessToast(
        isEditing.value
          ? 'Shift assignment updated successfully'
          : 'Shift assignment created successfully'
      )
      closeModal()
    } else {
      errorMessage.value = response.message || 'Failed to save shift assignment'
      showErrorToast(errorMessage.value)
    }
  } catch (error) {
    console.error('Error saving shift:', error)
    errorMessage.value = error.message || 'An error occurred while saving'
    showErrorToast(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

function editShift(shift) {
  isEditing.value = true
  editingId.value = shift.id
  formData.employee = shift.employeeId
  formData.employeeSearch = shift.employeeName
  selectedEmployeeName.value = shift.employeeName
  formData.shiftType = shift.shiftType
  formData.startDate = shift.startDate
  formData.endDate = shift.endDate || ''
  formData.startTime = shift.startTime
  formData.endTime = shift.endTime
  formData.status = shift.status
  formData.hours = shift.hours
  showModal.value = true
}

async function deleteShift(id) {
  if (!confirm('Are you sure you want to delete this shift assignment?')) {
    return
  }

  try {
    isLoading.value = true
    const response = await shiftStore.deleteShiftAssignment(id)

    if (response.status === 201) {
      const res = await shiftStore.fetchShiftsAssignments(pos_profile.value.company)
      shifts.value = res?.data || []
      showSuccessToast(response.message)
    } else {
      showErrorToast(response.message || 'Failed to delete shift assignment')
    }
  } catch (error) {
    console.error('Error deleting shift:', error)
    showErrorToast(error.message || 'An error occurred while deleting')
  } finally {
    isLoading.value = false
  }
}

/* ========================
   Methods - Toast Notifications
======================== */
function showSuccessToast(message) {
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

function showErrorToast(message) {
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

/* ========================
   Methods - Calendar Functions
======================== */
function generateWeeks(year, month) {
  const weeks = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  let startDay = firstDayOfMonth
  let dayCounter = 1

  for (let week = 0; week < 6; week++) {
    const weekDays = []
    const weekDaysLabels = []

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (week === 0 && dayOfWeek < startDay) continue
      if (dayCounter > daysInMonth) break

      const date = new Date(year, month, dayCounter)
      weekDays.push(dayCounter)
      weekDaysLabels.push(date.toLocaleDateString('en-US', { weekday: 'long' }))
      dayCounter++
    }

    if (weekDays.length > 0) {
      weeks.push({
        month,
        year,
        start: weekDays[0],
        end: weekDays[weekDays.length - 1],
        weekDays,
        weekDaysLabels
      })
    }

    if (dayCounter > daysInMonth) break
  }

  return weeks
}

function makeMonthDay(date, currentMonth) {
  return {
    date,
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    isCurrentMonth: date.getMonth() === currentMonth
  }
}

function weekLabel(weekIndex) {
  const names = ['First Week', 'Second Week', 'Third Week', 'Fourth Week', 'Fifth Week', 'Sixth Week']
  return names[weekIndex] || ''
}

function getFirstDayOffset() {
  if (!currentWeek.value?.weekDaysLabels) return 0
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const firstDayLabel = currentWeek.value.weekDaysLabels[0]
  return dayNames.indexOf(firstDayLabel)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US')
}

function formatDateLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isCurrentMonth(date) {
  return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
}

function getShiftsForDay(day) {
  const dayStr = formatDateLocal(day)
  return shifts.value.filter(shift => {
    if (shift.startDate && shift.endDate) {
      return dayStr >= shift.startDate && dayStr <= shift.endDate
    }
    return shift.startDate === dayStr
  })
}

/* ========================
   Methods - Calendar Navigation
======================== */
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function prevWeek() {
  if (currentWeekIndex.value > 0) {
    currentWeekIndex.value--
  } else {
    prevMonth()
    currentWeekIndex.value = monthWeeks.value.length - 1
  }
}

function nextWeek() {
  if (currentWeekIndex.value < monthWeeks.value.length - 1) {
    currentWeekIndex.value++
  } else {
    nextMonth()
    currentWeekIndex.value = 0
  }
}

/* ========================
   Methods - Color/Status Mapping
======================== */
function getShiftTypeColor(type) {
  const colors = {
    'Morning': 'bg-yellow-100 text-yellow-800',
    'Evening': 'bg-orange-100 text-orange-800',
    'Night': 'bg-indigo-100 text-indigo-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function getStatusColor(status) {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/* ========================
   Watchers
======================== */
watch(
  () => formData.shiftType,
  (newShiftType) => {
    if (newShiftType) {
      const shift = typeOfShifts.value.find(s => s.name === newShiftType)
      if (shift) {
        formData.startTime = normalizeTime(shift.start_time)
        formData.endTime = normalizeTime(shift.end_time)
      }
    }
  }
)

function normalizeTime(time) {
  if (!time) return '00:00'
  const cleaned = time.trim().slice(0, 5)
  const [h, m] = cleaned.split(':')
  if (!h || !m) return '00:00'
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

/* ========================
   Lifecycle
======================== */
onMounted(async () => {
  try {
    isLoading.value = true

    const [shiftsTypesResponse, shiftAssignmentResponse, staffResponse] = await Promise.all([
      shiftStore.fetchShifts(),
      shiftStore.fetchShiftsAssignments('pos'),
      staffStore.fetchStaff()
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

.shift-morning {
  background-color: #fef3c7;
  color: #92400e;
}

.shift-evening {
  background-color: #fed7aa;
  color: #92400e;
}

.shift-night {
  background-color: #e0e7ff;
  color: #3730a3;
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

.shift-morning-card {
  background: #e3f2fd;
  color: #1976d2;
}

.shift-evening-card {
  background: #fff3e0;
  color: #f57c00;
}

.shift-night-card {
  background: #f3e5f5;
  color: #7b1fa2;
}

.shift-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

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

.week-btn {
  padding: 0.5rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.week-btn:hover {
  background-color: #f3f4f6;
}

.week-btn.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.btn-nav {
  padding: 0.5rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  color: #6b7280;
}

.btn-nav:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.empty-cell {
  background-color: #f9fafb;
  opacity: 0;
  pointer-events: none;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-display {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
  min-width: 200px;
  text-align: center;
}

.week-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.calendar-month {
  width: 100%;
}
</style>
