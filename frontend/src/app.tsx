import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import MainView from "./views/main"
import LoginView from "./views/login"
import UploadView from "./views/upload"
import NotFoundView from "./views/not-found"

import {useAuth, PrivateRoute} from "./lib/auth";

const App = (): JSX.Element => {
  const auth = useAuth();

  return <Router>
    <Switch>
      <PrivateRoute exact path="/" requireAdmin redirect component={MainView} />
      <Route exact path="/login" component={LoginView} />
      <Route exact path="/logout" render={() => {
        auth.logout();
        return {};
      }} />
      <PrivateRoute exact path="/upload" requireUpload component={UploadView} />
      <Route component={NotFoundView} />
    </Switch>
  </Router>
};
export default App;
