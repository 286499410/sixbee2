import React, {Component, forwardRef} from 'react';
import {joinBlankSpace} from "../lib/tool";

const Divider = (props, ref) => {

    props = {
        space: 0,
        ...props,
    };

    return <div ref={ref}
                className={joinBlankSpace("divider", props.className)}
                space={props.space}
                style={props.style}></div>
};
export default forwardRef(Divider);