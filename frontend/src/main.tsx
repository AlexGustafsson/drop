import ReactDOM from "react-dom";
import React from "react";

import { IntlProvider, injectIntl } from "react-intl";
import { translationsForLanguage } from "./i18n";

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
  const locale = navigator.language;
  const messages = translationsForLanguage(locale);

  ReactDOM.render(
    <React.StrictMode>
      <IntlProvider defaultLocale="en-us" locale={locale} messages={messages}>
        <App />
      </IntlProvider>
    </React.StrictMode>,
    document.getElementById("app"),
  );
}

document.addEventListener("DOMContentLoaded", main);
