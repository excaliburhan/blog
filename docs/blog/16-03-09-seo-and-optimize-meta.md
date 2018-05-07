---
title: 简单SEO - Meta标签优化
date: 2016-03-09
---

# 简单SEO - Meta标签优化

## 初衷

搭建了ghost博客之后，发现他的meta标签还有不少可以优化的地方，于是花时间整理了一下。
本文主要讲解的是meta标签的一些简单优化。

## 什么是meta标签

根据w3c定义，meta元素是可提供有关页面的元信息（meta-information），比如针对搜索引擎和更新频度的描述和关键词。
meta标签位于文档的头部，不包含任何内容。\<meta\> 标签的属性定义了与文档相关联的名称/值对。
简单来说，meta标签是给搜索引擎看的标签，对于seo有着举足轻重的作用。

## 常用的meta标签

### description

meta description，被认为是最有用的meta标签，是网站的简介信息。

```html
<meta name="description" content="description of your site"/>
```

这个标签在搜索引擎中的占比很高，所以是seo的主要标签，随着各类网站seo的滥用和搜索引擎的算法变更，目前该标签作用逐渐变弱。不过一般推荐还是设置一下，content控制在100个字符以内比较好。

### keywords

meta keywords，慎用的标签。

```html
<meta name="keywords" content="keyword1 keyword2"/>
```

曾经是seo重点优化标签，现在由于滥用，基本不再是搜索引擎搜索的标签，而且被发现滥用可能导致搜索引擎把你权重下降，得不偿失。

### title

严格意义上来说，title不算是meta标签。不过title标签对于搜索引擎的占比很高，所以把它作为meta标签的一类。

```html
<title>Title Name</title>
```

建议控制title在50个字符以内。

### charset

meta charset，默认字符编码。

```html
<meta charset="utf-8"/>
```

建议采用这种简写方式，向后兼容。

### Compatible

兼容标签，针对不同浏览器。

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
```

## 我的简单优化(带注释)

除了以上一些，还有一些别的meta标签，以下是我博客的meta信息。

```html
<meta charset="utf-8" /> // 字符编码
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" /> // 兼容适配
<meta name="viewport" content="width=device-width, initial-scale=1.0" /> // 设备适配
<meta name="description" content="前端技术博客，关注代码的点点滴滴" /> // 简介
<meta name="generator" content="Ghost 0.78" /> // 生产工具
<meta name="author" content="韩小平" /> // 作者
<meta name="robots" content="index,follow" /> // 搜索优化，下同
<meta name="google" content="index,follow" />
<meta name="googlebot" content="index,follow" />
<meta name="verify" content="index,follow" />
<meta name="apple-mobile-web-app-capable" content="yes" /> // webapp全屏
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> // apple状态栏颜色
<meta name="format-detection" content="telephone=no, email=no" /> // 禁止电话邮件自动识别
<meta name="HandheldFriendly" content="true" /> // 移动设备优化，针对不支持viewpoint设备
<meta name="MobileOptimized" content="320" /> // 微软旧浏览器适配
<title>{{meta_title}} - 韩小平的前端博客</title> // title
```
