<template>
  <div class="h-full">
    <div class="container mx-auto h-full p-10 flex gap-10 items-start">
      <CheckerBoard />
      <Solution />
    </div>
    <!--    <div class="animate-highlight size-20 bg-green-500 fixed bottom-0 right-0 z-50"></div>-->

    <!-- 打开设置 -->
    <UButton
      icon="i-lucide:sliders-horizontal"
      class="fixed right-5 top-5"
      color="gray"
      variant="ghost"
      @click="showSettings = true"
    ></UButton>
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
