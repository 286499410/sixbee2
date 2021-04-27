import React, {forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";

const Sidebar = (props, ref) => {
    props = {
        width: 200,
        ...props
    };
    return <div ref={ref} className={joinBlankSpace("sidebar", props.className)}
                style={{width: props.width, minWidth: props.width, ...props.style}}>
        {props.children}
    </div>
};
export default forwardRef(Sidebar);