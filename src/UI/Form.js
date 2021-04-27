import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {isEmpty, joinBlankSpace} from "../lib/tool";
import Validator from "../lib/validator";

/**
 * 表单组件
 */
export default class Form extends Component {

    static childContextTypes = {
        Form: PropTypes.object,
    };

    static defaultProps = {
        onSubmit: undefined,    //提交事件
        onReset: undefined,     //重置事件
        initialData: {},        //初始数据
        validator: undefined,   //校验器
        style: undefined,
        className: undefined
    };

    controls = {};              //控件

    state = {
        changedData: {},            //表单修改后的数据
        errorText: {},              //错误信息
    };

    getChildContext() {
        return {
            Form: this,
        }
    }

    constructor(props) {
        super(props);
    }

    componentWillUnmount() {

    }

    setControl(control) {
        this.controls[control.props.name] = control;
    }

    getControl(name) {
        return this.controls[name];
    }

    /**
     * 控件输入触发事件
     * @param key
     * @param value
     * @param control
     */
    handleChange = ({key, value, control}) => {
        if (isEmpty(key)) {
            if (_.isObject(value)) {
                this.state.changedData = {
                    ...this.state.changedData,
                    ...value
                }
            }
        } else {
            _.set(this.state.changedData, key, value);
        }
        const form = this, data = this.getAllData();
        this.props.onChange && this.props.onChange({form, data});
    };

    /**
     * 取初始值
     * @param key
     * @returns {T | ActiveX.IXMLDOMNode | Promise<any> | V | string | IDBRequest | any | FormDataEntryValue | MediaKeyStatus}
     */
    getInitialValue = (key) => {
        return _.get(this.props.initialData, key);
    };

    /**
     * 取值
     * @param key
     * @returns {T | ActiveX.IXMLDOMNode | Promise<any> | V | string | IDBRequest | any | FormDataEntryValue | MediaKeyStatus}
     */
    getValue = (key) => {
        return _.get(this.state.changedData, key, this.getInitialValue(key));
    };

    /**
     * 获取错误文本
     * @param name
     */
    getErrorText = (name) => {
        return _.get(this.state.errorText, name);
    };

    /**
     * 获取修改的数据
     * @returns {Form.state.data|{}}
     */
    getChangedData() {
        const changedData = {...this.state.changedData};
        return changedData;
    }

    /**
     * 获取所有数据
     * @returns {*}
     */
    getAllData = () => {
        const allData = _.mergeWith({}, this.props.initialData, this.state.changedData, (obj, src) => {
            if (_.isArray(obj)) {
                return src;
            }
        });
        return allData;
    };

    /**
     * 校验数据
     * @param data
     * @returns {*}
     */
    check = (data) => {
        if (this.props.validator instanceof Validator) {
            if (this.props.validator.check(data)) {
                let errorText = this.props.validator.getError();
                if (!_.isEqual(this.state.errorText, errorText)) {
                    this.setState({errorText});
                }
                return true;
            } else {
                this.setState({errorText: this.props.validator.getError()});
                return false;
            }
        }
        return true;
    };

    /**
     * 重置
     */
    reset = () => {
        this.setState({changedData: {}});
        const form = this;
        if (this.props.onReset) {
            this.props.onReset({form});
        }
    };

    /**
     * 提交
     */
    submit = () => {
        const data = this.getAllData(), form = this;
        if (this.check(data)) {
            if (this.props.onSubmit) {
                this.props.onSubmit({data, form});
            }
        }
    };

    render() {
        return <div className={joinBlankSpace("form", this.props.className, this.props.inline && 'form-inline')}
                    style={this.props.style}>
            {this.props.children}
        </div>
    }

}

Form.propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    initialData: PropTypes.object,
    onSubmit: PropTypes.func,
    onReset: PropTypes.func,
};