<template>
  <div class="checker-board w-fit flex flex-col mx-auto relative mt-10 border shadow-md">
    <!-- 顶部列序号 -->
    <BoardColNo :cols="cols" position="top" />

    <div v-for="(row, idx) in grid" :key="idx" class="row flex">
      <!-- 左侧行序号 -->
      <BoardRowNo :index="idx" position="left" />

      <!-- 格子区 -->
      <div
        v-for="(cell, idx2) in row"
        :key="idx2"
        class="cell relative z-0 size-10 ring-green-500 transition"
        :class="cellDivCls(cell)"
      >
        <img :src="'/icons/' + cell + '.png'" class="size-10" :class="cellImageCls(cell)" alt="" />
        <code
          v-if="cell !== 0 && settingStore.showCellValue"
          class="absolute z-20 right-0 top-0 w-5 text-center text-white bg-black/80 p-[2px] text-xs"
        >
          {{ cell }}
        </code>
      </div>

      <!-- 右侧行序号 -->
      <BoardRowNo :index="idx" position="right" />
    </div>

    <!-- 底部列序号 -->
    <BoardColNo :cols="cols" position="bottom" />
  </div>
</template>

<script setup lang="ts">
import BoardColNo from '~/components/widgets/BoardColNo.vue';
import BoardRowNo from '~/components/widgets/BoardRowNo.vue';
import { useSettingStore } from '~/stores/setting';

interface BoardProps {
  grid: number[][];
}

const props = defineProps<BoardProps>();

const settingStore = useSettingStore();

const rows = computed(() => props.grid.length);
const cols = computed(() => props.grid[0].length);

function cellImageCls(cell: number) {
  return cell === 0 ? '' : 'border border-black';
}
function cellDivCls(cell: number) {
  return cell === 0 ? '' : 'hover:ring-4 hover:cursor-pointer hover:z-10 hover:scale-110';
}
</script>
