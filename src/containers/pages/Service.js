import React, {Component} from "react";
import {Link, Redirect} from "react-router-dom";
import ReactDOM from 'react-dom';

import Button from "../../containers/partials/Button";
import {AppContext} from "../../components/App";
import {APIContext} from "../../components/API";
import AppPage from "../../components/AppPage";

import "../../css/service.css"


class SBLink extends Component {
    render() {
        return (
            <Link to={this.props.href}>
                <div className={"service-sb-link"}>{this.props.name}</div>
            </Link>
        )
    }
}


class Sidebar extends Component {
    componentDidMount() {
        this.props.api.ensureServices()
    }

    render() {
        let services = [];
        let n = 0;
        Object.keys(this.props.api.services).forEach((s) => {
            s = this.props.api.services[s];
            services.push(
                <SBLink key={n} href={s.id} name={s.name}/>
            );
            n++;
        });

        return (
            <div className={"service-sidebar"}>
                <div className={"service-sb-head"}>Site Links</div>
                <div className={"hr"}/>
                <SBLink href={"/@me"} name={"Dashboard"}/>
                <br/>

                <div className={"service-sb-head"}>Active Services</div>
                <div className={"hr"}/>
                {services}
            </div>
        )
    }
}


class Console extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: "/"
        };
        this.loadings = [
            "/", "-", "\\", "|"
        ]
    }

    componentDidMount() {
        this.interval = setInterval(() => this.setState({
            loading: this.loadings[(this.loadings.indexOf(this.state.loading) + 1) % this.loadings.length]
        }), 250);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(nextProps, nextState, nextContext) {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        let consoleDOM = this.refs.console;
        let scrollHeight = consoleDOM.scrollHeight;
        let height = consoleDOM.clientHeight;
        let maxScrollTop = scrollHeight - height;
        ReactDOM.findDOMNode(consoleDOM).scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    };

    render() {
        return (
            <div ref={"console"} className={"service-console"}>
                {this.props.ready ? this.props.content : null}
                <div className={"service-console-loading"} style={{opacity: this.props.ready ? 0 : 0.5}}>
                    Connecting to Driplet [{this.state.loading}]
                </div>
            </div>
        )
    }
}


export default class Service extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            ready2: false,
            name: "",
            desc: "",
            go_back: false,
        };
        this.api = null;
        this.service_id = null;
    }

    startService(app) {
        return () => {
            app.showDialog({
                title: "Starting service",
                body: "Waiting for service to start...",
                dismissible: false,
            });

            this.api.start_service(this.service_id, () => {
                app.showDialog({
                    title: "Starting service",
                    body: "Service started!",
                    dismissible: true,
                });
            }, () => {
                app.showDialog({
                    title: "Starting service",
                    body: "Failed to start service.",
                    dismissible: true,
                });
            })
        }
    }

    restartService(app) {
        return () => {
            app.showDialog({
                title: "Restarting service",
                body: "Waiting for service to restart...",
                dismissible: false,
            });

            this.api.restart_service(this.service_id, () => {
                app.showDialog({
                    title: "Restarting service",
                    body: "Service restarted!",
                    dismissible: true,
                });
            }, () => {
                app.showDialog({
                    title: "Restarting service",
                    body: "Failed to restart service.",
                    dismissible: true,
                });
            })
        }
    }

    stopService(app) {
        return () => {
            app.showDialog({
                title: "Stopping service",
                body: "Waiting for service to stop...",
                dismissible: false,
            });

            this.api.restart_service(this.service_id, () => {
                app.showDialog({
                    title: "Stopping service",
                    body: "Service stopped!",
                    dismissible: true,
                });
            }, () => {
                app.showDialog({
                    title: "Stopping service",
                    body: "Failed to stop service.",
                    dismissible: true,
                });
            })
        }
    }

    componentDidMount() {
        this.service_id = this.props.routeProps.match.params.serviceID;
        this.api.service_details(this.service_id, (data) => {
            this.setState({
                name: data.name,
                desc: data.description,
                ready2: true,
            })
        }, () => {
        });
        this.api.bind_websocket(this.service_id, () => {
            this.setState({ready: true})
        });
    }

    registerApi(api) {
        this.api = api;
    }

    remove(app) {
        return () => {
            app.showDialog({
                title: "Delete service",
                bodyPre: "Type \"",
                bodyPost: "\" to delete the service",
                typeToConfirm: this.state.name,
                confirm: () => {
                    this.api.delete_service(
                        this.service_id,
                        () => {
                            this.api.list_services(() => {}, () => {});
                            app.showDialog({
                                title: "Delete service",
                                body: "Service \"" + this.state.name + "\" deleted",
                                dismissible: true
                            });
                            this.setState({go_back: true});
                        }, () => {
                            app.showDialog({
                                title: "Delete service",
                                body: "Failed to delete service \"" + this.state.name + "\"",
                                dismissible: true
                            });
                        }
                    );
                    app.clearDialog();
                }
            });
        }
    }

    render() {
        if (this.state.go_back)
                return <Redirect to={'/'}/>;

        return (
            <APIContext.Consumer>{api => <AppContext.Consumer>{app => <AppPage>
                {this.registerApi(api)}
                <div className={"service-wrap"}>
                    <Sidebar api={api}/>
                    <div className={"service-body"}>
                        {(this.state.name || this.state.desc) ? <>
                            <div className={"service-name"}>{this.state.name}
                                <i className={"far fa-trash-alt service-del"}
                                   onClick={this.remove(app)}/></div>
                            <div className={"service-desc"}>{this.state.desc}</div>
                            <div className={"hr"}/>
                        </> : null}
                        <Console ready={this.state.ready && this.state.ready2} content={api.console_trace}/>

                        <div className={"service-controls"}>
                            <Button wide locked={!this.state.ready || !this.state.ready2}
                                    click={this.stopService(app)} col={"red"}
                                    val={"Stop"}/>
                            <Button wide locked={!this.state.ready || !this.state.ready2}
                                    click={this.restartService(app)} col={"orange"}
                                    val={"Restart"}/>
                            <Button wide locked={!this.state.ready || !this.state.ready2}
                                    click={this.startService(app)} col={"green"}
                                    val={"Start"}/>
                        </div>
                    </div>
                </div>
            </AppPage>}</AppContext.Consumer>}</APIContext.Consumer>
        );
    }
}
