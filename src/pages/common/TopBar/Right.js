import React, { memo } from 'react';
import { history, useSelector } from 'umi';
import { Menu, Dropdown, Badge } from 'antd';
import service from '@/service';

import './style.less';

const Right = (props) => {
  const { userInfo = {}, unreadMessageTotal = 0 } = useSelector(
    ({ common }) => common,
  );

  const renderLoginOutMenu = () => {
    return (
      <Menu onClick={routePage}>
        <Menu.Item key="name">{userInfo.nickName}</Menu.Item>
        <Menu.Item key="account">我的账号</Menu.Item>
        <Menu.Item key="logout">退出</Menu.Item>
      </Menu>
    );
  };

  const routePage = async (type) => {
    const { key } = type;

    if (key === 'logout') {
      service.common.logout();
      return;
    }

    if (key === 'account') {
      history.push('/personalCenter');
    }

    // 跳转到通知页面
    if (type === 'dataAlarm') {
      // history.push('/message');
    }
  };

  return (
    <div className="topbar-right">
      <Badge
        count={unreadMessageTotal}
        size="small"
        offset={[-5, 3]}
        className="right-badge"
      >
        <span
          className="icon notice"
          onClick={routePage.bind(this, 'dataAlarm')}
        ></span>
      </Badge>
      <Dropdown trigger={['click']} arrow overlay={renderLoginOutMenu}>
        <span className="icon user"></span>
      </Dropdown>
    </div>
  );
};

export default memo(Right);
