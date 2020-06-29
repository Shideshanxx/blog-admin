
export default [
  {
    path: '/login',
    name: 'login',
    component: '../layouts/UserLayout',
    routes: [
      { 
        path :'/login',
        component:"./login"
      },
    ]
  },
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
        routes: [
          {
            path: '/',
            redirect: '/articleManage',
            authority: ['admin'],
          },
          {
            path: '/articleManage',
            name: '文章管理',
            icon: 'file-text',
            component: './articleManage',
            authority: ['admin'],
          },
          {
            path: '/articleManage/articleEdit',
            name: '文章',
            icon: 'file-text',
            component: './articleEdit',
            authority: ['admin'],
            hideInMenu: true,
          },
          {
            path: '/bannerManage',
            name: '广告管理',
            icon: 'picture',
            component: './bannerManage',
            authority: ['admin'],
          },
          {
            path: '/userCenter',
            name: '个人中心',
            icon: 'user',
            component: './userCenter',
            authority: ['admin'],
          },
          {
            path: '/feedback',
            name: '问题反馈',
            icon: 'message',
            component: './feedback',
            authority: ['admin'],
          },     
          {
            component: './404',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
]