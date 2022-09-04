/**
 * 项目公共的基础配置
 * 该文件内容将会在程序初始化时挂在到window.fwProjectConfig属性上
 * 请直接使用fwProjectConfig[name]使用
 */
export default {
  // 项目名称，在示例中展示在左上角位置
  projectName: '一个基于umi、react、antd的web项目基座',
  // 项目logo，同上
  logo: require('../src/assets/logo.png'),
  // 默认的网络请求错误提示
  errorMsg: '未知错误',
  // 登录页面的pathname
  LOGIN_PATHNAME: '/login',
  /**
   * 退出登录时，是否己住当前所在页面的路径
   * 这将在重新登录后再次进入记录的页面中
   */
  rememberCurrentPath: true,
  /**
   * 开启所有请求都不需要前端做认证参数校验
   */
  noCertificationRequiredAll: false,
  /**
   * 无需认证信息的api（如sessionId/token）
   * 这里配置的api，将会在前端发起请求做参数校验时忽略
   *
   * 注意：请始终将登录登出的api放置再下面列表的第一第二位！！！
   *
   * 登录请求是不需要认证信息，所以在任何情况下请始终将登录的api放在下面列表的第一位
   * 一般而言退出登录请求也不是必须要认证信息的，如果有前端会带上，没有则默认不做强制要求，
   *   对于前端而言，退出登录的网络请求成功与否，前端都会清理本地的认证信息，跳转到登录页面
   *   所以请始终将登出接口的api放在下面数组的第二位
   *   如果强制必须网络请求成功后才跳转前端页面，请将awaitLogoutSuccess设置为true
   */
  noCertificationRequiredApis: [
    '/army/pcweb/system/user/login',
    '/army/pcweb/system/user/logout',
    '/army/pcweb/support/smsCode',
    '/army/pcweb/system/user/forget_password',
  ],
  /**
   * 请求完成后的默认提示信息
   */
  defaultMsg: {
    POST: '操作成功',
    DELETE: '删除成功',
    PUT: '修改成功',
    GET: '',
  },
};
