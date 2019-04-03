import React, {Component} from "react";

import Button from "../../containers/partials/Button";
import {APIContext} from "../../components/API";
import AppPage from "../../components/AppPage";

import "../../css/auth.css"


export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            password2: "",
            email: "",

            register: false,
            lock: false,
            error: "",
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
        this.validate();
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
        return this.state.username.length && this.state.password.length;
    }

    login(api) {
        return () => {
            if (this.state.register) {
                return this.setState({register: false});
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

    render() {
        let valid = this.valid();
        return (
            <AppPage><APIContext.Consumer>{api =>
                <div className={"auth-wrap"}>
                    <div className={"auth-modal"}>
                        <div className={"auth-modal-body"}>
                            <label>Username</label>
                            <div className={"input-wrap"}><input name={"username"} type={"text"}
                                                                 value={this.state.username}
                                                                 onChange={this.handleChange} placeholder={"Username"}
                                                                 disabled={this.state.lock}/></div>
                            <label>Password</label>
                            <div className={"input-wrap"}><input name={"password"} type={"password"}
                                                                 value={this.state.password}
                                                                 onChange={this.handleChange} placeholder={"Password"}
                                                                 disabled={this.state.lock}/></div>

                            {this.state.register ? <>
                                <label>Repeat Password</label>
                                <div className={"input-wrap"}><input name={"password2"} type={"password"}
                                                                     value={this.state.password2}
                                                                     onChange={this.handleChange}
                                                                     placeholder={"Repeat Password"}
                                                                     disabled={this.state.lock}/></div>
                                <label>Email</label>
                                <div className={"input-wrap"}><input name={"email"} type={"email"}
                                                                     value={this.state.email}
                                                                     onChange={this.handleChange} placeholder={"Email"}
                                                                     disabled={this.state.lock}/></div>
                            </> : null}

                            <div style={{color: "red"}}>{this.state.error}</div>

                            <Button secondary={!this.state.register}
                                    locked={this.state.lock || (!valid && this.state.register)}
                                    click={this.register(api)} val={"Register"}/>
                            <Button secondary={this.state.register}
                                    locked={this.state.lock || (!valid && !this.state.register)}
                                    click={this.login(api)} val={"Login"}/>
                        </div>
                    </div>
                </div>
            }</APIContext.Consumer></AppPage>
        );
    }
}
