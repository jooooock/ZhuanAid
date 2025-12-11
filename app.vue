<template>
  <div :class="isDev ? 'debug-screens' : ''" class="flex flex-col h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />

    <!-- 用于图片识别的 canvas 元素需要放在全局 -->
    <canvas id="canvas" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { isDev } from '~/config';
</script>

<style>
@import 'style.css';
</style>
