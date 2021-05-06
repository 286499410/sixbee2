import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {call, getMousePosition, joinBlankSpace, renderContent} from "../../lib/tool";
import Scrollbar from "../Scrollbar";
import BodyColWidth from "./BodyColWidth";
import $ from "jquery";
import Control from "../Control";

export default class TableBody extends Component {

    static defaultProps = {
        onScroll: undefined
    };

    static contextTypes = {
        Table: PropTypes.object,
    };

    content = [];

    constructor(props) {
        super(props);
    }

    renderBody() {
        const {Table} = this.context;
        const {props} = Table;
        const {dataSource = [], bodyRowHeight, isContentEditable} = props;
        const {dataColumns} = Table.getColumns();
        let style = {};
        return dataSource.length > 0 ? <table
            className={joinBlankSpace("table", props.bordered && "bordered", props.condensed && "condensed", props.striped && "striped")}
            style={style}
            row-height={bodyRowHeight}
        >
            <BodyColWidth/>
            <tbody>
            {dataSource.map((data, row) => {
                return <tr key={row}>
                    {dataColumns.map((column, col) => {
                        return <TdContent
                            key={col}
                            row={row}
                            col={col}
                            data={data}
                            column={column}
                            onDidMount={(ref) => {
                                isContentEditable && _.set(this.content, `${row}.${col}`, ref);
                            }}
                        />
                    })}
                </tr>
            })}
            </tbody>
        </table> : <div style={{height: 1}}>
            <div className="position-center text-center" style={{zIndex: 1}}>
                <div>
                    <div><img src={"/image/nodata.png"} style={{maxWidth: 200}}/></div>
                    <div>没有找到相关数据</div>
                </div>
            </div>
        </div>
    }

    getContentRef({row, col}) {
        return this.content[row][col];
    }

    handleClick = (event) => {
        const {Table} = this.context;
        const {props, state} = Table;
        const {bodyRowHeight} = props;
        const {scrollTop, scrollLeft} = state;
        const {x, y} = getMousePosition(event);
        const {left, top} = $(this.refs.container).offset();
        const columnWidths = Table.getColumnWidths();
        const {dataColumns} = Table.getColumns();
        const relLeft = x - left, relTop = y - top;
        const row = parseInt((relTop + scrollTop) / bodyRowHeight);
        const col = (() => {
            let remain = relLeft + scrollLeft;
            for (let i = 0; i < dataColumns.length; i++) {
                remain -= columnWidths[dataColumns[i].key];
                if (remain <= 0) return i;
            }
            return dataColumns.length - 1;
        })();
        const contentRef = this.getContentRef({row, col});
        contentRef.focus();
    };

    handleScroll = (event) => {
        call(this.props.onScroll, event);
    };

    render() {
        const {Table} = this.context;
        const {props} = Table;
        const tableWidth = Table.getTableWidth();
        return (
            <div ref="container" className={joinBlankSpace("table-body", this.props.className)}
                 onClick={props.isContentEditable ? this.handleClick : undefined}>
                <Scrollbar ref="scroll" style={{height: props.bodyHeight || "auto", width: "100%"}}
                           onScroll={this.handleScroll}>
                    <div style={{width: tableWidth, minWidth: "calc(100% - 1px)"}}>
                        {this.renderBody()}
                    </div>
                </Scrollbar>
            </div>
        );
    }

}

export class TdContent extends Component {

    static defaultProps = {
        column: {},
        data: {}
    };

    static contextTypes = {
        Table: PropTypes.object,
    };

    state = {
        isEditable: false,
        value: undefined
    };

    static align = {
        money: "right",
        date: "center"
    };

    constructor(props) {
        super(props);
        this.control = React.createRef();
    }

    componentDidMount() {
        call(this.props.onDidMount, this);
    }

    getControlValue() {
        const {column} = this.props;
        return this.state.value === undefined ? _.get(this.props.data, column.formKey || column.key) : this.state.value;
    }

    focus() {
        const {column} = this.props;
        if (!column.type) return;
        this.setState({
            isEditable: true
        }, () => {
            const {column} = this.props;
            switch (column.type) {
                case "text":
                case "money":
                case "number":
                    setTimeout(() => {
                        this.control.current.focus();
                    }, 50);
            }
        });
    }

    handleBlur = (event) => {
        const {column, row, col, data} = this.props;
        this.setState({isEditable: false}, () => {
            call(column.onBlur, {value: this.state.value, row, col, data});
        });
    };

    handleChange = ({value}) => {
        const {column, row, col, data} = this.props;
        this.setState({value}, () => {
            call(column.onChange, {value, row, col, data});
        });
    };

    getAlign() {
        return this.props.column.align || TdContent.align[this.props.column.type];
    }

    render() {

        if (this.state.isEditable) {
            const value = this.getControlValue();
            return <td align={this.props.column.align} className="control">
                <Control
                    className="border-none full-width"
                    ref={this.control}
                    {...this.props.column}
                    label={false}
                    value={value}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    align={this.getAlign()}
                />
            </td>
        } else {
            return <td align={this.getAlign()}>{renderContent(this.props.data, this.props.column) || null}</td>
        }
    }

}