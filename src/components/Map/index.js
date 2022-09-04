import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { isPointInPolygon } from './calc';
import { arrayUnique } from '@/utils/utils';
import { useSelector } from 'react-redux';
import { getIconStatusColor } from './locConfig';
import { useSize } from 'ahooks';

import {
  drawMark,
  drawTitle,
  drawStatus,
  drawTmpMark,
  drawTmpText,
  dyeBlickById,
  getLocByType,
  drawSwitch,
} from './standardIcon';

import { darwPreview, closePreview } from './darwPreview';

import { defaultColor } from './locConfig';

import './index.less';

export default function Map(props) {
  const {
    hotmapSourceData = [],
    injectionMaps = null,
    colors = defaultColor,
    legend = {},
    draggable = false, // 标注能否拖动
    editable = false, // 是否添加标注
    hoverable = false, // hover是否高亮
    markers = [],
    chooseBlockId,
    selectMarkId = '', // 当前选中的标记id
    chooseBlickIdList = [], // bolck多选
    baseBlickIdList = [], // 已被选中的block
    pathDatas = [], // path路径数据
    onBlockChoose = new Function(),
    onDragEnd = new Function(),
    onMarkerClick = new Function(),
    onSwitchClick = new Function(),
    onCheckMapLayer = new Function(),
    style,
    className = '',
    mapId = null, // 地图的图层id，如果传入，则图层的切换通过组件暴漏的方法用户主动修改
    showAllMapLayer = false, // 是否全部展示图层，不通过enable字段来过滤
    /**
     * 是否启用左上角的预览弹框，该配置可强制启用左上角的预览，
     * 即点击地图icon都会调用创建预览的方法,
     * 至于是否点击后会不会展示，则根据状态如果在本地能找到对应的方法图则展示
     */
    enablePreview = false,
    mapLayerLegendPos = 'middle', // 地图图层对应的图例位置 可选值为  middle top bottom
    mapLegendExtendData = [], // 地图图例扩展选项列表，示例代码：首页默认数据的地图
    mapLegendExtendInitValue = '', // 扩展图例中初始化默认选中的数据，示例代码：首页默认数据展示地图
    showTitle = true, // 关闭标题
    showStatus = true, // 关闭状态显示
    isZoom = true,
    maxLength = 1, // 当大于maxLength时显示图例，默认为1
    viewBox = '0 0 1366 768', // 默认视图尺寸大小
    onZoom = () => {}, // 缩放、拖拽地图的回调事件
  } = props;
  const scale = useRef(1);

  const map = useRef(null);
  const baseMap = useRef(null);
  const baseMapLayer = useRef(null);

  // const [pathDatas, setPathData] = useState([]);
  const [mapLayerId, setMapLayerKey] = useState('');
  const [mapLegendExtendId, setMapLegendExtendId] = useState('');

  /**
   * maps: 项目中配置的图层列表，该数据来自store中的项目详情对象
   * scene: 项目的类型，其值为下：
   *        FIELD("大田"),
   *        GREEN_HOUSE("大棚"),
   *        BUILDING("楼宇")
   * 当为大棚项目时，点击地图icon，左上角会显示点击设备的局部预览图
   */
  const { maps = [], scene = '' } = useSelector(
    (state) => state.common,
  ).currentProject;

  markers.forEach((item) => {
    if (item.type === 'VALVE' && item.deviceStatus === 'OFFLINE')
      item.status = 'OFFLINE';
  });
  const filterMarkers = markers.filter((item) => mapLayerId === item.mapId);

  /**
   * 默认展示当前项目下的图层，并通过是否启用的属性enable来过滤
   * 如果用户主动传入图层列表，则使用传入的，且依然会通过是否启用的字段enable来过滤
   * 除非配置不过过滤的字段
   */
  let mapLayers = injectionMaps ?? maps;
  if (!showAllMapLayer) {
    mapLayers = mapLayers.filter(({ enable }) => enable);
  }

  useEffect(() => {
    if (mapLayers?.length && mapId === null) {
      setMapLayerKey(mapLayers[0].id);
    }
  }, [maps]);

  // 初始化扩展图例选中数据
  useEffect(() => {
    if (mapLegendExtendData?.length) {
      setMapLegendExtendId(mapLegendExtendInitValue);
    }
  }, [mapLegendExtendInitValue]);

  useEffect(() => {
    if (mapId) {
      setMapLayerKey(mapId);
    }
  }, [mapId]);

  useLayoutEffect(() => {
    if (!isZoom) return;
    const zoom = d3.behavior
      .zoom()
      .scaleExtent([1, 10])
      .on('zoom', (e) => {
        onZoom(e);

        scale.current = zoom.scale();
        document.fwSvgscale = zoom.scale();

        [d3.select(baseMap.current), d3.select(baseMapLayer.current)].map(
          ($dom) =>
            $dom.attr(
              'transform',
              `translate(${zoom.translate()}) scale(${zoom.scale()})`,
            ),
        );

        d3.select('g#marker').attr(
          'transform',
          `translate(${zoom.translate()})`,
        );

        d3.selectAll('#marker>*').each(function (d) {
          const [x, y] = getLocByType(this.tagName, d, zoom.scale());

          if (this.tagName === 'polygon') {
            d3.select(this).attr(
              'points',
              `${x},${y + 50} ${x + 15},${y + 50} ${x + 15},${y} ${x}, ${y}`,
            );
            return;
          }

          if (this.tagName === 'g') {
            d3.select(this).attr('transform', `translate(${x}, ${y})`);
            return;
          }

          d3.select(this).attr('x', x).attr('y', y).attr('cx', x).attr('cy', y);
        });

        d3.selectAll('#marker>ellipse[out-circle_select]').each(function (d) {
          const [x, y] = getLocByType(this.tagName, d, zoom.scale());
          d3.select(this).style('transform-origin', `${x}px ${y}px`);
        });

        d3.selectAll('#marker>g[last-data-mark]').each(function (d) {
          const [x, y] = getLocByType(this.tagName, d, zoom.scale());
          let { width, height } = document
            .querySelector(`g[last-data-mark="${d.id}"]`)
            .getBBox();
          d3.select(this).attr(
            'transform',
            `translate(${x - width / 2 + 10}, ${y - height})`,
          );
        });
      });

    d3.select(map.current).call(zoom);
  }, []);

  // const size = useSize(document.querySelector('#root'));
  // if (size.width) {
  //   drawMark(
  //     filterMarkers
  //       .map(item => ({ ...item }))
  //       .filter(({ loc }) => loc[0] !== -1 || loc[1] !== -1),
  //     scale.current,
  //     onMarkerClick,
  //   );
  // }
  // const size = useSize(document.querySelector('#root'));

  useLayoutEffect(() => {
    const list = filterMarkers.map((item) => ({ ...item }));

    showStatus &&
      drawStatus(
        list
          .filter(({ loc }) => loc[0] !== -1 || loc[1] !== -1)
          .filter(({ status }) => !!status),
        scale.current,
        selectMarkId,
      );

    const marker = drawMark(
      list.filter(({ loc }) => loc[0] !== -1 || loc[1] !== -1),
      scale.current,
      onMarkerClick,
    );

    showTitle &&
      drawTitle(
        list
          .filter(({ loc }) => loc[0] !== -1 || loc[1] !== -1)
          .filter(({ title }) => !!title),
        scale.current,
      );

    drawSwitch(
      list.filter(({ loc, showSwitch }) => {
        return (loc[0] !== -1 || loc[1] !== -1) && showSwitch;
      }),
      scale.current,
      onSwitchClick,
    );

    const drag = d3.behavior
      .drag()
      .on('dragstart', (d) => {
        d3.selectAll(`[data-id="${d.id}"]`).remove();
        d3.selectAll(`[data-title="${d.id}"]`).remove();

        d3.event.sourceEvent.stopPropagation();
      })
      .on('drag', function (d) {
        const x = d3.select(this).attr('x') * 1;
        const y = d3.select(this).attr('y') * 1;
        const offsetX = x + d3.event.dx;
        const offsetY = y + d3.event.dy;

        d3.select(this).attr('x', offsetX);
        d3.select(this).attr('y', offsetY);
      })
      .on('dragend', function (d) {
        let x = d3.select(this).attr('x') * 1;
        let y = d3.select(this).attr('y') * 1;

        if (d.loc[0] === -1 && d.loc[1] === -1) {
          const val = (
            baseMap.current.attributes.transform?.value ?? ''
          ).replace(
            /translate\((.+),(.+)\) scale\(.+\)/g,
            function ($, $1, $2) {
              return [$1, $2];
            },
          );

          if (val) {
            const [offsetX, offsetY] = val.split(',');
            x = x - offsetX * 1;
            y = y - offsetY * 1;
          }
        }

        if (pathDatas.length > 0) {
          if (
            isPointInPolygon(
              [x / scale.current, y / scale.current],
              d3.select(`path[data-id="${chooseBlockId}"]`).node(),
            )
          ) {
            d.loc = [
              (x / scale.current).toFixed(6),
              (y / scale.current).toFixed(6),
            ];
          }
        } else {
          d.loc = [
            (x / scale.current).toFixed(6),
            (y / scale.current).toFixed(6),
          ];
        }

        onDragEnd(list);
      });

    if (draggable) {
      marker.call(drag);
    }

    marker.on('mouseup', (d) => {
      if (scene === 'GREEN_HOUSE' && enablePreview)
        darwPreview(d.valveType, d.switchStatus);
      onMarkerClick(d);
    });

    if (editable) {
      drawTmpText(list.filter(({ loc }) => loc[0] === -1 && loc[1] === -1));

      const tmpMarker = drawTmpMark(
        list.filter(({ loc }) => loc[0] === -1 && loc[1] === -1),
      );

      tmpMarker.call(drag);
    }
  }, [markers, mapLayerId]);

  useLayoutEffect(() => {
    if (chooseBlockId) {
      dyeBlickById(chooseBlockId, 1);
    }

    if (!chooseBlockId) {
      baseBlickIdList.forEach((id) => {
        d3.select(`path[data-id="${id}"]`).attr(
          'style',
          `opacity:1;fill:#0043a1;`,
        );
      });
    }

    return () => {
      dyeBlickById(chooseBlockId, 0);
    };
  }, [chooseBlockId]);

  useLayoutEffect(() => {
    chooseBlickIdList.forEach((chooseBlockId) => {
      chooseBlockId && dyeBlickById(chooseBlockId, 1);

      if (!chooseBlockId) {
        baseBlickIdList.forEach((id) => {
          d3.select(`path[data-id="${id}"]`).attr(
            'style',
            `opacity:1;fill:#0043a1;`,
          );
        });
      }
    });

    return () => {
      chooseBlickIdList.forEach((chooseBlockId) => {
        chooseBlockId && dyeBlickById(chooseBlockId, 0);
      });
    };
  }, [chooseBlickIdList]);

  useLayoutEffect(() => {
    d3.select(baseMapLayer.current)
      .selectAll('path')
      .on('click', function () {
        if (!baseBlickIdList.includes(d3.select(this).attr('data-id'))) {
          onBlockChoose(d3.select(this).attr('data-id'));
        }
      });
  }, [baseBlickIdList]);

  const handelCheckLayer = (type, item) => {
    if (type === 'basemap') setMapLayerKey(item.id);

    if (type === 'extend') setMapLegendExtendId(item.id);

    // 如果存在图例拓展数据，则返回操作的类型供上层判断事件类型
    if (mapLegendExtendData.length) {
      onCheckMapLayer(type, item);
    } else {
      onCheckMapLayer(item);
      closePreview();
    }
  };

  const newLegend = {
    show: false,
    data: legend.show ? arrayUnique(filterMarkers, 'status') : [],
    orient: 'column', // row/column 水平/竖直
    ...legend,
  };

  return (
    <div className={`fw-map-box ${className}`}>
      <svg
        ref={map}
        className={`map-layout ${hoverable ? 'can-hover' : ''}`}
        viewBox={viewBox}
        style={style}
      >
        <defs>
          {arrayUnique(filterMarkers, 'status').map((item, index) => {
            return (
              <g key={item.status}>
                <linearGradient
                  id={item.status}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="10%"
                    style={{ stopColor: `${getIconStatusColor(item)}30` }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: getIconStatusColor(item) }}
                  />
                </linearGradient>
              </g>
            );
          })}
          {hotmapSourceData.map((item) => {
            const value = +item.value;

            return (
              <radialGradient
                id={`hotmap_${item.key}`}
                cx="50%"
                cy="50%"
                r="80%"
                fx="50%"
                fy="50%"
              >
                {value >= 150 && (
                  <stop
                    offset="5%"
                    stopColor="#ff0000"
                    stopOpacity={+item.value / 300}
                  />
                )}
                <stop
                  offset={value < 150 ? '30%' : '70%'}
                  stopColor="#dcea1a"
                  stopOpacity={(value / 300) * 2}
                />
                <stop
                  offset="99%"
                  stopColor="#05d860"
                  stopOpacity={(value / 300) * 2}
                />
              </radialGradient>
            );
          })}

          <filter id="filter-hotmapSource">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0"
              result="gaussianBlur"
            />
            <feColorMatrix
              in="gaussianBlur"
              mode="matrix"
              values="10 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="colorMatrix"
            />
            <feBlend in="SourceGraphic" in2="colorMatrix" />
          </filter>

          <linearGradient id="youngtoblue">
            <stop offset="0" stopColor="#16E2D1" />
            <stop offset="100%" stopColor="#009DFF" />
          </linearGradient>
        </defs>

        <g id="basic" ref={baseMap}>
          {mapLayers.map((item) => (
            <image
              className={`basic-map_layer ${
                mapLayerId === item.id ? 'basic-map_show' : ''
              }`}
              key={item.id}
              href={item.mapFileUrl}
            />
          ))}
        </g>

        <g id="basic_layer" ref={baseMapLayer}>
          {pathDatas.length > 0 &&
            pathDatas.map((pathItem) => (
              <path
                key={pathItem.id}
                data-id={pathItem.id}
                d={pathItem.path}
                fill={`url(#hotmap_${pathItem.id})`}
                filter={'url(#filter-hotmapSource)'}
              />
            ))}
        </g>

        {editable && (
          <rect
            x="0"
            y="0"
            width="1366"
            height="80"
            style={{ fill: '#071652' }}
          ></rect>
        )}

        {editable && <g id="tmpMarker"></g>}

        <g id="marker"></g>
      </svg>
      {typeof newLegend.render === 'function'
        ? newLegend.render()
        : newLegend.data?.length > 0 &&
          newLegend.show && (
            <div
              className={`map-legend map-layer-legend_${mapLayerLegendPos}`}
              style={{
                flexDirection: newLegend.orient,
              }}
            >
              {newLegend.data.map((item, index) => (
                <div
                  key={typeof item === 'string' ? item : item[legend.nameKey]}
                  data-legeng={
                    typeof item === 'string' ? item : item[legend.nameKey]
                  }
                  className="fwmap-legeng-item"
                >
                  <span
                    style={{
                      backgroundColor: item.statusColor ?? colors[index],
                    }}
                  />
                </div>
              ))}
            </div>
          )}

      {mapLayers.length > maxLength && (
        <div
          className={`map-layer-legend map-layer-legend_${mapLayerLegendPos}`}
        >
          <div className="map-layer-legend-extend">
            {mapLegendExtendData.map((item) => (
              <div
                className={`mll-item ${
                  mapLegendExtendId === item.id ? 'mll-item-a' : ''
                }`}
                key={item.id}
                onClick={handelCheckLayer.bind(this, 'extend', item)}
              >
                <span>{item.name}</span>
                <div className="mll-item_line" />
              </div>
            ))}
          </div>
          <div className="map-layer-legend-basemap">
            {mapLayers.map((item) => (
              <div
                className={`mll-item ${
                  mapLayerId === item.id ? 'mll-item-a' : ''
                }`}
                key={item.id}
                onClick={handelCheckLayer.bind(this, 'basemap', item)}
              >
                <span>{item.name}</span>
                <div className="mll-item_line" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Map.darwPreview = darwPreview;
