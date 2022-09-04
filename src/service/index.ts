const files = require.context('./module', true, /\.ts|\.js$/);

const service: any = {};

files.keys().forEach((key: string) => {
  const fileName = key.replace(/(\.\/|\.ts|\.js)/g, '');

  if (fileName.includes('/')) {
    const moduleNames = fileName.split('/');

    function setValue(name: string, index: number, obj: any) {
      const is = index === moduleNames.length - 1;

      if (is) {
        obj[name] = files(key).default;
        return;
      }

      if (!obj[name]) {
        obj[name] = {};
      }

      if (!is) {
        setValue(moduleNames[index + 1], index + 1, obj[name]);
      }
    }

    const [initObj, initName] = [service[moduleNames[0]], moduleNames[0]];

    if (!initObj) {
      service[initName] = {};
    }

    setValue(moduleNames[1], 1, service[initName]);
  } else {
    service[fileName] = files(key).default;
  }
});

export default service;
