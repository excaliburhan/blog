---
title: 用nw.js制作一个自己的markdown app
date: 2016-10-09
---

# 用nw.js制作一个自己的markdown app

## 1. 什么是nw.js

nw.js，前身nodeWebkit，顾名思义，是基于node+webkit运行的。加上支持各类npm包，可以让前端很容易通过HTML和JavaScript制作属于自己的客户端app。

## 2. 开始使用nw.js

首先，你需要下载[nw.js](http://nwjs.io/)。一般来说，开发app的时候需要下载sdk版本，集成了devtool，方便调试。而生产环境则应该使用normal版本，因为它更小巧灵活。

以我使用的v0.17.4(Mac版本为例，下同)为例，将你下载的放入你的开发目录，如nwjs目录下。新建一个package.json，熟悉npm的应该都知道，这是一个配置json文件，而nw.js需要这个文件提供必要的信息。以下是我的markdown编辑器(LittleMD，以下用LittleMD作指代)的配置信息。

```json
{
  "main": "index.html", // 入口文件
  "name": "LittleMD",   // 名称
  "version": "0.0.2",   // 版本号
  "description": "a markdown app via nwjs", // 描述
  "window": { // nw.js窗口配置
    "title": "LittleMD", // 入口html的title不存在时，则使用这个
    "icon": "icon.png", // icon
    "toolbar": true, // 是否隐藏窗口的工具条
    "frame": true, // 是否显示外层的框架，如最大化最小化
    "position": "center", // 初始化位置
    "width": 1000, // 初始化宽度
    "height": 800 // 初始化高度
  },
  "dependencies": { // 各类依赖
    "emojify.js": "^1.1.0",
    "gulp-less": "^3.1.0",
    "highlight.js": "^9.7.0",
    "jquery": "^3.1.0",
    "marked": "^0.3.6",
    "phantom-html2pdf": "^3.0.0",
    "phantomjs-prebuilt": "^2.1.12",
    "qiniu": "^6.1.11",
    "taboverride": "^4.0.3"
  }
}
```

可以看到，`package.json` 和npm包的配置很像，所以上手也很快，只要记得配置相关的nw.js的配置即可，更多配置请看[Manifest文档](http://docs.nwjs.io/en/latest/References/Manifest%20Format/#manifest-format)。

然后，新建一个index.html，与package.json的入口路径一致，恭喜你，你已经拥有了一个最简单的app。

当然，此时打开nwjs.app，只会看到一片空白，因为html内容就是空白的。你需要编辑html文件让它呈现内容。当然，在此之前，我们首先建立几个基本目录，构建我们的项目目录。一般来说，需要js/css/images，分别存放js文件/css文件/图片资源文件，最后的结构如图。

![pic](https://o2znrmehg.qnssl.com/ghost/2016/10/09/qq20161009-0-2x-1475999110974.png?imageView2/1/w/300)

至此，我们的app项目已经有了一个雏形。

## 3. 制作一个markdown

经过上一步之后，我们已经有了基本的项目结构了。下面就是着手编辑我们的入口文件 `index.html` 。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>LittleMD.md</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <div id='body'>
    <textarea id='editor'></textarea>
    <div id='preview'></div>
  </div>
</body>
<script src='/app.js'></script>
</html>
```

`style.css` 就是我们的样式文件，`app.js` 就是我们所需要的js文件。我建议把 `app.js` 放在body后，而head之间，我们还需要初始化一些nw.js的内容。

editor是LittleMD的编辑框，preview则是预览区。

接下来，编写css，让LittleMD有编辑器的样子。

```css
body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family:PingFang SC, Hiragino Sans GB, Microsoft Yahei, WenQuanYi Micro Hei, sans-serif;
  font-size: 16px;
  line-height: 20px;
}

#body {
  display: flex;
  height: 100%;
  overflow: hidden;
}
#editor {
  box-sizing: border-box;
  flex: 1;
  padding: 0 5px;
  margin: 0;
  line-height: 20px;
  color: #F9F9F5;
  background-color: #2d2d2d;
  resize: none;
  outline: none;
  border: none;
}
#preview {
  box-sizing: border-box;
  flex: 1;
  padding: 0 10px;
  overflow-y: scroll;
}
```

你可以采用浮动，然后左右各占50%的写法，不过我建议还是采用flex布局。1是更加简单，2是方便以后扩展(比如增加行号显示)。而且，既然是webkit的内核，你都不需要考虑兼容性，这是nw.js很棒的一点。

现在打开nwjs.app，你可以看到一个有界面的app了，虽然它还没有功能。

![pic](https://o2znrmehg.qnssl.com/ghost/2016/10/09/qq20161009-1-2x-1476000546973.png?imageView2/1/w/600)

现在，编写你的js文件。我喜欢采用 `app.js` 作为入口js的做法，这样可以让你更少地修改 `index.html` 。利用require各个功能js的做法，利于你将功能分块。

`app.js`

```javascript
const main = require('./js/main.js')
main.init()
```

此外，我们需要main.js，负责页面初始化；editor.js，负责编辑器功能。

`main.js`

```javascript
const editor = require('./editor.js')

module.exports = {
  init() {
    $(() => {
      $('#editor').bind('input click', () => { // reload
        editor.reload()
      })
    })
  },
}
```

`editor.js`

```javascript
const marked = require('marked')
const $ = global.$
const hljs = global.hljs

