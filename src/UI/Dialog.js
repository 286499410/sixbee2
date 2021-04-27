import React, {Component} from "react";
import Popover from "./Popover";
import {call, joinBlankSpace} from "../lib/tool";

export default class Dialog extends Component {

    static defaultProps = {
        open: false
    };

    state = {
        anchorEl: null,
    };

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        if(this.state.anchorEl === null && this.containerRef.current !== null) {
            this.setState({anchorEl: this.containerRef.current});
        }
    }

    render() {
        return <div className={joinBlankSpace("full-screen-fixed", !this.props.open && "hidden")}>
            <div ref={this.containerRef} className="position-center"></div>
            {
                this.state.anchorEl && <Popover
                    open={this.props.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin="center middle"
                    targetOrigin="center middle"
                    hasMasker={true}
                    onRequestClose={() => {
                        call(this.props.onRequestClose);
                    }}
                >
                    <div className="dialog">
                        <div className="dialog-title">titletitletitletitletitletitle</div>
                        <div className="dialog-content">
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                            <div>contentcontentcontentcontentcontentcontentcontentcontent</div>
                        </div>
                    </div>
                </Popover>
            }
        </div>
    }

}