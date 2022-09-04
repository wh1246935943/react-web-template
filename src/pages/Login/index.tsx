import React, { useState, memo } from 'react';
import { useDispatch, history, useSelector } from 'umi';
import { Form, Input, Button, Row, Avatar } from 'antd';
import Cookies from 'js-cookie';
import { MailFilled, MobileFilled } from '@ant-design/icons';
import { FwIcon, FwLevel } from '@/components';
import { useCountDown } from 'ahooks';
import { getPageQuery } from '@/utils/utils';
import service from '@/service';
import { LoginParam } from '@/service/module/common';
import {
  getFristPagePath,
  getRouterInfoByPathname,
  MenuItem,
} from './../mainUtils';

import 左上角 from '@/assets/login/左上角.png';
import avatar from '@/assets/logo.png';
import accountIcon from '@/assets/login/账号.png';
import passwordIcon from '@/assets/login/密码.png';

import './style.less';

const loginTypes = {
  account: '密 码 登 录',
  mobile: '短 信 登 录',
  restPwd: '重 置 密 码',
};

type FormName = 'account' | 'mobile' | 'restPwd';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [restPwdForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [loginType, setLoginType] = useState<FormName>('account');
  const [targetCountdown, setTargetCountdown] = useState<number | undefined>(0);
  const dispatch = useDispatch();

  const [countdown] = useCountDown({
    targetDate: targetCountdown,
    onEnd: () => {
      setTargetCountdown(0);
    },
  });

  const getVerificationCode = async () => {
    /**
     * 点击获取验证码单独校验手机号
     */
    const { phone } = await restPwdForm.validateFields(['phone']);
    /**
     * targetCountdown > 0: 倒计时进行中
     * targetCountdown === undefined: 验证码获取中
     * 以上两种情况不允许再次点击
     */
    if (targetCountdown || targetCountdown === undefined) return;
    /**
     * 获取验证码请求发起前，将状态至于请求中
     * 此时按钮处于不可点击状态，但是并未开始倒计时
     */
    setTargetCountdown(undefined);
    /**
     * 获取验证码请求返回后
     * 如果成功则开始倒计时
     * 失败，则将状态设置为初始值
     */
    const resp = await service.common.getVerificationCode({
      _msg: '验证码发送成功',
      _loading: false,
      _backErrorData: true,
      phone,
      type: 'FORGET_PASSWORD',
    });

    if (resp.requestFailed) {
      setTargetCountdown(0);
      return;
    }

    setTargetCountdown(Date.now() + 60000);
  };

  const onLogin = async (values: LoginParam, type: FormName) => {
    setLoading(true);

    values._isMsg = false;
    values._loading = false;
    values._backErrorData = true;

    let resp: any = {};
    if (type === 'restPwd') {
      values._isMsg = true;
      values._msg = '密码修改成功';
      resp = await service.common.reSetPwd(values);
    } else {
      resp = await service.common.login(values);
    }

    setLoading(false);
    if (resp.requestFailed || type === 'restPwd') {
      setLoginType('account');
      return;
    }

    dispatch({
      type: 'common/setUserInfo',
      payload: resp,
    });

    Cookies.set('userId', resp.userId);
    getMenu();
  };

  const getMenu = async () => {
    setLoading(true);
    const resp = await service.common.getMenus({
      _isList: true,
      _loading: false,
      _backErrorData: true,
    });

    setLoading(false);
    if (resp.requestFailed) {
      return;
    }

    if (!resp?.length) {
      return;
    }

    dispatch({
      type: 'common/setMenu',
      payload: resp,
    });

    const path = getFristPagePath(resp);

    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
    let { redirect } = params;

    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        const url = redirect.substr(urlParams.origin.length);
        const [pathname, search] = url?.split('?');

        getRouterInfoByPathname({
          pathname,
          callback: ({ code, routes }) => {
            const is = resp.find((item: MenuItem) => item.code === code);

            if (routes?.length || !is) {
              history.replace(path);
              return;
            }

            history.replace(url);
          },
        });

        return;
      }
    }

    if (path === '') return;

    history.replace(path);
  };

  const usableType = loginType === 'account' ? 'restPwd' : 'account';
  const inputPwd = (val: any) => {
    setPassword(val);
  };

  const renderFormByType = () => {
    if (loginType === 'account') {
      return (
        <Form name="account" form={restPwdForm}>
          <Form.Item
            name="loginName"
            rules={[
              {
                required: true,
                message: `账号/手机号不能为空`,
              },
            ]}
          >
            <Input
              placeholder={`请输入账号/手机号`}
              prefix={<FwIcon src={accountIcon} />}
            />
          </Form.Item>
          <Form.Item
            name="loginPwd"
            rules={[
              {
                required: true,
                message: `密码不能为空`,
              },
            ]}
          >
            <Input.Password
              placeholder={`请输入密码`}
              visibilityToggle
              prefix={<FwIcon src={passwordIcon} />}
            />
          </Form.Item>
          <Row justify="end" className="login-help">
            <span onClick={setLoginType.bind(this, 'restPwd')}>
              忘 记 密 码 ？
            </span>
          </Row>
          <Button
            loading={loading}
            className="form-button"
            type="primary"
            htmlType="submit"
          >
            登录
          </Button>
        </Form>
      );
    }

    return (
      <Form name="restPwd">
        <Form.Item
          name="phone"
          rules={[
            {
              required: true,
              message: `手机号格式错误`,
              pattern: /^[1]([3][0-9]{1}|[5-9][0-9]{1})[0-9]{8}$/,
            },
          ]}
        >
          <Input placeholder="请输入手机号" prefix={<MobileFilled />} />
        </Form.Item>

        {loginType === 'restPwd' && (
          <>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: `密码格式错误`,
                },
              ]}
            >
              <Input.Password
                onChange={(e) => inputPwd(e.target.value)}
                autoComplete="new-password"
                visibilityToggle
                placeholder="请输入密码"
                prefix={<FwIcon src={passwordIcon} />}
              />
            </Form.Item>
            {password && <FwLevel className="safe-level" byVal={password} />}
          </>
        )}
        {loginType === 'restPwd' && (
          <Form.Item
            name="confirmPwd"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: '确认密码输入错误',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('确认密码输入错误'));
                },
              }),
            ]}
          >
            <Input.Password
              visibilityToggle
              autoComplete="new-password"
              placeholder="请确认密码"
              prefix={<FwIcon src={passwordIcon} />}
            />
          </Form.Item>
        )}

        <Form.Item
          name="code"
          rules={[
            {
              required: true,
              message: `验证码不能为空`,
            },
          ]}
        >
          <Input
            placeholder="请输入验证码"
            prefix={<MailFilled />}
            suffix={
              <Button
                loading={targetCountdown === undefined}
                onClick={getVerificationCode}
                className={
                  targetCountdown || targetCountdown === undefined
                    ? 'verificationCode-btn_disabled'
                    : ''
                }
              >
                {countdown
                  ? `${Math.round(countdown / 1000)}s后重新获取`
                  : '获取验证码'}
              </Button>
            }
          />
        </Form.Item>
        <Button
          loading={loading}
          className="form-button"
          type="primary"
          htmlType="submit"
        >
          {loginType === 'restPwd' ? '确认' : '登录'}
        </Button>
      </Form>
    );
  };

  return (
    <div className="login-page">
      <div className="form-content">
        <div className="title">
          <Avatar shape="square" src={avatar} />
          <span className="title-zh">秦始皇帝陵</span>
          <span className="title-zh">世界文化遗产监测平台</span>
          <span className="title-en">
            {'World cultural heritage monitoring platform for the mausoleum of QinShihuang'.toLocaleUpperCase()}
          </span>
        </div>
        <div className="loginForm">
          <img className="bg-icon icon-left_up" src={左上角} />
          <img className="bg-icon icon-right_up" src={左上角} />
          <img className="bg-icon icon-right_down" src={左上角} />
          <img className="bg-icon icon-left_down" src={左上角} />

          <Row justify="space-between" className="login-type">
            <span>{loginTypes[loginType]}</span>
            {loginType === 'restPwd' && (
              <span onClick={setLoginType.bind(this, usableType)}>
                {loginTypes[usableType]}
              </span>
            )}
          </Row>
          <Form.Provider
            onFormFinish={(name, forms) => {
              onLogin(forms.values as LoginParam, name as FormName);
            }}
          >
            {renderFormByType()}
          </Form.Provider>
        </div>
      </div>
    </div>
  );
};

export default memo(LoginPage);
