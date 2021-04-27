import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {call, getMousePosition, isEmpty, joinBlankSpace, renderContent} from "../../lib/tool";
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
        return <table
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
        </table>
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
                {props.bodyHeight ?
                    <Scrollbar ref="scroll" style={{height: props.bodyHeight, width: "100%"}}
                               onScroll={this.handleScroll}>
                        <div style={{width: tableWidth, minWidth: "calc(100% - 1px)"}}>
                            {this.renderBody()}
                        </div>
                    </Scrollbar> : this.renderBody()}
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
        isEditable: false
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

    getValue() {
        const {column} = this.props;
        return _.get(this.props.data, column.formKey || column.key);
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
        this.setState({isEditable: false});
    };

    getAlign() {
        return this.props.column.align || TdContent.align[this.props.column.type];
    }

    render() {
        const value = this.getValue();
        if (this.state.isEditable) {
            return <td align={this.props.column.align} className="control">
                <Control
                    className="border-none full-width"
                    ref={this.control}
                    {...this.props.column}
                    label={false}
                    value={value}
                    onBlur={this.handleBlur}
                />
            </td>
        } else {
            return <td align={this.getAlign()}>{renderContent(this.props.data, this.props.column) || null}</td>
        }
    }

}