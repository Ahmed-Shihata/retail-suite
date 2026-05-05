<!-- BarcodesUnified.vue -->
<template>
  <MainLayout>
    <div class="w-full flex min-h-screen" :style="{ background: 'var(--item-bg)' }">
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- ══════════════════ HEADER ══════════════════ -->
        <header
           class="mx-3 mt-3 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)'
          }"
        >
          <div class="px-6 py-4 flex justify-between items-center">

            <div class="flex items-center gap-3">
              <button
                @click="goBack"
                class="p-2 rounded-lg transition"
                :style="{ color: 'var(--text-muted)' }"
                @mouseover="$event.currentTarget.style.background = 'var(--nav-item-hover-bg)'"
                @mouseleave="$event.currentTarget.style.background = 'transparent'"
              >
                <ArrowLeft class="w-6 h-6" />
              </button>
              <div>
                <h6 class="text-sm font-bold" :style="{ color: 'var(--text-main)' }">
                  Items & Barcodes Management
                </h6>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  {{ allProducts.length }} registered products
                </p>
              </div>
            </div>

            <div class="flex gap-3 flex-wrap">
              <button @click="showBarcodeScanner = true"
                class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium text-sm">
                <ScanLine class="w-4 h-4" />
                Scan Barcode
              </button>
              <button @click="openGenerateModal"
                class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-sm">
                <BarChart2 class="w-4 h-4" />
                Generate Barcode
              </button>
              <button @click="openAddItemModal"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm">
                <Plus class="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </header>

        <!-- ══════════════════ TABS ══════════════════ -->
        <section
          class="mx-6 mt-4 rounded-xl shadow-lg border px-6 pt-4 backdrop-blur"
          :style="{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }"
        >
          <div class="flex gap-2 border-b border-white/10">

            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'relative px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-300 -mb-px border-b-2',

                activeTab === tab.key
                  ? 'text-cyan-400 border-cyan-400 bg-white/5 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              ]"
            >
              {{ tab.label }}

              <!-- underline glow animation -->
              <span
                v-if="activeTab === tab.key"
                class="absolute left-0 bottom-0 w-full h-[2px] bg-cyan-400 blur-sm"
              ></span>
            </button>

          </div>
        </section>
        <!-- ══════════════════ TAB CONTENT ══════════════════ -->
        <section class="px-6 pb-6 mt-4">

          <!-- ─────────── LIST TAB ─────────── -->
          <div v-if="activeTab === 'list'" class="space-y-5">

            <!-- Filter Fields -->
            <div class="rounded-xl shadow-sm border p-5"
              :style="{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }">

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                <!-- Field -->
                <div class="flex flex-col">
                  <label
                    class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    :style="{ color: 'var(--text-muted)' }"
                  >
                    Search
                  </label>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="SKU / barcode / Item Name"
                    class="w-full h-[38px] px-3 rounded-lg focus:outline-none transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }"
                  />
                </div>

                <!-- Product -->
                <div class="flex flex-col">
                  <label class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    :style="{ color: 'var(--text-muted)' }">
                    Product
                  </label>
                  <select
                    v-model="filterProduct"
                    class="w-full h-[38px] px-3 rounded-lg focus:outline-none transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }">
                    <option value="">All Products</option>
                    <option v-for="p in allProducts" :key="p.item_code" :value="p.item_code">
                      {{ p.item_name }}
                    </option>
                  </select>
                </div>

                <!-- Status -->
                <div class="flex flex-col">
                  <label class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    :style="{ color: 'var(--text-muted)' }">
                    Status
                  </label>
                  <select
                    v-model="filterStatus"
                    class="w-full h-[38px] px-3 rounded-lg focus:outline-none transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <!-- Barcode Type -->
                <div class="flex flex-col">
                  <label class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    :style="{ color: 'var(--text-muted)' }">
                    Barcode Type
                  </label>
                  <select
                    v-model="filterType"
                    class="w-full h-[38px] px-3 rounded-lg focus:outline-none transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }">
                    <option value="">All Types</option>
                    <option v-for="t in barcodeTypes" :key="t" :value="t">
                      {{ t }}
                    </option>
                  </select>
                </div>

                <!-- Item Group -->
                <div class="flex flex-col">
                  <label class="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                    :style="{ color: 'var(--text-muted)' }">
                    Item Group
                  </label>
                  <select
                    v-model="filterGroup"
                    class="w-full h-[38px] px-3 rounded-lg focus:outline-none transition-all"
                    :style="{
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--input-border)'
                    }">
                    <option value="">All Groups</option>
                    <option v-for="g in itemGroups" :key="g.name" :value="g.name">
                      {{ g.name }}
                    </option>
                  </select>
                </div>

                <!-- Clear Filters -->
                <div class="flex justify-end mt-4">
                  <button
                    v-if="searchQuery || filterProduct || filterStatus || filterType || filterGroup"
                    @click="clearFilters"
                    class="flex items-center gap-2 px-4 h-[38px] rounded-lg text-sm font-medium
                          border transition-all duration-200
                          hover:bg-red-500/10 hover:text-red-400 hover:border-red-400
                          text-gray-400 border-white/10"
                  >
                    <XCircle class="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Total Products</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ allProducts.length }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">With Barcodes</p>
                <p class="text-2xl font-bold text-yellow-500 mt-1">{{ productsWithBarcodes }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Total Barcodes</p>
                <p class="text-2xl font-bold text-green-600 mt-1">{{ flatRows.length }}</p>
              </div>
              <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide">No Barcode</p>
                <p class="text-2xl font-bold text-red-500 mt-1">{{ allProducts.length - productsWithBarcodes }}</p>
              </div>
            </div>

            <!-- Table -->
            <div v-if="isLoading" class="p-12 text-center bg-white rounded-xl border border-gray-200">
              <LoadingSpinner />
            </div>

            <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barcode</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">UOM</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Preview</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <template v-if="filteredRows.length === 0">
                      <tr>
                        <td colspan="8" class="py-14 text-center text-gray-400">
                          <div class="flex flex-col items-center gap-2">
                            <PackageSearch class="w-12 h-12 text-gray-300" />
                            <p class="text-base">No items found</p>
                          </div>
                        </td>
                      </tr>
                    </template>

                    <template v-for="row in filteredRows" :key="row.rowKey">
                      <tr class="hover:bg-gray-50 transition-colors"
                          :class="row.isFirstBarcode ? '' : 'border-t-0'">

                        <!-- Product info — only on first barcode row (rowspan simulation via v-if) -->
                        <td class="px-5 py-3">
                          <template v-if="row.isFirstRow">
                            <div class="flex items-center gap-3">
                              <img
                                :src="row.productImage ? config.FRAPPE_URL + row.productImage : defaultImageSrc"
                                class="h-10 w-10 rounded-lg object-cover border border-gray-100"
                                @error="handleImageError"
                                :alt="row.productName"
                              />
                              <div>
                                <p class="font-semibold text-gray-900 leading-tight">{{ row.productName }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ row.item_group || '—' }}</p>
                                <!-- Barcode count badge -->
                                <span v-if="row.totalBarcodes > 0"
                                  class="inline-block mt-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">
                                  {{ row.totalBarcodes }} barcode{{ row.totalBarcodes > 1 ? 's' : '' }}
                                </span>
                                <span v-else
                                  class="inline-block mt-1 text-xs bg-orange-50 text-orange-500 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">
                                  No barcodes
                                </span>
                              </div>
                            </div>
                          </template>
                          <template v-else>
                            <!-- continuation row — subtle indent line -->
                            <div class="ml-13 flex items-center gap-1 pl-12">
                              <div class="w-px h-6 bg-blue-200 mr-2"></div>
                              <span class="text-xs text-gray-300">↳</span>
                            </div>
                          </template>
                        </td>

                        <!-- SKU -->
                        <td class="px-5 py-3">
                          <template v-if="row.isFirstRow">
                            <span class="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{{ row.sku }}</span>
                          </template>
                        </td>

                        <!-- Barcode value -->
                        <td class="px-5 py-3 font-mono text-xs text-gray-800">
                          <span v-if="row.hasBarcode">{{ row.barcode.code }}</span>
                          <span v-else class="text-gray-300 italic">—</span>
                        </td>

                        <!-- Type -->
                        <td class="px-5 py-3">
                          <span v-if="row.hasBarcode && row.barcode.type"
                            class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                            {{ row.barcode.type }}
                          </span>
                          <span v-else class="text-gray-300">—</span>
                        </td>

                        <!-- UOM -->
                        <td class="px-5 py-3 text-xs text-gray-500">
                          {{ row.hasBarcode ? (row.barcode.uom || '—') : '—' }}
                        </td>

                        <!-- Preview -->
                        <td class="px-5 py-3">
                          <div v-if="row.hasBarcode && row.barcode.preview"
                            class="flex items-center justify-center bg-white border border-gray-100 rounded p-1.5 w-28">
                            <img :src="row.barcode.preview" class="max-w-full max-h-12 object-contain" :alt="row.barcode.code" />
                          </div>
                          <span v-else class="text-gray-300 text-xs">—</span>
                        </td>

                        <!-- Status -->
                        <td class="px-5 py-3">
                          <template v-if="row.isFirstRow">
                            <span :class="getStatusBadge(row.status)"
                              class="px-2.5 py-1 rounded-full text-xs font-semibold">
                              {{ capitalizeFirst(row.status || 'unknown') }}
                            </span>
                          </template>
                        </td>

                        <!-- Actions -->
                        <td class="px-5 py-3">
                          <div class="flex items-center gap-1.5">
                            <!-- Item-level actions (first row only) -->
                            <template v-if="row.isFirstRow">
                              <button @click="openEditItemModal(row)" title="Edit Item"
                                class="p-1.5 rounded-md hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition">
                                <Edit2 class="w-4 h-4" />
                              </button>
                              <button @click="deleteItem(row)" title="Delete Item"
                                class="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition">
                                <Trash2 class="w-4 h-4" />
                              </button>
                              <button @click="openAddBarcodeForItem(row)" title="Add Barcode"
                                class="p-1.5 rounded-md hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition">
                                <Plus class="w-4 h-4" />
                              </button>
                            </template>

                            <!-- Barcode-level actions -->
                            <template v-if="row.hasBarcode">
                              <button @click="viewBarcode(row.barcode)" title="View Barcode"
                                class="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition">
                                <Eye class="w-4 h-4" />
                              </button>
                              <button @click="downloadBarcode(row.barcode)" title="Download"
                                class="p-1.5 rounded-md hover:bg-green-50 text-green-500 hover:text-green-700 transition">
                                <Download class="w-4 h-4" />
                              </button>
                              <button @click="editBarcodeRow(row.barcode)" title="Edit Barcode"
                                class="p-1.5 rounded-md hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition">
                                <Settings2 class="w-4 h-4" />
                              </button>
                              <button @click="deleteBarcodeRow(row.barcode)" title="Delete Barcode"
                                class="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition">
                                <X class="w-4 h-4" />
                              </button>
                            </template>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ─────────── GENERATE TAB ─────────── -->
          <div v-if="activeTab === 'generate'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Generate Barcode</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Product *</label>
                  <select v-model="generateForm.item_code"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Product</option>
                    <option v-for="p in allProducts" :key="p.item_code" :value="p.item_code">{{ p.item_name }} ({{ p.item_code }})</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Barcode Type *</label>
                  <select v-model="generateForm.type"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Type</option>
                    <option v-for="t in barcodeTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Barcode Value</label>
                  <div class="flex gap-2">
                    <input v-model="generateForm.value" type="text" placeholder="Auto-generate if empty"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <button @click="autoGenerateValue" title="Auto-generate value"
                      class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                      <RefreshCcw class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Unit of Measure</label>
                  <select v-model="generateForm.posa_uom"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select UOM</option>
                    <option v-for="u in uoms" :key="u.name" :value="u.name">{{ u.name }}</option>
                  </select>
                </div>
                <button @click="runGenerateBarcode"
                  class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                  Generate & Save
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Preview</label>
                <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl min-h-56 flex items-center justify-center">
                  <div v-if="generatedPreview" class="text-center p-4">
                    <img :src="generatedPreview" class="max-w-full mb-3" />
                    <p class="text-sm text-gray-500 font-mono">{{ generateForm.value }}</p>
                  </div>
                  <p v-else class="text-gray-400 text-sm">Select product & type to preview</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ─────────── PRINT TAB ─────────── -->
          <div v-if="activeTab === 'print'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Print Barcode Labels</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-3">
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input v-model="printSearch" type="text" placeholder="Search SKU or barcode..."
                      class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <select v-model="printFilterType"
                    class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Types</option>
                    <option v-for="t in barcodeTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-400">{{ filteredPrintBarcodes.length }} barcode(s)</span>
                  <div class="flex gap-3">
                    <button @click="selectAllPrint" class="text-xs text-blue-600 hover:underline font-medium">Select All</button>
                    <span class="text-gray-300">|</span>
                    <button @click="printForm.selectedBarcodes = []" class="text-xs text-red-500 hover:underline">Clear</button>
                  </div>
                </div>
                <div class="border border-gray-200 rounded-lg overflow-y-auto max-h-72 divide-y divide-gray-100">
                  <div v-if="filteredPrintBarcodes.length === 0" class="py-8 text-center text-sm text-gray-400">
                    No barcodes match your search
                  </div>
                  <label v-for="bc in filteredPrintBarcodes" :key="bc.rowKey"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
                    :class="{ 'bg-blue-50': printForm.selectedBarcodes.includes(bc.rowKey) }">
                    <input type="checkbox" :value="bc.rowKey" v-model="printForm.selectedBarcodes"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-900 truncate">{{ bc.sku }}</span>
                        <span v-if="bc.barcode.type" class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{{ bc.barcode.type }}</span>
                      </div>
                      <span class="text-xs text-gray-400 font-mono">{{ bc.barcode.code }}</span>
                    </div>
                    <img v-if="bc.barcode.preview" :src="bc.barcode.preview" class="w-16 h-8 object-contain" />
                  </label>
                </div>
                <span class="text-xs text-gray-500">{{ printForm.selectedBarcodes.length }} selected
                  <template v-if="printForm.selectedBarcodes.length">
                    × {{ printForm.copies }} = <strong>{{ printForm.selectedBarcodes.length * printForm.copies }} labels</strong>
                  </template>
                </span>
              </div>

              <div class="flex flex-col gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Label Size</label>
                  <select v-model="printForm.labelSize" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="4x6">4×6 in (Standard)</option>
                    <option value="3x5">3×5 in (Small)</option>
                    <option value="2x2">2×2 in (Mini)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Copies per Label</label>
                  <input :value="printForm.copies"
                    @input="printForm.copies = Math.max(1, Math.min(20, parseInt($event.target.value) || 1))"
                    type="number" min="1" max="20"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="printForm.includePrice" type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-600">Show price on label</span>
                </label>
                <div v-if="printForm.selectedBarcodes.length" class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <div class="font-semibold mb-1">Print Summary</div>
                  <div class="text-xs space-y-0.5 text-green-700">
                    <div>Selected: <strong>{{ printForm.selectedBarcodes.length }}</strong></div>
                    <div>Copies: <strong>{{ printForm.copies }}</strong></div>
                    <div>Size: <strong>{{ printForm.labelSize }}</strong></div>
                    <div class="pt-1 border-t border-green-200 font-bold">Total: {{ printForm.selectedBarcodes.length * printForm.copies }} labels</div>
                  </div>
                </div>
                <button @click="printLabels" :disabled="!printForm.selectedBarcodes.length"
                  class="mt-auto w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition">
                  <Printer class="w-4 h-4" />
                  Print Labels
                  <span v-if="printForm.selectedBarcodes.length" class="text-green-200 text-xs">({{ printForm.selectedBarcodes.length * printForm.copies }})</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ─────────── SETTINGS TAB ─────────── -->
          <div v-if="activeTab === 'settings'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Barcode Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Default Barcode Type</label>
                <select v-model="settings.defaultType" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select</option>
                  <option v-for="t in barcodeTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">SKU Prefix</label>
                <input v-model="settings.skuPrefix" type="text" placeholder="e.g., PRD"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="settings.autoGenerateSku" type="checkbox" class="rounded" />
                <span class="text-sm text-gray-600">Auto-generate SKU for new products</span>
              </label>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Default Label Size</label>
                <select v-model="settings.defaultLabelSize" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="4x6">4×6</option>
                  <option value="3x5">3×5</option>
                  <option value="2x2">2×2</option>
                </select>
              </div>
            </div>
            <button @click="saveSettings" class="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              Save Settings
            </button>
          </div>

        </section>

        <!-- ══════════════════ MODALS ══════════════════ -->

        <!-- Barcode Scanner -->
            <BarcodeScanner
            v-if="showBarcodeScanner"
            :products="allProducts"
            :barcodeTypes="barcodeTypes"
            :uoms="uoms"
            @scan="handleBarcodeScan"
            @assign="handleAssignBarcode"
            @close="showBarcodeScanner = false"
            />

        <!-- Generate Barcode Modal (header button) -->
        <GenerateBarcodeModal
          v-if="showGenerateModal"
          :products="allProducts"
          :barcodeTypes="barcodeTypes"
          :uoms="uoms"
          @generate="handleGenerateBarcode"
          @close="showGenerateModal = false"
          @refreshBarcodes="loadData"
        />

        <!-- View Barcode -->
        <ViewBarcodeModal
          v-if="showViewModal"
          :barcode="selectedBarcode"
          @close="showViewModal = false"
        />

        <!-- Edit Barcode -->
        <EditBarcodeModal
          v-if="showEditModal && barcodeToEdit"
          :barcode="barcodeToEdit"
          :barcodeTypes="barcodeTypes"
          :uoms="uoms"
          :is-submitting="editIsSubmitting"
          :is-generating="editIsGenerating"
          :external-error="editExternalError"
          :generated-value="editGeneratedValue"
          :generated-preview="editGeneratedPreview"
          @update="handleUpdateBarcode"
          @autoGenerate="handleEditAutoGenerate"
          @close="closeEditModal"
        />

        <!-- Add / Edit Item -->
        <ItemModal
          v-if="showItemModal"
          :show="showItemModal"
          :item="editingItem"
          :uoms="uoms"
          :series="series"
          :categories="categories"
          :is-editing="!!editingItem"
          @save="saveItem"
          @close="closeItemModal"
        />

        <!-- Add Barcode for specific item (quick modal) -->
        <GenerateBarcodeModal
          v-if="showAddBarcodeModal && addBarcodeForItem"
          :products="allProducts"
          :barcodeTypes="barcodeTypes"
          :uoms="uoms"
          :preselectedItem="addBarcodeForItem.item_code"
          @generate="handleGenerateBarcode"
          @close="showAddBarcodeModal = false"
          @refreshBarcodes="loadData"
        />

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, toRaw } from 'vue'
import {
  Download, Eye, Edit2, Trash2, RefreshCcw, Plus,
  Search, Printer, Settings2, X, ScanLine, BarChart2, PackageSearch, ArrowLeft, XCircle
} from 'lucide-vue-next'
import MainLayout         from '@/layout/MainLayout.vue'
import BarcodeScanner     from '@/components/modals/BarcodeScanner.vue'
import GenerateBarcodeModal from '@/components/modals/GenerateBarcodeModal.vue'
import ViewBarcodeModal   from '@/components/modals/ViewBarcodeModal.vue'
import EditBarcodeModal   from '@/components/modals/EditBarcodeModal.vue'
import ItemModal          from '@/components/modals/ItemModal.vue'
import LoadingSpinner     from '@/components/icons/LoadingSpinner.vue'
import { useShiftStore }     from '@/stores/shift'
import { useCartStore }      from '@/stores/cart'
import { useInventoryStore } from '@/stores/inventory'
import { useToast } from 'vue-toastification'
import config from '@/config/frappe'
import {
  generateBarcodePreview,
  generateBarcodeValue,
  addItemBarcode,
  updateItemBarcode,
  getBarcodesFromFrappeDB,
  getItemsFromFrappeDB,
  getItemGroup,
  getBarcodeTypes,
  handleDeleteBarcodeFrappe
} from '@/services/api'

