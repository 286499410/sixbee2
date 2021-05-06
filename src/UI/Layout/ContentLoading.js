import React from "react";
import Loading from "../Loading";

export default class ContentLoading extends React.Component{

    state = {
        open: false
    };

    render() {
        return (
            <Loading open={this.state.open}/>
        );
    }
}