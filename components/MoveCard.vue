<template>
  <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">
          <span>移动后消除</span>
          <code class="ml-1 text-sm text-green-500">({{ gridStore.moves.length }})</code>
        </h2>
      </div>
    </template>

    <section class="space-y-3">
      <div v-for="(move, idx) in gridStore.moves" :key="idx" class="relative p-3 border rounded-md">
        <code class="absolute right-2 top-2 text-sm text-gray-500">#{{ idx + 1 }}</code>
        <UButton class="absolute top-5 right-10" icon="i-lucide:zap" @click="execMove(move)" color="sky">移动</UButton>

        <div class="flex items-start gap-5">
          <div class="space-y-1">
            <p>
              <span class="mr-2">消除:</span>
              <img :src="'/icons/' + move.eliminate.value + '.png'" class="inline-block size-10" alt="" />
              <code class="text-gray-400 text-sm">
                [(R{{ move.eliminate.point1.r + 1 }},C{{ move.eliminate.point1.c + 1 }}), (R{{
                  move.eliminate.point2.r + 1
                }},C{{ move.eliminate.point2.c + 1 }})]
              </code>
            </p>
            <p class="flex items-center">
              <span class="mr-2">方块坐标:</span>
              <code>{{ formatGroupTarget(move.tileVector) }}</code>
              <UButton icon="i-lucide:locate-fixed" @click="locateTile(move)" color="gray" variant="ghost"></UButton>
            </p>
            <p class="flex items-center">
              <span class="mr-2">移动方向:</span>
              <UIcon
                :name="'i-heroicons:arrow-' + move.direction.name.toLowerCase() + '-circle-16-solid'"
                class="text-green-500 size-6"
              />
              <span class="font-medium font-mono text-xl text-green-500">{{ move.distance }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  </UCard>
</template>

<script setup lang="ts">
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, HighLightArea, TileVector } from '~/types/board';
import { highlight } from '~/utils/helper';

const gridStore = useGridStore();

function formatGroupTarget(block: TileVector) {
  let target = '';
  const { start, end } = block;
  if (start.r === end.r && start.c === end.c) {
    target = `(R${start.r + 1}, C${start.c + 1})`;
  } else if (start.r === end.r) {
    if (start.c < end.c) {
      target = `(R${start.r + 1}, C${start.c + 1}-C${end.c + 1})`;
    } else {
      target = `(R${start.r + 1}, C${end.c + 1}-C${start.c + 1})`;
    }
  } else if (start.c === end.c) {
    if (start.r < end.r) {
      target = `(R${start.r + 1}-R${end.r + 1}, C${start.c + 1})`;
    } else {
      target = `(R${end.r + 1}-R${start.r + 1}, C${start.c + 1})`;
    }
  }
  return target;
}

function locateTile(move: EffectiveMove) {
  const target = toRaw(move.tileVector);
  let area: HighLightArea = { point1: target.start, point2: target.end };
  highlight(area);
}

function execMove(move: EffectiveMove) {
  gridStore.execMove(move);
}
</script>
