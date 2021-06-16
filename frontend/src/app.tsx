import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import MainView from "./views/main"
import LoginView from "./views/login"
import UploadView from "./views/upload"
import NotFoundView from "./views/not-found"

import {auth, PrivateRoute} from "./lib/auth";

export default class App extends React.Component {
  render() {
    return <Router>
      <Switch>
        <PrivateRoute exact path="/" requireAdmin redirect component={MainView} />
        <Route exact path="/login" component={LoginView} />
        <Route exact path="/logout" render={() => {
          // TODO: Move to the auth lib
          auth.adminToken = null;
          localStorage.removeItem("token");
          return <Redirect to="/" />;
        }} />
        <PrivateRoute exact path="/upload" requireUpload component={UploadView} />
        <Route component={NotFoundView} />
      </Switch>
    </Router>
  }
}
