import React, {Component} from 'react';
import Icon from './Icon';
import {call, joinBlankSpace} from "../lib/tool";

export default class Pager extends Component {

    static defaultProps = {
        eachPageRows: [10, 20, 50, 100, 500, 1000, 5000, 10000],
        page: 1,
        limit: 20,
        rows: 0,
        onChange: undefined,
        showEachPageRows: true,
        showPageInput: true,
    };

    state = {
        value: undefined,
        page: undefined,
        limit: undefined
    };

    constructor(props = {}) {
        super(props);
        this.initData(props);
    }

    componentWillReceiveProps(nextProps) {
        this.initData(nextProps);
    }

    initData(props) {
        if (props.page !== undefined) {
            this.state.page = props.page;
        }
        if (props.limit !== undefined) {
            this.state.limit = props.limit;
        }
    }

    handleChange = ({page, limit}) => {
        page = parseInt(page || this.getPage());
        limit = parseInt(limit || this.getLimit());
        if (page > 0 && page <= this.getPages()) {
            this.setState({value: page, page, limit});
            call(this.props.onChange, {page, limit});
        }
    };

    getPage() {
        return parseInt(this.state.page || this.props.page);
    }

    getLimit() {
        return parseInt(this.state.limit || this.props.limit);
    }

    /**
     * 下一页
     */
    nextPage = () => {
        this.handleChange({page: this.getPage() + 1});
    };

    /**
     * 上一页
     */
    prevPage = () => {
        this.handleChange({page: this.getPage() - 1});
    };

    /**
     * 首页
     */
    firstPage = () => {
        this.handleChange({page: 1});
    };

    /**
     * 最后一页
     */
    lastPage = () => {
        this.handleChange({page: this.getPages()});
    };

    /**
     * 修改每页条数
     * @param event
     */
    handleSelectChange = (event) => {
        let value = event.target.value;
        this.handleChange({page: 1, limit: value});
    };

    /**
     * 输入页数，失去焦点触发
     * @param event
     */
    handleBlur = (event) => {
        let value = event.target.value;
        if (value != this.state.page) {
            this.handleChange({page: value});
        }
    };

    handleInputChange = (event) => {
        let value = event.target.value;
        this.setState({value: value});
    };

    getPages() {
        return this.props.pages === undefined ? Math.ceil(this.props.rows / this.props.limit) : this.props.pages;
    }

    handleNumberClick = (page) => (event) => {
        if(page != this.state.page) {
            this.handleChange({page});
        }
    };

    renderPages() {
        const currentPage = this.getPage();
        const pages = this.getPages();
        let numbers = [];
        let i = -2, addNum = 0;
        while(addNum < 4 && currentPage + i < pages) {
            if(currentPage + i > 1 && currentPage + i < pages) {
                numbers.push(currentPage + i);
                addNum++;
            }
            i++;
        }
        const minNumber = Math.min(...numbers);
        const maxNumber = Math.max(...numbers);
        return <div className="flex middle">
            <div className={joinBlankSpace("page-number", currentPage == 1 && "active")} onClick={this.handleNumberClick(1)}>1</div>
            {numbers.length > 0 && minNumber - 1 > 1 && <div className="margin-space-x-small">...</div>}
            {numbers.map(num => <div key={num} className={joinBlankSpace("page-number", currentPage == num && "active")} onClick={this.handleNumberClick(num)}>{num}</div>)}
            {numbers.length > 0 && maxNumber + 1 < pages && <div className="margin-space-x-small">...</div>}
            {
                pages > 1 && <div className={joinBlankSpace("page-number", currentPage == pages && "active")} onClick={this.handleNumberClick(pages)}>{pages}</div>
            }
        </div>
    }

    render() {
        const page = this.getPage();
        const pages = this.getPages();
        const limit = this.getLimit();
        let value = this.state.value || page;
        return (
            <div className="page flex middle">
                <div className="page-rows margin-space-x-small">共{this.props.rows}条记录</div>
                <Icon type="button"
                      size={12}
                      name="ys-left"
                      className="icon-left"
                      disabled={page == 1}
                      onClick={this.prevPage}
                      title="上一页"/>
                {this.renderPages()}
                <Icon type="button"
                      size={12}
                      name="ys-right"
                      className="icon-right"
                      disabled={page == pages}
                      onClick={this.nextPage}
                      title="下一页"/>
                {
                    this.props.showPageInput && <div className="margin-space-x-small">
                        跳至
                        <input value={value}
                               className="text-center form-control-order margin-space-x-small"
                               style={{width: 30, height: 20}}
                               onBlur={this.handleBlur}
                               onChange={this.handleInputChange}/>
                        页
                    </div>
                }
                {
                    this.props.showEachPageRows && <React.Fragment>
                        <div className="margin-space-x-small">每页显示</div>
                        <div className="relative margin-space-x-small">
                            <select className="text-small clear-style bordered"
                                    style={{padding: 2, borderRadius: 3, paddingRight: 12}}
                                    onChange={this.handleSelectChange}
                                    defaultValue={limit}>
                                {this.props.eachPageRows.map((limit, key) => {
                                    return <option key={key} value={limit}>{limit}</option>
                                })}
                            </select>
                            <Icon size={12} name="down"
                                  style={{position: "absolute", right: 2, top: 4, transform: "scale(0.8)"}}/>
                        </div>
                        <div className="margin-space-x-small">行</div>
                    </React.Fragment>
                }
            </div>
        )
    }
}
