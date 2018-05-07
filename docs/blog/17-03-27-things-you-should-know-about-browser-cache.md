---
title: 你应该知道的浏览器缓存知识
date: 2017-03-27
---

# 你应该知道的浏览器缓存知识

## 0. 前言

浏览器缓存作为性能优化的重要一环，对于前端而言，重要性不言而喻。之前被人问起浏览器缓存的知识，感觉自己有点一知半解，所以这次好好整理总结了一下。

<!--more-->

## 1. 浏览器缓存分类

目前主流的浏览器缓存分为两类，强缓存和协商缓存，它们的匹配流程如下：

（1）浏览器发送请求前，根据请求头的expires和cache-control判断是否命中强缓存策略，如果命中，直接从缓存获取资源，并不会发送请求。如果没有命中，则进入下一步。

（2）没有命中强缓存规则，浏览器会发送请求，根据请求头的last-modified和etag判断是否命中协商缓存，如果命中，直接从缓存获取资源。如果没有命中，则进入下一步。

（3）如果前两步都没有命中，则直接从服务端获取资源。

## 2. 强缓存

### 2.1 强缓存原理

强缓存需要服务端设置expires和cache-control。

nginx代码参考，设置了一年的缓存时间：

```nginx
location ~ .*\.(ico|svg|ttf|eot|woff)(.*) {
  proxy_cache               pnc;
  proxy_cache_valid         200 304 1y;
  proxy_cache_valid         any 1m;
  proxy_cache_lock          on;
  proxy_cache_lock_timeout  5s;
  proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;
  expires                   1y;
}
```

