<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? 'Edit Item' : 'Add New Item' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Item Code & Name Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Item Code (Edit mode only) -->
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
            <input
              type="text"
              :value="form.item_code"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <!-- Series (Add mode only) -->
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-2">Series <span class="text-red-700">*</span></label>
            <select
              v-model="form.naming_series"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option disabled value="">Select Series</option>
              <option v-for="s in getSeriesArray()" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <!-- Item Name (Both modes) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Item Name <span class="text-red-700">*</span></label>
            <input
              v-model="form.item_name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Coffee Beans"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Item description"
          ></textarea>
        </div>

        <!-- Category & UOM Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category <span class="text-red-700">*</span></label>
            <select
              v-model="form.item_group"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">Unit of Measure <span class="text-red-700">*</span></label>
            <select
              v-model="form.stock_uom"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select UOM</option>
              <option v-for="uom in uoms" :key="uom.name" :value="uom.name">{{ uom.name }}</option>
            </select>
          </div>
        </div>

        <!-- Valuation Rate -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Valuation Rate</label>
            <input
              v-model.number="form.valuation_rate"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <!-- Disabled checkbox (Edit only) -->
          <div v-if="isEditing" class="flex items-end">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.disabled"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <span class="text-sm font-medium text-gray-700">Disabled</span>
            </label>
          </div>
        </div>

        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
            @click="$refs.imageInput?.click()"
          >
            <div v-if="!form.image" class="text-gray-500">
              <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <p class="text-sm">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
            </div>

            <div v-else class="mt-2">
              <img
                :src="getImageSrc()"
                :alt="form.item_name"
                class="h-32 w-32 object-cover rounded mx-auto mb-3"
                @error="handleImageError"
              />
              <p class="text-sm text-gray-600 mb-2">{{ getImageFileName() }}</p>
              <button
                type="button"
                @click.stop="form.image = ''"
                class="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Remove Image
              </button>
            </div>
          </div>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving || !isFormValid()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Add') }} Item
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import config from '@/config/frappe'

  const props = defineProps( {
    show: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      default: () => []
    },
    uoms: {
      type: Array,
      default: () => []
    },
    series: {
      type: String,
      default: ''
    }
  })
  const emit = defineEmits(['save', 'close'])

    const isSaving = ref(false)
    const imageInput = ref(null)
    const previousItem = ref(null)

    const defaultForm = {
      naming_series: '',
      item_code: '',
      item_name: '',
      description: '',
      item_group: '',
      stock_uom: 'Nos',
      valuation_rate: 0,
      image: '',
      disabled: false
    }

    const form = reactive({ ...defaultForm })

    // Better watcher: Only update when item actually changes
    watch(
      () => props.item,
      (newItem) => {
        // تجنب تحديث الـ form إذا لم يتغير الـ item فعلياً
        if (newItem && JSON.stringify(newItem) !== JSON.stringify(previousItem.value)) {
          previousItem.value = newItem

          if (props.isEditing) {
            // Fill form with all item data for editing
            Object.assign(form, {
              naming_series: newItem.naming_series || '',
              item_code: newItem.item_code || '',
              item_name: newItem.item_name || '',
              description: newItem.description || '',
              item_group: newItem.item_group || '',
              stock_uom: newItem.stock_uom || 'Nos',
              valuation_rate: newItem.valuation_rate || 0,
              image: newItem.image || '',
              disabled: Boolean(newItem.disabled)
            })
          } else {
            // Reset for new item
            Object.assign(form, defaultForm)
          }
        } else if (!newItem) {
          // Close modal, reset form
          previousItem.value = null
          Object.assign(form, defaultForm)
        }
      },
      { immediate: true }
    )

    // Parse series string safely
    const getSeriesArray = () => {
      if (!props.series) return []
      if (typeof props.series === 'string') {
        return props.series.split(' ').filter(s => s.trim())
      }
      return Array.isArray(props.series) ? props.series : []
    }

    // Handle image source properly
    const getImageSrc = () => {
      if (!form.image) return ''
      // If it's already a data URL
      if (form.image.startsWith('data:')) {
        return form.image
      }
      // If it's a file path from server
      if (form.image.startsWith('/files/') || form.image.startsWith('/app/')) {
        return config.FRAPPE_URL + form.image
      }
      // Return as is
      return config.FRAPPE_URL + form.image || form.image
    }

    // Get image file name for display
    const getImageFileName = () => {
      if (!form.image) return ''
      if (form.image.startsWith('data:')) {
        return 'New image selected'
      }
      const parts = form.image.split('/')
      return parts[parts.length - 1]
    }

    // Handle image load error
    const handleImageError = (event) => {
      console.warn('Image failed to load:', event)
    }

    // Validate form before submit
    const isFormValid = () => {
      if (props.isEditing) {
        return form.item_name && form.item_group && form.stock_uom
      }
      return (
        form.naming_series &&
        form.item_name &&
        form.item_group &&
        form.stock_uom
      )
    }

    const handleImageUpload = (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          form.image = result
          console.log('Image uploaded successfully',form.image)
        }
      }
      reader.onerror = () => {
        alert('Failed to read file')
      }
      reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
      // Validate before submit
      if (!isFormValid()) {
        alert('Please fill in all required fields')
        return
      }

      isSaving.value = true

      try {
        let payload = {}

        if (props.isEditing && props.item) {
          // For edit: send only the fields we want to update
          payload = {
            item_code: form.item_code,
            item_name: form.item_name,
            description: form.description,
            item_group: form.item_group,
            stock_uom: form.stock_uom,
            valuation_rate: form.valuation_rate,
            disabled: form.disabled
          }

          // Only include image if it changed
          if (form.image && form.image !== props.item.image) {
            payload.image = form.image
          }
        } else {
          // For new item: send all required fields
          payload = {
            naming_series: form.naming_series,
            item_name: form.item_name,
            description: form.description,
            item_group: form.item_group,
            stock_uom: form.stock_uom,
            valuation_rate: form.valuation_rate || 0
          }

          if (form.image) {
            payload.image = form.image
          }
        }

        console.log('Submitting payload:', payload)
        emit('save', payload)
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Error saving item. Please try again.')
      } finally {
        isSaving.value = false
      }
    }

</script>
