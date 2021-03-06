var crypto = require('crypto');
var http = require('http');

var _apiDomain = 's.detuyun.com';
var _autoMkdir = false;
var _contentMD5 = null;
var _fileSecret = null;
var _tmpInfo = {};

var _bucketname, _username, _password;

/**
 * 初始化 DetuYun 存储接口
 * @param bucketname 空间名称
 * @param username 操作员名称
 * @param password 密码
 * return null
 */
var DetuYun = function (bucketname, username, password) {
    _bucketname = bucketname;
    _username = username;
    _password = md5(password);
}

exports.DetuYun = DetuYun;

DetuYun.prototype.version = function(){
    return '1.0.1';
}

/**
 * 切换 API 接口的域名
 * @param domain {默认 s.DetuYun.com 自动识别}
 * return null;
 */
DetuYun.prototype.setApiDomain = function (domain) {
    _apiDomain = domain;
}

/**
 * 设置待上传文件的 Content-MD5 值（如得图云服务端收到的文件MD5值与用户设置的不一致，将回报 Not Accept 错误）
 * @param $str （文件 MD5 校验码）
 * return null;
 */
DetuYun.prototype.setContentMD5 = function(str){
    _contentMD5 = str;
}

/**
* 设置待上传文件的 访问密钥（注意：仅支持图片空！，设置密钥后，无法根据原文件URL直接访问，需带 URL 后面加上 （缩略图间隔标志符+密钥） 进行访问）
* 如缩略图间隔标志符为 ! ，密钥为 bac，上传文件路径为 /folder/test.jpg ，那么该图片的对外访问地址为： http://空间域名/folder/test.jpg!bac
* @param $str （文件 MD5 校验码）
* return null;
*/
DetuYun.prototype.setFileSecret = function(str){
	_fileSecret = str;
}

/**
* 获取文件信息
* @param $file 文件路径（包含文件名）
* return object { 'type': file | folder, 'size': file size, 'date': unix time } 或 null
*/
DetuYun.prototype.getFileInfo = function(file, callback){
    httpAction('HEAD', file, null, null, function(err, res){
        if (!err) {
			var fileinfo = res.headers['x-detuyun-file'].split('\t');
            callback(err, {
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

/**
* 获取上传文件后的信息（仅图片空间有返回数据）
* @param $key 信息字段名（x-DetuYun-width、x-DetuYun-height、x-DetuYun-frames、x-DetuYun-file-type）
* return value or NULL
*/
DetuYun.prototype.getWritedFileInfo = function(key){
    if (!_tmpInfo[key]) return null;
    return _tmpInfo[key];
}


/**
 * 获取总体空间的占用信息
 * @param callback 回调函数
 */
DetuYun.prototype.getBucketUsage = function(callback){
    this.getFolderUsage('/', callback);
}

/**
 * 获取某个子目录的占用信息
 * @param path 目标路径
 * @param callback 回调函数
 */
DetuYun.prototype.getFolderUsage = function (path, callback){
    httpAction('GET', path + '?usage', null, null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    });
}

/**
 * 上传文件
 * @param file 文件路径（包含文件名）
 * @param data 文件内容
 * @param autoMkdir 是否自动创建父级目录
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
DetuYun.prototype.writeFile = function (file, data, autoMkdir, callback, opts){
    _autoMkdir = autoMkdir;

    httpAction('PUT', file, data, null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
* 读取文件
* @param file 文件路径（包含文件名）
* @param output_file 输出文件的路径（默认为 null，结果返回文件内容，如设置output_file，将返回 true or false）
* return 文件内容 或 null
*/
DetuYun.prototype.readFile = function (file, output_file, callback) {
    httpAction('GET', file, null, output_file, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    });
}

/**
* 删除文件
* @param $file 文件路径（包含文件名）
* return true or false
*/
DetuYun.prototype.deleteFile = function (file, callback){
    httpAction('DELETE', file, null, null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    });
}

/**
* 创建目录
* @param path 目录路径
* @param auto_mkdir 是否自动创建父级目录
*/
DetuYun.prototype.mkDir = function (path, autoMkdir, callback) {
    _autoMkdir = autoMkdir;
    httpAction('PUT', path, null, null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, { header: { folder: true } });
}

/**
* 删除目录
* @param path 目录路径
*/
DetuYun.prototype.rmDir = function (path, callback){
    httpAction('DELETE', path, null, null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    });
}

/**
* 读取目录列表
* @param path 目录路径
*/
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
                    time: attrs[3]
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


/**
 * Generate md5 digest
 * @param string a string for generate md5 digest
 * return md5 digest of given string in hex encoding.
 */
function md5(string) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(string, 'utf8');
    return md5sum.digest('hex');
}

/**
 * 连接签名方法
 * @param $method 请求方式 {GET, POST, PUT, DELETE}
 * return 签名字符串
 */
function sign(method, uri, date, length) {
    var sign = uri + '&' + date + '&' + _password;
    return 'DetuYun ' + _username + ':' + md5(sign);
}

function httpAction(method, uri, data, outputFile, callback, opts) {
    callback = typeof callback == 'function' ? callback : function() {};

    _tmpInfo = {};
    uri = '/' + _bucketname + uri;
    var options = {
        host: _apiDomain,
        method: method,
        path: uri
    };

    var length = data ? (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) : 0;
    var headers = {};

    headers['Expect'] = '';

	if (_contentMD5 !== null) {
        headers['Content-MD5'] = _contentMD5;
    }
    _contentMD5 = null;

	if (_fileSecret !== null) {
        headers['Content-Secret'] = _fileSecret;
    }
    _fileSecret = null;

    headers['Content-Length'] = length;

    if (opts && opts.header) {
        for (key in opts.header) {
            headers[key] = opts.header[key];
        }
    }

    if ((method == 'PUT' || method == 'POST') && _autoMkdir == true) {
        headers.mkdir = 'true';
    }

    var date = (new Date()).toUTCString();
    headers.Date = date;
    headers.Authorization = sign(method, uri, date, length);

    options.headers = headers;

    var resData = '';

    var req = http.request(options, function(res) {
        // Hander request
        res.setEncoding('base64');
        res.on('data', function (chunk) {
            resData += chunk;
        });
        res.on('end', function() {
            for (key in res.headers) {
                if (key.indexOf('x-DetuYun') == 0) {
                    if (~['width', 'heigh', 'frame'].indexOf(key.substr(8, 5))) {
                        _tmpInfo[key] = Number(res.headers[key]);
                    }
                    else {
                        _tmpInfo[key] = res.headers[key];
                    }
                }
            }
            //console.log(res.headers);
            //console.log(options);
            //console.log(outputFile);
            if (outputFile) {
                var fs = require('fs');
                fs.writeFile(outputFile, resData, {encoding:'base64'}, function(err) {
                    callback(err, {
                        headers: res.headers,
                        body: resData
                    });
                })
            }
            else {
                var buffer = new Buffer(resData, 'base64');
                resData = buffer.toString('utf8');
                if (res.statusCode >= 400 && res.statusCode < 600) {
                    callback({
                        statusCode: res.statusCode,
                        message: resData
                    });
                }
                else {
                    callback(null, {
                        headers: res.headers,
                        body: resData
                    });
                }
            }
        });
    });

    req.on('error', function(e) {
        if (typeof callback == 'function') {
            callback(e, null);
        }
    });

    data && req.write(data);
    req.end();
}
