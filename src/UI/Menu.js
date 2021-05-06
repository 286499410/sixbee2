import React, {Component} from 'react';
import {call, joinBlankSpace, replaceText} from "../lib/tool";
import Icon from "./Icon";
import Popover from "./Popover";
import Checkbox from "./Checkbox";

export default class Menu extends Component {

    static defaultProps = {
        dataSource: [],                         //数据源
        dataSourceConfig: {text: 'text', value: 'value'},   //取数配置
        value: undefined,                       //当前值
        onSelect: undefined,                    //选择触发事件
        virtual: false,                         //长列表虚拟化展示
        indent: 14,                             //子级缩进
        childrenShowMethod: undefined,          //子级显示方式：popover 弹出，fold 折叠
        clickParentShowChildren: false,         //点击父级显示子级
        defaultFolded: false,                   //默认是否折叠
        multiple: false,                        //是否多选
    };

    state = {
        scrollTop: 0,
        rowHeight: 32,
        height: 300,
        foldSet: new Set(),
        unFoldSet: new Set(),
        poppedSet: {}
    };

    constructor(props) {
        super(props);
        this.id = new Date().getTime();
        this.containerRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.className && nextProps.className.toString().indexOf('text-small') >= 0) {
            return {rowHeight: 24};
        }
        return null;
    }

    componentDidMount() {
        if (this.containerRef.current) {
            this.state.height = _.get(this.containerRef.current, 'clientHeight') || this.state.height;
            this.state.rowHeight = _.get(this.containerRef.current, 'children[1].clientHeight') || this.state.rowHeight;
            this.initScrollTop();
        }
    }

    componentDidUpdate() {

    }

    getValue() {
        return this.props.multiple ? (this.props.value || []) : this.props.value;
    }

    initScrollTop() {
        const value = this.getValue();
        let index = _.findIndex(this.props.dataSource, {value: this.props.multiple ? value[0] : value});
        let scrollTop = Math.max((index + 1) * this.state.rowHeight - this.state.height / 2, 0);
        this.containerRef.current.scrollTop = scrollTop;
    }

    handleScroll = (event) => {
        this.isVirtual() && this.setState({scrollTop: event.target.scrollTop});
    };

    handleClick = (data) => (event) => {
        if (data.disabled) return;
        const value = this.getRowValue(data);
        if (this.props.childrenShowMethod === "popover") {
            Object.values(this.state.poppedSet).map(row => row.open = false);
            this.forceUpdate();
        }
        call(this.props.onSelect, {value, data, event});
    };

    isVirtual() {
        return this.props.virtual;
    }

    getVirtualTopSpace() {
        let {startRow} = this.getShowRows();
        return <div style={{height: startRow * this.state.rowHeight}}></div>
    }

    getVirtualBottomSpace() {
        let {endRow} = this.getShowRows();
        let rows = this.props.dataSource.length;
        return <div style={{height: (rows - 1 - endRow) * this.state.rowHeight}}></div>
    }

    getShowRows() {
        let startRow = parseInt(this.state.scrollTop / this.state.rowHeight);
        let endRow = Math.min(startRow + Math.ceil(this.state.height / this.state.rowHeight), this.props.dataSource.length - 1);
        return {startRow, endRow};
    }

    getDataSource() {
        if (this.isVirtual()) {
            let {startRow, endRow} = this.getShowRows();
            return this.props.dataSource.slice(startRow, endRow);
        } else {
            return this.props.dataSource;
        }
    }

    getText(data) {
        return !_.isObject(data) ? data : replaceText(data, this.props.dataSourceConfig.text);
    }

    getRowValue(data) {
        return !_.isObject(data) ? data : _.get(data, this.props.dataSourceConfig.value);
    }

    hasChildren(data) {
        return data.children && data.children.length > 0;
    }

    /**
     * 显示子级
     * @param data
     * @returns {Function}
     */
    showChildren = (data) => (event) => {
        switch (this.props.childrenShowMethod) {
            case "fold":
                this.handleFoldClick(data)(event);
                break;
            case "popover":
                this.handlePopoverClick(data)(event);
                break;
        }
    };

    /**
     * 节点是否折叠的
     * @param data
     * @returns {boolean}
     */
    isFolded(data) {
        let value = this.getRowValue(data);
        return this.state.foldSet.has(value) || (this.props.defaultFolded && !this.state.unFoldSet.has(value));
    }

    handleFoldClick = (data) => (event) => {
        event.stopPropagation();
        const value = this.getRowValue(data);
        if (!this.isFolded(data)) {
            const target = document.getElementById(this.id + "_" + value);
            target.style.height = `${target.clientHeight}px`;
            setTimeout(() => {
                target.style.transform = "scale(1,0)";
                target.style.height = "0";
            },10);
            setTimeout(() => {
                this.state.foldSet.add(value);
                this.state.unFoldSet.delete(value);
                this.forceUpdate();
            }, 300);
        } else {
            this.state.foldSet.delete(value);
            this.state.unFoldSet.add(value);
            this.forceUpdate();
        }

    };

    /**
     * 弹出
     * @param data
     * @returns {Function}
     */
    handlePopoverClick = (data) => (event) => {
        event.stopPropagation();
        let value = this.getRowValue(data);
        this.state.poppedSet = {
            [value]: {
                open: true,
                anchorEl: event.target,
            }
        };
        this.forceUpdate();
    };

    /**
     * 弹出层关闭处理事件
     * @param data
     * @returns {Function}
     */
    handlePopoverClose = (data) => (event) => {
        let value = this.getRowValue(data);
        this.state.poppedSet = {
            [value]: {
                open: false,
            }
        };
        this.forceUpdate();
    };

    hasValue(value) {
        if(this.props.multiple) {
            return (this.props.value || []).indexOf(value) >= 0;
        } else {
            return this.props.value === value;
        }
    }

    renderMenuItem(dataSource, level = 1) {
        let menuItems = [];
        dataSource.map((data, index) => {
            let value = this.getRowValue(data);
            let hasChildren = this.hasChildren(data);
            let isFolded = this.isFolded(data);
            const key = value || index;
            const isSelected = this.hasValue(value);
            menuItems.push(<div
                className={joinBlankSpace("menu-item flex middle between", isSelected && 'selected', data.disabled && 'menu-item-disabled')}
                style={{
                    ...this.props.menuItemStyle,
                    height: hasChildren ? 'auto' : undefined
                }}
                key={key}
                onClick={hasChildren && this.props.clickParentShowChildren ? this.showChildren(data) : this.handleClick(data)}>
                <div className="menu-item-label flex middle">
                    {this.props.multiple && <div><Checkbox value={isSelected ? 1 : 0}/></div>}
                    {this.getText(data)}
                </div>
                {
                    hasChildren && this.props.childrenShowMethod === "fold" && <div className="menu-item-icon">
                        <Icon name={isFolded ? "caret-up" : "caret-down"} size={14} onClick={this.showChildren(data)}/>
                    </div>
                }
                {
                    hasChildren && this.props.childrenShowMethod === "popover" && <div className="menu-item-icon">
                        <Icon name={"caret-right"} onClick={this.showChildren(data)}/>
                    </div>
                }
            </div>);
            if (hasChildren) {
                let content = <div key={'parent' + key}
                                   className="menu"
                                   id={this.id + "_" + value}
                                   style={{marginLeft: this.props.childrenShowMethod === "popover" ? undefined : this.props.indent}}>
                    {this.renderMenuItem(data.children, level + 1)}
                </div>;
                switch (this.props.childrenShowMethod) {
                    case "fold":
                        if (!isFolded) menuItems.push(content);
                        break;
                    case "popover":
                        menuItems.push(<Popover
                            style={{width: _.get(this.containerRef, "current.offsetWidth")}}
                            key={'parent' + value}
                            {...this.state.poppedSet[value]}
                            zIndex={1000 + level}
                            anchorOrigin={"right top"}
                            targetOrigin={"left top"}
                            onRequestClose={this.handlePopoverClose(data)}
                        >
                            {content}
                        </Popover>);
                        break;
                    default:
                        menuItems.push(content);
                }
            }
        });
        return menuItems;
    }

    render() {
        return (
            <div id={this.id}
                 ref={this.containerRef}
                 className={joinBlankSpace("menu", this.props.className, this.props.multiple && "multiple")}
                 style={this.props.style}
                 onScroll={this.handleScroll}>
                {this.isVirtual() && this.getVirtualTopSpace()}
                {this.renderMenuItem(this.getDataSource())}
                {this.isVirtual() && this.getVirtualBottomSpace()}
            </div>
        );
    }

}