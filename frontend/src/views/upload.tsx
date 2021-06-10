import React from "react";
import {Link} from "react-router-dom";

import Dropper from "../components/dropper";
import DroppedFile from "../components/dropped-file";
import {parseFragments, parseUploadClaims} from "../lib/token";
import type {UploadClaims} from "../lib/token";
import UndrawSecureLogin from "../assets/undraw-secure-login.svg";

import "./upload.css";

type UploadViewState = {
  files: File[]
};

export default class UploadView extends React.Component<{}, UploadViewState> {
  state: UploadViewState = {
    files: [],
  };

  private token: string | null;
  private secret: string | null;
  private claims: UploadClaims | null;

  constructor(props: {}) {
    super(props);

    let { token, secret } = parseFragments();
    this.token = token;
    this.secret = secret;
    this.claims = token === null ? null : parseUploadClaims(token);

    this.filesChanged = this.filesChanged.bind(this);
  }

  filesChanged(files: File[]) {
    this.setState({
      files,
    });
  }

  render() {
    if (this.claims) {
      const files = this.state.files.map(file => {
        return <DroppedFile key="a" title="boo" uploadProgress={0.5} encryptionProgress={0.75} />
      });

      return <main className="page upload-page authorized">
        <h1>Upload your files</h1>
        <h2>Any files are supported, but large files may take longer to process</h2>
        <Dropper onChange={this.filesChanged} maximumFileCount={this.claims.maximumFileCount} maximumFileSize={this.claims.maximumFileSize} maximumSize={this.claims.maximumSize} />
        <div className="file-scroller">
          <ul>
            {files}
          </ul>
        </div>
      </main>
    } else {
      return <main className="page upload-page unauthorized">
        <img src={UndrawSecureLogin} />
        <h1>Unauthorized</h1>
        <Link to="/"><button className="primary">Take me home</button></Link>
      </main>
    }
  }
}
