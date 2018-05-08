---
title: CSS学习笔记(3) - 字体效果
date: 2016-07-29
---

# CSS学习笔记(3) - 字体效果

## CSS字体效果应用场景

在前端开发过程中，我们可能会遇到页面需要特殊的字体效果的情况。字体的实现效果有多种方法，最常见的无异于两种：图片和CSS实现。

### 1.图片实现特殊字体

图片实现的字体效果肯定是最符合视觉效果的，不过这种方法的实现缺点也很多，比如资源消耗大，增加请求导致效率低下等等。不过最致命的还是：可塑性太差，一旦需要改动，则需要推倒重来。

### 2.CSS实现特殊字体

CSS实现字体效果，消耗资源小，可塑性高，不过缺点也有，比如负责的效果难以实现。不过总体来说，简单的特效字体用CSS实现还是比较可靠的，下面介绍几种常见字体的具体实现。

## 空心字

空心字，其实实现的就是字体描边效果，主要思路是利用text-shadow堆叠同一位置，取消模糊效果，实现描边的假象。

```css
.box {
  width: 100px;
  height: 100px;
  line-height: 100px;
  background: pink;
  color: #fff;
  font-size: 24px;
  text-align: center;
  text-shadow:
    0 0 1px #000, 0 0 1px #000,
    0 0 1px #000, 0 0 1px #000,
    0 0 1px #000, 0 0 1px #000;
}
```

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/29/4-pic-1469784203458.jpg?imageView/2/w/200)

这样就能做到简单的空心字效果了。不过这种实现的效果缺点也不少，描边越大，需要堆叠的次数也越多，资源消耗也会增加。

具体代码参见[demo1](https://codepen.io/excaliburhan/pen/BzPogm)。

## 发光字

发光字，需要实现字体边缘的发光特效。可以用text-shadow实现，为了特定效果可以多叠几层。缺点就是比较难以精确控制。

```css
.box {
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  font-size: 24px;
  color: pink;
  text-shadow:
    0 0 0.3em #f30, 0 0 0.3em #f30;
  background: #000;
}
```

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/29/3-pic-1469786034526.jpg?imageView/2/w/200)

具体实现代码参见[demo2](https://codepen.io/excaliburhan/pen/QEByYX)。

## 立体字

立体字给人一种拟物风格，具有真实感，主要实现思路是用多层不同偏移量的阴影形成凹凸感。

```css
.box {
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  font-size: 30px;
  color: #fff;
  background: #000;
  text-shadow:
    0 1px hsl(0,0%,85%),
    0 2px hsl(0,0%,80%),
    0 3px hsl(0,0%,75%),
    0 4px hsl(0,0%,70%),
    0 5px hsl(0,0%,65%),
    0 5px 10px black;
}
```

![alt](https://o2znrmehg.qnssl.com/ghost/2016/07/29/2-pic-1469786605826.jpg?imageView/2/w/200)

text-shadow在y轴的偏移量会影响到字体的方向，如果偏移量为负值，就会得到上图2中的向上凸起的效果。

具体代码实现参见[demo3](https://codepen.io/excaliburhan/pen/ZOjQgW)。

以上就是关于CSS实现特殊字体的一些拙见。
