<!-- BarcodeScanner.vue -->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="handleClose">
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

      <!-- ══════════ HEADER ══════════ -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <button @click="captureFrame"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
            Capture
          </button>
          <div class="p-1.5 rounded-lg transition-colors" :class="mode === 'scan' ? 'bg-green-100' : 'bg-blue-100'">
            <svg v-if="mode === 'scan'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 14v1M4 12h1m14 0h1"/>
              <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"/>
            </svg>
            <svg v-else class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">
              {{ mode === 'scan' ? 'Barcode Scanner' : 'Assign Barcode' }}
            </h3>
            <p class="text-xs text-gray-400">
              {{ mode === 'scan' ? 'Scan to get product info' : 'Scan barcode then assign it to a product' }}
            </p>
          </div>
        </div>
        <button @click="handleClose"
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- ══════════ MODE TABS ══════════ -->
      <div class="flex border-b border-gray-100">
        <button @click="setMode('scan')"
          class="flex-1 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
          :class="mode === 'scan'
            ? 'border-green-500 text-green-700 bg-green-50'
            : 'border-transparent text-gray-400 hover:text-gray-600'">
          🔍 Scan
        </button>
        <button @click="setMode('assign')"
          class="flex-1 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
          :class="mode === 'assign'
            ? 'border-blue-500 text-blue-700 bg-blue-50'
            : 'border-transparent text-gray-400 hover:text-gray-600'">
          🔗 Assign
        </button>
      </div>

      <!-- ══════════ SHARED CAMERA (always visible) ══════════ -->
      <div class="px-5 pt-4">
        <div class="relative rounded-xl overflow-hidden bg-gray-900">

          <!-- ZXing video element -->
          <video ref="videoRef" class="w-full block" autoplay muted playsinline
            style="min-height:180px; object-fit:cover; background:#111827;"></video>

          <!-- Hidden canvas for frame capture -->
          <canvas ref="canvasRef" class="hidden"></canvas>

          <!-- Torch button -->
          <button v-if="torchSupported && scannerState === 'active'"
            @click="toggleTorch"
            class="absolute top-2 right-2 p-2 rounded-lg transition z-10"
            :class="torchOn ? 'bg-yellow-400 text-gray-900' : 'bg-black/40 text-white hover:bg-black/60'"
            title="Toggle flashlight">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </button>

          <!-- Corners overlay — color changes by mode -->
          <div v-if="scannerState === 'active'"
            class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-52 h-28">
              <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl"
                :class="mode === 'scan' ? 'border-green-400' : 'border-blue-400'"></div>
              <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr"
                :class="mode === 'scan' ? 'border-green-400' : 'border-blue-400'"></div>
              <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl"
                :class="mode === 'scan' ? 'border-green-400' : 'border-blue-400'"></div>
              <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br"
                :class="mode === 'scan' ? 'border-green-400' : 'border-blue-400'"></div>
              <div class="absolute left-2 right-2 h-0.5 scan-line"
                :class="mode === 'scan'
                  ? 'bg-green-400/80 shadow-[0_0_8px_rgba(74,222,128,0.8)]'
                  : 'bg-blue-400/80 shadow-[0_0_8px_rgba(96,165,250,0.8)]'"></div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="scannerState === 'loading'"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900 min-h-44">
            <svg class="w-8 h-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <span class="text-sm text-gray-300">Starting camera...</span>
          </div>

          <!-- Error -->
          <div v-if="scannerState === 'error'"
            class="flex flex-col items-center justify-center gap-3 text-center px-6 py-8 bg-gray-900 min-h-44">
            <div class="p-3 bg-red-500/20 rounded-full">
              <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-white text-sm">{{ errorMessage }}</p>
            <button @click="startScanner"
              class="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition">
              Try Again
            </button>
          </div>

          <!-- Idle -->
          <div v-if="scannerState === 'idle'"
            class="flex flex-col items-center justify-center gap-3 py-8 bg-gray-900 min-h-44">
            <div class="p-3 bg-gray-700 rounded-full">
              <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <circle cx="12" cy="13" r="3" stroke-width="2"/>
              </svg>
            </div>
            <button @click="startScanner"
              class="px-5 py-2 text-white text-sm font-medium rounded-lg transition"
              :class="mode === 'scan' ? 'bg-green-500 hover:bg-green-400' : 'bg-blue-500 hover:bg-blue-400'">
              Start Camera
            </button>
          </div>

          <!-- Success flash -->
          <div v-if="showSuccessFlash"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
            :class="mode === 'scan' ? 'bg-green-400/20' : 'bg-blue-400/20'">
            <div class="px-4 py-2 rounded-xl font-semibold text-sm shadow-lg text-white"
              :class="mode === 'scan' ? 'bg-green-500' : 'bg-blue-500'">
              ✓ {{ lastScanned }}
            </div>
          </div>
        </div>

        <!-- Debug bar — shows live detection status -->
        <div v-if="scannerState === 'active'"
          class="mt-1.5 px-3 py-1.5 bg-gray-900 rounded-lg flex items-center gap-2 min-h-7">
          <span class="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
            :class="debugText.startsWith('✅') ? 'bg-green-400' : 'bg-gray-500'"></span>
          <span class="text-xs font-mono truncate"
            :class="debugText.startsWith('✅') ? 'text-green-400' : 'text-gray-400'">
            {{ debugText || 'Initializing...' }}
          </span>
        </div>

        <!-- Camera switcher -->
        <div v-if="cameras.length > 1" class="flex items-center gap-2 mt-2.5">
          <label class="text-xs text-gray-500 shrink-0">Camera:</label>
          <select v-model="selectedCameraId" @change="switchCamera"
            class="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300">
            <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
              {{ cam.label || `Camera ${cam.id.slice(0, 8)}...` }}
            </option>
          </select>
        </div>
      </div>

      <!-- ══════════ SCAN MODE BODY ══════════ -->
      <div v-if="mode === 'scan'" class="px-5 pb-5 pt-4 space-y-3">

        <!-- Result card — appears after scan -->
        <transition name="slide-down">
          <div v-if="scanResult" class="rounded-xl border overflow-hidden"
            :class="scanResult.found ? 'border-green-200' : 'border-red-200'">

            <!-- Found -->
            <div v-if="scanResult.found" class="bg-green-50 p-4 space-y-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">Product Found</span>
                <button @click="scanResult = null" class="ml-auto text-green-400 hover:text-green-600 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <img v-if="scanResult.product.image"
                  :src="frappeUrl + scanResult.product.image"
                  class="w-12 h-12 rounded-lg object-cover border border-green-200 shrink-0"
                  @error="e => e.target.style.display='none'" />
                <div class="min-w-0">
                  <p class="font-semibold text-gray-900 text-sm truncate">{{ scanResult.product.item_name }}</p>
                  <p class="text-xs text-gray-500 font-mono">{{ scanResult.product.item_code }}</p>
                  <p class="text-xs text-gray-400">{{ scanResult.product.item_group }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {{ scanResult.barcode.barcode_type || '—' }}
                </span>
                <span v-if="scanResult.barcode.uom" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {{ scanResult.barcode.uom }}
                </span>
                <span class="text-xs font-mono text-gray-400 ml-auto self-center">{{ scanResult.code }}</span>
              </div>
              <button @click="addToCart"
                class="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3"/>
                </svg>
                Add to Cart
              </button>
            </div>

            <!-- Not found -->
            <div v-else class="bg-red-50 p-4 flex items-center gap-3">
              <div class="p-2 bg-red-100 rounded-lg shrink-0">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-red-700">Not found in system</p>
                <p class="text-xs text-red-400 font-mono truncate">{{ scanResult.code }}</p>
              </div>
              <button @click="goToAssignWithCode(scanResult.code)"
                class="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition">
                Assign →
              </button>
            </div>
          </div>
        </transition>

        <!-- Manual input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Manual Input</label>
          <div class="flex gap-2">
            <input ref="manualInputRef" v-model="manualCode" @keydown.enter="submitManual"
              type="text" placeholder="Type or scan barcode..."
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
              :class="{ 'border-red-300 bg-red-50': manualError }" />
            <button @click="submitManual" :disabled="!manualCode.trim()"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition">
              Submit
            </button>
          </div>
          <p v-if="manualError" class="text-xs text-red-500 mt-1">{{ manualError }}</p>
        </div>
      </div>

      <!-- ══════════ ASSIGN MODE BODY ══════════ -->
      <div v-if="mode === 'assign'" class="px-5 pb-5 pt-4 space-y-4">

        <!-- Scanned code display -->
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
          :class="assignedCode
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-dashed border-gray-300'">
          <div class="p-1.5 rounded-lg shrink-0"
            :class="assignedCode ? 'bg-blue-100' : 'bg-gray-200'">
            <svg class="w-4 h-4" :class="assignedCode ? 'text-blue-600' : 'text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 14v1M4 12h1m14 0h1"/>
              <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"/>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium" :class="assignedCode ? 'text-blue-600' : 'text-gray-400'">
              {{ assignedCode ? 'Scanned Barcode' : 'Point camera at barcode to scan...' }}
            </p>
            <p v-if="assignedCode" class="text-sm font-mono font-bold text-blue-800 truncate">{{ assignedCode }}</p>
          </div>
          <button v-if="assignedCode" @click="assignedCode = ''"
            class="p-1 rounded-md hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Product select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Product <span class="text-red-500">*</span>
          </label>
          <div class="relative mb-1.5">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
            </svg>
            <input v-model="productSearch" type="text" placeholder="Search name or SKU..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select v-model="assignForm.item_code" size="4"
            class="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
            :class="assignErrors.item_code ? 'border-red-300 bg-red-50' : 'border-gray-300'">
            <option value="" disabled>— select a product —</option>
            <option v-for="p in filteredProducts" :key="p.item_code" :value="p.item_code">
              {{ p.item_name }} ({{ p.item_code }})
            </option>
          </select>
          <div v-if="selectedProduct"
            class="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span class="text-xs font-semibold text-blue-700 truncate">{{ selectedProduct.item_name }}</span>
            <span class="ml-auto text-xs text-blue-400 font-mono shrink-0">{{ selectedProduct.item_code }}</span>
            <span v-if="selectedProduct.barcodes?.length"
              class="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">
              {{ selectedProduct.barcodes.length }} barcode{{ selectedProduct.barcodes.length > 1 ? 's' : '' }}
            </span>
          </div>
          <p v-if="assignErrors.item_code" class="text-xs text-red-500 mt-1">{{ assignErrors.item_code }}</p>
        </div>

        <!-- Type + UOM -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span class="text-red-500">*</span>
            </label>
            <select v-model="assignForm.barcode_type"
              class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              :class="assignErrors.barcode_type ? 'border-red-300 bg-red-50' : 'border-gray-300'">
              <option value="">Select</option>
              <option v-for="t in barcodeTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <p v-if="assignErrors.barcode_type" class="text-xs text-red-500 mt-1">{{ assignErrors.barcode_type }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">UOM</label>
            <select v-model="assignForm.uom"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">— optional —</option>
              <option v-for="u in uoms" :key="u.name" :value="u.name">{{ u.name }}</option>
            </select>
          </div>
        </div>

        <!-- Assign button -->
        <button @click="handleAssign"
          :disabled="isAssigning || !assignedCode"
          class="w-full flex items-center justify-center gap-2 py-2.5 text-white text-sm font-medium rounded-lg transition"
          :class="assignedCode
            ? 'bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
            : 'bg-gray-300 cursor-not-allowed'">
          <svg v-if="isAssigning" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isAssigning ? 'Assigning...' : !assignedCode ? 'Scan barcode first ↑' : 'Assign Barcode' }}
        </button>
      </div>

      <!-- ══════════ FOOTER ══════════ -->
      <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span class="text-xs flex items-center gap-1.5">
          <template v-if="scannerState === 'active'">
            <span class="w-2 h-2 rounded-full animate-pulse inline-block"
              :class="mode === 'scan' ? 'bg-green-400' : 'bg-blue-400'"></span>
            <span class="text-gray-400">Camera active</span>
          </template>
          <span v-else-if="scannerState === 'error'" class="text-red-400">Camera unavailable</span>
          <span v-else class="text-gray-400">Camera off</span>
        </span>
        <button @click="handleClose"
          class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition">
          Close
        </button>
      </div>

    </div>
  </div>

