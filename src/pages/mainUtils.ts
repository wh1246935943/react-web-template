import { buildTree } from '@/utils/utils';
import routes, { getLocRouteByCode, LocRoute } from '../../config/routes/index';
import { history } from 'umi';
import { pathToRegexp } from 'path-to-regexp';

type ClientType = 'PCWEB' | 'ANDROID' | 'WEIAPP';
type MenuType = 'MENU';

enum MenuStatus {
  ENABLE = '启用',
  DISABLE = '禁用',
}

type Status = keyof typeof MenuStatus;
type StatusDesc = typeof MenuStatus[Status];

export interface MenuItem {
  clientType: ClientType;
  code: string;
  gmtCreated: string;
  id: string;
  menuStatus: Status;
  menuStatusDesc: StatusDesc;
  menuType: MenuType;
  name: string;
  order: number;
  parentCode: string;
  resourcePath: string;
}
/**
 * 用于动态获取菜单那列表中得第一个子菜单，
 */
export function getFristPagePath(menuList: MenuItem[]) {
  const menusTree = buildTree(menuList);
  let code = '';

  const findFristCode = (menuList: any) => {
    for (let index = 0; index < menuList?.length; index++) {
      if (code) return;

      const item = menuList[index];
      if (!item?.subMenu?.length) {
        code = item.code;
        return;
      }

      findFristCode(item?.subMenu);
    }
  };

  findFristCode(menusTree);

  let { path } = getLocRouteByCode(code);

  return path;
}

interface GetRouterInfoByPathnameParams {
  locMenusTree?: any;
  pathname?: string;
  callback?: (a: LocRoute, b: LocRoute) => void;
}

/**
 * 通过浏览器地址栏路径获取路由表中的路由信息
 * 实现过程为：
 *  通过path-to-regexp，将其转化为path正则
 *  去本地路由表中匹配本地路由path找到当前地址栏路径对应的路由信息
 */
export const getRouterInfoByPathname = (
  params = {} as GetRouterInfoByPathnameParams,
): void => {
  const { locMenusTree = routes, callback } = params;

  const {
    query: { pageName },
  }: any = history.location;

  let { pathname } = params;
  if (!pathname) {
    pathname = history.location.pathname;
  }

  /**
   * 递归本地路由表，查找匹配合适的即为当前路由
   * 拿到code，设置导航选中状态
   */
  for (let index = 0; index < locMenusTree.length; index++) {
    const locMenuItem = locMenusTree[index];
    const str = pathToRegexp(locMenuItem.path);
    /**
     * 验证当前地址栏路径是否存在与本地路由表中
     * 这里通过str这个正则表达式来匹配
     */
    if (str.test(pathname) && locMenuItem.code) {
      let showMenuInfo = {} as LocRoute;
      /**
       * 查找当前路由信息对应的导航条父菜单code
       * 用于航导航条的选中效果
       */
      findMenubarCode(locMenuItem.code);
      /**
       *
       * @param code - 通过code它对应的菜单是否为授权菜单项目，
       * 只有包含showMenu: true字段的菜单为授权菜单
       * 这样的菜单将展示在顶部的导航条上
       */
      function findMenubarCode(code: string) {
        /**
         * 如果递归的菜单拥有父菜单且自己并不是授权菜单项
         * 则使用该菜单的父菜单code继续查找是否为授权菜单
         * 如果是则停止查找，此时我们已经拿到了当前地址栏路径对应的路由表中的信息
         * 且已经拿到该菜单的最靠近的授权的父菜单信息，因为这是一个树结构，父菜单可能是多级的
         * 所以称为最靠近的
         * 该父菜单中的code传给antd，会自动选中每一级对应的菜单项，具体查看Main.tsx中构造导航条的逻辑
         */
        const showMenuItem = getLocRouteByCode(code, locMenusTree);
        const { parentCode, showMenu } = showMenuItem;

        if (showMenu) {
          showMenuInfo = showMenuItem;
          return;
        }

        if (parentCode) findMenubarCode(showMenuItem.parentCode);
      }

      if (typeof callback === 'function') {
        callback({ ...locMenuItem, pageName }, showMenuInfo);
      }

      return;
    }
    if (locMenuItem?.routes?.length) {
      getRouterInfoByPathname({
        ...params,
        locMenusTree: locMenuItem.routes,
      });
    }
  }
};
