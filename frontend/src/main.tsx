import ReactDOM from "react-dom";
import React from "react";

import { IntlProvider } from "react-intl";
import { translationsForLanguage } from "./i18n";

import App from "./app";

import "./main.css";
import { AdminToken } from "./lib/token";
import { auth } from "./lib/auth";
import api from "./lib/api";

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

  api.setSecurityData({token: null});

  const storedAdminToken = localStorage.getItem("token");
  if (storedAdminToken !== null) {
    try {
      const adminToken = AdminToken.parse(storedAdminToken);
      api.setSecurityData({token: adminToken.toString()});
      if (adminToken.isValid())
        auth.adminToken = adminToken;
      else
        localStorage.removeItem("token");
    } catch (error) {
      localStorage.removeItem("token");
    }
  }

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
