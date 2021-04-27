import React, {Component} from 'react';
import PropTypes from "prop-types";
import {call, joinBlankSpace, renderLeftIcon, renderRightIcon} from "../lib/tool";

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
        size: undefined
    };

    state = {
        focus: false,
    };

    constructor(props) {
        super(props);
        this.input = React.createRef();
    }

    handleChange = (event) => {
        const value = event.target.value;
        if(this.props.value === undefined){
            this.forceUpdate();
        }
        call(this.props.onChange, {value, event});
    };

    handleFocus = (event) => {
        this.setState({focus: true});
        call(this.props.onFocus, {event});
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
        if (this.input && this.input.current) {
            this.input.current.focus();
        }
    }

    handleClick = (event) => {
        this.focus();
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
                    className="clear-style grow"
                    type={this.props.type}
                    ref={this.input}
                    style={this.props.inputStyle}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    value={this.props.value}
                    defaultValue={this.props.defaultValue}
                    placeholder={this.props.placeholder}
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