import React, {Component} from 'react';
import _ from 'lodash';
import {session} from './lib/storage/index';

class Connect extends Component {

    state = {
        models: [],
        data: {},
        cache: true,
        stopSubscribeRun: false
    };
    unsubscribe = [];
    cacheKey = 'pageCache';

    constructor(props) {
        super(props);
        if (props.mapToProps.title) {
            window.document.title = props.mapToProps.title;
        }
        this.componentRef = React.createRef();
        this.state.cache = _.get(props, "mapToProps.cache", this.state.cache);
        this.state.models = _.isFunction(props.mapToProps.models) ? props.mapToProps.models(props) : (props.mapToProps.models || []);
        this.state.models.map((model) => {
            this.unsubscribe.push(model.subscribe(() => {
                if(this.state.stopSubscribeRun) return;
                this.updateData();
            }));
        });
        const Component = this.props.component;
        const _this = this;
        Component.prototype._setState = function (partialState, callback) {
            if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
                {
                    throw Error( "setState(...): takes an object of state variables to update or a function which returns an object of state variables." );
                }
            }
            this.updater.enqueueSetState(this, partialState, callback, 'setState');
        };
        Component.prototype.setState = function(...arg) {
            if(_this.state.cache) {
                return _this.setCacheState(...arg);
            } else {
                return this._setState(...arg);
            }
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            data: _.cloneDeep(nextProps.mapToProps.data(nextProps, prevState.models) || {})
        }
    }

    componentWillUnmount() {
        this.unsubscribe.forEach((unsubscribe) => {
            unsubscribe();
        });
    }

    updateData() {
        let data = _.cloneDeep(this.props.mapToProps.data(this.props, this.state.models) || {});
        if (!_.isEqual(data, this.state.data)) {
            this.setState({data});
        }
    }

    getCurrentUrl() {
        return window.location.pathname + window.location.search;
    }

    /***
     * 设置页面缓存
     * @param arg
     */
    setCacheState = (partialState, callback) => {
        if (this.componentRef && this.componentRef.current) {
            let ref = this.componentRef.current;
            let originalState = _.get(ref, 'state', {});
            let newState = Object.assign({}, originalState, partialState);
            let pageCache = session(this.cacheKey) || {};
            let currentUrl = this.getCurrentUrl();
            pageCache[currentUrl] = newState;
            session(this.cacheKey, pageCache);
            ref._setState(partialState, callback)
        }
    };

    stopSubscribeRun() {
        this.state.stopSubscribeRun = true;
    }

    startSubscribeRun() {
        this.state.stopSubscribeRun = false;
    }

    async singleSubscribeRun(func) {
        this.stopSubscribeRun();
        await func();
        this.startSubscribeRun();
        this.updateData();
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

    render() {
        const Component = this.props.component;
        return <Component ref={this.componentRef}
                          {...this.props}
                          models={this.state.models}
                          data={this.state.data}
                          setCacheState={this.setCacheState.bind(this)}
                          getCacheState={this.getCacheState.bind(this)}
                          stopSubscribeRun={this.stopSubscribeRun.bind(this)}
                          startSubscribeRun={this.startSubscribeRun.bind(this)}
                          singleSubscribeRun={this.singleSubscribeRun.bind(this)}
                          key={this.getCurrentUrl()}/>
    }
}

export default (mapToProps, Component) => (props) => {
    return <Connect {...props} component={Component} mapToProps={mapToProps}/>
};