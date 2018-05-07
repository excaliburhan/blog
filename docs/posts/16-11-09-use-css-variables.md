---
title: 舍弃预处理，拥抱CSS变量
date: 2016-11-09
---

# 舍弃预处理，拥抱CSS变量

## 什么是CSS变量

> CSS 变量是由网页的作者或用户定义的实体，用来指定文档中的特定变量。使用自定义属性来设置变量名，并使用特定的 var() 来访问。（比如 color:var(--main-color);）。

## CSS变量的用途

### 取代预处理器变量

现在普遍使用的预处理器，如sass，less都提供了变量的概念，很适合用于组件化的样式编写。

以sass为例，简单的代码如下：

```css
$mainColor: #333

body {
  color: $mainColor;
}
```

在js编译处理后，输出的css代码如下：

```css
body {
  color: #333;
}
```

使用css变量，不需要编译处理，就可以达到相同效果，代码如下：

```css
:root {
  --main-color: #333;
}
body {
  color: var(--main-color);
}
```

两者实际效果完全相同，使用css变量，可以省去dev阶段使用预处理器的成本开销。当然，它的优点不至于此，下面会细说。

### 实现浏览器前缀

相信前端都接触过autoprefixer这玩意，会给你的css代码加上各浏览器的前缀，让样式在各浏览器中保持一致。而这，也可以使用css变量实现。

我们以`box-shadow`为例来进行说明。

```css
* {
  --box-shadow: none;
  -webkit-box-shadow: var(--box-shadow);
  box-shadow: var(--box-shadow);
}
div {
  --box-shadow: 0 0 5px red;
}
```

上述代码能够添加`-webkit`的前缀，而且相信你也发现了，css变量是能够覆盖的，和css属性一样。是不是很棒？

## 为什么使用CSS变量

当然，css变量的用法不局限于此，很考验你的想象力。现在，我们来说说为什么要使用它。

- 你不需要一个预处理器；
- 你可以舍弃autoprefixer；
- css变量能够覆盖，和css属性一样；
- css变量覆盖后，如果需要，浏览器会进行重绘（很适合响应式）；
- css变量能够通过js控制。

## CSS变量的局限性

### 兼容性

具体数据请看[Caniuse](http://caniuse.com/#feat=css-variables)。目前的情况是Chrome，Safari，Firefox等主流浏览器都支持，IE全军覆没。

如果你要兼容IE，那还是要悠着点。

### 嵌套语法

预处理器的嵌套语法是我非常欣赏的一点，比如sass中可以这么写：

```css
body {
  color: #333;
  div {
    color: #666;
  }
}
```

然而原生css还是难以实现，至少我目前还没有想到解决方法。如果你有，请不吝赐教！
