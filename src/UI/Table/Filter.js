import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {joinBlankSpace} from "../../lib/tool";

export default class TableFilter extends Component {

    static contextTypes = {
        Form: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={joinBlankSpace("table-filter", this.props.className)} style={this.props.style}>

            </div>
        );
    }

}