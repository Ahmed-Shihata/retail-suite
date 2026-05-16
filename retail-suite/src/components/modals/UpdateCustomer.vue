<template>
  <div v-if="internalDialog"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5)"
        @click.self="handleOutsideClick">

    <div class="w-full max-w-xl rounded-xl overflow-hidden"
          :style="{ background: 'var(--card-bg)', border: '0.5px solid var(--card-border)' }">

      <!-- Header -->
      <div class="flex items-center gap-3 px-6 py-5"
            :style="{ borderBottom: '0.5px solid var(--card-border)' }">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
              :style="{ background: 'var(--info-bg)', color: 'var(--focus-ring)' }">
          {{ avatarInitials }}
        </div>
        <div>
          <div class="text-base font-medium" :style="{ color: 'var(--text-main)' }">
            {{ customer_id ? 'Update customer' : 'Create customer' }}
          </div>
          <div class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">
            {{ customer_id ? 'Edit customer details below' : 'Fill in the details below to add a new customer' }}
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto" style="max-height: 70vh;">

        <!-- Customer Info -->
        <div class="px-6 py-5">
          <div class="section-label">Customer info</div>
          <div class="flex flex-col gap-3">
            <div class="field-wrap">
              <label class="field-label">Customer name <span class="text-red-400">*</span></label>
              <input v-model="form.customer_name" type="text"
                      placeholder="e.g. Mohamed Ali" class="field-input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field-wrap">
                <label class="field-label">Territory</label>
                <select v-model="form.territory" class="field-input">
                  <option value="">— select —</option>
                  <option v-for="t in territories" :key="t.name" :value="t.name">{{ t.name }}</option>
                </select>
              </div>
              <div class="field-wrap">
                <label class="field-label">Customer type</label>
                <select v-model="form.customer_type" class="field-input">
                  <option>Individual</option>
                  <option>Company</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="px-6 py-5" :style="{ borderTop: '0.5px solid var(--card-border)' }">
          <div class="section-label">
            Contact
            <span class="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ml-2"
                  :style="{ background: 'var(--info-bg)', color: 'var(--focus-ring)', border: '0.5px solid var(--info-border)' }">
              primary
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="field-wrap">
                <label class="field-label">First name <span class="text-red-400">*</span></label>
                <input v-model="form.first_name" type="text" class="field-input" />
              </div>
              <div class="field-wrap">
                <label class="field-label">Last name</label>
                <input v-model="form.last_name" type="text" class="field-input" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field-wrap">
                <label class="field-label">Primary mobile <span class="text-red-400">*</span></label>
                <input v-model="form.primary_mobile" type="tel"
                        placeholder="010xxxxxxxx" class="field-input" />
              </div>
              <div class="field-wrap">
                <label class="field-label">Secondary mobile</label>
                <input v-model="form.secondary_mobile" type="tel"
                        placeholder="011xxxxxxxx" class="field-input" />
              </div>
            </div>
            <div class="field-wrap">
              <label class="field-label">Email</label>
              <input v-model="form.email_id" type="email"
                      placeholder="email@example.com" class="field-input" />
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="px-6 py-5" :style="{ borderTop: '0.5px solid var(--card-border)' }">
          <div class="section-label">Address</div>
          <div class="flex flex-col gap-3">
            <div class="field-wrap">
              <label class="field-label">Address line 1 <span class="text-red-400">*</span></label>
              <input v-model="form.address_line1" type="text"
                      placeholder="Street, building..." class="field-input" />
            </div>
            <div class="field-wrap">
              <label class="field-label">Address line 2</label>
              <input v-model="form.address_line2" type="text"
                      placeholder="Apartment, floor..." class="field-input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field-wrap">
                <label class="field-label">City <span class="text-red-400">*</span></label>
                <input v-model="form.city" type="text" class="field-input" />
              </div>
              <div class="field-wrap">
                <label class="field-label">State</label>
                <input v-model="form.state" type="text" class="field-input" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field-wrap">
                <label class="field-label">Country</label>
                <select v-model="form.country" class="field-input">
                  <option v-for="c in countries" :key="c.name" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
              <div class="field-wrap">
                <label class="field-label">Pincode</label>
                <input v-model="form.pincode" type="text" class="field-input" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="flex justify-end items-center gap-2 px-6 py-4"
            :style="{ borderTop: '0.5px solid var(--card-border)', background: 'var(--item-bg)' }">
        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :style="{ color: 'var(--text-muted)' }"
                @click="closeDialog">
          Cancel
        </button>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-opacity disabled:opacity-60"
                :style="{ background: 'var(--btn-primary)' }"
                :disabled="saving"
                @click="submitUpdate">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving...' : 'Save customer' }}
        </button>
      </div>

    </div>
  </div>
</template>
<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-sub);
}

.field-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: var(--input-bg);
  color: var(--text-main);
  border: 1px solid var(--input-border);
}

.field-input:focus {
  border-color: var(--focus-ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus-ring) 15%, transparent);
}

.field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

