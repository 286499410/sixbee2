import _ from 'lodash';
import Curd from './lib/curd';
import Listener from "./lib/listener";
import Validator from "./lib/validator";

let instances = {};

export default class Model {

    key;
    _validate = undefined;      //校验数据
    _state = {};                //数据

    constructor() {
    }

    static getInstance() {
        const name = this.prototype.constructor.name;
        if (!instances[name]) {
            instances[name] = new this();
        }
        return instances[name];
    }

    _initialize(key) {
        this.key = key;
        [this.group, this.name] = key.split('.');
        this._state = this.getInitialState();
        this.Curd = new Curd(key);
        this.listener = new Listener();
        if (this._validate) {
            this.Validator = new Validator(this._validate);
        }
    }

    getInitialState() {
        return {
            field: '*',
            page: 1,
            pages: 0,
            rows: 0,
            limit: 20,
            order: 'id desc',
            cond: {},
            filter: {},
            data: {},
            list: [],
            sums: {},
            all: [],
            with: ''
        }
    }

    getValidator() {
        return this.Validator;
    }

    state(state = undefined, publish = true) {
        if (state === undefined)
            return this._state;
        else {
            Object.assign(this._state, state);
            if (publish) {
                this.publish(this._state);
            }
        }
    }

    /**
     * 订阅事件
     * @param fn
     * @returns {Function}
     */
    subscribe(fn) {
        let token = this.listener.subscribe("Model_" + this.key, fn);
        return () => {
            this.unsubscribe(token);
        };
    }

    /**
     * 取消订阅
     * @param token
     */
    unsubscribe(token = null) {
        if (token) {
            this.listener.unsubscribe(token);
        } else {
            this.listener.unsubscribeAll();
        }
    }

    /**
     * 触发订阅事件
     * @param data
     */
    publish(data = {}) {
        console.log("publish");
        this.listener.publishAll(data);
    }

