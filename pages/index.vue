<template>
  <div class="h-full">
    <div class="container mx-auto h-full p-10 flex gap-10 items-start">
      <CheckerBoard :grid="gridStore.grid" />
      <Solution :moves="effectiveMoves" :eliminates="eliminates" @magic="magic" />
    </div>

    <!-- 打开设置 -->
    <UButton icon="i-lucide:settings-2" class="fixed right-5 top-5" color="gray" @click="showSettings = true"></UButton>
    <Settings v-model:open="showSettings" />
  </div>
</template>

<script setup lang="ts">
import CheckerBoard from '~/components/CheckerBoard.vue';
import Solution from '~/components/Solution.vue';
import { websiteName } from '~/config';
import { useGridStore } from '~/stores/grid';
import type { EffectiveMove, Eliminate } from '~/types/board';
import { Board } from '~/utils/Board';

useHead({
  title: websiteName,
});

const gridStore = useGridStore();

const showSettings = ref(false);

const eliminates: Ref<Eliminate[]> = ref([]);
async function findAllEliminate() {
  const board = new Board(gridStore.grid);
  eliminates.value = board.findAllEliminate();
}

const effectiveMoves: Ref<EffectiveMove[]> = ref([]);
async function magic() {
  // 先标记可直接消除的砖块
  eliminates.value.length = 0;
  await findAllEliminate();

  effectiveMoves.value.length = 0;

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
</script>
