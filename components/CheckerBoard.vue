<template>
  <div>
    <div v-for="row in grid">
      <div v-for="cell in row">
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BoardProps {
  grid: number[][];
}

const props = defineProps<BoardProps>();
</script>
