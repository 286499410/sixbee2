import React, {Component} from "react";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {Calendar} from "react-date-range";
import * as rdrLocales from 'react-date-range/dist/locale';
import {date, dateToStr, isEmpty, joinBlankSpace, strToDate, strToTime} from "../lib/tool";
import _ from 'lodash';
import Icon from './Icon';
import Popover from "./Popover";

export default class DatePicker extends Component {

    static defaultProps = {
        value: undefined,
        timestamp: false,
        onChange: undefined
    };

    state = {
        open: false,
        anchorEl: {},
    };

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    handleClick = (event) => {
        this.setState({
            open: true,
            anchorEl: this.ref.current,
        });
    };

    handleClose = (event) => {
        this.setState({open: false});
    };

    getDateStr() {
        if (this.props.timestamp) {
            if (parseInt(this.props.value) == this.props.value) {
                return date("Y-m-d", this.props.value);
            }
            return '';
        }
        return this.props.value || '';
    }

    getStyle() {
        let style = {...this.props.style};
        return style;
    }

    handleChange = (date) => {
        let dateStr = _.isDate(date) ? dateToStr(date) : date;
        this.handleClose();
        const value = dateStr ? (this.props.timestamp ? strToTime(dateStr) : dateStr) : '';
        this.props.onChange && this.props.onChange({value});
    };

    handleClear = (event) => {
        event.stopPropagation();
        this.handleChange('');
    };

    render() {
        console.log("render DatePicker");
        let date = this.getDateStr();
        return (
            <div ref={this.ref}>
                <div
                     className={joinBlankSpace("flex middle between form-control cursor-pointer hover", this.props.className)}
                     style={this.getStyle()}
                     onClick={this.handleClick}
                >
                    {
                        isEmpty(date) ? <div>
                            {this.props.placeholder ? <span className="text-muted">{this.props.placeholder}</span> : null}
                        </div> : <div className="text-ellipsis">{date}</div>
                    }
                    {
                        isEmpty(date) ? <div className="text-muted">
                            <div><Icon name="calendar"/></div>
                        </div> : <div className="text-muted">
                            <div className="hover-show"><Icon name="close-circle-fill" onClick={this.handleClear}/></div>
                            <div className="hover-hide"><Icon name="calendar"/></div>
                        </div>
                    }
                </div>
                <Popover
                    {...this.props.popoverProps}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    onRequestClose={this.handleClose}
                    style={{width: 'auto'}}
                    scaleX={1}>
                    <Calendar
                        date={date ? strToDate(date) : new Date()}
                        onChange={this.handleChange}
                        locale={rdrLocales['zhCN']}
                        minDate={this.props.minDate ? strToDate(this.props.minDate) : undefined}
                        maxDate={this.props.maxDate ? strToDate(this.props.maxDate) : undefined}
                    />
                </Popover>
            </div>

        );
    }

}