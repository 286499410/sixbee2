import React, {Component} from "react";
import _ from "lodash";
import {call, joinBlankSpace} from "../lib/tool";

export default class Tabs extends Component {

    static defaultProps = {
        labels: [],
        activeIndex: undefined,
        defaultActiveIndex: 0
    };

    state = {
        activeIndex: undefined
    };

    getActiveIndex() {
        if (this.props.activeIndex === undefined) {
            return this.state.activeIndex === undefined ? this.props.defaultActiveIndex : this.state.activeIndex;
        }
        return this.props.activeIndex;
    }

    constructor(props) {
        super(props);
        console.log(_.isArray(this.props.children));
    }

    getContent() {
        const activeIndex = this.getActiveIndex();
        if (_.isArray(this.props.children)) {
            return this.props.children[activeIndex];
        } else {
            return this.props.children;
        }
    }

    handleChange = (index) => (event) => {
        this.setState({activeIndex: index}, () => {
            call(this.props.onChange, {activeIndex: index});
        });
    };

    render() {
        const activeIndex = this.getActiveIndex();
        return (
            <div className={this.props.className} style={this.props.style}>
                <div className={joinBlankSpace("tab", this.props.tabClassName)} style={this.props.tabStyle}>
                    {this.props.labels.map((label, index) => {
                        return <div
                            key={index}
                            className={joinBlankSpace("tab-item", this.props.labelClassName, activeIndex == index && "active")}
                            style={this.props.labelStyle}
                            onClick={this.handleChange(index)}>
                            {label}
                        </div>
                    })}
                </div>
                <div className={this.props.contentClassName} style={this.props.contentStyle}>
                    {this.getContent()}
                </div>
            </div>
        );
    }

}