import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Provider extends Component {

    static childContextTypes = {
        request: PropTypes.object,
        loadModule: PropTypes.func
    };

    constructor(props) {
        super(props);
    }

    getChildContext() {
        let request = this.props.request;
        let loadModule = this.props.loadModule;
        return {
            request,
            loadModule
        }
    }

    render() {
        return this.props.children
    }

}
