<template>
  <div class="border my-3 p-3 rounded-md">
    <h2 class="text-xl mb-3 text-fuchsia-500">素材库</h2>
    <div class="flex flex-wrap gap-1">
      <div v-for="i in total" class="flex flex-col items-center">
        <img
          :src="'/icons/' + i + '.png'"
          class="size-10 border border-gray-300 overflow-hidden hover:rounded-md hover:cursor-pointer hover:z-10 hover:scale-150 transition"
          alt=""
        />
        <span class="text-sm text-gray-500">{{ i }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NUM_CLASSES } from '~/config';

const total = NUM_CLASSES - 1;
</script>
