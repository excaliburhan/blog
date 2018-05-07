---
title: FireKylin博客上传图片更换为七牛CDN
date: 2016-11-22
---

# FireKylin博客上传图片更换为七牛CDN

## 前情

前几天把博客从Ghost迁移到了FireKylin。FireKylin是一个基于ThinkJS2.0，ReactJS和ES6+的博客系统，与Ghost相比，优点还是很多的。

- 基于ThinkJS2.0，可以使用node6.x以上的版本，使用ES6+的特性；
- 使用ReactJS开发，符合自己的学习路线；
- 对生产环境做了大量优化，加载速度很快。

<!--more-->

## 两个问题

第一，目前，FireKylin只能通过WordPress文件导入文章，所以我是通过手动拷贝md文件内容迁移文章的。不得不说，这还是一个体验不足的地方，不过这只是小问题。

第二，打开管理后台准备用Markdown写文章，发现上传图片的地址格式是这样的：`domain.com/static/upload/xxx.png`。Google了一下，也没有发现有这样的改造例子。

因为FireKylin的生产环境代码都是压缩过的，所以要改动十分麻烦，只能修改源代码，然后压缩代码，替换当前的生产环境代码。不过因为自己在Ghost就有改造上传图片到CDN的经验，决定自己加一个。

## 图片上传到七牛

我对七牛CDN相对熟悉一点，所以这次先用七牛试手。

### clone代码

把[FireKylin](https://github.com/75team/firekylin)的代码fork到自己仓库，然后clone下来。

### 安装七牛NodeJS版本的SDK

可以通过npm安装，在项目目录运行`npm install  --save`。七牛SDK的使用可以查看[官方文档](http://o9gnz92z5.bkt.clouddn.com/code/v6/sdk/nodejs.html)。

### 上传到七牛云

在`src/admin/controller`目录下新建一个`store`目录，用来存放相关的逻辑。添加`index.js`，利用SDK实现upload方法。

```js
import path from 'path';
import moment from 'moment';
import qiniu from 'qiniu';

const SETTINGS_PATH = path.join(think.RESOURCE_PATH, 'settings.json'); // 利用www/settings.json获取配置
const settings = think.safeRequire(SETTINGS_PATH) || {};
const config = settings.store || {}

qiniu.conf.ACCESS_KEY = config.accessKey
qiniu.conf.SECRET_KEY = config.secretKey

function getSavePath(filename) {
  const now = new Date();
  const prefix = config.prefix;
  const dir = moment(now).format(config.format);
  const basename = path.basename(filename);
  return `${prefix}/${dir}/${basename}`;
}

function getToken(filename) {
  const bucket = config.bucket;
  const savePath = getSavePath(filename)
  const putPolicy = new qiniu.rs.PutPolicy(`${bucket}:${savePath}`)
  return putPolicy.token();
}

export default {
  enable: config.enable,
  type: config.type,
  upload(filename) {
    return new Promise((resolve, reject) => {
      const savePath = getSavePath(filename);
      const token = getToken(filename);
      const extra = new qiniu.io.PutExtra();
      qiniu.io.putFile(token, savePath, filename, extra, (err, ret) => {
        if (err) {
          reject(err);
        } else {
          const compeletePath = `${config.origin}/${ret.key}`
          resolve(compeletePath);
        }
      });
    });
  }
}
```

这里讲下upload方法。由于qiniu的sdk提供的putFile是一个异步函数，为了能在FireKylin中更好地使用，这里用了闭包实现了一个Promise。这样做的好处是可以根据上传的结果轻松进行resolve/reject，这也是ThinkJS的主要特性之一。

### 修改原来的上传逻辑

由于没有文档，这时就要在源码中寻找逻辑了。最后找到了相关文件，在``src/admin/controller/api/file.js`，一看名字就知道是处理file相关逻辑的，直接看源码。

```js
/** 处理远程抓取 **/
if( this.post('fileUrl') ) {
    return this.getFileByUrl(this.post('fileUrl'));
}
/** 处理导入数据 **/
if( this.post('importor') === 'wordpress' ) {
    return this.importFromWP();
}

let file = this.file('file');
... 省略后续逻辑
```

这是`postAction`的一段代码，值得注意的是，它是一个async function，查看源码你会发现，基本所有的带回调的异步函数都会改写成async function，看来前面的upload方法写成Promise还是有先见之明(笑)。

而this.file是file表单上传方法，会上传到runtime目录。而本地上传则是验证文件成功之后，利用`writeFile`将文件move到static目录。那么，我们要做的就是在move前判断是否上传到CDN，所以在`let file = this.file('file');`之后加入如下代码。

```js
if (storage.enable && storage.type === 'qiniu') {
    return this.uploadByQiniu(file.path);
}
```

其中，storage是通过`import storage from '../store'`引入的。接着，我们来写 uploadByQiniu方法。

```js
async uploadByQiniu(filename) {
  let result = await storage.upload(filename).catch(() =>{
    return this.fail("FILE_UPLOAD_ERROR");
  })
  return this.success(result);
}
```

到这里，如果`settings.json`文件正确设置，并打开enable开关，就可以使用七牛的CDN上传了。

### 修正编辑器地址

当我在dev环境上传图片时，发现自动填入的地址变成了这样：`![alt](http://localhost:8360https://o2znrmehg.qnssl.com/blog/20161122/Fr-MyF6zXtCuH9Fl_5HDDckF.jpg)`。原来自动填入的时候，FireKylin会自动加入location.origin，看来需要改编辑器的逻辑了。

搜寻了之后，在`www/static/src/common/component/editor/index.jsx`找到了相关逻辑。

```js
return firekylin.upload(data).then(
  res => {
    res.data = location.origin + res.data;
    if( res.data.match(/\.(?:jpg|jpeg|png|bmp|gif|webp|svg|wmf|tiff|ico)$/i) ) {
      preInputText(`![alt](${res.data})`, 2, 5);
    } else {
      let text = that.state.fileUrl ? '链接文本' : that.state.file[0].name;
      preInputText(`[${text}](${res.data})`, 1, text.length + 1);
    }
  }
).catch((res)=> TipAction.fail(res.errmsg));
```

果然，FireKylin用域名和本地上传的文件的相对路径，拼接成完整URL，而我本地上传的路径已经是绝对路径了，所以需要加一个正则判断，返回结果为绝对路径则不添加域名。

把`res.data = location.origin + res.data;`改为

```js
const reg = /^http.+/;
if (!reg.test(res.data)) {
  res.data = location.origin + res.data;
}
```

再次测试，成功！

## 获取生产环境代码

现在我们改了的是源代码，而需要的是生产环境代码，需要进行babel编译，压缩等。我在项目跟路径发现了一个build.sh的脚本，打开一看，果然是build生产环境的脚本。不过最后几行应该是奇舞团发布release使用的，注释掉。

```bash
sh build.sh
```

压缩后的代码在`build/firekylin`目录。直接覆盖github下载的生产环境代码即可。

## 反思

花了一晚上码到半夜2点终于实现了功能，不过还有一些瑕疵。

现在的代码还是有一个本地上传的过程，虽然看不到，但还是消耗了资源，希望后续可以改进。

## 后记

最近有点忙，等有时间改进下代码，到时候不是不可以给FireKylin提个Merge Request(笑)。

如果你有什么意见想法，也请不吝赐教。
