import React, {Component} from 'react';
import Text from './Text';
import Popover from "./Popover";
import Menu from "./Menu";
import {
    call, forEach,
    getControlValue,
    getDataFromDataSourceByValue, getDataSource,
    getFilterDataSource, isEmpty,
    joinBlankSpace,
    replaceText
} from "../lib/tool";
import Icon from "./Icon";
import Divider from "./Divider";

export default class Auto extends Component {

    static defaultProps = {
        dataSource: [],
        dataSourceConfig: {text: 'text', value: 'value'},
        filter: undefined,
        forceSelect: true,                  //强制从数据源选择
        onCreate: undefined,                
        createLabel: undefined,
        updateDataSource: false,            //输入内容是否更新数据源
        defaultValue: undefined,            //默认值
        value: undefined,                   //有传值时为受控组件
    };

    state = {
        open: false,
        anchorEl: {},
        openType: 'focus',  //focus,pullDown
        dataSource: [],
        filterText: '',
        value: undefined
    };

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.text = React.createRef();
        if(!props.forceSelect && !isEmpty(props.value)) {
            this.state.filterText = props.value;
        }
        this.loadDataSource().then((dataSource) => {
            this.state.dataSource = dataSource;
            if(!isEmpty(this.props.value) && this.props.forceSelect) {
                const data = this.getRowDataByValue(this.props.value);
                if(data) {
                    this.state.filterText = this.getFilterText(data);
                }
            }
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
        let filterText = this.state.filterText;
        const dataSource = await getDataSource({...this.props, filterText});
        return dataSource;
    }

    focus() {
        if (this.text && this.text.current) {
            this.text.current.focus();
        }
    }

    /**
     * 获取焦点时，打开选项
     * @param event
     */
    handleFocus = (event) => {
        this.setState({
            openType: 'focus',
            open: true,
            anchorEl: this.ref.current
        });
    };

    /**
     * 输入文本变化
     * @param value
     */
    handleInputChange = ({value}) => {
        this.setState({filterText: value}, async () => {
            if (this.props.updateDataSource && _.isFunction(this.props.dataSource)) {
                const dataSource = await this.loadDataSource();
                this.setState({dataSource});
            }
        });
    };

    /**
     * 下拉展示所有选项
     * @param event
     */
    handlePullDown = (event) => {
        event.stopPropagation();
        this.setState({
            openType: 'pullDown',
            open: true,
            anchorEl: this.ref.current
        });
    };

    /**
     * 收起选项
     * @param event
     */
    handleClose = (event) => {
        this.setState({open: false});
    };

    onRequestClose = (event) => {
        if (this.props.forceSelect) {
            if (this.state.filterText === '') {
                this.setValue("");
            } else {
                const value = this.getValue();
                const data = this.getRowDataByValue(value);
                this.setState({filterText: data ? this.getFilterText(data) : ""});
            }
        } else {
            this.setValue(this.state.filterText);
        }
        this.handleClose(event);
    };

    /**
     * 选择选项
     * @param value
     * @param data
     * @returns {Function}
     */
    handleSelect = ({value, data, event}) => {
        event.stopPropagation();
        this.handleClose(event);
        this.setValue(value);
    };

    handleCreate = (event) => {
        this.onRequestClose(event);
        call(this.props.onCreate);
    };

    /**
     * 过滤器
     * @param data
     * @param filterText
     * @returns {*}
     */
    filter = (data, filterText) => {
        if (this.props.filter) {
            return this.props.filter(data, filterText);
        }
        let text = this.getFilterText(data);
        return filterText === '' ? true : text.toString().indexOf(filterText) >= 0;
    };

    getDataSource() {
        if (this.state.openType === 'pullDown') {
            return this.state.dataSource;
        }
        return getFilterDataSource(this.state.filterText, this.state.dataSource, this.props.dataSourceConfig, this.filter);
    }

    getStyle() {
        let style = {...this.props.style};
        if (this.state.open) {
            style.position = 'relative';
            style.zIndex = _.get(this.props, 'popoverProps.zIndex', 1000);
        }
        return style;
    }

    getCurrentText(dataSource = this.state.dataSource) {
        const value = this.getValue();
        let index = dataSource.indexOf(value);
        if (index >= 0) {
            return dataSource[index];
        }
        let data = getDataFromDataSourceByValue(this.getValue(), dataSource, this.props.dataSourceConfig);
        return data ? this.getRowText(data) : (!this.props.forceSelect ? value : '');
    }

    getFilterText(data) {
        if (!_.isObject(data)) {
            return data;
        }
        return replaceText(data, this.props.dataSourceConfig.text);
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


    getValue() {
        return getControlValue(this);
    }

    setValue(value) {
        if(isEmpty(value)) {
            this.setState({filterText: "", value: value});
            call(this.props.onChange, {value});
        } else {
            if(this.props.forceSelect) {
                const data = this.getRowDataByValue(value);
                if(data) {
                    const filterText = this.getFilterText(data);
                    this.setState({filterText: filterText, value: value});
                    call(this.props.onChange, {value});
                }
            } else {
                this.setState({filterText: value, value: value});
                call(this.props.onChange, {value});
            }
        }
    }

    render() {
        return (
            <div ref={this.ref}>
                <div className={joinBlankSpace("flex middle between form-control", this.props.className)}
                     style={this.getStyle()} onClick={() => this.focus()}>
                    <Text ref={this.text}
                          className="clear-style"
                          onFocus={this.handleFocus}
                          value={this.state.filterText}
                          onChange={this.handleInputChange}
                          placeholder={this.props.placeholder}
                    />
                    <div className="control-border-color ripple cursor-pointer" onClick={this.handlePullDown}>
                        <Icon name="caret-down" size={14}/>
                    </div>
                </div>
                <Popover
                    {...this.props.popoverProps}
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    style={{
                        width: _.get(this.state.anchorEl, "offsetWidth")
                    }}
                    onRequestClose={this.onRequestClose}
                    scaleX={1}>
                    {
                        this.state.dataSource.length == 0 ? <div className="menu">
                            <div className="menu-item text-muted">没有数据</div>
                        </div> : <Menu
                            {...this.props.menuProps}
                            dataSource={this.getDataSource()}
                            dataSourceConfig={this.props.dataSourceConfig}
                            onSelect={this.handleSelect}
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