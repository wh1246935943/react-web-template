import React, { Component } from 'react';
// import { Image } from 'antd';

import './style.less';

class FwPreview extends Component {
  static defaultProps = {
    filePath: '',
  };

  render() {
    const { filePath = '' } = this.props;
    let fileType = '';
    if (filePath) {
      let start = filePath.lastIndexOf('.') + 1;
      fileType = filePath.substr(start);
    }

    return (
      <div className="preview">
        {/* {['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif'].includes(fileType) && filePath && (
          <Image src={filePath} preview={false} />
        )} */}
        {['mp3', 'wav', 'm4a'].includes(fileType) && filePath && (
          <audio preload="auto" controls src={filePath}>
            <span className="err-tips">您的浏览器不支持。</span>
          </audio>
        )}
        {['webm', 'mp4', 'ogg', 'avi', 'mpg', 'nrg', 'mov'].includes(
          fileType,
        ) &&
          filePath && (
            <video preload="auto" controls src={filePath}>
              <span className="err-tips">您的浏览器不支持。</span>
            </video>
          )}
      </div>
    );
  }
}

export default FwPreview;
