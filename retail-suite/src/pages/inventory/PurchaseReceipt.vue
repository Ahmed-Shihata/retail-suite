<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-gray-50">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <ShoppingCart class="w-8 h-8 text-cyan-600" />
              <h1 class="text-lg font-bold text-gray-900">Purchase Receipts</h1>
            </div>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus class="w-4 h-4" />
              New Receipt
            </button>
          </div>
        </header>

        <!-- Filters -->
        <section class="px-4 py-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-1">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Receipt No.</label>
                <input
                  v-model="searchReceiptNo"
                  type="text"
                  placeholder="Search receipt..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input
                  v-model="searchSupplier"
                  type="text"
                  placeholder="Search supplier..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="statusFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All</option>
                  <option value="Draft">Draft</option>
                  <option value="To Bill">To Bill</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  v-model="filterFromDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  v-model="filterToDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Summary Cards -->
        <section class="px-4 py-2">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Receipts</p>
              <p class="text-2xl font-bold text-blue-600">{{ purchases.length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-2">
              <p class="text-sm text-gray-600">Draft</p>
              <p class="text-2xl font-bold text-yellow-400">{{ summaryStats.draft }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-2">
              <p class="text-sm text-gray-600">To Bill</p>
              <p class="text-2xl font-bold text-pink-600">{{ summaryStats.tobill }}</p>
            </div>
             <div class="bg-white rounded-lg border border-gray-200 p-2">
              <p class="text-sm text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-green-600">{{ summaryStats.completed }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-2">
              <p class="text-sm text-gray-600">Cancelled</p>
              <p class="text-2xl font-bold text-red-600">{{ summaryStats.cancelled }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-2">
              <p class="text-sm text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-purple-600">{{ formatPrice(summaryStats.totalAmount) }}</p>
            </div>
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          <span class="ml-3 text-gray-500">Loading receipts...</span>
        </div>

        <!-- Receipts Table -->
        <section v-else class="flex-1 px-4 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="purchase in filteredPurchases" :key="purchase.name" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ purchase.name }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ formatDate(purchase.posting_date) }}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{ purchase.supplier }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ purchase.items?.length || 0 }} items</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatPrice(purchase.grand_total || purchase.total_amount || 0) }}</td>
                    <td class="px-6 py-4 text-sm">
                      <span :class="getStatusBadge(purchase.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ capitalizeStatus(purchase.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium">
                      <div class="flex gap-2">
                        <!-- View - دايماً -->
                        <button @click="viewReceipt(purchase)" class="text-cyan-600 hover:text-cyan-900" title="View">
                          <Eye class="w-4 h-4" />
                        </button>

                        <!-- Edit - Draft فقط -->
                        <button
                          v-if="canEdit(purchase)"
                          @click="editReceipt(purchase)"
                          class="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 class="w-4 h-4" />
                        </button>

                        <!-- Submit - Draft فقط -->
                        <button
                          v-if="canSubmit(purchase)"
                          @click="submitReceipt(purchase)"
                          class="text-green-600 hover:text-green-900"
                          title="Submit"
                        >
                          <CheckCircle class="w-4 h-4" />
                        </button>

                        <!-- Cancel - Submitted فقط -->
                        <button
                          v-if="canCancel(purchase)"
                          @click="cancelReceipt(purchase)"
                          class="text-orange-600 hover:text-orange-900"
                          title="Cancel"
                        >
                          <XCircle class="w-4 h-4" />
                        </button>

                        <!-- Delete - Draft فقط -->
                        <button
                          v-if="canEdit(purchase)"
                          @click="deleteReceipt(purchase)"
                          class="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                          <!-- Invoice - To Bill / Partly Billed فقط -->
                        <button
                          v-if="canCreateInvoice(purchase)"
                          @click="createInvoice(purchase)"
                          class="text-purple-600 hover:text-purple-900"
                          title="Create Invoice"
                        >
                          <FileText class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State -->
                  <tr v-if="filteredPurchases.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      No purchase receipts found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Purchase Receipt Modal -->
        <PurchaseReceiptModal
          v-if="showAddModal || showEditModal"
          :show="showAddModal || showEditModal"
          :purchase="editingPurchase"
          :is-editing="showEditModal"

          :products="inventoryStore.items"
          @save="savePurchase"
          @close="closeModal"
        />

        <!-- Receipt Detail Modal -->
        <ReceiptDetailModal
          v-if="showDetailModal"
          :receipt="selectedPurchase"
          @close="showDetailModal = false"
        />

        <PurchaseInvoiceModal
          v-if="showInvoiceModal"
          :show="showInvoiceModal"
          :receipt="invoiceReceipt"
          :uoms="uoms"
          :error-message="invoiceError"
          :success-message="invoiceSuccess"
          @close="showInvoiceModal = false"
          @submit="handleInvoiceSubmit"
        />
          <ConfirmModal
            :show="confirmModal.show"
            :type="confirmModal.type"
            :doc-name="confirmModal.docName"
            :loading="confirmModal.loading"
            @confirm="onConfirmOk"
            @cancel="onConfirmCancel"
          />
      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import PurchaseReceiptModal from '@/components/modals/PurchaseReceiptModal.vue'
import ReceiptDetailModal from '@/components/modals/ReceiptDetailModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import PurchaseInvoiceModal from '@/components/modals/PurchaseInvoiceModal.vue'
import { useInventoryStore } from '@/stores/inventory'
import { formatPrice } from '@/utils/formatters'
import { ShoppingCart, Plus, Eye, Edit2, Trash2, CheckCircle, XCircle, FileText } from 'lucide-vue-next'
import {
  getPurchaseReceipts,
  createPurchaseReceipt,
  updatePurchaseReceipt,
  deletePurchaseReceipt,
  cancelPurchaseReceipt,
  submitPurchaseReceipt,
createPurchaseInvoiceFromReceipt
} from '@/services/api'
// ─── State ────────────────────────────────────────────
const inventoryStore = useInventoryStore()
const purchases      = ref([])
const loading        = ref(false)

const searchReceiptNo = ref('')
const searchSupplier  = ref('')
const statusFilter    = ref('')
const filterFromDate  = ref('')
const filterToDate    = ref('')

const showAddModal    = ref(false)
const showEditModal   = ref(false)
const showDetailModal = ref(false)
const editingPurchase = ref(null)
const selectedPurchase = ref(null)

const uoms = ref([])
// ─── Load Data ────────────────────────────────────────
const loadReceipts = async () => {
  loading.value = true
  try {
    const res = await getPurchaseReceipts()
    purchases.value = res.data || []
  } catch (error) {
    console.error('Error loading purchase receipts:', error)
  } finally {
    loading.value = false
  }
}

// ─── Computed ─────────────────────────────────────────
const filteredPurchases = computed(() => {
  let data = [...purchases.value]

  if (searchReceiptNo.value) {
    data = data.filter(p =>
      p.name?.toLowerCase().includes(searchReceiptNo.value.toLowerCase())
    )
  }

  if (searchSupplier.value) {
    data = data.filter(p =>
      p.supplier?.toLowerCase().includes(searchSupplier.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    data = data.filter(p => p.status === statusFilter.value)
  }

  if (filterFromDate.value) {
    data = data.filter(p => new Date(p.posting_date) >= new Date(filterFromDate.value))
  }

  if (filterToDate.value) {
    data = data.filter(p => new Date(p.posting_date) <= new Date(filterToDate.value))
  }

  return data.sort((a, b) => new Date(b.posting_date) - new Date(a.posting_date))
})

const summaryStats = computed(() => ({
  draft:     purchases.value.filter(p => p.status === 'Draft').length,
  tobill:    purchases.value.filter(p => p.status === 'To Bill').length,
  completed:   purchases.value.filter(p => p.status === 'Completed').length,
  cancelled: purchases.value.filter(p => p.status === 'Cancelled').length,
  totalAmount: purchases.value.reduce((sum, p) => sum + (p.grand_total || p.total_amount || 0), 0)
}))

// ─── Helpers ──────────────────────────────────────────
// ✅ getStatusBadge - كل الحالات
const getStatusBadge = (status) => {
  const badges = {
    'Draft':          'bg-gray-100 text-gray-700',
    'To Bill':        'bg-blue-100 text-blue-800',
    'Partly Billed':  'bg-yellow-100 text-yellow-800',
    'Completed':      'bg-green-100 text-green-800',
    'Return':         'bg-orange-100 text-orange-800',
    'Return Issued':  'bg-orange-200 text-orange-900',
    'Cancelled':      'bg-red-100 text-red-800',
    'Closed':         'bg-gray-200 text-gray-600',
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

// ✅ هل ينفع يتعدل؟ (Draft بس)
const canEdit = (purchase) => purchase.docstatus === 0

// ✅ هل ينفع يتعمل Submit؟ (Draft بس)
const canSubmit = (purchase) => purchase.docstatus === 0

// ✅ هل ينفع يتكنسل؟ (Submitted بس)
const canCancel = (purchase) => purchase.docstatus === 1


// ✅ هل ينفع يتعمل Invoice؟ (To Bill أو Partly Billed)
const canCreateInvoice = (purchase) =>
  purchase.docstatus === 1 &&
  ['To Bill', 'Partly Billed'].includes(purchase.status)

// ✅ Action


const showInvoiceModal = ref(false)
const invoiceReceipt   = ref(null)

const invoiceError   = ref(null)
const invoiceSuccess = ref(null)

const createInvoice = (purchase) => {
  console.log("purchase",purchase)
  invoiceReceipt.value  = purchase
  showInvoiceModal.value = true
}
// ───  (PurchaseReceipts.vue) ────────────────────────────────

const handleInvoiceSubmit = async (payload) => {
  invoiceError.value   = null
  invoiceSuccess.value = null

  try {
    const res = await createPurchaseInvoiceFromReceipt(invoiceReceipt.value.name, payload)

    invoiceSuccess.value = `✅ Invoice created: ${res.data.name}`

    // أقفل الـ modal بعد ثانيتين عشان المستخدم يشوف النجاح
    setTimeout(() => {
      showInvoiceModal.value = false
      invoiceReceipt.value   = null
      invoiceSuccess.value   = null
    }, 2000)

    await loadReceipts()

  } catch (error) {
    // Frappe بيرجع الـ error details في error.response.data
    const frappeMsg =
      error?.response?.data?.exception ||        // Python exception
      error?.response?.data?.message  ||        // _("message") throw
      error?.response?.data?.exc_type ||        // exception type
      error?.message                  ||        // JS error
      'Unknown error occurred'

    // نظّف الـ Traceback من الـ message لو موجود
    invoiceError.value = frappeMsg.split('\n')[0]  // أول سطر بس

    console.error('Full error details:', error?.response?.data || error)
  }
}

const capitalizeStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : ''

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : '-'

// ─── Actions ──────────────────────────────────────────
const viewReceipt = (purchase) => {
    console.log("viewReceipt ",purchase)
  selectedPurchase.value = purchase
  showDetailModal.value = true
}

const editReceipt = (purchase) => {
  editingPurchase.value = purchase
  showEditModal.value = true
}

const savePurchase = async (purchaseData) => {
  try {
    if (showEditModal.value && editingPurchase.value) {
      // ✅ Update
      console.log("updatePurchaseReceipt here")
      console.log("editingPurchase.value.name ",editingPurchase.value.name)
       console.log("purchaseData",purchaseData)
      await updatePurchaseReceipt(editingPurchase.value.name, purchaseData)
    } else {
      // ✅ Create
      await createPurchaseReceipt(purchaseData)
    }
    // Reload من الـ API
    await loadReceipts()
    closeModal()
  } catch (error) {
    console.error('Error saving purchase receipt:', error)
  }
}


const closeModal = () => {
  showAddModal.value    = false
  showEditModal.value   = false
  editingPurchase.value = null
}



// ─── 2. Replace the 3 confirm() refs ─────────────────
const confirmModal = reactive({
  show:    false,
  type:    'submit',   // 'submit' | 'cancel' | 'delete'
  docName: '',
  loading: false,
  _resolve: null,      // internal
})

// helper — returns a Promise that resolves true/false
const askConfirm = (type, docName) => {
  confirmModal.type    = type
  confirmModal.docName = docName
  confirmModal.show    = true
  return new Promise(resolve => { confirmModal._resolve = resolve })
}

const onConfirmOk = async () => {
  confirmModal.loading = true
  confirmModal._resolve?.(true)
}

const onConfirmCancel = () => {
  confirmModal.show    = false
  confirmModal.loading = false
  confirmModal._resolve?.(false)
}

const closeConfirm = () => {
  confirmModal.show    = false
  confirmModal.loading = false
}


// ─── 3. Replace submitReceipt ────────────────────────
const submitReceipt = async (purchase) => {
  const ok = await askConfirm('submit', purchase.name)
  if (!ok) return
  try {
    await submitPurchaseReceipt(purchase.name)
    await loadReceipts()
  } catch (error) {
    console.error('Error submitting:', error)
  } finally {
    closeConfirm()
  }
}


// ─── 4. Replace cancelReceipt ────────────────────────
const cancelReceipt = async (purchase) => {
  const ok = await askConfirm('cancel', purchase.name)
  if (!ok) return
  try {
    await cancelPurchaseReceipt(purchase.name)
    await loadReceipts()
  } catch (error) {
    console.error('Error cancelling:', error)
  } finally {
    closeConfirm()
  }
}


// ─── 5. Replace deleteReceipt ────────────────────────
const deleteReceipt = async (purchase) => {
  const ok = await askConfirm('delete', purchase.name)
  if (!ok) return
  try {
    await deletePurchaseReceipt(purchase.name)
    purchases.value = purchases.value.filter(p => p.name !== purchase.name)
  } catch (error) {
    console.error('Error deleting:', error)
  } finally {
    closeConfirm()
  }
}


// ─── 6. Add reactive import at top ───────────────────
// import { ref, computed, onMounted, reactive } from 'vue'  ← add reactive


// ─── 7. Add to template (next to other modals) ───────
/*
  <ConfirmModal
    :show="confirmModal.show"
    :type="confirmModal.type"
    :doc-name="confirmModal.docName"
    :loading="confirmModal.loading"
    @confirm="onConfirmOk"
    @cancel="onConfirmCancel"
  />
*/
// ─── Lifecycle ────────────────────────────────────────
onMounted(async() => {
  await loadReceipts()
  await inventoryStore.loadItems?.()
  const fetchedUoms = await inventoryStore.loadUOM()

  uoms.value = fetchedUoms || []
})
</script>
