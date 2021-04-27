import React from "react";
import PropTypes from "prop-types";
import {joinBlankSpace} from "../../lib/tool";
import $ from "jquery";
import {TdContent} from "./Body";
import BodyColWidth from "./BodyColWidth";

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

    render() {
        const {Table} = this.context;
        const {props} = Table;
        const tableWidth = Table.getTableWidth();
        const {dataColumns} = Table.getColumns();
        const {bodyRowHeight, footerData} = props;
        return <div ref="container"
                    className="table-footer">
            <table className={joinBlankSpace("table", props.bordered && "bordered", props.condensed && "condensed")}
                   style={{
                       width: tableWidth
                   }}
                   row-height={bodyRowHeight}>
                <BodyColWidth/>
                <tfoot>
                <tr>
                    {
                        props.showCheckboxes &&
                        <td className="th-checkbox"
                            style={{
                                width: props.checkboxColumnWidth,
                            }}>
                        </td>
                    }
                    {dataColumns.map((column, index) => {
                        return <TdContent key={index} column={column} data={footerData}/>
                    })}
                </tr>
                </tfoot>
            </table>
        </div>
    }
}