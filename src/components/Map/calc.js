import turf from 'turf';
import booleanContains from '@turf/boolean-contains';

/**
 * path 线转坐标串
 * @param {*} str
 */
function lineParse(svg) {
  const coordinates = [];

  const count = svg.getTotalLength();
  const distance = 5;
  let i = 0;

  const xy = svg.getPointAtLength(i);
  coordinates.push([xy.x, xy.y]);

  while (i < count) {
    i += distance;
    const xy = svg.getPointAtLength(i);
    coordinates.push([xy.x, xy.y]);
  }

  const last = coordinates.pop();
  coordinates.push(last);

  if (coordinates[0].join('') !== last.join('')) {
    coordinates.push(coordinates[0]);
  }

  return coordinates;
}

/**
 * 判断点是否在多边形内
 * @param {*} lonlat
 * @param {*} lineStr
 */
export function isPointInPolygon(lonlat, svgPath) {
  console.log(turf);
  const point = turf.point(lonlat);
  const polygon = turf.polygon([lineParse(svgPath)]);

  return booleanContains(polygon, point);
}