    /**
     * 新增数据
     * @param data
     * @returns {Promise<any>}
     */
    create(data) {
        return new Promise((resolve, reject) => {
            this.Curd.create(data).then((res) => {
                if (res.requestId && (res.createId || res.id)) {
                    this.clearAll();
                    resolve(res);
                } else if (res.errCode) {
                    reject(res);
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 更新数据
     * @param id
     * @param data
     * @returns {Promise<any>}
     */
    update(id, data) {
        return new Promise((resolve, reject) => {
            this.Curd.update(id, data).then((res) => {
                if (res.errCode) {
                    reject(res);
                } else if (res.requestId) {
                    if (this._state.data[id]) {
                        delete this._state.data[id];
                    }
                    resolve(res);
                    this.clearAll();
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 删除数据
     * @param params
     * @returns {Promise<any>}
     */
    delete(params) {
        return new Promise((resolve, reject) => {
            this.Curd.delete(params).then((res) => {
                if (res.errCode) {
                    reject(res);
                } else if (res.requestId) {
                    resolve(res);
                    this.clearAll();
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 读指定ID的单条数据
     * @param id
     * @param params
     * @returns {Promise<any>}
     */
    read(id, params = {}) {
        let currentState = this.state();
        if (currentState.detailWith && !params.hasOwnProperty('with')) {
            params.with = currentState.detailWith
        }
        return new Promise((resolve, reject) => {
            this.Curd.read(id, params).then((res) => {
                if (res.single && res.single.id) {
                    this._state.data[res.single.id] = res.single;
                    this.publish(this._state);
                    resolve(res);
                } else if (res.errCode) {
                    reject(res);
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 读单条数据
     * @param params
     * @returns {Promise<any>}
     */
    single(params) {
        return new Promise((resolve, reject) => {
            this.Curd.single(params).then((res) => {
                if (res.id) {
                    this._state.data[res.id] = res;
                    this.publish(this._state);
                    resolve(res);
                } else if (res.errCode) {
                    reject(res);
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 读多条数据
     * @param params
     * @returns {Promise<any>}
     */
    list(params = {}, autoUpdateState = true, hasFilter = true) {
        params = _.merge({
            field: this._state.field,
            page: this._state.page,
            limit: this._state.limit,
            order: this._state.order,
            with: this._state.with,
            cond: _.merge({}, this._state.cond, hasFilter ? this.filterToCond() : {})
        }, params);
        if (this._state.sum) {
            params.sum = this._state.sum
        }
        return new Promise((resolve, reject) => {
            this.Curd.list(params).then((res) => {
                if (res.list) {
                    let state = {list: res.list};
                    if (res.page !== undefined) state.page = res.page;
                    if (res.rows !== undefined) state.rows = res.rows;
                    if (res.pages !== undefined) state.pages = res.pages;
                    if (params.limit !== undefined) state.limit = params.limit;
                    if (res.sums !== undefined) state.sums = res.sums;
                    if (autoUpdateState)
                        this.state(state);
                    resolve(res);
                } else if (res.errCode) {
                    reject(res);
                }
            }, (res) => {
                reject(res);
            });
        });
    }

    /**
     * 读全部数据
     * @param refresh
     * @returns {Promise<any>}
     */
    getAll(refresh = false, params = {}) {
        let list = this._state.all;
        if (list.length > 0 && !refresh) {
            //有数据，不强制刷新
            return new Promise((resolve, reject) => {
                resolve(list)
            });
        } else {
            return new Promise((resolve, reject) => {
                if (!this._allPromise || refresh) {
                    this._allPromise = this.list({limit: 50000, ...params}, false, false);
                }
                this._allPromise.then((res) => {
                    if (res.list) {
                        this.state({all: res.list});
                        resolve(res.list);
                    } else if (res.errCode) {
                        reject(res);
                    }
                });
            });
        }
    }

    clearAll() {
        this._state.all = [];
        this._allPromise = undefined;
    }

    getLabels() {
        let labels = {};
        for (let key in this._fields) {
            labels[key] = _.get(this._fields[key], 'label') || key;
        }
        return labels;
    }

    /**
     * 获取/设置单个字段
     * @param key
     * @returns {*|{}}
     */
    field(key, value = undefined) {
        if (value === undefined)
            return this._fields[key];
        else {
            this._fields[key] = value;
            return this;
        }
    }

    /**
     * 获取/设置多个字段
     * @param fields
     * @returns {Model}
     */
    fields(fields = undefined) {
        if (fields === undefined)
            return this._fields;
        else {
            Object.assign(this._fields, fields);
            return this;
        }
    }

    getField(key) {
        return {
            key: key,
            ...this._fields[key]
        };
    }

    getFields(columns) {
        let fields = [];
        if (_.isArray(columns)) {
            columns.map((column) => {
                if (_.isString(column) && this._fields[column]) {
                    column = {
                        key: column,
                        ...this._fields[column]
                    };
                }
                if (_.isObject(column)) {
                    if (column.fields) {
                        fields.push({
                            ...column,
                            fields: (column.model || this).getFields(column.fields)
                        });
                    } else if (column.key) {
                        let field = (column.model || this)._fields[column.key] || {};
                        fields.push({
                            dataKey: column.key,
                            ...field,
                            ...column
                        });
                    }
                } else {
                    console.log(column, 'not found')
                }
            });
        }
        return fields;
    }

    /**
     * 过滤数据转查询条件
     * @param filterData
     */
    filterToCond(filterData = this._state.filter) {
        let cond = {};
        for (let [key, value] of Object.entries(filterData)) {
            let field = this._fields[key] || {};
            if (field.filterCondKey === false) {
                continue;
            }
            let filterKey = field.filterKey || key;
            let filterCondKey = field.filterCondKey;
            if (value !== undefined && value !== '' && value !== null) {
                _.set(cond, filterKey, {});
                if (filterCondKey == 'between') {
                    let [start, end] = value.toString().split(',');
                    if (start === '' && end !== '') {
                        _.set(cond, filterKey + '.<=', end);
                    } else if (start !== '' && end === '') {
                        _.set(cond, filterKey + '.>=', start);
                    } else {
                        _.set(cond, filterKey + '.' + filterCondKey, value);
                    }
                } else {
                    if (filterCondKey) {
                        _.set(cond, filterKey + '.' + filterCondKey, value);
                    } else {
                        _.set(cond, filterKey, value);
                    }
                }
            }
        }
        return cond;
    }

    /**
     * 获取指定ID的数据
     * @param key
     * @returns {*}
     */
    getData(id) {
        return this._state.data[id];
    }
}

export {instances};