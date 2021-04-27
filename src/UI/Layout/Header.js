import React, {forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";

const Header = (props, ref) => {

    props = {
        height: 48,
        ...props,
    };

    return <div ref={ref} className={joinBlankSpace("header", props.className)} style={{
        height: props.height,
        minHeight: props.height,
        ...props.style
    }}>
        {props.children}
    </div>

};

export default forwardRef(Header);
