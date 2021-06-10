import React from "react";
import {Link} from "react-router-dom";

import UndrawWarning from "../assets/undraw-warning.svg";

import "./not-found.css"

export default class NotFoundView extends React.Component {
  render() {
    return <main className="page not-found-page">
      <img src={UndrawWarning} />
      <h1>Not found</h1>
      <Link to="/"><button className="primary">Take me home</button></Link>
    </main>
  }
}
