<template>
  <div>
    <USlideover v-model="open" :ui="{ width: 'max-w-[500px]', overlay: { background: 'bg-black/60' } }">
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-2xl">游戏设置</h2>
            <UButton icon="i-lucide:x" color="gray" @click="open = false"></UButton>
          </div>
        </template>

        <div class="h-[calc(100vh-121px)] overflow-y-scroll">
          <div class="space-y-3 my-3 border rounded-md p-3">
            <h2 class="text-xl text-fuchsia-500">提取棋盘数据</h2>
            <canvas id="canvas" class="hidden"></canvas>
            <div class="flex gap-10">
              <label>
                <span class="mr-2">棋盘行数:</span>
                <UInput v-model="settingStore.rows" type="number" min="1" class="w-20 inline-block" />
              </label>
              <label>
                <span class="mr-2">棋盘列数:</span>
                <UInput v-model="settingStore.cols" type="number" min="1" class="w-20 inline-block" />
              </label>
            </div>
            <div class="flex gap-10">
              <label>
                <span>选择截图机型:</span>
                <USelect
                  class="w-64"
                  v-model="settingStore.model"
                  :options="SUPPORTED_MODELS"
                  option-attribute="name"
                  value-attribute="id"
                />
              </label>
            </div>
            <div class="flex gap-10">
              <label>
                <span>选择棋盘截图文件:</span>
                <UInput
                  type="file"
                  size="sm"
                  icon="i-heroicons-folder"
                  class="w-64"
                  accept="image/*"
                  @change="handleFileChange"
                />
              </label>
            </div>
            <div class="flex gap-10">
              <UButton @click="processBoard" :loading="loading" :disabled="!file" class="disabled:bg-gray-400">
                {{ phase || '重置棋盘' }}
              </UButton>
            </div>
          </div>

          <div class="space-y-3 my-3 border rounded-md p-3">
            <h2 class="text-xl text-fuchsia-500">显示设置</h2>
            <div class="flex flex-col gap-3">
              <UCheckbox v-model="settingStore.showRowColNumber" label="显示行列号" />
              <UCheckbox v-model="settingStore.showCellValue" label="显示网格值" />
            </div>
          </div>

          <MaterialLibrary class="my-3" />
        </div>
      </UCard>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import useGridParser from '~/composables/useGridParser';
import { SUPPORTED_MODELS } from '~/config';
import { useGridStore } from '~/stores/grid';
import { useSettingStore } from '~/stores/setting';

const { loading, phase, parse: parseBoard } = useGridParser();
const settingStore = useSettingStore();
const gridStore = useGridStore();
const open = defineModel<boolean>('open', { default: false });

const file = ref<File | null>(null);

function handleFileChange(files: FileList) {
  if (files.length > 0) {
    file.value = files[0];
    processBoard();
  } else {
    file.value = null;
  }
}

async function processBoard() {
  const grid = await parseBoard(file.value!);
  console.log(grid);
  if (grid) {
    gridStore.grid = grid;
  }
}
</script>
