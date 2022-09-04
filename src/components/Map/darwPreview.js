let files;

try {
  files = require.context('./assets/map/preview_icon', false, /\.jpg|.gif$/);
} catch (error) {}

const filesMap = {};
files?.keys()?.forEach?.((key) => {
  filesMap[key.replace(/\.\w+$/, '').replace('./', '')] = files(key);
});

export function darwPreview(
  valveType,
  switchStatus = 'DISABLED',
  onSwitchClick,
) {
  if (!valveType || !filesMap[`${valveType}_${switchStatus}`]) return;

  const svg = d3.selectAll('svg');

  svg
    .append('rect')
    .attr('map-preview-rect', 'mappreviewrect')
    .attr('x', 290)
    .attr('y', 20)
    .attr('width', 300)
    .attr('height', 240)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('stroke', '#B5EDFD')
    .attr('stroke-width', 4);

  svg
    .append('image')
    .attr('map-preview-img', 'mappreviewimg')
    .attr('x', 291)
    .attr('y', 21)
    .attr('width', 298)
    .attr('height', 238)
    .attr('href', filesMap[`${valveType}_${switchStatus}`]);

  svg
    .append('circle')
    .text('x')
    .attr('map-preview-close-circle', 'mappreviewclose')
    .attr('cx', 591)
    .attr('cy', 21)
    .attr('r', 10)
    .attr('stroke', '#B5EDFD')
    .attr('stroke-width', 2)
    .attr('fill', '#B5EDFD')
    .on('click', (d) => {
      closePreview();
    });

  svg
    .append('text')
    .text('x')
    .attr('pointer-events', 'none')
    .attr('map-preview-close-text', 'mappreviewclose')
    .attr('x', 587)
    .attr('y', 25)
    .attr('font-size', 20)
    .attr('fill', 'red');
}

export function closePreview() {
  const svg = d3.selectAll('svg');

  svg.selectAll('image[map-preview-img]').remove();

  svg.selectAll('rect[map-preview-rect]').remove();

  svg.selectAll('text[map-preview-close-text]').remove();

  svg.selectAll('circle[map-preview-close-circle]').remove();

  return svg;
}
