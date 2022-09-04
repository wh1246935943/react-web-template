export default {
  path: '/systemMgt',
  code: 'systemMgt',
  routes: [
    /**
     * 用户中心
     */
    {
      path: '/systemMgt/systemUserMgt',
      code: 'systemUserMgt',
      routes: [
        /**
         * 人员管理
         */
        {
          path: '/systemMgt/systemUserMgt/userMgt',
          code: 'systemUserPeopleMgt',
          component: '@/pages/SystemMgt/UserMgt/index',
        },
      ],
    },
  ],
};
