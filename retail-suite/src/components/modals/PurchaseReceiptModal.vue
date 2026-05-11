<!-- PurchaseReceiptModal.vue -->

<template>
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0.5);"
      @mousedown.self="$emit('close')"
    >
      <div
        class="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl"
        :style="{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }"
      >

        <!-- ══════════ HEADER ══════════ -->
        <div
          class="flex items-center justify-between px-5 py-3 shrink-0"
          :style="{ borderBottom: '1px solid var(--card-border)' }"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 flex items-center justify-center rounded-lg"
              :style="{ background: 'var(--info-bg)' }"
            >
              <component
                :is="isEditing ? Edit2 : Plus"
                class="w-4 h-4"
                :style="{ color: 'var(--focus-ring)' }"
              />
            </div>
            <div>
              <h2 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">
                {{ isEditing ? 'Edit Purchase Receipt' : 'New Purchase Receipt' }}
              </h2>
              <p v-if="isEditing && props.purchase?.name" class="text-xs" :style="{ color: 'var(--text-muted)' }">
                {{ props.purchase.name }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="w-6 h-6 flex items-center justify-center rounded transition-colors"
            :style="{ color: 'var(--text-muted)' }"
            @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
            @mouseleave="$event.currentTarget.style.background = 'transparent'"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- ══════════ BODY ══════════ -->
        <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4" style="scrollbar-width: thin;">

          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

            <!-- Supplier -->
            <div class="md:col-span-2">
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">
                Supplier <span style="color: #ef4444;">*</span>
              </label>
              <select
                v-model="form.supplier"
                required
                class="w-full px-3 py-1.5 rounded-md text-xs focus:outline-none"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              >
                <option value="" disabled>
                  {{ loadingSuppliers ? 'Loading...' : 'Select Supplier' }}
                </option>
                <option v-for="s in suppliers" :key="s.name" :value="s.name">
                  {{ s.supplier_name || s.name }}
                </option>
              </select>
              <p v-if="selectedSupplierName" class="mt-1 text-xs font-medium" :style="{ color: 'var(--icon-color-green)' }">
                ✓ {{ selectedSupplierName }}
              </p>
            </div>

            <!-- Posting Date -->
            <div>
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">
                Receipt Date <span style="color: #ef4444;">*</span>
              </label>
              <input
                v-model="form.posting_date"
                type="date"
                required
                class="w-full px-3 py-1.5 rounded-md text-xs focus:outline-none"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
            </div>

            <!-- Remarks -->
            <div class="md:col-span-3">
              <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--text-muted)' }">Remarks</label>
              <input
                v-model="form.notes"
                type="text"
                placeholder="Optional notes..."
                class="w-full px-3 py-1.5 rounded-md text-xs focus:outline-none"
                :style="{
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--input-border)'
                }"
              />
            </div>
          </div>

          <!-- Divider -->
          <div :style="{ borderTop: '1px solid var(--card-border)' }" />

          <!-- Items Table -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">
                Purchase Items
                <span v-if="form.items.length" class="ml-1" :style="{ color: 'var(--focus-ring)' }">
                  ({{ form.items.length }})
                </span>
              </h4>
              <button
                type="button"
                @click="addItemRow"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                :style="{
                  background: 'var(--info-bg)',
                  color: 'var(--focus-ring)',
                  border: '1px solid var(--info-border)'
                }"
                @mouseover="$event.currentTarget.style.background = 'var(--info-border)'"
                @mouseleave="$event.currentTarget.style.background = 'var(--info-bg)'"
              >
                <Plus class="w-3 h-3" /> Add Item
              </button>
            </div>

            <!-- Empty State -->
            <div
              v-if="form.items.length === 0"
              class="rounded-lg py-10 text-center"
              :style="{ border: '2px dashed var(--card-border)' }"
            >
              <Package class="w-8 h-8 mx-auto mb-2" :style="{ color: 'var(--text-muted)', opacity: 0.4 }" />
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                No items yet. Click <strong :style="{ color: 'var(--focus-ring)' }">Add Item</strong> to start.
              </p>
            </div>

            <!-- Table -->
            <div
              v-else
              class="rounded-lg overflow-hidden"
              :style="{ border: '1px solid var(--card-border)' }"
            >
              <div class="overflow-x-auto" style="scrollbar-width: thin;">
                <table class="w-full" style="font-size: 12px;">
                  <thead :style="{ background: 'var(--item-bg)', borderBottom: '1px solid var(--card-border)' }">
                    <tr>
                      <th class="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-8" :style="{ color: 'var(--text-muted)' }">#</th>
                      <th class="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide min-w-[160px]" :style="{ color: 'var(--text-muted)' }">Item</th>
                      <th class="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-24" :style="{ color: 'var(--text-muted)' }">UOM</th>
                      <th class="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide w-32" :style="{ color: 'var(--text-muted)' }">Warehouse</th>
                      <th class="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide w-20" :style="{ color: 'var(--text-muted)' }">Qty</th>
                      <th class="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide w-24" :style="{ color: 'var(--text-muted)' }">Rate</th>
                      <th class="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide w-24" :style="{ color: 'var(--text-muted)' }">Amount</th>
                      <th class="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in form.items"
                      :key="index"
                      :style="{ borderBottom: '1px solid var(--card-border)' }"
                      @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                      @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
                    >
                      <!-- # -->
                      <td class="px-2 py-2 text-xs" :style="{ color: 'var(--text-muted)' }">{{ index + 1 }}</td>

                      <!-- Item -->
                      <td class="px-2 py-2">
                        <select
                          v-model="item.item_code"
                          @change="selectItem(index)"
                          class="w-full px-2 py-1 rounded-md text-xs focus:outline-none"
                          :style="{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--input-border)'
                          }"
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
                        <p v-if="item.item_name" class="mt-0.5 text-xs truncate" :style="{ color: 'var(--text-muted)' }">
                          {{ item.item_name }}
                        </p>
                      </td>

                      <!-- UOM -->
                      <td class="px-2 py-2">
                        <select
                          v-model="item.uom"
                          class="w-full px-2 py-1 rounded-md text-xs focus:outline-none"
                          :style="{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--input-border)'
                          }"
                        >
                          <option value="">UOM</option>
                          <option v-for="uom in uoms" :key="uom.name" :value="uom.name">{{ uom.name }}</option>
                        </select>
                      </td>

                      <!-- Warehouse -->
                      <td class="px-2 py-2">
                        <select
                          v-model="item.warehouse"
                          class="w-full px-2 py-1 rounded-md text-xs focus:outline-none"
                          :style="{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--input-border)'
                          }"
                        >
                          <option value="">Warehouse</option>
                          <option v-for="wh in warehouses" :key="wh.name" :value="wh.name">{{ wh.name }}</option>
                        </select>
                      </td>

                      <!-- Qty -->
                      <td class="px-2 py-2">
                        <input
                          v-model.number="item.qty"
                          type="number" min="0.001" step="any"
                          @input="calculateItemTotal(index)"
                          class="w-full px-2 py-1 rounded-md text-xs text-right focus:outline-none"
                          :style="{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--input-border)'
                          }"
                        />
                      </td>

                      <!-- Rate -->
                      <td class="px-2 py-2">
                        <input
                          v-model.number="item.rate"
                          type="number" min="0" step="any"
                          @input="calculateItemTotal(index)"
                          class="w-full px-2 py-1 rounded-md text-xs text-right focus:outline-none"
                          :style="{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--input-border)'
                          }"
                        />
                      </td>

                      <!-- Amount -->
                      <td class="px-2 py-2 text-right">
                        <span class="text-xs font-semibold" :style="{ color: 'var(--focus-ring)' }">
                          {{ formatPrice(item.amount || 0) }}
                        </span>
                      </td>

                      <!-- Remove -->
                      <td class="px-2 py-2 text-center">
                        <button
                          type="button"
                          @click="removeItemRow(index)"
                          class="w-6 h-6 flex items-center justify-center rounded transition-colors"
                          :style="{ color: 'var(--text-muted)' }"
                          @mouseover="$event.currentTarget.style.background = '#fef2f2'; $event.currentTarget.style.color = '#ef4444'"
                          @mouseleave="$event.currentTarget.style.background = 'transparent'; $event.currentTarget.style.color = 'var(--text-muted)'"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>

                  <!-- Subtotal footer -->
                  <tfoot :style="{ background: 'var(--item-bg)', borderTop: '1px solid var(--card-border)' }">
                    <tr>
                      <td colspan="6" class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">
                        Subtotal
                      </td>
                      <td class="px-3 py-2 text-right text-xs font-bold" :style="{ color: 'var(--text-main)' }">
                        {{ formatPrice(subtotal) }}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Totals Summary -->
          <div v-if="form.items.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-2">

            <div class="rounded-lg p-3" :style="{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }">
              <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">Subtotal</p>
              <p class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">{{ formatPrice(subtotal) }}</p>
            </div>

            <div class="rounded-lg p-3" :style="{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }">
              <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">
                Discount
                (<input
                  v-model.number="form.discount_rate"
                  type="number" min="0" max="100" step="0.01"
                  class="w-9 inline bg-transparent text-xs text-center focus:outline-none border-b"
                  :style="{ borderColor: 'var(--warning-border)', color: 'var(--warning-border)' }"
                />%)
              </p>
              <p class="text-sm font-bold" :style="{ color: 'var(--warning-border)' }">-{{ formatPrice(discountAmount) }}</p>
            </div>

            <div class="rounded-lg p-3" :style="{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }">
              <p class="text-xs mb-1" :style="{ color: 'var(--text-muted)' }">
                Tax
                (<input
                  v-model.number="form.tax_rate"
                  type="number" min="0" max="100" step="0.01"
                  class="w-9 inline bg-transparent text-xs text-center focus:outline-none border-b"
                  :style="{ borderColor: 'var(--focus-ring)', color: 'var(--focus-ring)' }"
                />%)
              </p>
              <p class="text-sm font-bold" :style="{ color: 'var(--focus-ring)' }">+{{ formatPrice(taxAmount) }}</p>
            </div>

            <div class="rounded-lg p-3" :style="{ background: 'var(--focus-ring)' }">
              <p class="text-xs mb-1" style="color: rgba(255,255,255,0.75);">Grand Total</p>
              <p class="text-base font-bold text-white">{{ formatPrice(totalAmount) }}</p>
            </div>

          </div>

        </div>

        <!-- ══════════ ERROR BANNER ══════════ -->
        <div
          v-if="errorMessage"
          class="mx-5 mb-3 flex items-start gap-2 rounded-lg px-3 py-2.5 shrink-0 text-xs"
          :style="{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }"
        >
          <AlertCircle class="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>{{ errorMessage }}</p>
        </div>

        <!-- ══════════ FOOTER ══════════ -->
        <div
          class="px-5 py-3 flex items-center justify-between shrink-0 rounded-b-xl"
          :style="{ borderTop: '1px solid var(--card-border)', background: 'var(--item-bg)' }"
        >
          <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
            <template v-if="form.items.length > 0">
              {{ form.items.length }} item{{ form.items.length > 1 ? 's' : '' }} ·
              <span class="font-semibold" :style="{ color: 'var(--text-main)' }">{{ formatPrice(totalAmount) }}</span>
            </template>
            <template v-else>No items added yet</template>
          </p>

          <div class="flex gap-2">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="isSaving"
              class="px-4 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50"
              :style="{
                background: 'var(--card-bg)',
                color: 'var(--text-sub)',
                border: '1px solid var(--card-border)'
              }"
              @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
              @mouseleave="$event.currentTarget.style.background = 'var(--card-bg)'"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="isSaving || form.items.length === 0 || !form.supplier"
              class="px-4 py-1.5 text-xs text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              :style="{ background: 'var(--focus-ring)' }"
            >
              <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              {{ isSaving ? 'Saving...' : isEditing ? 'Update Receipt' : 'Create Receipt' }}
            </button>
          </div>
        </div>

      </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { X, Plus, Edit2, Trash2, Package, Save, Loader2, AlertCircle } from 'lucide-vue-next'
