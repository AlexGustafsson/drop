import ReactDOM from "react-dom";
import React from "react";

import { IntlProvider } from "react-intl";
import { translationsForLanguage } from "./i18n";

import App from "./app";

import "./main.css";
import { AdminToken, UploadToken } from "./lib/token";
import { useAuth } from "./lib/auth";

import { SnackbarContainer } from "./components/snackbar";

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
  const auth = useAuth();
  auth.initialize();

  ReactDOM.render(
    <React.StrictMode>
      <IntlProvider defaultLocale="en-us" locale={locale} messages={messages}>
        {<SnackbarContainer>
          <App />
        </SnackbarContainer>}
      </IntlProvider>
    </React.StrictMode>,
    document.getElementById("app"),
  );
}

document.addEventListener("DOMContentLoaded", main);
