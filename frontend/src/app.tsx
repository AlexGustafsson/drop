import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import MainView from "./views/main"
import UploadView from "./views/upload"
import NotFoundView from "./views/not-found"

export default class App extends React.Component {
  render() {
    return <Router>
      <Switch>
        <Route exact path="/" component={MainView} />
        <Route exact path="/upload" component={UploadView} />
        <Route component={NotFoundView} />
      </Switch>
    </Router>
  }
}

//   fileUploader.addEventListener("done", file => {
//     const index = filesList.indexOf(file);
//     const droppedFile = droppedFileList[index];
//     droppedFile.setUploadProgress(1);
//     droppedFile.setEncryptProgress(1);
//   });

//   fileUploader.addEventListener("upload", (file, progress) => {
//     const index = filesList.indexOf(file);
//     const droppedFile = droppedFileList[index];
//     droppedFile.setUploadProgress(progress);
//   });

//   fileUploader.addEventListener("encrypt", (file, progress) => {
//     const index = filesList.indexOf(file);
//     const droppedFile = droppedFileList[index];
//     droppedFile.setEncryptProgress(progress);
//   });

//   fileUploader.addEventListener("error", (file, error: Error) => {
//     console.error("Error", file, error);
//   });

//   dropper.addEventListener("drop", (files: File[]) => {
//     if (secret === null)
//       secret = prompt("Secret");



//       droppedFileList.push(droppedFile);
//       filesList.push(file);
//       fileUploader.upload(file);
//     }
//   });
// }
