// const files = require.context('./', true, /\.ts|\.js$/);

import systemMgt from './systemMgt';
import personalCenter from './personalCenter';
import test from './test';

export interface Route {
  path: string;
  routes?: {
    path: string;
    code?: string;
    component: string;
    parentCode?: string;
    routes?: Route[];
  }[];
}

const routeModule = [systemMgt, personalCenter, test] as Route[];

// const fs = require('fs');

// let fileNames = fs.readdirSync(__dirname);

// console.log('fileNames:::', fileNames);

// fileNames.forEach((filename: string) => {
//   if (filename !== 'index.ts') {
//     routeModule.push(require(`./${filename}`));
//   }
// });

// files.keys().forEach((key: string) => {
//   // const fileName = key.replace(/(\.\/|\.ts|\.js)/g, '');

//   routeModule.push(files(key).default);

// });

const routes = [
  { path: '/login', component: '@/pages/Login/index' },
  {
    path: '/',
    component: '@/pages/Main',
    routes: routeModule,
  },
];

const errprPage: any = [
  // { path: '/403', name: '403', component: '@/pages/Exception/403' },
  // { path: '/404', name: '404', component: '@/pages/Exception/404' },
  // { path: '/500', name: '500', component: '@/pages/Exception/500' },
];
routes[1].routes?.push(...errprPage);

export interface LocRoute {
  [key: string]: string;
  path: string;
}
/**
 * @param { string } code - 菜单code
 * @param { array } locMenusTree - 被查找的路由表
 * @return { LocRoute } - 该code对应的本地路由表中路由信息
 */
export function getLocRouteByCode(code: string, locMenusTree?: any): LocRoute {
  if (!code) return { path: '' };

  let pathItem = null;

  const getRouteInfo = (list: any) => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (item.code === code) {
        pathItem = item;
        return;
      }
      if (item.routes && item.routes.length) getRouteInfo(item.routes);
    }
  };

  getRouteInfo(locMenusTree ?? routes[1].routes);

  return pathItem ?? { path: '' };
}

export default routes;