// ────────────────────────────────────────────
// STORES & HELPERS
// ────────────────────────────────────────────
const toast          = useToast()
const shiftStore     = useShiftStore()
const inventoryStore = useInventoryStore()
const cartStore      = useCartStore()

const defaultImageSrc = ref(`${config.VUE_URL}/src/assets/img/default-product.jpg`)
const handleImageError = (e) => { e.target.src = 'https://via.placeholder.com/40?text=?' }

// ────────────────────────────────────────────
// TABS
// ────────────────────────────────────────────
const tabs = [
  { key: 'list',     label: 'Items & Barcodes' },
  { key: 'generate', label: 'Generate Barcodes' },
  { key: 'print',    label: 'Print Labels' },
  { key: 'settings', label: 'Settings' },
]
const activeTab = ref('list')

// ────────────────────────────────────────────
// GLOBAL DATA
// ────────────────────────────────────────────
const isLoading    = ref(false)
const allProducts  = ref([])   // [ { item_code, item_name, item_group, image, status, disabled, barcodes: [] } ]
const barcodeTypes = ref([])
const itemGroups   = ref([])
const uoms         = ref([])
const series       = ref([])
const categories   = ref([])

// ────────────────────────────────────────────
// FILTERS (list tab)
// ────────────────────────────────────────────
const searchQuery   = ref('')
const filterProduct = ref('')
const filterStatus  = ref('')
const filterType    = ref('')
const filterGroup   = ref('')

