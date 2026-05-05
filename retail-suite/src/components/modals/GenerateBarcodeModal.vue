<!-- GenerateBarcodeModal.vue -->
<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
        <h3 class="text-lg font-semibold text-gray-900">Generate Barcode</h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl font-light"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Step Indicator (محسّن) -->
        <StepIndicator
          :current-step="currentStep"
          :steps="steps"
          @change-step="changeStep"
        />
        <!-- Step Indicator -->
     <!-- <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition',
                currentStep > index ? 'bg-green-500 text-white' : currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ currentStep > index ? '✓' : index + 1 }}
            </div>


              <span
                  v-if="index < steps.length - 1"
                  class="w-12 h-1 mx-5 transition-all duration-700"
                  :class="currentStep > index ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-200'">
              </span>

          </div>
        </div> -->

        <!-- Step Content -->
        <div class="space-y-4">
          <!-- Step 1: Select Product -->
          <div v-if="currentStep === 0">
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Select Product</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <select
                  v-model="form.item_code"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Product --</option>
                  <option v-for="product in products" :key="product.item_code" :value="product.item_code">
                    {{ product.item_code }}
                    <!-- (SKU: {{ product.sku }}) -->
                  </option>
                </select>
              </div>

              <!-- Search Products -->
              <div>
                <input
                  v-model="searchProduct"
                  type="text"
                  placeholder="Search product..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Selected Product Info -->
              <div v-if="selectedProduct" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-600 uppercase tracking-wide">Product Name</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedProduct.item_name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 uppercase tracking-wide">SKU</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedProduct.item_code }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 uppercase tracking-wide">Price</p>
                    <p class="text-sm font-medium text-gray-900">{{ formatPrice(selectedProduct.price) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 uppercase tracking-wide">Category</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedProduct.item_group || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <div v-else class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-sm text-yellow-800">Please select a product to continue</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Barcode Settings -->
          <div v-if="currentStep === 1">
            <!-- <h4 class="text-sm font-semibold text-gray-900 mb-4">Barcode Settings</h4> -->

            <div class="space-y-4">
              <!-- Barcode Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Type *</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="type in barcodeTypes"
                    :key="type"
                    type="button"
                    @click="form.type = type"
                    :class="[
                      'p-3 border-2 rounded-lg transition',
                      form.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <div class="text-sm font-medium">{{ type }}</div>
                    <div class="text-xs text-gray-600 mt-1">{{ type }}</div>
                  </button>
                </div>
              </div>

              <!-- Barcode Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Value</label>
                <div class="flex gap-2">
                  <input
                    v-model="form.value"
                    type="text"
                    placeholder="Leave empty for auto-generation"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    @click="autoGenerateValue"
                    class="px-4 py-2 bg-blue-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
                    title="Auto Generate"
                  >
                    <RefreshCcw class="w-5 h-5" />
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Length: {{ form.length }} characters</p>
              </div>
              <!-- Barcode Display -->
              <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-xs text-gray-600 uppercase tracking-wide mb-3">Preview</p>
                <div class="bg-white p-4 rounded border border-gray-200 h-40 flex items-center justify-center">
                  <img
                    v-if="previewBarcode"
                    class="max-w-full max-h-full"
                    :src="previewBarcode"
                  >
                  <p v-else class="text-gray-500 text-center">Barcode preview</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Quantity & Options -->
          <div v-if="currentStep === 2">
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Quantity & Options</h4>

            <div class="space-y-4">
              <!-- Quantity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantity to Generate *</label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  max="1000"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="text-xs text-gray-500 mt-1">You can generate up to 1000 barcodes at once</p>
              </div>

              <!-- Barcode Prefix -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Prefix (Optional)</label>
                <input
                  v-model="form.prefix"
                  type="text"
                  placeholder="e.g., PRD"
                  maxlength="5"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Barcode Suffix -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Barcode Suffix (Optional)</label>
                <input
                  v-model="form.suffix"
                  type="text"
                  placeholder="e.g., 2025"
                  maxlength="5"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Options -->
              <div class="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm font-medium text-gray-700">Options</p>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.printImmediately" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-700">Print immediately after generation</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.activateAutomatically" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-700">Activate barcodes automatically</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.downloadAfter" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-700">Download file after generation</span>
                </label>
              </div>

              <!-- Summary -->
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-900">
                  Ready to generate <strong>{{ form.quantity }}</strong> barcode(s) for <strong>{{ selectedProduct?.item_code }}</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Step 4: Confirmation -->
          <div v-if="currentStep === 3">
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Confirm & Generate</h4>

            <div class="space-y-4">
              <!-- Review -->
              <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm text-gray-600">Product</span>
                  <span class="text-sm font-medium text-gray-900">{{ selectedProduct?.item_name }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm text-gray-600">SKU</span>
                  <span class="text-sm font-medium text-gray-900">{{ selectedProduct?.item_code }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm text-gray-600">Barcode Type</span>
                  <span class="text-sm font-medium text-gray-900">{{ form.type }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="text-sm text-gray-600">Quantity</span>
                  <span class="text-sm font-medium text-gray-900">{{ form.quantity }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-600">Auto-Activate</span>
                  <span class="text-sm font-medium text-gray-900">{{ form.activateAutomatically ? 'Yes' : 'No' }}</span>
                </div>
              </div>

              <!-- Generate Button -->
              <button
                type="button"
                @click="generateBarcodes"
                :disabled="isGenerating"
                class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium disabled:opacity-50"
              >
                <span v-if="!isGenerating">Generate {{ form.quantity }} Barcode(s)</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <span class="inline-block animate-spin">⏳</span>
                  Generating...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-800 text-sm">{{ successMessage }}</p>
        </div>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          @click="previousStep"
          :disabled="currentStep === 0"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            v-if="currentStep < 3"
            type="button"
            @click="nextStep"
            :disabled="!canProceedToNext"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useToast } from 'vue-toastification';
import { generateBarcodePreview, generateBarcodeValue } from '../../services/api'
import { Download, Plus, Eye, Edit2, Trash2, Sparkles, Wand2, RefreshCcw } from 'lucide-vue-next'
import StepIndicator from '@/components/modals/StepIndicator.vue'
import {formatPrice} from '@/utils/formatters'

  const props = defineProps({
      products: {
        type: Array,
        default: () => [],
      },
      barcodeTypes:{
        type:Array,
        default: () => [],
      },
      uoms:{
        type:Array,
        default: () => [],
      }
    })

const emit = defineEmits(['generate', 'close', 'refreshBarcodes'])
const toast = useToast()
const currentStep = ref(0)
const searchProduct = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isGenerating = ref(false)

const steps = ['Product', 'Settings', 'Quantity', 'Confirm']
const form = reactive({
  item_code: '',
  type: 'EAN',
  value: '',
  includeSku: false,
  quantity: 1,
  prefix: '',
  suffix: '',
  printImmediately: false,
  activateAutomatically: true,
  downloadAfter: false
})

    const previewBarcode = ref('')
     const products = computed(()=>{
         return props.products
     })
    const selectedProduct = computed(() => {
      return props.products.find(p => p.item_code === form.item_code)
    })
    console.log("products", props.products)
    console.log("selectedProduct", selectedProduct)
    const canProceedToNext = computed(() => {
      if (currentStep.value === 0) {
        return form.item_code !== ''
      }
      if (currentStep.value === 1) {
        return form.type !== ''
      }
      return true
    })




const autoGenerateValue = async() => {
if (!form.type){
  return toast.warning('Please Select Barcode Type first')
}
  try {
    // ① جيب القيمة من الباك اند
    const valueRes = await generateBarcodeValue(form.type)

    if (valueRes.status !== 'success' || !valueRes.value) {
      return toast.error(`Failed to generate value for "${form.type}"`)
    }

    form.value = valueRes.value

    // ② جيب الـ preview من الباك اند
    const preview = await generateBarcodePreview({
      value: form.value,
      type:  form.type
    })

    if (preview){
      previewBarcode.value = preview
    }
  } catch (error) {
    console.error('autoGenerateValue error:', error)
    toast.error('Failed to generate barcode')
  }
}

const nextStep = () => {
    // تحقق Step 0: Product selected
  if (currentStep.value === 0) {
    if (!form.item_code) {
      errorMessage.value = 'Please select a product to continue.'
      return
    }
  }
    // تحقق Step 1: Barcode type selected
  if (currentStep.value === 1) {
    if (!form.type) {
      errorMessage.value = 'Please select a barcode type.'
      return
    }
    if (!form.value) {
      errorMessage.value = 'Please select a barcode Value.'
      return
    }
  }
    // تحقق Step 2: Quantity
  if (currentStep.value === 2) {
    if (!form.quantity || form.quantity < 1 || form.quantity > 1000) {
      errorMessage.value = 'Quantity must be between 1 and 1000.'
      return
    }
  }
  if (currentStep.value < steps.length - 1) {
    errorMessage.value = ''
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    errorMessage.value = ''
    currentStep.value--
  }
}

const generateBarcodes = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isGenerating.value = true

  try {
    // Validation
    if (!form.item_code) {
      throw new Error('Please select a product')
    }
    if (!form.type) {
      throw new Error('Please select barcode type')
    }
    if (form.quantity < 1 || form.quantity > 1000) {
      throw new Error('Quantity must be between 1 and 1000')
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    successMessage.value = `Successfully generated ${form.quantity} barcode(s)!`

    // Emit event
    const barcodeData = {
      ...form,
      item_code: form.item_code,
      productName: selectedProduct.value?.name
    }
    emit('generate', barcodeData)
    emit('refreshBarcodes')
    // Close after success
    setTimeout(() => {
      emit('close')
    }, 1000)
  } catch (error) {
    errorMessage.value = error.message || 'Error generating barcodes'
  } finally {
    isGenerating.value = false
  }
}



</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
