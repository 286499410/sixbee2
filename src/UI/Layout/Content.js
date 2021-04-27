import React, {forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";
import Scrollbar from "../Scrollbar";

const Content = (props, ref) => {

    props = {
        transition: 'fade',
        hasScrollbar: false,
        ...props,
    };

    return <div ref={ref} className={joinBlankSpace("content", props.className)} style={props.style}>
        {
            props.hasScrollbar ? <Scrollbar style={{width: "100%", height: "100%"}}>
                {props.children}
            </Scrollbar> : props.children
        }
    </div>

};
export default forwardRef(Content);