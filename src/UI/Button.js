import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {joinBlankSpace} from "../lib/tool";
import Icon from "./Icon";

export default class Button extends Component {

    static defaultProps = {
        style: undefined,           //css
        type: 'button',             //type = button|reset|submit
        onClick: undefined,
        leftIcon: undefined,
        rightIcon : undefined
    };

    static contextTypes = {
        Form: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    handleClick = (event) => {
        if (this.context.Form) {
            if (['reset', 'submit'].indexOf(this.props.type) >= 0) {
                this.context.Form[this.props.type]();
            }
        }
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    };

    getLeftIcon() {
        if(_.isString(this.props.leftIcon)) {
            return <Icon name={this.props.leftIcon} style={{marginRight: 4}} size={16}/>
        }
        return this.props.leftIcon;
    }

    getRightIcon() {
        if(_.isString(this.props.getRightIcon)) {
            return <Icon name={this.props.getRightIcon} style={{marginRight: 4}} size={16}/>
        }
        return this.props.getRightIcon;
    }

    render() {
        return (
            <button className={joinBlankSpace("btn ripple", this.props.className)} style={this.props.style} onClick={this.handleClick}>
                {
                    this.props.leftIcon || this.props.rightIcon ? <div className="flex middle">
                        {this.getLeftIcon()}
                        {this.props.children}
                        {this.getRightIcon()}
                    </div> : this.props.children
                }
            </button>
        );
    }

}

Button.propTypes = {
    style: PropTypes.object,
    type: PropTypes.string,
    onClick: PropTypes.func,
};