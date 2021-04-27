import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CommonPager from '../pager';
import {call} from "../../lib/tool";

/**
 * 分页器
 */
export default class Pager extends Component {

    static contextTypes = {
        Table: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {Table} = this.context;
        let props = Object.assign({}, _.isFunction(Table.props.pager) ? Table.props.pager(Table) : Table.props.pager);
        return <div className="table-pager">
            <div className="pull-right">
                <CommonPager {...props} onChange={(data) => {
                    Table.setState({
                        scrollTop: 0,
                        checked: {}
                    });
                    call(this.props.onChange, data);
                }}/>
            </div>
        </div>
    }
}