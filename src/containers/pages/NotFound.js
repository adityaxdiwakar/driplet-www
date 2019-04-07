import React from "react";
import {Link} from "react-router-dom";
import "../../css/error.css";
import AppPage from "../../components/AppPage";

export default () =>
    <AppPage name="NotFound">
        <div className={"error-wrap"}>
            <div className={"error-title"}>404: Not Found</div>
            <div className={"error-sub1"}>Looks like this page doesn't exist</div>
            <div className={"error-sub2"}>Take a wrong turn somewhere?</div>

            <Link to="/"><div className={"error-link"}>Get me out of here</div></Link>
        </div>
    </AppPage>;
