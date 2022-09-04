import React from 'react';
import ReactDOM from 'react-dom';
import Viewer from 'react-viewer';

class FwViewer {
  static show({
    images,
    noToolbar = true,
    noNavbar = true,
    visible = true,
    noClose = false,
  }) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const destroy = () => {
      ReactDOM.unmountComponentAtNode(div);
    };
    ReactDOM.render(
      <Viewer
        style={{ zIndex: 1024 }}
        visible={visible}
        noToolbar={noToolbar}
        noNavbar={noNavbar}
        rotatable={false}
        scalable={false}
        zoomRatio={0.5}
        noClose={noClose}
        onClose={destroy}
        render={<a>下载</a>}
        images={images}
        downloadInNewWindow
      />,
      div,
    );
    return destroy;
  }
}

export default FwViewer;
