


该Node.js SDK 适用于Node.js 0.4.7及其以上版本，基于得图云存储官方API构建。 若您的服务端是一个基于 Node.js 编写的网络程序，使用此 SDK ， 能让您以非常便捷地方式将数据安全地存储到得图云存储上。 以便让您应用的终端用户进行高速上传和下载，同时也使得您的服务端更加轻盈。


- [应用接入](#install)
	- [获取Access Key 和 Secret Key](#acc-appkey)
- [使用说明](#detuyun-api)
	- [1 初始化DetuYun](#detuyun-init)
	- [2 上传文件](#detuyun-upload)
	- [3 下载文件](#detuyun-down)
	- [4 创建目录](#detuyun-createdir)
	- [5 删除目录或者文件](#detuyun-deletedir)
	- [6 获取目录文件列表](#detuyun-getdir)
	- [7 获取文件信息](#detuyun-getfile)
	- [8 获取空间使用状况](#detuyun-getused)
- [异常处理](#detuyun-exception)


<a name="install"></a>
## 应用接入
<a name="acc-appkey"></a>

### 1. 获取Access Key 和 Secret Key

要接入得图云存储，您需要拥有一对有效的 Access Key 和 Secret Key 用来进行签名认证。可以通过如下步骤获得：

1. <a href="http://www.detuyun.com/user/accesskey" target="_blank">登录得图云开发者自助平台，查看 Access Key 和 Secret Key 。</a>
<a name=detuyun-api></a>
## 使用说明

<a name="detuyun-init"></a>
### 1.初始化DetuYun

	var DetuYun = function (bucketname, username, password) {
	    _bucketname = bucketname;
	    _username = username;
	    _password = md5(password);
	}

参数`bucketname`为空间名称，`username`为Access Key，`password`为Access Secret。

示例代码如下：

````
var detuyun = new DetuYun("buckname", "username", "password");
````

<a name="detuyun-upload"></a>
### 2. 上传文件
	
	DetuYun.prototype.writeFile = function (file, data, autoMkdir, callback, opts){
	    _autoMkdir = autoMkdir;
	
	    httpAction('PUT', file, data, null, function(err, res){
	        if (!err)
	            callback(err, res.body);
	        else
	            callback(err);
	    }, opts);
	}
参数`file`为文件路径（包含文件名），`data`为文件内容，`auotoMkdir`表示是否自动创建父级目录，`callback`表示回调函数，`opts`为可选参数，`opts.header`可用于指定额外的http header。opts`参数可以设置的值还包括：

* CONTENT_TYPE
* CONTENT_MD5
* X_GMKERL_THUMBNAIL
* X_GMKERL_TYPE
* X_GMKERL_VALUE
* X_GMKERL_QUALITY

参数的具体使用方法，请参考 <a target="_blank" href="http://www.detuyun.com/docs/page2.html">标准API上传文件</a>。

	DetuYun.prototype.getWritedFileInfo = function(key){
	    if (!_tmpInfo[key]) return null;
	    return _tmpInfo[key];
	}
文件上传成功后，可以获取上传文件后的信息，仅图片空间有返回数据，参数`key`为信息字段名，包括 ：

	x-DetuYun-width
	x-DetuYun-height
	x-DetuYun-frames
	x-DetuYun-file-type


示例代码

	//上传文件
	var path = './Hydrangeas.jpg';
	var file = fs.readFileSync(path);
	detuyun.writeFile('/test.jpg', file, false, testCallback);
	detuyun.writeFile('/test/test.jpg', '12323231', true, testCallback);

文件空间上传成功后返回`True`，如果上传失败，则会抛出异常。

<a name=detuyun-down></a>
### 3. 下载文件

	DetuYun.prototype.readFile = function (file, output_file, callback) {
	    httpAction('GET', file, null, output_file, function(err, res){
	        if (!err)
	            callback(err, res.body);
	        else
	            callback(err);
	    });
	}
参数`file`为文件路径（包含文件名），`output_file`为输出文件的路径（默认为`null`，结果返回文件内容，如设置`output_file`，将返回 `true` 或 `false`）。`

示例代码如下：
````
detuyun.readFile('/test3.jpg', './test3.jpg', function(){});
````

直接获取文件时，返回文件内容，使用数据流形式获取时，成功返回`True`。
如果获取文件失败，则抛出异常。

<a name=detuyun-createdir></a>
### 4.创建目录

	DetuYun.prototype.mkDir = function (path, autoMkdir, callback) {
	    _autoMkdir = autoMkdir;
	    httpAction('PUT', path, null, null, function(err, res){
	        if (!err)
	            callback(err, res.body);
	        else
	            callback(err);
	    }, { header: { folder: true } });
	}
目录路径必须以斜杠 `/` 结尾，创建成功返回 `True`，否则抛出异常。

示例代码如下：

````
detuyun.mkDir('/test1', true, testCallback);
````

<a name=detuyun-deletedir></a>
### 5.删除目录或者文件

删除文件

	DetuYun.prototype.deleteFile = function (file, callback){
	    httpAction('DELETE', file, null, null, function(err, res){
	        if (!err)
	            callback(err, res.body);
	        else
	            callback(err);
	    });
	}

删除目录

	DetuYun.prototype.rmDir = function (path, callback){
	    httpAction('DELETE', path, null, null, function(err, res){
	        if (!err)
	            callback(err, res.body);
	        else
	            callback(err);
	    });
	}

删除成功返回True，否则抛出异常。注意删除目录时，必须保证目录为空 ，否则也会抛出异常。

示例代码如下

	//删除文件
	detuyun.deleteFile('/test.jpg', testCallback);
	//删除目录
	detuyun.rmDir('/test1', testCallback);

<a name=detuyun-getdir></a>
### 6.获取目录文件列表

	DetuYun.prototype.readDir = function (path, callback){
	    callback = typeof callback == 'function' ? callback : function() {};
		httpAction('GET', path, null, null, function(err, data) {
	        if (!err) {
		        var dirs = data.body.split("\n");
	            var result = [];
	
	            for (var i = 0; i < dirs.length; i++) {
	                var dir = dirs[i];
	                var attrs = dir.split("\t");
	                dir = {
	                    name: attrs[0],
	                    type: attrs[1],
	                    size: attrs[2],
	                    time: attrs[3],
	                    filetype: attrs[4]
	                }
	                result.push(dir);
	            }
	
	            callback(err, result);
	        }
	        else {
	            callback(err);
	        }
	    });
	}
获取目录文件以及子目录列表。需要获取根目录列表是，使用 `data.body.split("\n")` ，或直接表用方法不传递参数。目录获取失败则抛出异常。

示例代码如下：
 
	//获取目录文件列表
	detuyun.readDir('/', testCallback);

<a name=detuyun-getfile></a>
### 7.获取文件信息

	DetuYun.prototype.getFileInfo = function(file, callback){
	    httpAction('HEAD', file, null, null, function(err, res){
	        if (!err) {
				var fileinfo = res.headers['x-detuyun-file'].split('\t');
	            callback(err, {
	                'name':fileinfo[0],	
	                'type': fileinfo[1],
	                'size': fileinfo[2],
	                'date': fileinfo[3]
	            });
	        }
	        else {
	            callback(err);
	        }
	    });
	}
获取文件信息时通过Tab键分隔获取相应内容，返回结果为一个数组。

示例代码：

	//获取文件信息
	detuyun.getFileInfo('/test1.jpg', testCallback);

返回的结果为空间使用量，单位 kb。

## 异常处理
当API请求发生错误时，SDK将抛出异常，具体错误代码请参考 <a target="_blank"  href="http://www.detuyun.com/docs/page6.html">标准API错误代码表</a>

根据返回HTTP CODE的不同，SDK将抛出以下异常：

* **DetuYunAuthorizationException** 401，授权错误
* **DetuYunForbiddenException** 403，权限错误
* **DetuYunNotFoundException** 404，文件或目录不存在
* **DetuYunNotAcceptableException** 406， 目录错误
* **DetuYunServiceUnavailable** 503，系统错误

未包含在以上异常中的错误，将统一抛出 `DetuYunException` 异常。






