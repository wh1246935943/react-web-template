export const defaultColor = [
  '#1eff00',
  '#ff5900',
  '#ff8c00',
  '#ffc800',
  '#fff700',
  '#b7ff00',
  '#88ff00',
  '#04ff00',
  '#00ff80',
  '#002fff',
  '#7700ff',
  '#aa00ff',
  '#d500ff',
  '#ff00ee',
  '#00ddff',
  '#ff758f',
  '#ff9c75',
  '#ff75a6',
  '#82ff75',
  '#001eff',
];

export const getIconStatusColor = (item, dataType) => {
  let status = item.status,
    type = item.type,
    deviceStatus = item.type;

  const special = [
    'ENHANSE_LIGHT_ENGINE',
    'CURTAIN_ROLLER',
    'SPRAY_IRRIGATION',
    'FAN',
    'OSMOISS_ROLLER',
  ];
  if (special.includes(type)) {
    if (
      ['DISABLED', 'ENABLE_FAILED', 'ENABLE_PENDING', 'OFFLINE'].includes(
        status,
      )
    ) {
      status = 'OFFLINE';
    } else {
      status = 'ONLINE';
    }
  }

  if (dataType === 'status') {
    if (type === 'VALVE' && deviceStatus === 'OFFLINE') {
      return 'OFFLINE';
    }
    return status;
  }

  const colors = {
    ONLINE: '#3abffd',
    DISABLED: '#3abffd',
    FULL_OF_WATER: '#3abffd',

    ENABLED: '#3abffd',

    OFFLINE: '#fd605f',
    ANHYDROUS: '#fd605f',

    default: '#00ffea',
    DISABLE_PENDING: '#00ffea',

    ENABLE_PENDING: '#ffff01',
    HALF_WATER: '#ffff01',
  };

  return colors[status];
};
