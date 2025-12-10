import * as tf from '@tensorflow/tfjs';
import { cosineSimilarity, loadImage } from '~/utils/helper';
import { NUM_CLASSES } from '~/config';

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
  x?: number;
  y?: number;
}

// 解析棋盘
async function parseBoard({ rows, cols, file, x: targetX, y: targetY }: BoardParseOptions, phase: Ref<string>) {
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
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 30, 30, displayWidth, displayHeight);

  // 动态计算每个格子大小
  const cellWidth = displayWidth / cols;
  const cellHeight = displayHeight / rows;
  const cellSize = Math.min(cellWidth, cellHeight);

  // 绘制行列序号
  for (let i = 0; i < rows; i++) {
    ctx.save(); // 保存上下文
    const fontSize = 14;
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#857979';
    ctx.textAlign = 'right';
    ctx.fillText((i + 1).toString(), 24, 30 + i * cellHeight + cellHeight / 2 + 5);
    ctx.textAlign = 'left';
    ctx.fillText((i + 1).toString(), 30 + displayWidth + 10, 30 + i * cellHeight + cellHeight / 2 + 5);
    ctx.restore(); // 恢复上下文
  }
  for (let i = 0; i < cols; i++) {
    ctx.save(); // 保存上下文
    const fontSize = 14;
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#857979';
    ctx.textAlign = 'center';
    ctx.fillText((i + 1).toString(), 30 + i * cellWidth + cellWidth / 2, 20);
    ctx.fillText((i + 1).toString(), 30 + i * cellWidth + cellWidth / 2, 30 + displayHeight + 20);
    ctx.restore(); // 恢复上下文
  }

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

      if (row === targetX && col === targetY) {
        console.log(simArray);
      }
      grid[row][col] = bestClass;

      // 绘制标注：添加背景色+内边距，右上角
      if (bestClass !== -1 && bestClass !== 0) {
        const text = bestClass.toString();
        const fontSize = 12;
        const padding = 4; // 内边距

        ctx.save(); // 保存上下文
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'right'; // 右对齐
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize + 2; // 约字体高度

        // 背景矩形：右上角位置
        const bgX = x + cellWidth; // 右边起始
        const bgY = y; // 上边起始
        const bgWidth = textWidth + 2 * padding;
        const bgHeight = textHeight + padding;

        // 填充半透明黑色背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(bgX - bgWidth, bgY, bgWidth, bgHeight);

        // 绘制红色粗体文字（居中于背景）
        ctx.fillStyle = 'white';
        ctx.fillText(text, bgX - padding, bgY + textHeight); // y偏移到背景内

        ctx.restore(); // 恢复上下文
      }

      tensor.dispose();
      output.dispose();
    }
  }

  phase.value = '';
  return grid;
}

interface Point {
  r: number;
  c: number;
}
async function renderFrame(start: Point, end: Point, rows: number, cols: number, file: File) {
  const img = await loadImage(URL.createObjectURL(file));
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const aspectRatio = img.width / img.height;
  const maxWidth = 1200;
  let displayWidth = Math.min(img.width, maxWidth);
  let displayHeight = displayWidth / aspectRatio;
  if (displayHeight > 800) {
    displayHeight = 800;
    displayWidth = displayHeight * aspectRatio;
  }

  // 动态计算每个格子大小
  const cellWidth = displayWidth / cols;
  const cellHeight = displayHeight / rows;
  const cellSize = Math.min(cellWidth, cellHeight);

  // 确定左上角和右下角
  const x1 = 30 + start.c * cellWidth + cellWidth / 2;
  const y1 = 30 + start.r * cellHeight + cellHeight / 2;
  const cropX1 = Math.max(0, x1 + (cellWidth - cellSize) / 2);
  const cropY1 = Math.max(0, y1 + (cellHeight - cellSize) / 2);
  const x2 = 30 + end.c * cellWidth + cellWidth / 2;
  const y2 = 30 + end.r * cellHeight + cellHeight / 2;
  const cropX2 = Math.max(0, x2 + (cellWidth - cellSize) / 2);
  const cropY2 = Math.max(0, y2 + (cellHeight - cellSize) / 2);

  const minX = Math.min(cropX1, cropX2);
  const minY = Math.min(cropY1, cropY2);
  const maxX = Math.max(cropX1, cropX2);
  const maxY = Math.max(cropY1, cropY2);

  const innerLineWidth = 4;
  const outerLineWidth = 6;
  // 计算白色外边框边界
  const whiteMinX = Math.max(0, minX - innerLineWidth); // 防止超出 Canvas 左边界
  const whiteMinY = Math.max(0, minY - innerLineWidth); // 防止超出 Canvas 上边界
  const whiteMaxX = Math.min(canvas.width, maxX + innerLineWidth); // 防止超出 Canvas 右边界
  const whiteMaxY = Math.min(canvas.height, maxY + innerLineWidth); // 防止超出 Canvas 下边界
  const whiteWidth = whiteMaxX - whiteMinX;
  const whiteHeight = whiteMaxY - whiteMinY;

  // 先绘制外边框
  ctx.lineWidth = innerLineWidth;
  ctx.strokeStyle = 'black';
  ctx.lineJoin = 'round';
  ctx.strokeRect(whiteMinX, whiteMinY, whiteWidth, whiteHeight);

  // 然后绘制内线框
  ctx.lineWidth = outerLineWidth;
  ctx.strokeStyle = '#22c55e';
  ctx.lineJoin = 'round';
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
}

export default () => {
  const loading = ref(false);
  const phase = ref('');

  async function parse(options: BoardParseOptions) {
    try {
      loading.value = true;
      return await parseBoard(options, phase);
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    phase,
    parse,
    renderFrame,
  };
};
