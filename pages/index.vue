<template>
  <div class="h-full">
    <div class="container mx-auto h-full p-10 flex gap-10 items-start">
      <CheckerBoard :grid="gridStore.grid" />
      <SolutionStep :moves="effectiveMoves" @magic="magic" @locate="handleLocate" />
    </div>

    <!-- 打开设置 -->
    <UButton icon="i-lucide:settings-2" class="fixed right-5 top-5" color="gray" @click="showSettings = true"></UButton>
    <Settings v-model:open="showSettings" />
  </div>
</template>

<script setup lang="ts">
import CheckerBoard from '~/components/CheckerBoard.vue';
import SolutionStep from '~/components/SolutionStep.vue';
import { websiteName } from '~/config';
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, PointGroup } from '~/types/board';
import { Board } from '~/utils/Board';

useHead({
  title: websiteName,
});

const gridStore = useGridStore();

const showSettings = ref(false);

async function findAllEliminate() {
  const board = new Board(gridStore.grid);
  const eliminates = board.findAllEliminate();
  console.log(eliminates);
  for (const item of eliminates) {
    console.log(item);
  }
}

const effectiveMoves: Ref<EffectiveMove[]> = ref([]);

async function magic() {
  // 先标记可直接消除的砖块
  await findAllEliminate();

  effectiveMoves.value = [];

  const board = new Board(gridStore.grid);
  const moves = board.findAllPossibleMoves();

  let result: EffectiveMove[] = [];
  for (const move of moves) {
    const p = board.evaluate(move);
    if (p.length > 0) {
      result.push(...p);
    }
  }
  result = board.deduplication(result);
  effectiveMoves.value = result;
}

function handleLocate(block: PointGroup) {
  console.log(block);
}
</script>