</template>
  <canvas ref="canvasRef" class="hidden"></canvas>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { decodeBarcodeFromImage, checkBarcodeServerDeps } from '@/services/api'
import config from '@/config/frappe'

// ── Props & Emits ──────────────────────────────────────────
const props = defineProps({
  products:     { type: Array, default: () => [] },
  barcodeTypes: { type: Array, default: () => [] },
  uoms:         { type: Array, default: () => [] },
})
const emit = defineEmits(['addToCart', 'assign', 'close'])

const frappeUrl = config.FRAPPE_URL
const mode = ref('scan')

// ══════════════════════════════════════════
// CAMERA STATE
// ══════════════════════════════════════════
const scannerState   = ref('idle')
const errorMessage   = ref('')
const cameras        = ref([])
const selectedCameraId = ref('')
const lastScanned    = ref('')
const showSuccessFlash = ref(false)
const videoRef       = ref(null)
const canvasRef      = ref(null)
const torchOn        = ref(false)
const torchSupported = ref(false)
const debugText      = ref('')
const scanCount      = ref(0)

let mediaStream     = null
let scanInterval    = null
let barcodeDetector = null
let lastEmittedCode = ''
let lastEmittedTime = 0

// ── Init BarcodeDetector (native browser API) ─────────────
const initBarcodeDetector = async () => {
  if ('BarcodeDetector' in window) {
    try {
      barcodeDetector = new window.BarcodeDetector({
        formats: [
          'ean_13', 'ean_8', 'upc_a', 'upc_e',
          'code_39', 'code_93', 'code_128',
          'itf', 'codabar', 'qr_code',
          'data_matrix', 'pdf417', 'aztec',
        ]
      })
      debugText.value = 'Native BarcodeDetector ready ✓'
      return true
    } catch (e) {
      console.warn('BarcodeDetector init failed:', e)
    }
  }
  return false
}

