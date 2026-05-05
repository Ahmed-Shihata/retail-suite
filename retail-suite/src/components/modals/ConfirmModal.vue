<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @mousedown.self="$emit('cancel')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden confirm-modal">

        <!-- Icon + Title -->
        <div class="px-6 pt-6 pb-4 text-center">
          <!-- Icon circle -->
          <div
            :class="iconBg"
            class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <component :is="iconComponent" class="w-7 h-7" :class="iconColor" />
          </div>

          <h3 class="text-base font-bold text-gray-900 mb-1">{{ title }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ message }}</p>

          <!-- Receipt badge -->
          <div class="mt-3 inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
            <span class="text-xs text-gray-500">Receipt</span>
            <span class="text-xs font-bold text-gray-900 font-mono">{{ docName }}</span>
          </div>
        </div>

        <!-- Warning note for cancel -->
        <div v-if="type === 'cancel'" class="mx-6 mb-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertTriangle class="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-xs text-red-600">This action cannot be undone. The receipt will be permanently cancelled.</p>
        </div>

        <!-- Buttons -->
        <div class="px-6 pb-6 flex gap-3">
          <button
            @click="$emit('cancel')"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="loading"
            :class="confirmBtnClass"
            class="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <component v-else :is="iconComponent" class="w-4 h-4" />
            {{ loading ? 'Processing...' : confirmLabel }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  show:         { type: Boolean, default: false },
  type:         { type: String,  default: 'submit' }, // 'submit' | 'cancel' | 'delete'
  docName:      { type: String,  default: '' },
  loading:      { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])

const config = {
  submit: {
    title:        'Submit Receipt',
    message:      'Are you sure you want to submit this receipt? It will be locked for editing.',
    confirmLabel: 'Submit',
    iconBg:       'bg-green-100',
    iconColor:    'text-green-600',
    iconComponent: CheckCircle,
    btnClass:     'bg-green-600 hover:bg-green-700',
  },
  cancel: {
    title:        'Cancel Receipt',
    message:      'Are you sure you want to cancel this receipt?',
    confirmLabel: 'Yes, Cancel',
    iconBg:       'bg-red-100',
    iconColor:    'text-red-600',
    iconComponent: XCircle,
    btnClass:     'bg-red-600 hover:bg-red-700',
  },
  delete: {
    title:        'Delete Receipt',
    message:      'Are you sure you want to delete this receipt? This cannot be undone.',
    confirmLabel: 'Delete',
    iconBg:       'bg-red-100',
    iconColor:    'text-red-600',
    iconComponent: AlertTriangle,
    btnClass:     'bg-red-600 hover:bg-red-700',
  },
}

const current       = computed(() => config[props.type] || config.submit)
const title         = computed(() => current.value.title)
const message       = computed(() => current.value.message)
const confirmLabel  = computed(() => current.value.confirmLabel)
const iconBg        = computed(() => current.value.iconBg)
const iconColor     = computed(() => current.value.iconColor)
const iconComponent = computed(() => current.value.iconComponent)
const confirmBtnClass = computed(() => current.value.btnClass)
</script>

<style scoped>
.confirm-modal {
  animation: pop-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}
</style>
