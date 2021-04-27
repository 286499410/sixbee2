import React, {forwardRef} from 'react';
import {joinBlankSpace} from "../lib/tool";

const Icon = (props, ref) => {
    
    props = {
        classPrefix: 'iconfont icon-',  //样式前缀
        name: undefined,                //iconfont class
        onClick: undefined,
        size: 16,
        style: undefined,
        ...props,
    };

    const handleClick = (event) => {
        props.onClick && props.onClick(event);
    };

    const getStyle = () => {
        return {
            lineHeight: 1,
            fontSize: props.size,
            ...props.style,
        }
    };

    return <i ref={ref} className={joinBlankSpace(
        props.classPrefix + props.name,
        props.disabled && "disabled",
        props.className,
        props.onClick && 'cursor-pointer ripple'
    )} style={getStyle()} onClick={handleClick}/>
    
};
export default forwardRef(Icon);