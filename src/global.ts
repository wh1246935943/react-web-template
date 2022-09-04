import moment from 'moment';
import projectConfig from './projectConfig';

window.fwProjectConfig = projectConfig;

/**
 * 为数组扩展删除条目的方法，这个方放将修改原数组
 * @param item 数组中要被删除的数据
 * @return 返回被删除的数据在数组中的位置，即索引
 */
Array.prototype.delItem = function (item) {
  const i = this.indexOf(item);

  if (i === -1) return -1;

  this.splice(i, 1);

  return i;
};

/**
 * 时间区间24小时
 */
window.getTimeInterval = function (
  param = 168,
  dateFormat = 'YYYY-MM-DD HH:mm:ss',
) {
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
 */
window.imgError = function (e, src) {
  const img: any = e.target;
  img.src = src ?? require('@/assets/img_error.png');
  img.onerror = null;
  img.style.pointerEvents = 'none';
  img.style.cursor = 'default';
};

/**
 * 判断数据类型
 */
window.typeOf = function (data) {
  const toString = Object.prototype.toString;
  const map: { [key: string]: DataType } = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
    '[object FormData]': 'formData',
  };

  return map[toString.call(data)];
};
