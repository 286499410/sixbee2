import React, {Component} from 'react';
import {
    call, forEach,
    getControlValue,
    getDataFromDataSourceByValue,
    getDataSource, isEmpty,
    joinBlankSpace,
    replaceText
} from "../lib/tool";
import Popover from './Popover';
import _ from 'lodash';
import Icon from "./Icon";
import Menu from './Menu';
import Divider from "./Divider";

export default class Select extends Component {

    static defaultProps = {
        onChange: undefined,
        onBlur: undefined,
        onFocus: undefined,
        value: undefined,
        defaultValue: undefined,
        dataSource: [],
        dataSourceConfig: {text: 'text', value: 'value'},
        noDataTipText: "没有数据",
        placeholder: undefined,
        style: undefined,
        className: undefined,
        popoverProps: undefined,
        menuProps: undefined,
        onCreate: undefined,
        createLabel: undefined,
        popoverAppend: undefined,
        multiple: false
    };

    state = {
        value: undefined,
        open: false,
        anchorEl: {},
        dataSource: []
    };

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.loadDataSource().then((dataSource) => {
            this.state.dataSource = dataSource;
            if (this.updater.isMounted(this)) {
                this.forceUpdate();
            }
        });
    }

    /**
     * 加载数据源
     * @returns {Promise<void>}
     */
    async loadDataSource() {
        const dataSource = await getDataSource(this.props);
        return dataSource;
    }

    getRowValue(data) {
        if (!_.isObject(data)) {
            return data;
        }
        return _.get(data, this.props.dataSourceConfig.value);
    }

    getRowDataByValue(value) {
        let rowData;
        forEach(this.state.dataSource, (item) => {
            if(this.getRowValue(item) == value) {
                rowData = item;
            }
        });
        return rowData;
    }

    getSelectText() {
        const value = this.getValue();
        if(this.props.multiple) {
            return value.map(item => {
                const data = this.getRowDataByValue(item);
                return _.isObject(data) ? replaceText(data, this.props.dataSourceConfig.text) : data;
            }).join("，");
        } else {
            const data = this.getRowDataByValue(value);
            return _.isObject(data) ? replaceText(data, this.props.dataSourceConfig.text) : data;
        }
    }

    getAnchorEl() {
        const className = this.ref.current.parentNode.parentNode.className;
        return className.indexOf("control-wrapper") >= 0 ? this.ref.current.parentNode.parentNode : this.ref.current;
    }

    handleOpen = (event) => {
        this.setState({
            open: true,
            anchorEl: this.getAnchorEl()
        });
    };

    handleRequestClose = ({event, value}) => {
        if(value === undefined) value = this.getValue();
        if(this.props.onMenuRequestClose) {
            if(call(this.props.onMenuRequestClose, {value, event}) !== false) {
                this.setState({open: false});
            }
        } else {
            this.setState({open: false});
        }
    };

    handleSelect = ({value, event}) => {
        event.stopPropagation();
        let currentValue = this.getValue();
        if(this.props.multiple) {
            const indexOf = currentValue.indexOf(value);
            if(indexOf >= 0) {
                currentValue.splice(indexOf, 1);
            } else {
                currentValue.push(value);
            }
            this.setValue(currentValue);
        } else {
            this.setValue(value);
            this.handleRequestClose({event, value});
        }
    };

    handleCreate = (event) => {
        this.handleRequestClose({event});
        call(this.props.onCreate);
    };

    getValue() {
        const value = getControlValue(this);
        return this.props.multiple ? (_.isArray(value) ? value : []) : value;
    }

    setValue(value) {
        this.setState({value}, () => {
            call(this.props.onChange, {value});
        });
    }

    render() {
        let selectText = this.getSelectText();
        return (
            <div ref={this.ref}>
                <div
                    className={joinBlankSpace("form-control cursor-pointer flex middle between", this.props.className, this.state.open && 'active')}
                    onClick={this.handleOpen}>
                    {
                        !isEmpty(selectText) ? <div className="text-ellipsis">{selectText}</div> :
                            <div>
                                {this.props.placeholder ?
                                    <span className="text-muted">{this.props.placeholder}</span> : null}
                            </div>
                    }
                    <div className="control-border-color"><Icon name="caret-down" size={14}/></div>
                </div>
                <Popover
                    {...this.props.popoverProps}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    onRequestClose={this.handleRequestClose}
                    style={{
                        width: this.state.anchorEl.offsetWidth
                    }}
                    scaleX={1}
                >
                    {
                        this.state.dataSource.length == 0 ? <div className="menu">
                            <div className="menu-item text-muted">{this.props.noDataTipText}</div>
                        </div> : <Menu
                            className="text-small"
                            popoverOpen={this.state.open}
                            dataSource={this.state.dataSource}
                            dataSourceConfig={this.props.dataSourceConfig}
                            {...this.props.menuProps}
                            onSelect={this.handleSelect}
                            multiple={this.props.multiple}
                            value={this.getValue()}
                        />
                    }
                    {
                        this.props.onCreate && <div>
                            <Divider space={0}/>
                            <div className="menu">
                                <div className="text-primary cursor-pointer ripple flex center middle menu-item"
                                     onClick={this.handleCreate}>
                                    <Icon name="plus"/>
                                    {this.props.createLabel}
                                </div>
                            </div>
                        </div>
                    }
                    {this.props.popoverAppend}
                </Popover>
            </div>
        );
    }

}