import { message } from 'antd';
import Cookies from 'js-cookie';
import { history } from 'umi';
import { stringify, parse } from 'qs';
import moment from 'moment';
import { debounce } from 'lodash';
import homeIcon from '@/assets/logo.png';
import lodash from 'lodash';

/**
 * 图片大小、格式校验(现阶段大小格式都做校验)
 * @param { number } size - 限制图片的大小
 * @param { array } formats - 限制图片的格式
 * @param { FILE } file - 图片的流文件
 */
export function fileFormatCheck({
  size = 5,
  formats = ['jpeg', 'png', 'jpg', 'svg'],
  file,
}) {
  if (!file && !file.name) {
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
  const contentNode = document.querySelector(`${key} ${content}`);
  const { offsetHeight, childNodes } = contentNode;

  // 获取滚动容器的高度
  let containerH = 0;
  if (container)
    containerH = document.querySelector(`${key} ${container}`).offsetHeight;
  else containerH = contentNode.parentNode.offsetHeight;

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
    if (item['roll-id'] === nodeKey) item.remove();
  });

  // 创建一个style标签
  const style = document.createElement('style');
  // 创建这个style标签的内容，也就是滚动所需要的动画
  const keyframeName = nodeKey.match(/\w+/g).join('');
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
// 数组去重
export function arrayUnique(Arr, key) {
  var hash = {};
  Arr = Arr.reduce(function (arr, current) {
    hash[current[key]] ? '' : (hash[current[key]] = true && arr.push(current));
    return arr;
  }, []);
  return Arr;
}

/**
 * 将毫秒格式化为天/时/分/秒,
 * 并实现倒计时返回
 * @param {number} time - 毫秒数
 */
export function getTimeStr(time) {
  // const tempTime = moment.duration(millisecond);
  // const timsTypes = {
  //   months: days()
  //   days: days()
  // }

  const timsTypes = [
    { unit: '天', value: parseInt(time / (1000 * 60 * 60 * 24), 10) },
    {
      unit: '时',
      value: parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10),
    },
    {
      unit: '分',
      value: parseInt((time % (1000 * 60 * 60)) / (1000 * 60), 10),
    },
    { unit: '秒', value: (time % (1000 * 60)) / 1000 },
  ];
  let timeStr = '';
  timsTypes.forEach((item) => {
    if (item.value) {
      timeStr = `${timeStr + item.value + item.unit}`;
    }
  });
  return timeStr;
}

const intervals = {};
/**
 * @param {number} mss - 毫秒数
 * @param {id} mss - 用于获取节点的id
 */
export function formatDuring(mss, id, isCountdown = true) {
  const spanNode = document.getElementById(`${id}_countdown`);
  if (!mss || !spanNode) return;
  let time = mss;
  spanNode.innerText = `(${getTimeStr(time)})`;
  if (!isCountdown) return;
  clearInterval(intervals[id]);
  delete intervals[id];
  intervals[id] = setInterval(() => {
    spanNode.innerText = `(${getTimeStr(time)})`;
    time -= 1000;
    if (time <= 0) {
      clearInterval(intervals[id]);
      delete intervals[id];
    }
  }, 1000);
}

export function setBrowserTab(param = {}) {
  const { title = '秦始皇陵监测平台-登录', icon } = param;

  const urlReg =
    /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;

  let href = homeIcon;

  if (urlReg.test(icon)) href = icon;

  const browserTabIcon = document
    .querySelector('head')
    .querySelector('link[rel="icon"]');

  if (!browserTabIcon) {
    var head = document.getElementsByTagName('head')[0],
      link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.href = href;
    head.appendChild(link);
  } else {
    browserTabIcon.href = href;
  }

  document.title = title;
}

/**
 * 定时器功能
 * 远程控制、智能灌溉页面需要定时刷新数据
 */
const timers = [];

export function timer({
  callback = () => {},
  param = null,
  time = 3000,
  pagePath = '',
}) {
  timers.forEach((name) => clearTimeout(name));

  if (history.location.pathname !== pagePath) return;

  const t = setTimeout(() => {
    param ? callback(param) : callback();
  }, time);

  timers.push(t);
}

/**
 * 获取时间区间（时间段）
 * @param { string } - days   days 传n表示前n天
 * @param { string } - date   要处理的日期
 */
