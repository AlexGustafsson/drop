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

//     // Allow 3.5 dropped files to be shown (makes it easier to see that the
//     // content may be scrolled once it surpasses four files
//     main.style.height = `${400 + 70 * Math.min(dropper.files.length, 3.5)}px`;
//     for (const file of files) {
//       const droppedFile = new DroppedFile(file);
//       fileList.appendChild(droppedFile.element);
//       if (dropper.files.length > 3)
//         fileScroller.scrollTo(0, fileScroller.scrollHeight);

//       droppedFileList.push(droppedFile);
//       filesList.push(file);
//       fileUploader.upload(file);
//     }
//   });
// }
