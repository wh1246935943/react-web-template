import { buildTree } from '@/utils/utils';
import lodash from 'lodash';
import routes from '../../config/routes/index';

const notIncluded = [];

export default {
  namespace: 'common',

  state: {
    userInfo: {},
    menus: [],
    locMenusTree: [],
    menusTree: [],
    currentProject: {},
    unreadMessageTotal: 0,
  },

  effects: {},

  reducers: {
    setUserInfo(state, { payload }) {
      state.userInfo = payload;
    },

    setUnreadMessageTotal(state, { payload }) {
      state.unreadMessageTotal = payload;
    },

    setMenu(state, { payload }) {
      const arrayEnableMenu = payload.filter(
        ({ code } = {}) => !notIncluded.includes(code),
      );

      const locMenusTree = lodash.cloneDeep(routes[1].routes);

      const getRouteInfo = (list) => {
        for (let index = 0; index < list?.length; index++) {
          const item = list[index];
          const { name, parentCode, order } =
            arrayEnableMenu.find(({ code }) => item.code === code) ?? {};

          if (name) {
            item.name = name;
            item.parentCode = parentCode;
            item.order = order;
            item.showMenu = true;
          }

          if (item.routes && item.routes.length) getRouteInfo(item.routes);
        }
      };

      getRouteInfo(locMenusTree);

      state.locMenusTree = lodash.orderBy(locMenusTree, ['order'], ['asc']);
      state.menus = arrayEnableMenu;
      state.menusTree = buildTree(arrayEnableMenu);
    },
  },
};
