import microApp from '@micro-zoe/micro-app'
import Cookies from 'js-cookie';
import { routeByErrorcode } from './service/request';
import './global.less';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import './global.ts';
import * as echarts from 'echarts';

microApp.start()

export const dva = {
  config: {
    onError(e: any) {
      e.preventDefault();
    },
  },
};

/**
 * 当sessionId不存在且所在页面非登录页时
 * 跳转到登录页面
 */
const sessionId: string | undefined = Cookies.get('sessionId');

if (!sessionId) routeByErrorcode();

const theme1 = require('@/components/Echart/theme1.json');
echarts.registerTheme('theme_1', theme1);
