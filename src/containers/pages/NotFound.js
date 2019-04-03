import React from "react";
import {Link} from "react-router-dom";
import "../../css/error.css";
import AppPage from "../../components/AppPage";

export default () =>
    <AppPage name="NotFound">
        <h1>404 not found</h1>
        <Link to="/">Home</Link>
    </AppPage>;
