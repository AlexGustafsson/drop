import ReactDOM from "react-dom";
import React from "react";

import App from "./app";

import "./main.css";

function disableBodyDragAndDrop() {
  document.body.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
  });

  document.body.addEventListener("drop", (event: DragEvent) => {
    event.preventDefault();
  });
}

async function main() {
  disableBodyDragAndDrop();

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app"),
  );
}

document.addEventListener("DOMContentLoaded", main);
