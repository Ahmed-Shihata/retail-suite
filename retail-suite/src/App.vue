<!-- App.vue -->
<template>

  <template v-if="$route.meta.layout === 'none'">
    <RouterView />
    <ConfirmModal />
    <ToastContainer />
  </template>

  <MainLayout v-else>
    <RouterView />
    <ConfirmModal />
    <ToastContainer />
  </MainLayout>

</template>

<script setup>
import MainLayout           from '@/layout/MainLayout.vue'
import ConfirmModal         from '@/components/modals/ConfirmModal.vue'
import ToastContainer from '@/components/modals/ToastContainer.vue'
</script>