export function getTimePeriod(days = 0) {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  let startYear = startDate.getFullYear();
  let startMonth =
    startDate.getMonth() + 1 < 10
      ? '0' + (startDate.getMonth() + 1)
      : startDate.getMonth() + 1;
  let startDay =
    startDate.getDate() < 10 ? '0' + startDate.getDate() : startDate.getDate();

  let endDate = new Date();
  let endYear = endDate.getFullYear();
  let endMonth =
    endDate.getMonth() + 1 < 10
      ? '0' + (endDate.getMonth() + 1)
      : endDate.getMonth() + 1;
  let endDay =
    endDate.getDate() < 10 ? '0' + endDate.getDate() : endDate.getDate();

  // 开始时间
  let startTime = `${startYear}-${startMonth}-${startDay} 00:00:00`;
  // 结束时间
  let endTime = `${endYear}-${endMonth}-${endDay} 23:59:59`;
  // 时间段
  let timePeriod = {
    startTime,
    endTime,
  };
  return timePeriod;
}

/**
 * 文件下载
 */
export function downloadFile(resps = []) {
  let result = resps.map(async (resp) => {
    let blob = null,
      filename = `file_${moment().format('YYYY-MM-DD HH:mm:ss')}`;
    if (resp.blob && resp.headers) {
      filename =
        resp.headers.get('content-disposition')?.split(';')[1]?.split('=')[1] ??
        filename;
      blob = await resp.blob();
      if (!blob?.size) {
        message.error('该时间区间下暂无数据');
        return;
      }
    } else {
      blob = new Blob([resp], { type: 'text/plain' });
    }

    const link = document.createElement('a');
    link.download = decodeURIComponent(filename);
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);

    document.body.removeChild(link);
  });
  return result;
}

export function saveIamge(src, name) {
  var image = new Image();
  // 解决跨域 Canvas 污染问题
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    const url = canvas.toDataURL('image/png');
    // 生成一个a元素
    const a = document.createElement('a');
    // 创建一个单击事件
    const event = new MouseEvent('click');
    // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
    a.download = name || `img_${moment().format('YYYY-MM-DD HH:mm:ss')}`;
    // 将生成的URL设置为a.href属性
    a.href = url;
    // 触发a的单击事件
    a.dispatchEvent(event);
  };
  image.src = src;
}

export function buildTree(data = [], props = {}) {
  const {
    pId = 'parentCode', // 数据的父节点字段，
    id = 'code', // 数据的自身唯一标识
    keepChildren = false, // 该菜单下如果不存在子菜单，是否创建子菜单的集合，也就是children参数
    children = 'subMenu', // 返回的树结构中创建的子菜单的字段名
    // order = ['order'], // 用来排序的字段
    // order = ['order']
  } = props;
  /**
   * 深拷贝数据，避免更改原始数据
   * 并筛选出根节点
   */
  const deepCopy = JSON.parse(JSON.stringify(data));
  const treeRoot = lodash.orderBy(
    deepCopy.filter((node) => {
      if (!node?.[pId]) {
        node.treeCode = node[id];
        return true;
      }
    }),
    ['order'],
    ['asc'],
  );

  // 递归生成节点及子节点数据
  const findChildren = (tree) => {
    tree.forEach((node) => {
      /**
       * 从原始数据中筛选其子元素
       */
      node[children] = lodash.orderBy(
        deepCopy.filter((cNode) => {
          if (cNode[pId] === node[id]) {
            cNode.treeCode = `${node.treeCode}-${cNode[id]}`;
            return true;
          }
        }),
        ['order'],
        ['asc'],
      );

      /**
       * 如果子元素集合存在且有内容，
       * 则递归继续查找其子元素是否还包含有子元素
       */
      if (node?.[children]?.length) {
        findChildren(node[children]);
        /**
         * 如果该元素下没有子元素是否保留其子元素的集合
         */
      } else if (!keepChildren) {
        delete node[children];
      }
    });
  };

  findChildren(treeRoot);

  return treeRoot;
}

// 根据文件URL后缀名获取文件类型
export function getFileTypeByFileUrl(fileUrl = '') {
  if (!fileUrl) {
    return false;
  }
  let start = fileUrl.lastIndexOf('.') + 1;
  let fileType = fileUrl.substr(start);
  return fileType;
}
// 根据名称返回时间
export function getTimeScope(type) {
  const scopeType = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
  if (scopeType.includes(type)) {
    type = type.toLocaleLowerCase();
    const startTime = moment().startOf(type).format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment().endOf(type).format('YYYY-MM-DD HH:mm:ss');
    return { startTime, endTime };
  }
}
