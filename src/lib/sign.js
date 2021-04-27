import _ from 'lodash';

let md5 = require('crypto-js/md5');
const a = 'a', b = 'b', c = 'c', d = 'd', e = 'e', f = 'f', g = 'g';
const h = 'h', i = 'i', j = 'j', k = 'k', l = 'l', m = 'm', n = 'n';
const o = 'o', p = 'p', q = 'q', r = 'r', s = 's', t = 't';
const u = 'u', v = 'v', w = 'w', x = 'x', y = 'y', z = 'z';

const app = ['5967257d40355d66b', 'c1a980a24ddec339c35e0e78fa7d999a'];
const appid = a + p + p + i + d;
const appkey = a + p + p + k + e + y;
const sign = s + i + g + n;
const timestamp = t + i + m + e + s + t + a + m + p;

let objectToKeyValue = (obj, namespace, method, dataType = 'json') => {
    let keyValue = {};
    let formKey;
    let isGet = (method || '').toUpperCase() === 'GET';
    if (obj instanceof File) {
        //文件不处理
    } else if (_.isArray(obj)) {
        //数组处理
        if (obj.length == 0) {
            if (!isGet) {
                //GET不传空数组
                keyValue[namespace] = dataType === 'json' ? '[]' : '';
            }
        } else {
            obj.map((item, index) => {
                if (typeof item === 'object') {
                    Object.assign(keyValue, objectToKeyValue(item, namespace + '[' + index + ']', method, dataType));
                } else {
                    keyValue[namespace + '[' + index + ']'] = item;
                }
            })
        }
    } else {
        //对象处理
        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                formKey = namespace ? namespace + '[' + property + ']' : property;
                if (obj[property] === undefined) {
                    if (isGet) {
                        keyValue[formKey] = '';
                    }
                } else if (obj[property] === null || _.isNaN(obj[property])) {
                    keyValue[formKey] = '';
                } else if (typeof obj[property] === 'object') {
                    Object.assign(keyValue, objectToKeyValue(obj[property], formKey, method));
                } else {
                    keyValue[formKey] = obj[property];
                }
            }
        }
    }
    return keyValue;
};

let time = () => {
    let timestamp = new Date().getTime();
    return parseInt(timestamp / 1000);
};

let keySort = (data) => {
    let entries = Object.entries(data);
    entries.sort((a, b) => {
        return (a[0] + '') > (b[0] + '') ? 1 : -1;
    });
    return entries;
};

let getSignStr = (data) => {
    let signStr = '';
    for (let [key, value] of data) {
        signStr += signStr ? '&' : '';
        signStr += key + '=' + _.trim(value);
    }
    return signStr;
};

let myMd5 = (signStr) => {
    return md5(signStr).toString();
};

export default (attr = {}) => {
    if (!attr[appid] && !attr[appkey]) {
        attr[appid] = app[0];
        attr[appkey] = app[1];
    } else if (!attr[appid] || !attr[appkey]) {
        if (attr.debug) {
            console.log('缺少 ' + appid + ' 或' + appkey);
        }
        return () => {
        };
    }
    return (data, uri, method, dataType) => {
        delete data[sign];
        data[timestamp] = time();
        data[appid] = attr[appid];
        let signData = keySort(objectToKeyValue(data, undefined, method, dataType));
        let signStr = getSignStr(signData);
        data[sign] = myMd5(myMd5(myMd5(signStr) + attr[appkey]) + uri);
        if (attr.debug) {
            let logData = {};
            logData[appid] = appid;
            logData[appkey] = appkey;
            logData[s + i + g + n + 'D' + a + t + a] = signData;
            logData[u + r + i] = uri;
            logData[d + a + t + a] = data;
            console.log(logData);
        }
        return data;
    }
}