<!-- DraftInvoicesModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="w-full max-w-lg rounded-2xl border overflow-hidden"
          :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b"
            :class="isDark ? 'border-gray-700' : 'border-gray-100'">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                :class="isDark ? 'bg-amber-900/40' : 'bg-amber-50'">
                <FileText class="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p class="text-sm font-medium" :class="isDark ? 'text-white' : 'text-gray-900'">
                  Draft invoices
                </p>
                <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                  Current shift
                </p>
              </div>
            </div>
            <button
              @click="$emit('update:modelValue', false)"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              :class="isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3 px-6 py-4 border-b"
            :class="isDark ? 'border-gray-700' : 'border-gray-100'">
            <div class="rounded-xl p-3" :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
              <p class="text-xs mb-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Drafts</p>
              <p class="text-xl font-medium" :class="isDark ? 'text-white' : 'text-gray-900'">
                {{ draftInvoices.length }}
              </p>
            </div>
            <div class="rounded-xl p-3" :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
              <p class="text-xs mb-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Total items</p>
              <p class="text-xl font-medium" :class="isDark ? 'text-white' : 'text-gray-900'">
                {{ totalItems }}
              </p>
            </div>
            <div class="rounded-xl p-3" :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
              <p class="text-xs mb-1" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Total</p>
              <p class="text-xl font-medium text-amber-500">
                {{ formatPrice(totalAmount) }}
              </p>
            </div>
          </div>

          <!-- Invoice List -->
          <div class="overflow-y-auto max-h-80 px-6 py-3 space-y-2">
            <div v-if="isLoading" class="py-8 text-center text-sm"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              Loading...
            </div>
            <div v-else-if="draftInvoices.length === 0" class="py-8 text-center text-sm"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              No draft invoices for this shift
            </div>
            <div
              v-for="inv in draftInvoices"
              :key="inv.name"
              class="rounded-xl border overflow-hidden"
              :class="isDark ? 'border-gray-700' : 'border-gray-200'"
            >
              <!-- Row -->
              <div
                class="flex items-center justify-between px-4 py-3 cursor-pointer"
                :class="isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'"
                @click="toggleInvoice(inv.name)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-md flex items-center justify-center"
                    :class="isDark ? 'bg-amber-900/40' : 'bg-amber-50'">
                    <Receipt class="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <p class="text-sm font-medium" :class="isDark ? 'text-white' : 'text-gray-900'">
                      {{ inv.name }}
                    </p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                      {{ inv.customer }} · {{ inv.items_count }} items
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <p class="text-sm font-medium" :class="isDark ? 'text-white' : 'text-gray-900'">
                      {{ formatPrice(inv.grand_total) }}
                    </p>
                    <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                      {{ formatTime(inv.posting_time) }}
                    </p>
                  </div>
                  <ChevronDown
                    class="w-4 h-4 transition-transform duration-200"
                    :class="[
                      isDark ? 'text-gray-400' : 'text-gray-400',
                      expandedInvoices.has(inv.name) ? 'rotate-180' : ''
                    ]"
                  />
                </div>
              </div>

              <!-- Items Expand -->
              <div
                v-if="expandedInvoices.has(inv.name)"
                class="border-t"
                :class="isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50'"
              >
                <div
                  v-for="item in inv.items"
                  :key="item.name"
                  class="flex justify-between px-4 py-2 border-b text-xs"
                  :class="isDark ? 'border-gray-700/60 text-gray-300' : 'border-gray-100 text-gray-600'"
                >
                  <span>{{ item.item_name }}</span>
                  <span>{{ item.qty }} × {{ formatPrice(item.rate) }}</span>
                </div>
                <div class="flex justify-end gap-2 px-4 py-2.5 border-t"
                  :class="isDark ? 'border-gray-700' : 'border-gray-100'">
                  <button
                    @click="$emit('delete-draft', inv.name)"
                    class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    :class="isDark
                      ? 'border-red-800 text-red-400 hover:bg-red-900/30'
                      : 'border-red-200 text-red-500 hover:bg-red-50'"
                  >
                    Delete
                  </button>
                  <button
                    @click="$emit('open-invoice', inv.name)"
                    class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    :class="isDark
                      ? 'bg-cyan-900/50 text-cyan-400 hover:bg-cyan-900'
                      : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'"
                  >
                    Open invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end px-6 py-4 border-t"
            :class="isDark ? 'border-gray-700' : 'border-gray-100'">
            <button
              @click="$emit('update:modelValue', false)"
              class="text-sm px-4 py-2 rounded-lg border transition-colors"
              :class="isDark
                ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileText, X, Receipt, ChevronDown } from 'lucide-vue-next'
import { formatPrice } from '@/utils/formatters'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  modelValue: Boolean,
  draftInvoices: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'open-invoice', 'delete-draft'])

const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.settings.appearance.theme === 'dark')

const expandedInvoices = ref(new Set())

const toggleInvoice = (name) => {
  if (expandedInvoices.value.has(name)) {
    expandedInvoices.value.delete(name)
  } else {
    expandedInvoices.value.add(name)
  }
}

const totalItems = computed(() =>
  props.draftInvoices.reduce((s, i) => s + (i.items_count || 0), 0)
)
const totalAmount = computed(() =>
  props.draftInvoices.reduce((s, i) => s + (i.grand_total || 0), 0)
)

const formatTime = (time) => {
  if (!time) return ''
  return time.slice(0, 5)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
