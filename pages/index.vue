<template>
  <div class="h-full">
    <div class="container mx-auto h-full p-10 flex gap-10 items-start">
      <CheckerBoard />
      <Solution />
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

useHead({
  title: websiteName,
});

const showSettings = ref(false);
</script>
