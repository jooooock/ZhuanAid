<template>
  <div>
    <CheckerBoard :grid="gridStore.grid" />

    <!-- 执行魔法 -->
    <UButton :disabled="gridStore.gridIsEmpty" class="fixed right-5 top-16 disabled:bg-gray-400" @click="magic">
      发动魔法
    </UButton>

    <!-- 打开设置 -->
    <UButton icon="i-lucide:settings-2" class="fixed right-5 top-5" color="gray" @click="showSettings = true"></UButton>
    <Settings v-model:open="showSettings" />
  </div>
</template>

<script setup lang="ts">
import CheckerBoard from '~/components/CheckerBoard.vue';
import { websiteName } from '~/config';
import { useGridStore } from '~/stores/grid';
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

function magic() {
  findAllEliminate();
}
</script>