// ── Load cameras ──────────────────────────────────────────
const loadCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(d => d.kind === 'videoinput')
    cameras.value = videoDevices.map(d => ({
      id: d.deviceId,
      label: d.label || `Camera ${d.deviceId.slice(0, 6)}`
    }))
    if (!selectedCameraId.value && cameras.value.length) {
      const back = cameras.value.find(c => /back|rear|environment/i.test(c.label))
      selectedCameraId.value = back
        ? back.id
        : cameras.value[cameras.value.length - 1].id
    }
  } catch (e) { console.warn('loadCameras:', e) }
}

// ── Start camera stream ───────────────────────────────────
const startStream = async () => {
  if (mediaStream) stopStream()
  const constraints = {
    video: {
      deviceId: selectedCameraId.value
        ? { exact: selectedCameraId.value }
        : undefined,
      facingMode: selectedCameraId.value ? undefined : { ideal: 'environment' },
      width:  { ideal: 1280 },
      height: { ideal: 720 },
    }
  }
  mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

  // check torch
  const track = mediaStream.getVideoTracks()[0]
  const caps = track.getCapabilities?.() || {}
  torchSupported.value = !!caps.torch

  if (videoRef.value) {
    videoRef.value.srcObject = mediaStream
    await videoRef.value.play()
  }
}

