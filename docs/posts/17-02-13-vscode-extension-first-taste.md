---
title: VSCODE插件初体验
date: 2017-02-13
---

# VSCODE插件初体验

## 前言

使用vscode也有大半年时间了，从一开始的各种问题到现在渐渐好用。插件维护比sublime好，速度能秒atom，这大概就是现在离不开vscode的原因吧。虽然它还有不少问题，比如代码高亮和智能提示，尤其是在vue这种template文件中，完全没有用！

<!--more-->

不过今天不是来吐槽这个的。虽然说到vscode的插件比sublime维护方便，但是插件数量还是比不上的，毕竟时间还不长。比如我一直很喜欢的作者信息生成的插件，什么名字忘记了，毕竟卸载好久了...主要就是设置了作者姓名，邮箱这些信息之后，在顶部自动生成包括作者/邮箱/时间还有其他自定义的信息。

在vscode插件市场找了半天也没找到，决定自己动手撸一个。

- 项目地址：[https://github.com/excaliburhan/vscode-author-generator](https://github.com/excaliburhan/vscode-author-generator)。
- 插件安装：vscode或者市场搜索`vscode-author-generator`。

## 需求准备

首先，确定下这个插件的需求：

- 自动生成作者信息，部分信息(作者/邮箱)可配置。
- 根据文件类型生成不同注释。
- 支持自定义模版。

## 其他准备

- [vscode api文档](https://code.visualstudio.com/docs/extensionAPI/vscode-api)
- [vscecli 文档](https://code.visualstudio.com/docs/tools/vscecli)

这两个文档在之后的开发会用到，下面会讲到。

## 开发插件

### 1. vscecli信息

由于后面生成项目要用到发布者信息，我就把vscecli的生成发布者信息部分先讲了，当然后面发布还要用到它。下面是生成发布者信息的步骤，最好还是按照vscecli的文档来做。

- 安装：`npm install -g vsce`
- 创建：`vsce create-publisher (publisher name)` (publisher name就是发布者的名字，是你在visualstudio注册的名字，此外你还需要Personal Access Token)
- 登陆：`vsce login (publisher name)` (这一步会要求你输入发布者名字和Personal Access Token)

至此，本地会记住你的信息，如果你需要更换用户，也可以使用`vsce logout`登出，并换账号登陆。

### 2. 生成项目

这里我使用了官方的generator，生成必要的`package.json`信息，如果你自己去写，可以参看[官网文档](https://code.visualstudio.com/docs/extensionAPI/extension-manifest)。

- `npm install -g yo generator-code && yo code`

![alt](https://static.excaliburhan.com/blog/20170213/COWO3NSOempfVbg695QfgHSA.jpeg)

可以看到，提供了几种基本插件/主题编写的模版，由于我没学过typescript，这里选择了javascript的插件。

按部就班填写信息，如果你已经在上一步登陆`vsce`，这里的publisher name是自动填写的，你也可以手动填写，但保持和你的注册用户名一致。

![alt](https://static.excaliburhan.com/blog/20170213/_YPzqd-46NhRNCdsNROv3yY_.jpeg)

确认后，会自动使用npm安装依赖，耐心等待一会，项目就生成完毕。

我这里没有让它自动生成git项目，可以通过`git remote add`添加你自己的github仓库地址。

![alt](https://static.excaliburhan.com/blog/20170213/4ez3C47KiN2xLoqOAcJ-AKNL.jpeg)

生成的项目结构大概是这样的，由于功能比较简单，这里只要关心`extension.js`就可以了，这是我们的主要功能js。

### 3. manifest解释

vscode的manifest文件，也就是`package.json`文件，先来看看默认生成的：

```json
{
    "name": "vscode-test",  // 插件名字
    "displayName": "vscode-test", // 插件显示名字
    "description": "test",
    "version": "0.0.1",  // 插件版本
    "publisher": "edwardhjp",  // 发布者
    "engines": {
        "vscode": "^1.5.0"
    },
    "categories": [
        "Other"
    ],
    "activationEvents": [
        "onCommand:extension.sayHello" // 激活事件，onCommand表示command调用，就是在vscode用`cmd + shift + p`调出来后使用，其他的参看文档。
    ],
    "main": "./extension", // 入口文件
    "contributes": {
        "commands": [{
            "command": "extension.sayHello",  // `cmd + shift + p`实际执行的command，和上面的激活事件要对应
            "title": "Hello World" // `cmd + shift + p`调用显示名字
        }]
    },
    "scripts": {
        "postinstall": "node ./node_modules/vscode/bin/install",
        "test": "node ./node_modules/vscode/bin/test"
    },
    "devDependencies": {
        "typescript": "^2.0.3",
        "vscode": "^1.0.0",
        "mocha": "^2.3.3",
        "eslint": "^3.6.0",
        "@types/node": "^6.0.40",
        "@types/mocha": "^2.2.32"
    }
}
```

基本解释都写在注释里了，根据自己需要修改吧。

### 4. extension.js编写

```js
var vscode = require('vscode'); // 包含vscode所有api的模块

function activate(context) {
    // 插件激活事件，必须与package.json的对应
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // Info信息框
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// 取消插件激活事件
function deactivate() {
}
exports.deactivate = deactivate;
```

官方的js文件，就是在调用的时候弹一个`Hello World!`的提示框。原则上你的逻辑都应该在`registerCommand`的function里面。如果你的逻辑很复杂，建议把逻辑移到外面，合理解构代码。

你可以在vscode打开项目的目录文件，然后使用`F5`进行debug模式，vscode会起一个扩展主机给你进行开发。

但是我的vscode不知道什么原因，扩展主机一直失败。我都是直接把项目拷贝到本地插件目录进行开发的，每次debug都要重启vscode，说多了都是泪～

如果你知道怎么解决，请告诉我！

### 5. 插件发布

又要用到刚才的vscecli了。

在项目根目录使用：`vsce package`打包你的插件，会生成一个`extensionName-version.vsix`的信息文件。

然后：`vsce publish`，进行发布，如果成功，会返回类似内容：

```js
Successfully published publisherName.extensionName@version!
```

## 尾声

好了，现在你可以在vscode市场搜索你自己上传的插件了。祝大家写得愉快！
