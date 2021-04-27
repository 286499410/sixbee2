import React, {Component} from 'react';
import Chart from "chart.js";

export default class ChartPie extends Component {

    static defaultProps = {
        data: {},
        options: {}
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.Chart = new Chart(this.refs.chart.getContext("2d"), {
            type: "pie",
            data: this.props.data,
            options: this.props.options
        });
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