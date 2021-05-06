import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import Select from './Select';
import {call, joinBlankSpace} from "../lib/tool";
import Auto from "./Auto";
import DatePicker from "./DatePicker";
import DateRange from "./DateRange";
import Checkbox from './Checkbox';
import Radio from "./Radio";
import Number from "./Number";

export default class Control extends Component {

    static defaultProps = {
        type: 'text',                       //控件类型
        name: undefined,
        onChange: undefined,
        observeChangeKeys: undefined,       //观察变化的键值
        onObserveChange: undefined,         //观察事件
        clearStyle: false,                  //清除样式
    };

    static contextTypes = {
        Form: PropTypes.object,
    };

    controlComponent = {
        auto: Auto,
        checkbox: Checkbox,
        date: DatePicker,
        dateRange: DateRange,
        radio: Radio,
        select: Select,
        number: Number
    };

    state = {
        focus: false
    };

    constructor(props) {
        super(props);
        this.control = React.createRef();
    }

    componentDidMount() {
        if (this.props.onObserveChange && this.context.Form) {
            this.unsubscribe = this.context.Form.subscribe('change', (eventName, data) => {
                if (data.key !== this.props.name &&
                    (this.props.observeChangeKeys === undefined ||
                        this.props.observeChangeKeys.indexOf(data.key) >= 0)) {
                    this.props.onObserveChange(data, this, this.context.Form);
                }
            });
        }
        if (this.context.Form) {
            this.context.Form.setControl(this);
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    /**
     * 获取值
     * @returns {*}
     */
    getValue() {
        if (this.props.hasOwnProperty('value')) {
            return this.props.value;
        }
        if (this.context.Form) {
            if (this.props.type === 'dateRange' && this.props.startKey && this.props.endKey) {
                return [this.context.Form.getValue(this.props.startKey), this.context.Form.getValue(this.props.endKey)];
            }
            return this.context.Form.getValue(this.props.name);
        }
    }

    /**
     * 设置值
     * @param value
     */
    setValue(value) {
        this.handleChange({value});
    }

    /**
     * 错误文本
     * @returns {*}
     */
    getErrorText() {
        if (this.props.hasOwnProperty('errorText')) {
            return this.props.errorText;
        }
        if (this.context.Form) {
            return this.context.Form.getErrorText(this.props.name);
        }
    }

    handleChange = ({value}) => {
        let changeFormData = true;
        const control = this, key = this.props.name, form = this.context.Form;
        call(this.props.onChange, {value, control, form});
        if (this.context.Form && changeFormData !== false) {
            if (this.props.type === 'dateRange' && this.props.startKey && this.props.endKey) {
                value = {[this.props.startKey]: value[0], [this.props.endKey]: value[1]};
                this.context.Form.handleChange({value, control});
            } else {
                this.context.Form.handleChange({key, value, control});
            }
        }
        this.forceUpdate();
    };

    getLabelStyle() {
        let labelStyle = {};
        if (this.context.Form) {
            const {props} = this.context.Form;
            labelStyle = {
                width: props.labelWidth,
                minWidth: props.labelWidth,
                ...props.labelStyle
            }
        }
        return {
            ...labelStyle,
            ...this.props.labelStyle
        }
    }

    getLabelClassName() {
        return joinBlankSpace(this.props.labelClassName, this.context.Form && this.context.Form.props.labelClassName);
    }

    getControlProps() {
        const control = this, form = this.context.Form;
        return _.isFunction(this.props.controlProps) ? this.props.controlProps({
            control,
            form
        }) : this.props.controlProps || {};
    }

    getComponent() {
        if (this.props.type === 'component') {
            return this.props.component;
        }
        return this.controlComponent[this.props.type] || Text;
    }

    focus = () => {
        if (this.control && this.control.current) {
            if (this.control.current.focus) {
                this.control.current.focus();
            }
        }
    };

    render() {
        let value = this.getValue();
        let Com = this.getComponent();
        let controlProps = this.getControlProps();
        let errorText = this.getErrorText();
        return (
            <div className={joinBlankSpace(
                "form-group",
                this.props.groupClassName,
            )} style={this.props.groupStyle}>
                {this.props.label && <label style={this.getLabelStyle()} className={this.getLabelClassName()}>{this.props.label}</label>}
                <div className="full-width">
                    <Com
                        ref={this.control}
                        value={value}
                        {...this.props}
                        {...controlProps}
                        className={joinBlankSpace(
                            controlProps.className || this.props.className,
                            errorText && 'control-error'
                        )}
                        onChange={this.handleChange}
                    />
                    <div className="control-error-text">{this.getErrorText()}</div>
                </div>
            </div>
        );
    }

}

Control.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    observeChangeKeys: PropTypes.array,
    onObserveChange: PropTypes.func
};