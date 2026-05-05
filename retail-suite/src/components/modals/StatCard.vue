
<!-- components/StatCard.vue -->
<template>
  <div
    :class="[
      'rounded-lg p-4 border shadow',
      colorClasses.bg,
      colorClasses.border
    ]"
  >
    <p :class="['text-sm font-semibold', colorClasses.text]">{{ title }}</p>
    <p :class="['text-3xl font-bold mt-2', colorClasses.value]">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (val) => ['blue', 'green', 'purple', 'orange'].includes(val)
  }
})

const colorClasses = computed(() => {
  const colors = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      value: 'text-blue-900'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      value: 'text-green-900'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      value: 'text-purple-900'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-600',
      value: 'text-orange-900'
    }
  }
  return colors[props.color] || colors.blue
})
</script>