// ────────────────────────────────────────────
// FLAT ROWS — one row per barcode, or one row per product if no barcodes
// ────────────────────────────────────────────
const flatRows = computed(() => {
  const rows = []
  allProducts.value.forEach(product => {
    const barcodes = product.barcodes || []
    if (barcodes.length === 0) {
      // Product with no barcode → single row
      rows.push({
        rowKey:        `${product.item_code}__none`,
        isFirstRow:    true,
        isLastRow:     true,
        sku:           product.item_code,
        productName:   product.item_name,
        productImage:  product.image        || '',
        item_group:    product.item_group   || '',
        status:        product?.disabled === 1 ? 'inactive' : 'active',
        totalBarcodes: 0,
        hasBarcode:    false,
        barcode:       null,
        // for item modal
        item_code:     product.item_code,
        item_name:     product.item_name,
        disabled:      product.disabled,
        _raw:          product,
      })
    } else {
      barcodes.forEach((bc, idx) => {
        rows.push({
          rowKey:        `${product.item_code}__${bc.barcode || idx}`,
          isFirstRow:    idx === 0,
          isLastRow:     idx === barcodes.length - 1,
          sku:           product.item_code,
          productName:   product.item_name,
          productImage:  product.image       || '',
          item_group:    product.item_group  || '',
          status:        product?.disabled === 1 ? 'inactive' : 'active',
          totalBarcodes: barcodes.length,
          hasBarcode:    true,
          barcode: {
            id:       `${product.item_code}_${bc.barcode || idx}`,
            code:     bc.barcode      || '',
            type:     bc.barcode_type || '',
            uom:      bc.uom          || '',
            preview:  bc.preview      || '',
            sku:      product.item_code,
            productName:  product.item_name,
            productImage: product.image || '',
          },
          // for item modal
          item_code:  product.item_code,
          item_name:  product.item_name,
          disabled:   product.disabled,
          _raw:       product,
        })
      })
    }
  })
  return rows
})

