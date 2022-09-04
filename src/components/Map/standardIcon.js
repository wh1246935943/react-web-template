import { getIcon } from './icon';
import { getIconStatusColor } from './locConfig';
import { darwSoilBar } from './darwSoilBar.js';
import { darwLastData } from './darwLastData.js';
const titleBg = require('./assets/title_bg.svg');

export function drawMark(markers = [], scale, onMarkerClick) {
  d3.selectAll('g#marker').selectAll('image').remove();

  d3.selectAll('g#marker').selectAll('g.mark-item-group').remove();

  d3.selectAll('g#marker').selectAll('text.mark-title').remove();

  markers.forEach((item) => {
    if (item.type === 'SOIL_DATA') {
      darwSoilBar(item, scale, onMarkerClick);
    }
    if (item.type === 'LAST_DATA') {
      darwLastData(item, scale, onMarkerClick);
    }
  });

  return d3
    .selectAll('g#marker')
    .selectAll('image')
    .data(markers)
    .enter()
    .append('image')
    .attr('x', (d) => getLocByType('image', d, scale)[0])
    .attr('y', (d) => getLocByType('image', d, scale)[1])
    .attr('href', (d) => getIcon(d).icon)
    .attr('width', (d) => getIcon(d).width)
    .attr('height', (d) => getIcon(d).height)
    .attr(
      'transform',
      (d) => `translate(${getIcon(d).offsetX},${getIcon(d).offsetY})`,
    );
}

export function drawTitle(markers = [], scale) {
  d3.selectAll('g#marker').selectAll('text').remove();

  d3.selectAll('g#marker').selectAll('image[data-title]').remove();

  const title = d3
    .selectAll('g#marker')
    .selectAll('text')
    .data(markers)
    .enter()
    .append('text')
    .attr('data-id', (d) => d?.id ?? '')
    .attr('class', 'mark-title')
    .attr('x', (d) => getLocByType('text', d, scale)[0])
    .attr('y', (d) => getLocByType('text', d, scale)[1])
    .attr('fill', '#0ff')
    .text((d) => d.title)
    .attr('font-size', 16)
    .attr('transform', function (d) {
      const icon = getIcon(d);
      const width = this.getComputedTextLength();
      return `translate(${
        icon.offsetX - (width - icon.width) / 2
      },${icon.offsetY - 25})`;
    });

  d3.selectAll('g#marker')
    .selectAll('image[data-title]')
    .data(markers)
    .enter()
    .insert('image', (d) => d3.select(`text[data-id="${d?.id}"]`).node())
    .attr('x', (d) => getLocByType('text', d, scale)[0])
    .attr('y', (d) => getLocByType('text', d, scale)[1])
    .attr('href', titleBg)
    .attr('data-titleid', (d) => d?.id ?? '')
    .attr('width', function (d) {
      return (
        d3.select(`text[data-id="${d?.id}"]`).node().getComputedTextLength() +
        60
      );
    })
    .attr('height', 55)
    .attr('preserveAspectRatio', 'none')
    .attr('data-title', (d) => d?.id ?? '')
    .attr('transform', function (d) {
      const icon = getIcon(d);
      const width = d3
        .select(`text[data-id="${d?.id}"]`)
        .node()
        .getComputedTextLength();
      return `translate(${
        icon.offsetX - (width - icon.width) / 2 - 30
      },${icon.offsetY - 56})`;
    });

  return title;
}

