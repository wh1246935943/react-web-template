import request, { Payload } from '../request';
import { sha256 } from 'js-sha256';

interface MenuParam {}

export interface LoginParam {
  loginName: string;
  loginPwd: string;
  _isMsg: boolean;
  _loading: boolean;
  _backErrorData: boolean;
  _msg: string;
}

interface UploadFileParam extends Payload {
  files: File[];
}

export default {
  /**
   * 登录
   */
  login(param: LoginParam): Promise<any> {
    let path = '/army/pcweb/system/user/smsCode';

    if (param.loginPwd) {
      param.loginPwd = sha256(param.loginPwd);
      path = '/army/pcweb/system/user/login';
    }

    return request(path, param, 'POST');
  },
  /**
   * 退出登录
   */
  logout(): Promise<any> {
    return request(
      `/army/pcweb/system/user/logout`,
      {
        _isMsg: false,
        _loading: false,
      },
      'POST',
    );
  },
  /**
   * 获取菜单
   */
  getMenus(params: MenuParam): Promise<any> {
    return request('/army/pcweb/system/menu', params);
  },

  /**
   * 获取部门列表
   */
  getDepartlist() {
    return request('/army/pcweb/system/department', { _isList: true });
  },

  /**
   * 获取用户详情
   */
  getUserInfo() {
    return request(`/army/pcweb/system/user`);
  },

  /**
   * 获取角色列表
   */
  getRoleslist(param: any = {}, module: string) {
    const paths: any = {
      sysMgt: '/army/pcweb/system/user/role',
      patrol: '/army/pcweb/patrol/role',
    };

    const path = paths[module];

    if (!path) {
      alert('service.commom.getRoleslist方法的api归属模块参数不能为空');
      return;
    }

    return request(
      paths[module],
      Object.assign(
        {
          pageSize: 20,
          pageNumber: 1,
          _isPaging: true,
        },
        param,
      ),
    );
  },
  /**
   * 获取验证码
   */
  getVerificationCode(param: any = {}) {
    return request('/army/pcweb/support/smsCode', param, 'POST');
  },

  /**
   * 修改密码
   */
  reSetPwd(param: any) {
    param.password = sha256(param.password);
    delete param.confirmPwd;
    return request('/army/pcweb/system/user/forget_password', param, 'PUT');
  },

  /**
   * 文件上传
   * 非特殊情况不要使用该方法
   * 确保正常使用下面的 uploadFile
   */
  UNSAFE_uploadFile(param: any = {}): Promise<any> {
    return request(`/army/pcweb/support/file`, param, 'POST');
  },
  /**
   * 文件上传
   * @param param - 上传文件的参数，这里面可以设置前端配置的私有属性，
   *                那些私有属性将会再请求前从formData对象中删除
   *                param中必须包含files属性，其类型为array,里面存放要上传的文件对象
   * @return { File[] } 将上传的结果放在param.files 文件对象的uploadResult字段中返回
   */
  async uploadFile(
    param: UploadFileParam = { files: [] },
    fileKey: string = 'file',
  ): Promise<any> {
    const { files, ...rest } = param;
    const uploadList: Promise<any>[] = [];
    /**
     * 创建Promise.all的入参列表
     */
    files.forEach((file: any = {}) => {
      const formData = new FormData();
      /**
       * 先将文件blob对象插入到formData中，
       */
      formData.append(fileKey, file.originFileObj ?? file);
      /**
       * for in 遍历其他携带的参数，动态添加到formData，
       * 可里面可能包含接口需要的其他参数，或者前端用于控制展示的私有属性如 _isMsg 等
       */
      for (const key in rest) {
        if (Object.hasOwnProperty.call(rest, key)) {
          const value = rest[key];
          formData.append(key, value);
        }
      }

      uploadList.push(request(`/army/pcweb/support/file`, formData, 'POST'));
    });

    const resp = await Promise.all(uploadList);
    /**
     * 请求成功后将返回的数据添加到files列表中对应的文件对象的uploadResult属性上
     * 这里将原数据完整返回是因为我们可能会再数据中设置一些key属性，用来在上层更新数据
     */
    return files.map((item: any, index: number) => {
      item.uploadResult = resp[index];
      return item;
    });
  },
};
