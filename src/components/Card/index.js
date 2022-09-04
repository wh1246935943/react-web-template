import React from 'react';
import { FwIcon } from '@/components';
import jiaoIcon from '@/assets/login/左上角.png';

import './style.less';

function FwCard(Props) {
  const {
    bjc = 'rgba(7,22,85,0.6)',
    className = '',
    style = {},
    contentClass = '',
    contentStyle = {},
    closable = false,
    onClick = () => {},
    onClose = () => {},
    renderTitleRight = () => '',
    emptyOutContent = null,
    title = '',
    children = null,
    isFull = false,
    placeholder = false,
  } = Props;

  return (
    <div
      className={`fw-card ${className} ${isFull ? 'fw-card_full' : ''}`}
      onClick={onClick}
      style={style}
    >
      <img className="fw-card-bg-icon icon-left_up" src={jiaoIcon} />
      <img className="fw-card-bg-icon icon-right_down" src={jiaoIcon} />
      <img className="fw-card-bg-icon icon-left_down" src={jiaoIcon} />
      {title && (
        <div className="fw-card_title">
          <span className="fw-card_title_text">{title}</span>
          <div className="fw-card_title_right">
            {renderTitleRight instanceof Function
              ? renderTitleRight()
              : renderTitleRight}
          </div>
        </div>
      )}
      <div className={`card-content ${contentClass}`} style={contentStyle}>
        {emptyOutContent && (
          <div className="card-content-empty-out">{emptyOutContent}</div>
        )}
        {(() => {
          const empty = (
            <img
              className="fw-card-empty-img"
              src={require('../assets/no_data.png')}
              alt=""
            />
          );
          if (placeholder) return empty;
          return children ?? empty;
        })()}
      </div>
      {closable && (
        <FwIcon
          src={require('../assets/close.png')}
          className="fw-card_close"
          onClick={onClose}
        />
      )}
    </div>
  );
}

function CardTitle(props) {
  const {
    children = null,
    required = false, // 标题前面是否展示红色 * 符号
    type = 'sidesLine', // sidesLine: 标题带左右分割线的； bottomLine: 带下划线的
    extend = '', // 扩展内容展示
  } = props;

  return (
    <div className={`fw-contentcard-title fw-contentcard-title_${type}`}>
      <div className="fw-contentcard-title_text">
        <span className={required ? 'fw-ctt_required' : ''}>{children}</span>
      </div>
      <div className="fw-contentcard-title_line">{extend}</div>
    </div>
  );
}

function ContentCard(props) {
  const {
    className = '',
    title = '',
    children = null,
    style = {},
    bodyStyle = {},
    required = false, // 标题前面是否展示红色 * 符号
  } = props;

  return (
    <div style={style} className={`fw-contentcard ${className}`}>
      {!!title && <CardTitle required={required}>{title}</CardTitle>}
      <div style={bodyStyle} className="fw-contentcard-container">
        {children}
      </div>
    </div>
  );
}

FwCard.ContentCard = ContentCard;
FwCard.CardTitle = CardTitle;

export default FwCard;
