import React from "react";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import { FormattedMessage } from "react-intl";

import UndrawAuthentication from "../assets/undraw-authentication.svg";

import { auth } from "../lib/auth";
import { AdminToken } from "../lib/token";
import api from "../lib/api";

type LoginViewState = {
  token: string,
  invalidToken: boolean,
  persist: boolean,
};
class LoginView extends React.Component<RouteComponentProps, LoginViewState> {
  state: LoginViewState = {
    token: "",
    invalidToken: false,
    persist: false,
  };

  constructor(props: RouteComponentProps) {
    super(props);

    this.onTokenKeyUp = this.onTokenKeyUp.bind(this);
    this.onTokenChange = this.onTokenChange.bind(this);
    this.onPersistChanged = this.onPersistChanged.bind(this);
    this.login = this.login.bind(this);
  }

  private onTokenKeyUp(event: React.KeyboardEvent) {
    if (event.key !== "Enter")
      return;

    this.login();
  }

  private onTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({token: event.target.value, invalidToken: false});
  }

  private onPersistChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({persist: event.target.checked});
  }

  private login() {
    // TODO: provide helper in the auth lib
    try {
      const token = AdminToken.parse(this.state.token);
      auth.adminToken = token;
      api.setSecurityData({ token: token.toString() });
      if (this.state.persist)
        localStorage.setItem("token", this.state.token);
      this.props.history.replace("/");
    } catch (error) {
      this.setState({invalidToken: true});
    }
  }

  render() {
    const inputClass = this.state.invalidToken ? "bg-red-200" : "bg-white";
    return <main className="flex flex-col flex-1 place-content-center items-center">
      <img src={UndrawAuthentication} className="h-96 w-96" />
      <h1 className="text-xl text-gray-800"><FormattedMessage id="welcome" /></h1>
      <h2 className="text-lg text-gray-500"><FormattedMessage id="authenticate" /></h2>
      {/* The username field is only there so that browsers pick up on autocomplete */}
      <input type="username" hidden defaultValue="Drop" />
      <input type="password" className={"rounded-md " + inputClass} placeholder="Token" onKeyUp={this.onTokenKeyUp} onChange={this.onTokenChange} />
      <input type="checkbox" onChange={this.onPersistChanged} />
      <button className="primary" onClick={this.login}><FormattedMessage id="actions.login" /></button>
    </main>
  }
}

export default withRouter(LoginView);
