import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';

import { Spin } from 'antd';

import './style.less';

const CLASS_NAME = 'fw-spin-container';

class FwSpin extends PureComponent {
  /**
   * 展示loading
   */
  static show(params = {}) {
    const {
      tip = '',
      size = 'large',
      className = CLASS_NAME, // 默认的类名,该类名用于关闭loading，当一个页面存在多个区域的loading状态时，可传入不同的类名以区分loading
      parentClassName = '', // 要将loading挂在到的位置，如果该值为空，则挂在到body上
    } = params;

    /**
     * 检查同一个挂载点是否存在loading,
     * 如果有则不再创建loading
     * 注意：局部loading和全局的loading是可以同时存在的
     */
    let spinDiv = null;
    if (parentClassName) {
      spinDiv = document.querySelector(`.${parentClassName} .${className}`);
    } else {
      spinDiv = document.querySelector(`.${className}`);
    }
    if (spinDiv) return;

    /**
     * 创建loading的容器，
     * 并设置为指定的className
     */
    const div = document.createElement('div');
    div.className = className;

    /**
     * loading要挂在到页面的什么位置
     * 默认为body
     * 并处理可能出现的查不到挂在节点的错误
     */
    const localLoadContainer = !!parentClassName
      ? document.querySelector(`.${parentClassName}`)
      : null;
    const mountSite = localLoadContainer ?? document.body;
    /**
     * 因为loading组件时绝对定位到挂载节点内的
     * 为挂载的节点添加相对定位属性
     */
    if (localLoadContainer) mountSite.classList.add('common-relative');

    mountSite.appendChild(div);

    ReactDOM.render(
      <Spin spinning size={size} className="fw-g-spin" tip={tip} />,
      div,
    );
  }

  /**
   * 关闭loading
   */
  static close = (params = {}) => {
    const {
      className = CLASS_NAME,
      parentClassName = '',
      closeAll = false,
    } = params;

    let spinDiv = null;

    /**
     * 关闭一打开的所有loading
     */
    if (closeAll) {
      spinDiv = document.querySelectorAll(`.fw-g-spin`);
      spinDiv.forEach((item) => {
        const unmountResult = ReactDOM.unmountComponentAtNode(item);
        if (unmountResult) item.parentElement.removeChild(item);
      });
      return;
    }

    // if (parentClassName) {
    //   spinDiv = document.querySelector(`.${parentClassName} .${className}`);
    // } else {
    // };
    spinDiv = document.querySelector(`.${className}`);
    if (!spinDiv) return;

    const localLoadContainer = !!parentClassName
      ? document.querySelector(`.${parentClassName}`)
      : null;
    const mountSite = localLoadContainer ?? document.body;
    /**
     * 局部loading挂载时为他的容器节点添加了相对定位属性，
     * 卸载loading同时移除该属性
     */
    if (localLoadContainer) mountSite.classList.remove('common-relative');

    const unmountResult = ReactDOM.unmountComponentAtNode(spinDiv);

    if (unmountResult) {
      mountSite.removeChild(spinDiv);
    }
  };

  render() {
    const { className = '', tip = '', size = 'large' } = this.props;
    return (
      <Spin spinning size={size} className={`g-spin ${className}`} tip={tip} />
    );
  }
}

export default FwSpin;
