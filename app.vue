<template>
  <div :class="isDev ? 'debug-screens' : ''" class="flex flex-col h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>

<script setup lang="ts">
import { isDev } from '~/config';
import { useGridStore } from '~/stores/grid';

const gridStore = useGridStore();

gridStore.$subscribe(() => {
  console.log(1);
});
</script>

<style>
@import 'style.css';
</style>
