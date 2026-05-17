<!-- App.vue -->
<template>
  <!-- POS وصفحات full-screen بدون MainLayout -->
  <template v-if="$route.meta.layout === 'none'">
    <RouterView />
    <ConfirmModal />
  </template>

  <!-- باقي الصفحات مع MainLayout -->
  <MainLayout v-else>
    <RouterView />
    <ConfirmModal />
  </MainLayout>
</template>

<script setup>
import { computed }         from 'vue'
import MainLayout           from '@/layout/MainLayout.vue'
import { useSettingsStore } from '@/stores/settings'
import ConfirmModal         from '@/components/modals/ConfirmModal.vue'
import { useToast }         from 'vue-toastification'
const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.settings.appearance.theme === 'dark')
const toast = useToast()
</script>
