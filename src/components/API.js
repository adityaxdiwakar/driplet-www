import {withRouter} from "react-router-dom";
import React, {Component} from "react";
import axios from "axios";


export const APIContext = React.createContext({
    ready: false,
    authenticated: false,
    user: {
        username: null,
        email: null,
        client_id: null,
    },
});


axios.interceptors.response.use(
    response => {
        console.debug(response.data);
        return response;
    },
    error => {
        if (!error.response) error.response = {data: {message: "Failed to communcate with Driplet"}};
        console.debug(error.response.data);
        return Promise.reject(error.response);
    }
);


class APIClass extends Component {
    // PROTOCOL = "http:";
    PROTOCOL = "https:";
    // DOMAIN = "//127.0.0.1:3141";
    DOMAIN = "//api.driplet.cf";
    API_BASE = "/endpoints";
    BASE_URL = this.PROTOCOL + this.DOMAIN + this.API_BASE;

    WEBSOCKET = "wss://ws.driplet.cf";

    ENDPOINTS = {
        VALIDATE_TOKEN: "/accounts/%client_id%/verify",
        ACCOUNT: "/accounts/%client_id%",
        REGISTER: "/register",
        LOGIN: "/login",

        RESET: "/reset",

        SERVICES: "/%client_id%/services",
    };

    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            authenticated: false,
            user: {
                username: null,
                email: null,
                client_id: null,
                token: null,
            },

            services: {},
            console_trace: "",

            register: this.register,
            reset: this.reset,
            login: this.login,
            logout: this.logout,
            list_services: this.list_services,
            create_service: this.create_service,
            service_details: this.service_details,

            ensureServices: this.ensureServices,
            start_service: this.start_service,
            restart_service: this.restart_service,
            stop_service: this.stop_service,

            bind_websocket: this.bind_websocket,
        };

        this.websocket = new WebSocket(this.WEBSOCKET);
        this.websocket.onmessage = this.wsOnMessage.bind(this);
        this.websocket.onclose = this.wsOnClose.bind(this);
    }

    wsOnClose() {
        this.websocket = new WebSocket(this.WEBSOCKET);
        this.websocket.onmessage = this.wsOnMessage.bind(this);
        this.websocket.onclose = this.wsOnClose.bind(this);
    }

    wsOnMessage(e) {
        this.setState({
            console_trace: this.state.console_trace + e.data.replace(/\s+$/g, "") + "\n"
        });
    }

    componentWillMount() {
        let token = localStorage.getItem('token');
        let client_id = localStorage.getItem('client_id');

        if (token) {
            this.validate_token({token: token, client_id: client_id}, (data) => {
                this.get_account_details(client_id, token);
            }, () => {
                this.setState({
                    authenticated: false,
                    ready: true,
                });
                console.warn("Previous token invalid!")
            });
        } else {
            this.setState({
                ready: true,
            });
        }
    }

    // AUTH FLOW
    get_account_details = (client_id, token) => {
        // PASS
        axios({
            url: this.BASE_URL + this.ENDPOINTS.ACCOUNT.replace("%client_id%", client_id),
            method: "get",
            headers: {authorization: token},
        }).then(response => {
            this.setState({
                authenticated: true,
                ready: true,
                user: {
                    client_id: client_id,
                    username: response.data.username,
                    email: response.data.email,
                    token: token
                }
            })
        }).catch(() => {
            this.setState({
                authenticated: false,
                ready: true,
            })
        });

    };

    validate_token = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.VALIDATE_TOKEN.replace("%client_id%", data.client_id),
            method: "get",
            headers: {authorization: data.token},
        }).then(response => {
            success(response.data, this);
        }).catch(() => failure(this));
    };

    reset = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.RESET,
            method: "post",
            data: {key: data.username, password: data.password}
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    login = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.LOGIN,
            method: "post",
            data: {username: data.username, password: data.password}
        }).then(response => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('client_id', response.data.id);

            this.setState({
                authenticated: true,
                user: {
                    username: response.data.username,
                    email: response.data.email,
                    client_id: response.data.id,
                    token: response.data.token,
                }
            });

            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    register = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.REGISTER,
            method: "post",
            data: {username: data.username, password: data.password, email: data.email}
        }).then(response => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('client_id', response.data.id);

            this.setState({
                authenticated: true,
                user: {
                    username: response.data.username,
                    email: response.data.email,
                    client_id: response.data.id,
                    token: response.data.token,
                },
            });

            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    logout = () => {
        this.setState({
            authenticated: false,
            user: {
                username: null,
                email: null,
                client_id: null,
            },
            ready: true,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('client_id');
    };

    // SERVICES
    ensureServices = () => {
        if (!this.state.services.length) {
            this.list_services(() => {}, () => {})
        }
    };

    list_services = (success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id),
            method: "get",
            headers: {authorization: this.state.user.token},
        }).then(response => {
            let services = {};
            response.data.forEach(service => {
                services[service.id] = service
            });
            this.setState({
                services: services
            });
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    create_service = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id),
            method: "post",
            data: {name: data.name, description: data.desc, start_command: data.start, stop_command: data.stop,
                    restart_command: data.restart, status_command: data.status, log_command: data.log},
            headers: {authorization: this.state.user.token},
        }).then(response => {
            success(response.data, this);
            this.list_services(() => {}, () => {});
        }).catch(response => {
            failure(response.data)
        });
    };

    service_details = (service_id, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id) + "/" + service_id,
            method: "get",
            headers: {authorization: this.state.user.token},
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    start_service = (service_id, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id) + "/" + service_id + "/start",
            method: "POST",
            headers: {authorization: this.state.user.token},
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    restart_service = (service_id, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id) + "/" + service_id + "/restart",
            method: "POST",
            headers: {authorization: this.state.user.token},
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    stop_service = (service_id, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id) + "/" + service_id + "/stop",
            method: "POST",
            headers: {authorization: this.state.user.token},
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    bind_websocket = (service_id) => {
        if (this.websocket.readyState !== this.websocket.OPEN)
            return setTimeout(() => {this.bind_websocket(service_id)}, 500);
        this.websocket.send(JSON.stringify({
            authentication: {
                client_id: this.state.user.client_id,
                token: this.state.user.token,
            },
            serviceid: service_id
        }));
        this.setState({console_trace: ""});
    };

    // React.JS
    render() {
        return (<APIContext.Provider value={this.state}>{this.props.children}</APIContext.Provider>)
    }
}

export let API = withRouter(APIClass);
