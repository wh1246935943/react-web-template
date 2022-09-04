import { isArray } from 'lodash';
import React from 'react';
import { Image } from 'antd';

import './style.less';

const stateDesc = {
  0: '失败',
  1: '执行中',
  2: '未完成',
  3: '完成',
};

const trayImgs = {
  0: require('./assets/失败l.png'),
  1: require('./assets/执行中l.png'),
  2: require('./assets/已完成l.png'),
};

class FwTimeLine extends React.Component {
  static defaultProps = {
    isScroll: '',
    id: '',
    list: [],
    type: 'standard', // 标准： standard； 内容为图片 image; 内容为视频： video
    onClick: () => undefined,
  };

  render() {
    const { list, type, onClick, id, isScroll } = this.props;
    return (
      <dl
        className={`fw-timeline ${list.length ? 'fw-timeline_line' : ''} ${
          isScroll ? 'scroll' : ''
        }`}
        id={id}
      >
        {list.length === 0 && (
          <img
            onError={window.imgError}
            className="fw-empty-img"
            src={require('../assets/no_data.png')}
            alt=""
          />
        )}
        {list.map(
          ({ time, name, info, state, src, itemTitle, isCustom }, index) => {
            let urllist = src;
            if (!isArray(src)) urllist = [src];
            urllist;
            return (
              <dd key={index}>
                <i></i>
                <div
                  className="fw-timeline_content"
                  onClick={() => onClick(list[index], index)}
                >
                  {type === 'standard' ? (
                    <div>
                      <p>{time}</p>
                      <p className={`type-${state}`}>
                        {name}：{info}
                      </p>
                      {/* <p className={`type-${state}`}>{info}</p> */}
                    </div>
                  ) : (
                    <div className={`img-content-box box${urllist.length}`}>
                      {urllist.map((item, index) => (
                        <Image
                          key={index}
                          className={
                            urllist.length === 1
                              ? 'img-content1'
                              : 'img-contentX'
                          }
                          onError={window.imgError}
                          src={item}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className={`img-tray-box ${type}`}>
                  <span>
                    {type === 'standard' && !isCustom
                      ? stateDesc[state]
                      : itemTitle}
                  </span>
                  <img
                    onError={window.imgError}
                    src={
                      ['image', 'video'].includes(type)
                        ? require('./assets/执行中l_1.png')
                        : trayImgs[state] || trayImgs['1']
                    }
                    className={index % 2 === 0 ? '' : 'flip-img'}
                  />
                </div>
              </dd>
            );
          },
        )}
      </dl>
    );
  }
}

export default FwTimeLine;
