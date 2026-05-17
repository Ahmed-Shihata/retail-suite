<!-- PurchaseReceipt.vue -->
<template>

    <div class="w-full flex min-h-screen" style="font-size: 13px;" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1">

        <!-- ══════════════════ HEADER ══════════════════ -->
        <header
          class="mx-3 mt-3 sticky top-0 z-10 rounded-lg shadow-sm"
          :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
        >
          <div class="px-4 py-2 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <ShoppingCart class="w-5 h-5" :style="{color: primaryColor}" />
              <div>
                <h1 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">Purchase Receipts</h1>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ purchases.length }} total receipts</p>
              </div>
            </div>
            <button
             :style="{background: primaryColor}"
              @click="showAddModal = true"
              class="inline-flex items-center gap-1.5 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Plus class="w-3 h-3" /> New Receipt
            </button>
          </div>
        </header>

        <!-- ══════════════════ STATISTICS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">
              Statistics
            </h2>
            <div class="grid grid-cols-2 lg:grid-cols-6 gap-2">
              <StatsCard title="Total"       :value="purchases.length"               icon="ShoppingCart" color="blue"   />
              <StatsCard title="Draft"       :value="summaryStats.draft"             icon="FileText"     color="orange" />
              <StatsCard title="To Bill"     :value="summaryStats.tobill"            icon="Tag"          color="purple" />
              <StatsCard title="Completed"   :value="summaryStats.completed"         icon="CheckCircle"  color="green"  />
              <StatsCard title="Cancelled"   :value="summaryStats.cancelled"         icon="XCircle"      color="orange" />
              <StatsCard title="Total Amt"   :value="formatPrice(summaryStats.totalAmount)" icon="TrendingUp" color="blue" />
            </div>
          </div>
        </section>

        <!-- ══════════════════ FILTERS ══════════════════ -->
        <section class="px-3 pt-3">
          <div
            class="rounded-lg shadow-sm p-3"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">

              <!-- Receipt Search -->
              <div class="col-span-2">
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Search</label>
                <div class="relative">
                  <Search class="absolute left-2.5 top-2 w-3 h-3 pointer-events-none" :style="{ color: 'var(--text-muted)' }" />
                  <input
                    v-model="searchReceiptNo"
                    type="text"
                    placeholder="Receipt no. or supplier..."
                    class="w-full pl-8 pr-3 py-1.5 rounded-md focus:outline-none text-xs transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                  />
                </div>
              </div>

              <!-- Supplier -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Supplier</label>
                <input
                  v-model="searchSupplier"
                  type="text"
                  placeholder="Search supplier..."
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

              <!-- From Date -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">From</label>
                <input
                  v-model="filterFromDate"
                  type="date"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

              <!-- To Date -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">To</label>
                <input
                  v-model="filterToDate"
                  type="date"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                />
              </div>

            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">

              <!-- Status -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Status</label>
                <select
                  v-model="statusFilter"
                  class="w-full px-2 py-1.5 rounded-md focus:outline-none text-xs"
                  :style="{
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--input-border)'
                  }"
                >
                  <option value="">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="To Bill">To Bill</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Count -->
              <div>
                <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Count</label>
                <div
                  class="px-2 py-1.5 rounded-md font-semibold text-xs"
                  :style="{
                    background: 'var(--item-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--item-border)'
                  }"
                >
                  {{ filteredPurchases.length }} receipts
                </div>
              </div>

              <!-- Clear -->
              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="w-full px-3 py-1.5 rounded-md text-xs transition-colors"
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
          </div>
        </section>

        <!-- ══════════════════ TABLE ══════════════════ -->
        <section class="px-3 pt-3 pb-3">
          <div
            class="rounded-lg shadow-sm flex flex-col overflow-hidden"
            :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
          >
            <!-- Table Header Bar -->
            <div
              class="px-4 py-2 flex items-center gap-2"
              :style="{ borderBottom: '1px solid var(--card-border)' }"
            >
              <ShoppingCart class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
              <span class="text-xs font-semibold" :style="{ color: 'var(--text-sub)' }">All Receipts</span>
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">({{ purchases.length }})</span>
              <span v-if="loading" class="text-xs ml-auto" :style="{ color: 'var(--text-muted)' }">Loading...</span>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto" style="scrollbar-width: thin;">
              <table class="w-full border-collapse" style="font-size: 12px; min-width: 700px;">
                <thead class="sticky top-0 z-10" :style="{ background: 'var(--item-bg)' }">
                  <tr>
                    <th
                      v-for="label in ['Receipt No.', 'Date', 'Supplier', 'Items', 'Amount', 'Status', 'Actions']"
                      :key="label"
                      class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                      :class="['Amount', 'Actions'].includes(label) ? 'text-center' : ''"
                      :style="{ color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)' }"
                    >
                      {{ label }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <!-- Loading -->
                  <tr v-if="loading">
                    <td colspan="7" class="py-10 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5 animate-spin" :style="{ color: 'var(--focus-ring)' }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        <span class="text-xs" :style="{ color: 'var(--text-muted)' }">Loading receipts...</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty -->
                  <tr v-else-if="paginatedPurchases.length === 0">
                    <td colspan="7" class="py-14 text-center">
                      <div class="flex flex-col items-center gap-2">
                        <div
                          class="w-10 h-10 flex items-center justify-center rounded-full mb-1"
                          :style="{ background: 'var(--item-bg)' }"
                        >
                          <ShoppingCart class="w-5 h-5" :style="{ color: 'var(--text-muted)', opacity: 0.5 }" />
                        </div>
                        <p class="text-xs font-medium" :style="{ color: 'var(--text-sub)' }">No Purchase Receipts Found</p>
                        <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Rows -->
                  <tr
                    v-else
                    v-for="purchase in paginatedPurchases"
                    :key="purchase.name"
                    class="transition-colors"
                    :style="{ borderBottom: '1px solid var(--card-border)' }"
                    @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                    @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
                  >
                    <!-- Receipt No -->
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span
                        class="font-mono text-xs px-2 py-0.5 rounded font-medium"
                        :style="{ background: 'var(--item-bg)', color: 'var(--text-sub)', border: '1px solid var(--item-border)' }"
                      >{{ purchase.name }}</span>
                    </td>

                    <!-- Date -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-muted)' }">
                      {{ formatDate(purchase.posting_date) }}
                    </td>

                    <!-- Supplier -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs" :style="{ color: 'var(--text-sub)' }">
                      {{ purchase.supplier }}
                    </td>

                    <!-- Items -->
                    <td class="px-3 py-2 whitespace-nowrap text-xs text-center" :style="{ color: 'var(--text-muted)' }">
                      <span
                        v-if="purchase.items?.length"
                        class="inline-flex items-center justify-center w-5 h-5 text-white rounded-full font-semibold"
                        style="font-size:10px;"
                        :style="{ background: 'var(--focus-ring)' }"
                      >{{ purchase.items.length }}</span>
                      <span v-else>—</span>
                    </td>

                    <!-- Amount -->
                    <td class="px-3 py-2 whitespace-nowrap text-center font-semibold text-xs" :style="{ color: 'var(--focus-ring)' }">
                      {{ formatPrice(purchase.grand_total || purchase.total_amount || 0) }}
                    </td>

                    <!-- Status -->
                    <td class="px-3 py-2 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full font-medium"
                        style="font-size: 10px;"
                        :style="getStatusStyle(purchase.status)"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full mr-1 inline-block"
                          :style="{ background: getStatusStyle(purchase.status).color }"
                        />
                        {{ capitalizeStatus(purchase.status) }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-3 py-2 whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1">

                        <!-- View -->
                        <button
                          @click="viewReceipt(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--focus-ring)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--info-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="View"
                        >
                          <Eye class="w-3.5 h-3.5" />
                        </button>

                        <!-- Edit (Draft only) -->
                        <button
                          v-if="canEdit(purchase)"
                          @click="editReceipt(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--warning-border)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Edit"
                        >
                          <Edit2 class="w-3.5 h-3.5" />
                        </button>

                        <!-- Submit (Draft only) -->
                        <button
                          v-if="canSubmit(purchase)"
                          @click="submitReceipt(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--icon-color-green)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--icon-bg-green)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Submit"
                        >
                          <CheckCircle class="w-3.5 h-3.5" />
                        </button>

                        <!-- Cancel (Submitted only) -->
                        <button
                          v-if="canCancel(purchase)"
                          @click="cancelReceipt(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--warning-border)' }"
                          @mouseover="$event.currentTarget.style.background = 'var(--warning-bg)'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Cancel"
                        >
                          <XCircle class="w-3.5 h-3.5" />
                        </button>

                        <!-- Delete (Draft only) -->
                        <button
                          v-if="canEdit(purchase)"
                          @click="deleteReceipt(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          style="color: #ef4444;"
                          @mouseover="$event.currentTarget.style.background = '#fef2f2'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Delete"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>

                        <!-- Invoice (To Bill / Partly Billed) -->
                        <button
                          v-if="canCreateInvoice(purchase)"
                          @click="createInvoice(purchase)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          style="color: #9333ea;"
                          @mouseover="$event.currentTarget.style.background = '#f5f3ff'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'"
                          title="Create Invoice"
                        >
                          <FileText class="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="px-4 py-2.5"
              :style="{ borderTop: '1px solid var(--card-border)', background: 'var(--item-bg)' }"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}–{{ Math.min(currentPage * itemsPerPage, filteredPurchases.length) }}
                  of {{ filteredPurchases.length }}
                </span>
                <div class="flex items-center gap-1">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                    :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                  >Prev</button>

                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    class="px-2 py-1 text-xs rounded transition-colors font-medium"
                    :style="currentPage === page
                      ? { background: 'var(--focus-ring)', color: '#fff', border: '1px solid var(--focus-ring)' }
                      : { background: 'var(--card-bg)', color: 'var(--text-sub)', border: '1px solid var(--card-border)' }"
                  >{{ page }}</button>

                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-2 py-1 text-xs rounded disabled:opacity-40 transition-colors"
                    :style="{ border: '1px solid var(--card-border)', color: 'var(--text-sub)', background: 'var(--card-bg)' }"
                  >Next</button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- ══════════════════ MODALS ══════════════════ -->
        <PurchaseReceiptModal
          v-if="showAddModal || showEditModal"
          :show="showAddModal || showEditModal"
          :purchase="editingPurchase"
          :is-editing="showEditModal"
          :products="inventoryStore.items"
          @save="savePurchase"
          @close="closeModal"
        />

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

      </main>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import MainLayout             from '@/layout/MainLayout.vue'
