<!-- SupplierProfile.vue -->
<template>

    <div class="w-full flex min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class="flex flex-col flex-1 min-h-screen">
        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <router-link to="/suppliers" class="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7" />
                </svg>
              </router-link>
              <div>
                <h1 class="text-lg font-bold text-gray-900">{{ supplier.name }}</h1>
                <p class="text-sm text-gray-600">{{ supplierContacts.email_id|| 'No email' }} • {{ supplierContacts.mobile_no || 'No mobile_no' }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="openCreateModal"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus class="w-5 h-5" />
                Edit Supplier
              </button>
              <button @click="printProfile" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                🖨️ Print
              </button>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12 px-6">
          <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ error }}</p>
        </div>

        <!-- Main Content -->
        <div v-else class="flex-1 px-6 py-8 space-y-6">
          <!-- Statistics Cards -->
          <section class="flex-shrink-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="Total Supplies" :value="formatCurrency(supplier.totalSupplies)" icon="TrendingUp" color="green" />
              <StatsCard title="Due Amount" :value="formatCurrency(supplier.due_amount)" icon="AlertCircle" color="red" />
              <StatsCard title="Number of Invoices" :value="purchases.length" icon="Package" color="blue" />
              <StatsCard title="Average Invoice" :value="formatCurrency(averageOrder)" icon="BarChart3" color="purple" />
            </div>
          </section>

          <!-- Main Card with Tabs -->
          <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200 bg-gray-50">
              <div class="px-6 flex flex-wrap gap-8">
                <button
                  @click="activeTab = 'info'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                  📋 Information
                </button>
                <button
                  @click="activeTab = 'purchases'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'purchases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                  📦 Purchase History
                </button>
                <button
                  @click="activeTab = 'transactions'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'transactions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                  📊 Account Statement
                </button>
                  <button
                  @click="activeTab = 'contacts'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'contacts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                   📞 Contacts
                </button>
                  <button
                  @click="activeTab = 'addresses'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'addresses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                   📍 Addresses
                </button>
                <button
                  @click="activeTab = 'documents'"
                  :class="['py-4 font-medium border-b-2 transition', activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
                >
                  📄 Documents
                </button>
              </div>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Info Tab -->
              <div v-if="activeTab === 'info'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Business Information -->
                  <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span class="text-2xl">🏢</span> Supplier Information
                    </h3>
                    <div class="space-y-4">
                      <InfoField label="Supplier Name" :value="supplier.supplier_name" />
                      <InfoField label="Email" :value="supplierContacts.email_id" />
                      <InfoField label="mobile No" :value="supplierContacts.mobile_no" />
                      <InfoField label="phone" :value="supplierContacts.phone" />
                      <InfoField label="Address" :value="(supplierAddresses.address_line1 || '') + ', ' + (supplierAddresses.address_line2 || '') +', '+ (supplierAddresses.country || '') + ', ' + (supplierAddresses.city || '') + ', ' + (supplierAddresses.state || '') + ', ' + (supplierAddresses.postal_code || '  -')" />
                      <InfoField label="Tax ID" :value="supplier.tax_id" />
                    </div>
                  </div>

                  <!-- Financial Information -->
                  <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span class="text-2xl">💰</span> Financial Information
                    </h3>
                    <div class="space-y-3">
                      <div class="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                        <span class="text-sm text-gray-600 font-semibold">Total Supplies</span>
                        <span class="text-gray-900 font-bold">{{ formatCurrency(supplier.totalSupplies || 0) }}</span>
                      </div>
                      <div class="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                        <span class="text-sm text-gray-600 font-semibold">Due Amount</span>
                        <span class="text-red-600 font-bold">{{ formatCurrency(supplier.due_amount || 0) }}</span>
                      </div>
                      <div class="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                        <span class="text-sm text-gray-600 font-semibold">Payment Terms</span>
                        <span class="text-gray-900 font-bold">{{ supplier.paymentTerms || 0 }} days</span>
                      </div>
                      <div class="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                        <span class="text-sm text-gray-600 font-semibold">Status</span>
                        <span :class="getStatusClass(supplier.status)" class="px-3 py-1 rounded text-xs font-semibold">
                          {{ getStatusLabel(supplier.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes Section -->
                <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 class="font-semibold text-gray-900 mb-2">📝 Notes</h3>
                  <p class="text-gray-700">{{ supplier.custom_note || 'No notes' }}</p>
                </div>
              </div>

              <!-- Purchases Tab -->
              <div v-if="activeTab === 'purchases'" class="space-y-4">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold">Purchase History ({{ purchases.length }} invoices)</h3>
                  <input
                    v-model="purchaseFilter"
                    type="text"
                    placeholder="Search invoices..."
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div v-if="purchases.length > 0" class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Invoice Number</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Paid</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Remaining</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="purchase in purchases" :key="purchase.id" class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3 font-medium text-gray-900">#{{ purchase.invoice_name }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ purchase.date }}</td>
                        <td class="px-4 py-3 font-bold text-gray-900">{{ formatCurrency(purchase.amount) }}</td>
                        <td class="px-4 py-3 text-green-600 font-semibold">{{ formatCurrency(purchase.paid || 0) }}</td>
                        <td class="px-4 py-3 text-red-600 font-semibold">{{ formatCurrency(purchase.remaining || 0) }}</td>
                        <td class="px-4 py-3">
                          <span :class="getPurchaseStatusClass(purchase.status)" class="px-2 py-1 rounded text-xs font-semibold">
                            {{ getPurchaseStatusLabel(purchase.status) }}
                          </span>
                        </td>
                        <td class="px-4 py-3">
                          <button class="text-blue-600 hover:text-blue-900 transition text-sm font-medium">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  No purchase invoices
                </div>
              </div>

              <!-- Transactions Tab -->
              <div v-if="activeTab === 'transactions'" class="space-y-4">
                <div class="flex gap-4 mb-4 items-end">
                  <div>
                    <label class="text-sm text-gray-600 font-semibold">From</label>
                    <input
                      v-model="dateFilterFrom"
                      type="date"
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600 font-semibold">To</label>
                    <input
                      v-model="dateFilterTo"
                      type="date"
                      class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                    />
                  </div>
                  <button @click="applyDateFilter" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Apply
                  </button>
                </div>

                <div v-if="transactions.length > 0" class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Debit (Due to us)</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Credit (Due from us)</th>
                        <th class="px-4 py-3 text-left font-semibold text-gray-900">Balance</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="(trans, idx) in transactions" :key="idx" class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3 text-gray-600">{{ trans.date }}</td>
                        <td class="px-4 py-3 text-gray-900">{{ trans.description }}</td>
                        <td class="px-4 py-3 font-bold text-green-600">{{ trans.debit ? formatCurrency(trans.debit) : formatCurrency(0) }}</td>
                        <td class="px-4 py-3 font-bold text-red-600">{{ trans.credit ? formatCurrency(trans.credit) : formatCurrency(0) }}</td>
                        <td class="px-4 py-3 font-bold" :class="trans.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                          {{ formatCurrency(Math.abs(trans.balance)) }}
                          <span class="text-xs" :class="trans.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                            ({{ trans.balance >= 0 ? 'Due to us' : 'Due from us' }})
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Summary -->
                <div class="grid grid-cols-3 gap-4 mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p class="text-sm text-gray-600 font-semibold">Total Debit (Due to us)</p>
                    <p class="text-2xl font-bold text-green-600 mt-2">{{ formatCurrency(totalDebit) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 font-semibold">Total Credit (Due from us)</p>
                    <p class="text-2xl font-bold text-red-600 mt-2">{{ formatCurrency(totalCredit) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600 font-semibold">Final Balance</p>
                    <p :class="['text-2xl font-bold mt-2', (totalDebit - totalCredit) <= 0 ? 'text-red-600' : 'text-green-600']">
                      {{ formatCurrency(Math.abs(totalDebit - totalCredit)) }}
                    </p>
                  </div>
                </div>
              </div>
              <!-- contacts Tab -->
              <div v-if="activeTab === 'contacts'" class="space-y-4">
                 <div v-if="supplierContacts">
                    <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">📞</span>
                          Contact Details
                      </h3>
                      <div class="space-y-4">
                        <InfoField label="Name" :value="supplierContacts.name" />
                        <InfoField label="Email" :value="supplierContacts.email_id" />
                        <InfoField label="Mobile No" :value="supplierContacts.mobile_no" />
                      </div>
                    </div>
                 </div>
                <div v-else class="text-center py-8 text-gray-500">
                  No contacts available.
                </div>
                <button
                    @click="openContactModal"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Edit Contact
                  </button>
              </div>
              <!-- Addresses Tab -->
              <div v-if="activeTab === 'addresses'" class="space-y-4">
                <div v-if="supplierAddresses">
                    <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">📍</span>
                          Address Details
                      </h3>
                      <div class="space-y-4">
                        <InfoField label="Address Line 1" :value="supplierAddresses.address_line1" />
                        <InfoField label="Address Line 2" :value="supplierAddresses.address_line2" />
                        <InfoField label="City" :value="supplierAddresses.city" />
                        <InfoField label="State" :value="supplierAddresses.state" />
                        <InfoField label="Country" :value="supplierAddresses.country" />
                        <InfoField label="Pin Code" :value="supplierAddresses.pin_code" />
                      </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  No addresses available.
                </div>
                <button
                    @click="openAddressModal"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Edit Address
                </button>
              </div>

              <!-- Documents Tab -->
              <div v-if="activeTab === 'documents'" class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    📤 Upload Document
                  </button>
                </div>

                <div v-if="documents.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div v-for="doc in documents" :key="doc.id" class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow transition">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-gray-900">{{ doc.name }}</h4>
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ doc.type }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ doc.uploadedAt }}</p>
                    <div class="flex gap-2">
                      <button class="flex-1 text-blue-600 hover:text-blue-900 text-sm transition font-medium">📥 Download</button>
                      <button class="flex-1 text-red-600 hover:text-red-900 text-sm transition font-medium">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  No attached documents
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <SupplierModal
      v-if="showModal"
      :supplierGroups="supplierGroups"
      :supplier="editingSupplier"
      :contacts="editSupplierContacts"
      :addresses="editSupplierAddresses"
      :editType="editType"
      @save="saveSupplier"
      @close="showModal = false"
    />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'


import StatsCard from '@/layout/StatsCard.vue'
import InfoField from '@/components/modals/InfoField.vue'
import SupplierModal from '@/components/modals/SupplierModal.vue'

import { useSuppliersStore } from '@/stores/suppliers.js'
import { formatCurrency } from '@/utils/formatters.js'

/* ============================
   Router & Store
============================ */
const route = useRoute()
const supplierName = route.params.supplier_name
const supplierStore = useSuppliersStore()

/* ============================
   State
============================ */
const showModal = ref(false)
const editingSupplier = ref(null)
const loading = ref(false)
const error = ref(null)
const activeTab = ref('info')

// supplier | contact | address
const editType = ref('supplier')
const editSupplierContacts = ref({})
const editSupplierAddresses = ref({})
const purchaseFilter = ref('')
const dateFilterFrom = ref('2025-01-01')
const dateFilterTo = ref('2025-01-31')

const supplier = ref({})
const purchases = ref([])
const transactions = ref([])
const documents = ref([])

const supplierContacts = ref([])
const supplierAddresses = ref({})
/* ============================
   Computed Properties
============================ */
const supplierGroups = computed(() => supplierStore.supplierGroups || [])
const averageOrder = computed(() => {
  if (!purchases.value.length) return 0
  return (
    purchases.value.reduce((sum, p) => sum + p.amount, 0) /
    purchases.value.length
  )
})

const totalDebit = computed(() =>
  transactions.value.reduce((sum, t) => sum + (t.debit || 0), 0)
)

const totalCredit = computed(() =>
  transactions.value.reduce((sum, t) => sum + (t.credit || 0), 0)
)

/* ============================
   Helper Functions
============================ */
const getStatusClass = (status) => ({
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  blocked: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-800')

const getStatusLabel = (status) => ({
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked'
}[status] || status)

const getPurchaseStatusClass = (status) => ({
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-800')

const getPurchaseStatusLabel = (status) => ({
  paid: 'Paid',
  pending: 'Pending',
  partial: 'Partial',
  cancelled: 'Cancelled'
}[status] || status)

/* ============================
   Actions
============================ */
const applyDateFilter = () => {
  console.log(`Filtering from ${dateFilterFrom.value} to ${dateFilterTo.value}`)
}

const printProfile = () => {
  window.print()
}

const openNewSupplierModal = () => {

  editingSupplier.value = null
  showModal.value = true
}

const openCreateModal = () => {
  console.log('Opening create/edit modal for supplier:', supplier.value)
  console.log('Current supplier contacts:', supplierContacts.value)
  console.log('Current supplier addresses:', supplierAddresses.value)
  editType.value = 'supplier'
  editingSupplier.value = { ...supplier.value } // فيه name
  editSupplierContacts.value = { ...supplierContacts.value }
  editSupplierAddresses.value = { ...supplierAddresses.value }
  showModal.value = true
}

const openContactModal = () => {
  editType.value = 'contact'
  editingSupplier.value = { ...supplier.value } // فيه name
  editSupplierContacts.value = { ...supplierContacts.value }
  editSupplierAddresses.value = { ...supplierAddresses.value }
  showModal.value = true
}

const openAddressModal = () => {
  editType.value = 'address'
  editingSupplier.value = { ...supplier.value } // فيه name
  editSupplierContacts.value = { ...supplierContacts.value }
  editSupplierAddresses.value = { ...supplierAddresses.value }
  showModal.value = true
}

/* ============================
   API Functions
============================ */
const loadSupplierFullData = async () => {
  try {
    loading.value = true
    const response = await supplierStore.fetchSupplierFullFinancialDetails(
      supplierName
    )
    console.log('Full supplier data loaded -> (1) :', response)
    supplier.value = response.supplier.supplier_data || {}
    purchases.value = response.purchases || []
    transactions.value = response.transactions || []
    documents.value = response.documents || []
    supplierContacts.value = response.supplier.contact_details[0] || []
    supplierAddresses.value = response.supplier.address_details || {}
  } catch (err) {
    console.error('Error loading supplier data:', err)
    error.value = err.message || 'Failed to load supplier data'
  } finally {
    loading.value = false
  }
}

const saveSupplier = async (supplierData) => {
  try {


        if (supplierData.name) {
          if (editType.value === 'supplier') {
            // update whole supplier data (including contacts and address if they are part of supplierData)
            await supplierStore.updateSupplier(
              supplierData.name,
              supplierData
            )

          } else if (editType.value === 'contact') {
                supplierData.contact = {
                  contact_name: supplierData.contact_name,
                  email_id: supplierData.email_id,
                  mobile_no: supplierData.mobile_no
                }


                console.log('constact -> :', supplierData.contact)
                //  2- update only contacts
                await supplierStore.updateSupplierContacts(
                  supplierData.name,
                  supplierData.contact
                )
          } else if (editType.value === 'address') {
            await supplierStore.updateSupplierAddress(
              supplierData.name,
              supplierData.address
            )
          }
        }
        // غير كده → create
        else {
          await supplierStore.createSupplier(supplierData)
        }
      await loadSupplierFullData()
      showModal.value = false
  } catch (err) {
    console.error('Error saving supplier:', err)
    error.value = err.message || 'Failed to save supplier'
  }
}


/* ============================
   Lifecycle Hooks
============================ */
onMounted(async() => {
 await loadSupplierFullData()
 await supplierStore.loadSupplierGroups()
})
</script>
