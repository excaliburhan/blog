---
title: 给你的项目增加Webhooks，自动进行部署（包含Github/Gitlab）
date: 2017-01-22
---

# 给你的项目增加Webhooks，自动进行部署（包含Github/Gitlab）

## 前言

Github或者Gitlab的Webhooks，允许用户订阅特定的事件，如commit, push，两者不尽相同，但本质差不太多。Github的可以参看[github webhooks](https://developer.github.com/webhooks/)，Gitlab可以参看[gitlab webhooks](https://docs.gitlab.com/ee/web_hooks/web_hooks.html)。

本文后续都以Github为例进行讲解，Gitlab相关可以参考相关内容。

<!--more-->

## 自动部署脚本

Webhooks的作用就是在特定的事件执行的时候触发自定义的动作。本质上，Github的Webhooks触发后，会给相应的URL(自行设置，后面会讲解)发送POST请求，请求头中含有event等相应的信息。

而正确响应后的事件，比如push完之后，触发自动部署脚本，现在我们来写一个简单的脚本。

```bash
#!/bin/bash
PROJECT_DIR = 'path-to-your-project'

echo 'start'
cd $PROJECT_DIR

echo 'pull code'
git reset --hard origin/master && git clean -f
git pull && git checkout master

echo 'run npm script'
npm run build

echo 'finished'
```

脚本大概的作用就是cd到项目目录，拉取最新的代码，build代码(该步骤不一定需要，如果你的代码直接可以上测试/生产环境)。你必须保证，脚本中涉及的环境变量是可用的，比如`git`，`npm`等等。

我们把这个脚本命名为`deploy.sh`，暂时放在一边，等需要的时候再用。

## 设置Webhooks

在你的项目中，通过`Settings` -> `Webhooks` -> `Add webhook`进入webhook设置页面。我们以下都以push事件为例。

![alt](https://static.excaliburhan.com/blog/20170122/Yqhvg8aNP-edKP-2WLADJWRz.jpeg?imageView2/0/w/600)

`Payload URL`就是push之后，请求的url，我们这是`https://example.com/app`。

`Content type`目前有两种，根据server提供的来写，我们选择json格式的，因为后面的server使用的是json的。

`Secret`就是密码了，后面校验的时候需要用到。

`events`就是触发的事件列表，我们选push就行了，可以选择全部事件(第二个选项)，也可以根据需要选择(第三个选项)。个人建议最好是根据需要去选择，不然会发送很多无谓的请求，加重服务器的压力。

然后就是处理请求的逻辑了，目前Github上有很多处理的handler。对于前端，当然是node的最熟悉，可以采用[github-webhook-handler](https://github.com/rvagg/github-webhook-handler)，但是这个单个webhook处理比较方便，多个会比较麻烦，所以这里采用的就是我自己撸的一个支持多个webhooks的[node-github-webhook](https://github.com/excaliburhan/node-github-webhook)。

### 安装

```bash
npm install node-github-webhook --save
```

### 入口文件app.js

```js
var http = require('http')
var createHandler = require('node-github-webhook')
var handler = createHandler({ path: '/app', secret: 'appsecret' }) // single handler

function execFunc(content) {
  var exec = require('child_process').exec
  exec(content, function(error, stdout, stderr) {
    if (error) {
      console.error('exec error:' + error)
      return
    }
    console.log('stdout:' + stdout)
    console.log('stderr:' + stderr)
  })
}

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  execFunc('sh ./deploy.sh')
})
```

`path`就是前面`Payload URL`的内容，切记，是不包含host的，`secret`就是自己设置的密码。

这里为了方便，写的是单个webhook的设置，如果你有多个项目，设置请参考[这个](https://github.com/excaliburhan/node-github-webhook)。

## 守护程序

理论上，现在就可以运行了。

```bash
node app.js
```

但是，现在的node-github-webhook遇到错误是直接抛错的，会终止程序的进行，所以最好采用守护进程去运行，如`pm2`，`forever`，我这采用了`pm2`。

```bash
pm2 start app.js
```

## 反向代理

现在程序是在7777端口跑的，需要Ngnix反向代理到80端口。这里就不展开了。如果不想做，可以直接把`Payload URL`设置成`https://example.com:7777/app`，就是看起来不够优雅。

## 结果

一般来说，如果成功了的话，你的代码就已经更新了。如果你需要看具体的请求内容和返回结果，可以在`Webhooks`里的`Recent Deliveries`查看每次请求的内容。
