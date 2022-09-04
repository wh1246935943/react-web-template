import React, { memo, useRef, useLayoutEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import './style.less';

const FwScroll = (props) => {
  const { children, autoHide, placeholder, ...rest } = props;

  const renderThumb = ({ style = {}, ...props } = {}) => {
    //设置滚动条的样式
    const thumbStyle = {
      width: '6px',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '0px',
      zIndex: '999',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <Scrollbars
      renderThumbVertical={renderThumb}
      renderThumbHorizontal={renderThumb}
      {...rest}
    >
      {placeholder ? (
        typeof placeholder === 'boolean' ? (
          <img
            className="fw-scroll-no-data"
            src={require('@/assets/no_data.png')}
            alt="暂无数据"
          />
        ) : (
          placeholder()
        )
      ) : (
        children
      )}
    </Scrollbars>
  );
};

export default memo(FwScroll);
