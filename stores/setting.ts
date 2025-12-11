import { defineStore } from 'pinia';

interface Setting {
  // 棋盘行数
  rows: number;
  // 棋盘列数
  cols: number;

  // 是否显示行列号
  showRowColNumber: boolean;

  // 是否显示网格值
  showCellValue: boolean;

  // 手机型号
  model: string;
}

export const useSettingStore = defineStore('setting', {
  state: (): Setting => ({
    rows: 14,
    cols: 10,
    showRowColNumber: true,
    showCellValue: false,
    model: 'iphone-11-pro',
  }),
});
