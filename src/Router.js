import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Route, Link, Redirect, Switch, Prompt} from 'react-router-dom';
import LoadPage from "./LoadPage";

export default class Router extends React.Component {

    static contextTypes = {
        App: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        console.log("render Router");
        return <div>
            <BrowserRouter>
                <Switch>
                    {
                        this.props.route.switch.map((route, index) => (
                            <Route key={index} exact={route.exact} path={route.path} render={(props) => (
                                <Gateway {...props} switch={route} route={this.props.route}/>
                            )}/>))
                    }
                    <Route path="/" render={(props) => (
                        <Gateway {...props} route={this.props.route}/>
                    )}/>
                </Switch>
            </BrowserRouter>
        </div>
    }
}


class Gateway extends React.Component {

    static contextTypes = {
        App: PropTypes.object,
    };

    renderComponent(Component, Layout, props = this.props) {
        Layout = Layout === false ? false : Layout || props.route.layout;
        if (Layout) {
            return <Layout {...props}><Component {...props}/></Layout>
        } else {
            return <Component {...props}/>
        }
    }

    render() {
        console.log("render Gateway");
        let props = {...this.props};
        if (props.switch) {
            //自定义的路由匹配
            return this.renderComponent(props.switch.component, props.switch.layout);
        } else if (props.route) {
            if (props.route.autoMatch) {
                let paths = window.location.pathname.split('/');
                paths.splice(0, 1);
                let group = paths[0];
                paths.splice(0, 1);
                props.group = group;
                props.path = paths.join("/");
                return this.renderComponent(LoadPage, null, props);
            } else {
                return <Switch>
                    {
                        this.props.route.noMatch.map((route, index) => (
                            <Route key={index} exact={route.exact} path={route.path} render={(nextProps) => {
                                return this.renderComponent(nextProps.route);
                            }}/>)
                        )
                    }
                </Switch>
            }

        }
    }
}