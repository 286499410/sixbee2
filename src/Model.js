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
            sums: {},
            with: ''
        }
    }

    getValidator() {
        return this.Validator;
    }

    state(state = undefined) {
        if (state === undefined)
            return this._state;
        else {
            Object.assign(this._state, state);
            this.listener.publishAll(this._state);
        }
    }

    subscribe(fn) {
        return this.listener.subscribe("stateChange", fn);
    }

    unsubscribe(token) {
        return this.listener.unsubscribe(token);
    }

    /**
     * 新增数据
     * @param data
     * @returns {Promise<any>}
     */
    async create(data) {
        try {
            const res = await this.Curd.create(data);
            return res.createId ? res : Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 更新数据
     * @param id
     * @param data
     * @returns {Promise<any>}
     */
    async update(id, data) {
        try {
            const res = await this.Curd.update(id, data);
            if(res.requestId) {
                return res;
            }
            return Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 删除数据
     * @param params
     * @returns {Promise<any>}
     */
    async delete(ids) {
        try {
            const res = await this.Curd.delete(ids);
            if(res.requestId) {
                return res;
            }
            return Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 读指定ID的单条数据
     * @param id
     * @param params
     * @returns {Promise<any>}
     */
    async read(id, params = {}) {
        let currentState = this.state();
        if (currentState.detailWith && !params.hasOwnProperty('with')) {
            params.with = currentState.detailWith
        }
        try {
            const res = await this.Curd.read(id, params);
            if(_.get(res, "single.id")) {
                return res;
            }
            return Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 读多条数据
     * @param params
     * @returns {Promise<any>}
     */
    async list(params) {
        params = _.merge({
            field: this._state.field,
            page: this._state.page,
            limit: this._state.limit,
            order: this._state.order,
            with: this._state.with,
            cond: _.merge({}, this._state.cond, this.filterToCond())
        }, params);
        if (this._state.sum) {
            params.sum = this._state.sum
        }
        try {
            const res = await this.Curd.list(params);
            if(res.hasOwnProperty("list")) {
                let state = {};
                if (res.page !== undefined) state.page = res.page;
                if (res.rows !== undefined) state.rows = res.rows;
                if (res.pages !== undefined) state.pages = res.pages;
                if (params.limit !== undefined) state.limit = params.limit;
                if (res.sums !== undefined) state.sums = res.sums;
                this.state(state);
                return res;
            }
            return Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 读全部数据
     * @param refresh
     * @returns {Promise<any>}
     */
    async getAll(params) {

        params = _.merge({
            field: this._state.field,
            page: this._state.page,
            limit: this._state.limit,
            order: this._state.order,
            with: this._state.with,
            cond: _.merge({}, this._state.cond, this.filterToCond())
        }, params);
        if (this._state.sum) {
            params.sum = this._state.sum
        }
        try {
            const res = await this.Curd.getAll(params);
            if(res.hasOwnProperty("list")) {
                return res.list;
            }
            return Promise.reject(res);
        } catch (e) {
            return Promise.reject(e);
        }
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

}

export {instances};