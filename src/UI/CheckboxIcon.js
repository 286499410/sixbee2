import React, {forwardRef} from "react";
import Icon from "./Icon";
import {joinBlankSpace} from "../lib/tool";


const CheckboxIcon = (props, ref) => {
    props = {
        checked: 0,
        onCheck: undefined,
        size: 18,
        ...props
    };
    const getIconName = () => {
        return {
            0: "ys-square",
            1: "ys-check-square-fill",
            2: "ys-minus-square-fill"
        }[props.checked];
    };
    const handleClick = (event) => {
        const isInputChecked = props.checked != 1 ? 1 : 0;
        if (props.onCheck) {
            props.onCheck({event, isInputChecked});
        }
    };
    return <Icon
        ref={ref}
        type="button"
        size={props.size}
        name={getIconName()}
        onClick={handleClick}
        className={joinBlankSpace([1,2].indexOf(props.checked) >= 0 && "text-primary", props.className)}
        style={props.style}
        color={" "}
        padding={2}
        iconStyle={{
            transition: "none"
        }}
    />
};
export default forwardRef(CheckboxIcon);