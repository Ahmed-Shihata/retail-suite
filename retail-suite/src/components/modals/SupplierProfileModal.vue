<!-- SupplierProfileModal.vue -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Supplier Profile</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <!-- Profile Content -->
      <div class="px-6 py-6 space-y-8">

        <!-- Header Card with Status -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ supplier.name }}</h3>
              <p class="text-sm text-gray-600 mt-1">Supplier Profile</p>
            </div>
            <span :class="getStatusClass(supplier.status)" class="px-4 py-2 rounded-full text-sm font-semibold">
              {{ getStatusLabel(supplier.status) }}
            </span>
          </div>
        </div>

        <!-- Contact Information -->
        <section class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 uppercase">Contact Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Email</p>
              <p class="text-sm text-gray-900 font-medium">{{ supplier.email || 'N/A' }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">First Phone</p>
              <p class="text-sm text-gray-900 font-medium">{{ supplier.first_mobile || 'N/A' }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Second Phone</p>
              <p class="text-sm text-gray-900 font-medium">{{ supplier.second_mobile || 'N/A' }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Address</p>
              <p class="text-sm text-gray-900 font-medium">{{ supplier.address || 'N/A' }}</p>
            </div>
          </div>
        </section>

        <!-- Financial Information -->
        <section class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 uppercase">Financial Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="bg-red-50 rounded-lg p-4 border border-red-200">
              <p class="text-xs font-semibold text-red-700 uppercase mb-1">Due Amount</p>
              <p class="text-2xl font-bold text-red-600">{{ formatCurrency(supplier.due_amount, currencyCode, locale) }}</p>
              <p class="text-xs text-red-600 mt-1">Amount to be paid</p>
            </div>

            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <p class="text-xs font-semibold text-green-700 uppercase mb-1">Total Supplies</p>
              <p class="text-2xl font-bold text-green-600">{{ formatCurrency(supplier.totalSupplies, currencyCode, locale) }}</p>
              <p class="text-xs text-green-600 mt-1">Total value of supplies</p>
            </div>
          </div>
        </section>

        <!-- Additional Notes -->
        <section class="space-y-4" v-if="supplier.notes">
          <h4 class="text-sm font-semibold text-gray-900 uppercase">Notes</h4>
          <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p class="text-sm text-gray-900 whitespace-pre-line">{{ supplier.notes }}</p>
          </div>
        </section>

        <!-- Metadata -->
        <section class="space-y-4 border-t border-gray-200 pt-6">
          <h4 class="text-sm font-semibold text-gray-900 uppercase">Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Created Date</p>
              <p class="text-sm text-gray-900 font-medium">{{ formatDate(supplier.createdAt) }}</p>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-1">Supplier ID</p>
              <p class="text-sm text-gray-900 font-medium">#{{ supplier.id }}</p>
            </div>
          </div>
        </section>

        <!-- Close Button -->
        <div class="flex gap-3 pt-4 border-t border-gray-200">
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters.js'
import { useSettingsStore } from "@/stores/settings"

  const props = defineProps({
    supplier: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits(['close'])

    const settingsStore = useSettingsStore()
    const currencyCode = settingsStore?.settings?.store?.currencyCode || "USD"
    const locale = settingsStore?.settings?.store?.local || "en-US"

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        blocked: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        inactive: 'Inactive',
        blocked: 'Blocked'
      }
      return labels[status] || status
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
</script>

<style scoped>
</style>
