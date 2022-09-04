import React, { memo } from 'react';
import './style.less';

const FwIcon = props => {
  const {
    children,
    className,
    src,
    size,
    top,
    right,
    left,
    bottom,
    onClick = () => {},
    style,
    datadot = 0,
  } = props;

  const dfuStyle = {
    backgroundImage: `url(${src})`,
    ...style,
  };
  if (size)
    Object.assign(dfuStyle, { width: `${size}px`, height: `${size}px` });
  if (top || right || left || bottom) {
    Object.assign(dfuStyle, {
      position: 'absolute',
      top: `${top}px`,
      right: `${right}px`,
      left: `${left}px`,
      bottom: `${bottom}px`,
    });
  }

  return (
    <span
      className={`fw-icon ${className}`}
      style={dfuStyle}
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      data-dot={datadot}
    >
      {children}
    </span>
  );
};

export default memo(FwIcon);
