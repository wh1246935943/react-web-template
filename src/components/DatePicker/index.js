import React, { useState } from 'react';
import { DatePicker, Button, Row } from 'antd';
// import { FwTitleBar } from '@/components';
const moment = require('moment');

import './style.less';

const { RangePicker } = DatePicker;

const getTimeScope = (type) => {
  const scopeType = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
  if (scopeType.includes(type)) {
    type = type.toLocaleLowerCase();
    const startTime = moment().startOf(type).format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment().endOf(type).format('YYYY-MM-DD HH:mm:ss');
    return { startTime, endTime };
  }
};

class FwDatePicker extends React.PureComponent {
  static defaultProps = {
    className: '',
    isReset: false,
    defaultValue: getTimeInterval().timeMoment[1],
    showTime: true,
    onChange: () => {},
  };

  state = {
    _value: [window.getTimeInterval().timeMoment[1]],
  };

  render() {
    const { className, children, isReset, defaultValue, onChange, ...rest } =
      this.props;
    const { _value } = this.state;

    const _defaultValue =
      typeof defaultValue === 'string'
        ? moment(defaultValue, 'YYYY-MM-DD HH:mm:ss')
        : defaultValue;

    return (
      <div className={`fw-datepicker ${className}`}>
        <DatePicker
          defaultValue={_defaultValue}
          value={_value[0]}
          allowClear={false}
          {...rest}
        />
        {isReset && (
          <Button
            onClick={() => {
              const { startTime, endTime } = window.getTimeInterval();
              onChange(_value, [startTime, endTime], 'reset');
              this.setState({ _value: [..._value] });
            }}
          >
            重置
          </Button>
        )}
        {children}
      </div>
    );
  }
}

class FwRangePicker extends React.PureComponent {
  static defaultProps = {
    subtract: 168,
    showTime: true,
    isReset: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    defaultValue: window.getTimeInterval().timeMoment,
    onChange: () => {},
  };

  state = {
    _value: '', // window.getTimeInterval(this.props.subtract).timeMoment,
  };

  render() {
    const {
      className,
      children,
      isReset,
      onChange,
      subtract,
      defaultValue,
      value,
      dateFormat,
      ...rest
    } = this.props;

    let { _value } = this.state;

    const _defaultValue =
      typeof defaultValue[0] === 'string'
        ? [
            moment(defaultValue[0], dateFormat),
            moment(defaultValue[1], dateFormat),
          ]
        : defaultValue;

    const rangePickerValue = {
      defaultValue: _defaultValue,
    };

    if (value?.length && typeof value?.[0] === 'object') {
      rangePickerValue.value = value;
    } else if (value?.length && typeof value?.[0] === 'string') {
      rangePickerValue.value = [
        moment(value[0], dateFormat),
        moment(value[1], dateFormat),
      ];
    }

    return (
      <div className={`fw-datepicker ${className}`}>
        <RangePicker
          {...rangePickerValue}
          format="YYYY-MM-DD"
          onChange={(date, timeString) => {
            this.setState({ _value: date });
            onChange(date, timeString);
          }}
          allowClear={false}
          {...rest}
        />
        {isReset && (
          <Button
            onClick={() => {
              this.setState({ _value: [..._defaultValue] });
              onChange(
                _defaultValue,
                [
                  _defaultValue[0].format(dateFormat),
                  _defaultValue[1].format(dateFormat),
                ],
                'reset',
              );
            }}
          >
            重置
          </Button>
        )}
        {children}
      </div>
    );
  }
}

class YearDay extends React.PureComponent {
  static defaultProps = {
    data: ['日', '周', '月', '年'],
    onClick: () => {},
    ben: false,
    btnStyleNormal: true,
    defaultBtnIndex: null,
  };

  state = {
    buttonIndex: 1,
  };

  // 用于处理获取时间区间的枚举
  desc = {
    日: 'DAY',
    周: 'WEEK',
    月: 'MONTH',
    年: 'YEAR',
  };

  getClassName = (index) => {
    const { buttonIndex } = this.state;
    const { btnStyleNormal, defaultBtnIndex } = this.props;

    // if (index === (defaultBtnIndex ?? buttonIndex)) {
    //   return 'year-day-btn selected';
    // } else {
    //   return 'year-day-btn';
    // }

    if (btnStyleNormal) {
      if (index === (defaultBtnIndex ?? buttonIndex)) {
        return 'year-day-btn selected';
      } else {
        return 'year-day-btn';
      }
    } else {
      if (index === (defaultBtnIndex ?? buttonIndex)) {
        return 'year-day-btn-lgcy selected';
      } else {
        return 'year-day-btn-lgcy';
      }
    }
  };

  render() {
    const { onClick, ben, btnNameKey, defaultBtnIndex, className } = this.props;
    let { data, btnStyleNormal } = this.props;

    if (ben) {
      data = ['今日', '本周', '本月', '全年'];
    }

    return (
      <Row className={`fw-yearday ${className}`}>
        {data.map((item, index) => (
          <div
            className={this.getClassName(
              defaultBtnIndex
                ? typeof item === 'string'
                  ? item
                  : item.key
                : index,
            )}
            btn-name={btnNameKey ? item[btnNameKey] : item}
            key={typeof item === 'string' ? item : item.key}
            onClick={() => {
              // 更新界面响应状态
              this.setState({
                buttonIndex: index,
              });
              /**
               * 如果当前传入的是字符串数组，则通过其关键字判断是否为获取时间区间
               * 默认字符串最后一个字符包含指定字符，则认为是获取时间区间逻辑
               */
              if (typeof item === 'string') {
                const timeScope = getTimeScope(
                  this.desc[item.charAt(item.length - 1)],
                );
                onClick(timeScope);
                return;
              }
              onClick(item, index);
            }}
          >
            {/* {!btnStyleNormal
              ? typeof item === 'string'
                ? item
                : item.name
              : typeof item === 'string'
              ? item
              : item.name} */}
            {!btnStyleNormal && typeof item === 'string' ? item : item.name}
          </div>
        ))}
      </Row>
    );
  }
}
YearDay.getTimeScope = getTimeScope;
FwDatePicker.FwRangePicker = FwRangePicker;
FwDatePicker.YearDay = YearDay;

export default FwDatePicker;
