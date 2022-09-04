import React, { Component } from 'react';

import './style.less';

class FwLevel extends Component {
  static defaultProps = {
    className: '',
    byVal: '',
    levelType: 'password',
  };

  getLevel = () => {
    const { byVal, levelType } = this.props;
    if (byVal) {
      if (levelType === 'password') {
        let levelNum = 0;
        let levelObj = {};
        if (byVal.length < 5) {
          levelNum = 0;
        } else {
          if (/\d/.test(byVal)) {
            levelNum++;
          }
          if (/[a-z]/.test(byVal)) {
            levelNum++;
          }
          if (/[A-Z]/.test(byVal)) {
            levelNum++;
          }
          if (
            new RegExp(
              "[-`~!@#$%^&*()_+=|{}':;',\\\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]",
            ).test(byVal)
          ) {
            levelNum++;
          }
        }

        if (levelNum >= 0 && levelNum <= 1) {
          levelObj = {
            key: 'weak',
            desc: '弱',
          };
        } else if (levelNum > 1 && levelNum <= 2) {
          levelObj = {
            key: 'middle',
            desc: '中',
          };
        } else {
          levelObj = {
            key: 'strong',
            desc: '强',
          };
        }
        return levelObj;
      }
    } else {
      return '';
    }
  };

  render() {
    const { className = '', levelType = '' } = this.props;
    return (
      <div className={`fw-level ${className}`}>
        <>
          {levelType === 'password' && (
            <>
              {this.getLevel()?.key === 'weak' && (
                <>
                  <div className="item active"></div>
                  <div className="item"></div>
                  <div className="item"></div>
                </>
              )}
              {this.getLevel()?.key === 'middle' && (
                <>
                  <div className="item active"></div>
                  <div className="item active"></div>
                  <div className="item"></div>
                </>
              )}
              {this.getLevel()?.key === 'strong' && (
                <>
                  <div className="item active"></div>
                  <div className="item active"></div>
                  <div className="item active"></div>
                </>
              )}
              <div>{this.getLevel()?.desc ?? ''}</div>
            </>
          )}
        </>
      </div>
    );
  }
}

export default FwLevel;