import { useInventoryStore } from '@/stores/inventory'
import { formatPrice } from '@/utils/formatters'
import { getSuppliers } from '@/services/api'

const props = defineProps({
  show:      { type: Boolean, default: false },
  purchase:  { type: Object,  default: null  },
  isEditing: { type: Boolean, default: false },
  products:  { type: Array,   default: () => [] },
})
const emit = defineEmits(['save', 'close'])

const inventoryStore   = useInventoryStore()
const isSaving         = ref(false)
const errorMessage     = ref('')
const suppliers        = ref([])
const loadingSuppliers = ref(false)
const uoms             = ref([])
const warehouses       = ref([])

const fetchSuppliers = async () => {
  loadingSuppliers.value = true
  try {
    const res = await getSuppliers()
    suppliers.value = res.data || []
  } catch (e) {
    console.error('Error loading suppliers:', e)
  } finally {
    loadingSuppliers.value = false
  }
}

const selectedSupplierName = computed(() => {
  if (!form.supplier) return ''
  const found = suppliers.value.find(s => s.name === form.supplier)
  if (found && found.supplier_name && found.supplier_name !== found.name) return found.supplier_name
  return ''
})

const getDefaultForm = () => ({
  posting_date:  new Date().toISOString().split('T')[0],
  supplier:      '',
  notes:         '',
  discount_rate: 0,
  tax_rate:      0,
  items:         [],
})

