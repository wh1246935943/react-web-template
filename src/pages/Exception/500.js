import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

import './style.less';

const ErrorPage = () => (
  <Result
    status="500"
    title="500"
    subTitle="抱歉，服务器发生错误。"
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        回到首页
      </Button>
    }
  />
);

export default ErrorPage;
