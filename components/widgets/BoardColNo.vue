<template>
  <div
    class="flex pl-10 text-gray-500 font-semibold font-mono text-xs"
    :class="settingStore.showRowColNumber ? '' : 'invisible'"
  >
    <div v-for="n in cols" class="size-10 leading-10 text-center border-l border-r">C{{ n }}</div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '~/stores/setting';

const settingStore = useSettingStore();

interface Props {
  cols: number;
  position: 'top' | 'bottom';
}

defineProps<Props>();
</script>
