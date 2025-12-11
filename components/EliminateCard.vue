<template>
  <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">
          <span>立即消除</span>
          <code class="ml-1 text-sm text-green-500">({{ gridStore.eliminates.length }})</code>
        </h2>
      </div>
    </template>

    <section class="space-y-3">
      <div v-for="(eliminate, idx) in gridStore.eliminates" :key="idx" class="relative p-3 border rounded-md">
        <code class="absolute right-2 top-2 text-sm text-gray-500">#{{ idx + 1 }}</code>

        <div class="space-y-1">
          <p class="flex items-center">
            <span class="mr-2">坐标:</span>
            <code class="text-gray-400 text-sm">
              ({{ eliminate.point1.r }},{{ eliminate.point1.c }})-({{ eliminate.point2.r }},{{ eliminate.point2.c }})
            </code>
          </p>
          <p class="flex items-center">
            <span class="mr-2">消除:</span>
            <img :src="'/icons/' + eliminate.value + '.png'" class="inline-block size-10" alt="" />
          </p>
          <p class="flex items-center">
            <span class="mr-2">动作:</span>
            <UTooltip
              text="定位"
              :popper="{ placement: 'top', arrow: true }"
              :ui="{
                background: 'bg-black',
                color: 'text-white',
                ring: 'ring-black',
                arrow: { background: 'before:bg-black' },
              }"
            >
              <UButton
                icon="i-lucide:locate-fixed"
                @click="locateTile(eliminate)"
                color="gray"
                variant="ghost"
              ></UButton>
            </UTooltip>
            <UTooltip
              text="执行"
              :popper="{ placement: 'top', arrow: true }"
              :ui="{
                background: 'bg-black',
                color: 'text-white',
                ring: 'ring-black',
                arrow: { background: 'before:bg-black' },
              }"
            >
              <UButton icon="i-lucide:zap" @click="execEliminate(eliminate)" color="gray" variant="ghost"></UButton>
            </UTooltip>
          </p>
        </div>
      </div>
    </section>
  </UCard>
</template>

<script setup lang="ts">
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, Eliminate, TileArea } from '~/types/board';
import { highlight } from '~/utils/helper';

const gridStore = useGridStore();

function locateTile(eliminate: Eliminate) {
  let area: TileArea = { start: eliminate.point1, end: eliminate.point2 };
  highlight(area);
}

function execEliminate(eliminate: Eliminate) {
  gridStore.execEliminate(eliminate);
}
</script>
