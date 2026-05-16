<template>
  <!-- POS وصفحات full-screen بدون MainLayout -->
  <template v-if="$route.meta.layout === 'none'">
    <RouterView />
  </template>

  <!-- باقي الصفحات مع MainLayout -->
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
</template>

<script setup>
import { computed } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.settings.appearance.theme === 'dark')
</script>
