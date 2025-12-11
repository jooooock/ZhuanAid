<template>
  <div class="w-fit flex flex-col relative border rounded-md shadow-md">
    <!-- 顶部列序号 -->
    <BoardColNo :cols="cols" position="top" />

    <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="flex">
      <!-- 左侧行序号 -->
      <BoardRowNo :index="rowIndex" position="left" />

      <!-- 格子区 -->
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        class="tile relative z-0 size-10 ring-green-500 transition"
        :class="cellDivCls(cell)"
        :data-r="rowIndex"
        :data-c="colIndex"
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
      <BoardRowNo :index="rowIndex" position="right" />
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

const cols = computed(() => props.grid[0].length);

function cellImageCls(cell: number) {
  return cell === 0 ? '' : 'border border-black';
}
function cellDivCls(cell: number) {
  return cell === 0 ? '' : 'hover:ring-4 hover:cursor-pointer hover:z-10 hover:scale-110';
}
</script>
