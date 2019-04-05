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
        //console.debug(response.data);
        return response;
    },
    error => {
        if (!error.response) error.response = {data: {message: "Failed to communcate with Driplet"}};
        //console.debug(error.response.data);
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
            request_reset: this.request_reset,
            reset: this.reset,
            login: this.login,
            logout: this.logout,
            list_services: this.list_services,
            create_service: this.create_service,
            service_details: this.service_details,
            delete_service: this.delete_service,

            ensureServices: this.ensureServices,
            start_service: this.start_service,
            restart_service: this.restart_service,
            stop_service: this.stop_service,

            bind_websocket: this.bind_websocket,
        };

        this.current_service = null;
        this.on_ws_ready = null;

        this.websocket = new WebSocket(this.WEBSOCKET);
        this.websocket.onmessage = this.wsOnMessage.bind(this);
        this.websocket.onclose = this.wsOnClose.bind(this);

        console.log("             *     ,MMM8&&&.            *\n                  MMMM88&&&&&    .\n                 MMMM88&&&&&&&\n     *           MMM88&&&&&&&&\n                 MMM88&&&&&&&&\n                 'MMM88&&&&&&'\n                   'MMM8&&&'      *    _\n          |\\___/|                      \\\\\n         =) ^Y^ (=   |\\_/|              ||    '\n          \\  ^  /    )a a '._.-\"\"\"\"-.  //\n           )=*=(    =\\T_= /    ~  ~  \\//\n          /     \\     `\"`\\   ~   / ~  /\n          |     |         |~   \\ |  ~/\n         /| | | |\\         \\  ~/- \\ ~\\\n         \\| | |_|/|        || |  // /`\n  jgs_/\\_//_// __//\\_/\\_/\\_((_|\\((_//\\_/\\_/\\_\n  |  |  |  | \\_) |  |  |  |  |  |  |  |  |  |\n  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |\n  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |\n  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |\n  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |")

        console.log('%cWait a second!', 'font-size: 8em; color: #e22; text-shadow: ' +
            '3px 3px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;');
        console.log('%cIf you have been told to paste something here, you\'re almost certainly being scammed.',
            'font-size: 2em; color: #fff;');
        console.log('%cPasting code into here could give attackers control of your servers.',
            'font-size: 2em; color: #e22; font-weight: 800;');
        console.log('%cUnless you know what you\'re doing, close this window.',
            'font-size: 2em; color: #fff;');
    }

    wsOnClose() {
        this.websocket = new WebSocket(this.WEBSOCKET);
        this.websocket.onmessage = this.wsOnMessage.bind(this);
        this.websocket.onclose = this.wsOnClose.bind(this);
    }

    wsOnMessage(e) {
        let data;
        if (e.data === 'Authentication was successful.')
            data = {service_id: this.current_service, content: e.data};
        else
            data = JSON.parse(e.data);

        if (data.type === "handshake" && this.on_ws_ready) this.on_ws_ready();

        if (data.service_id && data.service_id !== this.current_service) return;
        this.setState({
            console_trace: this.state.console_trace + data.content.replace(/\s+$/g, "") + "\n"
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

    request_reset = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.RESET,
            method: "post",
            data: {identification: data.username}
        }).then(response => {
            success(response.data, this);
        }).catch(response => {
            failure(response.data)
        });
    };

    reset = (data, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.RESET + "/" + data.client_id + "/" + data.key,
            method: "post",
            data: {password: data.password}
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

    delete_service = (service_id, success, failure) => {
        axios({
            url: this.BASE_URL + this.ENDPOINTS.SERVICES.replace("%client_id%", this.state.user.client_id) + "/" + service_id,
            method: "delete",
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

    bind_websocket = (service_id, on_ready) => {
        if (this.websocket.readyState !== this.websocket.OPEN)
            return setTimeout(() => {this.bind_websocket(service_id)}, 500);
        this.websocket.send(JSON.stringify({
            authentication: {
                client_id: this.state.user.client_id,
                token: this.state.user.token,
            },
            serviceid: service_id
        }));
        this.current_service = service_id;
        this.setState({console_trace: ""});
        this.on_ws_ready = on_ready;
    };

    // React.JS
    render() {
        return (<APIContext.Provider value={this.state}>{this.props.children}</APIContext.Provider>)
    }
}

export let API = withRouter(APIClass);
