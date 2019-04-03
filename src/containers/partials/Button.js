import React, {Component} from "react";
import {Link} from "react-router-dom";


export default class Button extends Component {
    render() {
        let inner = (
            <div onClick={this.props.locked ? null : this.props.click} className={
                "btn" + (this.props.wide ? " btn-wide" : "") +
                (this.props.secondary ? " btn-secondary" : "") +
                (this.props.col ? " btn-" + this.props.col : "") +
                (this.props.locked ? " btn-locked" : "") +
                (this.props.class ? " " + this.props.class : "")
            }><span>{this.props.val}</span></div>
        );
        if (this.props.to) return (
            <Link to={this.props.to}>{inner}</Link>
        );
        return inner;
    }
}
