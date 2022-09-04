import moment, { Moment } from 'moment';
import { message } from 'antd';
import { stringify, parse } from 'qs';

interface TimeInterval {
  endTime: string;
  startTime: string;
  timeMoment: Moment[];
  format: (m: Moment, t: string) => string;
}

/**
 * 用来获取一个时间区间，获取逻辑为从当前时间往前推指定时长
 * @param param 往前推多少小时
 * @param dateFormat 处理格式
 * @return 返回的对象属性包含: 开始时间、结束时间, 开始时间、结束时间moment对象集合, format方法
 */
export const getTimeIntervalTest = function (
  param: number = 168,
  dateFormat: string = 'YYYY-MM-DD HH:mm:ss',
): TimeInterval {
  const e = moment().format(dateFormat);
  const s = moment().subtract(param, 'hours').format(dateFormat);

  return {
    endTime: e,
    startTime: s,
    timeMoment: [moment(s, dateFormat), moment(e, dateFormat)],
    format: function (m, t = dateFormat) {
      return m.format(t);
    },
  };
};

/**
 * 图片错误时的处理程序
 * @param e 图片error事件的event返回值
 * @param src 自定义图片路径
 */
export const imgError = (e: Event, src?: string) => {
  const img: any = e.target;
  img.src = src ?? require('@/assets/img_error.png');
  img.onerror = null;
  img.style.pointerEvents = 'none';
  img.style.cursor = 'default';
};

interface FileFormatCheck {
  size: number;
  formats: string[];
  file: File;
}
/**
 * 图片大小、格式校验(现阶段大小格式都做校验)
 * @param { number } size - 限制图片的大小
 * @param { array } formats - 限制图片的格式
 * @param { FILE } file - 图片的流文件
 * @return { boolean } 是否符合要求
 */
export function fileFormatCheck({
  size = 5,
  formats = ['jpeg', 'png', 'jpg', 'svg'],
  file,
}: FileFormatCheck) {
  if (!file || !file.name) {
    message.error(`文件格式错误`);
    return false;
  }

  const isFormat = formats.includes(file.name.split('.')[1]);
  if (!isFormat) {
    message.error(`文件格式错误，请选择${formats.join('、')}格式的文件`);
    return false;
  }

  const isSize = file.size / (1024 * 1024) <= size;
  if (!isSize) {
    message.error(`请选择不大于${size}M的文件`);
    return false;
  }
  return true;
}

/**
 * 获取url参数
 */
export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

/**
 * 为指定元素设置滚动
 * @param { classname } key - 每个滚动元素得全局唯一标识，这个类名需要设置再滚动容器得父节点，
 *                            key必须传入，否则极易造成样式污染
 * @param { classname } content - 滚动内容得选择器，用于确定那个内容要滚动
 * @param { classname } container - 滚动容器选择器，滚动得内容要再那个容器中滚动,如果不传入则取content的父节点
 * @param { number } speed - 滚动得速度，1为基准，如果想快则设置小于1得数，想满则设置大于1得数
 * @param { boolean } paused - 鼠标划入滚动容器时，滚动是否要暂停
 */
export function setRollEffect({
  key = '',
  content = '',
  container = '',
  speed = 1,
  paused = true,
}) {
  // 获取滚动内容的高度，并拿到滚懂得元素节点
  const contentNode = document.querySelector(
    `${key} ${content}`,
  ) as HTMLElement;
  const { offsetHeight, childNodes } = contentNode;

  // 获取滚动容器的高度
  let containerH = 0;
  if (container)
    containerH = (document.querySelector(`${key} ${container}`) as HTMLElement)
      .offsetHeight;
  else containerH = (contentNode.parentNode as HTMLElement).offsetHeight;

  const nodeKey = key ? key : content;

  // 当容器高度大于滚动内容的高度时，无需滚动
  if (containerH >= offsetHeight) {
    const rstyle = document.querySelector(`head style[roll-id="${nodeKey}"]`);
    rstyle?.remove();
    return;
  }
  // 将滚动的内容复制一份插入到末尾
  childNodes.forEach((item, index) => {
    if (index !== 0) contentNode.append(item.cloneNode(true));
  });

  /**
   * 获取所有滚动标识的样式表
   */
  const styleList = document.querySelectorAll('head style[roll-id]');
  styleList.forEach((item) => {
    if ((item as HTMLElement & { 'roll-id': string })['roll-id'] === nodeKey)
      item.remove();
  });

  // 创建一个style标签
  const style = document.createElement('style') as HTMLStyleElement & {
    'roll-id': string;
  };
  // 创建这个style标签的内容，也就是滚动所需要的动画
  const keyframeName = (nodeKey.match(/\w+/g) as RegExpMatchArray).join('');
  const keyFrames = `\
    @keyframes ${keyframeName} {\
      0% {\
        transform: translate3d(0, 0, 0);\
      }\
      100% {\
        transform: translate3d(0, -${offsetHeight}px, 0);\
      }\
    }`;

  // 移动20像素需要1s作为滚动速度的基准,以此计算出这个原始列表滚动完所需要的时间
  const animation = `
    ${key} .ant-table-body {
      overflow-y: hidden!important;\
    }\
    ${key} ${content} {\
      animation: ${
        (offsetHeight / 20) * speed
      }s ${keyframeName} linear infinite normal;\
    }\
    ${key} ${content}:hover {\
      animation-play-state: ${paused ? 'paused' : 'unset'};
    }\
  `;

  /**
   * 将构造好的动画样式内容赋给style，并将style样式表插入到head中
   * 并给style设置一个roll-id，当key不存在时取content作为roll-id
   * 这里为什么一定要添加一个roll-id，是为了当再次调用该方法时，给head中重复添加相同类名的css样式
   */
  style.innerHTML = keyFrames + animation;
  style.setAttribute('roll-id', nodeKey);
  style['roll-id'] = nodeKey;
  document.getElementsByTagName('head')[0].appendChild(style);
}
