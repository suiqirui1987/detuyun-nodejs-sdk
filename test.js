var DetuYun = require('./detuyun').DetuYun;

var fs = require('fs');
// Test code

// 初始化空间
// var detuyun = new DetuYun("buckname", "username", "password");

//获取空间占用大小
// detuyun.getBucketUsage(testCallback);

// detuyun.getFolderUsage('/', testCallback);

// detuyun.writeFile('/test.txt', '12323231', false, testCallback);

// detuyun.writeFile('/test/test.txt', '12323231', true, testCallback);

// detuyun.getFileInfo('/test.txt', testCallback);

// var fs =  require('fs');
// var fileContent = fs.readFileSync('test.jpg');
// var md5Str = md5(fileContent);
// detuyun.setContentMD5(md5Str);
// detuyun.setFileSecret('bac');
// detuyun.writeFile('/test.jpg', fileContent, false, function(err, data){
//     if (!err) {
//         console.log(data);
//         console.log(detuyun.getWritedFileInfo('x-detuyun-width'));
//         console.log(detuyun.getWritedFileInfo('x-detuyun-height'));
//         console.log(detuyun.getWritedFileInfo('x-detuyun-frames'));
//         console.log(detuyun.getWritedFileInfo('x-detuyun-file-type'));
//     }
// });

// detuyun.readFile('/test.txt', 'test.txt', testCallback);

// detuyun.deleteFile('/test.txt', testCallback);

// detuyun.mkDir('/test1', true, testCallback);

// detuyun.rmDir('/test1', testCallback);

// detuyun.readDir('/', testCallback);

function testCallback(err, data) {
    if (!err) {
        console.log('Data: ');
        console.log(data);
    }
    else {
        console.log('Error: ');
        console.log(err);
    }
}

function md5(string) {
    var crypto = require('crypto');
    var md5sum = crypto.createHash('md5');
    md5sum.update(string, 'utf8');
    return md5sum.digest('hex');
}


// 初始化空间
var detuyun = new DetuYun("abcdd", "faith196", "fhx442gh1n1qmeuqyvmtf5nt2uk482");

//获取空间占用大小
/*detuyun.getBucketUsage(testCallback);
detuyun.getFolderUsage('/test1', testCallback);

//上传文件
var path = './Hydrangeas.jpg';
var file = fs.readFileSync(path);
detuyun.writeFile('/test.jpg', file, false, testCallback);
detuyun.writeFile('/test/test.jpg', '12323231', true, testCallback);

//获取文件信息
detuyun.getFileInfo('/test1.jpg', testCallback);

//下载文件
detuyun.readFile('/test3.jpg', './test3.jpg', function(){});

//删除文件
detuyun.deleteFile('/test.jpg', testCallback);

//创建文件夹
detuyun.mkDir('/test1', true, testCallback);

//删除文件夹
detuyun.rmDir('/test1', testCallback);

//获取文件、目录信息
detuyun.readDir('/', testCallback);*/

var path = './Hydrangeas.jpg';
var file = fs.readFileSync(path);
detuyun.writeFile('/test4.jpg', file, false, testCallback);
//detuyun.readFile('/test4.jpg', './test4.jpg', function(){});