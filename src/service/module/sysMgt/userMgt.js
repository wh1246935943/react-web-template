import request from '../../request';
import { sha256 } from 'js-sha256';
/**
 * 系统管理-人员管理
 */
export default {
  // 用户列表查询
  getUserlist(param) {
    return request('/army/pcweb/system/user/people', param);
  },
  // 新增用户
  addUser(param) {
    param.password = sha256(param.password);
    delete param.repassword;
    return request('/army/pcweb/system/user/people/info', param, 'POST');
  },
  // 用户详情
  getUserDetail(param) {
    return request(`/army/pcweb/system/user/people/${param.id}`);
  },
  // 修改用户
  updateUser(param) {
    return request(`/army/pcweb/system/user/people/${param.id}`, param, 'PUT');
  },
  // 删除用户
  deleteUser(param) {
    return request(`/army/pcweb/system/user/people/${param.id}`, 'DELETE');
  },
  // 修改密码
  updatePassword(param) {
    const { id } = param;
    param.password = sha256(param.password);
    delete param.repassword;
    return request(
      `/army/pcweb/system/user/people/${id}/password`,
      param,
      'PUT',
    );
  },
  // 修改状态
  userStatusChange(param) {
    return request(
      `/army/pcweb/system/user/people/${param.id}/user_status`,
      param,
      'PUT',
    );
  },
};
