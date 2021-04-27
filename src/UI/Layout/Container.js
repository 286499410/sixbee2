import React, {forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";

const Container = (props, ref) => {

    props = {
        fullScreen: false,
        direction: 'row',
        ...props,
    };

    return <div ref={ref}
                className={joinBlankSpace("layout", props.className, props.fullScreen && "full-screen", `direction-${props.direction}`)}
                style={{...props.style}}>
        {props.children}
    </div>

};
export default forwardRef(Container);