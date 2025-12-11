<template>
  <div class="relative flex-1 h-[800px] overflow-y-scroll border rounded-md shadow-md">
    <!-- 执行魔法 -->
    <UButton
      icon="i-lucide:sparkles"
      color="indigo"
      :disabled="gridStore.gridIsEmpty"
      class="absolute right-5 top-5 disabled:bg-gray-400"
      @click="emit('magic')"
    ></UButton>

    <div class="flex flex-col gap-5 p-10 pr-20">
      <EliminateCard :eliminates="eliminates" />
      <MoveCard :moves="moves" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MoveCard from '~/components/MoveCard.vue';
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, Eliminate } from '~/types/board';

interface Props {
  eliminates: Eliminate[];
  moves: EffectiveMove[];
}
defineProps<Props>();

const emit = defineEmits(['magic']);

const gridStore = useGridStore();
</script>
