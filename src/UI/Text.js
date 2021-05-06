import React, {Component} from 'react';
import PropTypes from "prop-types";
import {call, getControlValue, isEmpty, joinBlankSpace, renderLeftIcon, renderRightIcon} from "../lib/tool";

export default class Text extends Component {

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
        align: undefined,               //文本对齐方式：left，right，center
        size: undefined,                //small, large
        disabled: false,                //是否禁用
    };

    state = {
        isCompositionStart: false,
        focus: false,
        state: undefined
    };

    constructor(props) {
        super(props);
        this.input = React.createRef();
    }

    handleChange = (event) => {
        if(this.state.isCompositionStart === false) {
            const value = event.target.value;
            this.setValue(value);
        }
    };

    handleFocus = (event) => {
        this.setState({focus: true}, () => {
            call(this.props.onFocus, {event});
        });
    };

    handleBlur = (event) => {
        this.setState({focus: false}, () => {
            setTimeout(() => {
                if(!this.state.focus) {
                    call(this.props.onBlur, {event});
                }
            }, 50)
        });
    };

    focus() {
        this.input.current.focus();
    }

    getValue() {
        return getControlValue(this);
    }

    setValue(value) {
        this.setState({value}, () => {
            call(this.props.onChange, {value});
        })
    }

    handleClick = (event) => {
        this.focus();
    };

    handleCompositionStart = (event) => {
        this.state.isCompositionStart = true;
    };

    handleCompositionEnd = (event) => {
        this.state.isCompositionStart = false;
        this.handleChange(event);
    };

    render() {
        return (
            <div className={joinBlankSpace(
                "form-control",
                this.props.className,
                this.state.focus && "focus",
                this.props.size
            )} style={this.props.style} onClick={this.handleClick}>
                {renderLeftIcon(this.props)}
                <input
                    className={joinBlankSpace(
                        "clear-style",
                        "grow",
                        this.props.align && ("text-" + this.props.align)
                    )}
                    type={this.props.type}
                    ref={this.input}
                    style={this.props.inputStyle}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    defaultValue={isEmpty(this.props.value) ? this.props.defaultValue : this.props.value}
                    placeholder={this.props.placeholder}
                    onCompositionStart={this.handleCompositionStart}
                    onCompositionEnd={this.handleCompositionEnd}
                    onChange={this.handleChange}/>
                {renderRightIcon(this.props)}
            </div>
        );
    }

}

Text.propTypes = {
    type: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    inputStyle: PropTypes.object,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    size: PropTypes.string
};