---
title: 七牛免费SSL证书，配置自定义域名CDN加速
date: 2016-12-02
---

# 七牛免费SSL证书，配置自定义域名CDN加速

## 申请七牛SSL证书

其实，七牛在很早之前就支持CDN使用https，但是他要求证书的有效期是一年及以上，而我的主站用了Let's Encrypt的免费SSL证书，有效期90天，自动续签的形式。所以，为了使CDN的图片也是https的，一直采用了七牛默认的`xxx.qnssl.com`域名。

在11月，七牛发布了免费SSL证书，亚洲诚信的DV证书。申请起来也很简单，参见[七牛SSL证书申请](https://qiniu.kf5.com/hc/kb/article/223541/)。当然，申请的证书只能用于CDN加速。

<!--more-->

## 绑定自定义域名

通过个人面板-证书管理，我申请了域名为`static.excaliburhan.com`的SSL证书，验证成功后，接下来就是绑定自定义域名了。进入七牛云空间首页，点击对象存储，选择你想要使用https的bucket，在融合 CDN加速域名自定义域名点击右边，进行添加自定义域名。

在通信协议选项中选择HTTPS，可以选择或者手动填写证书。如果申请成功，下拉就可以看到我们的证书了。选中后，七牛会自动填写证书内容和私钥。这时，不要急着点击完成，将证书内容复制保存为certificate.crt（名字可以自行改，后缀需要保持一下，下同），将私钥内容复制保存为certificate.key，为后面配置做准备。这么做的原因主要是，我不知道怎么去下载证书内容和私钥，所以就采用这种比较原始的方法了。如果你知道的话，请告诉我。

最后，填完所有内容之后，点击创建即可。这时，添加的域名应该还处于审核状态，需要你添加CNAME，按照要求填写CNAME之后，进入nginx设置环节。

## nginx设置

由于我的主站使用的Let's Encrypt证书，并且没有进行泛域名的配置，实际上Let's Encrypt也暂时不支持。那么，对`static.excaliburhan.com`进行设置。

首先，我们需要把保存的certificate.crt和certificate.key传到服务器的相应目录，我这的目录是`/etc/nginx/certs`。nginx简单配置如下。

```nginx
server {
    listen       443 ssl http2;
    server_name  static.excaliburhan.com;

    ssl    on;
    ssl_certificate        /etc/nginx/certs/certificate.crt;
    ssl_certificate_key    /etc/nginx/certs/certificate.key;
}
```

重启nginx，将七牛CDN的域名换成自定义的域名，发现Chrome报错：隐私设置错误。研究发现，主要是我nginx主站设置了HSTS和HPKP，并且都设置了includeSubDomains。而我的主站使用的SSL证书和七牛的SSL证书并不是一个厂商，所以，请求被当成了劫持攻击了！

```nginx
add_header    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header    Public-Key-Pins ...(pin-sha256指纹设置);max-age=604800; includeSubDomains;
```

解决方法就是去掉includeSubDomains。

```nginx
add_header    Strict-Transport-Security "max-age=31536000";
add_header    Public-Key-Pins ...(pin-sha256指纹设置);max-age=604800;
```

而且我还去掉了preload，原因有二，一是preload list申请必须包含includeSubDomains；二是个人网站申请Chrome的preload list基本无效。

除此之外，还要添加七牛SSL证书的CA的Public Key指纹，七牛的SSL证书是TrustAsia DV SSL CA - G5，指纹是`IiSbZ4pMDEyXvtl7Lg8K3FNmJcTAhKUTrB2FQOaAO/s=`。当然你也可以采用根证书VeriSign Class 3 Public Primary Certification 的指纹：`JbQbUG5JMJUoI6brnx0x3vZF6jilxsapbXGVfjhN8Fg=`。不推荐使用站点证书生成的指纹。

添加完毕后，使用`service nginx restart`重启nginx即可。

## 后话

你也看到了，我的Public-Key-Pins设置了大概一周时间的max-age，所以一周内访问过我的网站，很有可能出现`static.excaliburhan.com`的静态资源加载不出来的情况。这时候，如果是Chrome，你可以在`chrome://net-internals/#hsts`中，手动delete domain：excaliburhan.com。

为了证明现在的静态资源是使用自定义域名的，放张图。

![alt](https://static.excaliburhan.com/blog/20161202/DgwP_Asc50b3nuCMuviG9GHD.jpg)
