import React, { useState, memo, useEffect } from 'react';
import service from '@/service';
import {
  Row,
  Input,
  Form,
  Button,
  Avatar,
  Image,
  Col,
  Upload,
  message,
} from 'antd';
import { FwCard, FwModal, FwLevel } from '@/components';
import './style.less';
import Cookies from 'js-cookie';
import defaultAvatar from '@/assets/default_avatar.jpg';

const PersonalCenter = () => {
  const [listform] = Form.useForm();
  const [updateform] = Form.useForm();
  const [userInfo, setUserInfo] = useState({});
  const [modalTitle, setModalTitle] = useState('');
  const [isModalShow, setIsModalShow] = useState(false);
  // 获取验证码初始秒
  const [initTime, setInitTime] = useState(60);
  // 是否显示初始秒
  const [isShowInitSecond, setIsShowInitSecond] = useState(false);
  // 头像URL
  const [avatarURL, setAvatarURL] = useState('');
  const [password, setPassword] = useState('');

  // 定时器
  let countdownTimer = null;
  // 用户id
  const id = Cookies.get('userId');

  useEffect(() => {
    getUserInfo();
  }, []);

  // 获取用户信息
  const getUserInfo = async () => {
    const resp = await service.common.getUserInfo();
    if (resp) {
      const { avatarURL } = resp;
      setAvatarURL(avatarURL);
      setUserInfo(resp);
    }
  };

  // 修改头像
  const changeAvatar = async (info) => {
    const { fileList = [] } = info;
    const resp = await service.common.uploadFile({
      files: fileList,
      _isMsg: false,
    });
    await service.personalCenter.personalCenter.changeAvatar({
      id,
      avatarKey: resp[0]?.uploadResult,
      _isMsg: '修改成功',
    });
    getUserInfo();
  };

  // 修改密码和电话号码
  const btnHandle = async (type) => {
    setIsModalShow(true);
    if (type === 'psd') {
      setModalTitle('修改密码');
    }
    if (type === 'phone') {
      setModalTitle('修改手机号');
      // updateform.setFieldsValue({ phone: userInfo.phone });
    }
  };

  // 获取短信验证码
  const getIdentifyingCode = async () => {
    if (isShowInitSecond) return;
    // const { phone } = await updateform.validateFields(['phone']);
    await service.common.getVerificationCode({
      type: 'UPDATE_PHONE',
      phone: userInfo.phone,
      _isMsg: '短信验证码发送成功',
    });
    setIsShowInitSecond(true);

    // 倒计时
    let num = 60;
    countdownTimer = setInterval(() => {
      num--;
      setInitTime(num);
      if (num === 0) {
        clearInterval(countdownTimer);
        num = 60;
        setInitTime(num);
        setIsShowInitSecond(false);
      }
    }, 1000);
  };

  // modal确定
  const modalHandelOk = async () => {
    const values = await updateform.validateFields();

    if (modalTitle === '修改手机号') {
      await service.personalCenter.personalCenter.changePhone({
        ...values,
        phone: userInfo.phone,
      });
      getUserInfo();
    }

    if (modalTitle === '修改密码') {
      const { password = '', originalPassword = '' } = values;
      await service.personalCenter.personalCenter.changePsd({
        password,
        originalPassword,
        id,
      });
      service.common.logout(); // 退出登录
    }

    closeModelFn();
  };

  // 关闭modal
  const closeModelFn = () => {
    setPassword('');
    setIsModalShow(false);
    setIsShowInitSecond(false);
    updateform.resetFields();
    updateform.setFieldsValue({
      originalPassword: '',
      password: '',
      repassword: '',
      phone: '',
      code: '',
      newPhone: '',
    });
  };

  const inputPwd = (val) => {
    setPassword(val);
  };

  // 修改密码form内容
  const psdContent = (
    <div>
      <Form.Item
        label="原密码"
        name="originalPassword"
        rules={[{ required: true, message: '原密码不能为空' }]}
      >
        <Input.Password
          placeholder="请输入原密码"
          style={{ width: '160px' }}
          visibilityToggle
        />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="password"
        rules={[{ required: true, message: '新密码不能为空' }]}
        onChange={(e) => inputPwd(e.target.value)}
      >
        <Input.Password
          placeholder="请输入新密码"
          style={{ width: '160px' }}
          visibilityToggle
        />
      </Form.Item>
      {password && <FwLevel className="safe-level" byVal={password} />}
      <Form.Item
        label="确认密码"
        name="repassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '确认密码不能为空' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('确认密码与新密码不一致'));
            },
          }),
        ]}
        extra={
          <div style={{ marginTop: '10px' }}>
            <p>提示：修改密码后，需要使用新密码重新登录</p>
          </div>
        }
      >
        <Input.Password
          placeholder="再次输入密码"
          style={{ width: '160px' }}
          visibilityToggle
        />
      </Form.Item>
    </div>
  );

  // 修改手机号form内容
  const phoneContent = (
    <div>
      <Form.Item
        label="原手机号"
        // name="phone"
        // rules={[
        //   {
        //     required: true,
        //     message: '请输入正确的手机号码',
        //     pattern: /^[1]([3][0-9]{1}|[5-9][0-9]{1})[0-9]{8}$/,
        //   },
        // ]}
      >
        {/* <Input placeholder="请输入原手机号" /> */}
        {userInfo.phone}
      </Form.Item>
      <Form.Item
        label="短信验证码"
        name="code"
        rules={[
          { required: true, message: '短信验证码不能为空' },
          { message: '验证码为6位有效数字', len: 6 },
        ]}
      >
        <Input placeholder="请输入验证码" maxLength={6} />
      </Form.Item>
      <span
        className={`identifying-code ${
          isShowInitSecond ? 'diabled' : 'pointer'
        }`}
        onClick={getIdentifyingCode}
      >
        {isShowInitSecond ? `${initTime}秒后重新获取` : '获取验证码'}
      </span>
      <Form.Item
        label="新手机号"
        name="newPhone"
        rules={[
          {
            required: true,
            message: '请输入正确的手机号码',
            pattern: /^[1]([3][0-9]{1}|[5-9][0-9]{1})[0-9]{8}$/,
          },
        ]}
      >
        <Input placeholder="请输入新手机号" />
      </Form.Item>
    </div>
  );

  return (
    <FwCard.ContentCard className="personal-center lebal-color-opcity">
      <Form form={listform} labelCol={{ span: 6 }}>
        <div className="header">
          <Row justify="center">
            <Avatar
              src={
                <Image
                  src={avatarURL}
                  style={{ width: '100%', height: '100%' }}
                  onError={() => {
                    setAvatarURL(defaultAvatar);
                  }}
                />
              }
              size={110}
            />
          </Row>
          <Row justify="center" style={{ margin: '10px 0' }}>
            <span style={{ fontSize: '20px' }}>{userInfo.nickName}</span>
          </Row>
          <Row justify="center">
            <Row
              style={{ width: '170px', alignItems: 'center' }}
              justify="space-between"
            >
              <div>{userInfo.departmentName}</div>
              <div>
                <Form.Item name="avatar" style={{ marginBottom: 0 }}>
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={changeAvatar}
                    showUploadList={false}
                    accept=".jpg, .jpeg, .png, .bmp, .tif, .gif"
                  >
                    <Button type="primary" className="change-avatar-btn">
                      修改头像
                    </Button>
                  </Upload>
                </Form.Item>
              </div>
            </Row>
          </Row>
        </div>
        <div className="form-main">
          <Row>
            <Form.Item label="用户名" labelCol={{ span: 3 }}>
              {userInfo.loginName}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="密码" labelCol={{ span: 3 }}>
              <span>******</span>
              <span>
                <Button
                  type="primary"
                  className="change-psd-btn"
                  onClick={btnHandle.bind(this, 'psd')}
                >
                  修改密码
                </Button>
              </span>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="电话号码" labelCol={{ span: 3 }}>
              <div className="phone-contain">
                <span>{userInfo.phone}</span>
                <span>
                  <Button
                    type="primary"
                    className="change-phone-btn"
                    onClick={btnHandle.bind(this, 'phone')}
                  >
                    修改手机号
                  </Button>
                </span>
              </div>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="角色" labelCol={{ span: 3 }}>
              {userInfo.roleName}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="用户状态" labelCol={{ span: 3 }}>
              {userInfo.userStatusDesc}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="创建日期" labelCol={{ span: 3 }}>
              {userInfo.gmtCreated}
            </Form.Item>
          </Row>
        </div>
      </Form>
      <FwModal
        title={modalTitle}
        visible={isModalShow}
        onOk={modalHandelOk}
        onCancel={closeModelFn}
      >
        <Form form={updateform} labelCol={{ span: 6 }} className="modal-form">
          {modalTitle === '修改手机号' ? phoneContent : psdContent}
        </Form>
      </FwModal>
    </FwCard.ContentCard>
  );
};

export default memo(PersonalCenter);
