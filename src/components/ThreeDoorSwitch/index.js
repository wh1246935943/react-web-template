import React from 'react';

import './style.less';

class FwThreeDoorSwitch extends React.Component {
  static defaultProps = {
    className: '',
    disabled: false,
    status: '',
    onChange: () => {},
  };
  state = {
    isStopping: false,
    isOn: false,
    isOff: false,
  };
  componentDidMount() {
    const { status } = this.props;
    if (status === 'ENABLED') {
      this.setState({
        isOn: true,
      });
    }
    if (status === 'DISABLED') {
      this.setState({
        isOff: true,
      });
    }
    if (status === 'STOP_PENDING' || status === 'STOPPED') {
      this.setState({
        isStopping: true,
      });
    }
  }
  checkOnOrOff = (type) => {
    let { isOn, isOff, isStopping } = this.state;
    if (type === 'ON' && isOn) return;
    if (type === 'OFF' && isOff) return;
    if (type === 'STOP' && isStopping) return;
    if (type === 'ON' && !isOn) {
      this.setState({
        isOn: true,
        isOff: false,
        isStopping: false,
      });
    }
    if (type === 'OFF' && !isOff) {
      this.setState({
        isOff: true,
        isOn: false,
        isStopping: false,
      });
    }
    if (type === 'STOP' && !isStopping) {
      this.setState({
        isStopping: true,
        isOff: false,
        isOn: false,
      });
    }
    const { onChange } = this.props;
    onChange(type);
  };
  render() {
    const { className, disabled } = this.props;
    let { isStopping, isOn, isOff } = this.state;
    return (
      <div
        className={`fw-three-door-switch ${className} ${
          disabled ? 'is-disabled' : ''
        }`}
      >
        <div
          className={`on-checked ${isOn ? 'is-on' : ''}`}
          onClick={() => {
            this.checkOnOrOff('ON');
          }}
        >
          {isOn ? 'ON' : ''}
        </div>
        <div
          className={`switch-btn ${isStopping ? 'is-stop' : ''}`}
          onClick={() => {
            this.checkOnOrOff('STOP');
          }}
        >
          <div className="switch-icon"></div>
        </div>
        <div
          className={`off-checked ${isOff ? 'is-off' : ''}`}
          onClick={() => {
            this.checkOnOrOff('OFF');
          }}
        >
          {isOff ? 'OFF' : ''}
        </div>
      </div>
    );
  }
}

export default FwThreeDoorSwitch;
