import type { PhoneModel } from '~/types/misc';

/**
 * 是否在开发环境
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * 网站标题
 */
export const websiteName = '《砖了个砖》游戏辅助';

// 64个分类，0表示空
export const NUM_CLASSES = 64;

// 受支持的手机型号
export const SUPPORTED_MODELS: PhoneModel[] = [
  {
    id: 'iphone-11-pro',
    name: 'iPhone 11 Pro',
    width: 1125,
    height: 2436,
    x1: 35,
    y1: 580,
    x2: 1090,
    y2: 2070,
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    width: 1206,
    height: 2622,
    x1: 37,
    y1: 626,
    x2: 1170,
    y2: 2222,
  },
];
