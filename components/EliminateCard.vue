<template>
  <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">
          <span>立即消除</span>
          <code class="ml-1 text-sm text-green-500">({{ eliminates.length }})</code>
        </h2>
      </div>
    </template>

    <section class="space-y-3">
      <div v-for="(item, idx) in eliminates" :key="idx" class="relative p-3 border rounded-md">
        <code class="absolute right-0 top-0 text-xs bg-black/40 p-1 text-white">#{{ idx + 1 }}</code>
        <p>
          <span>消除:</span>
          <img :src="'/icons/' + item.value + '.png'" class="inline-block size-10" alt="" />
        </p>
        <p class="flex items-center">
          <span>坐标:</span>
          <code class="text-gray-400 text-sm">
            ({{ item.point1.r }},{{ item.point1.c }})-({{ item.point2.r }},{{ item.point2.c }})
          </code>
          <UIcon
            @click="locateTile(item)"
            name="i-lucide:locate-fixed"
            class="size-6 text-gray-300 ml-3 hover:cursor-pointer hover:text-gray-500"
          />
        </p>
      </div>
    </section>
  </UCard>
</template>

<script setup lang="ts">
import type { EffectiveMove, Eliminate, TileArea } from '~/types/board';
import { highlight } from '~/utils/helper';

interface Props {
  eliminates: Eliminate[];
}
defineProps<Props>();

function locateTile(eliminate: Eliminate) {
  let area: TileArea = { start: eliminate.point1, end: eliminate.point2 };
  highlight(area);
}
</script>
