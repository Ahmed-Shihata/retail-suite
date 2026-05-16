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
              <Calendar class="w-8 h-8" :style="{ color: 'var(--focus-ring)' }" />
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">Leave Management</h1>
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
              Request Leave
            </button>
          </div>
        </header>

      <!-- Statistics Cards -->
      <section class="flex-shrink-0 px-6 py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatsCard
            title="Total Leave Balance"
            :value="totalLeaveBalance"
            subtitle="Days available"
            icon="Calendar"
            color="info"
          />

          <StatsCard
            title="Used Leave"
            :value="usedLeave"
            subtitle="Days taken"
            icon="CheckCircle"
            color="warning"
          />

          <StatsCard
            title="Pending Requests"
            :value="pendingRequests"
            subtitle="Awaiting approval"
            icon="Clock"
            color="warning"
          />

          <StatsCard
            title="Approved Requests"
            :value="approvedRequests"
            subtitle="Approved"
            icon="CheckCircle2"
            color="success"
          />

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
                v-model="filters.employeeName"
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                v-model="filters.leaveType"
                class="px-4 py-2 rounded-lg focus:outline-none transition"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="">All Leave Types</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>
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

        <!-- Leave Table -->
        <section class="flex-1 px-6 pb-6">
          <div
            class="rounded-xl shadow-sm overflow-hidden"
            :style="{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)'
            }"
          >
            <div v-if="paginatedLeaves.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th
                      v-for="col in ['Employee','Leave Type','From Date','To Date','Days','Status','Approver','Actions']"
                      :key="col"
                      class="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap"
                      :class="['Days','Status','Actions'].includes(col) ? 'text-center' : ''"
                      :style="{
                        color: 'var(--text-sub)',
                        borderBottom: '1px solid var(--card-border)'
                      }"
                    >{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="leave in paginatedLeaves"
                    :key="leave.name"
                    class="transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <!-- Employee -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          :style="{ background: 'var(--info-bg)' }">
                          <User class="w-5 h-5" :style="{ color: 'var(--focus-ring)' }" />
                        </div>
                        <div>
                          <p class="text-sm font-medium" :style="{ color: 'var(--text-main)' }">{{ leave.employee_name }}</p>
                          <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ leave.employee }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Leave Type -->
                    <td class="px-6 py-4">
                      <span class="text-sm" :style="{ color: 'var(--text-sub)' }">{{ leave.leave_type }}</span>
                    </td>

                    <!-- Dates -->
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(leave.from_date) }}</td>
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">{{ formatDate(leave.to_date) }}</td>

                    <!-- Days -->
                    <td class="px-6 py-4 text-center">
                      <span
                        class="text-sm font-medium px-3 py-1 rounded"
                        :style="{
                          background: 'var(--item-bg)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--item-border)'
                        }"
                      >{{ leave.total_leave_days }}</span>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 text-center">
                      <span :class="getStatusBadgeClass(leave.status)" class="text-xs font-medium px-3 py-1 rounded-full">
                        {{ leave.status }}
                      </span>
                    </td>

                    <!-- Approver -->
                    <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-sub)' }">
                      <span class="truncate block">{{ leave.leave_approver_name || 'N/A' }}</span>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button v-if="leave.status === 'Pending'" @click="approveLeave(leave.name)"
                          :disabled="leaveLoading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
                          :style="{ color: 'var(--icon-color-green)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--icon-bg-green)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Approve"
                        ><CheckCircle2 class="w-5 h-5" /></button>

                        <button v-if="leave.status === 'Pending'" @click="rejectLeave(leave.name)"
                          :disabled="leaveLoading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
                          :style="{ color: 'var(--warning-border)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Reject"
                        ><XCircle class="w-5 h-5" /></button>

                        <button @click="editLeave(leave)"
                          :disabled="leaveLoading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
                          :style="{ color: 'var(--focus-ring)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Edit"
                        ><Edit2 class="w-5 h-5" /></button>

                        <button @click="deleteLeave(leave.name)"
                          :disabled="leaveLoading"
                          class="p-2 rounded-lg transition disabled:opacity-50"
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
              <Calendar class="w-16 h-16 mb-4" :style="{ color: 'var(--text-muted)', opacity: 0.4 }" />
              <p class="text-lg" :style="{ color: 'var(--text-sub)' }">No leave requests found</p>
              <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">Try adjusting your filters or create a new request</p>
            </div>
          </div>
        </section>

        <!-- Pagination -->
        <section v-if="filteredLeaves.length > 0" class="px-6 pb-6">
          <div class="flex items-center justify-between">
            <p class="text-sm" :style="{ color: 'var(--text-sub)' }">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredLeaves.length }} records
            </p>
            <div class="flex gap-2 items-center">
              <button @click="previousPage" :disabled="currentPage === 1"
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
              <button @click="nextPage" :disabled="currentPage === totalPages"
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

      <!-- Modal -->
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
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold" :style="{ color: 'var(--text-main)' }">
              {{ editingLeave ? 'Edit Leave Request' : 'Request Leave' }}
            </h2>
            <button @click="closeModal"
              :style="{ color: 'var(--text-muted)' }"
              @mouseover="$event.currentTarget.style.color = 'var(--text-main)'"
              @mouseleave="$event.currentTarget.style.color = 'var(--text-muted)'"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Error -->
          <div
            v-if="leaveError"
            class="mb-4 p-3 rounded-lg"
            :style="{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)'
            }"
          >
            <p class="text-sm" :style="{ color: 'var(--warning-border)' }">⚠️ {{ leaveError }}</p>
          </div>

          <form @submit.prevent="saveLeave" class="space-y-4">

            <!-- Employee -->
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
                  :disabled="leaveLoading"
                  placeholder="Search employee..."
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
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
                    @mousedown.prevent="selectEmployee(emp)"
                    class="px-4 py-3 cursor-pointer transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <p class="font-medium text-sm" :style="{ color: 'var(--text-main)' }">{{ emp.employee_name }}</p>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ emp.name }} • {{ emp.phone_number || 'N/A' }}</p>
                  </div>
                </div>
                <div
                  v-if="formData.employeeId"
                  class="mt-2 p-2 rounded"
                  :style="{
                    background: 'var(--info-bg)',
                    border: '1px solid var(--info-border)'
                  }"
                >
                  <p class="text-xs font-medium" :style="{ color: 'var(--focus-ring)' }">✓ Selected: {{ formData.employeeName }}</p>
                </div>
              </div>
            </div>

            <!-- Leave Type -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Leave Type <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <select v-model="formData.leaveType" required :disabled="leaveLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="">Select leave type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>
            </div>

            <!-- Company -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Company <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <select v-model="formData.company" required :disabled="leaveLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="">Select company</option>
                <option v-for="company in companies" :key="company.name" :value="company.name">
                  {{ company.name }}
                </option>
              </select>
            </div>

            <!-- From Date -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                From Date <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <input v-model="formData.fromDate" type="date" required :disabled="leaveLoading" @change="calculateDays"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
            </div>

            <!-- To Date -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                To Date <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <input v-model="formData.toDate" type="date" required :disabled="leaveLoading"
                :min="formData.fromDate" @change="calculateDays"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
            </div>

            <!-- Number of Days -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Number of Days</label>
              <div
                class="px-4 py-2 rounded-lg"
                :style="{
                  background: 'var(--item-bg)',
                  border: '1px solid var(--item-border)'
                }"
              >
                <p class="text-lg font-semibold" :style="{ color: 'var(--text-main)' }">{{ formData.numberOfDays }}</p>
                <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">Auto-calculated</p>
              </div>
            </div>

            <!-- Leave Approver -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">
                Leave Approver <span :style="{ color: 'var(--warning-border)' }">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.approverSearch"
                  @input="searchApprovers"
                  @focus="showApproverDropdown = true"
                  @blur="hideApproverDropdown"
                  type="text"
                  required
                  :disabled="leaveLoading"
                  placeholder="Search approver..."
                  class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                  :style="{
                    background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
                <div
                  v-if="showApproverDropdown && approverSearchResults.length > 0"
                  class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  :style="{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)'
                  }"
                >
                  <div
                    v-for="approver in approverSearchResults"
                    :key="approver.name"
                    @mousedown.prevent="selectApprover(approver)"
                    class="px-4 py-3 cursor-pointer transition"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'transparent'"
                  >
                    <p class="font-medium text-sm" :style="{ color: 'var(--text-main)' }">{{ approver.employee_name }}</p>
                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ approver.name }}</p>
                  </div>
                </div>
                <div
                  v-if="formData.leaveApproverId"
                  class="mt-2 p-2 rounded"
                  :style="{
                    background: 'var(--info-bg)',
                    border: '1px solid var(--info-border)'
                  }"
                >
                  <p class="text-xs font-medium" :style="{ color: 'var(--focus-ring)' }">✓ Approver: {{ formData.leaveApprover }}</p>
                </div>
              </div>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Reason</label>
              <textarea
                v-model="formData.reason"
                rows="3"
                :disabled="leaveLoading"
                placeholder="Enter reason for leave (optional)"
                class="w-full px-4 py-2 rounded-lg focus:outline-none resize-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--textarea-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--textarea-border)'
                }"
              />
            </div>

            <!-- Status (edit only) -->
            <div v-if="editingLeave">
              <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-sub)' }">Status</label>
              <select v-model="formData.status" :disabled="leaveLoading"
                class="w-full px-4 py-2 rounded-lg focus:outline-none disabled:cursor-not-allowed transition"
                :style="{
                  background: leaveLoading ? 'var(--item-bg)' : 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Actions -->
            <div
              class="flex gap-3 pt-4"
              :style="{ borderTop: '1px solid var(--card-border)' }"
            >
              <button type="button" @click="closeModal" :disabled="leaveLoading"
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
                :disabled="leaveLoading || !isFormValid"
                class="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2 text-sm"
                :style="{ background: 'var(--btn-primary)' }"
              >
                <svg v-if="leaveLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                {{ leaveLoading ? 'Saving...' : (editingLeave ? 'Update' : 'Submit Request') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>

