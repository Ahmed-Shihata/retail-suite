<!-- ClosingPeriod.vue -->
<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 class="text-lg font-bold text-gray-900">Fiscal Year Closing</h1>
              <p class="text-sm text-gray-500 mt-0.5">Manage and close fiscal periods</p>
            </div>
            <button
              @click="openCreateModal"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Close New Period
            </button>
          </div>
        </header>

        <!-- Stats -->
        <section class="px-6 py-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ closingPeriods.length }}</p>
            </div>
            <div class="bg-white rounded-xl border border-green-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Completed</p>
              <p class="text-3xl font-bold text-green-700 mt-1">{{ completedCount }}</p>
            </div>
            <div class="bg-white rounded-xl border border-yellow-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-yellow-600 uppercase tracking-wide">In Progress</p>
              <p class="text-3xl font-bold text-yellow-700 mt-1">{{ inProgressCount }}</p>
            </div>
            <div class="bg-white rounded-xl border border-red-200 shadow-sm p-4">
              <p class="text-xs font-semibold text-red-500 uppercase tracking-wide">Failed</p>
              <p class="text-3xl font-bold text-red-600 mt-1">{{ failedCount }}</p>
            </div>
          </div>
        </section>

        <!-- Filters -->
        <section class="px-6 pb-4">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by year or company..."
                class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <select v-model="statusFilter" class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Failed">Failed</option>
              </select>
              <select v-model="yearFilter" class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Years</option>
                <option v-for="yr in availableYears" :key="yr" :value="yr">{{ yr }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Table -->
        <section v-else class="px-6 pb-8">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {{ filteredPeriods.length }} of {{ closingPeriods.length }} records
              </p>
            </div>

            <div v-if="filteredPeriods.length === 0" class="text-center py-16">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-gray-400 text-sm">No records found</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Voucher</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Fiscal Year</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Company</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Period Start</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Period End</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Closing Account</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">GLE Status</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Doc Status</th>
                    <th class="px-5 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="period in filteredPeriods"
                    :key="period.name"
                    class="hover:bg-blue-50/40 transition-colors"
                  >
                    <td class="px-5 py-3.5 font-medium text-blue-600">{{ period.name }}</td>
                    <td class="px-5 py-3.5 text-gray-800">{{ period.fiscal_year }}</td>
                    <td class="px-5 py-3.5 text-gray-600">{{ period.company }}</td>
                    <td class="px-5 py-3.5 text-gray-500">{{ formatDate(period.period_start_date) }}</td>
                    <td class="px-5 py-3.5 text-gray-500">{{ formatDate(period.period_end_date) }}</td>
                    <td class="px-5 py-3.5 text-gray-600 max-w-[160px] truncate" :title="period.closing_account_head">
                      {{ period.closing_account_head }}
                    </td>
                    <td class="px-5 py-3.5">
                      <span :class="gleStatusClass(period.gle_processing_status)" class="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                        <span :class="gleStatusDot(period.gle_processing_status)" class="w-1.5 h-1.5 rounded-full"></span>
                        {{ period.gle_processing_status || '—' }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5">
                      <span :class="docStatusClass(period.docstatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                        {{ docStatusLabel(period.docstatus) }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5">
                      <button
                        @click="viewPeriod(period)"
                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <!-- Cancel — فقط لو submitted -->
                      <button
                        v-if="period.docstatus === 1"
                        @click="openCancelModal(period)"
                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Cancel Voucher"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ===== CREATE MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showModal = false"></div>

          <!-- Modal Panel -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-white font-bold text-base">Close Fiscal Period</h2>
                    <p class="text-blue-200 text-xs mt-0.5">Create a new period closing voucher</p>
                  </div>
                </div>
                <button @click="showModal = false" class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Progress Steps -->
            <div class="px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div class="flex items-center gap-2">
                <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-2">
                  <div :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    currentStep > i ? 'bg-blue-600 text-white' :
                    currentStep === i ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                    'bg-gray-200 text-gray-500'
                  ]">
                    <svg v-if="currentStep > i" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span v-else>{{ i + 1 }}</span>
                  </div>
                  <span :class="['text-xs font-medium', currentStep >= i ? 'text-blue-700' : 'text-gray-400']">
                    {{ step }}
                  </span>
                  <div v-if="i < steps.length - 1" class="w-8 h-px bg-gray-300 mx-1"></div>
                </div>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-6">

              <!-- Step 0: Basic Info -->
              <div v-if="currentStep === 0" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Transaction Date <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.transaction_date"
                      type="date"
                      class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Company <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="formData.company"
                      @change="onCompanyChange"
                      class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                    >
                      <option value="">Select Company...</option>
                      <option v-for="c in companies" :key="c.name" :value="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Fiscal Year <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.fiscal_year"
                    @change="onFiscalYearChange"
                    class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  >
                    <option value="">Select Fiscal Year...</option>
                    <option v-for="fy in fiscalYears" :key="fy.name" :value="fy.name">
                      {{ fy.name }} ({{ formatDate(fy.year_start_date) }} → {{ formatDate(fy.year_end_date) }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Step 1: Period Dates -->
              <div v-if="currentStep === 1" class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
                  <svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-xs text-blue-700">
                    Period dates are auto-suggested based on the selected fiscal year. You can adjust the end date within the fiscal year range.
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Period Start Date <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.period_start_date"
                      type="date"
                      class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Period End Date <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.period_end_date"
                      type="date"
                      class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 2: Closing Account + Remarks -->
              <div v-if="currentStep === 2" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Closing Account Head <span class="text-red-500">*</span>
                  </label>
                  <div v-if="loadingAccounts" class="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                    <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm text-gray-400">Loading accounts...</span>
                  </div>
                  <select
                    v-else
                    v-model="formData.closing_account_head"
                    class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  >
                    <option value="">Select Account...</option>
                    <optgroup v-for="type in ['Equity', 'Liability']" :key="type" :label="type">
                      <option
                        v-for="acc in closingAccounts.filter(a => a.root_type === type)"
                        :key="acc.name"
                        :value="acc.name"
                      >
                        {{ acc.account_name || acc.name }}
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Remarks</label>
                  <textarea
                    v-model="formData.remarks"
                    rows="3"
                    placeholder="Optional notes about this closing..."
                    class="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Step 3: Review & Confirm -->
              <div v-if="currentStep === 3" class="space-y-3">
                <p class="text-sm text-gray-500 mb-4">Review the details before submitting.</p>
                <div class="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                  <div v-for="row in reviewRows" :key="row.label" class="flex items-center justify-between px-4 py-3">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ row.label }}</span>
                    <span class="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">{{ row.value || '—' }}</span>
                  </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 mt-4">
                  <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <p class="text-xs text-amber-700">
                    This action will create and submit the Period Closing Voucher. GL entries will be processed and this cannot be easily undone.
                  </p>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                v-if="currentStep > 0"
                @click="currentStep--"
                class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <div v-else></div>

              <div class="flex items-center gap-3">
                <button @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition">
                  Cancel
                </button>
                <button
                  v-if="currentStep < steps.length - 1"
                  @click="nextStep"
                  class="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Next
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  v-else
                  @click="savePeriod"
                  :disabled="saving"
                  class="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
                >
                  <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ saving ? 'Processing...' : 'Submit & Close Period' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== VIEW MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showViewModal && selectedPeriod" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showViewModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 class="text-white font-bold text-base">{{ selectedPeriod.name }}</h2>
                <p class="text-gray-400 text-xs mt-0.5">Period Closing Voucher Details</p>
              </div>
              <button @click="showViewModal = false" class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div v-for="row in viewModalRows" :key="row.label" :class="row.full ? 'col-span-2' : ''">
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ row.label }}</p>
                  <p class="text-sm font-medium text-gray-900">{{ row.value || '—' }}</p>
                </div>
              </div>
              <div v-if="selectedPeriod.error_message" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-xs font-semibold text-red-600 mb-1">Error Message</p>
                <p class="text-xs text-red-700">{{ selectedPeriod.error_message }}</p>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button @click="showViewModal = false" class="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- ===== CANCEL CONFIRMATION MODAL ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelModal && cancellingPeriod" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showCancelModal = false"></div>

          <!-- Panel -->
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            <!-- Header -->
            <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-white font-bold text-base">Permanently Cancel</h2>
                  <p class="text-red-200 text-xs mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-6 space-y-4">
              <p class="text-gray-700 text-sm">
                Are you sure you want to permanently cancel
                <span class="font-bold text-gray-900">{{ cancellingPeriod.name }}</span>?
              </p>

              <!-- Details card -->
              <div class="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100 text-sm">
                <div class="flex justify-between px-4 py-2.5">
                  <span class="text-gray-500">Fiscal Year</span>
                  <span class="font-medium text-gray-900">{{ cancellingPeriod.fiscal_year }}</span>
                </div>
                <div class="flex justify-between px-4 py-2.5">
                  <span class="text-gray-500">Company</span>
                  <span class="font-medium text-gray-900">{{ cancellingPeriod.company }}</span>
                </div>
                <div class="flex justify-between px-4 py-2.5">
                  <span class="text-gray-500">Period</span>
                  <span class="font-medium text-gray-900">
                    {{ formatDate(cancellingPeriod.period_start_date) }} → {{ formatDate(cancellingPeriod.period_end_date) }}
                  </span>
                </div>
              </div>

              <!-- Warning -->
              <div class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-xs text-red-700">
                  Cancelling will reverse all GL entries and delete closing balances associated with this voucher. The process may run in the background for large datasets.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                @click="showCancelModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Keep Voucher
              </button>
              <button
                @click="confirmCancel"
                :disabled="cancelling"
                class="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
              >
                <div v-if="cancelling" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
                {{ cancelling ? 'Cancelling...' : 'Yes, Cancel Permanently' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useToast } from 'vue-toastification'
import {
  fetchClosingPeriods,
  createClosingPeriod,
  submitClosingPeriod,
  getPeriodStartEndDate,
  getCompanies,
  getFiscalYears,
  getClosingAccounts,
  cancelClosingPeriod,
} from '@/services/api'

const toast = useToast()

// ---- State ----
const closingPeriods = ref([])
const companies = ref([])
const fiscalYears = ref([])
const closingAccounts = ref([])
const loading = ref(false)
const loadingAccounts = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const selectedPeriod = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const yearFilter = ref('')
const currentStep = ref(0)

//------------State Canacel Modal----------

const showCancelModal = ref(false)
const cancellingPeriod = ref(null)
const cancelling = ref(false)

const openCancelModal = (period) => {
  console.log("period.name",period.name)
  cancellingPeriod.value = period
  showCancelModal.value = true
}

const confirmCancel = async () => {
  cancelling.value = true
  const res = await cancelClosingPeriod(cancellingPeriod.value.name)
  console.log("res Cancel ",res)
  if (res.success) {
    toast.success(`${cancellingPeriod.value.name} cancelled successfully`)
    showCancelModal.value = false
    cancellingPeriod.value = null
    await loadPeriods()
  } else {
    toast.error('Failed to cancel: ' + res.error)
  }
  cancelling.value = false
}


const steps = ['Basic Info', 'Period Dates', 'Closing Account', 'Review & Confirm']

const formData = ref({
  transaction_date: '',
  company: '',
  fiscal_year: '',
  period_start_date: '',
  period_end_date: '',
  closing_account_head: '',
  remarks: '',
})

// ---- Computed ----
const completedCount = computed(() => closingPeriods.value.filter(p => p.gle_processing_status === 'Completed').length)
const inProgressCount = computed(() => closingPeriods.value.filter(p => p.gle_processing_status === 'In Progress').length)
const failedCount = computed(() => closingPeriods.value.filter(p => p.gle_processing_status === 'Failed').length)

const availableYears = computed(() => {
  const years = new Set(closingPeriods.value.map(p => p.fiscal_year).filter(Boolean))
  return [...years].sort((a, b) => b.localeCompare(a))
})

const filteredPeriods = computed(() =>
  closingPeriods.value.filter(period => {
    const matchSearch = !searchQuery.value ||
      (period.fiscal_year || '').includes(searchQuery.value) ||
      (period.company || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !statusFilter.value || period.gle_processing_status === statusFilter.value
    const matchYear = !yearFilter.value || period.fiscal_year === yearFilter.value
    return matchSearch && matchStatus && matchYear
  })
)

const reviewRows = computed(() => [
  { label: 'Transaction Date', value: formatDate(formData.value.transaction_date) },
  { label: 'Company', value: formData.value.company },
  { label: 'Fiscal Year', value: formData.value.fiscal_year },
  { label: 'Period Start', value: formatDate(formData.value.period_start_date) },
  { label: 'Period End', value: formatDate(formData.value.period_end_date) },
  { label: 'Closing Account', value: formData.value.closing_account_head },
  { label: 'Remarks', value: formData.value.remarks },
])

const viewModalRows = computed(() => {
  if (!selectedPeriod.value) return []
  return [
    { label: 'Fiscal Year', value: selectedPeriod.value.fiscal_year },
    { label: 'Company', value: selectedPeriod.value.company },
    { label: 'Transaction Date', value: formatDate(selectedPeriod.value.transaction_date) },
    { label: 'Period Start', value: formatDate(selectedPeriod.value.period_start_date) },
    { label: 'Period End', value: formatDate(selectedPeriod.value.period_end_date) },
    { label: 'GLE Status', value: selectedPeriod.value.gle_processing_status },
    { label: 'Doc Status', value: docStatusLabel(selectedPeriod.value.docstatus) },
    { label: 'Closing Account', value: selectedPeriod.value.closing_account_head, full: true },
    { label: 'Remarks', value: selectedPeriod.value.remarks, full: true },
  ]
})

// ---- Methods ----
const loadPeriods = async () => {
  loading.value = true
  const res = await fetchClosingPeriods()
  if (res.success) closingPeriods.value = res.data
  else toast.error('Failed to load periods: ' + res.error)
  loading.value = false
}

const openCreateModal = async () => {
  currentStep.value = 0
  formData.value = {
    transaction_date: new Date().toISOString().split('T')[0],
    company: '',
    fiscal_year: '',
    period_start_date: '',
    period_end_date: '',
    closing_account_head: '',
    remarks: '',
  }
  // Load dropdowns in parallel
  const [companiesData, fiscalYearsData] = await Promise.all([getCompanies(), getFiscalYears()])
  companies.value = companiesData
  fiscalYears.value = fiscalYearsData
  showModal.value = true
}

const onCompanyChange = () => {
  formData.value.closing_account_head = ''
  closingAccounts.value = []
}

const onFiscalYearChange = async () => {
  if (!formData.value.fiscal_year || !formData.value.company) return
  const res = await getPeriodStartEndDate(formData.value.fiscal_year, formData.value.company)
  if (res.success && res.data) {
    formData.value.period_start_date = res.data[0] || ''
    formData.value.period_end_date = res.data[1] || ''
  }
}

const nextStep = async () => {
  // Validate per step
  if (currentStep.value === 0) {
    if (!formData.value.transaction_date || !formData.value.company || !formData.value.fiscal_year) {
      toast.warning('Please fill all required fields')
      return
    }
  }
  if (currentStep.value === 1) {
    if (!formData.value.period_start_date || !formData.value.period_end_date) {
      toast.warning('Please set the period dates')
      return
    }
  }
  if (currentStep.value === 2) {
    // Load accounts when entering this step
    if (!formData.value.closing_account_head && formData.value.company) {
      loadingAccounts.value = true
      closingAccounts.value = await getClosingAccounts(formData.value.company)
      loadingAccounts.value = false
    }
    if (!formData.value.closing_account_head) {
      toast.warning('Please select a closing account')
      return
    }
  }
  // Load accounts on entering step 2
  if (currentStep.value === 1 && formData.value.company) {
    loadingAccounts.value = true
    closingAccounts.value = await getClosingAccounts(formData.value.company)
    loadingAccounts.value = false
  }
  currentStep.value++
}

const savePeriod = async () => {
  saving.value = true

  const createRes = await createClosingPeriod(formData.value)
  if (!createRes.success) {
    toast.error('Failed to create: ' + createRes.error)
    saving.value = false
    return
  }

  const submitRes = await submitClosingPeriod(createRes.data.name)
  if (!submitRes.success) {
    toast.error('Created but failed to submit: ' + submitRes.error)
  } else {
    toast.success('Period closed and submitted successfully!')
    showModal.value = false
    await loadPeriods()
  }

  saving.value = false
}

const viewPeriod = (period) => {
  selectedPeriod.value = period
  showViewModal.value = true
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB')
}

const gleStatusClass = (status) => {
  if (status === 'Completed') return 'bg-green-100 text-green-700'
  if (status === 'Failed') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

const gleStatusDot = (status) => {
  if (status === 'Completed') return 'bg-green-500'
  if (status === 'Failed') return 'bg-red-500'
  return 'bg-yellow-500'
}

const docStatusClass = (status) => {
  if (status === 1) return 'bg-blue-100 text-blue-700'
  if (status === 2) return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}

const docStatusLabel = (status) => {
  if (status === 1) return 'Submitted'
  if (status === 2) return 'Cancelled'
  return 'Draft'
}

onMounted(() => {
  loadPeriods()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}
</style>
