import { memo } from 'react';

import './style.less';

const Left = () => {
  return (
    <div className="topbar-left">
      <a className="display-center-col" href="/">
        <img src={fwProjectConfig.logo} alt="" />
        <span>{fwProjectConfig.projectName}</span>
      </a>
    </div>
  );
};

export default memo(Left);
