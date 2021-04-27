import React, {Component} from "react";
import {call, getControlValue, getDataSource} from "../lib/tool";
import MonthPicker from "./MonthPicker";

export default class PeriodPicker extends Component {

    static defaultProps = {
        isRange: false,
        dataSource: [],         //[{period_code: "202101"}, {period_code: "202102"}, ...]
        valueKey: "period_code",
        onChange: undefined
    };

    state = {
        dataSource: [],
        value: undefined,
    };

    constructor(props) {
        super(props);
        this.loadDataSource().then((dataSource) => {
            this.state.dataSource = dataSource;
            if (this.updater.isMounted(this)) {
                this.forceUpdate();
            }
        });
    }

    /**
     * 加载数据源
     * @returns {Promise<void>}
     */
    async loadDataSource() {
        const dataSource = await getDataSource(this.props);
        return dataSource;
    }

    getValue() {
        return getControlValue(this);
    }

    render() {
        const value = this.getValue();
        if(this.state.dataSource.length == 0) {
            return null;
        }
        return <MonthPicker
            isRange={this.props.isRange}
            dataSource={this.state.dataSource.map(item => item[this.props.valueKey])}
            unitLabel="期"
            value={value}
            onChange={({value}) => {
                call(this.props.onChange, {value});
            }}
        />;
    }

}