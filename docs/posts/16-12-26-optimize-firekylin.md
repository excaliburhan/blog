---
title: Firekylin博客优化指南
date: 2016-12-26
---

# Firekylin博客优化指南

## Firekylin博客

Firekylin博客是一个基于ThinkJS的博客系统，本身对博客的优化已经非常不错，很多资源都已经进行了压缩或者缓存策略。

但是本着能缓存就要缓存的策略，Firekylin还是有一点优化空间的，下面就是优化的要点。

<!--more-->

## 优化步骤

首先打开网站首页[https://excaliburhan.com](https://excaliburhan.com)。右键`检查(或者审查元素)`，选择`Network`查看资源加载情况：

![alt](https://static.excaliburhan.com/blog/20161226/Qr3U3tIre1tW5yiitXRf-coX.jpeg?imageView2/0/w/600)

可以看到，加载的资源主要有几种，`首页logo`，`iconfont字体`，`google统计代码`，因为我没有设置首页背景图，如果有，处理应该是和logo一致的，这里就不展开了。

我们首先从`首页logo`开始。

### 处理logo

我采用的logo已经是压缩过的图片，但是还有10k左右的大小，我们的目标是图片加载一律走缓存。

首先采用了使用base64编码的方式，这样图片是会被缓存的。来看一下效果：

![alt](https://static.excaliburhan.com/blog/20161226/TQ8ArbcBsxN2kl501WgI4DVq.jpeg?imageView2/0/w/600)

嗯，很好，图片被缓存了。不过，等等！`index.html`从原来的6.8kb变成了17.4kb，反而加载的资源大小更大了！究其原因，就是图片从jpg转变成base64图片，大小变成12kb左右，而首页logo采用的是img标签，等于说12kb的文本加载到了`index.html`中，这显然不是我们需要的。

如果改成background的形式，理论上可以解决，但是加载的大小转移到了css样式文件中，1是没有解决根本问题(base64本身带来的字节大小)，2是需要改写博客源代码，成本太高，换另外一种方案。

由于之前给Firekylin提了mr，现在图片上传可以支持cdn，而我一直采用的是七牛的cdn，现在换成七牛cdn看看。

![alt](https://static.excaliburhan.com/blog/20161226/6f4ngZN4E5q6eMmH5P849w0q.jpeg?imageView2/0/w/600)

可以看到图片已经被缓存了，这里图片走的是cdn的缓存机制，所以它的有效时间是由cdn设置决定的。如果你看的比较仔细，你可以发现`index.html`的大小也变小了，那是因为我之前忘记截图了，更新新版本的Firekylin导致的，看来Firekylin也一直在优化呢(笑)。而这里，我们就把它还当作是6.8kb吧。

### iconfont

Firekylin采用了iconfont来处理一些全局用到的图标，首页的菜单会用到这个文件。

由于这个文件以后可能会有变化，所以Firekylin给它添加了`?v=`的版本信息。

那这个文件我们要怎么缓存呢，结论是采用nginx缓存！其实类似图片如果没有cdn的服务，也是可以采用这个方案的，配置大概如下：

首先在`http`里配置缓存信息

```nginx
proxy_cache_path   /etc/nginx/proxy_cache levels=1:2 keys_zone=pnc:300m inactive=10m max_size=5g;
proxy_temp_path    /etc/nginx/proxy_temp;
proxy_cache_key    $host$uri$is_args$args;
```

然后在`server`中配置相关的内容，这里我把图片的也贴出来，但是本站实际走的是cdn配置，nginx并不会生效，如果你有需要，可以按照这个进行配置

```nginx
location ~ .*\.(gif|jpg|jpeg|png)(.*) {
        proxy_cache               pnc;
        proxy_cache_valid         200 304 1d;
        proxy_cache_valid         any 1m;
        proxy_cache_lock          on;
        proxy_cache_lock_timeout  5s;
        proxy_cache_use_stale     updating error timeout   invalid_header http_500 http_502;
        etag                      on;
        expires                   1d;
}
location ~ .*\.(ico|svg|ttf|eot|woff)(.*) {
        proxy_cache               pnc;
        proxy_cache_valid         200 304 1y;
        proxy_cache_valid         any 1m;
        proxy_cache_lock          on;
        proxy_cache_lock_timeout  5s;
        proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;
        etag                      on;
        expires                   1y;
}
```

这里需要注意的是，`server`中的`proxy_cache`的名称要和`http`中配置的`keys_zone`一致。

上面的`server`配置，第一条是对常见图片结尾的文件进行一天的缓存，这里不建议把缓存时间定很长，否则你的同路径同名称的图片可能很久都不会改变。第二条就是对字体文件结尾的文件进行一年的缓存。这个可以设置久一些，因为一般这个文件是不会变动的，如果变动，版本信息导致的变动也会让etag改变，从而刷新缓存。

重启nginx看下效果：

![alt](https://static.excaliburhan.com/blog/20161226/vTIfBpqGqt4PEevZNoeVXjKq.jpeg?imageView2/0/w/600)

### google统计代码

下面就是google的统计代码了。由于是异步获取的google官方的analytics.js文件，其实对于网站加载是完全没有影响的。而google设置的缓存时间是2小时，这个时间太短了，以至于google自己的官方检测给出的意见是提高该js的缓存时间- -，检测的地址是:

[https://developers.google.com/speed/pagespeed/insights/](https://developers.google.com/speed/pagespeed/insights/)

那么对于这个js文件怎么办呢？分析一下，主要有两点，一是延长js的缓存时间，而是保证js是最新的。

google官方是提供自定义请求来达到统计功能的，[屈屈的零散优化点汇总](https://imququ.com/post/summary-of-my-blog-optimization.html)这篇文章就是采用这个方法的。

但是这个方法有一定的局限性，一是需要改写服务端的代码，添加统计逻辑，二是你的服务器必须能ping通google的api地址，所以说并不太实用。

我这里采用了`nginx缓存`+`定时任务`将google统计代码本地化，从而达到优化的目的。

首先，当然是nginx缓存配置：

```nginx
location ~* (analytics\.js)$ {
        alias                     /path-to-static/analytics.js;
        proxy_cache               pnc;
        proxy_cache_valid         200 304 7d;
        proxy_cache_valid         any 1m;
        proxy_cache_lock          on;
        proxy_cache_lock_timeout  5s;
        proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;
        etag                      on;
        expires                   7d;
}
```

由于Firekylin的路由是用来做post的，所以需要一个alias的设置，将`path-to-static`替换成你存放的目录即可。我这里设置的缓存时间是一周，你也可以根据需要改变这个时间，但是不宜过长。

这样我们得到了一个本地的analytics.js，但是它不会自动更新文件，这时候就需要定时任务了。

`crontab -e`添加定时任务如下：

```bash
0 0 * * 0 wget https://www.google-analytics.com/analytics.js -O /path-to-static/analytics.js
```

我这里设置的是每周日0点自动去wget需要的analytics.js，替换自己目录的该文件。你也可以根据自己的缓存时间来编写自己的定时任务。

配置结束，来看下效果：

![alt](https://static.excaliburhan.com/blog/20161226/t-ewsBrXtS7W0jbTdb65-BfN.jpeg?imageView2/0/w/600)

放下初次加载没有缓存的对比图：

![alt](https://static.excaliburhan.com/blog/20161226/eNZcJtpm9cUe6WzW0h9x5bP5.jpeg?imageView2/0/w/600)

## 结束

看我截图的加载时间，发现缓存之后，`index.html`有时候会加载比较久的时间，这是和网络相关的。但是，可以确定的是，走缓存的资源都是秒加载的，是不是很爽？

如果你也用Firekylin的博客，可以按照这个方法进行下优化，如果不是这个博客系统，一些方法也可以参考。如果你有什么意见或建议，欢迎一起探讨～
