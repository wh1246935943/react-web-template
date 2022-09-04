/**
 * 在生产环境 代理是不生效的
 */
const { DEV_TARGET_KEY = 'test' } = process.env;

const ips: { [key: string]: string } = {
  test: 'http://192.168.0.150:9001', // 测试
  pro: 'http://101.201.31.34:9001', // 正式
  pre: 'http://101.201.103.194', // 预发
};

const target = ips[DEV_TARGET_KEY];

export default {
  '/army': {
    target,
    changeOrigin: true,
    secure: false,
    // 查看代理请求详情日志
    logLevel: 'debug',
    /**
     * 做一些代理的返回后的前置处理逻辑
     * 比如修改cookies信息等等
     */
    // onProxyRes: (proxyRes: any, req: any, res: any) => {
    //   TODO
    // },
  },
};
