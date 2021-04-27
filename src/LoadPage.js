import React, {Component} from "react";
import {moduleManager} from "./index";


export default class LoadPage extends Component {

    static defaultProps = {
        group: undefined,
        path: undefined
    };

    state = {
        module: undefined,
        group: undefined,
        path: undefined,

    };

    constructor(props) {
        super(props);
        this.loadPage();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let state = {
            group: nextProps.group,
            path: nextProps.path
        };
        if (nextProps.group !== prevState.group || nextProps.path !== prevState.path) {
            state.module = undefined;
        }
        return state;
    }

    componentDidUpdate() {
        if(this.state.module === undefined) {
            this.loadPage();
        }
    }

    async loadPage() {
        let group = this.props.group, path = this.props.path;
        let module = await moduleManager.loadModule({group, path});
        if(module !== undefined) {
            this.setState({module});
        }
    }

    render() {
        return (
            this.state.module ? <this.state.module {...this.props}/> : null
        );
    }

}