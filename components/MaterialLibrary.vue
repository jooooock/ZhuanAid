<script setup lang="ts">
import { NUM_CLASSES } from '~/config';

const total = NUM_CLASSES - 1;
const openDialog = ref(false);

// 每个素材: 40
// 间隙: 4

// 一行显示8个素材
// 40x8 + 4x7 = 320 + 28 = 348
</script>

<template>
  <div class="absolute right-2 top-2 max-w-[348px] bg-white">
    <div class="flex justify-end mb-3">
      <UButton size="xs" :icon="openDialog ? 'i-lucide:eye' : 'i-lucide:eye-off'" @click="openDialog = !openDialog">
        素材库
      </UButton>
    </div>
    <div class="flex flex-wrap gap-1" v-show="openDialog">
      <div v-for="i in total" class="flex flex-col items-center">
        <img :src="'/icons/' + i + '.png'" class="size-10 border border-black" alt="" />
        <span class="text-sm text-gray-500">{{ i }}</span>
      </div>
    </div>
  </div>
</template>
