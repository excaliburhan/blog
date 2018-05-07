module.exports = {
  base: '/blog/', // 站点根路径
  dest: './dist', // 输出目录
  title: '韩小平的博客', // 网站标题
  description: 'Just A Coder.', // 网站简介
  themeConfig: {
    repo: 'https://github.com/excaliburhan', // github 链接
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '关于', link: '/about/' },
      { text: '友链', link: '/links/' }
    ]
  }
}
