
<!-- components/Toast.vue -->
<template>
  <Transition name="slide">
    <div
      v-if="show"
      :class="[
        'fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg flex items-start gap-3 z-50',
        typeClasses
      ]"
    >
      <div class="flex-1">
        <p class="font-semibold">{{ message }}</p>
      </div>
      <button
        @click="close"
        class="text-opacity-70 hover:text-opacity-100 transition"
      >
        <X class="w-5 h-5" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (val) => ['success', 'error', 'warning', 'info'].includes(val)
  },
  duration: {
    type: Number,
    default: 4000
  }
})

const emit = defineEmits(['close'])

const show = ref(true)

const typeClasses = computed(() => {
  const classes = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200'
  }
  return classes[props.type] || classes.success
})

const close = () => {
  show.value = false
  emit('close')
}

onMounted(() => {
  const timer = setTimeout(() => {
    close()
  }, props.duration)

  return () => clearTimeout(timer)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