import StatsCard              from '@/layout/StatsCard.vue'
import PurchaseReceiptModal   from '@/components/modals/PurchaseReceiptModal.vue'
import ReceiptDetailModal     from '@/components/modals/ReceiptDetailModal.vue'
import PurchaseInvoiceModal   from '@/components/modals/PurchaseInvoiceModal.vue'
import { useInventoryStore }  from '@/stores/inventory'
import { useSettingsStore }   from "@/stores/settings";
import { formatPrice }        from '@/utils/formatters'
import { ShoppingCart, Plus, Eye, Edit2, Trash2, CheckCircle, XCircle, FileText, Search } from 'lucide-vue-next'
import {
  getPurchaseReceipts,
  createPurchaseReceipt,
  updatePurchaseReceipt,
  deletePurchaseReceipt,
  cancelPurchaseReceipt,
  submitPurchaseReceipt,
  createPurchaseInvoiceFromReceipt,
} from '@/services/api'
// ─── State ────────────────────────────────────────────
const inventoryStore  = useInventoryStore()
const settingsStore = useSettingsStore();
const purchases       = ref([])
const loading         = ref(false)
const uoms            = ref([])

const searchReceiptNo = ref('')
const searchSupplier  = ref('')
const statusFilter    = ref('')
const filterFromDate  = ref('')
const filterToDate    = ref('')

