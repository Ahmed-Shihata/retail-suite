<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close" @click="$emit('close')">✕</button>
      <h3>Invoice {{ invoice.number }}</h3>
      <div>Customer: {{ invoice.customer }}</div>
      <div>Total: {{ invoice.total }}</div>
      <router-link :to="{ name: 'InvoiceShow', params: { id: invoice.id } }" @click="$emit('close')">Open full</router-link>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps( {
    invoice: { type: Object, required: true }
  })
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
.modal { background:white; padding:1rem; border-radius:8px; min-width:300px; position:relative; }
.close { position:absolute; right:8px; top:8px; }
</style>