![alt](https://static.excaliburhan.com/blog/20170327/UQQrhatzWnpiKcjkBAR-Cwy5.jpeg)

（1）expires：从图可以看出，expires的值是一个绝对时间，是http1.0的功能。如果浏览器的时间没有超过这个expires的时间，代表缓存还有效，命中强缓存，直接从缓存读取资源。不过由于存在浏览器和服务端时间可能出现较大误差，所以在之后http1.1提出了cache-control。

（2）cache-control：从图可以看出，cache-control的值是类似于`max-age=31536000`这样的，是一个相对时间，31536000是秒数，正好是一年的时间。当浏览器第一次请求资源的时候，会把response header的内容缓存下来。之后的请求会先从缓存检查该response header，通过第一次请求的date和cache-control计算出缓存有效时间。如果浏览器的时间没有超过这个缓存有效的时间，代表缓存还有效，命中强缓存，直接从缓存读取资源。

两者可以同时设置，但是优先级cache-control > expires。

### 2.2 from disk cache和from memory cache

Chrome在高版本更新了缓存策略（具体哪个我忘了），原来的`from cache`变成了`from disk cache(磁盘缓存)`和`from memory cache(内存缓存)`两类，两者有什么区别呢？

先从官方文档来看下：

> Chrome employs two caches — an on-disk cache and a very fast in-memory cache. The lifetime of an in-memory cache is attached to the lifetime of a render process, which roughly corresponds to a tab. Requests that are answered from the in-memory cache are invisible to the web request API. If a request handler changes its behavior (for example, the behavior according to which requests are blocked), a simple page refresh might not respect this changed behavior. To make sure the behavior change goes through, call handlerBehaviorChanged() to flush the in-memory cache. But don't do it often; flushing the cache is a very expensive operation. You don't need to call handlerBehaviorChanged() after registering or unregistering an event listener.

我的渣六级英语翻一下，大概就是内存缓存是和渲染进程绑定的，大部分情况下于浏览器Tab对应。为此我实验了一下：

首次打开Tab：

![alt](https://static.excaliburhan.com/blog/20170327/wHYczt-esCaoSWimZ6JHWVhz.jpeg)

刷新(cmd+r)Tab：

![alt](https://static.excaliburhan.com/blog/20170327/BnoONl2XIQoNYvHCbK7O5-fW.jpeg)

可以看到，在命中强缓存的情况下，进程初次渲染会从磁盘读取缓存资源。Chrome会将部分资源保存到内存中（具体保存的逻辑还不清楚，如果有知道的请告知）。

由于内存缓存是直接从内存中读取的，所以速度更快，从图中可以看出时间是0ms。而磁盘缓存还需要从磁盘中读取，速度还和磁盘的I/O有关，时间大概在2～10ms，也是相当快的了。

### 2.3 强缓存作用

强缓存作为性能优化中缓存方面最有效的手段，能够极大的提升性能。由于强缓存不会向服务端发送请求，对服务端的压力也是大大减小。

对于不太经常变更的资源，可以设置一个超长时间的缓存时间，比如一年。浏览器在首次加载后，都会从缓存中读取。

但是由于不会向服务端发送请求，那么如果资源有更改的时候，怎么让浏览器知道呢？现在常用的解决方法是加一个`?v=xxx`的后缀，在更新静态资源版本的时候，更新这个v的值，这样相当于向服务端发起一个新的请求，从而达到更新静态资源的目的。

## 3. 协商缓存

### 3.1 协商缓存原理

在强缓存没有命中的时候，就是协商缓存发挥的地盘了。协商缓存会根据[last-modified/if-modified-since]或者[etag/if-none-match]来进行判断缓存是否过期。

nginx代码参考：

```nginx
location ~ .*\.(ico|svg|ttf|eot|woff)(.*) {
  proxy_cache               pnc;
  proxy_cache_valid         200 304 1y;
  proxy_cache_valid         any 1m;
  proxy_cache_lock          on;
  proxy_cache_lock_timeout  5s;
  proxy_cache_use_stale     updating error timeout invalid_header http_500 http_502;
  etag                                       on;
}
```

![alt](https://static.excaliburhan.com/blog/20170327/CrDzh0AaGQw0SJNw714JjHRC.jpeg)

（1）last-modified/if-modified-since:
浏览器首先发送一个请求，让服务端在response header中返回请求的资源上次更新时间，就是`last-modified`，浏览器会缓存下这个时间。然后浏览器再下次请求中，request header中带上`if-modified-since:[保存的last-modified的值]`。根据浏览器发送的修改时间和服务端的修改时间进行比对，一致的话代表资源没有改变，服务端返回正文为空的响应，让浏览器中缓存中读取资源，这就大大减小了请求的消耗。由于last-modified依赖的是保存的绝对时间，还是会出现误差的情况：一是保存的时间是以秒为单位的，1秒内多次修改是无法捕捉到的；二是各机器读取到的时间不一致，就有出现误差的可能性。为了改善这个问题，提出了使用etag。

（2）etag/if-none-match：
> etag是http协议提供的若干机制中的一种Web缓存验证机制，并且允许客户端进行缓存协商。生成etag常用的方法包括对资源内容使用抗碰撞散列函数，使用最近修改的时间戳的哈希值，甚至只是一个版本号。
和`last-modified`一样，浏览器会先发送一个请求得到etag的值，然后再下一次请求在request header中带上`if-none-match:[保存的etag的值]`。通过发送的etag的值和服务端重新生成的etag的值进行比对，如果一致代表资源没有改变，服务端返回正文为空的响应，告诉浏览器从缓存中读取资源。

etag能够解决last-modified的一些缺点，但是etag每次服务端生成都需要进行读写操作，而last-modified只需要读取操作，从这方面来看，etag的消耗是更大的。

### 3.2 协商缓存作用

协商缓存是无法减少请求数的开销的，但是可以减少返回的正文大小。一般来说，对于勤改动的html文件，使用协商缓存是一种不错的选择。

## 4. 刷新缓存方法

刷新强缓存可以使用`?v=xxx`的后缀。当然，人工更改版本号的成本比较高，而且难以维护，现在主流的是通过webpack等打包工具生成`[name].[hash].js`之类的文件名，也能刷新强缓存。

刷新协商缓存比较简单，修改文件内容即可。

对于浏览器而言，在Chrome中，你可以使用`审查元素`，高版本也叫`检查`，将Network中的Disable cache打勾，使用`cmd+r`刷新页面即可。当然你也可以使用强制刷新，直接在页面使用`cmd+shift+r`进行刷新。

## 5. 结尾

以上就是对浏览器缓存的一点拙见，欢迎一起交流。

这篇主要交代了浏览器缓存，下一篇文章内容已经想好了，就是html5的离线缓存。