const form = reactive(getDefaultForm())

const availableProducts = computed(() =>
  props.products?.length ? props.products : inventoryStore.items || []
)

const subtotal       = computed(() => form.items.reduce((sum, i) => sum + Number(i.amount || 0), 0))
const discountAmount = computed(() => (subtotal.value * (form.discount_rate || 0)) / 100)
const taxAmount      = computed(() => ((subtotal.value - discountAmount.value) * (form.tax_rate || 0)) / 100)
const totalAmount    = computed(() => subtotal.value - discountAmount.value + taxAmount.value)

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
          item_code: item.item_code  || '',
          item_name: item.item_name  || '',
          uom:       item.uom        || item.stock_uom || '',
          warehouse: item.warehouse  || '',
          qty:       item.qty        || 0,
          rate:      item.rate       || 0,
          amount:    item.amount     || (item.qty * item.rate) || 0,
        }))
      })
    } else if (!props.isEditing) {
      Object.assign(form, getDefaultForm())
      errorMessage.value = ''
    }
  },
  { immediate: true, deep: true }
)

const addItemRow    = () => form.items.push({ item_code: '', item_name: '', uom: '', warehouse: '', qty: 1, rate: 0, amount: 0 })
const removeItemRow = (i) => form.items.splice(i, 1)

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

const handleSubmit = async () => {
  errorMessage.value = ''
  if (!form.supplier)          { errorMessage.value = 'Please select a supplier.'; return }
  if (form.items.length === 0) { errorMessage.value = 'Add at least one item.'; return }
  const invalid = form.items.filter(i => !i.item_code || i.qty <= 0)
  if (invalid.length)          { errorMessage.value = 'Each item must have a code and qty > 0.'; return }

  isSaving.value = true
  try {
    emit('save', {
      posting_date: form.posting_date,
      supplier:     form.supplier,
      remarks:      form.notes || undefined,
      additional_discount_percentage: form.discount_rate || 0,
      tax_rate:     form.tax_rate || 0,
      items: form.items.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        uom:       item.uom,
        warehouse: item.warehouse,
        qty:       item.qty,
        rate:      item.rate,
        amount:    item.amount,
      }))
    })
  } catch (error) {
    const msg = error?.response?.data?.exception || error?.response?.data?.message || error?.message || 'Error saving.'
    errorMessage.value = msg.split('\n')[0]
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await fetchSuppliers()
  uoms.value       = await inventoryStore.loadUOM?.()        || []
  warehouses.value = await inventoryStore.loadWarehouses?.() || []
})
</script>
