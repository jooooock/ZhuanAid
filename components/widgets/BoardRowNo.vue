<template>
  <div :class="dynamicClass" class="size-10 leading-10 text-gray-500 font-semibold font-mono text-xs border-t border-b">
    R{{ index + 1 }}
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '~/stores/setting';

interface Props {
  index: number;
  position: 'left' | 'right';
}
const props = defineProps<Props>();

const settingStore = useSettingStore();

const dynamicClass = computed(() => {
  let cls = '';
  if (!settingStore.showRowColNumber) {
    cls += ' invisible';
  }
  if (props.position === 'left') {
    cls += ' text-right pr-2';
  } else if (props.position === 'right') {
    cls += ' text-left pl-2';
  }
  return cls;
});
</script>
