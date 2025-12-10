<template>
  <div class="container mx-auto pb-36">
    <h1 class="font-medium text-3xl my-3 text-center">《砖了个砖》游戏辅助工具</h1>
    <div class="flex gap-5">
      <label>
        <span class="mr-2">棋盘行数:</span>
        <UInput v-model="rows" type="number" min="1" class="w-20 inline-block" />
      </label>
      <label>
        <span class="mr-2">棋盘列数:</span>
        <UInput v-model="cols" type="number" min="1" class="w-20 inline-block" />
      </label>
    </div>
    <div class="flex mt-3 gap-5">
      <UInput
        type="file"
        size="sm"
        icon="i-heroicons-folder"
        class="w-64"
        accept="image/*"
        @change="handleFileChange"
      />
      <UButton @click="processBoard" :loading="loading" :disabled="!file" class="disabled:bg-gray-400">
        {{ phase || '重置棋盘' }}
      </UButton>
      <UButton :disabled="!grid" class="disabled:bg-gray-400" @click="magic">发动魔法</UButton>
    </div>
    <div class="flex justify-between">
      <canvas id="canvas" class="mt-3 w-[565px] h-[800px] bg-gray-200"></canvas>
      <div class="flex-1 h-[800px] overflow-y-scroll">
        <div class="flex flex-col gap-5 py-5 px-10">
          <div v-for="(move, idx) in effectiveMoves" :key="idx" class="p-3 border rounded-md">
            <p>
              消除
              <img :src="'/icons/' + move.value + '.png'" class="inline-block size-10" alt="" />
              <code class="text-gray-400 text-sm">
                ({{ move.point1.r }},{{ move.point1.c }}) - ({{ move.point2.r }},{{ move.point2.c }})
              </code>
            </p>
            <p class="flex items-center">
              坐标: <code>{{ formatGroupTarget(move.group) }}</code>
              <UIcon
                @click="locateGroup(move)"
                name="i-lucide:locate-fixed"
                class="size-6 text-gray-300 ml-3 hover:cursor-pointer hover:text-gray-500"
              />
            </p>
            <p class="flex items-center gap-3">
              <UIcon
                :name="'i-heroicons:arrow-' + move.dir.name.toLowerCase() + '-circle-16-solid'"
                class="text-green-500 size-10"
              />
              <span class="font-bold font-mono text-3xl text-green-500">{{ move.distance }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <MaterialLibrary />
  </div>
</template>

<script setup lang="ts">
import MaterialLibrary from '~/components/MaterialLibrary.vue';
import useBoard from '~/composables/useBoard';
import { websiteName } from '~/config';
import type { EffectiveMove, PointGroup } from '~/types/board';
import { Board } from '~/utils/Board';

const { loading, phase, parse: parseBoard, renderFrame } = useBoard();

useHead({
  title: websiteName,
});

const rows = ref(14);
const cols = ref(10);
const x = ref(0);
const y = ref(0);

const file = ref<File | null>(null);

function handleFileChange(files: FileList) {
  if (files.length > 0) {
    file.value = files[0];
    processBoard();
  } else {
    file.value = null;
  }
}

let grid = ref<number[][] | null>(null);
async function processBoard() {
  grid.value = await parseBoard({
    rows: rows.value,
    cols: cols.value,
    file: file.value!,
    x: x.value - 1,
    y: y.value - 1,
  });
  console.log(toRaw(grid.value));
}

async function findAllEliminate() {
  const board = new Board(grid.value!);
  const eliminates = board.findAllEliminate();
  for (const item of eliminates) {
    await renderFrame(item.point1, item.point2, rows.value, cols.value, file.value!);
  }
}

const effectiveMoves: Ref<EffectiveMove[]> = ref([]);
async function magic() {
  // 先标记可直接消除的砖块
  await findAllEliminate();

  effectiveMoves.value = [];

  const board = new Board(grid.value!);
  const moves = board.findAllPossibleMoves();

  let result: EffectiveMove[] = [];
  for (const move of moves) {
    const p = board.evaluate(move);
    if (p.length > 0) {
      result.push(...p);
    }
  }
  result = board.deduplication(result);
  effectiveMoves.value = result;
}

function formatGroupTarget(block: PointGroup) {
  let target = '';
  const { start, end } = block;
  if (start.r === end.r && start.c === end.c) {
    target = `(${start.r + 1}, ${start.c + 1})`;
  } else if (start.r === end.r) {
    if (start.c < end.c) {
      target = `(${start.r + 1}, ${start.c + 1}-${end.c + 1})`;
    } else {
      target = `(${start.r + 1}, ${end.c + 1}-${start.c + 1})`;
    }
  } else if (start.c === end.c) {
    if (start.r < end.r) {
      target = `(${start.r + 1}-${end.r + 1}, ${start.c + 1})`;
    } else {
      target = `(${end.r + 1}-${start.r + 1}, ${start.c + 1})`;
    }
  }
  return target;
}

function locateGroup(move: EffectiveMove) {
  const { group: block } = move;
  const { start, end } = block;
  renderFrame(start, end, rows.value, cols.value, file.value!);
}
</script>
