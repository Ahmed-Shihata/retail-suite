<!-- CustomerSection.vue -->
<template>
  <div
    class="p-4"
    :style="{ borderBottom: '1px solid var(--card-border)' }"
  >
    <div
      class="flex items-stretch rounded-lg overflow-hidden"
      :style="{
        border: '1px solid var(--input-border)',
        background: 'var(--input-bg)'
      }"
    >
      <!-- Customer Select -->
      <select
        v-model="selectedCustomer"
        @change="handleCustomerChange"
        class="flex-grow p-2 px-3 outline-none cursor-pointer transition-all"
        :style="{
          background: 'var(--input-bg)',
          color: 'var(--text-main)',
          border: 'none'
        }"
      >
        <option value="">+ {{ __('Create New Customer') }}</option>
        <option
          v-for="cust in customers"
          :key="cust.name"
          :value="cust.name"
        >
          {{ cust.customer_name }}
        </option>
      </select>

      <!-- Add Customer Button -->
      <button
        @click="showAddCustomerModal = true"
        class="flex items-center gap-2 px-3 py-2 font-bold text-white focus:outline-none transition-all whitespace-nowrap shadow-sm"
        :style="{
          background: primaryColor,
          color: '#fff',
          borderLeft: '1px solid var(--card-border)'
        }"
        :title="__('Create New Customer')"
      >
        <svg class="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
        </svg>
        <span class="font-semibold text-sm">{{ __('Customer') }}</span>
      </button>
    </div>
  </div>

  <div class="mb-8">
    <UpdateCustomer
      v-show="showAddCustomerModal"
      :model-value="showAddCustomerModal"
      :customer-id="customer_id"
      :customer-info="customer_info"
      :pos_profile_doc="pos_profile"
      :customers="customers"
      :selectedCustomer="selectedCustomer"
      @close="closeCustomerModal"
      @customer-added="handleCustomerUpdated"
      @clickOutside="closeCustomerModal"
      @customer-updated="handleCustomerUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import UpdateCustomer from '../modals/UpdateCustomer.vue'
import { useShiftStore } from '@/stores/shift.js'
import { useSettingsStore } from '@/stores/settings'
const emit = defineEmits(['customer-selected'])
const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)
const primaryColor = computed(() => {
  return settings.value?.appearance?.primaryColor || '#06b6d4'
})

const selectedCustomer = ref('')
const customers = ref([])
const customer_id = ref(null)
const customer_info = ref({})
const showAddCustomerModal = ref(false)


const shiftStore = useShiftStore()
const pos_profile = computed(() => shiftStore.pos_profile || {})

const loadCustomers = async () => {
  try {
    const customersList = await shiftStore.getCustomers(JSON.stringify(pos_profile.value))
    if (customersList) {
      customers.value = customersList
      return customersList
    }else{
      return "skipped"
    }
  } catch (e) {
    console.error('Failed to load customers:', e)
  }
}

// فتح مودال جديد
const handleCustomerChange = () => {
  if (!selectedCustomer.value) {
    // case: Create new customer
    showAddCustomerModal.value = true
    customer_id.value = null
    customer_info.value = {}
  } else {
    // case: Select existing customer
    const cust = customers.value.find(c => c.name === selectedCustomer.value)
    if (cust) {
      console.log('Selected customer info:', cust)
      customer_id.value = cust.name
      customer_info.value = { ...cust }
      emit('customer-selected', cust)
    }
  }
}


const handleCustomerUpdated = async (updatedCustomer) => {

  const res = await loadCustomers()
  const existingIndex = res.findIndex(c => c.name === updatedCustomer.name)

  if (existingIndex !== -1) {

    customers.value[existingIndex] = { ...updatedCustomer }
  } else {
    customers.value.push({ ...updatedCustomer })
  }

  customer_id.value = updatedCustomer.name
  customer_info.value = { ...updatedCustomer }
  selectedCustomer.value = updatedCustomer.name
  shiftStore.setCustomer(updatedCustomer)
  emit('customer-selected', updatedCustomer)
}

const closeCustomerModal = () => {
  showAddCustomerModal.value = false
  const currentCustomer = shiftStore.$state.currentCustomer
  if (currentCustomer?.name) {
    const cust = customers.value.find(c => c.name === currentCustomer.name)
    if (cust) {
      selectedCustomer.value = cust.name
      customer_id.value = cust.name
      customer_info.value = { ...cust }
      emit('customer-selected', cust)
    }
  }
}
watch(
  [() => customers.value, () => pos_profile.value],
  ([customerList, profile]) => {
    if (!customerList?.length || !profile?.customer) return

    if (!selectedCustomer.value) {
      const defaultCustomer = customerList.find(
        c => c.name === profile.customer
      )

      if (defaultCustomer) {
        selectedCustomer.value = defaultCustomer.name
        customer_id.value = defaultCustomer.name
        customer_info.value = { ...defaultCustomer }

        shiftStore.setCustomer(defaultCustomer)
        emit('customer-selected', defaultCustomer)

      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  const list = await loadCustomers()
  const savedCustomer = shiftStore.$state.currentCustomer
  if (savedCustomer?.name && list) {
    const exists = list.find(c => c.name === savedCustomer.name)
    if (exists) {
      selectedCustomer.value = exists.name
      customer_id.value = exists.name
      customer_info.value = { ...exists }
      emit("customer-selected", exists)
    }
  }
})

</script>
