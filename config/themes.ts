const themeConfig = {
  // 字体
  '@font-size-base': '12px', // 主字号
  '@text-color': '#fff',
  // 主色
  '@primary-color': 'rgba(0,255,255,1)',
  // 辅色：由亮到暗（下面四个自上到下）
  '@secondary-color-bright': '#00ffff', // 辅色(荧光蓝)
  '@secondary-color-skyBlue': '#00abff', // 辅色(天空蓝)
  '@secondary-color-lakeBlue': '#24c2df', // 辅色(湖蓝)
  '@secondary-color-darkBlue': '#0673bd', // 辅色(深蓝)
  // 功能色
  '@functional-color-red': '#ff3131', // 红色
  '@functional-color-green': '#45f50a', // 绿色
  '@functional-color-yelow': '#fcff00', // 黄色
  // 线条颜色
  '@border-color': '#00ffff',
  // 背景色：由亮到暗（下面四个自上到下）
  '@bg-color-bright': '#0681a2',
  '@bg-color-second': '#057ab3',
  '@bg-color-third': '#025982',
  '@bg-color-dark': '#093855',

  '@body-background': '#00bdff4d',
  '@component-background': '#00316f',
  '@border-radius-base': '4px',
  '@item-hover-bg': '#00bdff99',
  '@box-shadow': '0 0 0.1rem rgba(0, 255, 255, 0.6)',
  '@table-header-color': '#ffffff',
  '@text-color-secondary': '#ffffff',
  '@modal-header-border-color-split': '#00ffff',
  '@modal-heading-color': '#ffffff',
  '@modal-close-color': '#ffffff',
  '@item-active-bg': '@item-hover-bg', // item选中的背景色
  '@dropdown-selected-color': '#fff', // item选中的字体色

  // 遗产监测左侧方块背景色
  '@background-color-lgcy': 'rgba(7,79,160,0.50)',
  '@background-color-lgcy-active': 'rgba(6,34,99,0.73)',
  // 遗产监测左侧方块盒子阴影
  '@box-shadow-lgcy': 'inset 0 0 10px #00acff',

  // Select
  '@select-item-selected-bg': '@primary-color',
  '@select-dropdown-bg': '#01357f',

  // Input高度
  '@input-height-32': '32px',
  // DatePicker高度
  '@picker-height-32': '32px',

  // table
  '@table-border-radius-base': '0',

  // menu
  '@menu-item-color': 'rgba(0,255,255,1)',
  '@menu-selected-item-test-color': 'red',

  // ant message
  '@message-notice-content-bg': '#0B438C',
};

export default themeConfig;