</template>
<script setup>
import { ref, computed, reactive, onMounted } from 'vue'

import { useAttendanceStore } from '@/stores/attendence'
import { useShiftStore } from '@/stores/shift'
import { useStaffStore } from '@/stores/staff'
import StatsCard from '@/layout/StatsCard.vue'
import { getCompanies, getFiscalYears } from "@/services/api"
import {
  Calendar,
  Plus,
  User,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-vue-next'

/* ========================
   Initialization
======================== */

const attendanceStore = useAttendanceStore()
const shiftStore = useShiftStore()
const staffStore = useStaffStore()

/* ========================
   State
======================== */
const leaveRequests = ref([])
const companies = ref([
  { name: 'Main Company' },
  { name: 'Branch 1' },
  { name: 'Branch 2' }
])
const allEmployees = ref([])
const allApprovers = ref([])

const showAddModal = ref(false)
const editingLeave = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Employee Search
const showEmployeeDropdown = ref(false)
const employeeSearchResults = ref([])

// Approver Search
const showApproverDropdown = ref(false)
const approverSearchResults = ref([])

/* ========================
   Computed - Store States
======================== */
const leaveLoading = computed(() => attendanceStore.leaveLoading)
const leaveError = computed(() => attendanceStore.leaveError)

/* ========================
   Filters & Form
======================== */
const filters = reactive({
  employeeName: '',
  status: '',
  leaveType: ''
})

const formData = reactive({
  id: null,
  employeeId: '',
  employeeName: '',
  employeeSearch: '',
  leaveType: '',
  company: '',
  fromDate: '',
  toDate: '',
  numberOfDays: 0,
  reason: '',
  leaveApproverId: '',
  leaveApprover: '',
  approverSearch: '',
  status: 'Pending'
})

/* ========================
   Computed - Form Validation
======================== */
const isFormValid = computed(() => {
  return (
    formData.employeeId &&
    formData.leaveType &&
    formData.company &&
    formData.fromDate &&
    formData.toDate &&
    formData.leaveApproverId &&
    formData.numberOfDays > 0
  )
})

/* ========================
   Computed - Filtered Data
======================== */
const filteredLeaves = computed(() =>
  leaveRequests.value.filter(leave => {
    const nameMatch = leave.employee_name
      .toLowerCase()
      .includes(filters.employeeName.toLowerCase())

    const statusMatch = !filters.status || leave.status === filters.status
    const typeMatch = !filters.leaveType || leave.leave_type === filters.leaveType

    return nameMatch && statusMatch && typeMatch
  })
)

const paginatedLeaves = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLeaves.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(filteredLeaves.value.length / itemsPerPage.value)
)