// ── FILTERED rows ──
const filteredRows = computed(() => {
  const q      = searchQuery.value.toLowerCase().trim()
  const fProd  = filterProduct.value
  const fStat  = filterStatus.value
  const fType  = filterType.value
  const fGroup = filterGroup.value

  // We need to filter at PRODUCT level (show all barcodes of matching product, or hide all)
  // Collect matching product item_codes first
  const matchingProducts = new Set(
    allProducts.value
      .filter(p => {
        const matchSearch  = !q      || p.item_code?.toLowerCase().includes(q) || p.item_name?.toLowerCase().includes(q)
        const matchProduct = !fProd  || p.item_code === fProd
        const matchStatus  = !fStat  || (fStat === 'active' ? p.disabled !== 1 : p.disabled === 1)
        const matchGroup   = !fGroup || p.item_group === fGroup
        return matchSearch && matchProduct && matchStatus && matchGroup
      })
      .map(p => p.item_code)
  )

  return flatRows.value.filter(row => {
    if (!matchingProducts.has(row.sku)) return false
    // additional barcode-level filter
    if (fType && row.hasBarcode && row.barcode.type !== fType) return false
    if (fType && !row.hasBarcode) return false  // hide no-barcode rows when filtering by type
    // barcode search (code value)
    if (q && row.hasBarcode && !row.barcode.code.toLowerCase().includes(q)) {
      // still show if product name/code matched (handled above), keep row
    }
    return true
  })
})

