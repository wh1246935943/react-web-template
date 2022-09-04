import React, { memo } from 'react';
import { Dropdown, Menu, Button } from 'antd';
import FwIcon from '../Icon';
import './style.less';

const { SubMenu } = Menu;

const dropDownList = [
  { name: '曲线节点', key: 'node' },
  { name: '节点数据', key: 'nodeData' },
  // { name: '数据阈值', key: 'threshold' },
  {
    name: '网格',
    key: 'grid',
    subMenu: [
      // { name: '不显示', key: 'gridNo' },
      { name: '横向网格', key: 'gridX' },
      { name: '纵向网格', key: 'gridY' },
      // { name: '全显示', key: 'gridAll' },
    ],
  },
];

const FwDropDown = (props) => {
  const {
    children,
    itemKey = 'key',
    itemName = 'name',
    className = '',
    overlayData = dropDownList,
    placement = 'bottomCenter',
    onSelect = () => {},
    type = 'icon',
    iconSrc = require('./assets/filter.png'),
    btnTxt = '显示',
    selectedKeys = [],
  } = props;

  const buildMenuItem = (list = []) => {
    return list.map((item) => {
      if (item.subMenu?.length > 0) {
        return (
          <SubMenu key={item[itemKey]} title={item[itemName]}>
            {buildMenuItem(item.subMenu)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item[itemKey]} disabled={item.disabled}>
          {item[itemName]}
        </Menu.Item>
      );
    });
  };

  const menuList = (
    <Menu
      onClick={({ item, key }) => {
        const keys = [...selectedKeys];
        const index = keys.findIndex((item) => item === key);
        if (index === -1) {
          keys.push(key);
        } else {
          keys.splice(index, 1);
        }
        onSelect({ item, key, keys });
      }}
      selectedKeys={selectedKeys}
    >
      {buildMenuItem(overlayData)}
    </Menu>
  );

  const getNodeByType = () => {
    return {
      icon: <FwIcon src={iconSrc} className="filter-icon" />,
      btn: (
        <Button className="dropdown-btn">
          <FwIcon src={require('./assets/dorpdown_icon.png')} />
          {btnTxt}
        </Button>
      ),
    }[type];
  };

  return (
    <Dropdown
      overlay={menuList}
      trigger={['click']}
      placement={placement}
      className={`fw-dropdown ${className}`}
    >
      <a>{children ?? getNodeByType()}</a>
    </Dropdown>
  );
};

export default memo(FwDropDown);
