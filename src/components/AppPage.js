import {Component} from "react";


export default class AppPage extends Component {
    render() {
        /*
        return (
            <APIContext.Consumer>{api => <>
                {this.props.children}
            </>}</APIContext.Consumer>
        );
        */
        return this.props.children;
    }
}