// ── STATS ──
const productsWithBarcodes = computed(() =>
  allProducts.value.filter(p => p.barcodes && p.barcodes.length > 0).length
)

// ────────────────────────────────────────────
// DATA LOADING
// ────────────────────────────────────────────
const loadData = async () => {
  try {
    isLoading.value = true

    // Load barcodes/products from Frappe
    const bRes = await getBarcodesFromFrappeDB()
    if (!bRes || bRes.status !== 'success') {
      toast.error('Failed to load barcode data')
      return
    }

    // Merge: barcodeDB gives products with their barcodes
    const bcProducts = bRes.data || []

    // Load ALL items from inventory store
    await inventoryStore.loadItems()
    const storeItems = inventoryStore.items || []

    // Build a map from barcode data keyed by item_code
    const bcMap = {}
    bcProducts.forEach(p => { bcMap[p.sku] = p })

    // Merge: every store item + barcodes from bcMap if exists
    allProducts.value = storeItems.map(item => {
      const bcData = bcMap[item.item_code] || {}
      return {
        item_code:   item.item_code,
        item_name:   item.item_name,
        item_group:  item.item_group  || bcData.item_group || '',
        image:       item.image       || bcData.productImage || '',
        disabled:    item.disabled    ?? 0,
        barcodes:    (bcData.barcodes || []).map(bc => ({
          ...bc,
          preview: bc.preview || '',
        })),
      }
    })

  } catch (err) {
    console.error('loadData error:', err)
    toast.error('Error loading data')
  } finally {
    isLoading.value = false
  }
}

