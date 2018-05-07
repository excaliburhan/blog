---
title: CSS学习笔记(1) - 背景渐变
date: 2016-07-18
---

# CSS学习笔记(1) - 背景渐变

## css渐变类型

在css3标准之后，css主要有以下的渐变类型，线性渐变(linear-gradient)，径向渐变(radial-gradient)，重复渐变(repeating-linear/radial-gradient)。

其中，重复渐变可以认为是线性渐变和径向渐变的一种扩展。

## 线性渐变

线性渐变的基本语法如下：

> linear-gradient(direction/angle, color-stop1, color-stop2, ...);

css中的线性渐变，颜色按照指定的方向或者角度，进行线性的颜色渐变。

```css
.box {
  width: 200px;
  height: 200px;
  background: linear-gradient(to bottom, #000, #fff);
}
```

上述代码表示背景色从上到下从黑色到白色线性渐变，效果见[demo1](http://codepen.io/excaliburhan/pen/AXxbvW)。

linear-gradient的第一个参数代表渐变的方向，该参数可以是方向关键词，如to bottom，to left，也可以是具体的角度，0deg代表从下到上的渐变，效果上等同于to top。当然该参数也可以缺省，缺省后该值默认为to bottom。所以说

```css
.box {
  background: linear-gradient(#000, #fff);
}
```

这行代码和一开始的demo1效果是等价的。

当我们需要从左到右的渐变效果的时候，就有了多种选择。方向参数可以是to right，也可以是90deg，即从0deg顺时针旋转了90deg，当然－270deg也是相同的效果。效果可见[demo2](http://codepen.io/excaliburhan/pen/PzEOJX)。

方向参数之后的参数代表渐变的色值，可以有多个，但至少需要2个，指定开始和结束点。demo1的代码表示的是，top色值黑色(#000)到bottom色值白色(#fff)的渐变。

当然，色值参数还有第二个指定项，用来指定具体发生颜色渐变的坐标。这个值可以是具体值，比如px，也可以是相对值百分数。比如demo1的代码完整可以看成如下：

```css
.box {
  background: linear-gradient(to bottom, #000 0%, #fff 100%);
}
```

那么我们如果想要渐变从50%处开始，就变得很简单了。

```css
.box {
  background: linear-gradient(to bottom, #000 50%, #fff 100%);
}
```

代码效果见[demo3](http://codepen.io/excaliburhan/pen/WxdXEq)。

从demo3我们可以看出，虽然我们指定开始的渐变点是#000 50%，但是50%之前的颜色也是#000，可以看出开始坐标如果不是从0开始，就会缺省一个从0开始的渐变点。

```css
.box {
  background: linear-gradient(to bottom, #000 0, #000 50%, #fff 100%);
}
```

此代码和demo3效果一致。

并且通过demo3，我们也发现了一个奇特的现象，背景渐变中，如果两个渐变点的颜色一致，那么两者之间的颜色是纯色。利用这个特性，我们只要把渐变距离控制为0，就可以得到纯色交替的背景。

```css
.box {
  width: 200px;
  height: 200px;
  background: linear-gradient(to bottom, #f30 50%, #fd0 0, #fd0);
  background-size: 100% 40px;
}
```

我们利用background-size和background-repeat，甚至能够做出间隔无限交替的背景图，具体见[demo4](http://codepen.io/excaliburhan/pen/xOpPpA)。

## 重复线性渐变尝试

当然，这种实现的背景图还是有缺陷的，比如旋转45deg之后，背景图会变得错乱。请看[demo5](http://codepen.io/excaliburhan/pen/pbpdQy)，原因就是我们把指定大小的背景旋转，而不是整个背景旋转。

```css
.box2 {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #f30 25%, #fd0 0, #fd0 50%, #f30 0, #f30 75%, #fd0 0);
  background-size: 30px 30px;
}
```

当然，我们可以通过增加到8个渐变点来达到斜着渐变的效果，这时，我们发现背景大小又不是我们指定的30px了。将背景图按照30*30分解，发现渐变距离应该是斜边，所以修正后应该是2\*30\*根号2，大概84px才能达到我们想要的效果，而且还不是100%精确。

这样的代码，维护起来简直噩梦，有没有更好的办法呢?

答案就是：重复渐变。

```css
.box4 {
  width: 200px;
  height: 200px;
  background: repeating-linear-gradient(45deg, #f30, #f30 30px, #fd0 0, #fd0 60px);
}
```

这时，我们发现渐变距离我们写在repeating-linear-gradient，不需要配合background-size来使用了，而且旋转后，渐变距离也能正确显示。

## 径向渐变

> radial-gradient(shape size at position, start-color, ..., last-color);

径向渐变，顾名思义，它指定的是径向的颜色渐变。那么，它的第一个参数就是指渐变的圆心。

```css
.box {
  background: radial-gradient(#000, #fff);
}
```

效果参见[demo6](https://codepen.io/excaliburhan/pen/OXzzJL)。

径向渐变默认的参数是ellipse farthest-corner at center，代表了以box中心点为圆心，以到box角最远的距离为半径的椭圆。此外，形状的参数还有circle，代表圆形；尺寸的参数有：

- closest-side
- farthest-side
- closest-corner
- farthest-corner

分别代表了半径距离分别为最近边，最远边，最近角，最远角。

当然，这些参数也可以是具体的数值或者百分比，如果你知道具体的渐变形状和尺寸，采用具体的数据是一个不错的选择。

径向渐变也有一个重复选项，就是repeating-radial-gradient，你也知道了，最常用的就是制作同心圆。效果参见[demo7](http://codepen.io/excaliburhan/pen/ZOAQZJ)。

以上就是关于CSS实现背景渐变的一些心得，下一篇来聊聊关于边框渐变和字体渐变的相关内容。
