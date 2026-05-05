<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? 'Edit Stock Transfer' : 'Create Stock Transfer' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl font-light"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Reference & Status Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reference No. *</label>
            <input
              v-model="form.reference"
              type="text"
              required
              :readonly="isEditing"
              placeholder="e.g., TRF-001"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <!-- From & To Location Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Location *</label>
            <select
              v-model="form.from_location"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              <option value="main">Main Store</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Location *</label>
            <select
              v-model="form.to_location"
              required
              @change="validateLocations"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              <option value="main">Main Store</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Add any notes about this transfer..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <!-- Items Section -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Transfer Items</h4>
            <button
              type="button"
              @click="addItemRow"
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              + Add Item
            </button>
          </div>

          <!-- Items Table -->
          <div class="overflow-x-auto border border-gray-200 rounded-lg">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Item Code</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Item Name</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Available</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty to Transfer</th>
                  <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index" class="border-b border-gray-200 hover:bg-gray-50">
                  <!-- Item Code & Name Selection -->
                  <td class="px-4 py-3">
                    <select
                      v-model="item.item_code"
                      @change="selectItem(index)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select Item</option>
                      <option v-for="product in availableProducts" :key="product.item_code" :value="product.item_code">
                        {{ product.item_code }} - {{ product.item_name }}
                      </option>
                    </select>
                  </td>

                  <!-- Item Name (Display Only) -->
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ item.item_name || '-' }}
                  </td>

                  <!-- Available Quantity -->
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">
                    {{ item.available_qty || 0 }}
                  </td>

                  <!-- Quantity to Transfer -->
                  <td class="px-4 py-3">
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="0"
                      :max="item.available_qty || 0"
                      step="0.01"
                      @change="validateQuantity(index)"
                      placeholder="0.00"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </td>

                  <!-- Remove Button -->
                  <td class="px-4 py-3 text-center">
                    <button
                      type="button"
                      @click="removeItemRow(index)"
                      class="text-red-600 hover:text-red-900 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="form.items.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    <p>No items added. Click "Add Item" to add items to transfer.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">Total Items</p>
                <p class="text-2xl font-bold text-gray-900">{{ form.items.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Quantity</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalQuantity }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span :class="getStatusBadge(form.status)" class="inline-block px-3 py-1 rounded-full text-sm font-medium">
                  {{ form.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving || form.items.length === 0"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Transfer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useInventoryStore } from '@/stores/inventory'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    transfer: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    products: {
      type: Array,
      default: () => []
    }
  })
  const emit = defineEmits(['save', 'close'])

    const inventoryStore = useInventoryStore()
    const isSaving = ref(false)
    const errorMessage = ref('')

    const defaultForm = {
      reference: '',
      date: new Date().toISOString().split('T')[0],
      from_location: '',
      to_location: '',
      status: 'pending',
      notes: '',
      items: []
    }

    const form = reactive({ ...defaultForm })

    // Get available products (from inventory store or props)
    const availableProducts = computed(() => {
      return props.products || inventoryStore.items || []
    })

    // Calculate total quantity
    const totalQuantity = computed(() => {
      return form.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    })

    // Watch for show prop changes
    watch(
      () => props.show,
      (newShow) => {
        if (newShow && props.transfer && props.isEditing) {
          // Load transfer data for editing
          Object.assign(form, JSON.parse(JSON.stringify(props.transfer)))
        } else if (newShow) {
          // Reset form for new transfer
          Object.assign(form, defaultForm)
          form.date = new Date().toISOString().split('T')[0]
          errorMessage.value = ''
        }
      }
    )

    // Watch transfer prop for updates
    watch(
      () => props.transfer,
      (newTransfer) => {
        if (newTransfer && props.isEditing && props.show) {
          Object.assign(form, JSON.parse(JSON.stringify(newTransfer)))
        }
      },
      { deep: true }
    )

    const addItemRow = () => {
      form.items.push({
        item_code: '',
        item_name: '',
        available_qty: 0,
        quantity: 0
      })
    }

    const removeItemRow = (index) => {
      form.items.splice(index, 1)
    }

    const selectItem = (index) => {
      const itemCode = form.items[index].item_code
      const product = availableProducts.value.find(p => p.item_code === itemCode)

      if (product) {
        form.items[index].item_name = product.item_name
        form.items[index].available_qty = product.qty || 0
        form.items[index].quantity = 0
      }
    }

    const validateQuantity = (index) => {
      const item = form.items[index]

      if (item.quantity > item.available_qty) {
        errorMessage.value = `Cannot transfer more than available quantity (${item.available_qty})`
        item.quantity = item.available_qty
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      }

      if (item.quantity < 0) {
        item.quantity = 0
      }
    }

    const validateLocations = () => {
      if (form.from_location === form.to_location && form.from_location !== '') {
        errorMessage.value = 'From and To locations cannot be the same'
        form.to_location = ''
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      }
    }

    const getStatusBadge = (status) => {
      const badges = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in-transit': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800'
      }
      return badges[status] || 'bg-gray-100 text-gray-800'
    }

    const handleSubmit = async () => {
      errorMessage.value = ''

      // Validation
      if (!form.reference) {
        errorMessage.value = 'Reference number is required'
        return
      }

      if (!form.from_location || !form.to_location) {
        errorMessage.value = 'Both locations are required'
        return
      }

      if (form.from_location === form.to_location) {
        errorMessage.value = 'From and To locations must be different'
        return
      }

      if (form.items.length === 0) {
        errorMessage.value = 'At least one item is required'
        return
      }

      // Check if all items have quantities
      const itemsWithoutQty = form.items.filter(item => item.quantity <= 0 || !item.item_code)
      if (itemsWithoutQty.length > 0) {
        errorMessage.value = 'All items must have quantity and be selected'
        return
      }

      isSaving.value = true
      try {
        const transferData = {
          reference: form.reference,
          date: form.date,
          from_location: form.from_location,
          to_location: form.to_location,
          status: form.status,
          notes: form.notes,
          items: form.items.map(item => ({
            item_code: item.item_code,
            item_name: item.item_name,
            quantity: item.quantity
          }))
        }

        emit('save', transferData)
      } catch (error) {
        console.error('Error saving transfer:', error)
        errorMessage.value = 'Error saving transfer. Please try again.'
      } finally {
        isSaving.value = false
      }
    }

</script>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
