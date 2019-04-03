import React, {Component} from "react";
import AppPage from "../../components/AppPage";
import Button from "../../containers/partials/Button";
import {APIContext} from "../../components/API";

import "../../css/dashboard.css"


class ServiceCard extends Component {
    render() {
        return (
            <div className={"dash-card"}>
                <div className={"dash-card-icon"} style={{backgroundColor: this.props.color}}>
                    <i className={"fa-fw fas fa-tint"}/>
                </div>
                <div className={"dash-card-body"}>
                    <div className={"dash-card-name"}>{this.props.name}</div>
                    <div className={"dash-card-desc"}>{this.props.desc}</div>
                    <div className={"fg"}/>
                    <div className={"fr"}>
                        <div className={"fg"}/>
                        <Button val={"Go to service"} to={"/@me/services/" + this.props.id}/>
                    </div>
                </div>
            </div>
        )
    }
}


class Loading extends Component {
    render () {
        return (
            <p>Loading</p>
        )
    }
}


export default class Dashboard extends Component {
    constructor(props) {
        super(props);

        //this.createNewPromo = "Integrate your systemd unit or create a new one...";
        this.createNewPromo = "Coming soon..";

        this.state = {
            services_ready: false
        };

        this.api = null;
    }

    componentDidMount() {
        this.api.list_services((data) => {
            this.setState({
                services_ready: true,
            })
        }, () => {})
    }

    genServices() {
        let services = [];
        let n = 0;
        Object.keys(this.api.services).forEach((s) => {
            s = this.api.services[s];
            services.push(
                <ServiceCard key={n} name={s.name} color={s.accent} desc={s.description} id={s.id}/>
            );
            n++;
        });
        return services
    }

    render() {
        return (
            <AppPage><APIContext.Consumer>{api => {this.api = api}}</APIContext.Consumer>
                <div className={"dash-wrap-wrap"}>
                    <div className={"dash-wrap"}>
                        <div className={"dash-head"}>Registered Services</div>
                        <div className={"hr"}/>
                        {this.state.services_ready ?
                        <div className={"dash-list"}>
                            {this.genServices()}
                        </div> : <Loading/>}
                    </div>
                </div>
            </AppPage>
        );
    }
}