/* Native select arrow fix in dark mode */
.field-input option {
  background: var(--input-bg);
  color: var(--text-main);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .w-full,
.modal-leave-active .w-full {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .w-full {
  transform: translateY(8px) scale(0.98);
}
</style>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import {
  getCustomerAddressesApi,
  getTerritoriesApi,
  getCountriesApi
} from '../../services/api'
import { createUpdateCustomerInFrappeDB, getCustomersFromFrappeDB } from '@/composables/shift'
const toast = useToast()

const props = defineProps({
  modelValue:       { type: Boolean, default: false },
  customerId:       { type: [String, Number, null], default: null },
  customerInfo:     { type: Object, default: () => ({}) },
  customers:        { type: Array,  default: () => [] },
  pos_profile_doc:  { type: Object, default: () => ({}) },
  selectedCustomer: { type: String, default: '' },
})

const emit = defineEmits(['close', 'customer-added', 'customer-updated', 'clickOutside'])

const internalDialog      = ref(props.modelValue)
const saving              = ref(false)
const customer_id         = ref(props.customerId)
const territories         = ref([])
const loadingTerritories  = ref(false)
const countries        = ref([])
const loadingCountries = ref(false)

const getDefaultForm = () => ({
  customer_name:    '',
  territory:        '',
  customer_type:    'Individual',
  first_name:       '',
  last_name:        '',
  primary_mobile:   '',
  secondary_mobile: '',
  email_id:         '',
  address_line1:    '',
  address_line2:    '',
  city:             '',
  state:            '',
  country:          'Egypt',
  pincode:          '',
})

const form = ref(getDefaultForm())

const avatarInitials = computed(() => {
  const name = form.value.customer_name || ''
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'NA'
})

const resetForm = () => {
  form.value    = getDefaultForm()
  customer_id.value = null
}

const loadTerritories = async () => {
  if (territories.value.length) return
  loadingTerritories.value = true
  try {
    territories.value = await getTerritoriesApi()
  } catch (e) {
    console.warn('Territories load error', e)
  } finally {
    loadingTerritories.value = false
  }
}

const loadCountries = async () => {
  if (countries.value.length) return
  loadingCountries.value = true
  try {
    countries.value = await getCountriesApi()
  } catch (e) {
    console.warn('Countries load error', e)
  } finally {
    loadingCountries.value = false
  }
}

const loadCustomerData = async () => {
  await nextTick()
  customer_id.value = props.customerId || null

  if (!customer_id.value) {
    resetForm()
    return
  }

  // Customer basic info
  const list = await getCustomersFromFrappeDB(JSON.stringify(props.pos_profile_doc))
  const cust = (list || []).find(c => c.name === customer_id.value)
  if (cust) {
    form.value.customer_name  = cust.customer_name || cust.name || ''
    form.value.territory      = cust.territory     || ''
    form.value.customer_type  = cust.customer_type || 'Individual'
  }

  // Contact info
  try {
    const contacts = props.customerInfo?.contacts || []
    const primary  = contacts.find(c => c.is_primary_contact) || contacts[0]
    if (primary) {
      form.value.first_name       = primary.first_name || ''
      form.value.last_name        = primary.last_name  || ''
      form.value.primary_mobile   = primary.phone_nos?.find(p => p.is_primary_mobile_no)?.phone
                                 || primary.phone_nos?.[0]?.phone || ''
      form.value.secondary_mobile = primary.phone_nos?.filter(p => !p.is_primary_mobile_no)?.[0]?.phone || ''
      form.value.email_id         = primary.email_ids?.find(e => e.is_primary)?.email_id
                                 || primary.email_ids?.[0]?.email_id || ''
    }
  } catch (e) { console.warn('Contact load error', e) }

  // Address info
  try {
    const addresses = await getCustomerAddressesApi(customer_id.value)
    const primary   = (addresses || []).find(a => a.is_primary_address) || addresses?.[0]
    if (primary) {
      form.value.address_line1 = primary.address_line1 || ''
      form.value.address_line2 = primary.address_line2 || ''
      form.value.city          = primary.city          || ''
      form.value.state         = primary.state         || ''
      form.value.country       = primary.country       || 'Egypt'
      form.value.pincode       = primary.pincode       || ''
    }
  } catch (e) { console.warn('Address load error', e) }
}

watch(() => props.modelValue, (val) => {
  internalDialog.value = val
  if (val) {
    loadTerritories()
    loadCountries()
    loadCustomerData()
  } else {
    resetForm()
  }
})

watch(internalDialog, (val) => {
  if (!val) emit('close')
})

const submitUpdate = async () => {
  if (!form.value.customer_name)  return toast.warning('Customer name is required')
  if (!form.value.first_name)     return toast.warning('First name is required')
  if (!form.value.primary_mobile) return toast.warning('Primary mobile is required')
  if (!form.value.address_line1)  return toast.warning('Address line 1 is required')
  if (!form.value.city)           return toast.warning('City is required')

  saving.value = true
  try {
    const savedCustomer = await createUpdateCustomerInFrappeDB({
      method:          customer_id.value ? 'update' : 'create',
      customer_id:     customer_id.value || '',
      customer_name:   form.value.customer_name,
      pos_profile_doc: props.pos_profile_doc || {},
      territory:       form.value.territory    || '',
      customer_type:   form.value.customer_type || 'Individual',
      // contact
      first_name:      form.value.first_name,
      last_name:       form.value.last_name        || '',
      first_mobile:    form.value.primary_mobile,
      second_mobile:   form.value.secondary_mobile || '',
      email_id:        form.value.email_id         || '',
      // address
      city:            form.value.city,
      address_line1:   form.value.address_line1,
      address_line2:   form.value.address_line2    || '',
      state:           form.value.state            || '',
      country:         form.value.country          || 'Egypt',
      pincode:         form.value.pincode          || '',
    })

    if (!savedCustomer) throw new Error('Failed to save customer')

    toast.success(`Customer ${customer_id.value ? 'updated' : 'created'} successfully!`)

    emit(customer_id.value ? 'customer-updated' : 'customer-added', {
      ...savedCustomer,
      name:          savedCustomer.name || customer_id.value,
      customer_name: form.value.customer_name,
    })

    closeDialog()
  } catch (e) {
    console.error('Save error:', e)
    toast.error('Failed to save. Please try again.')
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  internalDialog.value = false
  emit('close')
  resetForm()
}

const handleOutsideClick = () => {
  emit('clickOutside')
  closeDialog()
}
</script>
