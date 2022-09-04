import React, { ReactElement } from 'react';

interface TopBarProps {
  title?: string;
  menuCode: string;
}

declare const TopBar: React.FC<TopBarProps>;

export default TopBar;
