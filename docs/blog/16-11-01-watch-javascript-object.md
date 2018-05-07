---
title: 从去除百度云大文件下载限制到js的对象监听
date: 2016-11-01
---

# 从去除百度云大文件下载限制到js的对象监听

## 引子

前几天，一个朋友在微信上问我，Chrome浏览器审查元素，添加如下代码

```js
Object.defineProperty(this, 'navigator', {value: { platform: "" }});
```

效果是去除百度云大文件下载的限制，原因是什么？

那么，我们就要来看一看`Object.defineProperty`这个函数了。

> Object.defineProperty(obj, prop, descriptor)

### 传入参数

- obj: 目标对象
- prop: 目标属性
- descriptor: 目标属性所拥有的特性

前两个参数很好理解，重点是第三个参数descriptor。

### descriptor

descriptor有以下的取值：

- value: 属性值
- writable: 是否可写，只有在ture的时候可以重写，否则无法更改值
- configurable: 是否可以设置，总的设置，如果为false，则无法修改(value, writable, configurable)
- enumerable: 是否可以枚举，为true时，可以通过for...in循环获取
- get: get函数
- set: set函数

## 去除百度云限制脚本

回到最开始的js代码，对于浏览器而言，`this = window`，所以可以理解成，把navigator.platform值设置为空，即伪造了platform的值。猜想百度云应该通过这个值来限制用户下载大文件的。

如果只是改变value值，那么是否可以用`navigator.platform = ''`这样的语句改platform的值呢？在控制台输入代码可以得到这样的结果：

```js
navigator.platform // "MacIntel" 我的电脑是mac
navigator.platform = '' // ""
navigator.platform // "MacIntel"
```

从结果我们可以推测，navigator对象的`writable = false`，`configurable = true`。

我自己写了一个TamperMonkey(油猴)的脚本，如果需要可以拿去使用。

[去除百度云下载限制脚本](https://github.com/excaliburhan/LittleScripts/blob/master/DownloadBaiduyunBigFile.js)。

回过头，来看descriptor的get和set函数。首先，这两个属于访问器属性，不能和writable和value同时使用，否则会报错。

```js
const obj = {}
let a = 1
Object.defineProperty(obj, 'a', {
  get: () => {
    console.log(`value is ${a}`)
    return a
  },
  set: (val) => {
    console.log(`new value is ${val}`)
    a = val
  },
})
obj.a // value is 1, 1
obj.a = 2 // new value is 2, 2
```

是不是很酷？这就是实现js对象的监听的关键。

## js的对象监听

### 实现思路

1. 将需要监听对象obj和回调函数callback传入构造函数
2. 遍历对象obj，通过Object.defineProperty将属性全部定义一遍。getter返回val，setter添加callback

### 实现代码

```js
function Watch(obj, callback) {
  this.callback = callback

  this.observe = (obj) => {
    const self = this
    Object.keys(obj).forEach((prop) => {
      let val = obj[prop]
      Object.defineProperty(obj, prop, {
        get: () => val,
        set: (newVal) => {
          self.callback(newVal, val, prop)
          val = newVal
        },
      })
    })
  }

  this.observe(obj)
}
```

### demo代码

```js
let obj = {
  a: 1,
  b: 'test',
  c: [1, 2],
}
function fn(newVal, oldVal, prop) {
  console.log(`set ${prop} from ${oldVal} to ${newVal}`)
}
new Watch(obj, fn)

obj.a = 2 // set a from 1 to 2, 2
obj.c = 3 // set c from 1,2 to 3, 3
obj.c = [4, 5] // set c from 3 to 4,5
obj.b // "test"
```

以上就是一个比较原始的watch函数，用于监听js对象的变化。当然，这种遍历的方法性能消耗比较大，对于较大的js对象并不合适，需要考虑别的实现方法。