// Pagination
const currentPage  = ref(1)
const itemsPerPage = ref(20)

const showAddModal    = ref(false)
const showEditModal   = ref(false)
const showDetailModal = ref(false)
const editingPurchase = ref(null)
const selectedPurchase = ref(null)

const showInvoiceModal = ref(false)
const invoiceReceipt   = ref(null)
const invoiceError     = ref(null)
const invoiceSuccess   = ref(null)

// ─── Load ─────────────────────────────────────────────
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

const settings = computed(() => settingsStore.settings);
const primaryColor = computed(() => settings.value?.appearance?.primaryColor || '#06b6d4')
const filteredPurchases = computed(() => {
  let data = [...purchases.value]
  if (searchReceiptNo.value)
    data = data.filter(p => p.name?.toLowerCase().includes(searchReceiptNo.value.toLowerCase()))
  if (searchSupplier.value)
    data = data.filter(p => p.supplier?.toLowerCase().includes(searchSupplier.value.toLowerCase()))
  if (statusFilter.value)
    data = data.filter(p => p.status === statusFilter.value)
  if (filterFromDate.value)
    data = data.filter(p => new Date(p.posting_date) >= new Date(filterFromDate.value))
  if (filterToDate.value)
    data = data.filter(p => new Date(p.posting_date) <= new Date(filterToDate.value))
  return data.sort((a, b) => new Date(b.posting_date) - new Date(a.posting_date))
})

