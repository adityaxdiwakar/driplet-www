import React, {Component} from "react";
import {Link} from "react-router-dom";
import {APIContext} from "../../components/API";
import {AppContext} from "../../components/App";


export default class Navbar extends Component {
    render() {
        return (
            <div className="header">
                <Link to={"/"}><img alt={"Driplet"} src={"/brand.png"}/></Link>

                <div className={"fg"}/>
                <AppContext.Consumer>{app => (<APIContext.Consumer>{api => (
                    api.authenticated ? <>
                        <div onClick={app.openCreate}>
                            <div className={"nav-add-text"}>Add service</div>
                            <div className={"nav-add"}>+</div>
                        </div>
                        <Link to={"/logout"}>Logout</Link>
                    </> : null
                )}</APIContext.Consumer>)}</AppContext.Consumer>
            </div>
        );
    }
}
