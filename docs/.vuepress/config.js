module.exports = {
  base: '/blog/', // 站点根路径
  dest: './dist', // 输出目录
  title: '韩小平的博客', // 网站标题
  description: 'Just A Coder.', // 网站简介
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  serviceWorker: true,
  themeConfig: {
    repo: 'https://github.com/excaliburhan', // github 链接
    head: [['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `./favicon.ico` }]],
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '关于', link: '/about/' },
      { text: '友链', link: '/links/' }
    ]
  }
}
