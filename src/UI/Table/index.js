import React, {Component} from 'react';
import PropTypes from "prop-types";
import Header from './Header';
import Body from './Body';
import Footer from "./Footer";
import $ from "jquery";
import {call, forEach, joinBlankSpace} from "../../lib/tool";
import Listener from "../../lib/listener";
import Pager from "./Pager";
import Loading from "../Loading";

export default class Table extends Component {

    static childContextTypes = {
        Table: PropTypes.object,
    };

    static defaultProps = {
        virtual: false,             //长列表虚拟化展示
        bordered: true,             //显示边框
        condensed: false,           //是否紧凑
        striped: true,              //是否有条纹
        isContentEditable: false,   //内容是否可编辑

        emptyDataTip: '没有找到相关数据',         //空数据时提示的文本内容
        emptyDataImage: '/image/nodata.png',    //空数据展示的图片
        hasHeader: true,                        //是否有表头
        columns: [],                            //字段定义
        dataSource: [],                         //数据源
        primaryKey: "id",                       //主键
        showCheckboxes: false,                  //是否显示复选框
        pager: {},                           //页码配置
        fixedCheckbox: true,                    //固定选择框
        fixedLeftCols: 0,                       //左边固定列数，不包含复选框
        fixedRightCols: 0,                      //右边固定列数

        checked: {},                            //选中行
        scrollLeft: 0,                          //当前滚动条位置
        scrollTop: 0,                           //当前滚动条位置
        checkboxColumnWidth: 50,                //复选框列的宽度
        containerWidth: 0,                      //表格容器宽度
        columnWidths: {},                       //列宽度
        resize: true,                           //是否允许更改列宽度
        onStateChange: undefined,               //state更改触发事件
        bodyHeight: undefined,                  //内容高度,
        bodyRowHeight: 32,                      //行高, 只支持4的倍数，最小20，最大52
        footerData: undefined,
        loading: false
    };

    state = {
        scrollLeft: 0,
        ScrollTop: 0,
        containerWidth: 0,
        columnWidths: {}
    };

    constructor(props) {
        super(props);
        this.listener = new Listener();
    }

    componentDidMount() {
        if (this.refs.container) {
            let state = this.state;
            $(this.refs.container).find(".table-header th").each(function () {
                const key = $(this).attr("col-key");
                if (key) {
                    state.columnWidths[key] = $(this).outerWidth(); //实际宽度
                }
            });
            this.state.containerWidth = $(this.refs.container).outerWidth();
        }
        this.state.checkboxColumnWidth = this.props.checkboxColumnWidth;
    }


    getChildContext() {
        return {
            Table: this,
        }
    }

    /**
     * 列字段探测
     * @param columns
     * @param parent
     * @param level
     * @returns {number}
     */
    detect(columns, parent = undefined, level = 0) {
        let colSpan = 0;
        columns.map((column) => {
            if (column.filter) {
                this.state.filter[column.key] = column.filter;
            }
            column.parent = parent;
            if (!this.state.headerColumns[level]) {
                this.state.headerColumns[level] = [];
            }
            this.state.headerColumns[level].push(column);
            if (column.children && column.children.length > 0) {
                column.colSpan = this.detect(column.children, column, level + 1);
                colSpan += column.colSpan;
            } else {
                if (_.isArray(column.key)) {
                    column.colSpan = column.key.length;
                    this.state.dataColumns = this.state.dataColumns.concat(column);
                } else {
                    column.colSpan = 1;
                    this.state.dataColumns.push(column);
                }
                colSpan += column.colSpan;
            }
        });
        return colSpan;
    };

    setState(state, forceUpdate = true) {
        Object.assign(this.state, state);
        if (this.props.onStateChange) {
            this.props.onStateChange(this.state);
        }
        if (forceUpdate) {
            this.forceUpdate();
        }
    }

    /**
     * 设置选中项
     * @param checked
     */
    setChecked(checked) {
        this.setState({checked});
    }

    /**
     * 是否全选
     */
    isAllChecked() {
        const checkedLength = Object.values(this.state.checked).length;
        return this.props.dataSource.length > 0 && this.props.dataSource.length === checkedLength;
    }

    /**
     * 列字段探测
     * @param columns
     * @param parent
     * @param level
     * @returns {Array}
     */
    getColumns() {
        let headerColumns = [], dataColumns = [];
        const detect = (originColumns, parent = undefined, level = 0) => {
            if (!headerColumns[level]) headerColumns[level] = [];
            originColumns.forEach((col) => {
                headerColumns[level].push(col);
                if (_.isArray(col.children) && col.children.length > 0) {
                    detect(col.children, col, level + 1);
                    col.colSpan = col.children.reduce((total, item) => total + item.colSpan, 0);
                } else {
                    col.colSpan = 1;
                    dataColumns.push(col);
                }
            });
        };
        detect(this.props.columns);
        const columnWidths = this.getColumnWidths();
        if (columnWidths._extra > 0 && _.findIndex(headerColumns[0], {key: "_extra"}) < 0) {
            headerColumns[0].push({
                label: "",
                key: "_extra",
                width: columnWidths._extra
            })
        }
        return {headerColumns, dataColumns};
    };

    /**
     * 列宽度
     * @returns {{width?: *, key: *}}
     */
    getColumnWidths() {
        let columnWidths = {};
        forEach(this.props.columns, (col) => {
            if (col.width) {
                columnWidths[col.key] = col.width;
            }
        });
        return _.merge({_extra: 0}, columnWidths, this.state.columnWidths);
    }

    /**
     * 表格宽度
     * @returns {*}
     */
    getTableWidth(props = this.props) {
        let columnWidths = _.cloneDeep(this.getColumnWidths());
        Object.keys(this.getColumnWidths()).forEach(key => {
            if (_.findIndex(props.columns, {key}) < 0) {
                delete columnWidths[key];
            }
        });
        let tableWidth = Object.values(columnWidths).reduce((total, num) => total + num, 0);
        if (this.props.showCheckboxes) tableWidth += this.props.checkboxColumnWidth;
        return tableWidth;
    }

    initializeScroll = _.once(({scrollLeft, scrollTop}) => {
        if (scrollLeft === scrollTop && scrollTop === 9) {
            scrollLeft = scrollTop = 0;
        }
        ;
        return [scrollLeft, scrollTop];
    });

    handleScroll = (event) => {
        let scrollTop = $(event.target).scrollTop();
        let scrollLeft = $(event.target).scrollLeft();
        if (scrollLeft === scrollTop && scrollTop === 9) {
            [scrollLeft, scrollTop] = this.initializeScroll({scrollLeft, scrollTop});
        }

        if (this.state.scrollLeft !== scrollLeft) {
            this.state.scrollLeft = scrollLeft;
            this.listener.publish("scrollLeftChange", {scrollLeft})
        }
        if (this.state.scrollTop !== scrollTop) {
            this.state.scrollTop = scrollTop;
            this.listener.publish("scrollTopChange", {scrollTop})
        }
        call(this.props.onScroll, event);
    };

    handlePageChange = (data) => {
        call(this.props.onPageChange, data);
    };

    render() {
        return (
            <React.Fragment>
                <div ref="container"
                     className={joinBlankSpace("table-container", this.props.className, this.props.bordered && "bordered")}
                     style={this.props.style}>
                    {
                        this.props.hasHeader && <Header/>
                    }
                    <Body onScroll={this.handleScroll}/>
                    {
                        this.props.footerData &&  <Footer/>
                    }
                    <Loading open={this.props.loading}/>
                </div>
                {this.props.pager && <Pager onChange={this.handlePageChange}/>}
            </React.Fragment>
        );
    }

}