import {Redirect} from "react-router-dom";
import React, {Component} from "react";
import queryString from "query-string";

import Button from "../../containers/partials/Button";
import {APIContext} from "../../components/API";
import {AppContext} from "../../components/App";
import AppPage from "../../components/AppPage";

import "../../css/auth.css"


export class Reset extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            password2: "",

            lock: false,
            error: "",
            redirect: false,

            key: null,
            client_id: null,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        const values = queryString.parse(this.props.location.search);
        console.warn(values);
        this.setState({key: values[''], client_id: values.user});
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    valid() {
        if (this.state.password !== this.state.password2)
            return false;
        return this.state.password.length;
    }

    reset(api) {
        return () => {
            this.setState({lock: true});
            api.reset({
                key: this.state.key,
                password: this.state.password,
                client_id: this.state.client_id,
            }, (data) => {
                this.setState({
                    redirect: true
                });
            }, (data) => {
                this.setState({
                    lock: false,
                    error: data.message
                })
            })
        }
    }

    render() {
        if (!this.state.key || !this.state.client_id || this.state.redirect) return <Redirect to={"/login"}/>;

        let valid = this.valid();
        return (
            <AppPage><APIContext.Consumer>{api =>
                <div className={"auth-wrap"}>
                    <div className={"auth-modal"}>
                        <form className={"auth-modal-body"}>
                            <label>Password</label>
                            <div className={"input-wrap"}><input name={"password"} type={"password"}
                                                                 value={this.state.password}
                                                                 autoComplete={"newpassword"}
                                                                 onChange={this.handleChange} placeholder={"Password"}
                                                                 disabled={this.state.lock}/></div>

                            <label>Repeat Password</label>
                            <div className={"input-wrap"}><input name={"password2"} type={"password"}
                                                                 value={this.state.password2}
                                                                 autoComplete={"newpassword"}
                                                                 onChange={this.handleChange}
                                                                 placeholder={"Repeat Password"}
                                                                 disabled={this.state.lock}/></div>

                            <div className={"auth-error"}>{this.state.error}</div>

                            <Button locked={this.state.lock || (!valid)}
                                    click={this.reset(api)} val={"Reset Password"}/>
                        </form>
                    </div>
                </div>
            }</APIContext.Consumer></AppPage>
        );
    }
}


export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            password2: "",
            email: "",

            register: false,
            forgot: false,
            lock: false,
            error: "",
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
        this.validate();
    }

    showForgot = () => {
        this.setState({forgot: true});
    }

    validate() {
        if (this.state.register) {
            if (this.state.password !== this.state.password2) {
                this.setState({error: "Passwords must match"});
            } else {
                this.setState({error: ""});
            }
        }
    }

    valid() {
        if (this.state.register) {
            if (this.state.password !== this.state.password2)
                return false;

            return this.state.username.length && this.state.password.length && this.state.email.length;
        }
        return this.state.username.length && (this.state.forgot || this.state.password.length);
    }

    login(api) {
        return () => {
            if (this.state.register || this.state.forgot) {
                return this.setState({register: false, forgot: false});
            }

            this.setState({lock: true});
            api.login({
                username: this.state.username,
                password: this.state.password,
            }, (data) => {

            }, (data) => {
                this.setState({
                    lock: false,
                    error: data.message
                })
            })
        }
    }

    register(api) {
        return () => {
            if (!this.state.register) {
                return this.setState({register: true});
            }

            this.setState({lock: true});
            api.register({
                username: this.state.username,
                email: this.state.email,
                password: this.state.password,
            }, (data) => {
            }, (data) => {
                this.setState({
                    lock: false,
                    error: data.message
                })
            })
        }
    }

    forgot(app, api) {
        return () => {
            if (!this.state.username) {
                let message = "Please enter your username first.";
                return app.showDialog({title: "Password reset", body: message, dismissible: true});
            }

            api.request_reset({
                username: this.state.username,
            }, (data) => {
                let message = "If this account exists, you will have been sent an email to the address linked to you account.\n"
                message += "Please follow the instructions in there to continue the password reset.\n\n";
                message += "(Make sure to check your spam folder)";
                app.showDialog({title: "Password reset", body: message, dismissible: true});
            }, (data) => {
                let message = "Something went wrong requesting a password reset:\n";
                message += data.message;
                app.showDialog({title: "Password reset", body: message, dismissible: true});
            });
        }
    }

    render() {
        let valid = this.valid();
        return (
            <AppPage><APIContext.Consumer>{api =>
                <div className={"auth-wrap"}>
                    <div className={"auth-modal"}>
                        <form className={"auth-modal-body"}>
                            {this.state.forgot ? <>
                                <label>Username or Email</label>
                                <div className={"input-wrap"}><input name={"username"} type={"text"}
                                                                     value={this.state.username}
                                                                     autoComplete={"username"}
                                                                     onChange={this.handleChange}
                                                                     placeholder={"Username or Email"}
                                                                     disabled={this.state.lock}/></div>
                            </> : <>
                                <label>Username</label>
                                <div className={"input-wrap"}><input name={"username"} type={"text"}
                                                                     value={this.state.username}
                                                                     autoComplete={"username"}
                                                                     onChange={this.handleChange} placeholder={"Username"}
                                                                     disabled={this.state.lock}/></div>
                                <label>Password</label>
                                <div className={"input-wrap"}><input name={"password"} type={"password"}
                                                                     value={this.state.password}
                                                                     autoComplete={this.state.register ?
                                                                        "newpassword" : "current-password"}
                                                                     onChange={this.handleChange} placeholder={"Password"}
                                                                     disabled={this.state.lock}/></div>

                                {this.state.register ? <>
                                    <label>Repeat Password</label>
                                    <div className={"input-wrap"}><input name={"password2"} type={"password"}
                                                                         value={this.state.password2}
                                                                         autoComplete={"newpassword"}
                                                                         onChange={this.handleChange}
                                                                         placeholder={"Repeat Password"}
                                                                         disabled={this.state.lock}/></div>
                                    <label>Email</label>
                                    <div className={"input-wrap"}><input name={"email"} type={"email"}
                                                                         value={this.state.email}
                                                                         onChange={this.handleChange} placeholder={"Email"}
                                                                         disabled={this.state.lock}/></div>
                                </> : null}
                            </>}

                            <div className={"auth-error"}>{this.state.error}</div>

                            {(!this.state.forgot && !this.state.register) ?
                                <div className={"auth-forgot"} onClick={this.showForgot}>I forgot my password</div>
                                : null}

                            {this.state.forgot ? <>
                                <Button secondary locked={this.state.lock}
                                        click={this.login(api)} val={"Login"}/>

                                <AppContext.Consumer>{app => (
                                    <Button locked={this.state.lock || !valid}
                                            click={this.forgot(app, api)} val={"Request Reset"}/>
                                )}</AppContext.Consumer>
                            </> : <>
                                <Button secondary={!this.state.register}
                                        locked={this.state.lock || (!valid && this.state.register)}
                                        click={this.register(api)} val={"Register"}/>
                                <Button secondary={this.state.register}
                                        locked={this.state.lock || (!valid && !this.state.register)}
                                        click={this.login(api)} val={"Login"}/>
                            </>}
                        </form>
                    </div>
                </div>
            }</APIContext.Consumer></AppPage>
        );
    }
}
