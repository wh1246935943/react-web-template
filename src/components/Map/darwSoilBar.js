import { FwModal, FwTitleBar, FwIcon } from '@/components';

export const getBarColor = (d) => {
  const { propertyType, val } = d;
  const valNumber = Number(val ?? 0);
  const colors = {
    301001: () => {
      if (0 <= valNumber && valNumber < 5000) return ['#65FF00', '#47B200'];
      if (5000 <= valNumber && valNumber < 10000) return ['#01FFFF', '#00BCBD'];
      if (10000 <= valNumber && valNumber < 15000)
        return ['#FFD72F', '#B69922'];
      if (15000 <= valNumber && valNumber < 20000)
        return ['#DD3169', '#8D1F42'];
    },
    301004: () => {
      if (0 <= valNumber && valNumber < 25) return ['#65FF00', '#47B200'];
      if (25 <= valNumber && valNumber < 50) return ['#01FFFF', '#00BCBD'];
      if (50 <= valNumber && valNumber < 75) return ['#FFD72F', '#B69922'];
      if (75 <= valNumber && valNumber < 100) return ['#DD3169', '#8D1F42'];
    },
    301003: () => {
      if (0 <= valNumber && valNumber < 25) return ['#65FF00', '#47B200'];
      if (25 <= valNumber && valNumber < 50) return ['#01FFFF', '#00BCBD'];
      if (50 <= valNumber && valNumber < 75) return ['#FFD72F', '#B69922'];
      if (75 <= valNumber && valNumber < 100) return ['#DD3169', '#8D1F42'];
    },
    305003: () => {
      if (0 <= valNumber && valNumber < 1250) return ['#65FF00', '#47B200'];
      if (1250 <= valNumber && valNumber < 2500) return ['#01FFFF', '#00BCBD'];
      if (2500 <= valNumber && valNumber < 3750) return ['#FFD72F', '#B69922'];
      if (3750 <= valNumber && valNumber < 5000) return ['#DD3169', '#8D1F42'];
    },
  };

  if (colors[propertyType]) {
    return colors[propertyType].call();
  }

  return ['#65FF00', '#47B200'];
};

export const darwSoilBar = (item, scale, onMarkerClick) => {
  const soilBarMark = d3
    .select('g#marker')
    .data([item])
    .append('g')
    .attr('class', 'mark-item-group')
    .attr('g-bar-height', ({ id }) => id)
    .attr(
      'transform',
      `translate(${item.loc[0] * scale}, ${item.loc[1] * scale})`,
    );

  const { collectDataDetailVOS = [], barItemList = {} } = item;

  collectDataDetailVOS.forEach((item) => {
    if (barItemList[item.propertyType]) {
      barItemList[item.propertyType].push(item);
    } else {
      barItemList[item.propertyType] = [item];
    }
  });

  const soilBarMarkItem = soilBarMark.append('g');

  Object.values(barItemList).forEach((list, listIndex) => {
    list.forEach((item, itemIndex) => {
      soilBarMarkItem
        .append('polygon')
        .attr('points', '5,0 0,5 0,60 10,60 15,55 15,0')
        .attr('soilicon_baritem', 'item')
        .attr('fill', () => getBarColor(item)[1])
        .style('z-index', list.length - itemIndex)
        .attr(
          'transform',
          `translate(${16 * listIndex}, ${-57 * (itemIndex + 1)})`,
        );
      soilBarMarkItem
        .append('rect')
        .attr('x', -1)
        .attr('y', 5)
        .attr('width', 10)
        .attr('height', 55)
        .attr('fill', () => getBarColor(item)[0])
        .style('z-index', list.length - itemIndex)
        .attr(
          'transform',
          `translate(${16 * listIndex}, ${-57 * (itemIndex + 1)})`,
        );
    });
    soilBarMarkItem
      .append('image')
      .attr('x', 16 * listIndex)
      .attr('y', -57 * list.length - 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('href', list[0]?.sensorPropertyTypeUrl);
  });

  const { width, height } = document
    .querySelector(`g[g-bar-height="${item.id}"]`)
    .getBBox();

  soilBarMark
    .append('rect')
    .attr('x', -1)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height - 26)
    .attr('fill', 'rgba(0,0,0,0)')
    .attr('transform', `translate(0, -${height - 26})`)
    .on('mouseenter', () => creatInfoBox(item, scale, 'creact'))
    .on('mouseout', () => creatInfoBox(item, scale, 'clear'))
    .on('mouseup', () => {
      FwModal.closeModal(`soliInfo${item.id}`);
      onMarkerClick(item);
    });
};

function creatInfoBox(item = {}, scale, action) {
  if (action === 'clear' && item.id) {
    FwModal.closeModal(`soliInfo${item.id}`);
    return;
  }

  FwModal.closeModal(`soliInfo${item.id}`);

  const { collectDataDetailVOS = [], contentList = {} } = item;

  collectDataDetailVOS.forEach((row) => {
    if (contentList[row.senId]) {
      contentList[row.senId].push(row);
    } else {
      contentList[row.senId] = [row];
    }
  });

  const senIds = Object.keys(contentList);

  let { clientX, clientY } = window.event;

  if (!senIds?.length) return;

  FwModal.show({
    content: (
      <div>
        {senIds.map((senId) => (
          <div key={senId}>
            <FwTitleBar
              isFull
              title={contentList[senId][0].gmtCreated}
              value={contentList[senId][0].sensorPropertyName}
            />
            <div class="soildata-content-rowItem">
              {contentList[senId].map((rowItem) => (
                <div key={rowItem.sensorPropertyType}>
                  <FwIcon src={rowItem.sensorPropertyTypeUrl} />
                  {rowItem.val}
                  {rowItem.sensorPropertyUnit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    width: '350px',
    fwModalId: `soliInfo${item.id}`,
    footer: null,
    mask: false,
    closable: false,
    wrapClassName: 'mapSoil-ant-modal-wrap',
    style: {
      top: `${clientY + 10}px`,
      left: `${clientX + 10}px`,
      position: 'absolute',
    },
    bodyStyle: {
      padding: '5px',
    },
  });
}
