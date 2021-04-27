import React, {Component} from "react";
import Icon from "./Icon";
import {call, getControlValue, joinBlankSpace} from "../lib/tool";
import Col from "./Layout/Col";
import Row from "./Layout/Row";

/**
 * 月份选择器
 */
export default class MonthPicker extends Component {

    static defaultProps = {
        dataSource: undefined,
        onChange: undefined,
        unitLabel: "月",
        startYear: 1990,
        endYear: undefined,
        isRange: false
    };

    state = {
        dataSource: [],
        years: [],
        months: {},
        open: false,
        anchorEl: {},
        value: undefined,
        tempValue: undefined,
        clickNum: 0,
        hoverItem: {}
    };

    constructor(props) {
        super(props);
        const dataSource = this.props.dataSource || [];
        const years = this.getYears({dataSource});
        const months = this.getMonthsByYears({years, dataSource});
        const year = this.getCurrentYear({years});
        this.state.dataSource = dataSource;
        this.state.years = years;
        this.state.months = months;
        this.state.year = year;
    }

    static parsePeriodCode(periodCode) {
        const year = periodCode.toString().substr(0, 4);
        const month = periodCode.toString().substr(4, 2);
        return {
            year: parseInt(year),
            month: parseInt(month),
        }
    }

    getYears({dataSource}) {
        if(dataSource.length === 0) {
            const startYear = this.props.startYear;
            const endYear = this.props.endYear || new Date().getFullYear();
            let years = [];
            for(let year = endYear; year >= startYear; year--) {
                years.push(year);
            }
            return years;
        }
        let hash = {};
        dataSource.forEach(item => {
            const {year} = MonthPicker.parsePeriodCode(item);
            hash[year] = true;
        });
        return Object.keys(hash).map(year => parseInt(year)).sort((a, b) => b - a);
    }

    getMonthsByYears({years, dataSource}) {
        if(dataSource.length == 0) {
            return {};
        }
        return years.reduce((res, year) => {
            res[year] = dataSource.filter(item => item.toString().indexOf(year) == 0).map(item => parseInt(item.substr(4, 2)));
            return res;
        }, {});
    }

    getCurrentYear({years}) {
        let value = this.getValue();
        if(this.props.isRange) {
            const [start, end] = value;
            value = end;
        }
        if(value) {
            const {year} = MonthPicker.parsePeriodCode(value);
            return year;
        } else {
            return years[0];
        }
    }

    inBetween(value) {
        let [start, end] = this.props.isRange ? this.getValue() : [this.getValue(), this.getValue()];
        if (start && end) {
            return start <= value && value <= end;
        }
    }

    inHoverBetween(value) {
        if (this.state.hoverItem && this.state.clickNum % 2 == 1) {
            let [start, end] = this.getValue();
            start = Math.min(start, end, this.state.hoverItem);
            end = Math.max(start, end, this.state.hoverItem);
            if (start && end) {
                return start <= value && value <= end;
            }
        }
    }

    getValue() {
        return this.props.isRange ? this.state.tempValue || getControlValue(this) || [] : getControlValue(this);
    }

    handleYearChange = (event) => {
        this.setState({year: parseInt(event.target.value)});
    };

    handleMonthClick = (value) => (event) => {
        if(this.props.isRange) {
            const clickNum = this.state.clickNum + 1;
            let [start, end] = this.getValue();
            if (clickNum % 2 == 0) {
                start = Math.min(start, end, value).toString();
                end = Math.max(start, end, value).toString();
            } else {
                start = end = value;
            }
            this.setState({tempValue: [start, end], clickNum: clickNum}, () => {
                if(this.state.clickNum % 2 === 0) {
                    this.setState({value: [start, end]}, () => {
                        this.state.tempValue = undefined;
                        call(this.props.onChange, {value: this.state.value});
                    })
                }
            });
        } else {
            this.setState({value}, () => {
                call(this.props.onChange, {value: this.state.value});
            });
        }
    };

