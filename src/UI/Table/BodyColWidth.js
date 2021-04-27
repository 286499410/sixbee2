import React, {Component} from "react";
import PropTypes from 'prop-types';

export default class BodyColWidth extends Component {

    static defaultProps = {
        showCheckboxes: true,
        showColumns: undefined
    };

    static contextTypes = {
        Table: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {Table} = this.context;
        const {props} = Table;
        const commonStyle = {padding: 0, height: 0, border: 'none'};
        const {dataColumns} = Table.getColumns();
        const columnWidths = Table.getColumnWidths();
        let nodes = [];
        if (props.showCheckboxes) {
            nodes.push(
                <th key={-1}
                    style={{width: props.checkboxColumnWidth, maxWidth: props.checkboxColumnWidth, ...commonStyle}}>
                </th>
            );
        }
        dataColumns.map((column, index) => {
            let key = column.key;
            let width = columnWidths[key];
            nodes.push(<th key={index}
                           style={{
                               width: width,
                               maxWidth: width,
                               ...commonStyle
                           }}>
            </th>);
        });
        return <thead>
        <tr>
            {nodes}
        </tr>
        </thead>
    };
}