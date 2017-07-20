const fs = require('fs');

function checkOrCreateDir(dir) {
    try {
        fs.accessSync(dir, fs.R_OK | fs.W_OK);
    } catch (e) {
        fs.mkdirSync(dir);
    }
}

function checkOrCreateFile(filePath) {
    try {
        fs.accessSync(filePath, fs.R_OK | fs.W_OK);
    } catch (e) {
        fs.writeFileSync(filePath, '{}');
    }
}

//初始化当天日志的目录和文件
function initToday(logDir) {
    var date = new Date(),
        year = date.getFullYear(),
        mon = (date.getMonth()+1)+'',
        day = date.getDate()+'';
    mon = '0'.repeat(2-mon.length)+mon;
    day = '0'.repeat(2-day.length)+day;

    var todayDir = `${logDir}/${year}${mon}${day}`;
    checkOrCreateDir(todayDir);

    checkOrCreateFile(`${todayDir}/ip.js`);
    checkOrCreateFile(`${todayDir}/browser.js`);
    checkOrCreateFile(`${todayDir}/api.js`);

    return todayDir;
}

module.exports = function (opts) {
    var opts = opts || {};
    var whiteList = opts.whiteList || [];
    var logDir = opts.dir || './statistics';

    checkOrCreateDir(logDir);

    return function *(next) {
        var todayDir = initToday(logDir);
        var ipPath = `${todayDir}/ip.js`;
        var browserPath = `${todayDir}/browser.js`;
        var apiPath = `${todayDir}/api.js`;

        //读取记录
        var ipInfo = JSON.parse(fs.readFileSync(ipPath, 'utf-8'));
        var browserInfo = JSON.parse(fs.readFileSync(browserPath, 'utf-8'));
        var apiInfo = JSON.parse(fs.readFileSync(apiPath, 'utf-8'));

        //当前访问数据
        var ip = this.ip;
        var userAgent = this.header['user-agent'];
        var api = this.url.split('?')[0].slice(1);

        //判断api是否在白名单里
        if (whiteList.indexOf(api) != -1) {
            //更新ip记录
            if (!ipInfo[ip]) {
                ipInfo[ip] = 0;
            }
            ipInfo[ip]++;
            fs.writeFileSync(ipPath, JSON.stringify(ipInfo));

            //更新browser记录
            if (!browserInfo[userAgent]) {
                browserInfo[userAgent] = 0;
            }
            browserInfo[userAgent]++;
            fs.writeFileSync(browserPath, JSON.stringify(browserInfo));

            //更新api记录
            if (!apiInfo[api]) {
                apiInfo[api] = {
                    count: 0,
                    timestamp: []
                }
            }
            apiInfo[api].count++;
            apiInfo[api].timestamp.push(new Date().getTime());
            fs.writeFileSync(apiPath, JSON.stringify(apiInfo));
        }

        yield next;
    }
}