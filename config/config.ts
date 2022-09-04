import { defineConfig } from 'umi';
import proxy from './proxy';
import routes from './routes/index';
import themeConfig from './themes';

export default defineConfig({
  routes,
  proxy,
  hash: true,
  theme: themeConfig,
  antd: {},
  dva: {
    immer: true,
    hmr: true,
  },
  manifest: {
    basePath: '/',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
  },
  targets: {
    ie: 11,
  },
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  // },
  terserOptions: {
    compress: {
      warnings: false,
      drop_debugger: false,
      drop_console: true,
    },
  },
  alias: {},
  fastRefresh: {},
  // mfsu: {},
  webpack5: {},
  exportStatic: {},
  nodeModulesTransform: { type: 'none' },
  externals: { AMap: 'window.AMap' },
  plugins: ['./src/plugin/GdMapPlugin.js'],
});