module.exports = {
  reload() {
    marked.setOptions({
      highlight: code => hljs.highlightAuto(code).value,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
    })
    const preview = $('#preview')
    const editorDom = $('#editor')
    const text = editorDom.val()
    preview.html(marked(text))
  },
}
```

可能你也注意到了，我在editor.js中引入了一个marked，这是一个npm包，是一个markdown语法的解析器。需要先使用 `npm install marked` 进行安装。此外，我还引入了 `jquery` 和 `highlight.js` 两个库，需要在index.html的head标签中引入。

个人建议，新建一个vendors目录用来存放引入的库文件，和自己的js进行区分。

```html
<script src="/vendors/jquery-3.1.0.min.js"></script>
<script src="/vendors/highlight.pack.js"></script>
<script>
  global.gui = require('nw.gui') // nw.js的gui界面
  global.window = window
  global.$ = $
  global.hljs = hljs
</script>
```

现在打开nwjs.app，你会发现，你在编辑框输入，预览区会实时更新内容。当然，现在预览区的样式还十分简陋，你可以根据自己需要编写它的样式。

## 4. 如何debug

开发app的时候，免不了需要debug。根据官方的devtool使用方法，你可以在app.js中 `init()` 函数前加入如下代码。

```javascript
const gui = require('nw.gui')
const win = gui.Window.get()
win.showDevTools()
```

这样，你就会在打开nwjs.app的同时打开一个dev窗口了。

## 5. 更多的features

显然，这是的LittleMD是十分简陋的，我们需要加入更多的功能。这里，我对一些功能的实现提供一点思路。

- 菜单

作为一个编辑器，我们还是需要基本的菜单的。参照nw.js的[菜单文档](http://docs.nwjs.io/en/latest/References/Menu/)。建立一个 `menu.js`。

```javascript
module.exports = {
  openFile() {
    editor.chooseFile('#openFile', filename => {
      editor.loadFile(filename)
    })
  },

  initMenu() {
    const win = global.gui.Window.get()
    const menubar = new global.gui.Menu({ type: 'menubar' })
    const fileMenu = new global.gui.Menu()

    // for Mac
    menubar.createMacBuiltin('LittleMD')

    fileMenu.append(new global.gui.MenuItem({
      label: 'Open...',
      click: this.openFile,
      modifiers: 'cmd',
      key: 'o',
    }))
    ... // other code
    menubar.append(new global.gui.MenuItem({
      label: 'File',
      submenu: fileMenu,
    }))
    win.menu = menubar
  },
}
```

`createMacBuiltin` 方法会建立一些常用的Mac界面菜单，上例中，我又加入了一个打开文件的菜单，其他功能与此类似。

这里简单介绍下打开文件的实现，利用了nw.js提供的html5的功能。首先，你需要在 `index.html` 中加入一个隐藏的input，如下例子。

```html
<input style='display: none;' id='openFile' type='file' />
```

在 `editor.js` 中加入 `chooseFile` 方法。

```javascript
chooseFile(selector, callback) { // save
  const chooser = $(selector)
  chooser.change(() => {
    callback(chooser.val())
  })
  chooser.trigger('click')
},
```

然后在 `menu.js` 中加入 `openFile` 方法。

```javascript
openFile() {
  editor.chooseFile('#openFile', filename => {
    editor.loadFile(filename)
  })
},
```

这样，你在File菜单中点击 `Open...` 就会打开新文件了，而 `editor.loadFile` 则是将文件内容载入到编辑框中，利用nodejs中fs的readFile很容易搞定，这里就略过了。

- 代码高亮

还记得前面引入的 `highlight.js` 吗，结合 `marked` ，可以做到实时 `reload` 的时候转化为代码高亮的dom结构。具体逻辑参看[marked highlight](https://github.com/chjj/marked)。实现代码在上面气势已经给出，就是 `reload` 中的highlight设置。

```javascript
highlight: code => hljs.highlightAuto(code).value,
```

再打开app看下，是不是有代码高亮了，当然前提是引入相关样式。具体可以参看[highlight.js](https://highlightjs.org/)。

- emoji

一个有逼格的编辑器，怎么能没有emoji。这里采用了[emoji-cheat-sheet](http://www.webpagefx.com/tools/emoji-cheat-sheet/)的语法。

你可以改写marked语法实现 `:smile:` 到emoji表情的映射，也可以采用别人的库，例如[emojify.js](https://github.com/Ranks/emojify.js)。`emojify.js`定制更方便，当然如果有自己的需要，那还是改写parser更好。

以下是以 `emojify.js` 为例写的，在 `editor.js` 的 `reload` 结尾加入以下语句即可。

```javascript
emojify.run(preview.get(0))
```

- 图片上传

markdown编辑图片时，如果是本地图片，需要传到第三方的空间，未免麻烦。由于我使用了七牛的cdn，这里以七牛的sdk为例实现了图片上传功能。

核心功能实现参见[七牛sdk](http://o9gnz92z5.bkt.clouddn.com/code/v6/sdk/nodejs.html)。

- 导出pdf

利用 `phantomjs` 实现，LittleMD采用了一个npm包 `phantom-html2pdf` 实现了这个功能。当然这个包有不少坑，后面再提。

## 6. 一些问题与反思

npm包功能强大，实现很多功能都很方便。但是，很多项目年久失修，缺乏维护，所以，必要时候要学会自己修改源码。比如上面提到的 `phantom-html2pdf` 这个包，实际使用发现导出的pdf一直是空的。debug之后才发现，由于node版本原因，它依赖的 `phantomjs-prebuilt` 没有执行文件，而且执行路径也是错误的。修改之后，实现了具体功能。

## 7. 最后

目前(2016-10-09)已经发布了v0.02版本，欢迎试用并提出你的意见，[地址](https://github.com/excaliburhan/LittleMD/releases)。
