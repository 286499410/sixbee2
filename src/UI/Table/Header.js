import React from "react";
import PropTypes from "prop-types";
import Checkbox from "./Checkbox";
import {getMousePosition, joinBlankSpace} from "../../lib/tool";
import $ from "jquery";
export default class Header extends React.Component {

    static contextTypes = {
        Table: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {Table} = this.context;
        this.scrollLeftChangeToken = Table.listener.subscribe("scrollLeftChange", ({scrollLeft}) => {
            $(this.refs.container).scrollLeft(scrollLeft);
        });
    }

    componentWillUnmount() {
        const {Table} = this.context;
        Table.listener.unsubscribe(this.scrollLeftChangeToken);
    }

    handleCheck = (event) => {

    };

    /**
     * 设置列增量
     * @param col
     * @param inc
     */
    setInc(col, inc) {
        const {Table} = this.context;
        const {state} = Table;
        let columnWidths = state.columnWidths;
        columnWidths[col.key] += inc;
        this.setParentInc(col, inc);
        this.setChildrenInc(col, inc);
    }

    /**
     * 设置上级增量
     * @param col
     * @param inc
     */
    setParentInc(col, inc) {
        const {Table} = this.context;
        const {state} = Table;
        if (col.parent) {
            state.columnWidths[col.parent.key] += inc;
            this.setParentInc(col.parent, inc);
        }
    }

    /**
     * 设置下级增量
     * @param col
     * @param inc
     */
    setChildrenInc(col, inc) {
        const {Table} = this.context;
        const {state} = Table;
        if (col.children) {
            col.children.map((child) => {
                let childInc = inc / col.colSpan * child.colSpan;
                state.columnWidths[child.key] += childInc;
                this.setChildrenInc(child, childInc);
            });
        }
    }

    /**
     * 调整列宽度
     * @param col
     * @returns {Function}
     */
    handleResize = (col) => (event) => {
        const {Table} = this.context;
        const {state} = Table;
        let columnWidths = Table.getColumnWidths();
        let root = col;
        const key = root.key;
        const startPosition = getMousePosition(event);
        const tableWidth = Table.getTableWidth();
        const columnWidth = columnWidths[key];
        const extraWidth = columnWidths._extra;

        window.document.onmousemove = (event) => {
            let position = getMousePosition(event);
            let offsetX = parseInt(position.x - startPosition.x);
            if (columnWidth + offsetX > 40) {
                this.setInc(root, columnWidth + offsetX - columnWidths[key]);
                columnWidths._extra = extraWidth - offsetX;
                Table.setState({
                    columnWidths: columnWidths,
                    tableWidth: tableWidth + offsetX,
                });
                Table.listener.publish("columnWidthsChange", state.columnWidths);
            }
        };

        window.document.onmouseup = (event) => {
            window.document.onmousemove = null;
            window.document.onmouseup = null;
        };

    };

    render() {
        const {Table} = this.context;
        const {props} = Table;
        const tableWidth = Table.getTableWidth();
        const columnWidths = Table.getColumnWidths();
        const {headerColumns} = Table.getColumns();
        const {heightRowHeight} = props;
        return <div ref="container"
                    className="table-header">
            <table className={joinBlankSpace("table", props.bordered && "bordered", props.condensed && "condensed")}
                   style={{
                        width: tableWidth
                   }}
                   row-height={heightRowHeight}>
                <thead>
                {
                    headerColumns.map((rows, i) => {
                        return (
                            <tr key={i}>
                                {
                                    props.showCheckboxes && this.props.showCheckboxes && i == 0 ?
                                        <th key="checkbox"
                                            className="th-checkbox" rowSpan={headerColumns.length}
                                            col-key="checkbox"
                                            style={{
                                                width: props.checkboxColumnWidth,
                                            }}>
                                            <Checkbox checked={Table.isAllChecked()} onCheck={this.handleCheck}/>
                                        </th> : null
                                }
                                {
                                    rows.map((col, j) => {
                                        let style = {};
                                        let rowSpan = (_.isArray(col.children) && col.children.length > 0) ? 1 : headerColumns.length - i;
                                        if (columnWidths[col.key]) style.width = columnWidths[col.key];
                                        return (
                                            <th key={j}
                                                col-key={col.key}
                                                rowSpan={rowSpan}
                                                colSpan={col.colSpan} style={style}>
                                                <div className="flex middle center">
                                                    {
                                                        col.required ? <span className="text-error">*</span> : null
                                                    }
                                                    <div>{col.label}</div>
                                                </div>
                                                {
                                                    props.resize && i == 0 ?
                                                        <div className="resize"
                                                             onMouseDown={this.handleResize(col)}></div> : null
                                                }
                                            </th>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })}
                </thead>
            </table>
        </div>
    }
}