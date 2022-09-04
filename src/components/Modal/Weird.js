import React from 'react';
import FwTitleBar from '../TitleBar';
import FwDatePicker from '../DatePicker';
import FwIcon from '../Icon';
const { FwRangePicker } = FwDatePicker;
import { Button } from 'antd';
const moment = require('moment');
import FwDropDown from '../DropDown';

import './style.less';

class WeirdModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      switchKey: props.defSwitchKey,
    };
  }

  static defaultProps = {
    src: '',
    className: '',
    zIndex: null,
    isTimeBar: false,
    isSelectTimeBar: false,
    onClose: () => {},
    onDownload: () => {},
    onDateChange: () => {},
    onTimeChange: () => {},
    onMenuClick: () => {},
    gridMenuClick: () => {},
    defSwitchKey: 'chart',
    isSwitchShow: true,
    isChartView: true,
    selectedKeys: [],
  };

  onSwitchShow = t => {
    const { onSwitchView } = this.props;
    onSwitchView(t);
    this.setState({ switchKey: t });
  };

  computeSwitchshow = t => {
    const { switchKey } = this.state;
    if (t === switchKey) return `switch-show-seletced`;
  };

  handleGridMenuClick = ({ key }) => {
    const { gridMenuClick } = this.props;
    gridMenuClick({ key });
  };

  render() {
    const {
      src,
      title,
      desc,
      className,
      onClose,
      onDownload,
      children,
      zIndex,
      isTimeBar,
      isSelectTimeBar,
      isSwitchShow,
      onDateChange,
      isChartView,
      selectedKeys,
    } = this.props;
    const modalStyle = {};
    if (zIndex !== null) Object.assign(modalStyle, { zIndex });

    return (
      <div className={`fw-weird-modal ${className}`} style={modalStyle}>
        <div className="left-fv-title">{title}</div>
        <div className="fw-viewer_topbar">
          {isTimeBar && <FwTitleBar title={desc} className="time-bar-size" />}
          {isSelectTimeBar && (
            <div className="">
              <FwRangePicker className="" onChange={onDateChange} />
            </div>
          )}
          <div className="right-opt">
            {isChartView && (
              <FwDropDown
                selectedKeys={selectedKeys}
                onSelect={this.handleGridMenuClick}
                type="btn"
              />
            )}
            {isSwitchShow && (
              <div className="switch-show">
                <i
                  onClick={() => this.onSwitchShow('chart')}
                  className={this.computeSwitchshow('chart')}
                />
                <i
                  onClick={() => this.onSwitchShow('table')}
                  className={this.computeSwitchshow('table')}
                />
              </div>
            )}
            <i className="dowload" onClick={() => onDownload(src, desc)} />
            <i className="close" onClick={onClose} />
          </div>
        </div>
        <div className={`fw-weird-modal-content`}>{children}</div>
      </div>
    );
  }
}

export default WeirdModal;
