<template>
  <MainLayout>
    <div class="w-full flex min-h-screen bg-slate-50">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Tag class="w-7 h-7 text-indigo-600" />
              <div>
                <h1 class="text-lg font-bold text-gray-900">Item Price</h1>
                <p class="text-xs text-gray-500">Manage pricing per price list</p>
              </div>
            </div>
            <button
              @click="openAddModal"
              class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <Plus class="w-4 h-4" />
              Add Price
            </button>
          </div>
        </header>

        <!-- Filters -->
        <section class="px-4 py-3">
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">

              <!-- Price List Selector -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Price List</label>
                <select
                  v-model="selectedPriceList"
                  @change="loadItemPrices"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">All Price Lists</option>
                  <option
                    v-for="pl in priceLists"
                    :key="pl.name"
                    :value="pl.name"
                  >
                    {{ pl.price_list_name || pl.name }}
                    <span v-if="pl.is_pos_price_list"> ⭐ POS</span>
                  </option>
                </select>
              </div>

              <!-- Item Search -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Item</label>
                <input
                  v-model="searchItem"
                  type="text"
                  placeholder="Search item..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <!-- Currency -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Currency</label>
                <input
                  v-model="searchCurrency"
                  type="text"
                  placeholder="e.g. USD, SAR..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <!-- Reset -->
              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <!-- POS Price List Badge -->
            <div v-if="posPriceList" class="mt-3 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-medium">
                <Star class="w-3 h-3 fill-amber-500 text-amber-500" />
                POS Default: {{ posPriceList.price_list_name || posPriceList.name }}
              </span>
              <button
                @click="selectedPriceList = posPriceList.name; loadItemPrices()"
                class="text-xs text-indigo-600 hover:underline"
              >
                View POS Prices →
              </button>
            </div>
          </div>
        </section>

        <!-- Stats -->
        <section class="px-4 pb-2">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div class="bg-white rounded-lg border border-gray-200 p-3">
              <p class="text-xs text-gray-500">Total Prices</p>
              <p class="text-2xl font-bold text-indigo-600">{{ itemPrices.length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-3">
              <p class="text-xs text-gray-500">Price Lists</p>
              <p class="text-2xl font-bold text-blue-600">{{ priceLists.length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-3">
              <p class="text-xs text-gray-500">Avg Price</p>
              <p class="text-2xl font-bold text-green-600">{{ formatPrice(avgPrice) }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-3">
              <p class="text-xs text-gray-500">Filtered</p>
              <p class="text-2xl font-bold text-purple-600">{{ filteredPrices.length }}</p>
            </div>
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span class="ml-3 text-gray-500 text-sm">Loading prices...</span>
        </div>

        <!-- Table -->
        <section v-else class="flex-1 px-4 pb-6">
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Code</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Name</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price List</th>
                    <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price (Rate)</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">UOM</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Valid From</th>
                    <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="price in filteredPrices"
                    :key="price.name"
                    class="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td class="px-5 py-3.5 text-sm font-mono font-medium text-gray-900">{{ price.item_code }}</td>
                    <td class="px-5 py-3.5 text-sm text-gray-700">{{ price.item_name || '-' }}</td>
                    <td class="px-5 py-3.5 text-sm">
                      <span class="inline-flex items-center gap-1">
                        <Star
                          v-if="isPOSPriceList(price.price_list)"
                          class="w-3 h-3 fill-amber-400 text-amber-400"
                        />
                        {{ price.price_list }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-sm font-bold text-right text-indigo-700">
                      {{ formatPrice(price.price_list_rate) }}
                    </td>
                    <td class="px-5 py-3.5 text-sm text-gray-600">{{ price.currency || '-' }}</td>
                    <td class="px-5 py-3.5 text-sm text-gray-600">{{ price.uom || '-' }}</td>
                    <td class="px-5 py-3.5 text-sm text-gray-500">{{ formatDate(price.valid_from) }}</td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          @click="editPrice(price)"
                          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 class="w-3.5 h-3.5" />
                        </button>
                        <button
                          @click="deletePrice(price)"
                          class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredPrices.length === 0">
                    <td colspan="8" class="px-5 py-16 text-center text-gray-400 text-sm">
                      <Tag class="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No item prices found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- ── Add / Edit Modal ── -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-gray-700/50 flex items-center justify-center z-50 p-4"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg">

            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 class="text-base font-semibold text-gray-900">
                {{ isEditing ? 'Edit Item Price' : 'Add Item Price' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="p-6 space-y-4">

              <!-- Item Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Item Code *</label>
                <select
                  v-model="form.item_code"
                  @change="onItemChange"
                  :disabled="isEditing"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">Select Item</option>
                  <option
                    v-for="item in inventoryItems"
                    :key="item.item_code"
                    :value="item.item_code"
                  >
                    {{ item.item_code }} — {{ item.item_name }}
                  </option>
                </select>
              </div>

              <!-- Price List -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Price List *</label>
                <select
                  v-model="form.price_list"
                  :disabled="isEditing"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">Select Price List</option>
                  <option
                    v-for="pl in priceLists"
                    :key="pl.name"
                    :value="pl.name"
                  >
                    {{ pl.price_list_name || pl.name }}
                  </option>
                </select>
              </div>

              <!-- Rate + Currency row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Price (Rate) *</label>
                  <input
                    v-model.number="form.price_list_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-right"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                  <input
                    v-model="form.currency"
                    type="text"
                    placeholder="SAR"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <!-- UOM + Valid From -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">UOM</label>
                   <select
                        v-model="form.uom"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select UOM</option>
                        <option v-for="uom in uoms" :key="uom.name" :value="uom.name">{{ uom.name }}</option>
                    </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Valid From</label>
                  <input
                    v-model="form.valid_from"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <!-- Valid Upto -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Valid Upto</label>
                <input
                  v-model="form.valid_upto"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <!-- Error -->
              <div v-if="modalError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ modalError }}
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                @click="closeModal"
                class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="savePrice"
                :disabled="isSaving"
                class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 font-medium"
              >
                {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Add') }} Price
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useInventoryStore } from '@/stores/inventory'
import { formatPrice } from '@/utils/formatters'
import { Tag, Plus, Edit2, Trash2, Star, X } from 'lucide-vue-next'
import {
  getPOSPriceList,
  getAllPriceLists,
  getItemPrices,
  createItemPrice,
  updateItemPrice,
  deleteItemPrice,
} from '@/services/api'

// ─── State ────────────────────────────────────────────
const inventoryStore    = useInventoryStore()
const loading           = ref(false)
const itemPrices        = ref([])
const priceLists        = ref([])
const posPriceList      = ref(null)

const uoms              = ref([])
const selectedPriceList = ref('')
const searchItem        = ref('')
const searchCurrency    = ref('')

const showModal  = ref(false)
const isEditing  = ref(false)
const isSaving   = ref(false)
const modalError = ref('')
const editingName = ref(null)

const form = ref(getDefaultForm())

function getDefaultForm() {
  return {
    item_code:       '',
    item_name:       '',
    price_list:      '',
    price_list_rate: 0,
    currency:        'SAR',
    uom:             '',
    valid_from:      '',
    valid_upto:      '',
  }
}

// ─── Inventory Items ──────────────────────────────────
const inventoryItems = computed(() => inventoryStore.items || [])

// ─── Load ─────────────────────────────────────────────
// Frappe whitelisted methods return { data: { message: value } } via axios
const unwrap = (res) => {
  const d = res?.data
  if (d && 'message' in d) return d.message
  return d ?? null
}

const loadAll = async () => {
  loading.value = true
  try {
    const [plRes, posRes, priceRes] = await Promise.all([
      getAllPriceLists(),
      getPOSPriceList(),
      getItemPrices({ price_list: selectedPriceList.value }),

    ])
    priceLists.value   = unwrap(plRes)   || []
    posPriceList.value = unwrap(posRes)  || null
    itemPrices.value   = unwrap(priceRes) || []


  } catch (e) {
    console.error('Error loading item prices:', e)
  } finally {
    loading.value = false
  }
}

const loadItemPrices = async () => {
  loading.value = true
  try {
    const res = await getItemPrices({ price_list: selectedPriceList.value })
    itemPrices.value = unwrap(res) || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ─── Computed ─────────────────────────────────────────
const filteredPrices = computed(() => {
  let data = [...itemPrices.value]

  if (searchItem.value) {
    const q = searchItem.value.toLowerCase()
    data = data.filter(p =>
      p.item_code?.toLowerCase().includes(q) ||
      p.item_name?.toLowerCase().includes(q)
    )
  }

  if (searchCurrency.value) {
    data = data.filter(p =>
      p.currency?.toLowerCase().includes(searchCurrency.value.toLowerCase())
    )
  }

  return data
})

const avgPrice = computed(() => {
  if (!itemPrices.value.length) return 0
  const sum = itemPrices.value.reduce((s, p) => s + (p.price_list_rate || 0), 0)
  return sum / itemPrices.value.length
})

const isPOSPriceList = (name) =>
  posPriceList.value && posPriceList.value.name === name

// ─── Helpers ──────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-'

const resetFilters = () => {
  selectedPriceList.value = ''
  searchItem.value        = ''
  searchCurrency.value    = ''
  loadItemPrices()
}

const onItemChange = () => {
  const found = inventoryItems.value.find(i => i.item_code === form.value.item_code)
  if (found) {
    form.value.item_name = found.item_name
    form.value.uom       = found.stock_uom || ''
  }
}

// ─── Modal ────────────────────────────────────────────
const openAddModal = () => {
  isEditing.value   = false
  editingName.value = null
  form.value        = getDefaultForm()
  if (selectedPriceList.value) form.value.price_list = selectedPriceList.value
  modalError.value  = ''
  showModal.value   = true
}

const editPrice = (price) => {
  isEditing.value   = true
  editingName.value = price.name
  form.value = {
    item_code:       price.item_code,
    item_name:       price.item_name || '',
    price_list:      price.price_list,
    price_list_rate: price.price_list_rate,
    currency:        price.currency || 'SAR',
    uom:             price.uom || '',
    valid_from:      price.valid_from || '',
    valid_upto:      price.valid_upto || '',
  }
  modalError.value  = ''
  showModal.value   = true
}

const closeModal = () => {
  showModal.value   = false
  editingName.value = null
}

const savePrice = async () => {
  modalError.value = ''

  if (!form.value.item_code)       { modalError.value = 'Item Code is required'; return }
  if (!form.value.price_list)      { modalError.value = 'Price List is required'; return }
  if (form.value.price_list_rate < 0) { modalError.value = 'Rate must be ≥ 0'; return }

  isSaving.value = true
  try {
    if (isEditing.value && editingName.value) {
      await updateItemPrice(editingName.value, form.value)
    } else {
      await createItemPrice(form.value)
    }
    await loadItemPrices()
    closeModal()
  } catch (e) {
    console.error(e)
    modalError.value = e?.response?.data?.message || 'Error saving price.'
  } finally {
    isSaving.value = false
  }
}

const deletePrice = async (price) => {
  if (!confirm(`Delete price for "${price.item_code}" in "${price.price_list}"?`)) return
  try {
    await deleteItemPrice(price.name)
    itemPrices.value = itemPrices.value.filter(p => p.name !== price.name)
  } catch (e) {
    console.error(e)
    alert('Error deleting price')
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(async() => {
  await loadAll()
  await inventoryStore.loadItems?.()
  const fetchedUoms = await inventoryStore.loadUOM()
  console.log("ffff",fetchedUoms)
  uoms.value = fetchedUoms || []
})
</script>
