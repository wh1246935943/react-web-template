import React, { useState, memo, useEffect } from 'react';
import { history } from 'umi';
import service from '@/service';
import { FwLevel, FwTable, FwModal, FwCard } from '@/components';
import { Input, Form, Select, Button, Switch, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

import './style.less';

const UserMgt = () => {
  const [listform] = Form.useForm();
  const [updateform] = Form.useForm();
  const [userList, setUserList] = useState([]);
  const [selectInfo, setSelectInfo] = useState(null);
  const [departList, setDepartList] = useState([]);
  const [rolesListForModal, setRolesListForModal] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    total: 0,
    pageSize: 20,
    pageNumber: 1,
  });
  const [password, setPassword] = useState('');

  const { pathname } = history.location;
  const pageModule = pathname.includes('/patrol/patrolPeopleMgt')
    ? 'patrol'
    : 'sysMgt';

  useEffect(() => {
    getUserlist(pageInfo);
  }, []);

  // 获取用户列表
  const getUserlist = async (param = {}) => {
    const { pageSize = pageInfo.pageSize, pageNumber = 1 } = param;

    const { key, departmentId, roleId } = await listform.validateFields();

    const resp = await service[pageModule].userMgt.getUserlist({
      pageSize,
      pageNumber,
      key,
      departmentId,
      roleId,
      ignore: true, // 只在获取用户中心的人员管理列表时需要携带这个参数，其他地方不需要（不是前端的私有属性）
      _isPaging: true,
    });

    setPageInfo({ ...param, total: resp.total });
    setUserList(resp.body);
  };

  /**
   * 表格更多操作
   */
  const headleMoreOption = async (mark, item, index) => {
    if (['edit', 'password', 'details'].includes(mark)) {
      setSelectInfo({ ...item, mark });
      return;
    }
    // 删除员工
    if (mark === 'delete') {
      await service[pageModule].userMgt.deleteUser({
        id: item.userId,
        ...item,
      });
      getUserlist(pageInfo);
    }
  };

  /**
   * 报告列表表头
   */
  const columns = [
    { title: '用户名', dataIndex: 'loginName' },
    { title: '员工姓名', dataIndex: 'nickName' },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '角色', dataIndex: 'roleName' },
    { title: '电话号码', dataIndex: 'phone' },
    { title: '创建日期', dataIndex: 'gmtCreated' },
    {
      title: '用户状态',
      dataIndex: 'userStatus',
      key: 'status',
      render: (o, record, index) => {
        //o 占位
        // console.log( record, index);
        return (
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            checked={record.userStatus === 'ENABLE'}
            size="small"
            onClick={async () => {
              const params = { ...record };
              params.userStatus =
                record.userStatus === 'ENABLE' ? 'DISABLE' : 'ENABLE';
              await service[pageModule].userMgt.userStatusChange(params);

              getUserlist(pageInfo);
            }}
          ></Switch>
        );
      },
    },
    {
      title: '操作',
      width: 260,
      operations: [
        { name: '详情', mark: 'details' },
        { name: '修改', mark: 'edit' },
        {
          name: '删除',
          mark: 'delete',
          type: 'popconfirm',
          msgTitle: '是否删除该员工',
        },
        { name: '修改密码', mark: 'password' },
      ],
    },
  ];

  const inputPwd = (val) => {
    setPassword(val);
  };

  const renderNodeByTypeForModalForm = (item) => {
    return item.nodeType === 'Select' ? (
      <Select
        style={{ width: '169px' }}
        onChange={(value) => {
          if (item.name === 'departmentId') {
            // 部门改变的时候需要重置已选的角色
            updateform.setFieldsValue({
              ['roleName']: '',
              ['roleId']: '',
            });
            getRoleslistForModal(value);
          }
        }}
      >
        {item.dataSource.map((item) => (
          <Select.Option key={item.id} value={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    ) : item.ascription.includes('password') ? (
      item?.render ? (
        item.render()
      ) : (
        <Input.Password
          className="input-password"
          style={{ width: '169px', paddingLeft: '10px' }}
          placeholder={
            item.name === 'password'
              ? '请填写密码'
              : item.name === 'repassword'
              ? '请确认密码'
              : null
          }
          onChange={(e) => inputPwd(e.target.value)}
        />
      )
    ) : (
      <Input
        style={{ width: '169px' }}
        placeholder={
          item.name === 'loginName'
            ? '请填写用户名称'
            : item.name === 'nickName'
            ? '请填写员工姓名'
            : item.name === 'phone'
            ? '请填写电话号码'
            : null
        }
      />
    );
  };

  /**
   * modal title
   */
  const modalTitle = {
    edit: '修改用户',
    add: '新增用户',
    password: '修改密码',
    details: '用户详情',
  };

  const handleModalOk = async () => {
    const { mark } = selectInfo;
    const values = await updateform.validateFields();
    if (mark === 'details') {
      // await service.sysMgt.userMgt.getUserDetail({
      //   id: selectInfo.id,
      //   ...values,
      // });
    } else if (mark === 'edit') {
      await service[pageModule].userMgt.updateUser({
        id: selectInfo.id,
        ...values,
        _msg: '修改成功',
      });
    } else if (mark === 'password') {
      await service[pageModule].userMgt.updatePassword({
        id: selectInfo.id,
        ...values,
        _msg: '密码修改成功',
      });
    } else {
      await service[pageModule].userMgt.addUser({
        ...values,
        _msg: '新增用户成功',
      });
    }
    getUserlist(pageInfo);
    setSelectInfo(null);
    setPassword('');
  };

  const handleCancel = () => {
    setSelectInfo(null);
    setPassword('');
  };

  return (
    <FwCard.ContentCard className="user-mgt">
      <Form
        form={listform}
        className="query-form common-formItem-margin-bottom10"
        onValuesChange={debounce(getUserlist, 500)}
        initialValues={{
          key: '',
          departmentId: '',
          roleId: '',
        }}
      >
        <Row>
          <Form.Item name="key">
            <Input placeholder="请输入员工信息" prefix={<SearchOutlined />} />
          </Form.Item>
          <Button onClick={setSelectInfo.bind(this, { mark: 'add' })}>
            新增用户
          </Button>
        </Row>
      </Form>
      {/* <FwTable
        rowKey="id"
        columns={columns}
        dataSource={userList}
        onChange={getUserlist}
        {...pageInfo}
        onCustOperats={headleMoreOption}
      /> */}

      <micro-app
        name='yun2' // name(必传)：应用名称
        url='http://localhost:8001' // url(必传)：应用地址，会被自动补全为http://localhost:3000/index.html
        // baseroute='/login' // baseroute(可选)：基座应用分配给子应用的基础路由，就是上面的 `/my-page`
      ></micro-app>

      <FwModal
        className="userModal"
        title={modalTitle[selectInfo?.mark]}
        visible={!!selectInfo}
        onCancel={handleCancel}
        onOk={handleModalOk}
        footer={selectInfo?.mark === 'details' ? null : undefined}
      >
        <Form
          form={updateform}
          preserve={false}
          className={`${
            selectInfo?.mark === 'details' ? 'modal-detail-style' : ''
          }`}
        >
          {[
            {
              ascription: ['edit', 'add', 'details'],
              name: 'loginName',
              label: '用户名',
              rules: [
                {
                  required: true,
                  message: '用户名必须包含字母，长度不能超过16，且不能为空',
                  pattern: /^(?!^[0-9]+$)[0-9A-Za-z]{0,16}$/,
                },
              ],
            },
            {
              ascription: ['add', 'password'],
              name: 'password',
              label: '密码',
              rules: [{ required: true, message: '密码不能为空' }],
            },
            {
              ascription: ['add', 'password'],
              name: 'password',
              render: () => {
                if (password) {
                  return <FwLevel className="safe-level" byVal={password} />;
                } else {
                  return null;
                }
              },
            },
            {
              ascription: ['add', 'password'],
              name: 'repassword',
              label: '确认密码',
              dependencies: ['password'],
              rules: [
                {
                  required: true,
                  message: '请再次输入确认密码',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('确认密码输入错误'));
                  },
                }),
              ],
            },
            {
              ascription: ['edit', 'add', 'details'],
              name: 'nickName',
              label: '员工姓名',
              rules: [{ required: true, message: '姓名不能为空' }],
            },
            {
              ascription: ['edit', 'add', 'details'],
              name: 'phone',
              label: '电话号码',
              rules: [
                {
                  required: true,
                  message: '请输入有效手机号',
                  pattern: /^[1]([3][0-9]{1}|[5-9][0-9]{1})[0-9]{8}$/,
                },
              ],
            },
            {
              ascription: ['edit', 'add', 'details'],
              name:
                selectInfo?.mark === 'details'
                  ? 'departmentName'
                  : 'departmentId',
              label: '部门',
              nodeType: 'Select',
              dataSource: departList.map(({ key, desc }) => ({
                id: key,
                name: desc,
              })),
              rules: [{ required: true, message: '部门不能为空' }],
            },
            {
              ascription: ['edit', 'add', 'details'],
              name: selectInfo?.mark === 'details' ? 'roleName' : 'roleId',
              label: '角色',
              nodeType: 'Select',
              dataSource: rolesListForModal,
              rules: [{ required: true, message: '角色不能为空' }],
            },
          ]
            .filter(({ ascription = [] }) =>
              ascription.includes(selectInfo?.mark),
            )
            .map((item) => (
              <Form.Item
                name={item.name}
                label={item.label}
                rules={selectInfo?.mark === 'details' ? null : item.rules}
                labelCol={{ span: 6 }}
                dependencies={item.dependencies ?? []}
                initialValue={selectInfo[item.name]}
                noStyle={item.render}
              >
                {selectInfo?.mark === 'details'
                  ? selectInfo[item.name]
                  : renderNodeByTypeForModalForm(item)}
              </Form.Item>
            ))}
        </Form>
      </FwModal>
    </FwCard.ContentCard>
  );
};

export default memo(UserMgt);
