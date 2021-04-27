import React, {useContext, forwardRef} from 'react';
import {joinBlankSpace} from "../../lib/tool";
import {RowContext} from "./Row";

const getStyle = (rowContext, props) => {
    let style = {...props.style};
    let spaceX = rowContext.spaceX;
    if(spaceX && !(spaceX % 4 == 0 && spaceX <= 40)) {
        style.paddingLeft = style.paddingRight = spaceX / 2;
    }
    let spaceY = rowContext.spaceY;
    if(spaceY && !(spaceY % 4 == 0 && spaceY <= 40)) {
        style.paddingTop = style.paddingBottom = spaceY / 2;
    }
    let space = rowContext.space;
    if(space && !(space % 4 == 0 && space <= 40)) {
        style.padding = space / 2;
    }
    return style;
};

const Col = (props, ref) => {
    
    props = {
        cols: 1,
        className: undefined,
        style: undefined,
        ...props,
    };

    const rowContext = useContext(RowContext);

    return (
        <div ref={ref}
             {...{...props, children: undefined}}
             className={joinBlankSpace("col", "col-" + props.cols, props.className)}
             style={getStyle(rowContext, props)}
        >
            {props.children}
        </div>
    );
};
export default forwardRef(Col);