const stopStream = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
}

// ── Scan loop — sends frame to Python API ────────────────
const startScanLoop = () => {
  if (scanInterval) clearInterval(scanInterval)
  scanCount.value = 0
  let isProcessing = false

  scanInterval = setInterval(async () => {
    if (isProcessing) return  // don't stack requests
    const video = videoRef.value
    const canvas = canvasRef.value
    if (!video || video.readyState < 2 || !canvas) return

    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return

    // Draw frame to canvas
    canvas.width  = w
    canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)

    scanCount.value++
    debugText.value = `Scanning... (${w}×${h}) #${scanCount.value}`

    // Strategy 1: Native BarcodeDetector (instant, no server)
    if (barcodeDetector) {
      try {
        const results = await barcodeDetector.detect(video)
        if (results.length > 0) {
          const { rawValue, format } = results[0]
          debugText.value = `✅ Native: ${format} → ${rawValue}`
          onCodeDetected(rawValue)
          return
        }
      } catch {}
    }

    // Strategy 2: Send to Python API every 5 frames (rate limit)
    if (scanCount.value % 5 !== 0) return
    isProcessing = true
    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      const res = await decodeBarcodeFromImage(imageData)
      if (res?.success && res.barcode) {
        debugText.value = `✅ Python/${res.method}: ${res.format} → ${res.barcode}`
        onCodeDetected(res.barcode)
      }
    } catch (e) {
      debugText.value = `⚠ API error: ${e?.message || e}`
    } finally {
      isProcessing = false
    }
  }, 200)
}

