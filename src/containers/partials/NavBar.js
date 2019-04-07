import React, {Component} from "react";
import {Link} from "react-router-dom";
import {APIContext} from "../../components/API";
import {AppContext} from "../../components/App";


export default class NavBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdown: false,
        }
    }

    getToken(app, api) {
        return () => {
            app.showDialog({
                title: "Worker Authentication Details",
                body: "You will need these details when setting up the driplet worker. " +
                    "Do not share these with anyone!\n\nUser ID:\n" + api.user.client_id + "\n\nToken:\n"
                    + api.user.token,
                dismissible: true,
                wrap: true,
            })
        }
    }

    toggleNav = () => {
        this.setState({dropdown: !this.state.dropdown});
    };

    hideNav = () => {
        this.setState({dropdown: false});
    };

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
                        <div className={"nav-dd-head"} onClick={this.toggleNav}>{api.user.username}
                            {this.state.dropdown ?
                                <>
                                    <div className={"nav-dd-blackout"} onClick={this.hideNav}/>
                                    <div className={"nav-dd-body"}>
                                        <div className={"nav-dd-i"} onClick={this.getToken(app, api)}>Get Token</div>
                                        <div className={"hr"}/>
                                        <div className={"nav-dd-i"}>Account Settings</div>
                                        <Link to={"/logout"}>
                                            <div className={"nav-dd-i"}>Logout</div>
                                        </Link>
                                    </div>
                                </> : null}
                        </div>
                    </> : null
                )}</APIContext.Consumer>)}</AppContext.Consumer>
            </div>
        );
    }
}
