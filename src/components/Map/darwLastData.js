import { getBarColor } from './darwSoilBar.js';
import { getLocByType } from './standardIcon';

import left_bottom from './assets/map/left_bottom.png';
import left_top from './assets/map/left_top.png';

export const darwLastData = (item, scale, onMarkerClick) => {
  const {
    lastData = [],
    title,
    id,
    loc,
    lastUploadTime,
    deviceNodeType,
    ipcLastImage,
  } = item;

  const lastDataMark = d3
    .select('g#marker')
    .data([item])
    .append('g')
    .attr('class', 'mark-item-group')
    .attr('last-data-mark', id)
    .attr('id', id);

  const renderContent = (rData, rType, completeData = false) => {
    const markTitle = lastDataMark.append('g').attr('last-data-mark-title', id);
    const markContent = lastDataMark
      .append('g')
      .attr('last-data-mark-content', id)
      .attr('transform', `translate(0, 2)`);

    markTitle
      .append('text')
      .attr('last-data-mark-title-id', id)
      .attr('x', 0)
      .attr('y', 1)
      .attr('fill', '#00D2D4')
      .attr('font-size', 18)
      .text(title);
    markTitle
      .append('text')
      .attr('lastdata-time-id', id)
      .attr('x', () => {
        const width = d3
          .select(`text[last-data-mark-title-id="${id}"]`)
          .node()
          .getComputedTextLength();
        return width + 30;
      })
      .attr('y', 1)
      .attr('fill', '#00D2D4')
      .attr('font-size', 18)
      .text(lastUploadTime);

    if (rType === 'image') {
      if (rData) {
        let { width } = document
          .querySelector(`g[last-data-mark-title="${id}"]`)
          .getBBox();
        markContent
          .append('image')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', 120)
          .attr('href', rData)
          .attr('transform', `translate(0, 10)`);
      } else {
        markContent
          .append('text')
          .attr('x', 0)
          .attr('y', 30)
          .attr('fill', '#ffffff4d')
          .attr('font-size', 16)
          .text(`暂无最新数据。。。`);
      }
      return;
    }

    if (lastData?.length) {
      lastData.forEach((preItem, index) => {
        if (index > 3 && !completeData) return;
        markContent
          .append('text')
          .attr('last-data-mark-content-item', id + preItem.sensorPropertyName)
          .attr('x', 0)
          .attr('y', (index + 1) * (index === 0 ? 23 : 20))
          .attr('fill', '#ffffff')
          .attr('font-size', 16)
          .text(`${preItem.sensorPropertyName}:`);

        if (index === 3 && !completeData) {
          markContent
            .append('text')
            .attr(
              'last-data-mark-content-item',
              id + preItem.sensorPropertyName + 'more',
            )
            .attr('x', 0)
            .attr('y', (index + 2) * 20)
            .attr('fill', '#ffffff')
            .attr('font-size', 16)
            .text('。。。');
        }

        markContent
          .append('text')
          .attr('x', () => {
            const width = d3
              .select(
                `text[last-data-mark-content-item="${
                  id + preItem.sensorPropertyName
                }"]`,
              )
              .node()
              .getComputedTextLength();
            return width + 10;
          })
          .attr('y', (index + 1) * (index === 0 ? 23 : 20))
          .attr('fill', getBarColor(preItem)[0])
          .attr('font-size', 18)
          .text(`${preItem.val}${preItem.sensorPropertyUnit}`);
      });
    } else {
      markContent
        .append('text')
        .attr('x', 0)
        .attr('y', 30)
        .attr('fill', '#ffffff4d')
        .attr('font-size', 16)
        .text(`暂无最新数据。。。`);
    }
  };

  const renderMarkBg = (reGetLoc) => {
    let {
      width,
      height,
      baseCut = 10,
    } = document.querySelector(`g[last-data-mark="${id}"]`).getBBox();
    width += 15;
    height += 15;
    const [baseW, baseH] = [width - baseCut, height - baseCut];

    const lastDataMarkBg = lastDataMark
      .append('g')
      .attr('transform', `translate(-7.5, 0)`);

    lastDataMarkBg
      .append('polygon')
      .attr(
        'points',
        `
          ${baseCut},0
          ${baseW},0
          ${width},${baseCut}
          ${width},${baseH}
          ${baseW},${height}
          ${baseCut},${height}
          0,${baseH}
          0,${baseCut}
        `,
      )
      .attr('stroke', 'url(#youngtoblue)')
      .attr('stroke-width', 3)
      .attr('last-data-mark-bg', id)
      .attr('fill', '#012F6B')
      .attr('transform', `translate(0, -16)`);
    lastDataMarkBg
      .append('polygon')
      .attr(
        'points',
        `
          0,0
          ${baseW - 3},0
          ${width - 4},${baseCut}
          ${width - 4},20
          0,20
        `,
      )
      .attr('fill', '#01132B')
      .attr('transform', `translate(2, -15)`);
    lastDataMarkBg
      .append('polyline')
      .attr(
        'points',
        `
          ${baseW},-25
          ${width + 5},-${baseCut}
          ${width + 5},${baseH - 15}
          ${baseW},${height - 8}
        `,
      )
      .attr('stroke', '#019FFC')
      .attr('stroke-width', 2)
      .attr('last-data-mark-polyline', id)
      .attr('fill', '#012F6B00');
    lastDataMarkBg
      .append('image')
      .attr('x', -5)
      .attr('y', -20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('href', left_top);
    lastDataMarkBg
      .append('image')
      .attr('x', -10)
      .attr('y', height - 30)
      .attr('width', 50)
      .attr('height', 30)
      .attr('href', left_bottom);

    if (reGetLoc) {
      const activeNode = document.querySelector(`g[last-data-mark="${id}"]`);

      let { width, height } = document
        .querySelector(`g[last-data-mark="${id}"]`)
        .getBBox();

      const [x, y] = getLocByType(activeNode, item, document.fwSvgscale);

      lastDataMark.attr(
        'transform',
        `translate(${x - width / 2 + 10}, ${y - height})`,
      );

      return;
    }

    lastDataMark.attr(
      'transform',
      `translate(${loc[0] * scale - width / 2}, ${
        loc[1] * scale - height - 30
      })`,
    );
  };

  const renderMouseEvent = () => {
    let { width, height } = document
      .querySelector(`g[last-data-mark="${id}"]`)
      .getBBox();
    lastDataMark
      .append('rect')
      .attr('x', -10)
      .attr('y', -15)
      .attr('width', width - 10)
      .attr('height', height - 10)
      .attr('fill', '#ffffff00')
      .on('mouseenter', () => openCompleteData('open'))
      .on('mouseout', () => openCompleteData('close'));
  };

  if (deviceNodeType === 'DEVICE') {
    renderContent(lastData, 'biaozhun');
  }

  if (deviceNodeType === 'IPC_DEVICE') {
    renderContent(ipcLastImage, 'image');
  }

  renderMarkBg();

  if (deviceNodeType === 'DEVICE') {
    renderContent(lastData, 'biaozhun');
  }

  if (deviceNodeType === 'IPC_DEVICE') {
    renderContent(ipcLastImage, 'image');
  }

  renderMouseEvent();

  let opened = false;
  const openCompleteData = (type) => {
    if (
      deviceNodeType === 'DEVICE' &&
      type === 'open' &&
      lastData.length > 3 &&
      !opened
    ) {
      opened = true;
      d3.selectAll('g#marker')
        .selectAll(`g[last-data-mark="${id}"] *`)
        .remove();
      renderContent(lastData, 'biaozhun', true);
      renderMarkBg(true);
      renderContent(lastData, 'biaozhun', true);

      renderMouseEvent();
    }
    if (
      deviceNodeType === 'DEVICE' &&
      type === 'close' &&
      lastData.length > 3
    ) {
      opened = false;
      d3.selectAll('g#marker')
        .selectAll(`g[last-data-mark="${id}"] *`)
        .remove();
      renderContent(lastData, 'biaozhun', false);
      renderMarkBg(true);
      renderContent(lastData, 'biaozhun', false);

      renderMouseEvent();
    }

    const nodeList = [
      document.querySelector(`ellipse[center-circle="${id}"]`),
      document.querySelector(`ellipse[out-circle="${id}"]`),
      document.querySelector(`polygon[center-bar="${id}"]`),
      document.querySelector(`g[last-data-mark="${id}"]`),
    ];
    nodeList.forEach((element) => {
      element.remove();
      document.querySelector('#marker').appendChild(element);
    });
  };
};
