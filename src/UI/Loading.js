import React from "react";
import {call, joinBlankSpace} from "../lib/tool";


export default class Loading extends React.Component {

    static defaultProps = {
        imgSrc: "/image/loading/1.gif",
        zIndex: 10,
        open: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if(this.props.open === false) {
            this.hide();
        }
    }

    componentDidUpdate() {
        if(this.props.open === true) {
            this.show();
        } else {
            this.close();
        }
    }

    close() {
        this.refs.current.style.opacity = 0;
        setTimeout(() => {
            this.hide();
            call(this.props.onRequestClose);
        }, 300);
    }

    hide() {
        this.refs.current.classList.add("hidden");
    }

    show() {
        this.refs.current.classList.remove("hidden");
        setTimeout(() => {
            this.refs.current.style.opacity = 1;
        }, 10);
    }

    render() {
        return (
            <div ref="current" className={joinBlankSpace("masker", this.props.className)} style={{zIndex: this.props.zIndex}}>
                <div className="position-center">
                    <div style={{width: 120, height: 120, overflow: "hidden", borderRadius: "100%", position: "relative"}}>
                        <div className="position-center">
                            <img src={this.props.imgSrc}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}