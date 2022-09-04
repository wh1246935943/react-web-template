const files = require.context('./assets/map/mark_icon', false, /\.png|.gif$/);

const filesMap = {};
files.keys().forEach((key) => {
  filesMap[key.replace(/\.\w+$/, '').replace('./', '')] = files(key);
});

const extendIcon = {};

Object.assign(filesMap, extendIcon);

export function getIcon({ type, status, deviceStatus, switchStatus }) {
  let icon = filesMap[`${type}_${status}`.replace(/^_+|_+$|(?<=_)_+/g, '')];

  if (!icon) icon = filesMap[type];

  return {
    icon,
    width: 70,
    height: 84,
    offsetX: -35,
    offsetY: -110,
    tmpOffsetY: -16,
  };
}
