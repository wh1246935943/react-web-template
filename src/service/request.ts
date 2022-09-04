import { extend } from 'umi-request';
import { stringify } from 'qs';
import { message } from 'antd';
import { FwSpin } from '@/components';
import lodash from 'lodash';
import Cookies from 'js-cookie';
import { history } from 'umi';

const LOGOUT_URL = fwProjectConfig['noCertificationRequiredApis'][1];
const LOGIN_PATHNAME = fwProjectConfig['LOGIN_PATHNAME'];

/**
 * 无需校验sessionId的请求
 */
const noSessionIdUrl = fwProjectConfig['noCertificationRequiredApis'];

const methodsInfo = fwProjectConfig['defaultMsg'];

type Methods = typeof methodsInfo;

export const umiRequest: any = extend({
  credentials: 'same-origin',
  parseResponse: false,
});

interface ErrorInfo {
  status?: number;
  requestUrl?: string;
}

interface RequestFailed extends ErrorInfo {
  requestFailed?: boolean;
  message?: string;
}

export function routeByErrorcode(errorInfo = {} as ErrorInfo): void {
  let { status = 401, requestUrl = '' } = errorInfo;

  const statusCode = {
    401: LOGIN_PATHNAME,
    // 403: '/403',
    // 404: '/404',
    // 500: '/500',
  };
  type StatusCode = keyof typeof statusCode;

  /**
   * 判断请求响应状态是否需要做路由操作
   */
  if (!statusCode[status as StatusCode]) return;

  /**
   * 定义history.replace参数对象
   */
  const param: { pathname: string; search?: string } = {
    pathname: statusCode[status as StatusCode],
  };

  if (status === 401) {
    Cookies.remove('sessionId');
    Cookies.remove('userId');
    /**
     * 当前处于登录页面则无需再次跳转
     */
    if (
      [LOGIN_PATHNAME, `${LOGIN_PATHNAME}/`, '/'].includes(
        history.location.pathname,
      )
    ) {
      if (history.location.pathname === '/') history.replace(LOGIN_PATHNAME);
      return;
    }

    // 是否记录当前所在页面
    if (!fwProjectConfig['rememberCurrentPath']) {
      return;
    }

    /**
     * 并记录当前所在页面的地址，用户再次登录时能回到当前页面中
     */
    if (!Object.values(statusCode).includes(history.location.pathname)) {
      param.search = stringify({ redirect: window.location.href });
    }
  }

  history.replace(param);
}

export interface PrivateState {
  _isMsg?: boolean; // 是否展示提示
  _msg?: string; // 提示信息
  _loading?: boolean; // 是否展示loading
  _backResponse?: boolean; // 是否返回完整的Response，request默认对返回数据做简化返回给上层
  _backErrorData?: boolean; // 接口如果报错，是否返回报错信息
  _loadingContainer?: string; // loading加载到那个容器中，他的值是css 选择器
  _isPaging?: boolean; // 该接口是否为分页查询接口，
  _isList?: boolean; // 该接口返回的是不是一个列表，
  _body?: any; // 直接传入，不需要用params.data接收的参数,比如接口参数直接就要传入一个数组那样的参数
}

export interface Payload extends PrivateState {
  [key: string]: any;
}

interface Options {
  method?: Methods;
  data?: Payload;
  headers?: {
    'TA-Client-Info': string;
  };
}

const requestFailed = {
  requestFailed: true,
  message: '登录状态已过期',
  status: 401,
  requestUrl: '',
};

type RequestInterceptorsBack = Options & RequestFailed;

/**
 * 请求拦截器
 * 这里会做一些请求前的检查，和请求头的补全
 */