    handlePrevYear = (event) => {
        const year = this.state.year - 1;
        const years = _.cloneDeep(this.state.years);
        if(this.props.isRange) {
            years.splice(years.length - 1, 1);
        }
        if (this.checkYearExist(year, years))
            this.setState({year});
    };

    handleNextYear = (event) => {
        const year = this.state.year + 1;
        if (this.checkYearExist(year))
            this.setState({year});
    };

    checkYearExist(year, years = this.state.years) {
        return years.indexOf(year) >= 0;
    }

    getMonths(year) {
        return this.state.months[year] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }

    handleMouseEnter = (period) => (event) => {
        this.setState({hoverItem: period});
    };

    handleMouseLeave = (period) => (event) => {
        this.setState({hoverItem: undefined});
    };

    render() {
        const value = this.getValue();
        const startYears = _.cloneDeep(this.state.years);
        const endYears = _.cloneDeep(this.state.years);
        if(this.props.isRange) {
            endYears.splice(startYears.length - 1, 1);
            startYears.splice(0, 1);
        }
        const width = 260;
        return (
            <div className="space bg-white" style={{height: 220}}>
                {
                    this.props.isRange ? <div className="flex">
                        <Content
                            style={{width, marginRight: 8}}
                            year={this.state.year - 1}
                            years={startYears}
                            hasPreIcon={true}
                            value={value}
                            context={this}
                            unitLabel={this.props.unitLabel}
                        />
                        <Content
                            style={{width}}
                            year={this.state.year}
                            years={endYears}
                            hasNextIcon={true}
                            value={value}
                            context={this}
                            unitLabel={this.props.unitLabel}
                        />
                    </div> : <Content
                        style={{width}}
                        year={this.state.year}
                        years={this.state.years}
                        hasPreIcon={true}
                        hasNextIcon={true}
                        value={[value]}
                        context={this}
                        unitLabel={this.props.unitLabel}
                    />
                }
            </div>

        );
    }

}

const Content = (props) => {
    const {style, hasPreIcon, hasNextIcon, year, years, value, context, unitLabel} = props;
    const months = context.getMonths(year);
    return <div style={style}>
        <div className="flex middle between">
            <div>
                {hasPreIcon && <div className={joinBlankSpace("space-x-small hover-bg-gray cursor-pointer ripple", !context.checkYearExist(year - 1) && "disabled")}
                                          onClick={context.handlePrevYear}>
                    <Icon name="caret-left"/>
                </div>}
            </div>
            <div>
                {hasNextIcon && <div className={joinBlankSpace("space-x-small hover-bg-gray cursor-pointer ripple", !context.checkYearExist(year + 1) && "disabled")}
                                           onClick={context.handleNextYear}>
                    <Icon name="caret-right"/>
                </div>}
            </div>
        </div>
        <div className="flex middle center" style={{marginTop: -24, borderBottom: "1px solid #f1f1f1", paddingBottom: 10}}>
            <select value={hasNextIcon ? year : year + 1}
                    className="cursor-pointer"
                    style={{border: "none", outline: "none", fontSize: 14}}
                    onChange={context.handleYearChange}>
                {
                    years.map((year => {
                        return <option key={year} value={hasNextIcon ? year : year + 1}>{year}年</option>
                    }))
                }
            </select>
        </div>
        <div className="text-center" style={{marginTop: 24}}>
            <Row cols={4} space={0}>
                {months.map((month, index) => {
                    const period = year + month.toString().padStart(2, "0");
                    return <Col key={index}
                                onMouseEnter={context.handleMouseEnter(period)}
                                onMouseLeave={context.handleMouseLeave(period)}
                                className="cursor-pointer"
                                onClick={context.handleMonthClick(period)} style={{paddingBottom: 12}}
                    >
                        <div className={joinBlankSpace((context.inHoverBetween(period) || context.inBetween(period)) && "bg-secondary")}>
                            <div className={joinBlankSpace("space-small hover-bg-secondary", value.indexOf(period) >= 0 && "bg-primary")}>
                                {month.toString().padStart(2, "0") + unitLabel}
                            </div>
                        </div>
                    </Col>
                })}
            </Row>
        </div>
    </div>
};