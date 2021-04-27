import React, {Component} from 'react';
import {joinBlankSpace, replaceText} from "../lib/tool";
import Row from "./Layout/Row";
import Col from "./Layout/Col";

export default class Radio extends Component {

    static defaultProps = {
        value: undefined,
        onChange: undefined,
        dataSource: [],
        dataSourceConfig: {text: 'text', value: 'value'},
        cols: 1
    };

    constructor(props) {
        super(props);
    }

    getValue(data) {
        return _.get(data, this.props.dataSourceConfig.value);
    }

    handleClick = (data) => (event) => {
        const value = this.getValue(data);
        if (this.props.onChange) {
            this.props.onChange({value});
        }
    };

    isChecked(data) {
        let value = this.getValue(data);
        return (this.props.value || []).indexOf(value) >= 0;
    }

    render() {
        console.log("render Radio");
        return <div className={joinBlankSpace("radio-group flex middle", this.props.className)}>
            <Row cols={this.props.cols}>
                {this.props.dataSource.map(data => {
                    let value = this.getValue(data);
                    return <Col key={value}>
                        <label className="flex middle cursor-pointer radio">
                            <input type="radio"
                                   checked={this.isChecked(data)} onChange={this.handleClick(data)}/>
                            <div>{replaceText(data, this.props.dataSourceConfig.text)}</div>
                        </label>
                    </Col>
                })}
            </Row>
        </div>
    }

}