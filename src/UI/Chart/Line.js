import React, {Component} from 'react';
import Chart from "chart.js/auto";

export default class ChartLine extends Component {

    static defaultProps = {
        data: {},
        options: {}
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const ctx = this.refs.chart.getContext("2d");
        const {data, options, type = "line"} = this.props;
        this.Chart = new Chart(ctx, {type, data, options});
    }

    getChart() {
        return this.Chart;
    }

    render() {
        return (
            <canvas ref="chart" width={this.props.width} height={this.props.height}></canvas>
        );
    }

}