import React, {forwardRef} from "react";
import Icon from "../Icon";

const Checkbox = (props, ref) => {
    props = {
        checked: 0,
        onCheck: undefined,
        size: 18,
        ...props
    };
    const getIconName = () => {
        return {
            0: "border",
            1: "check-square-fill",
            2: "minus-square-fill"
        }[props.checked];
    };
    const handleClick = (event) => {
        const isInputChecked = props.checked != 1 ? 1 : 0;
        if (props.onCheck) {
            props.onCheck({event, isInputChecked});
        }
    };
    return <Icon type="button"
                 size={props.size}
                 name={getIconName()}
                 onClick={handleClick}
                 className={props.checked == 1 || props.checked == 2 ? "text-primary" : ""}
                 color={" "}
                 padding={2}
                 iconStyle={{
                     transition: "none"
                 }}
    />
};
export default forwardRef(Checkbox);