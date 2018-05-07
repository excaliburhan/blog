# 玩玩React，撸一个pwa版本的知乎日报

## 前言

看了一眼上一篇博客，已经有一年多没有写博客了。为了证明博客还活着，赶紧更新一篇。

太久没写博文，不知道写什么。因为我自己一直看知乎，很多段子都是上面学习的，近两年业务开发一直写的Vue，所以我决定写一个React的知乎日报。

<!--more-->

## 准备工作

1. 知乎日报api，已经有人分析过了，知乎日报 API 分析；当然这次我准备做纯前端的，所以会有跨域，所以使用了一个别人现成的，知乎日报 API 分析（解决跨域精简版）

2. 获取到api之后，尝试了一下接口，完美返回数据；尝试渲染一下，纳尼，图片403出不来。google一下，因为知乎做了referer检查，简单处理方式就是加`<meta name="referrer" content="never">`这个meta标签

3. http请求封装，因为比较习惯了axios，所以封装了一下。按照个人习惯封装了一个request.js和一个urls.js，request.js主要是做请求的拦截处理，urls.js里面包含所有的业务api地址，于是在saga里面可以直接使用request(urls.xxx, params)进行请求。

## 页面目标

这次的页面准备做的简单点，只有一个列表页和一个详情页，因为这也是我最常使用的内容。

对于一些基本的组件，这次直接使用了antd-mobile的相关组件，有：轮播图、loading图标等等，这里就不多做介绍了，主要还是看API。

### 原生实现

为了让我们的h5更像一个原生app，我们需要做一些常用的手势操作，主要做了下拉刷新（使用antd-mobile）、下滑改变title和titleBar的背景色（监听scroll事件）、滑动返回（使用hammerjs）。

此外，为了模拟app打开的加载图，需要使用ios的splash加载图，主要是设置meta标签的，具体尺寸可以参考[https://developer.apple.com/ios/human-interface-guidelines/icons-and-images/launch-screen/](https://developer.apple.com/ios/human-interface-guidelines/icons-and-images/launch-screen/)

## 优化

对于pwa应用，必要的优化还是需要的，这次主要采用了这么一些简单的手段

### 详情页css样式

因为知乎日报的详情接口会返回css的样式，为了保持样式一致性，直接采用这个返回的css文件，通过动态载入的方式进行插入。当然还要注意几点：

1. 为了保证首次加载就有样式，直接在html写入css，动态加载的时候判断该link是否已经存在，如果存在就不再插入css的link

2. 知乎返回的css地址是http的，但是也支持https，需要自己正则替换成https

### 懒加载

图片懒加载和路由懒加载。图片懒加载就不细说了，都有成熟的组件可以直接使用；路由懒加载，因为我使用的是react-router-v4，所以建议采用react-loadable的解决方案，当然本质还是webpack的code split。

```js
// router/index.js
import Loadable from 'react-loadable'
import Loading from '@/components/Loading/Loading' // 加载过程展示内容

const createComponent = path => Loadable({
  loader: () => import(`@/pages/${path}`), // 必须使用字符串变量
  loading: Loading
})

// components/Loading/Loading.js
import React from 'react'
import LoadingBar from '@/components/Loading/LoadingBar'

export default function LoadingComponent({ isLoading, error }) {
  if (isLoading) {
    // Handle the loading state
    return (<LoadingBar />)
  } else if (error) {
    // Handle the error state
    return (
      <div style={{ paddingTop: '200px', textAlign: 'center' }}>
        Sorry, there was a problem loading the page.
      </div>
    )
  } else {
    return null
  }
}
```

### vw适配

因为我们的应用主要是在手机端使用的，所以针对不同分辨率还是需要适配处理的。这里采用的vw的适配方案，主要借助的是postcss-px-to-viewport，可以做到将px转化为vw，当然你需要在`postcssrc.js`进行简单配置：

```js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750,
      viewportHeight: 1334,
      unitPrecision: 3,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines'],
      minPixelValue: 1,
      mediaQuery: false
    }
  }
}
```

其他的postcss插件就不一一介绍了，根据需要自己添加吧。要注意的是，为了解决vw的兼容性问题，需要hack一下，主要是解决IE的问题。我使用的是viewport-units-buggyfill，采用css的content属性进行hack，需要注意的是，img没有content会带来问题，所以你要强制设置img的content为normal。

```css
img {
  content: normal !important;
}
```

### 缓存

除了service-wroker缓存js、css等资源文件，对于请求内容也需要做一下缓存。

因为是纯web的项目，这边就使用localStorage缓存了必要的请求结果。

1. 历史列表数据，根据date为key进行缓存

2. 详情数据，根据id为key进行缓存

3. localStorage大小有限制，一般为5mb，如果超过，需要try-catch，并把localStorage清空

## React vs Vue个人感受

既然决定了用React写（上次自己写React的demo还是2年前），当然要用下全家桶，顺便和Vue的比较一下。

React：react+react-router+react-redux

Vue: vue+vue-router+vuex

### 路由。react-router用的v4版本，vue-router用的3.x。

1. 路由匹配。react-router必须借助`<Switch>`组件，否则所有匹配的路由都会被渲染出来，还是有点懵逼的

2. 路由懒加载。因为SPA应用，为了加速首屏，路由懒加载是必不可少的，react-router的懒加载一般是借助三方的(?)，在v4版本，借助react-loadable这个库，实现加载中和加载具体页面指向不同组件，不同的状态展示不同的组件，感觉逻辑上更出色，vue-router如果需要实现加载中的一些显示，一般来说是借助beforeRoute这些钩子函数实现的，个人感觉还是更倾向于react-router这样的

3. router和route。简单来说，就是获取router，进行push、replace操作，以及route，获取path、params这些信息。react-router获取router(也就是history)，需要引入withRouter高阶组件，获取route则是要从props.match中获取，相对而言，vue-router是直接入侵Vue.prototype.$router和Vue.prototype.$route实现的，实际用起来，果断vue爽很多啦

### 状态管理。react-redux用的5.x，vuex用的3.x。

1. redux通过connect把state和dispatch都映射(?)到props中，而state通过最外层的Provider组件递传，怎么说呢，connect操作真的有点烦，vuex一如既往粗暴，放到Vue.prototype.$store下

2. 两者都有dispatch(action)->reducer/mutation(commit)->state的概念，我在react-redux上用了redux-saga这个中间件，作用是处理所有异步请求或者state的修改操作，而在reducer环节，直接赋值state，这样会让逻辑更加清晰；而vuex一般是在actions里面做这些异步处理。
