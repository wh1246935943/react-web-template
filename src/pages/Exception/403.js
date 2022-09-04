import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

import './style.less';

const ErrorPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="抱歉，您没有访问此页面的权限。"
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        回到首页
      </Button>
    }
  />
);

export default ErrorPage;