// ────────────────────────────────────────────
// ITEM MODAL
// ────────────────────────────────────────────
const showItemModal = ref(false)
const editingItem   = ref(null)

const openAddItemModal = () => { editingItem.value = null; showItemModal.value = true }
const openEditItemModal = (row) => {
  editingItem.value = JSON.parse(JSON.stringify(row._raw))
  showItemModal.value = true
}
const closeItemModal = () => { showItemModal.value = false; editingItem.value = null }

const saveItem = async (itemData) => {
  try {
    if (editingItem.value) {
      const id = editingItem.value.name || editingItem.value.item_code
      await inventoryStore.updateItem(id, itemData)
      toast.success('Item updated')
    } else {
      const res = await inventoryStore.addItem(itemData)
      if (res?.status === 'error') return toast.warning(res.message || 'Failed')
      toast.success(res?.message || 'Item added')
    }
    closeItemModal()
    await loadData()
  } catch (e) {
    console.error(e)
    toast.error('Error saving item')
  }
}

const deleteItem = async (row) => {
  if (!confirm(`Delete item "${row.productName}"?\nThis will also remove all its barcodes.`)) return
  try {
    const res = await inventoryStore.deleteItem(row.item_code)
    if (res?.status === '200' || res?.data?.status === '200 ') {
      toast.success(`"${row.productName}" deleted`)
      await loadData()
    } else {
      toast.warning(res?.data?.message?.message || 'Failed to delete')
    }
  } catch (e) {
    console.error(e)
    toast.error('Error deleting item')
  }
}

// ────────────────────────────────────────────
// ADD BARCODE FOR ITEM (quick shortcut)
// ────────────────────────────────────────────
const showAddBarcodeModal = ref(false)
const addBarcodeForItem   = ref(null)

const openAddBarcodeForItem = (row) => {
  addBarcodeForItem.value = { item_code: row.item_code, item_name: row.productName }
  showAddBarcodeModal.value = true
}

// ────────────────────────────────────────────
// BARCODE EDIT MODAL
// ────────────────────────────────────────────
const showEditModal       = ref(false)
const barcodeToEdit       = ref(null)
const editIsSubmitting    = ref(false)
const editIsGenerating    = ref(false)
const editExternalError   = ref('')
const editGeneratedValue  = ref('')
const editGeneratedPreview = ref('')

const showViewModal    = ref(false)
const selectedBarcode  = ref(null)

const viewBarcode = (bc) => { selectedBarcode.value = bc; showViewModal.value = true }

const downloadBarcode = (bc) => {
  if (!bc.preview) return toast.warning('No preview available')
  const a = document.createElement('a')
  a.href = bc.preview; a.download = `${bc.code}.png`; a.click()
}

const editBarcodeRow = (bc) => {
  barcodeToEdit.value       = bc
  editExternalError.value   = ''
  editGeneratedValue.value  = ''
  editGeneratedPreview.value = ''
  showEditModal.value        = true
}

const closeEditModal = () => {
  if (editIsSubmitting.value || editIsGenerating.value) return
  showEditModal.value        = false
  barcodeToEdit.value        = null
  editExternalError.value    = ''
  editGeneratedValue.value   = ''
  editGeneratedPreview.value = ''
}

