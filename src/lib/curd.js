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
        single: {
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

    state = {
        headers: {},
        request: undefined
    };

    constructor(key) {
        this.uri = '/' + key.replace('.', '/');
        Object.keys(this.api).map((key) => {
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

    async read(id, params) {
        const request = this.getRequest();
        const url = this.api.read.uri + '/' + id;
        const data = params;
        const header = {...request.getHeader(), ...this.getHeader()};
        try {
            const res = await request[this.api.read.method]({url, data, header});
            const json = await res.json();
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async single(params) {
        const request = this.getRequest();
        const url = this.api.single.uri;
        const data = params;
        const header = {...request.getHeader(), ...this.getHeader()};
        try {
            const res = await request[this.api.single.method]({url, data, header});
            const json = await res.json();
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
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async list(params) {
        const request = this.getRequest();
        const url = this.api.list.uri;
        const data = params;
        const header = {...request.getHeader(), ...this.getHeader()};
        try {
            const res = await request[this.api.list.method]({url, data, header});
            const json = await res.json();
            return json;
        } catch (e) {
            return Promise.reject(e);
        }
    }

}

