import * as tf from '@tensorflow/tfjs';
import { NUM_CLASSES, SUPPORTED_MODELS } from '~/config';
import { useSettingStore } from '~/stores/setting';
import { cosineSimilarity, cropImage, loadImage } from '~/utils/helper';

const MODEL_URL = 'https://www.kaggle.com/models/google/mobilenet-v2/TfJs/035-128-feature-vector/3';
const INPUT_NAME = 'images'; // 模型输入键
const INPUT_SHAPE: [number, number] = [128, 128]; // 128x128
const ICON_PATH = '/icons/'; // 您的图标路径
const SIM = 0.6; // 相似度阈值

let prototypes: any[] = []; // 每个分类的原型向量
let sharedModel: any = null; // 共享模型实例

// 加载样本图标并提取原型
async function loadPrototypes(phase: Ref<string>) {
  try {
    if (sharedModel === null) {
      phase.value = '加载模型中';
      sharedModel = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });
    }

    phase.value = '加载原型中';
    prototypes = [];
    for (let i = 0; i < NUM_CLASSES; i++) {
      try {
        const img = await loadImage(`${ICON_PATH}${i}.png`);
        const tensor = tf.browser
          .fromPixels(img)
          .resizeNearestNeighbor(INPUT_SHAPE)
          .toFloat()
          .div(255.0) // 归一化 [0,1]
          .expandDims();
        const output = sharedModel.execute({ [INPUT_NAME]: tensor });
        const features = await output.data();
        prototypes.push(Array.from(features));
        tensor.dispose();
        output.dispose();
      } catch (e: any) {
        console.warn(`图标 ${i}.png 未找到，跳过: ${e.message}`);
        prototypes.push(null);
      }
    }
  } catch (e: any) {
    alert(`模型加载失败: ${e.message}\n请检查网络或URL。`);
  }
}

interface BoardParseOptions {
  rows: number;
  cols: number;
  file: File;
}

// 解析棋盘
async function parseBoard({ rows, cols, file }: BoardParseOptions, phase: Ref<string>) {
  console.log(rows, cols, file);

  // 加载原型（只需一次）
  if (prototypes.length === 0) {
    await loadPrototypes(phase);
  }

  phase.value = '提取网格中';
  const img = await loadImage(URL.createObjectURL(file));

  // 动态调整Canvas大小
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const aspectRatio = img.width / img.height;
  const maxWidth = 1200;
  let displayWidth = Math.min(img.width, maxWidth);
  let displayHeight = displayWidth / aspectRatio;
  if (displayHeight > 800) {
    displayHeight = 800;
    displayWidth = displayHeight * aspectRatio;
  }
  canvas.width = displayWidth + 30 * 2; // 两边需要加上行列序号
  canvas.height = displayHeight + 30 * 2; // 上下也需要加上行列序号
  // canvas.style.display = 'block';
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 30, 30, displayWidth, displayHeight);

  // 动态计算每个格子大小
  const cellWidth = displayWidth / cols;
  const cellHeight = displayHeight / rows;
  const cellSize = Math.min(cellWidth, cellHeight);

  // 提取网格
  const grid: number[][] = [];
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      // 裁剪格子（中心裁剪）
      const x = 30 + col * cellWidth;
      const y = 30 + row * cellHeight;
      const cropX = Math.max(0, x + (cellWidth - cellSize) / 2);
      const cropY = Math.max(0, y + (cellHeight - cellSize) / 2);

      const cellCanvas = document.createElement('canvas');
      cellCanvas.width = cellSize;
      cellCanvas.height = cellSize;
      const cellCtx = cellCanvas.getContext('2d')!;
      cellCtx.drawImage(canvas, cropX, cropY, cellSize, cellSize, 0, 0, cellSize, cellSize);

      // 提取特征
      const cellImg = cellCanvas.toDataURL();
      const cellImage = await loadImage(cellImg);
      const tensor = tf.browser
        .fromPixels(cellImage)
        .resizeNearestNeighbor(INPUT_SHAPE)
        .toFloat()
        .div(255.0)
        .expandDims();
      const output = sharedModel.execute({ [INPUT_NAME]: tensor });
      const cellFeatures: number[] = Array.from(await output.data());

      // 分类：找最相似原型
      let bestClass = -1;
      const simArray: { sim: number; cls: number }[] = [];
      for (let idx = 0; idx < NUM_CLASSES; idx++) {
        if (prototypes[idx] === null) continue;
        const sim = cosineSimilarity(cellFeatures, prototypes[idx]);
        simArray.push({ sim, cls: idx });
      }

      // 按照相似度排序
      simArray.sort((a, b) => b.sim - a.sim);
      if (simArray[0].sim > SIM) {
        bestClass = simArray[0].cls;
      } else {
        console.warn(
          `(${row + 1}, ${col + 1})匹配时最高相似度低于${SIM}，为${simArray[0].sim.toString().slice(0, 4)}`,
          simArray
        );
      }

      grid[row][col] = bestClass;

      tensor.dispose();
      output.dispose();
    }
  }

  phase.value = '';
  return grid;
}

export default () => {
  const settingStore = useSettingStore();

  const loading = ref(false);
  const phase = ref('');

  async function parse(file: File) {
    const targetModel = SUPPORTED_MODELS.find(model => model.id === settingStore.model);
    if (!targetModel) {
      console.warn('未找到指定的手机型号');
      return null;
    }

    try {
      loading.value = true;

      // 裁剪图片
      const cropFile = await cropImage(file, targetModel.x1, targetModel.y1, targetModel.x2, targetModel.y2);
      return await parseBoard({ file: cropFile, rows: settingStore.rows, cols: settingStore.cols }, phase);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
    return null;
  }

  return {
    loading,
    phase,
    parse,
  };
};