const handleEditAutoGenerate = async ({ type }) => {
  if (!type) return toast.warning('Select a barcode type first')
  editIsGenerating.value   = true
  editGeneratedValue.value = ''
  editGeneratedPreview.value = ''
  try {
    const vRes = await generateBarcodeValue(type)
    if (vRes.status !== 'success' || !vRes.value) return toast.error(`Failed to generate value for "${type}"`)
    editGeneratedValue.value = vRes.value
    const preview = await generateBarcodePreview({ value: vRes.value, type })
    if (preview) editGeneratedPreview.value = preview
  } catch (e) {
    console.error(e)
    toast.error('Failed to auto-generate barcode')
  } finally {
    editIsGenerating.value = false
  }
}

const handleUpdateBarcode = async ({ id, sku, old_barcode, barcode, barcode_type, uom }) => {
  editIsSubmitting.value  = true
  editExternalError.value = ''
  const res = await updateItemBarcode(sku, old_barcode, { barcode, barcode_type, uom })
  editIsSubmitting.value = false
  if (res.status === 'success') {
    toast.success('Barcode updated')
    showEditModal.value        = false
    barcodeToEdit.value        = null
    editGeneratedValue.value   = ''
    editGeneratedPreview.value = ''
    await loadData()
  } else {
    editExternalError.value = res.message || 'Failed to update barcode'
  }
}

const deleteBarcodeRow = async (bc) => {
  if (!confirm(`Delete barcode "${bc.code}"?`)) return
  try {
    await handleDeleteBarcodeFrappe(bc.sku, bc.code)
    toast.success('Barcode deleted')
    await loadData()
  } catch (e) {
    console.error(e)
    toast.error('Failed to delete barcode')
  }
}

// ────────────────────────────────────────────
// GENERATE TAB
// ────────────────────────────────────────────
const showGenerateModal = ref(false)
const openGenerateModal = () => { showGenerateModal.value = true }

const generateForm  = reactive({ item_code: '', type: '', value: '', posa_uom: '' })
const generatedPreview = ref('')

const autoGenerateValue = async () => {
  if (!generateForm.type) return toast.warning('Select barcode type first')
  try {
    const vRes = await generateBarcodeValue(generateForm.type)
    if (vRes.status !== 'success' || !vRes.value) return toast.error(`Failed to generate value`)
    generateForm.value = vRes.value
    const preview = await generateBarcodePreview({ value: generateForm.value, type: generateForm.type })
    if (preview) generatedPreview.value = preview
  } catch (e) { toast.error('Failed') }
}

const runGenerateBarcode = async () => {
  if (!generateForm.item_code) return toast.warning('Select a product')
  if (!generateForm.type)      return toast.warning('Select barcode type')
  if (!generateForm.value)     return toast.warning('Enter or auto-generate a value')
  try {
    const res = await addItemBarcode(generateForm)
    if (res.status === 'success') {
      generatedPreview.value = res.data?.image || ''
      toast.success(res.message)
      await loadData()
    } else {
      toast.warning(res.message)
    }
  } catch (e) { toast.error('Error generating barcode') }
}

const handleGenerateBarcode = async (data) => {
  try {
    const res = await addItemBarcode(data)
    if (res.status === 'success') { toast.success(res.message); await loadData() }
    else toast.warning(res.message)
  } catch (e) { toast.error('Error generating barcode') }
}

// ────────────────────────────────────────────
// SCANNER
// ────────────────────────────────────────────
const showBarcodeScanner = ref(false)
const isProcessing       = ref(false)
const lastScannedTime    = ref(null)

// ── لما يتسكن باركود ──
const handleBarcodeScan = async (code, { onNotFound } = {}) => {
  if (isProcessing.value) return
  isProcessing.value = true
  try {
    let foundProduct = null
    let foundBc = null
    for (const p of allProducts.value) {
      const bc = (p.barcodes || []).find(b => b.barcode === code)
      if (bc) { foundProduct = p; foundBc = bc; break }
    }
    if (foundProduct) {
      await cartStore.addToCart({ item_code: foundProduct.item_code, item_name: foundProduct.item_name, rate: foundProduct.rate || 0, image: foundProduct.image || '', item_group: foundProduct.item_group || '', qty: 1 }, foundBc)
      toast.success(`✓ ${foundProduct.item_name} added to cart`)
    } else {
      onNotFound?.()  // ← الـ scanner هيتحول لـ assign mode
    }
  } finally { isProcessing.value = false }
}

const handleAssignBarcode = async ({ item_code, barcode_type, uom, barcode }) => {
  try {
    const res = await addItemBarcode({ item_code, type: barcode_type, value: barcode, posa_uom: uom })
    if (res.status === 'success') {
      toast.success('Barcode assigned successfully ✓')
      showBarcodeScanner.value = false
      await loadData()
    } else {
      toast.warning(res.message)
    }
  } catch (e) { toast.error('Failed to assign barcode') }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterProduct.value = ''
  filterStatus.value = ''
  filterType.value = ''
  filterGroup.value = ''
}
// ────────────────────────────────────────────
// PRINT
// ────────────────────────────────────────────
const printSearch     = ref('')
const printFilterType = ref('')
const printForm       = reactive({ selectedBarcodes: [], labelSize: '4x6', copies: 1, includePrice: false })

