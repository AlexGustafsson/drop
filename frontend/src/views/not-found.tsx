import React from "react";
import {Link} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawWarning from "../assets/undraw-warning.svg";

import "./not-found.css"

export default class NotFoundView extends React.Component {
  render() {
    return <main className="page not-found-page centered">
      <img src={UndrawWarning} />
      <h1><FormattedMessage id="errors.messages.not-found" /></h1>
      <h2><FormattedMessage id="errors.descriptions.not-found" /></h2>
      <Link to="/"><button className="primary"><FormattedMessage id="actions.take-me-home" /></button></Link>
    </main>
  }
}
