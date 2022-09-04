import React from 'react';

import './style.less';

class FwSimpleTimeLine extends React.Component {
  static defaultProps = {
    list: [],
    eventType: '',
    time: '',
    title: '',
    content: '',
    handleClick: () => {},
    scrollTop: 0,
    curIndex: 0,
    isAuto: true,
  };
  state = {};
  componentWillReceiveProps(nextProps) {
    this.setScrollTop(nextProps);
  }
  componentDidMount() {
    this.setScrollTop();
  }
  setScrollTop = (props = this.props) => {
    const { curIndex } = props;
    if (curIndex === 0) {
      this.refs.contBox.scrollTop = 0;
    }
  };

  handleTaskName = (item, index) => {
    const { handleClick } = this.props;
    handleClick(item, index);
  };

  render() {
    const {
      list = [],
      title,
      content,
      time,
      eventType,
      curIndex,
      isAuto,
    } = this.props;
    return (
      <div className="fw-simple-timeline">
        <div ref="contBox" className={`sim-timeline ${isAuto ? 'auto' : ''}`}>
          {list.map((item, index) => (
            <div className="content">
              <div className="left"></div>
              <div className="mid"></div>
              <div className="right">
                <div className="time">{item[time]}</div>
                <div className="line"></div>
                <div className="task">
                  {item.renderContent ? (
                    item.renderContent()
                  ) : (
                    <>
                      <span>{item[title]} </span>
                      <span>{item[eventType]} </span>
                      <span
                        className={`timeline-task-name ${
                          index === curIndex ? 'active' : ''
                        }`}
                        onClick={() => this.handleTaskName(item, index)}
                      >
                        {item[content]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default FwSimpleTimeLine;
