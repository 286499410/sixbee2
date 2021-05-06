import React, {Component} from 'react';
import {session} from './lib/storage/index';
import _ from "lodash";

export default class Page extends Component {

    cache = true;
    cacheKey = 'pageCache';

    constructor(props) {
        super(props);
        this.state = this.getCacheState({});
    }

    setState(partialState, callback) {
        super.setState(partialState, () => {
            if (_.isFunction(callback)) {
                callback.bind(this)();
            }
            if (this.cache) {
                let pageCache = session(this.cacheKey) || {};
                let currentUrl = this.getCurrentUrl();
                pageCache[currentUrl] = this.state;
                session(this.cacheKey, pageCache);
            }
        });
    }

    getCurrentUrl() {
        return window.location.pathname + window.location.search;
    }

    static getUniqKey() {
        return Date.now().toString(36) + (Math.random() * 8999 + 1000);
    }

    isChanged(newState) {
        const keys = Object.keys(newState);
        const originalState = keys.reduce((res, key) => {
            res[key] = this.state[key];
            return res;
        }, {});
        return Page.isEqual(newState, originalState) ? false : true;
    }

    static isEmpty(obj) {
        return _.isEmpty(obj);
    }

    static isEqual(obj1, obj2) {
        return _.isEqual(obj1, obj2);
    }

    /**
     * 获取页面缓存
     * @returns {*|{}}
     */
    getCacheState = (defaultState = {}) => {
        let pageCache = session(this.cacheKey) || {};
        let currentUrl = this.getCurrentUrl();
        return Object.assign(defaultState, pageCache[currentUrl] || {});
    };


}