export function drawStatus(markers = [], scale, selectMarkId = 'none') {
  d3.selectAll('g#marker').selectAll('ellipse[out-circle]').remove();

  d3.selectAll('g#marker').selectAll('ellipse[out-circle_select]').remove();

  d3.selectAll('g#marker').selectAll('ellipse[center-circle]').remove();

  d3.selectAll('g#marker').selectAll('polygon[center-bar]').remove();

  const statusIcon = d3
    .selectAll('g#marker')
    .selectAll('ellipse[out-circle]')
    .data(markers)
    .enter()
    .append('ellipse')
    .attr('out-circle', (d) => d?.id ?? '')
    .attr('cx', (d) => getLocByType('ellipse', d, scale)[0])
    .attr('cy', (d) => getLocByType('ellipse', d, scale)[1])
    .attr('rx', '30')
    .attr('ry', '15')
    .attr('stroke', (d) => getIconStatusColor(d))
    .attr('stroke-width', '3')
    .attr('fill', '#00000000')
    .style('filter', 'blur(2px)');

  d3.selectAll('g#marker')
    .selectAll('ellipse[center-circle]')
    .data(markers)
    .enter()
    .append('ellipse')
    .attr('center-circle', (d) => d?.id ?? '')
    .attr('cx', (d) => getLocByType('ellipse', d, scale)[0])
    .attr('cy', (d) => getLocByType('ellipse', d, scale)[1])
    .attr('rx', '15')
    .attr('ry', '7')
    .style('filter', 'blur(2px)')
    .attr('fill', (d) => getIconStatusColor(d));

  d3.selectAll('g#marker')
    .selectAll('polygon[center-bar]')
    .data(markers)
    .enter()
    .append('polygon')
    .attr('center-bar', (d) => d?.id ?? '')
    .attr('points', (d) => {
      const [x, y] = getLocByType('ellipse', d, scale);
      return `${x},${y + 50} ${x + 15},${y + 50} ${x + 15},${y} ${x}, ${y}`;
    })
    .attr('fill', (d) => `url(#${getIconStatusColor(d, 'status')})`)
    .attr('transform', 'translate(-7.5, -50)');

  const filterList = markers.filter(({ id }) => id === selectMarkId);
  if (filterList?.length) {
    d3.selectAll('g#marker')
      .selectAll('ellipse[out-circle_select]')
      .data(filterList)
      .enter()
      .append('ellipse')
      .attr('out-circle_select', ({ id }) => id)
      .attr('cx', (d) => getLocByType('ellipse', d, scale)[0])
      .attr('cy', (d) => getLocByType('ellipse', d, scale)[1])
      .attr('rx', '40')
      .attr('ry', '20')
      .attr('fill', (d) => getIconStatusColor(d))
      .style('filter', 'blur(2px)')
      .style('transform-origin', (d) => {
        const [x, y] = getLocByType('ellipse', d, scale);
        return `${x}px ${y}px`;
      });
  }

  return statusIcon;
}

export function drawTmpMark(markers = []) {
  d3.selectAll('g#tmpMarker').selectAll('image').remove();

  return d3
    .selectAll('g#tmpMarker')
    .selectAll('image')
    .data(markers)
    .enter()
    .append('image')
    .attr('x', (d, i) => {
      let distant = 20;

      for (let n = 1; n <= i; n++) {
        distant += 40 + getIcon(markers[n - 1]).width;
      }

      return distant;
    })
    .attr('y', 0)
    .attr('href', (d) => getIcon(d).icon)
    .attr('width', (d) => getIcon(d).width)
    .attr('height', (d) => getIcon(d).height)
    .attr(
      'transform',
      (d) =>
        `translate(${getIcon(d).offsetX / 2},${getIcon(d).tmpOffsetY + 10})`,
    );
}

export function drawTmpText(markers = []) {
  d3.selectAll('g#tmpMarker').selectAll('text').remove();

  d3.selectAll('g#tmpMarker').selectAll('rect').remove();

  d3.selectAll('g#tmpMarker')
    .selectAll('rect')
    .data(markers)
    .enter()
    .append('rect')
    .attr('data-id', (d) => d?.id ?? '')
    .attr('x', (d, i) => {
      let distant = 20;

      for (let n = 1; n <= i; n++) {
        distant += 40 + getIcon(markers[n - 1]).width;
      }

      return distant;
    })
    .attr('y', (d) => 0)
    .attr('width', 30)
    .attr('height', 80)
    .text((d) => d.title)
    .attr('transform', function (d) {
      const icon = getIcon(d);
      return `translate(${icon.width - 10},0)`;
    });

  return d3
    .selectAll('g#tmpMarker')
    .selectAll('text')
    .data(markers)
    .enter()
    .append('text')
    .attr('data-id', (d) => d?.id ?? '')
    .attr('x', (d, i) => {
      let distant = 20;

      for (let n = 1; n <= i; n++) {
        distant += 40 + getIcon(markers[n - 1]).width;
      }

      return distant;
    })
    .attr('y', (d) => 0)
    .text((d) => {
      const t = d.title.split('');
      t.length = 4;
      return t.join('');
    })
    .attr('transform', function (d) {
      const icon = getIcon(d);
      const width = this.getComputedTextLength();
      return `translate(${icon.width + 5},${(70 - width) / 2})`;
    })
    .attr('style', 'writing-mode: vertical-lr;')
    .append('title')
    .text((d) => d.title);
}