const requestInterceptors = (
  url: string,
  options: Options,
): RequestInterceptorsBack => {
  const sessionId: string | undefined = Cookies.get('sessionId');
  /**
   * 构造请求头，并返回
   */
  const headers = {
    'TA-Client-Info': JSON.stringify({
      sessionId: Cookies.get('sessionId'),
      clientType: 'PCWEB',
    }),
  };

  if (fwProjectConfig.noCertificationRequiredAll) {
    return { ...options, headers };
  }
  /**
   * 处理登录凭证不存在的情况
   */
  if (!sessionId) {
    /**
     * 非登录接口时，弹出错误提示
     */
    if (!noSessionIdUrl.includes(url)) {
      /**
       * 非登录接口请一律跳转到登录页面
       */
      routeByErrorcode();
      /**
       * 如果是退出登录接口，则抛出错误结束程序，结束请求
       */
      if (url === LOGOUT_URL) {
        throw '登录状态缺失,已经忽略退出登录请求';
      }

      /**
       * 弹出错误提示
       */
      requestFailed.requestUrl = url;
      checkAntNotification(requestFailed);

      /**
       * 返回默认的错误信息
       */
      return requestFailed;
    }
  } else {
    /**
     * 处理登录凭证存在的情况下退出登录的逻辑
     * 退出登录时不管后端返回成功与失败，前端都要主动跳转到登陆页面
     * 即使接口报错也不应该提示，这个提示错信息的处理逻辑在返回拦截器中处理
     */
    if (url === LOGOUT_URL) {
      setTimeout(() => {
        routeByErrorcode();
      }, 100);
    }
  }

  return { ...options, headers };
};

/**
 * 返回拦截器
 * 这里会做一些返回后异常处理，如路由跳转、错误提示
 */
const responseInterceptors = (
  response: any,
  path: string,
  privateState: PrivateState,
  method: Methods,
) => {
  const {
    _loading,
    _loadingContainer,
    _msg,
    _isPaging,
    _isList,
    _isMsg,
    _backErrorData,
  } = privateState;

  return new Promise(async (resolve, reject) => {
    try {
      var data = await response.clone().json();
    } catch (error) {
      data = {
        status: response.status,
        message: response.statusText,
      };
    } finally {
      // 关闭loading
      if (_loading) FwSpin.close({ parentClassName: _loadingContainer });
    }

    if (response.status && response.status === 200) {
      if (_isMsg && method !== 'GET')
        message.success(_msg ? _msg : methodsInfo[method]);

      if (privateState?._backResponse) {
        resolve(response);
        return;
      }

      if (_isPaging && !Array.isArray(data.body)) {
        resolve({ body: [], total: 0 });
        return;
      }

      if (_isList && !Array.isArray(data)) {
        resolve([]);
        return;
      }

      resolve(data);
    } else {
      /**
       * 退出登录的路由跳转逻辑已经在请求拦截器中处理
       * 又退出登录接口即使报错也不提示
       * 所以这里只处理非退出登录的接口错误提示和页面跳转
       */
      if (path !== LOGOUT_URL) {
        checkAntNotification(data);
        routeByErrorcode({ status: data.status });
      }

      /**
       * 返回请求失败的错误信息
       */
      if (_backErrorData) {
        resolve({ ...data, requestFailed: true });
      }

      reject(data.message);
    }
  });
};

/**
 * 如果页面已经存在同一个错误提示框时，
 * 当再次出现相同的错误，则不再展示
 */
const checkAntNotification = (data: RequestFailed): void => {
  const antNotification = document.querySelector(
    `.ant-message-notice-error_${data.status}`,
  );
  if (!antNotification) {
    message.error({
      content: data.message ? data.message : fwProjectConfig['errorMsg'],
      className: `ant-message-notice-error_${data.status}`,
    });
  }
};

/**
 * @param { string } url
 * @param { httpRequestMethod } method
 * @param { object } payload
 */
