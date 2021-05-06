import _ from 'lodash';
import {request} from "../index";

const GET = 'get';
const POST = 'post';
const PUT = 'put';
const DELETE = 'delete';

export default class Curd {

    uri;
    api = {
        create: {
            method: POST
        },
        read: {
            method: GET
        },
        update: {
            method: PUT
        },
        delete: {
            method: DELETE
        },
        list: {
            method: GET
        }
    };

    cache = {
        read: {},
        list: {},
        all: undefined
    };

    state = {
        headers: {},
        request: undefined,
    };

    constructor(key) {
        this.uri = '/' + key.replace('.', '/');
        Object.keys(this.api).forEach((key) => {
            this.api[key].uri = this.uri;
        });
    }

    getRequest() {
        return this.state.request || request;
    }

    /**
     * 设置配置数据
     * @param config
     */
    setConfig(config) {
        Object.assign(this.state, config);
        return this;
    }

    getHeader() {
        return this.state.headers;
    }

    /**
     * 设置报头
     * @param header
     */
    setHeader(header) {
        Object.assign(this.state.headers, header);
        return this;
    }

    async create({data}) {
        const request = this.getRequest();
        const url = this.api.create.uri;
        const res = await request[this.api.create.method]({url, data});
        if(res.ok) {
            const json = await res.json();
            return json;
        } else {
            return Promise.reject(res);
        }
    }

    async read(id, params, cache = true) {
        const request = this.getRequest();
        const url = this.api.read.uri + '/' + id;
        const data = params;
        const header = {...request.getHeader(), ...this.getHeader()};
        const cacheKey = "read." + id;
        const cacheData = _.get(this.cache, cacheKey);
        if(cache && cacheData) {
            return cacheData;
        }
        try {
            const res = await request[this.api.read.method]({url, data, header});
            const json = await res.json();
            _.set(this.cache, cacheKey, json);
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async update(id, data) {
        const request = this.getRequest();
        const url = this.api.update.uri + '/' + id;
        const header = {...request.getHeader(), ...this.getHeader()};
        try {
            const res = await request[this.api.update.method]({url, data, header});
            const json = await res.json();
            this.clearCache("read." + id);
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async delete(ids) {
        if (_.isArray(ids)) {
            ids = ids.join(',');
        }
        const request = this.getRequest();
        const url = this.api.delete.uri + '/' + ids;
        const header = {...request.getHeader(), ...this.getHeader()};
        try {
            const res = await request[this.api.delete.method]({url, header});
            const json = await res.json();
            ids.split(",").forEach(id => {
                this.clearCache( "read." +  id);
            });
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async list(params, cache = true) {
        const request = this.getRequest();
        const url = this.api.list.uri;
        const data = params;
        const header = {...request.getHeader(), ...this.getHeader()};
        const cacheKey = "list";
        const cacheData = this.getCache(cacheKey) || {};
        if(cache && cacheData[JSON.stringify(data)]) {
            return cacheData[JSON.stringify(data)];
        }
        try {
            const res = await request[this.api.list.method]({url, data, header});
            const json = await res.json();
            cacheData[JSON.stringify(data)] = json;
            this.setCache(cacheKey, cacheData);
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async getAll(params, cache = true) {
        const limit = 50000;
        const request = this.getRequest();
        const url = this.api.list.uri;
        const data = {limit, ...params};
        const header = {...request.getHeader(), ...this.getHeader()};
        const cacheKey = "all";
        const cacheData = this.getCache(cacheKey);
        if(cache && cacheData) {
            return cacheData;
        }
        try {
            const res = await request[this.api.list.method]({url, data, header});
            const json = await res.json();
            this.setCache(cacheKey, json);
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    setCache(key, data) {
        _.set(this.cache, key, data);
    }

    getCache(key) {
        return _.get(this.cache, key);
    }

    clearCache(key) {
        this.setCache(key, undefined);
    }
}

