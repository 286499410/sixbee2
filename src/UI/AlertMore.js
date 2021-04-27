import React from 'react';
import {call, joinBlankSpace} from "../lib/tool";
import Icon from "./Icon";
import Button from "./Button";
import {getStyle, iconMap} from "./Alert";


export default class AlertMore extends React.Component {

    static defaultProps = {
        open: true,
        duration: 3000, //显示时长, 0则不消失
        position: "none", //left|center|right top|middle|bottom,
        width: 400,
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

    getIcon() {
        let icon = this.props.icon;
        if(icon === false) {
            return null;
        } else if(!this.props.icon) {
            icon = iconMap[this.props.type];
        }
        return <Icon name={icon} size={36} className={joinBlankSpace("alert-more-icon", `alert-more-${this.props.type}`, this.props.iconClassName)}/>
    }

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
        return <div ref="current" className={joinBlankSpace(
            "alert-more",
            this.props.className,
        )} style={getStyle(this.props)}>
            <div className="alert-more-wrapper">
                {this.getIcon()}
                <div>
                    <div className="alert-more-title">{this.props.title}</div>
                    <div className="alert-more-content">{this.props.content}</div>
                </div>
            </div>
            <div className="alert-more-close">
                <Icon name="close" onClick={() => this.close()}/>
            </div>
            {
                (this.props.onCancel || this.props.onConfirm) && <div className="alert-more-action">
                    {this.props.onConfirm && <Button className="btn-primary" style={{marginRight: 12}} onClick={() => {
                        call(this.props.onConfirm);
                    }}>确定</Button>}
                    {this.props.onCancel && <Button onClick={() => {
                        call(this.props.onCancel);
                    }}>取消</Button>}
                </div>
            }
        </div>
    }

}