async function request<T>(
  url: string,
  payload?: Payload | Methods,
  method: Methods = 'GET',
): Promise<any> {
  /**
   * 删除用于处理前端逻辑的私有属性，避免被提交到后端
   * 这些字段默认是以下划线 _ 开头的,并将这些属性保存在私有状态集合中
   */
  const privateState: PrivateState = {
    _isMsg: true, // 是否展示提示
    _msg: '', // 提示信息
    _loading: true, // 是否展示loading
    _backResponse: false, // 是否返回完整的Response，request默认对返回数据做简化返回给上层
    _backErrorData: false, // 接口如果报错，是否返回报错信息
    _loadingContainer: '', // loading加载到那个容器中，他的值是css 选择器
    _isPaging: false, // 该接口是否为分页查询接口，
    _isList: false, // 该接口返回的是不是一个列表，
    _body: null, // 直接传入，不需要用params.data接收的参数
  };

  let params: Payload = {};

  if ((payload as Payload)?._body) {
    params = (payload as Payload)?._body;
  } else if (typeOf(payload) === 'undefined') {
    params = {};
  } else if (['GET', 'POST', 'PUT', 'DELETE'].includes(payload as Methods)) {
    params = {};
    method = payload as Methods;
  } else if (typeOf(payload) === 'object') {
    params = lodash.cloneDeep(payload) as Payload;
  } else if (typeOf(payload) === 'array') {
    params.data = lodash.cloneDeep(payload) as Payload;
  } else if (typeOf(payload) === 'formData') {
    params = payload as Payload;
    /**
     * 拿到formData的所有key,
     * 检查如果key的第一个字符为 _
     * 则用它的value更新privateState，
     * 并删除入参中的包含的前端私有属性
     */
    for (let key of params.keys()) {
      if (key.charAt(0) === '_') {
        const value = params.get(key);
        /**
         * 对于Boolean类型的数据，拿到的value为字符串类型，将其转为Boolean
         */
        if (['true', 'false'].includes(value)) {
          privateState[key as keyof PrivateState] = JSON.parse(value);
        } else {
          privateState[key as keyof PrivateState] = value;
        }
        params.delete(key);
      }
    }
  }

  /**
   * 删除入参中包含前端的私有属性
   */

  Object.keys(params).forEach((key: string): void => {
    if (key.charAt(0) === '_') {
      privateState[key as keyof PrivateState] = params[key];
      delete params[key];
    }
  });

  /**
   * 统一将时间区间修改为每天得开始时间和每天得结束时间
   */
  let { startTime, endTime } = params;
  if (startTime && endTime) {
    let isStringST = typeof startTime === 'string';
    let isStringET = typeof endTime === 'string';
    if (isStringST && isStringET) {
      const st = startTime.split(' ');
      const et = endTime.split(' ');
      st.splice(1, 1, '00:00:00');
      et.splice(1, 1, '23:59:59');

      params.startTime = st.join(' ');
      params.endTime = et.join(' ');
    }
  }

  const { _loading = true, _loadingContainer = '' } = privateState;

  type Fns = Record<Methods, () => [string, Payload]>;

  const fns: Fns = {
    POST: () => [url, params],

    DELETE: () => {
      let newUrl = url,
        newParam = params;

      /**
       * 判断删除的参数为字符串则将参数放在路径中，
       * 参数为数组，则为批量删除，将参数放在data
       */
      if (typeOf(params.data) === 'array') {
        newParam = params.data;
      }

      return [newUrl, newParam];
    },

    PUT: () => [url, params],

    GET: () => [
      `${url}?${stringify(params, { arrayFormat: 'repeat' })}`,
      params,
    ],
  };

  // 通过请求方式构建请求参数，和url
  const [reqUrl, reqParams] = fns[method] && fns[method].call({});

  /**
   * 请求拦截器中如果检查出错误
   * 则直接弹出错误提示，并将错误信息返回给上层调用模块
   */
  const options: RequestInterceptorsBack = requestInterceptors(reqUrl, {
    method,
    data: reqParams,
  });
  if (options.requestFailed) {
    return options;
  }

  // 展示loading
  if (_loading) FwSpin.show({ parentClassName: _loadingContainer });

  // 发起请求
  const response = await umiRequest(`${reqUrl}`, options);

  // 返回请求成功的数据
  return await responseInterceptors(response, reqUrl, privateState, method);
}

export default request;
