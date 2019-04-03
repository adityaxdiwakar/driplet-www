import React, {Component} from "react";
import {Switch, Route, Redirect} from "react-router-dom";

import Dashboard from "../containers/pages/Dashboard";
import NotFound from "../containers/pages/NotFound";
import Service from "../containers/pages/Service";
import {Login} from "../containers/pages/Auth";
import {APIContext} from "./API";


function checkAuth(C, api, needed = true) {
    return (props) => {
        return (
            (needed ^ api.authenticated) ? (
                <Redirect to={needed ? "/login" : "/"}/>
            ) : (
                <C routeProps={props} key={props.match.params.serviceID}/>
            )
        )
    }
}


class LogoutPage extends Component {
    componentWillMount() {
        this.props.api.logout()
    }

    render() {
        return <Redirect to="/@me"/>
    }
}

export default () =>
    <APIContext.Consumer>{api =>
        <Switch>
            <Route path="/" exact component={() => <Redirect to={"/@me"}/>}/>
            <Route path="/@me" exact render={checkAuth(Dashboard, api)}/>

            <Route path="/@me/services/:serviceID" exact render={checkAuth(Service, api)}/>

            <Route path="/login" exact component={checkAuth(Login, api, false)}/>
            <Route path="/logout" exact render={() => <LogoutPage api={api}/>}/>

            <Route component={NotFound}/>
        </Switch>
    }</APIContext.Consumer>
