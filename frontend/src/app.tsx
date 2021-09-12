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
import ArchivesView from "./views/archives";
import ArchiveView from "./views/archive";
import FilesView from "./views/files";

const App = (): JSX.Element => {
  const auth = useAuth();

  return <Router>
    <Switch>
      <PrivateRoute exact path="/" requireAdmin redirect component={MainView} />
      <PrivateRoute exact path="/archives" requireAdmin redirect component={ArchivesView} />
      <PrivateRoute exact path="/archives/:archiveId" requireAdmin redirect component={ArchiveView} />
      <PrivateRoute exact path="/files" requireAdmin redirect component={FilesView} />
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
