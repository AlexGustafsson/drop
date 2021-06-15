import React from "react";
import { Route, Redirect } from "react-router-dom";
import type { RouteProps } from "react-router-dom";

import type { AdminToken, UploadToken } from "./token";

import UnauthorizedView from "../views/unauthorized";

export type AuthContext = {
  adminToken: AdminToken | null,
  uploadToken: UploadToken | null,
  uploadSecret: string | null,
};

export const auth: AuthContext = {
  adminToken: null,
  uploadToken: null,
  uploadSecret: null,
};

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
