import React from "react";
import {Link} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawSecureLogin from "../assets/undraw-secure-login.svg";

import "./unauthorized.css"

export default class UnauthorizedView extends React.Component {
  render() {
    return <main className="page unauthorized-page centered">
      <img src={UndrawSecureLogin} />
      <h1><FormattedMessage id="errors.messages.unauthorized" /></h1>
      <h2><FormattedMessage id="errors.descriptions.unauthorized-upload" /></h2>
      <Link to="/"><button className="primary"><FormattedMessage id="actions.take-me-home" /></button></Link>
    </main>
  }
}
