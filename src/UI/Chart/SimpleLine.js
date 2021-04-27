import React from "react";

export default class SimpleLine extends React.Component {

    static defaultProps = {
        strokeStyle: "#7287E8",
        data: {
            datasets: {
                data: []
            }
        }
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.ctx = this.refs.chart.getContext("2d");
        const width = this.props.width * 2;
        const height = this.props.height * 2;
        this.refs.chart.width = width;
        this.refs.chart.height = height;
        this.refs.chart.style = `width:${this.props.width}px;height:${this.props.height}px`;
        this.ctx.strokeStyle = this.props.strokeStyle;
        this.ctx.lineWidth = 5;
        const data = _.get(this.props, "data.datasets.data") || [];
        const min = Math.min(...data);
        const max = Math.max(...data);
        const len = data.length;
        let startPoint, endPoint;
        data.forEach((value, index) => {
            endPoint = [index * width / (len - 1), max === min ? height / 2 : height - (value - min) * height / (max - min)];
            if(startPoint) {
                this.draw(startPoint, endPoint);
            }
            startPoint = endPoint;
        });
    }

    draw(startPoint, endPoint) {
        this.ctx.moveTo(...startPoint);
        this.ctx.lineTo(...endPoint);
        this.ctx.stroke();
    }

    render() {
        return (
            <canvas ref="chart" width={this.props.width} height={this.props.height}></canvas>
        );
    }
}