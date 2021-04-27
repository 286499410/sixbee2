import React, {Component} from "react";
import PeriodPicker from "./PeriodPicker";
import {call, getControlValue, getDataSource, joinBlankSpace} from "../lib/tool";
import Icon from "./Icon";
import Col from "./Layout/Col";
import Row from "./Layout/Row";

export default class PeriodRange extends Component {

    static defaultProps = {
        dataSource: [],         //[{period_code: "202101"}, {period_code: "202102"}, ...]
        valueKey: "period_code",
        onChange: undefined
    };

    state = {
        dataSource: [],
        years: [],
        periods: {},
        open: false,
        anchorEl: {},
        value: undefined,
        clickNum: 0,
        hoverPeriod: {},
        tempValue: undefined
    };

    constructor(props) {
        super(props);
        this.loadDataSource().then((dataSource) => {
            const valueKey = this.props.valueKey;
            const years = PeriodPicker.getYears({dataSource, valueKey});
            const periods = PeriodPicker.getPeriodsByYears({years, dataSource, valueKey});
            const [start, end] = this.getValue();
            const year = PeriodPicker.getCurrentYear({years, value: end});
            this.state.dataSource = dataSource;
            this.state.years = years;
            this.state.periods = periods;
            this.state.year = year;
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
        return this.state.tempValue || getControlValue(this)
    }

    handleYearChange = (index) => (event) => {
        const year = event.target.value;
        this.setState({year: index == 1 ? year : year + 1});
    };

    handlePeriodClick = (period) => (event) => {
        const clickNum = this.state.clickNum + 1;
        let [start, end] = this.getValue();
        if (clickNum % 2 == 0) {
            start = Math.min(start, end, period.period_code);
            end = Math.max(start, end, period.period_code);
        } else {
            start = end = period.period_code;
        }
        this.setState({tempValue: [start, end], clickNum: clickNum}, () => {
            if(this.state.clickNum % 2 === 0) {
                this.setState({value: [start, end]}, () => {
                    this.state.tempValue = undefined;
                    call(this.props.onChange, {value: this.state.value});
                })
            }
        });
    };

    handlePrevYear = (event) => {
        const year = this.state.year - 1;
        if (this.checkYearExist(year - 1))
            this.setState({year});
    };

    handleNextYear = (event) => {
        const year = this.state.year + 1;
        if (this.checkYearExist(year))
            this.setState({year});
    };

    checkYearExist(year) {
        return this.state.years.indexOf(year) >= 0;
    }

    inPeriodBetween(value) {
        let [start, end] = this.getValue();
        if (start && end) {
            return start <= value && value <= end;
        }
    }

    inHoverPeriodBetween(value) {
        if (this.state.hoverPeriod.period_code && this.state.clickNum % 2 == 1) {
            let [start, end] = this.getValue();
            start = Math.min(start, end, this.state.hoverPeriod.period_code);
            end = Math.max(start, end, this.state.hoverPeriod.period_code);
            if (start && end) {
                return start <= value && value <= end;
            }
        }
    }

    handleMouseEnter = (period) => (event) => {
        this.setState({hoverPeriod: period});
    };

    handleMouseLeave = (period) => (event) => {
        this.setState({hoverPeriod: {}});
    };

    renderPeriod(year, years, index) {
        const periods = this.state.periods[year] || [];
        const [start, end] = this.getValue();
        return <div>
            <div className="flex middle center" style={{marginTop: -24, borderBottom: "1px solid #f1f1f1", paddingBottom: 10}}>
                <select value={year} className="cursor-pointer"
                        style={{border: "none", outline: "none", fontSize: 14}} onChange={this.handleYearChange(index)}>
                    {
                        years.map((year => {
                            return <option key={year} value={year}>{year}年</option>
                        }))
                    }
                </select>
            </div>
            <div className="text-center" style={{marginTop: 24}}>
                <Row cols={4} space={0}>
                    {periods.map((period, index) => {
                        return <Col key={index}
                                    onMouseEnter={this.handleMouseEnter(period)}
                                    onMouseLeave={this.handleMouseLeave(period)}
                                    className="cursor-pointer"
                                    style={{paddingBottom: 12}}
                                    onClick={this.handlePeriodClick(period)}>
                            <div className={joinBlankSpace((this.inHoverPeriodBetween(period.period_code) || this.inPeriodBetween(period.period_code)) && "bg-secondary")}>
                                <div className={joinBlankSpace("space-small hover-bg-secondary", (start == period.period_code || end == period.period_code) && "bg-primary")}>
                                            {period.month.toString().padStart(2, "0") + "期"}
                                </div>
                            </div>

                        </Col>
                    })}
                </Row>
            </div>
        </div>
    }

    render() {
        const singleWidth = 260;
        const isSingle = this.state.years.length <= 1;
        const space = 20;
        const startYears = _.cloneDeep(this.state.years);
        const endYears = _.cloneDeep(this.state.years);
        if(!isSingle) {
            startYears.splice(startYears.length - 1, 1);
            endYears.splice(0, 1);
        }
        return (
            <div className="space bg-white"
                 style={{width: isSingle ? singleWidth : singleWidth * 2 + space, height: 220}}>
                <div className="flex middle between">
                    <div
                        className={joinBlankSpace("space-x-small hover-bg-gray cursor-pointer ripple", !this.checkYearExist(this.state.year - 2) && "disabled")}
                        onClick={this.handlePrevYear}>
                        <Icon name="caret-left"/>
                    </div>
                    <div
                        className={joinBlankSpace("space-x-small hover-bg-gray cursor-pointer ripple", !this.checkYearExist(this.state.year + 1) && "disabled")}
                        onClick={this.handleNextYear}>
                        <Icon name="caret-right"/>
                    </div>
                </div>
                {
                    isSingle ? this.renderPeriod(this.state.year, this.state.years, 1) :
                        <div className="flex">
                            <div style={{width: singleWidth, marginRight: space}}>
                                {this.renderPeriod(this.state.year - 1, startYears, 0)}
                            </div>
                            <div style={{width: singleWidth}}>
                                {this.renderPeriod(this.state.year, endYears, 1)}
                            </div>
                        </div>
                }
            </div>

        );
    }

}