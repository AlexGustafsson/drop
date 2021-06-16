import React, { useState } from "react";
import {useHistory} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawAuthentication from "../assets/undraw-authentication.svg";

import { useAuth } from "../lib/auth";
import { AdminToken } from "../lib/token";

const LoginView = (): JSX.Element => {
  const history = useHistory();
  const auth = useAuth();
  const [token, setToken] = useState("");
  const [invalidToken, setInvalidToken] = useState(false);
  const [persist, setPersist] = useState(false);

  function login() {
    try {
      const adminToken = AdminToken.parse(token);
      auth.login(adminToken, persist);
      history.replace("/");
    } catch (error) {
      setInvalidToken(true);
    }
  }

  function onTokenKeyUp(event: React.KeyboardEvent) {
    if (event.key !== "Enter")
      return;

    login();
  }

  function onTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInvalidToken(false);
    setToken(event.target.value);
  }

  function onPersistChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setPersist(event.target.checked);
  }

  const inputClass = invalidToken ? "bg-red-200" : "bg-white";
  return <main className="flex flex-col flex-1 place-content-center items-center">
    <img src={UndrawAuthentication} className="h-96 w-96" />
    <h1 className="text-xl text-gray-800"><FormattedMessage id="welcome" /></h1>
    <h2 className="text-lg text-gray-500"><FormattedMessage id="authenticate" /></h2>
    {/* The username field is only there so that browsers pick up on autocomplete */}
    <input type="username" hidden defaultValue="Drop" />
    <input type="password" className={"rounded-md " + inputClass} placeholder="Token" onKeyUp={onTokenKeyUp} onChange={onTokenChange} />
    <input type="checkbox" onChange={onPersistChanged} />
    <button className="primary" onClick={login}><FormattedMessage id="actions.login" /></button>
  </main>
};

export default LoginView;
