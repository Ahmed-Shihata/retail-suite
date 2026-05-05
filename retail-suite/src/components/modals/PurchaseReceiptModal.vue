<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @mousedown.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">

        <!-- ── Header ── -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-3">
            <div :class="isEditing ? 'bg-blue-100' : 'bg-cyan-100'" class="p-2 rounded-xl">
              <component :is="isEditing ? Edit2 : Plus" class="w-5 h-5" :class="isEditing ? 'text-blue-600' : 'text-cyan-600'" />
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900">
                {{ isEditing ? 'Edit Purchase Receipt' : 'New Purchase Receipt' }}
              </h2>
              <p v-if="isEditing && props.purchase?.name" class="text-xs text-gray-400">{{ props.purchase.name }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- ── Scrollable Body ── -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- Section 1: Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Supplier — الأهم -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Supplier <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.supplier"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
              >
                <option value="" disabled>
                  {{ loadingSuppliers ? 'Loading...' : 'Select Supplier' }}
                </option>
                <option
                  v-for="s in suppliers"
                  :key="s.name"
                  :value="s.name"
                >
                  {{ s.supplier_name || s.name }}
                </option>
              </select>
              <!-- ✅ يعرض اسم المورد المختار تحت الـ select عشان يتأكد المستخدم -->
              <p v-if="selectedSupplierName" class="mt-1 text-xs text-cyan-600 font-medium">
                ✓ {{ selectedSupplierName }}
              </p>
            </div>

            <!-- Posting Date -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Receipt Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.posting_date"
                type="date"
                required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <!-- Remarks -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Remarks</label>
              <input
                v-model="form.notes"
                type="text"
                placeholder="Optional notes..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

          </div>

          <!-- Divider -->
          <div class="border-t border-gray-100" />

          <!-- Section 2: Items Table -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Purchase Items
                <span v-if="form.items.length" class="ml-1 text-cyan-600">({{ form.items.length }})</span>
              </h4>
              <button
                type="button"
                @click="addItemRow"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition text-xs font-semibold"
              >
                <Plus class="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-if="form.items.length === 0"
              class="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center"
            >
              <Package class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-400">No items yet. Click <strong>Add Item</strong> to start.</p>
            </div>

            <!-- Table -->
            <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Item</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-28">UOM</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-36">Warehouse</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-24">Qty</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-28">Rate</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-gray-500 w-28">Amount</th>
                      <th class="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="(item, index) in form.items" :key="index" class="hover:bg-gray-50/50">

                      <td class="px-3 py-2.5 text-xs text-gray-400 font-medium">{{ index + 1 }}</td>

                      <!-- Item Select -->
                      <td class="px-3 py-2.5">
                        <select
                          v-model="item.item_code"
                          @change="selectItem(index)"
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select item...</option>
                          <option
                            v-for="product in availableProducts"
                            :key="product.item_code"
                            :value="product.item_code"
                          >
                            {{ product.item_code }}{{ product.item_name ? ' — ' + product.item_name : '' }}
                          </option>
                        </select>
                        <p v-if="item.item_name" class="mt-0.5 text-xs text-gray-400 truncate">{{ item.item_name }}</p>
                      </td>

                      <!-- UOM -->
                      <td class="px-3 py-2.5">
                        <select
                          v-model="item.uom"
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 bg-white"
                        >
                          <option value="">UOM</option>
                          <option v-for="uom in uoms" :key="uom.name" :value="uom.name">{{ uom.name }}</option>
                        </select>
                      </td>

                      <!-- Warehouse -->
                      <td class="px-3 py-2.5">
                        <select
                          v-model="item.warehouse"
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 bg-white"
                        >
                          <option value="">Warehouse</option>
                          <option v-for="wh in warehouses" :key="wh.name" :value="wh.name">{{ wh.name }}</option>
                        </select>
                      </td>

                      <!-- Qty -->
                      <td class="px-3 py-2.5">
                        <input
                          v-model.number="item.qty"
                          type="number" min="0.001" step="any"
                          @input="calculateItemTotal(index)"
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>

                      <!-- Rate -->
                      <td class="px-3 py-2.5">
                        <input
                          v-model.number="item.rate"
                          type="number" min="0" step="any"
                          @input="calculateItemTotal(index)"
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:ring-2 focus:ring-cyan-500"
                        />
                      </td>

                      <!-- Amount (read-only) -->
                      <td class="px-3 py-2.5 text-right">
                        <span class="text-xs font-semibold text-gray-900">{{ formatPrice(item.amount || 0) }}</span>
                      </td>

                      <!-- Remove -->
                      <td class="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          @click="removeItemRow(index)"
                          class="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  </tbody>

                  <!-- Footer totals -->
                  <tfoot class="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colspan="6" class="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</td>
                      <td class="px-3 py-2.5 text-right text-sm font-bold text-gray-900">{{ formatPrice(subtotal) }}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Section 3: Totals Summary (only show if items exist) -->
          <div v-if="form.items.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Subtotal</p>
              <p class="text-base font-bold text-gray-900">{{ formatPrice(subtotal) }}</p>
            </div>
            <div class="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <p class="text-xs text-gray-500 mb-1">
                Discount
                <span class="ml-1">
                  (<input v-model.number="form.discount_rate" type="number" min="0" max="100" step="0.01"
                    class="w-10 inline border-b border-orange-300 bg-transparent text-xs text-center focus:outline-none" />%)
                </span>
              </p>
              <p class="text-base font-bold text-orange-600">-{{ formatPrice(discountAmount) }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p class="text-xs text-gray-500 mb-1">
                Tax
                <span class="ml-1">
                  (<input v-model.number="form.tax_rate" type="number" min="0" max="100" step="0.01"
                    class="w-10 inline border-b border-blue-300 bg-transparent text-xs text-center focus:outline-none" />%)
                </span>
              </p>
              <p class="text-base font-bold text-blue-600">+{{ formatPrice(taxAmount) }}</p>
            </div>
            <div class="bg-cyan-600 rounded-xl p-3">
              <p class="text-xs text-cyan-100 mb-1">Grand Total</p>
              <p class="text-lg font-bold text-white">{{ formatPrice(totalAmount) }}</p>
            </div>
          </div>

        </div>

        <!-- ── Error Banner ── -->
        <div
          v-if="errorMessage"
          class="mx-6 mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shrink-0"
        >
          <AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>

        <!-- ── Footer ── -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/80 rounded-b-2xl">
          <p v-if="form.items.length > 0" class="text-sm text-gray-500">
            {{ form.items.length }} item{{ form.items.length > 1 ? 's' : '' }} ·
            <span class="font-semibold text-gray-900">{{ formatPrice(totalAmount) }}</span>
          </p>
          <p v-else class="text-sm text-gray-400">No items added yet</p>

          <div class="flex gap-3">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="isSaving || form.items.length === 0 || !form.supplier"
              class="px-5 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <Save v-else class="w-4 h-4" />
              {{ isSaving ? 'Saving...' : isEditing ? 'Update Receipt' : 'Create Receipt' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { X, Plus, Edit2, Trash2, Package, Save, Loader2, AlertCircle } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { formatPrice } from '@/utils/formatters'
import { getSuppliers } from '@/services/api'

// ─── Props & Emits ────────────────────────────────────
const props = defineProps({
  show:      { type: Boolean, default: false },
  purchase:  { type: Object,  default: null  },
  isEditing: { type: Boolean, default: false },
  products:  { type: Array,   default: () => [] }
})
const emit = defineEmits(['save', 'close'])

// ─── Store & State ────────────────────────────────────
const inventoryStore   = useInventoryStore()
const isSaving         = ref(false)
const errorMessage     = ref('')
const suppliers        = ref([])
const loadingSuppliers = ref(false)
const uoms             = ref([])
const warehouses       = ref([])

// ─── Fetch Suppliers ──────────────────────────────────
const fetchSuppliers = async () => {
  loadingSuppliers.value = true
  try {
    const res = await getSuppliers()
    console.log("getSuppliers",res)
    suppliers.value = res.data || []
  } catch (e) {
    console.error('Error loading suppliers:', e)
  } finally {
    loadingSuppliers.value = false
  }
}

// ─── Computed: show selected supplier name under select ─
const selectedSupplierName = computed(() => {
  if (!form.supplier) return ''
  const found = suppliers.value.find(s => s.name === form.supplier)
  // لو الاسم مختلف عن الـ id — يعني في supplier_name منفصل
  if (found && found.supplier_name && found.supplier_name !== found.name) {
    return found.supplier_name
  }
  return ''
})

// ─── Default Form ─────────────────────────────────────
const getDefaultForm = () => ({
  posting_date:  new Date().toISOString().split('T')[0],
  supplier:      '',
  notes:         '',
  discount_rate: 0,
  tax_rate:      0,
  items:         [],
})

const form = reactive(getDefaultForm())

// ─── Available Products ───────────────────────────────
const availableProducts = computed(() =>
  props.products?.length ? props.products : inventoryStore.items || []
)

// ─── Totals ───────────────────────────────────────────
const subtotal = computed(() =>
  form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
)
const discountAmount = computed(() =>
  (subtotal.value * (form.discount_rate || 0)) / 100
)
const taxAmount = computed(() =>
  ((subtotal.value - discountAmount.value) * (form.tax_rate || 0)) / 100
)
const totalAmount = computed(() =>
  subtotal.value - discountAmount.value + taxAmount.value
)

// ─── Watch: populate on open ──────────────────────────
watch(
  () => [props.show, props.purchase],
  ([newShow, newPurchase]) => {
    if (!newShow) return

    if (newPurchase && props.isEditing) {
      const p = JSON.parse(JSON.stringify(newPurchase))
      Object.assign(form, {
        posting_date:  p.posting_date || new Date().toISOString().split('T')[0],
        supplier:      p.supplier     || '',
        notes:         p.remarks      || p.notes      || '',
        discount_rate: p.additional_discount_percentage || p.discount_rate || 0,
        tax_rate:      p.tax_rate     || 0,
        items: (p.items || []).map(item => ({
          item_code:  item.item_code  || '',
          item_name:  item.item_name  || '',
          uom:        item.uom        || item.stock_uom || '',
          warehouse:  item.warehouse  || '',
          qty:        item.qty        || 0,
          rate:       item.rate       || 0,
          amount:     item.amount     || (item.qty * item.rate) || 0,
        }))
      })
    } else if (!props.isEditing) {
      Object.assign(form, getDefaultForm())
      errorMessage.value = ''
    }
  },
  { immediate: true, deep: true }
)

// ─── Item Actions ─────────────────────────────────────
const addItemRow = () => {
  form.items.push({ item_code: '', item_name: '', uom: '', warehouse: '', qty: 1, rate: 0, amount: 0 })
}

const removeItemRow = (index) => form.items.splice(index, 1)

const selectItem = (index) => {
  const product = availableProducts.value.find(p => p.item_code === form.items[index].item_code)
  if (product) {
    form.items[index].item_name = product.item_name || ''
    form.items[index].uom       = product.stock_uom || form.items[index].uom
    form.items[index].rate      = product.valuation_rate || product.rate || 0
    calculateItemTotal(index)
  }
}

const calculateItemTotal = (index) => {
  const item = form.items[index]
  item.amount = (item.qty || 0) * (item.rate || 0)
}

// ─── Submit ───────────────────────────────────────────
const handleSubmit = async () => {
  console.log("handleSubmithandleSubmit")
  errorMessage.value = ''

  if (!form.supplier)          { errorMessage.value = 'Please select a supplier.'; return }
  if (form.items.length === 0) { errorMessage.value = 'Add at least one item.'; return }

  const invalid = form.items.filter(i => !i.item_code || i.qty <= 0)
  if (invalid.length) { errorMessage.value = 'Each item must have a code and qty > 0.'; return }

  isSaving.value = true
  try {
    emit('save', {
      posting_date:    form.posting_date,
      supplier:        form.supplier,
      remarks:         form.notes      || undefined,
      additional_discount_percentage: form.discount_rate || 0,
      tax_rate:        form.tax_rate   || 0,
      items: form.items.map(item => ({
        item_code:  item.item_code,
        item_name:  item.item_name,
        uom:        item.uom,
        warehouse:  item.warehouse,
        qty:        item.qty,
        rate:       item.rate,
        amount:     item.amount,
      }))
    })
  } catch (error) {
    const msg =
      error?.response?.data?.exception ||
      error?.response?.data?.message   ||
      error?.message ||
      'Error saving. Please try again.'
    errorMessage.value = msg.split('\n')[0]
  } finally {
    isSaving.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(async () => {
  await fetchSuppliers()
  uoms.value       = await inventoryStore.loadUOM?.()       || []
  warehouses.value = await inventoryStore.loadWarehouses?.() || []
})
</script>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
