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
      <div v-for="(move, idx) in moves" :key="idx" class="p-3 border rounded-md">
        <p>
          消除
          <img :src="'/icons/' + move.value + '.png'" class="inline-block size-10" alt="" />
          <code class="text-gray-400 text-sm">
            ({{ move.point1.r }},{{ move.point1.c }}) - ({{ move.point2.r }},{{ move.point2.c }})
          </code>
        </p>
        <p class="flex items-center">
          坐标: <code>{{ formatGroupTarget(move.group) }}</code>
          <UIcon
            @click="locateGroup(move)"
            name="i-lucide:locate-fixed"
            class="size-6 text-gray-300 ml-3 hover:cursor-pointer hover:text-gray-500"
          />
        </p>
        <p class="flex items-center gap-3">
          <UIcon
            :name="'i-heroicons:arrow-' + move.dir.name.toLowerCase() + '-circle-16-solid'"
            class="text-green-500 size-10"
          />
          <span class="font-bold font-mono text-3xl text-green-500">{{ move.distance }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, PointGroup } from '~/types/board';

interface Props {
  moves: EffectiveMove[];
}
defineProps<Props>();
const emit = defineEmits(['magic', 'locate']);

const gridStore = useGridStore();

function formatGroupTarget(block: PointGroup) {
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
  const { group: block } = move;
  const { start, end } = block;
  // renderFrame(start, end, rows.value, cols.value, file.value!);
  emit('locate', toRaw(block));
}
</script>
