import React from "react";
import {Link} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawSecureLogin from "../assets/undraw-secure-login.svg";

const UnauthorizedView = (): JSX.Element => {
  return <main className="flex flex-col flex-1 place-content-center items-center">
    <img src={UndrawSecureLogin} className="h-96 w-96" />
    <h1 className="text-xl text-gray-800"><FormattedMessage id="errors.messages.unauthorized" /></h1>
    <h2 className="text-lg text-gray-500"><FormattedMessage id="errors.descriptions.unauthorized-upload" /></h2>
    <Link to="/"><button className="primary"><FormattedMessage id="actions.take-me-home" /></button></Link>
  </main>
}
export default UnauthorizedView;
