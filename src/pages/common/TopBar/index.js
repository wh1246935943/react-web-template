import React, { memo } from 'react';
import Left from './Left.js';
import Right from './Right.js';
import Center from './Center.js';

import './style.less';

const TopBar = (props) => {
  const { title, menuCode } = props;

  return (
    <div className="top-bar">
      <Left />

      <Center menuCode={menuCode} />

      <Right userInfo={{}} currentAlarmsNumber={12} />
    </div>
  );
};

export default memo(TopBar);
