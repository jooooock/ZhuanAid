// 余弦相似度
import type { TileArea } from '~/types/board';

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

// 加载图片
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`加载失败: ${src}`));
    img.src = src;
  });
}

// 裁剪图片
export function cropImage(file: File, x1: number, y1: number, x2: number, y2: number): Promise<File> {
  return new Promise((resolve, reject) => {
    // 创建Image对象并加载File
    const img = new Image();
    img.onload = () => {
      // 检查裁剪区域是否有效
      if (x1 < 0 || y1 < 0 || x2 > img.width || y2 > img.height || x1 >= x2 || y1 >= y2) {
        reject(new Error('裁剪区域无效'));
        return;
      }

      const cropWidth = x2 - x1;
      const cropHeight = y2 - y1;

      // 创建Canvas，大小为裁剪区域
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d')!;

      // 绘制裁剪区域到Canvas (参数: img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      ctx.drawImage(img, x1, y1, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // 将Canvas转换为Blob
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('转换Blob失败'));
            return;
          }

          // 创建新的File对象，保持原文件类型和名称（可自定义）
          const newFile = new File([blob], 'filename', {
            type: file.type || 'image/png',
            lastModified: Date.now(),
          });

          resolve(newFile);
        },
        file.type || 'image/png',
        1.0 // quality为1.0表示无损
      );
    };
    img.onerror = () => reject(new Error('加载图片失败'));

    const reader = new FileReader();
    reader.onload = e => {
      img.src = e!.target!.result as string;
    };
    reader.onerror = () => reject(new Error('读取文件失败'));

    reader.readAsDataURL(file);
  });
}

function tileInRange(tile: HTMLElement, area: TileArea): boolean {
  const r = +tile.dataset.r!;
  const c = +tile.dataset.c!;

  // 计算矩形的边界
  const minR = Math.min(area.start.r, area.end.r);
  const maxR = Math.max(area.start.r, area.end.r);
  const minC = Math.min(area.start.c, area.end.c);
  const maxC = Math.max(area.start.c, area.end.c);

  return r >= minR && r <= maxR && c >= minC && c <= maxC;
}

// 高亮棋盘上的指定区域
export function highlight(area: TileArea) {
  console.info('高亮区域: ', area);
  const tiles = document.querySelectorAll<HTMLElement>('.tile');
  for (const tile of tiles) {
    if (tileInRange(tile, area)) {
      tile.classList.add('animate-highlight');
      setTimeout(() => {
        tile.classList.remove('animate-highlight');
      }, 1000);
    }
  }
}

// 识别的棋盘数据是否有效
export function gridIsValid(grid: number[][] | null): boolean {
  if (!grid) return false;

  // 存在-1表示图标识别识别
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === -1) {
        return false;
      }
    }
  }
  return true;
}
