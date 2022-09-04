import { SpinProps } from 'antd';
import React, { CSSProperties, ReactElement } from 'react';

interface FwSpinShowProps extends SpinProps {
  parentClassName?: string;
}

interface FwSpinCloseProps extends SpinProps {
  parentClassName?: string;
  closeAll?: Boolean;
  className?: string;
}

interface FwSpinProps {
  show: (param?: FwSpinShowProps) => void;
  close: (param?: FwSpinCloseProps) => void;
}

declare const FwSpin: FwSpinProps;

interface FwTitleBarProps {
  value?: string;
  className?: string;
  title?: string;
  style?: CSSProperties;
  isFull?: boolean;
  children?: ReactElement;
}

declare const FwTitleBar: React.FC<FwTitleBarProps>;

interface FwIconProps {
  src: string;
  children?: ReactElement;
  className?: string;
  size?: number;
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
  onClick?: () => void;
  style?: CSSProperties;
  datadot?: number;
}
declare const FwIcon: React.FC<FwIconProps>;

interface FwLevelProps {
  className?: string;
  byVal?: string;
  levelType?: string;
}
declare const FwLevel: React.FC<FwLevelProps>;
