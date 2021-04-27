import React, {useRef, forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";

const RowContext = React.createContext();

const getStyle = (props) => {
    let style = {...props.style};
    if (props.spaceX && !(props.spaceX % 4 == 0 && props.spaceX <= 40)) {
        style.width = `calc(100% + ${props.spaceX}px)`;
        style.marginLeft = style.marginRight = -props.space / 2;
    }
    if (props.spaceY && !(props.spaceY % 4 == 0 && props.spaceY <= 40)) {
        style.marginTop = style.marginBottom = -props.space / 2;
    }
    if (props.space && !(props.space % 4 == 0 && props.space <= 40)) {
        style.width = `calc(100% + ${props.space}px)`;
        style.margin = -props.space / 2;
    }
    return style;
};


const Row = (props, ref) => {

    props = {
        cols: 1,    //支持1到24
        className: undefined,
        space: undefined, //支持4的倍数，最小4，最大48
        ...props,
    };

    return <RowContext.Provider value={props}>
        <div ref={ref} className={joinBlankSpace('row', props.className)}
             cols={props.cols}
             space={props.space}
             spacex={props.spaceX}
             spacey={props.spaceY}
             style={getStyle(props)}>
            {props.children}
        </div>
    </RowContext.Provider>
};
export {RowContext};
export default forwardRef(Row);