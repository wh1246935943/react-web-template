export default (api) => {
  api.addHTMLHeadScripts(() => {
    return [
      {
        type: 'text/javascript',
        src: 'https://webapi.amap.com/maps?v=1.4.9&key=91022c1a37a18576859efda6b541c2fa',
      },
    ];
  });
};
