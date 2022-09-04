import React from 'react';
import * as echarts from 'echarts';
import Echarts from 'echarts-for-react';
import _ from 'lodash';
const themeColor = require('./theme1.json').color;

import './style.less';

const gridDic = {
  gridX: {
    splitLine: { show: true },
    axisLabel: {
      color: '#8a9ecf',
    },
  },
  gridY: {
    splitLine: { show: true },
    axisLabel: {
      color: '#8a9ecf',
      // rotate: 30
    },
  },
  nodeData: { label: { show: true } },
  node: { symbolSize: 5 },
  threshold: {},
};
class FwEchart extends React.PureComponent {
  render() {
    const {
      option = {},
      style = {},
      isZoomBar = false, // 是否展示图表缩放的操作条
      imptGrid, // 最高权限的grid配置，该配置会替换默认的grid对象
      echartGridKeys = ['gridY', 'gridX'],
      dataZoomEnd = 60, // 底部缩放条的从x轴的什么位置结束
      dataZoomStart = 100, // 底部缩放条的从x轴的什么位置开始
      isPie = false, // 是否为饼图
      onEvents = {}, // echart鼠标事件集
      isLegendIcon = true, // 图例自有icon是否显示
      className = '',
      zoomOnMouseWheel = true,
      nameTextVertical = false,
      showAreaStyle = true,
      xLabelMatter = '',
      overspread = false,
      sortByLegend = true,
      showLineStyle = true,
      /**
       * 如果图表的要显示堆积的渐变效果，
       * 那么传入的颜色值需要是16进制的字符串
       * 建议统一都使用16进制的字符串
       */
      customColor = [],
    } = this.props;

    let color = themeColor;

    if (customColor.length) {
      const legendData = option?.legend?.data ?? [];
      let cs = [];

      const isString = customColor.every((item) => typeOf(item) === 'string');

      if (isString) {
        cs = customColor;
      } else {
        legendData.forEach((name) => {
          customColor.forEach((item) => {
            if (typeOf(item) === 'object' && item.name === name) {
              cs.push(item.color);
            }
          });
        });
      }

      color = [...cs, ...themeColor];
    }

    const grid = {
      top: '35',
      left: '20',
      right: '20',
      bottom: '0',
      containLabel: true,
      show: true,
      backgroundColor: 'rgba(0, 26, 92, 0.5)',
      borderColor: '#1f63a3',
    };

    const legend = {
      icon: 'circle',
    };

    const tooltip = {
      trigger: 'item',
      backgroundColor: '#0F3270',
      borderWidth: 0,
      axisPointer: {
        type: 'cross',
        label: {
          show: false,
        },
      },
      textStyle: {
        color: '#fff',
      },
    };

    const dataZoom = [
      {
        type: 'slider',
        show: false,
        filterMode: 'weakFilter',
        realtime: true,
        start: dataZoomStart,
        end: dataZoomEnd,
        height: '15px',
        bottom: 10,
        // zoomOnMouseWheel: false,
        backgroundColor: 'rgba(0,0,0,0.30)',
        borderColor: 'rgba(61, 184, 171,0.80)',
        fillerColor: 'rgba(61, 184, 171,0.50)',
        textStyle: {
          color: '#ffffff',
        },
      },
      {
        type: 'inside',
        filterMode: 'weakFilter',
        zoomOnMouseWheel: zoomOnMouseWheel,
      },
    ];

    /**
     * 根据图例顺序对曲线排序
     */
    if (
      option?.series?.length &&
      option?.legend?.data?.length &&
      sortByLegend
    ) {
      const newSeries = [];
      option.legend.data.forEach((title) => {
        newSeries.push(option.series.find(({ name }) => name === title));
      });
      if (newSeries.every((item) => item)) {
        option.series = newSeries;
      }
    }

    // 默认echart占满整个父元素
    const newStyle = { width: '100%', height: '100%', ...style };
    if (option.legend && isLegendIcon) Object.assign(option.legend, legend);

    const newOption = { ...option };

    if (!Array.isArray(newOption.grid) || !Array.isArray(imptGrid)) {
      newOption.grid = Object.assign(newOption.grid ?? {}, grid, imptGrid);
    }

    if (!newOption.tooltip) {
      newOption.tooltip = tooltip;
    } else {
      newOption.tooltip = { ...tooltip, ...newOption.tooltip };
    }

    // 当option有数据时，才做一下配置的适配
    if (JSON.stringify(option) !== '{}' && !isPie) {
      newOption.dataZoom = dataZoom;
      if (isZoomBar) {
        newOption.dataZoom[0].show = true;
        newOption.grid.bottom = '30px';
      }
    }

    if (newOption.yAxis?.length > 2 && !nameTextVertical) {
      newOption.yAxis = newOption.yAxis.map((item) => {
        let nameUnit = '';
        if (item.name) {
          let [name = '', unit = ''] = item.name.split('(');
          unit = unit ? `(${unit}` : '';
          nameUnit = `${name
            .split('')
            .map((txt) => `${txt}\n`)
            .join('')}${unit}`;
        }

        return {
          ...item,
          name: nameUnit,
          nameGap: -name.length * 2,
          nameTextStyle: {
            padding: [0, item.position === 'left' ? -18 : 18, 0, 0],
          },
        };
      });
    }

    const copyNewOption = _.cloneDeep(newOption);

    let { yAxis, xAxis, series } = copyNewOption;

    echartGridKeys.forEach((key) => {
      if (key === 'gridY' && xAxis?.length) {
        xAxis = xAxis.map((item) => Object.assign(item, gridDic[key]));
        // console.log(xAxis);
      }
      if (key === 'gridX' && yAxis?.length) {
        yAxis = yAxis.map((item) => Object.assign(item, gridDic[key]));
      }
      if (key === 'nodeData' && series?.length) {
        series = series.map((item) => Object.assign(item, gridDic[key]));
      }
      if (key === 'node' && series?.length) {
        series = series.map((item) => Object.assign(item, gridDic[key]));
      }
    });

    if (series?.length && showAreaStyle) {
      series = series.map((item, index) => {
        if (item.type === 'line') {
          item.areaStyle = {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `${color[index]}ff`,
              },
              {
                offset: 1,
                color: '#000a3b00',
              },
            ]),
          };
        }
        return item;
      });
    }
    if (series?.length && showLineStyle) {
      series = series.map((item, index) => {
        if (item?.type === 'line') {
          item['smooth'] = true;
          item['lineStyle'] = {
            ...item['lineStyle'],
            width: 2,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: `${color[index]}33`,
              },
              {
                offset: 0.3,
                color: `${color[index]}`,
              },
              {
                offset: 0.7,
                color: `${color[index]}`,
              },
              {
                offset: 1,
                color: `${color[index]}33`,
              },
            ]),
          };
        }
        return item;
      });
    }

    if (xLabelMatter && xAxis?.length) {
      xAxis.forEach((item) => {
        if (!item.axisLabel) item.axisLabel = {};
        item.axisLabel.formatter = (labelName) => labelName.slice(11, 16);
      });
    }

    if (overspread && xAxis?.length) {
      xAxis.forEach((item) => {
        item.data.splice(-5);
      });
    }

    // 设置饼形图的网格显示为false 去除折线图两端空隙
    if (series?.length) {
      series.forEach(({ type = '' }) => {
        if (type === 'pie') {
          copyNewOption.grid.show = false;
        }
        if (type === 'line' && copyNewOption.xAxis) {
          copyNewOption.xAxis[0].boundaryGap = false;
        }
        if (type === 'bar' && copyNewOption.xAxis) {
        }
      });
    }

    if (copyNewOption?.title?.show) copyNewOption.title.show = false; // 统一关闭标题

    // 这里给option添加color字段，为了避免传入自定义颜色导致图例和堆积图渐变不匹配
    copyNewOption.color = color;
    // copyNewOption.backgroundColor = 'rgba(7,22,85,0.60)'; // 配置整个echarts的背景色

    return (
      <Echarts
        notMerge
        theme="theme_1"
        option={copyNewOption}
        className={`fw-echarts ${className}`}
        style={newStyle}
        onEvents={onEvents}
      />
    );
  }
}

export default FwEchart;
