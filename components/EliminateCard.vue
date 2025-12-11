<template>
  <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="relative flex justify-between items-center">
        <h2 class="text-2xl">
          <span>立即消除</span>
          <code class="ml-1 text-sm text-green-500">({{ gridStore.eliminates.length }})</code>
        </h2>
        <UButton
          v-if="gridStore.eliminates.length > 0"
          class="absolute top-0 right-0"
          icon="i-lucide:zap"
          :loading="gridStore.eliminating"
          @click="execEliminateAll"
          color="green"
        >
          全部消除
        </UButton>
      </div>
    </template>

    <section class="space-y-3">
      <div v-for="(eliminate, idx) in gridStore.eliminates" :key="idx" class="relative p-3 border rounded-md">
        <code class="absolute right-2 top-2 text-sm text-gray-500">#{{ idx + 1 }}</code>
        <UButton class="absolute top-5 right-10" icon="i-lucide:zap" @click="execEliminate(eliminate)" color="green">
          消除
        </UButton>

        <div class="space-y-1">
          <p class="flex items-center">
            <span class="mr-2">坐标:</span>
            <code class="text-gray-400 text-sm">
              ({{ eliminate.point1.r }},{{ eliminate.point1.c }})-({{ eliminate.point2.r }},{{ eliminate.point2.c }})
            </code>
            <UButton icon="i-lucide:locate-fixed" @click="locateTile(eliminate)" color="gray" variant="ghost"></UButton>
          </p>
          <p class="flex items-center">
            <span class="mr-2">消除:</span>
            <img :src="'/icons/' + eliminate.value + '.png'" class="inline-block size-10" alt="" />
          </p>
        </div>
      </div>
    </section>
  </UCard>
</template>

<script setup lang="ts">
import { useGridStore } from '~/stores/grid';
import type { EliminateBlock, HighLightArea } from '~/types/board';
import { highlight } from '~/utils/helper';

const gridStore = useGridStore();

function locateTile(eliminate: EliminateBlock) {
  let area: HighLightArea = { point1: eliminate.point1, point2: eliminate.point2 };
  highlight(area);
}

function execEliminate(eliminate: EliminateBlock) {
  gridStore.execEliminate(eliminate);
}
function execEliminateAll() {
  gridStore.execEliminateAll();
}
</script>
