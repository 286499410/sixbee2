import param from 'jquery-param';
import PubSub from 'pubsub-js';
import sign from './sign';

import {objectToFormData} from "./tool";

export default class Request {

    contentType = {
        form: 'application/x-www-form-urlencoded',
        json: 'application/json',
        html: 'text/html',
        css: 'text/css',
        js: 'application/x-javascript'
    };

    config = {
        debug: false,           //调试
        autoSi: false,          //自动加上签名
        cross: true,            //是否跨域
        root: '',               //根地址
        baseUrl: '',            //基地址
        documentRoot: '',       //文件基地址
        dataType: 'form',       //请求数据类型
        responseType: 'json',   //应答数据类型
        headers: {},
    };

    state = {
        fetch: {},
    };

    constructor(config = {}) {
        this.key = "Request_" + new Date().getTime();
        this.setConfig(config);
    }

    getRoot() {
        return this.config.root;
    }

    getDocumentRoot() {
        return this.config.documentRoot;
    }

    setBaseUrl(baseUrl) {
        this.config({baseUrl: baseUrl});
        return this;
    }

    getBaseUrl() {
        return this.config.baseUrl;
    }

    /**
     * 设置是否跨域
     * @param bool
     */
    setCross(bool) {
        this.setConfig({cross: bool});
        return this;
    }

    /**
     * 设置配置数据
     * @param config
     */
    setConfig(config) {
        Object.assign(this.config, config);
        return this;
    }

    getHeader() {
        return this.config.headers;
    }

    /**
     * 设置报头
     * @param header
     */
    setHeader(header) {
        Object.assign(this.config.headers, header);
        return this;
    }

    removeHeaderItem(key) {
        delete this.config.headers[key];
    }

    /**
     * 清除header
     */
    clearHeader() {
        this.config.headers = {};
        return this;
    }

    getRequestUrl(url) {
        return url.indexOf("http") == 0 ? url : this.config.baseUrl + url;
    }

    /**
     * 发起一次post请求
     * @param url
     * @param data
     * @param headers
     * @param dataType
     * @returns {Promise<Response>}
     */
    post({url, data = {}, headers = this.config.headers, dataType = this.config.dataType}) {
        const method = "POST";
        url = this.getRequestUrl(url);
        return this.fetch({url, data, method, headers, dataType});
    }

    /**
     * 发起一次get请求
     * @param url
     * @param data
     * @param headers
     * @param dataType
     * @returns {Promise<Response>}
     */
    get({url, data = {}, headers = this.config.headers, dataType = this.config.dataType}) {
        const method = "GET";
        url = this.getRequestUrl(url);
        const promise = this.fetch({url, data, method, headers, dataType});
        return promise;
    }

    /**
     * 发起一次put请求
     * @param url
     * @param data
     * @param headers
     * @param dataType
     * @returns {Promise<Response>}
     */
    put({url, data = {}, headers = this.config.headers, dataType = this.config.dataType}) {
        const method = "PUT";
        url = this.getRequestUrl(url);
        return this.fetch({url, data, method, headers, dataType});
    }

    /**
     * 发起一次delete请求
     * @param url
     * @param data
     * @param headers
     * @param dataType
     * @returns {Promise<Response>}
     */
    delete({url, data = {}, headers = this.config.headers, dataType = this.config.dataType}) {
        const method = "DELETE";
        url = this.getRequestUrl(url);
        return this.fetch({url, data, method, headers, dataType});
    }

    /**
     * 订阅事件 beforeFetch/complete/success/catch/error
     * @param eventKey
     * @param fn
     */
    subscribe(eventKey, fn) {
        if (['beforeFetch', 'complete', 'success', 'catch', 'error'].indexOf(eventKey) >= 0) {
            PubSub.subscribe(this.key + '-' + eventKey, fn);
        }
    }

    /**
     * 取消订阅
     * @param eventKey
     * @param fn
     */
    unsubscribe = (token = null) => {
        if (token) {
            PubSub.unsubscribe(token);
        }
    };

    /**
     * 触发订阅事件
     * @param eventKey
     * @param data
     */
    publishSync(eventKey, data = {}) {
        PubSub.publishSync(this.key + '-' + eventKey, data);
    }

    /**
     * 触发订阅事件
     * @param eventKey
     * @param data
     */
    publish(eventKey, data = {}) {
        PubSub.publish(this.key + '-' + eventKey, data);
    }

    getMode = () => {
        return this.config.cross ? 'cors' : 'no-cors';
    };

    getBody = (data, type) => {
        let body;
        switch (type) {
            case 'json':
                body = JSON.stringify(data);
                break;
            default:
                body = objectToFormData(data);
        }
        return body;
    };

    fetch = ({url, data, method, headers = this.config.headers, dataType = this.config.dataType}) => {
        this.state.fetch = {
            url: url,
            data: data,
            method: method,
            headers: headers,
            dataType: dataType
        };
        if (method === 'PUT') {
            data._method = 'PUT';
        }
        if (this.config.autoSi) {
            let attr = {};
            let appid = 'a' + 'p' + 'p' + 'i' + 'd';
            let appkey = 'a' + 'p' + 'p' + 'k' + 'e' + 'y';
            if (this.config[appid]) attr[appid] = this.config[appid];
            if (this.config[appkey]) attr[appkey] = this.config[appkey];
            if (this.config.debug) attr.debug = this.config.debug;
            sign(attr)(data, url.replace(this.getBaseUrl(), ''), method, dataType);
        }
        this.publishSync('beforeFetch', data);
        let fetchProps = {
            mode: this.getMode(),
            method: method,
            'Cache-Control': 'no-cache',
            headers: Object.assign({}, headers)
        };
        if (['json'].indexOf(dataType) >= 0) {
            fetchProps.headers['Content-Type'] = this.contentType[dataType];
        }
        switch (method) {
            case 'GET':
                url += '?' + param(data);
                break;
            case 'POST':
                fetchProps.body = this.getBody(data, dataType);
                break;
            case 'PUT':
                fetchProps.body = this.getBody(data, dataType);
                fetchProps.method = 'POST';
                break;
            case 'DELETE':
                if (Object.keys(data).length > 0) {
                    fetchProps.body = this.getBody(data, dataType);
                }
                break;
        }
        let promise = fetch(url, fetchProps);
        promise.then((res) => {
            this.publish('complete', res);
            if (res.ok) {
                try {
                    if (this.config.responseType == 'json') {
                        res.clone().json().then((json) => {
                            this.publish('success', json);
                        });
                    } else {
                        res.clone().text().then((data) => {
                            this.publish('success', data);
                        });
                    }
                } catch (error) {
                    this.publish('catch', {
                        url: url,
                        data: data,
                        method: method,
                        headers: headers,
                        dataType: dataType,
                        error: error,
                        res: res.clone()
                    });
                }
            } else {
                this.publish('error', res.clone());
            }
        }).catch((error) => {
            this.publish('catch', {
                url: url,
                data: data,
                method: method,
                headers: headers,
                dataType: dataType,
                error: error
            });
        });
        return promise;
    };

}

Request.prototype['s' + 'i' + 'g' + 'n'] = sign;