const startIndex = computed(() =>
  (currentPage.value - 1) * itemsPerPage.value
)

const endIndex = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredLeaves.value.length)
)

/* ========================
   Computed - Statistics
======================== */
const totalLeaveBalance = computed(() => 30)

const usedLeave = computed(() =>
  leaveRequests.value
    .filter(l => l.status === 'Approved')
    .reduce((total, l) => total + l.total_leave_days, 0)
)

const pendingRequests = computed(() =>
  leaveRequests.value.filter(l => l.status === 'Pending').length
)

const approvedRequests = computed(() =>
  leaveRequests.value.filter(l => l.status === 'Approved').length
)

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
  formData.employeeId = emp.name
  formData.employeeName = emp.employee_name
  formData.employeeSearch = emp.employee_name
  showEmployeeDropdown.value = false
  employeeSearchResults.value = []
}

function hideEmployeeDropdown() {
  setTimeout(() => {
    showEmployeeDropdown.value = false
  }, 200)
}

/* ========================
   Methods - Approver Search
======================== */
function searchApprovers() {
  const query = formData.approverSearch.toLowerCase().trim()

  if (!query) {
    approverSearchResults.value = []
    return
  }

  approverSearchResults.value = allApprovers.value
    .filter(approver => {
      const name = approver.employee_name?.toLowerCase() || ''
      const id = approver.name?.toLowerCase() || ''

      return name.includes(query) || id.includes(query)
    })
    .slice(0, 10)
}

