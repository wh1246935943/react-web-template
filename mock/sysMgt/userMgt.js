// 人员管理
const item = {
  departmentId: '61e584da9a0f000064003364',
  departmentName: '管理部',
  gmtCreated: '2022-05-30 00:15:46',
  id: '62939c32d31dbc3eded23d8e',
  loginName: 'smstest',
  nickName: '测试',
  phone: '18211368673',
  roleId: '62939d0ed31dbc3eded23d94',
  roleName: '短信模板审核权限',
  userStatus: 'ENABLE',
};

const list = [];

for (let index = 0; index < 200; index++) {
  const o = { ...item };
  o.id = `${o.id}${index}`;
  o.loginName = `${o.loginName}${index}`;
  o.nickName = `${o.nickName}${index}`;
  o.departmentName = index % 2 === 0 ? '管理部' : '跑腿部';
  o.role = index % 2 === 0 ? '院长' : '主任';
  o.phone = `${o.phone}${index}`;
  o.userStatus = index % 3 === 0 ? 'ENABLE' : 'DISABLE';
  list.push(o);
}

export default {
  'GET /army/pcweb/system/user/people': (req, res) => {
    const { key, department } = req.query;
    let ls = list;
    const { length } = ls;
    res.json({
      body: ls,
      total: length,
    });
  },
};
