import React,{Component} from "react";
import Popover from "./Popover";
import Icon from "./Icon";
import Form from "./Form";
import Button from "./Button";

export default class Filter extends Component {

    static defaultProps = {
        label: '查询',
        scene: 'filter',
        model: undefined,
        width: 360,
        height: 'auto',
        initialData: {},
        rows: undefined,

    };

    state = {
        open: false,
        anchorEl: {},
        showHiddenFields: false,
    };

    constructor(props) {
        super(props);
        this.form = React.createRef();
    }

    handleOpen = event => {
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = event => {
        this.setState({ open: false });
    };

    handleSubmit = ({data, form}) => {

    };

    handleReset = ({form}) => {
        console.log(form);
    };

    hasFilterData(data) {
        for(let value of Object.values(data)) {
            if(_.isObject(value)) {
                if(this.hasFilterData(value)) {
                    return true;
                }
            }
            if (value !== null && value !== undefined) {
                return true;
            }
        }
        return false;
    }

    render() {
        const hasFilterData = this.hasFilterData(this.props.initialData);
        return (
            <div>
                <div className={"flex middle"} style={{lineHeight: 1}}>
                    <div className="flex middle cursor-pointer" onClick={this.handleOpen}>
                        {hasFilterData ? <Icon name="ys-filter text-primary" size={16}/> : <Icon name="ys-filter" size={16}/>}
                        <div>过滤</div>
                    </div>
                    {
                        hasFilterData && <div className="flex middle" style={{marginLeft: 4}}>
                            <div className="text-default" style={{marginRight: 4}}>
                                共{this.props.rows}条记录
                            </div>
                            <Icon name="close-circle text-error" size={16} onClick={(event) => {
                                event.stopPropagation();
                                this.handleReset({form: this.form.current});
                            }}/>
                        </div>
                    }
                </div>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    onRequestClose={this.handleRequestClose}
                    {...this.props.popoverProps}
                >
                    <Form
                        style={{width: this.props.width}}
                        ref={this.form}
                        inline={false}
                        initialData={this.props.initialData}
                        onSubmit={this.handleSubmit}
                        onReset={this.handleReset}>
                        <div className="space">
                            {this.props.children}
                            <div className="text-right" style={{marginTop: 12}}>
                                <Button className="btn-default" type="reset" style={{marginRight: 12}}>重置</Button>
                                <Button className="btn-primary" type="submit">查询</Button>
                            </div>
                        </div>
                    </Form>
                </Popover>
            </div>
        );
    }

}