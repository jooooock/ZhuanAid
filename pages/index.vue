<template>
  <div class="h-full">
    <div class="container mx-auto h-full p-10 flex gap-10 items-start">
      <CheckerBoard />
      <Solution />
    </div>
    <!--    <div class="animate-highlight size-20 bg-sky-500 fixed bottom-0 right-0 z-50"></div>-->

    <Settings />
  </div>
</template>

<script setup lang="ts">
import CheckerBoard from '~/components/CheckerBoard.vue';
import Solution from '~/components/Solution.vue';
import { websiteName } from '~/config';

useHead({
  title: websiteName,
});
</script>
