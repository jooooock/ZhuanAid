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
    x1: 34,
    y1: 581,
    x2: 1089,
    y2: 2069,
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    x1: 34,
    y1: 581,
    x2: 1089,
    y2: 2069,
  },
];
