import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import WeirdModal from './Weird';
import './style.less';

const modalParams = {
  maskStyle: {
    backgroundColor: 'unset',
  },
  cancelButtonProps: {
    danger: true,
    type: 'primary',
  },
};

class FwModal extends PureComponent {
  static show = (params = {}) => {
    const {
      fwModalId,
      content = null,
      onCancel = new Function(),
      ...rest
    } = params;

    const div = document.createElement('div');
    if (fwModalId) div.id = fwModalId;

    document.body.appendChild(div);

    const destroy = () => {
      onCancel();
      this.closeModal(fwModalId);
    };

    ReactDOM.render(
      <Modal
        getContainer={document.querySelector(`#${div.id}`)}
        destroyOnClose
        centered
        visible
        {...modalParams}
        {...rest}
        onCancel={destroy}
      >
        {content}
      </Modal>,
      div,
    );
  };

  static info = (params) => Modal.info({ ...modalParams, ...params });

  static success = (params) => Modal.success({ ...modalParams, ...params });

  static error = (params) => Modal.error({ ...modalParams, ...params });

  static warning = (params) => Modal.warning({ ...modalParams, ...params });

  static confirm = (params) => Modal.confirm({ ...modalParams, ...params });

  static closeModal = (id) => {
    const div = document.getElementById(id);
    if (!div) return;

    const unmountResult = ReactDOM.unmountComponentAtNode(div);

    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };

  render() {
    return <Modal destroyOnClose centered {...modalParams} {...this.props} />;
  }
}

FwModal.WeirdModal = WeirdModal;

export default FwModal;
