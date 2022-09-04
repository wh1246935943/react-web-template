import request from '../../request';
/**
 * 通知
 */

export default {
  /**
   * 获取消息列表及消息总数
   */
  getMessageList(param = {}) {
    const {
      status = 'UNREAD',
      pageSize = 10000,
      pageNumber = 1,
      key = '',
    } = param;

    const resp = request('/army/pcweb/system/notice', {
      _isPaging: !!status,
      status,
      pageSize,
      key,
      pageNumber,
    });

    return resp;
  },
};