const paginatedPurchases = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredPurchases.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
  Math.ceil(filteredPurchases.value.length / itemsPerPage.value)
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end   = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const summaryStats = computed(() => ({
  draft:       purchases.value.filter(p => p.status === 'Draft').length,
  tobill:      purchases.value.filter(p => p.status === 'To Bill').length,
  completed:   purchases.value.filter(p => p.status === 'Completed').length,
  cancelled:   purchases.value.filter(p => p.status === 'Cancelled').length,
  totalAmount: purchases.value.reduce((sum, p) => sum + (p.grand_total || p.total_amount || 0), 0),
}))

// ─── Helpers ──────────────────────────────────────────
const getStatusStyle = (status) => {
  const map = {
    'Draft':         { background: 'var(--item-bg)',       color: 'var(--text-muted)'       },
    'To Bill':       { background: 'var(--info-bg)',        color: 'var(--focus-ring)'       },
    'Partly Billed': { background: 'var(--warning-bg)',     color: 'var(--warning-border)'   },
    'Completed':     { background: 'var(--icon-bg-green)',  color: 'var(--icon-color-green)' },
    'Return':        { background: 'var(--warning-bg)',     color: 'var(--warning-border)'   },
    'Cancelled':     { background: '#fef2f2',               color: '#ef4444'                 },
    'Closed':        { background: 'var(--item-bg)',        color: 'var(--text-muted)'       },
  }
  return map[status] || { background: 'var(--item-bg)', color: 'var(--text-muted)' }
}

const canEdit          = (p) => p.docstatus === 0
const canSubmit        = (p) => p.docstatus === 0
const canCancel        = (p) => p.docstatus === 1
const canCreateInvoice = (p) => p.docstatus === 1 && ['To Bill', 'Partly Billed'].includes(p.status)

const capitalizeStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const formatDate       = (d) => d ? new Date(d).toLocaleDateString() : '—'

const resetFilters = () => {
  searchReceiptNo.value = ''
  searchSupplier.value  = ''
  statusFilter.value    = ''
  filterFromDate.value  = ''
  filterToDate.value    = ''
  currentPage.value     = 1
}

// ─── Actions ──────────────────────────────────────────
const viewReceipt  = (p) => { selectedPurchase.value = p; showDetailModal.value = true }
const editReceipt  = (p) => { editingPurchase.value  = p; showEditModal.value   = true }
const createInvoice = (p) => { invoiceReceipt.value   = p; showInvoiceModal.value = true }

const closeModal = () => {
  showAddModal.value    = false
  showEditModal.value   = false
  editingPurchase.value = null
}

const savePurchase = async (purchaseData) => {
  try {
    if (showEditModal.value && editingPurchase.value) {
      await updatePurchaseReceipt(editingPurchase.value.name, purchaseData)
    } else {
      await createPurchaseReceipt(purchaseData)
    }
    await loadReceipts()
    closeModal()
  } catch (error) {
    console.error('Error saving purchase receipt:', error)
  }
}

const submitReceipt = async (purchase) => {

  try { await submitPurchaseReceipt(purchase.name); await loadReceipts() }
  catch (e) { console.error(e) }

}

const cancelReceipt = async (purchase) => {

  try { await cancelPurchaseReceipt(purchase.name); await loadReceipts() }
  catch (e) { console.error(e) }
  finally {  }
}

const deleteReceipt = async (purchase) => {

  try {
    await deletePurchaseReceipt(purchase.name)
    purchases.value = purchases.value.filter(p => p.name !== purchase.name)
  } catch (e) { console.error(e) }
  finally { }
}

const handleInvoiceSubmit = async (payload) => {
  invoiceError.value = null; invoiceSuccess.value = null
  try {
    const res = await createPurchaseInvoiceFromReceipt(invoiceReceipt.value.name, payload)
    invoiceSuccess.value = `✅ Invoice created: ${res.data.name}`
    setTimeout(() => {
      showInvoiceModal.value = false; invoiceReceipt.value = null; invoiceSuccess.value = null
    }, 2000)
    await loadReceipts()
  } catch (error) {
    const frappeMsg = error?.response?.data?.exception || error?.response?.data?.message || error?.message || 'Unknown error'
    invoiceError.value = frappeMsg.split('\n')[0]
    console.error('Full error:', error?.response?.data || error)
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(async () => {
  await loadReceipts()
  await inventoryStore.loadItems?.()
  const fetchedUoms = await inventoryStore.loadUOM()
  uoms.value = fetchedUoms || []
})
</script>
