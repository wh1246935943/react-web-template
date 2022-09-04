import React, { memo, useEffect, useState, ReactElement } from 'react';
import { useDispatch, history, useSelector } from 'umi';
import TopBar from './common/TopBar';
import { setBrowserTab } from '@/utils/utils';
import service from '@/service';
import { Breadcrumb, Menu } from 'antd';
import { FwTitleBar } from '@/components';
import { getLocRouteByCode, LocRoute } from '../../config/routes/index';
import { config as AmapReactConfig } from '@amap/amap-react';
import { getRouterInfoByPathname, getFristPagePath } from './mainUtils';
AmapReactConfig.key = '5ac1056fa7b5c88359c3764ba60611bb';

import './main.less';

const MainPage: React.FC = (props) => {
  const { children }: any = props;
  const dispatch = useDispatch();
  const { userInfo, locMenusTree } = useSelector(({ common }: any) => common);
  const [breadcrumbItems, setBreadcrumbItems] = useState<any>([]);
  const [menuCode, setMenuCode] = useState('');

  useEffect(() => {
    getRouterInfoByPathname({
      locMenusTree,
      callback: setRouterInfo,
    });
    /**
     * 监听路由变化，构建面包屑导航数据，
     * 注意注册路由监听，需要在菜单获取成功后添加注册事件
     * 否则函数内getRouterInfoByPathname参数始终为初始的空菜单列表
     */
    if (locMenusTree.length) {
      history.listen(() => {
        getRouterInfoByPathname({
          locMenusTree,
          callback: setRouterInfo,
        });
      });
    }
  }, [locMenusTree]);

  function setRouterInfo(a: LocRoute, b: LocRoute) {
    setMenuCode(b.code);

    buildBreadcrumbItems(a.code, a.pageName);
  }

  useEffect(() => {
    setBrowserTab();
    /**
     * 获取菜单列表
     * 这里的判断主要是避免登录跳转到主页后再次获取菜单列表
     * 但是当用户直接刷新页面时，会走这里的逻辑
     */
    if (locMenusTree.length === 0) {
      getMenu();
    }
    /**
     * 获取用户信息
     * 同上逻辑
     */
    if (!userInfo?.loginName) {
      getUserInfo();
    }

    window.getUnreadTotal = getUnreadTotal;
    window.getUnreadTotal();
  }, []);

  /**
   * 获取菜单列表
   */
  const getMenu = async () => {
    const resp = await service.common.getMenus({
      _isList: true,
    });

    if (!resp?.length) {
      return;
    }

    dispatch({
      type: 'common/setMenu',
      payload: resp,
    });

    /**
     * 如果用户直接输入域名重新加载页面
     * 则跳转到授权菜单的第一个页面
     */
    const currnetUrl = new URL(window.location.href);
    const { pathname } = currnetUrl;
    if (pathname === '/') {
      const path = getFristPagePath(resp);
      history.replace(path);
    }
  };

  /**
   * 获取未读消息总数
   */
  const getUnreadTotal = async () => {
    const resp = await service.message.message.getMessageList();
    if (resp)
      dispatch({
        type: 'common/setUnreadMessageTotal',
        payload: resp.total,
      });
  };

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    const resp = await service.common.getUserInfo();
    if (resp.loginName) {
      resp.userId = resp.id;
      dispatch({
        type: 'common/setUserInfo',
        payload: resp,
      });
    }
  };

  /**
   * 构造面包屑导航
   * @param routeCode 当前页面的路由code
   * @param pageName 当前页面的name，这里的name是跳转路由时通过query参数主动添加的
   */
  const buildBreadcrumbItems = (routeCode: string, pageName?: string) => {
    const nodes: LocRoute[] = [];
    /**
     * 查找当前code对应的路由信息，
     * 该路由如果有父节点，则通过parentCode向上递归查找
     * 直至找到所有当前路由的父节点，以此构造面包屑数据
     */
    const findAllParent = (code: string) => {
      const item = getLocRouteByCode(code, locMenusTree);
      let router = { ...item };

      /**
       * 这里对面包屑name做特殊处理，
       * 如果路由上携带pageName参数且有值，则优先使用pageName，
       * 否则使用接口菜单中存在的，最后使用本地路由表中的菜单name
       */
      if (router.code) {
        if (pageName && routeCode === router.code) {
          router.name = pageName;
        }

        nodes.unshift(router);
      }

      if (router.parentCode) findAllParent(router.parentCode);
    };

    findAllParent(routeCode);

    const list = nodes.map((route: LocRoute, index: number) => {
      const { routes, component, name, path } = route;
      if (routes?.length) {
        return (
          <Breadcrumb.Item
            key={route.name}
            // overlay={buidBreadcrumbItemMenu(routes, routeCode)}
          >
            {name}
          </Breadcrumb.Item>
        );
      }
      return (
        <Breadcrumb.Item key={route.name}>
          {(() => {
            if (index === nodes.length - 1) return name;

            if (component) {
              return <a onClick={() => history.push(path)}>{name}</a>;
            }

            return name;
          })()}
        </Breadcrumb.Item>
      );
    });

    function buidBreadcrumbItemMenu(
      routes: any,
      routeCode: string,
    ): ReactElement {
      return (
        <Menu onClick={(e) => history.push(e.key)} selectedKeys={[routeCode]}>
          {routes.map(
            (item: LocRoute) =>
              item.showMenu && (
                <Menu.Item
                  key={item.code}
                  onClick={() => history.push(item.path)}
                >
                  {item.name}
                </Menu.Item>
              ),
          )}
        </Menu>
      );
    }

    setBreadcrumbItems(list);
  };

  return (
    <div className="basic-content">
      <TopBar menuCode={menuCode} />
      <div className="basic-main">
        <FwTitleBar isFull>
          <Breadcrumb separator=">">{breadcrumbItems}</Breadcrumb>
        </FwTitleBar>

        <div className="basic-main-content">{children}</div>
      </div>
    </div>
  );
};

export default memo(MainPage);
