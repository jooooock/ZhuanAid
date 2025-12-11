<template>
  <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl">
          <span>移动后消除</span>
          <code class="ml-1 text-sm text-green-500">({{ moves.length }})</code>
        </h2>
      </div>
    </template>

    <section class="space-y-3">
      <div v-for="(move, idx) in moves" :key="idx" class="relative p-3 border rounded-md">
        <code class="absolute right-0 top-0 text-xs bg-black/40 p-1 text-white">#{{ idx + 1 }}</code>
        <p>
          消除
          <img :src="'/icons/' + move.value + '.png'" class="inline-block size-10" alt="" />
          <code class="text-gray-400 text-sm">
            ({{ move.point1.r }},{{ move.point1.c }}) - ({{ move.point2.r }},{{ move.point2.c }})
          </code>
        </p>
        <p class="flex items-center">
          坐标: <code>{{ formatGroupTarget(move.target) }}</code>
          <UIcon
            @click="locateGroup(move)"
            name="i-lucide:locate-fixed"
            class="size-6 text-gray-300 ml-3 hover:cursor-pointer hover:text-gray-500"
          />
        </p>
        <p class="flex items-center gap-3">
          <UIcon
            :name="'i-heroicons:arrow-' + move.direction.name.toLowerCase() + '-circle-16-solid'"
            class="text-green-500 size-10"
          />
          <span class="font-bold font-mono text-3xl text-green-500">{{ move.distance }}</span>
        </p>
      </div>
    </section>
  </UCard>
</template>

<script setup lang="ts">
import type { DirectedTileGroup, EffectiveMove, TileArea } from '~/types/board';
import { highlight } from '~/utils/helper';

interface Props {
  moves: EffectiveMove[];
}
defineProps<Props>();

function formatGroupTarget(block: DirectedTileGroup) {
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

function locateGroup(move: EffectiveMove) {
  const target = toRaw(move.target);
  let area: TileArea = { start: target.start, end: target.end };
  highlight(area);
}
</script>
