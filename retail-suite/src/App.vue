<template>
  <div
    id="app"
    :class="isDark ? 'theme-dark' : 'theme-light'"
    :style="{ background: 'var(--card-bg)', minHeight: '100vh' }"
  >
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.settings.appearance.theme === 'dark')

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

* {
  font-family: 'Nunito', sans-serif;
}

.glass {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
}

.hide-print {
  @apply block;
}

.print-area {
  @apply hidden;
}

@media print {
  .hide-print {
    @apply hidden;
  }

  .print-area {
    @apply block;
  }

  body {
    @apply bg-white text-black;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