function selectApprover(approver) {
  formData.leaveApproverId = approver.name
  formData.leaveApprover = approver.employee_name
  formData.approverSearch = approver.employee_name
  showApproverDropdown.value = false
  approverSearchResults.value = []
}

function hideApproverDropdown() {
  setTimeout(() => {
    showApproverDropdown.value = false
  }, 200)
}

/* ========================
   Methods - Calculations
======================== */
const calculateDays = () => {
  if (formData.fromDate && formData.toDate) {
    const from = new Date(formData.fromDate)
    const to = new Date(formData.toDate)
    const diffTime = Math.abs(to - from)
    formData.numberOfDays =
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
}

/* ========================
   Methods - Utilities
======================== */
const getStatusBadgeClass = status => ({
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-800'
}[status] || 'bg-gray-100 text-gray-800')

const formatDate = date =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

/* ========================
   Methods - Filters
======================== */
const resetFilters = () => {
  filters.employeeName = ''
  filters.status = ''
  filters.leaveType = ''
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
const resetFormData = () => {
  formData.id = null
  formData.employeeId = ''
  formData.employeeName = ''
  formData.employeeSearch = ''
  formData.leaveType = ''
  formData.company = ''
  formData.fromDate = ''
  formData.toDate = ''
  formData.numberOfDays = 0
  formData.reason = ''
  formData.leaveApproverId = ''
  formData.leaveApprover = ''
  formData.approverSearch = ''
  formData.status = 'Pending'
}

const openAddModal = () => {
  editingLeave.value = null
  resetFormData()
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingLeave.value = null
  resetFormData()
}

/* ========================
   Methods - CRUD Operations
======================== */
const saveLeave = async () => {
  try {
    if (!isFormValid.value) {
      return
    }

    const leaveData = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      leaveType: formData.leaveType,
      company: formData.company,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      numberOfDays: formData.numberOfDays,
      reason: formData.reason,
      leaveApproverId: formData.leaveApproverId,
      leaveApprover: formData.leaveApprover,
      status: formData.status
    }

    let response

    if (editingLeave.value) {
      leaveData.id = editingLeave.value
      response = await attendanceStore.updateLeave(leaveData)
    } else {
      response = await attendanceStore.addLeaveRequest(leaveData)
    }

    if (response.status === 'success') {
      await fetchLeaves()
      closeModal()
    }
  } catch (err) {
    console.error('Error saving leave:', err)
  }
}

const editLeave = leave => {
  editingLeave.value = leave.name
  formData.id = leave.name
  formData.employeeId = leave.employee
  formData.employeeName = leave.employee_name
  formData.employeeSearch = leave.employee_name
  formData.leaveType = leave.leave_type
  formData.company = leave.company
  formData.fromDate = leave.from_date
  formData.toDate = leave.to_date
  formData.numberOfDays = leave.total_leave_days
  formData.reason = leave.reason
  formData.leaveApproverId = leave.leave_approver
  formData.leaveApprover = leave.leave_approver_name
  formData.approverSearch = leave.leave_approver_name
  formData.status = leave.status
  showAddModal.value = true
}

const deleteLeave = async (leaveId) => {
  if (!confirm('Are you sure you want to delete this leave request?')) {
    return
  }

  try {
    const response = await attendanceStore.deleteLeave(leaveId)

    if (response.status === 'success') {
      await fetchLeaves()
    }
  } catch (err) {
    console.error('Error deleting leave:', err)
  }
}

const approveLeave = async (leaveId) => {
  try {
    const response = await attendanceStore.approveLeave(leaveId)

    if (response.status === 'success') {
      await fetchLeaves()
    }
  } catch (err) {
    console.error('Error approving leave:', err)
  }
}

const rejectLeave = async (leaveId) => {
  try {
    const response = await attendanceStore.rejectLeave(leaveId)

    if (response.status === 'success') {
      await fetchLeaves()
    }
  } catch (err) {
    console.error('Error rejecting leave:', err)
  }
}

/* ========================
   Methods - Data Loading
======================== */
const fetchLeaves = async () => {
  try {
    const response = await attendanceStore.fetchLeaveRequests()

    if (response.status === 'success') {
      leaveRequests.value = response.data || []
      currentPage.value = 1
    }
  } catch (err) {
    console.error('Error fetching leaves:', err)
  }
}

const fetchData = async () => {
  try {
    await fetchLeaves()
     companies.value = await getCompanies()

      console.log("companies",companies.value)
    // TODO: Fetch employees and approvers from API
     const staffResponse = await staffStore.fetchStaff()
     if (staffResponse?.data) {
      allEmployees.value = staffResponse.data
      console.log('Employees loaded:', allEmployees.value)
    }
    // allApprovers.value = ...
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

/* ========================
   Lifecycle
======================== */
onMounted(() => {
  fetchData()
})


</script>
