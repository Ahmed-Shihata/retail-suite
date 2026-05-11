<template>
<div class="rounded-xl shadow-sm p-5"
     style="
       background: var(--card-bg);
       border: 1px solid var(--card-border);
     ">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold flex items-center gap-2"
        style="color: var(--text-title);">
        <Filter class="w-4 h-4 text-gray-500" />
        Report Filters
      </h3>
      <button
        @click="resetFilters"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Reset
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Company -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Company</label>
        <select
          v-model="filters.company"
          @change="applyFilters"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select Company</option>
          <option v-for="company in companies" :key="company.name" :value="company.name">
            {{ company.name }}
          </option>
        </select>
      </div>

      <!-- Filter By -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Filter By</label>
        <select
          v-model="filters.filter_based_on"
          @change="applyFilters"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          <option value="Fiscal Year">Fiscal Year</option>
          <option value="Date Range">Date Range</option>
        </select>
      </div>

      <!-- Fiscal Year fields -->
      <template v-if="filters.filter_based_on === 'Fiscal Year'">
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">From Year</label>
          <select
            v-model="filters.from_fiscal_year"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">Select Year</option>
            <option v-for="fy in fiscalYears" :key="fy.name" :value="fy.name">
              {{ fy.name }} ({{ formatDate(fy.year_start_date) }} – {{ formatDate(fy.year_end_date) }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">To Year</label>
          <select
            v-model="filters.to_fiscal_year"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">Select Year</option>
            <option v-for="fy in fiscalYears" :key="fy.name" :value="fy.name">
              {{ fy.name }} ({{ formatDate(fy.year_start_date) }} – {{ formatDate(fy.year_end_date) }})
            </option>
          </select>
        </div>
      </template>

      <!-- Date Range fields -->
      <template v-if="filters.filter_based_on === 'Date Range'">
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">From Date</label>
          <input
            v-model="filters.from_date"
            type="date"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">To Date</label>
          <input
            v-model="filters.to_date"
            type="date"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </template>

      <!-- Periodicity -->
      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Periodicity</label>
        <select
          v-model="filters.periodicity"
          @change="applyFilters"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        >
          <option value="Yearly">Yearly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <!-- Accumulated Values -->
      <div class="flex items-end pb-0.5">
        <label class="flex items-center gap-2 cursor-pointer group">
          <div
            @click="toggleAccumulated"
            :class="[
              'w-9 h-5 rounded-full transition-all cursor-pointer relative',
              filters.accumulated_values ? 'bg-blue-600' : 'bg-gray-300'
            ]"
          >
            <div :class="[
              'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
              filters.accumulated_values ? 'left-4' : 'left-0.5'
            ]"></div>
          </div>
          <span class="text-sm font-medium text-gray-700">Accumulated</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Filter, RotateCcw } from 'lucide-vue-next'
import { getCompanies, getFiscalYears } from '@/services/api'


  const emit = defineEmits(['apply-filters'])

    const filters = ref({
      company: 'pos',
      filter_based_on: 'Fiscal Year',
      from_fiscal_year: '2025',
      to_fiscal_year: '2025',
      from_date: '2025-01-01',
      to_date: '2025-12-31',
      periodicity: 'Yearly',
      accumulated_values: false,
    })

    const companies  = ref([])
    const fiscalYears = ref([])

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
    }

    const applyFilters = () => emit('apply-filters', { ...filters.value })

    const toggleAccumulated = () => {
      filters.value.accumulated_values = !filters.value.accumulated_values
      applyFilters()
    }

    const resetFilters = () => {
      filters.value = {
        company: 'pos',
        filter_based_on: 'Fiscal Year',
        from_fiscal_year: fiscalYears.value[0]?.name || '2025',
        to_fiscal_year: fiscalYears.value[0]?.name || '2025',
        from_date: '2025-01-01',
        to_date: '2025-12-31',
        periodicity: 'Yearly',
        accumulated_values: false,
      }
      applyFilters()
    }

    onMounted(async () => {
      ;[companies.value, fiscalYears.value] = await Promise.all([getCompanies(), getFiscalYears()])
    })

</script>
