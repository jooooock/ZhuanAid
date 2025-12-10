<template>
  <div>
    <CheckerBoard :grid="gridStore.grid" />

    <UButton icon="i-lucide:settings-2" class="fixed right-5 top-5" color="gray" @click="showSettings = true"></UButton>
    <Settings v-model:open="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { useGridStore } from '~/stores/grid';

const gridStore = useGridStore();

const showSettings = ref(false);
</script>
