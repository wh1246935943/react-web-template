let sessionId = '';

const users = {
  admin: {
    departmentId: '61e584da9a0f000064003364',
    departmentName: '遗产管理部',
    loginName: 'admin',
    nickName: 'admin',
    roleId: '621d78a408eb2575acdd10c2',
    roleName: '超级管理员',
    sessionId:
      '108eb018ea9b0bc277a963060167020a40e1b0a3b14a7f1fd339e1d1dd103367',
    userId: '61dee07a152b1f70be9f1c97',
    phone: '13999999999',
  },
  user: {
    departmentId: '61e584da9a0f000064003365',
    departmentName: '巡查组',
    loginName: 'user',
    nickName: '测试用户1',
    roleId: '621d78a408eb2575acdd10c3',
    roleName: '管理员',
    sessionId:
      '108eb018ea9b0bc277a963060167020a40e1b0a3b14a7f1fd339e1d1dd103368',
    userId: '61dee07a152b1f70be9f1c95',
    phone: '13888888888',
  },
};

const menuList = [
  {
    clientType: 'PCWEB',
    code: 'systemMgt',
    gmtCreated: '2022-05-26 10:03:52',
    id: '628ee008633491677949bda7',
    menuStatus: 'ENABLE',
    menuStatusDesc: '启用',
    menuType: 'MENU',
    name: '包含子菜单/多级菜单示例',
    order: 1,
    parentCode: '',
    resourcePath: '',
  },
  {
    clientType: 'PCWEB',
    code: 'systemUserMgt',
    gmtCreated: '2022-05-26 10:03:52',
    id: '628ee008633491677949bda8',
    menuStatus: 'ENABLE',
    menuStatusDesc: '启用',
    menuType: 'MENU',
    name: '二级菜单',
    order: 2,
    parentCode: 'systemMgt',
    resourcePath: '/system/user',
  },
  {
    clientType: 'PCWEB',
    code: 'systemUserPeopleMgt',
    gmtCreated: '2022-05-26 10:03:52',
    id: '628ee008633491677949bda9',
    menuStatus: 'ENABLE',
    menuStatusDesc: '启用',
    menuType: 'MENU',
    name: '三级菜单/列表页示例',
    order: 3,
    parentCode: 'systemUserMgt',
    resourcePath: '/system/user/people',
  },
  {
    clientType: 'PCWEB',
    code: 'patrolMgt',
    gmtCreated: '2022-05-26 10:03:52',
    id: '628ee008633491677949bdb2',
    menuStatus: 'ENABLE',
    menuStatusDesc: '启用',
    menuType: 'MENU',
    name: '没有子菜单示例',
    order: 5,
    parentCode: '',
    resourcePath: '',
  },
];

export default {
  //获取短信
  'POST /army/pcweb/support/smsCode': (req, res) => {
    setTimeout(() => {
      const is = Object.values(users).some(
        ({ phone }) => phone === req.body.phone,
      );
      if (!is) {
        res.status(403).json({ message: '手机号未注册' });
        return;
      }
      res.json('验证码已发送');
    }, 1000);
  },
  // 用户登出
  'POST /army/pcweb/system/user/logout': (req, res) => {
    res.json('');
  },
  // 用户登录
  'POST /army/pcweb/system/user/login': (req, res) => {
    const {
      body: { loginName },
      host,
    } = req;
    if (!['admin', 'user'].includes(loginName)) {
      res.status(401).json({ message: '用户名或密码错误' });
      return;
    }
    sessionId = users[loginName].sessionId;
    res.cookie('sessionId', sessionId, {
      domain: host,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.json(users[loginName]);
  },
  // 获取用户信息
  'GET /army/pcweb/system/user': (req, res) => {
    const { sessionId } = JSON.parse(req.get('TA-Client-Info') ?? '');
    const item = Object.values(users).find(
      (item) => item.sessionId === sessionId,
    );
    res.json(item);
  },
  // 获取菜单
  'GET /army/pcweb/system/menu': (req, res) => {
    res.json(menuList);
  },
  // 获取未读消息
  'GET /army/pcweb/system/notice': (req, res) => {
    res.json({
      body: [{}, {}],
      total: 2,
    });
  },
};