const stopScanLoop = () => {
  if (scanInterval) { clearInterval(scanInterval); scanInterval = null }
}

// ── Start all ─────────────────────────────────────────────
const startScanner = async () => {
  scannerState.value = 'loading'
  errorMessage.value = ''
  debugText.value    = ''
  try {
    await loadCameras()
    await nextTick()
    await startStream()
    await initBarcodeDetector()

    // Check Python backend
    const deps = await checkBarcodeServerDeps()
    if (!deps.ready) {
      debugText.value = '⚠ Server libs missing — Native only mode'
    } else {
      debugText.value = `Server ready (pyzbar:${deps.pyzbar} cv2:${deps.opencv})`
    }

    startScanLoop()
    scannerState.value = 'active'
  } catch (err) {
    scannerState.value = 'error'
    const msg = err?.message || err?.name || String(err)
    if (/permission|denied/i.test(msg))       errorMessage.value = 'Camera permission denied.'
    else if (/notfound|no device/i.test(msg)) errorMessage.value = 'No camera found.'
    else if (/notreadable|in use/i.test(msg)) errorMessage.value = 'Camera in use by another app.'
    else errorMessage.value = msg || 'Could not start camera.'
    console.warn('Scanner error:', err)
  }
}

const stopScanner = () => {
  stopScanLoop()
  stopStream()
  torchOn.value   = false
  debugText.value = ''
}

// ── Switch camera ─────────────────────────────────────────
const switchCamera = async () => {
  stopScanner()
  await nextTick()
  await startScanner()
}

// ── Torch ─────────────────────────────────────────────────
const toggleTorch = async () => {
  if (!mediaStream) return
  const track = mediaStream.getVideoTracks()[0]
  torchOn.value = !torchOn.value
  try {
    await track.applyConstraints({ advanced: [{ torch: torchOn.value }] })
  } catch (e) { console.warn('torch:', e); torchOn.value = false }
}

// ── Code detected ─────────────────────────────────────────
const onCodeDetected = (code) => {
  if (!code || code.trim().length < 2) return
  const now = Date.now()
  if (code === lastEmittedCode && now - lastEmittedTime < 2000) return
  lastEmittedCode = code
  lastEmittedTime = now

  lastScanned.value      = code
  showSuccessFlash.value = true
  setTimeout(() => { showSuccessFlash.value = false }, 1500)

  if (mode.value === 'scan') {
    processScanResult(code)
  } else {
    assignedCode.value = code
  }
}



