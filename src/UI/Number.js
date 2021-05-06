
import React, {Component} from 'react';
import Text from "./Text";
import {call, getControlValue, isEmpty, parseMoney, toFixed} from "../lib/tool";

export default class Number extends Component {

    static defaultProps = {

        type: 'text',
        className: undefined,
        style: undefined,
        inputStyle: undefined,
        onChange: undefined,
        onBlur: undefined,
        onFocus: undefined,
        value: undefined,
        defaultValue: undefined,
        leftIcon: undefined,
        rightIcon: undefined,
        placeholder: undefined,
        size: undefined,
        disabled: false,                //是否禁用
        align: undefined,               //文本对齐方式：left，right，center
        float: undefined,               //保留几位小数, undefined则不限制
        deficitStyle: {color: 'red'},   //赤字样式
        showZero: true,                 //值为零时是否显示
    };

    state = {
        value: undefined,
        focus: false
    };

    constructor(props) {
        super(props);
        this.text = React.createRef();
    }

    /**
     * 设置值
     * @param value
     */
    setValue = (value) => {
        value = _.trim(value);
        if (/^-?\d{0,3}((,\d{3})*)((,\d{0,3})?)((\.\d{0,16})?)$/.test(value) || /^-?\d*((\.\d{0,16})?)$/.test(value)) {
            value = value.toString().replace(/,/g, '');
            if(!isEmpty(value) && !this.state.focus && this.props.float !== undefined) {
                value = toFixed(value, this.props.float);
            }
            this.setState({value}, () => {
                call(this.props.onChange, {value});
            });
        }
    };

    /**
     * 获取值
     * @returns {*}
     */
    getValue() {
        return getControlValue(this);
    };

    /**
     * 数字输入触发
     * @param event
     */
    handleChange = ({value}) => {
        this.setValue(value);
    };

    handleFocus = ({event}) => {
        this.setState({focus: true}, () => {
            call(this.props.onFocus, {event});
        });
    };

    handleBlur = ({event}) => {

        this.setState({focus: false}, () => {
            if(!isEmpty(this.state.value) && this.props.float !== undefined) {
                const value = toFixed(this.state.value, this.props.float);
                if(this.state.value !== value) {
                    this.setValue(value);
                }
            }
            call(this.props.onBlur, {event});
        });
    };

    focus() {
        this.text.current.focus();
    }

    getFormatValue() {
        const value = this.getValue();
        return isEmpty(value) ? "" : this.state.focus ? value : parseMoney(value, this.props.float);
    }

    render() {
        return <Text
            {...this.props}
            type="text"
            value={this.getFormatValue()}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
        />
    }

}
