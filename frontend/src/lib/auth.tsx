import React from "react";
import { Route, Redirect } from "react-router-dom";
import type { RouteProps } from "react-router-dom";

import { AdminToken, UploadToken} from "./token";
import {useApi} from "../lib/api";

import UnauthorizedView from "../views/unauthorized";

export function parseFragments() {
  const fragments = location.hash.substr(1).split("&").reduce((result: { [key: string]: string }, fragment) => {
    const [key, value] = fragment.split("=");
    result[key] = value;
    return result;
  }, {});

  return { token: fragments["token"] || null, secret: fragments["secret"] || null };
}

export class AuthContext  {
  public adminToken: AdminToken | null;
  public uploadToken: UploadToken | null;
  public uploadSecret: string | null;

  constructor() {
    this.adminToken = null;
    this.uploadToken = null;
    this.uploadSecret = null;
  }

  private updateApi() {
    const api = useApi();
    api.setSecurityData({ adminToken: this.adminToken?.toString() || null, uploadToken: this.uploadToken?.toString() || null });
  }

  public login(token: AdminToken, persist: boolean) {
    this.adminToken = token;
    this.updateApi();
    if (persist)
      localStorage.setItem("token", token.toString());
  }

  public logout() {
    localStorage.removeItem("token");
    window.location.replace("/");
  }

  public initialize() {
    const storedAdminToken = localStorage.getItem("token");
    if (storedAdminToken !== null) {
      try {
        const adminToken = AdminToken.parse(storedAdminToken);
        if (adminToken.isValid()) {
          this.adminToken = adminToken;
          this.updateApi();
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }

    const fragments = parseFragments();
    if (fragments.token) {
      try {
        const uploadToken = UploadToken.parse(fragments.token);
        if (uploadToken.isValid()) {
          this.uploadToken = uploadToken;
        }
      } catch (error) {
        // NOOP
      }
    }
  }
}

const auth = new AuthContext();

export function useAuth(): AuthContext {
  return auth;
}

type PrivateRouteProps = {
  requireAdmin?: boolean,
  requireUpload?: boolean,
  redirect?: boolean,
} & RouteProps;

export class PrivateRoute extends React.Component<PrivateRouteProps> {
  static defaultProps: PrivateRouteProps = {
    requireAdmin: false,
    requireUpload: false,
    redirect: false,
  };

  render() {
    const auth = useAuth();
    const {children, requireAdmin, requireUpload, redirect, component, ...rest} = this.props;
    const render = () => {
      const authenticated = (requireAdmin && auth.adminToken?.isValid()) || (requireUpload && auth.uploadToken?.isValid());
      if (authenticated)
        return component ? React.createElement(component, {}) : children;

      if (redirect)
        return <Redirect to={{ pathname: "/login" }} />

      return <UnauthorizedView />
    };
    return <Route {...rest} render={render} />;
  }
}