// ── التقاط صورة من الفيديو وإرسالها للAPI ──
const captureFrame = async () => {
  if (!videoRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageData = canvas.toDataURL('image/png')

  try {
    const res = await decodeBarcodeFromImage(imageData)
    if (res.success) {
      lastScanned.value = res.barcode
      alert(`✅ Barcode: ${res.barcode} (${res.format})`)
    } else {
      alert(`❌ Failed: ${res.error}`)
    }
  } catch (e) {
    console.error(e)
    alert('❌ Error scanning barcode')
  }
}
// ══════════════════════════════════════════
// SCAN MODE
// ══════════════════════════════════════════
const manualCode     = ref('')
const manualError    = ref('')
const manualInputRef = ref(null)
const scanResult     = ref(null)  // { found, code, product?, barcode? }

const processScanResult = (code) => {
  let foundProduct = null
  let foundBc      = null
  for (const p of props.products) {
    const bc = (p.barcodes || []).find(b => b.barcode === code)
    if (bc) { foundProduct = p; foundBc = bc; break }
  }
  if (foundProduct) {
    scanResult.value = { found: true, code, product: foundProduct, barcode: foundBc }
  } else {
    scanResult.value = { found: false, code }
  }
}

const submitManual = () => {
  const code = manualCode.value.trim()
  manualError.value = ''
  if (!code)           { manualError.value = 'Please enter a barcode'; return }
  if (code.length < 3) { manualError.value = 'Too short (min 3 chars)'; return }
  processScanResult(code)
  manualCode.value = ''
}

const addToCart = () => {
  if (!scanResult.value?.found) return
  emit('addToCart', scanResult.value.product, scanResult.value.barcode)
  scanResult.value = null
}

// ══════════════════════════════════════════
// ASSIGN MODE
// ══════════════════════════════════════════
const assignedCode   = ref('')
const productSearch  = ref('')
const isAssigning    = ref(false)
const assignForm     = ref({ item_code: '', barcode_type: '', uom: '' })
const assignErrors   = ref({ item_code: '', barcode_type: '' })

const filteredProducts = computed(() => {
  const q = productSearch.value.toLowerCase().trim()
  if (!q) return props.products
  return props.products.filter(p =>
    p.item_name?.toLowerCase().includes(q) || p.item_code?.toLowerCase().includes(q)
  )
})

const selectedProduct = computed(() =>
  props.products.find(p => p.item_code === assignForm.value.item_code) || null
)

const validateAssign = () => {
  assignErrors.value = { item_code: '', barcode_type: '' }
  let ok = true
  if (!assignForm.value.item_code)    { assignErrors.value.item_code    = 'Select a product'; ok = false }
  if (!assignForm.value.barcode_type) { assignErrors.value.barcode_type = 'Select a type';    ok = false }
  return ok
}

const handleAssign = async () => {
  if (!validateAssign() || !assignedCode.value) return
  isAssigning.value = true
  try {
    emit('assign', {
      item_code:    assignForm.value.item_code,
      barcode_type: assignForm.value.barcode_type,
      uom:          assignForm.value.uom,
      barcode:      assignedCode.value,
    })
  } finally {
    isAssigning.value = false
  }
}

// ── Switch to assign mode with prefilled code (from "Not found" result) ──
const goToAssignWithCode = (code) => {
  assignedCode.value  = code
  assignForm.value    = { item_code: '', barcode_type: '', uom: '' }
  assignErrors.value  = { item_code: '', barcode_type: '' }
  productSearch.value = ''
  scanResult.value    = null
  mode.value          = 'assign'
}

// ── Switch mode tab ────────────────────────────────────────
const setMode = (newMode) => {
  mode.value = newMode
  scanResult.value = null
  if (newMode === 'assign') {
    // keep camera running, reset form
    assignedCode.value  = ''
    assignForm.value    = { item_code: '', barcode_type: '', uom: '' }
    assignErrors.value  = { item_code: '', barcode_type: '' }
    productSearch.value = ''
  }
}

// ── Close ──────────────────────────────────────────────────
const handleClose = () => {
  stopScanner()
  emit('close')
}

// ── Lifecycle ──────────────────────────────────────────────
onMounted(async () => {
  await startScanner()
  nextTick(() => manualInputRef.value?.focus())
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.scan-line {
  animation: scanMove 2s ease-in-out infinite;
  top: 0;
}
@keyframes scanMove {
  0%   { top: 0%; }
  50%  { top: calc(100% - 2px); }
  100% { top: 0%; }
}

.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