const filteredPrintBarcodes = computed(() => {
  const q = printSearch.value.toLowerCase().trim()
  const t = printFilterType.value
  return flatRows.value.filter(row => {
    if (!row.hasBarcode) return false
    const matchSearch = !q || row.sku?.toLowerCase().includes(q) || row.barcode.code?.toLowerCase().includes(q)
    const matchType   = !t || row.barcode.type === t
    return matchSearch && matchType
  })
})

const selectAllPrint = () => {
  const keys = filteredPrintBarcodes.value.map(r => r.rowKey)
  printForm.selectedBarcodes = [...new Set([...printForm.selectedBarcodes, ...keys])]
}

const printLabels = async () => {
  const selected = printForm.selectedBarcodes
  if (!selected.length) return toast.warning('Select at least one barcode')
  const data = filteredPrintBarcodes.value.filter(r => selected.includes(r.rowKey))
  if (!data.length) return toast.warning('No barcodes found')
  const html = generatePrintHTML(data, printForm.labelSize, printForm.copies, printForm.includePrice)
  const win = window.open('', '_blank', 'height=700,width=900,scrollbars=yes')
  if (!win) { toast.error('Popup blocked — allow popups and retry'); return }
  win.document.open(); win.document.write(html); win.document.close()
  win.onload = () => setTimeout(() => { win.focus(); win.print(); setTimeout(() => win.close(), 2000) }, 300)
  toast.success(`Print job: ${selected.length * printForm.copies} labels`)
}

const generatePrintHTML = (rows, labelSize, copies, includePrice) => {
  const d = ({ '4x6': {w:'4in',h:'6in',f:'14px'}, '3x5': {w:'3in',h:'5in',f:'12px'}, '2x2': {w:'2in',h:'2in',f:'10px'} })[labelSize] || {w:'4in',h:'6in',f:'14px'}
  let body = ''
  rows.forEach(row => {
    for (let i = 0; i < copies; i++) {
      body += `<div class="label">
        <div class="lb">${row.barcode.preview ? `<img src="${row.barcode.preview}" />` : '<span>No Preview</span>'}</div>
        <div class="sku">SKU: ${row.sku}</div>
        <div class="code">${row.barcode.code}</div>
        <div class="name">${row.productName}</div>
        ${row.barcode.type ? `<div class="type">${row.barcode.type}${row.barcode.uom ? ' · ' + row.barcode.uom : ''}</div>` : ''}
        ${includePrice && row._price != null ? `<div class="price">$${Number(row._price).toFixed(2)}</div>` : ''}
      </div>`
    }
  })
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:.2in}
    .c{display:grid;grid-template-columns:repeat(auto-fill,minmax(${d.w},1fr));gap:.1in}
    .label{width:${d.w};border:1px solid #ddd;display:flex;flex-direction:column;align-items:center;padding:.15in;background:white;font-size:${d.f};text-align:center;gap:3px}
    .lb{width:100%;display:flex;align-items:center;justify-content:center;margin-bottom:.08in}
    .lb img{max-width:100%;max-height:80px;object-fit:contain}
    .sku{font-weight:bold;font-size:.8em}.code{font-family:monospace;font-size:.75em}
    .name{font-size:.75em;color:#555}.type{font-size:.7em;color:#888}
    .price{font-weight:bold;color:#d32f2f}
    @media print{body{padding:0}.label{border:.5px solid #999}}
  </style></head><body><div class="c">${body}</div></body></html>`
}

// ────────────────────────────────────────────
// SETTINGS
// ────────────────────────────────────────────
const settings = ref({ defaultType: '', skuPrefix: 'PRD', autoGenerateSku: true, defaultLabelSize: '4x6' })
const saveSettings = () => {
  localStorage.setItem('barcodeSettings', JSON.stringify(settings.value))
  toast.success('Settings saved')
}

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────
const getStatusBadge = (s) => ({
  active:   'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
})[s] || 'bg-gray-100 text-gray-800'

const capitalizeFirst = (s) =>
  String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1)

// ────────────────────────────────────────────
// MOUNTED
// ────────────────────────────────────────────
onMounted(async () => {
  await shiftStore.checkActiveShift().catch(() => {})
  await loadData()

  const [typesRes, groupsRes, fetchedUoms, fetchedSeries, fetchedCats] = await Promise.allSettled([
    getBarcodeTypes(),
    getItemGroup(),
    inventoryStore.loadUOM(),
    inventoryStore.defaultItemSeries(),
    inventoryStore.loadCategories(),
  ])

  if (typesRes.status  === 'fulfilled') barcodeTypes.value = typesRes.value?.data  || []
  if (groupsRes.status === 'fulfilled') itemGroups.value   = groupsRes.value?.data || []
  if (fetchedUoms.status   === 'fulfilled') uoms.value       = fetchedUoms.value   || []
  if (fetchedSeries.status === 'fulfilled') series.value     = fetchedSeries.value ? [fetchedSeries.value] : []
  if (fetchedCats.status   === 'fulfilled') categories.value = fetchedCats.value   || []

  const saved = localStorage.getItem('barcodeSettings')
  if (saved) { try { Object.assign(settings.value, JSON.parse(saved)) } catch {} }
})
const goBack = () => {
  router.back()
}
</script>
