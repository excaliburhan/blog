---
title: nginx升级mainline+网站部署http/2
date: 2016-02-24
---

# nginx升级mainline+网站部署http/2

## nginx版本

nginx共有3个版本。

Mainline version: 最新的开发版

Stable version: 最新的稳定版本

Legacy version: 历史遗留版本

大部分人(我之前)都是使用stable的版本的，最近看到[一篇文章](https://imququ.com/post/nginx-http2-patch.html)发现nginx在1.9.5之后开始支持http/2了，于是尝试给自己网站部署http/2。

不过目前stable版本是1.8.1，只有mainline版本是1.9.5+(目前是1.9.11)，所以需要手动升级nginx为mainline版本。

## 升级nginx到mainline版本

具体升级办法可以在nginx官网找到，[攻略在此](http://nginx.org/en/linux_packages.html#distributions)。
我的服务器是CentOS6.5，根据文档按图索骥即可。

- 创建nginx安装的yum源

```bash
vim /etc/yum.repos.d/nginx.repo
```

- 将以下内容填入nginx.repo

```bash
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/mainline/OS/OSRELEASE/$basearch/
gpgcheck=0
enabled=1
```

其中OS=centos，OSRELEASE=6.5，其他系统版本根据文档自行调整。

- 安装

```bash
yum install nginx
```

## ssl证书

接下来就是下载安装ssl证书了。一般的ssl证书需要用钱购买，不过最近比较火热的一款免费https证书，Lets Encrypt，使用相当简单(~~傻瓜~~)。

然而Lets Encrypt官方的步骤还是比较复杂的，github上有个人写了一个[自动化脚本](https://github.com/xdtianyu/scripts/tree/master/lets-encrypt)，一键生成证书。

- wget到本地

创建存放证书的目录，我创建在nginx目录下。

```bash
cd /etc/nginx && mkdir letsencrypt
wget https://raw.githubusercontent.com/xdtianyu/scripts/master/lets-encrypt/letsencrypt.conf
wget https://raw.githubusercontent.com/xdtianyu/scripts/master/lets-encrypt/letsencrypt.sh
chmod +x letsencrypt.sh
```

- 配置信息

cd到刚才的目录下，修改conf文件

```vim
ACCOUNT_KEY="letsencrypt-account.key"
DOMAIN_KEY="domain.key"
DOMAIN_DIR="/var/www/domain.com"
DOMAINS="DNS:domain.com,DNS:www.domain.com"
```

根据你的域名信息，修改DOMAINKEY，DOMAINDIR，DOMAINS即可。注意，Lets Encrypt证书并不支持泛域名(太可惜了!)。

- 运行

```bash
./letsencrypt.sh letsencrypt.conf
```

脚本会自动生成多个文件。

- 定时任务

由于Lets Encrypt证书有效时间为90天，所以最好设定一个定时任务，比如一个月，自动更新证书。

```bash
0 0 1 * * /etc/nginx/certs/letsencrypt.sh /etc/nginx/certs/letsencrypt.conf >> /var/log/lets-encrypt.log 2>&1
```

你可以在sh文件最后加上service nginx reload，更加智能。

## 配置nginx

然后就是配置nginx文件了。

```bash
vim /etc/nginx/nginx.conf
```

编辑https的server内容。

```nginx
server {
    listen               443 ssl http2;
    server_name          www.domain.com domain.com;

    ssl_certificate      /etc/nginx/letsencrypt/domain.chained.crt;
    ssl_certificate_key  /etc/nginx/letsencrypt/domain.key;
}
```

如此配置后，通过http访问还是会访问80端口，可以做一个http跳转。

```nginx
server {
    listen               80;
    server_name          www.domain.com domain.com;
    return 301 https://www.domain.com$request_uri;
}
```

最后重启下nginx。

```bash
service nginx restart
```

## 最终效果

![alt](https://o2znrmehg.qnssl.com/ghost/2016/03/04/https-1457070223090.png)

至于https证书有什么用，当然是更加安全(~~装逼~~)。

至少，运行商不能劫持了～
