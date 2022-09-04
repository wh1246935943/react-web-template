import React from 'react';

import './style.less';

class FwTitleBar extends React.Component {
  static defaultProps = {
    value: '',
    className: '',
    title: '',
    style: {},
    isFull: false,
  };

  render() {
    const { className, title, value, style, children, isFull } = this.props;
    /**
     * 当需要沾满横向区域时，将元素宽度设置100%
     */
    const styles = { ...style };
    if (isFull) Object.assign(styles, { width: '100%' });
    return (
      <div className={`fw-titleBar ${className} `} style={styles}>
        <div className="fw-titleBar-content">
          {title && <div>{title}</div>}
          {value && <div>{value}</div>}
          {children}
        </div>
      </div>
    );
  }
}

export default FwTitleBar;
