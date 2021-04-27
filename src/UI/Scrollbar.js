import React, {forwardRef} from 'react';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {joinBlankSpace} from "../lib/tool";

const Scrollbar = (props, ref) => {

    return <OverlayScrollbarsComponent
        ref={ref}
        {...props}
        className={joinBlankSpace("scrollbar", props.className)}>
        {props.children}
    </OverlayScrollbarsComponent>

};

export default forwardRef(Scrollbar);