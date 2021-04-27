import React, {Component} from 'react';
import {call, getControlValue, joinBlankSpace, replaceText} from "../lib/tool";
import Row from "./Layout/Row";
import Col from "./Layout/Col";
import CheckboxIcon from "./CheckboxIcon";

export default class Checkbox extends Component {

    static defaultProps = {
        value: undefined,
        onChange: undefined,
        dataSource: [],
        dataSourceConfig: {text: 'text', value: 'value'},
        cols: 1
    };

    state = {
        value: []
    };

    constructor(props) {
        super(props);
    }

    getValue() {
        const value = getControlValue(this) || [];
        return this.props.dataSource.length === 0 ? (value.length > 0 ? 1 : 0) : value;
    }

    getRowValue(data) {
        return _.get(data, this.props.dataSourceConfig.value);
    }

    isChecked(data) {
        let rowValue = this.getRowValue(data);
        let value = getControlValue(this) || [];
        if(!_.isArray(value)) value = [value];
        return value.indexOf(rowValue) >= 0 ? 1 : 0;
    }

    handleCheck = (data) => ({event, isInputChecked}) => {
        let values = getControlValue(this) || [];
        if(!_.isArray(values)) values = [values];
        let currentValue = this.getRowValue(data);
        let index = values.indexOf(currentValue);
        if (isInputChecked) {
            index === -1 && values.push(currentValue);
        } else {
            index > -1 && values.splice(index, 1);
        }
        this.setState({value: values}, () => {
            call(this.props.onChange, {value: this.props.dataSource.length === 0 ? (values.length > 0 ? 1 : 0) : values});
        });
    };

    getDataSource() {
        if(this.props.dataSource.length > 0) {
            return this.props.dataSource;
        } else {
            return [
                {text: this.props.label, value: 1}
            ]
        }
    }

    render() {
        const dataSource = this.getDataSource();
        return <div className={joinBlankSpace("checkbox-group", this.props.className)} style={{lineHeight: 1}}>
            <Row cols={this.props.cols} space={8}>
                {dataSource.map((data, index) => {
                    const isCheck = this.isChecked(data);
                    return <Col key={index}>
                        <label className="flex middle cursor-pointer" onClick={(event) => {
                            this.handleCheck(data)({event, isInputChecked: 1 - isCheck})
                        }}>
                            <CheckboxIcon className="control-border-color" checked={this.isChecked(data)} style={{marginRight: 4}}/>
                            <div>{replaceText(data, this.props.dataSourceConfig.text)}</div>
                        </label>
                    </Col>
                })}
            </Row>
        </div>
    }

}