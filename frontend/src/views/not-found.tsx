import React from "react";
import {Link} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawWarning from "../assets/undraw-warning.svg";

export default class NotFoundView extends React.Component {
  render() {
    return <main className="flex flex-col flex-1 place-content-center items-center">
      <img src={UndrawWarning} className="h-96 w-96" />
      <h1 className="text-xl text-gray-800"><FormattedMessage id="errors.messages.not-found" /></h1>
      <h2 className="text-lg text-gray-500"><FormattedMessage id="errors.descriptions.not-found" /></h2>
      <Link to="/"><button className="primary"><FormattedMessage id="actions.take-me-home" /></button></Link>
    </main>
  }
}