export function dyeBlickById(id, opacity) {
  d3.select(`path[data-id="${id}"]`).attr('style', `opacity:${opacity};`);
}

export function getLocByType(type, d, scale = 1) {
  if (type === 'text') {
    return [d.loc[0] * scale, d.loc[1] * scale];
  }

  if (type === 'ellipse') {
    return [
      d.loc[0] * scale,
      d.loc[1] * scale, //+ getIcon(d).offsetY * -1,
    ];
  }

  return [d.loc[0] * scale, d.loc[1] * scale];
}

export function drawSwitch(markers = [], scale, onSwitchClick) {
  d3.selectAll('g#marker').selectAll('rect[data-switch]').remove();

  d3.selectAll('g#marker').selectAll('rect[data-switch_slider]').remove();

  d3.selectAll('g#marker').selectAll('text[data-switch_text]').remove();

  const switchIcon = d3
    .selectAll('g#marker')
    .selectAll('rect[data-switch]')
    .data(markers)
    .enter()
    .append('rect')
    .on('click', (d) => {
      if (!d.controlable) return;
      onSwitchClick(d);
    })
    .attr('x', (d) => getLocByType('text', d, scale)[0])
    .attr('y', (d) => getLocByType('text', d, scale)[1])
    .attr('width', 40)
    .attr('height', 20)
    .attr('stroke', '#00FDFD')
    .attr('stroke-width', 2)
    .attr('cursor', ({ controlable }) => {
      return controlable ? 'pointer' : 'no-drop';
    })
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('data-switch', (d) => d?.id ?? '')
    .attr('fill', '#002B66')
    .attr('transform', function (d) {
      const icon = getIcon(d);
      const width = d3
        .select(`text[data-id="${d?.id}"]`)
        .node()
        .getComputedTextLength();
      return `translate(${
        icon.offsetX - (width - icon.width) / 2 - 65
      },${icon.offsetY - 45})`;
    });

  d3.selectAll('g#marker')
    .selectAll('rect[data-switch_slider]')
    .data(markers)
    .enter()
    .append('rect')
    .attr('x', (d) => getLocByType('text', d, scale)[0])
    .attr('y', (d) => getLocByType('text', d, scale)[1])
    .attr('width', 23)
    .attr('height', 16)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('fill', ({ switchStatus, deviceStatus, keepAliveStatus }) => {
      if (deviceStatus === 'OFFLINE') return '#757575';

      // if (['DISABLE_PENDING', 'ENABLE_PENDING'].includes(keepAliveStatus)) return '#757575';

      return switchStatus === 'DISABLED' ? '#00FDFD' : '#1BF11F';
    })
    .attr('data-switch_slider', (d) => d?.id ?? '')
    .attr('pointer-events', 'none')
    .attr('transform', function (d) {
      const icon = getIcon(d);

      const width = d3
        .select(`text[data-id="${d?.id}"]`)
        .node()
        .getComputedTextLength();

      let x = icon.offsetX - (width - icon.width) / 2 - 50;
      if (d.switchStatus === 'ENABLED') x -= 13;

      const y = icon.offsetY - 43;

      return `translate(${x},${y})`;
    });

  d3.selectAll('g#marker')
    .selectAll('text[data-switch_text]')
    .data(markers)
    .enter()
    .append('text')
    .attr('x', (d) => getLocByType('text', d, scale)[0])
    .attr('y', (d) => getLocByType('text', d, scale)[1])
    .attr('font-size', 11)
    .attr('fill', '#ffffff')
    .attr('pointer-events', 'none')
    .text(({ switchStatus }) => (switchStatus === 'DISABLED' ? 'OFF' : 'ON'))
    .attr('transform', function (d) {
      const icon = getIcon(d);

      const width = d3
        .select(`text[data-id="${d?.id}"]`)
        .node()
        .getComputedTextLength();

      let x = icon.offsetX - (width - icon.width) / 2 - 48;
      if (d.switchStatus === 'ENABLED') x -= 13;

      const y = icon.offsetY - 31;

      return `translate(${x},${y})`;
    });

  return switchIcon;
}
