import React, {Component} from "react";

import Button from "../containers/partials/Button";
import Navbar from "../containers/partials/Navbar";
import {API, APIContext} from "./API";
import Routes from "./Routes";

import "../css/common.css";


export const AppContext = React.createContext({
    clearDialog: null,
    showDialog: null,
});


class Dialog extends Component {
    render() {
        return (
            <AppContext.Consumer>{app => (
                <div className={"overlay-darken"}>
                    <div className={"overlay-dg"}>
                        <div className={"overlay-title"}>{this.props.dialog.title}</div>
                        <div className={"overlay-body"}>{this.props.dialog.body}</div>
                        {this.props.dialog.dismissible ?
                            <div className={"overlay-buttons"}>
                                <Button col={"red"} class={"overlay-btn"} val={"Dismiss"} click={app.clearDialog}/>
                            </div> : null}
                        {this.props.dialog.prompt ?
                            <div className={"overlay-buttons"}>
                                <Button col={"red"} class={"overlay-btn"} val={"Confirm"} click={this.props.dialog.confirm}/>
                                <Button secondary class={"overlay-btn btn-invert"} val={"Cancel"} click={app.clearDialog}/>
                            </div> : null}
                    </div>
                </div>
            )}</AppContext.Consumer>
        );
    }
}

class CreateOverlay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            desc: "",

            start: "",
            restart: "",
            stop: "",
            log: "",
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    close(app) {
        return () => {
            app.closeCreate();
        }
    }

    valid() {
        return (
            this.state.start.length && this.state.name.length && this.state.restart.length &&
            this.state.stop.length && this.state.desc.length && this.state.log.length
        )
    }

    create(api, app) {
        return () => {
            api.create_service(this.state, () => {
                    app.closeCreate();
                    app.showDialog({title: "Create service",
                        body: "Service added", dismissible: true})
                }, () => {
                    app.showDialog({
                        title: "Create service",
                        body: "Something went wrong creating your service",
                        dismissible: true})
                }
            )
        }
    }

    render() {
        return (
            <APIContext.Consumer>{api => (<AppContext.Consumer>{app => (
                <div className={"overlay-darken"}>
                    <div className={"overlay-dg create-overlay"}>
                        <div className={"create-head"}>Create a new service</div>

                        <div className={"cols"}>
                            <div>
                                <label>Name</label>
                                <div className={"input-wrap"}><input name={"name"} type={"text"}
                                                                     value={this.state.name}
                                                                     placeholder={"nginx"}
                                                                     onChange={this.handleChange}/></div>
                                <label>Description</label>
                                <div className={"input-wrap"}><input name={"desc"} type={"text"}
                                                                     value={this.state.desc}
                                                                     placeholder={"A fast web proxy"}
                                                                     onChange={this.handleChange}/></div>
                                <label>Start Command</label>
                                <div className={"input-wrap"}><input name={"start"} type={"text"}
                                                                     value={this.state.start}
                                                                     placeholder={"systemctl start nginx"}
                                                                     onChange={this.handleChange}/></div>
                            </div>
                            <div>
                                <label>Restart Command</label>
                                <div className={"input-wrap"}><input name={"restart"} type={"text"}
                                                                     value={this.state.restart}
                                                                     placeholder={"systemctl restart nginx"}
                                                                     onChange={this.handleChange}/></div>
                                <label>Stop Command</label>
                                <div className={"input-wrap"}><input name={"stop"} type={"text"}
                                                                     value={this.state.stop}
                                                                     placeholder={"systemctl stop nginx"}
                                                                     onChange={this.handleChange}/></div>
                                <label>Log Command</label>
                                <div className={"input-wrap"}><input name={"log"} type={"text"}
                                                                     value={this.state.log}
                                                                     placeholder={"journalctl -u nginx -f"}
                                                                     onChange={this.handleChange}/></div>
                            </div>
                        </div>

                        <div className={"overlay-buttons"}>
                            <Button col={"green"} class={"overlay-btn"} val={"Create"} locked={!this.valid()}
                                    click={this.create(api, app)}/>
                            <Button secondary class={"overlay-btn"} val={"Cancel"} click={this.close(app)}/>
                        </div>
                    </div>
                </div>
            )}</AppContext.Consumer>)}</APIContext.Consumer>
        )
    }
}


class Loading extends Component {
    render() {
        return (
            <div id="app">
                <Navbar/>
            <div className={"loading-wrap"}>
                <div className={"loading-body"}>
                    Welcome back to driplet
                </div>
            </div>
                </div>
        )
    }
}


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialog: null,
            create: false,
        };

        this.funcs = {
            clearDialog: () => {
                this.setState({dialog: null})
            },
            showDialog: dialog => {
                this.setState({dialog: dialog})
            },
            openCreate: () => {
                this.setState({create: true})
            },
            closeCreate: () => {
                this.setState({create: false})
            },
        }
    }

    render() {
        return (
            <API><APIContext.Consumer>{api => (
                api.ready ?
                    <AppContext.Provider value={this.funcs}>
                        <div id="app">
                            <Navbar/>
                            <Routes/>
                            {this.state.dialog ? <Dialog dialog={this.state.dialog}/> : null}
                            {this.state.create ? <CreateOverlay/> : null}
                        </div>
                    </AppContext.Provider> : <Loading/>
            )}</APIContext.Consumer></API>
        );
    }
}
