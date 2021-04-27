import React, {forwardRef, useState, useEffect} from 'react';
import {call, joinBlankSpace} from "../lib/tool";
import Icon from "./Icon";

export const iconMap = {
    success: "check-circle-fill",
    info: "info-circle-fill",
    warning: "warning-circle-fill",
    error: "close-circle-fill"
};

export function getPosition(position, startPoint) {
    if (position === "none") {
        return ["auto", "auto"];
    }
    let [left, top] = position.split(" ");
    left = {left: 1, center: 3, right: 5}[left];
    top = {top: 1, middle: 3, bottom: 5}[top];
    const [start, end] = startPoint;
    return [
        start + (window.innerWidth - start) * (left / 6),
        end + (window.innerHeight - end) * (top / 6)
    ]
}

export const getStyle = (props) => {
    const [left, top] = getPosition(props.position, props.startPoint);
    return {
        left: left,
        top: top,
        ...(props.position === "none" && {
            minWidth: "auto",
            width: "100%",
            position: "relative",
            transform: "none",
            zIndex: 0
        }),
        opacity: 0,
        width: props.width,
        ...props.style
    }
};

export default class Alert extends React.Component {

    static defaultProps = {
        open: true,
        duration: 3000, //显示时长, 0则不消失
        position: "none", //left|center|right top|middle|bottom,
        startPoint: [0, 0]
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if(this.props.open === false) {
            this.hide();
        }
    }

    componentDidUpdate() {
        if(this.props.open === true) {
            this.show();
            if(this.props.duration > 0) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => this.close(), this.props.duration);
            }
        }
    }

    getIcon = () => {
        let icon = this.props.icon;
        if (icon === false) {
            return null;
        } else if (!this.props.icon) {
            icon = iconMap[this.props.type];
        }
        return <Icon name={icon} className={joinBlankSpace("alert-icon", this.props.iconClassName)}/>
    };

    close() {
        this.refs.current.style.opacity = 0;
        setTimeout(() => {
            this.hide();
            call(this.props.onRequestClose);
        }, 300);
    }

    hide() {
        this.refs.current.classList.add("hidden");
    }

    show() {
        this.refs.current.classList.remove("hidden");
        setTimeout(() => {
            this.refs.current.style.opacity = 1;
        }, 10);
    }

    render() {
        return <div ref={"current"} className={joinBlankSpace(
            "alert",
            `alert-${this.props.type}`,
            this.props.className,
        )} style={getStyle(this.props)}>
            {this.getIcon()}
            <div>{this.props.message}</div>
            <div className={joinBlankSpace("alert-close")}>
                <Icon name="close" onClick={() => this.close()}/>
            </div>
        </div>
    }

}