import React, { memo, useState } from 'react';
import { Menu } from 'antd';
import { history, useSelector } from 'umi';
import { FwIcon } from '@/components';
import menuImg from './assets/menu.png';

const { SubMenu } = Menu;

const Center = (props) => {
  const { locMenusTree } = useSelector(({ common }) => common);

  const renderMenuTree = (list) => {
    return list.map((item) => {
      if (item?.routes?.length) {
        return (
          item.showMenu && (
            <SubMenu
              key={item.code}
              title={
                <>
                  {item.name}
                  {!item.parentCode && (
                    <span className="menu-root-dorpdown_icon" />
                  )}
                </>
              }
              icon={<FwIcon src={menuImg} />}
            >
              {renderMenuTree(item.routes)}
            </SubMenu>
          )
        );
      }
      return (
        item.showMenu && (
          <Menu.Item
            key={item.code}
            onClick={() => history.push(item.path)}
            icon={<FwIcon src={menuImg} />}
          >
            {item.name}
          </Menu.Item>
        )
      );
    });
  };

  return (
    <Menu
      className="topbar-center"
      triggerSubMenuAction="click"
      mode="horizontal"
      subMenuCloseDelay={0.3}
      selectedKeys={[props.menuCode]}
      getPopupContainer={() => document.querySelector('.topbar-center')}
    >
      {renderMenuTree(locMenusTree)}
    </Menu>
  );
};

export default memo(Center);
