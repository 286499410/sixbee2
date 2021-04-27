import React, {Component} from 'react';
import Popover from './Popover';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {DateRangePicker} from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';
import {dateToStr, joinBlankSpace, strToDate, strToTime, date, isEmpty} from "../lib/tool";
import Icon from "./Icon";

export default class DateRange extends Component {

    static defaultProps = {
        value: undefined,
        timestamp: false,
        onChange: undefined
    };

    state = {
        value: undefined,
        open: false,
        anchorEl: {},
        clickNum: 0,        //点击次数
    };

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    getAnchorEl() {
        const className = this.ref.current.parentNode.parentNode.className;
        return className.indexOf("control-wrapper") >= 0 ? this.ref.current.parentNode.parentNode : this.ref.current;
    }

    handleClick = (event) => {
        this.setState({
            open: true,
            anchorEl: this.getAnchorEl(),
        });
    };

    handleClose = (event) => {
        this.setState({open: false, value: undefined});
    };

    getValue() {
        let [start = '', end = ''] = this.state.value || this.props.value;
        if (this.props.timestamp) {
            start = start ? date("Y-m-d", start) : '';
            end = end ? date("Y-m-d", end) : '';
        }
        return [start, end];
    }

    getStyle() {
        let style = {...this.props.style};
        return style;
    }

    handleChange = (ranges) => {
        this.state.clickNum++;
        let startDate = _.get(ranges, 'selection.startDate');
        let endDate = _.get(ranges, 'selection.endDate');
        let start = startDate ? dateToStr(startDate) : '';
        let end = endDate ? dateToStr(endDate) : '';
        if (this.props.timestamp) {
            start = start ? strToTime(start) : '';
            end = end ? strToTime(end) : '';
        }
        const value = [start, end];
        this.props.onChange && this.props.onChange({value});
        this.setState({value});
        if (this.state.clickNum % 2 == 0) { //点两次自动关闭日历
            this.handleClose();
        }
    };

    handleClear = (event) => {
        event.stopPropagation();
        this.handleChange();
    };

    render() {
        console.log("render DateRange");
        let [start, end] = this.getValue();
        return (
            <div ref={this.ref}>
                <div
                    className={joinBlankSpace("flex middle between form-control cursor-pointer hover", this.props.className)}
                    style={this.getStyle()}
                    onClick={this.handleClick}>
                    {
                        isEmpty(start) || isEmpty(end) ? <div>
                                {this.props.placeholder ?
                                    <span className="text-muted">{this.props.placeholder}</span> : null}
                            </div> :
                            <div className="flex between full-width relative">
                                <div className="text-center" style={{width: 'calc(50% - 10px)'}}>{start}</div>
                                <div className="text-center" style={{width: 'calc(50% - 10px)'}}>{end}</div>
                                <div className="date-range-separator flex middle center">~</div>
                            </div>

                    }
                    {
                        isEmpty(start) || isEmpty(end) ? <div className="control-border-color">
                            <div><Icon name="calendar"/></div>
                        </div> : <div className="control-border-color">
                            <div className="hover-show"><Icon name="close-circle-fill" onClick={this.handleClear}/>
                            </div>
                            <div className="hover-hide"><Icon name="calendar"/></div>
                        </div>
                    }
                </div>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    onRequestClose={this.handleClose}
                    style={{width: 'auto'}}
                    scaleX={1}>
                    <DateRangePicker
                        ranges={[
                            {
                                startDate: start ? strToDate(start) : new Date(),
                                endDate: end ? strToDate(end) : new Date(),
                                key: 'selection'
                            }
                        ]}
                        showSelectionPreview={false}
                        showMonthAndYearPickers={true}
                        showDateDisplay={false}
                        staticRanges={[]}
                        inputRanges={[]}
                        months={2}
                        locale={rdrLocales['zhCN']}
                        direction="horizontal"
                        onChange={this.handleChange}
                    />
                </Popover>
            </div>
        );
    }

}