import React from "react";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import Dropper from "../components/dropper";
import DroppedFile from "../components/dropped-file";
import {parseFragments, parseUploadClaims} from "../lib/token";
import type {UploadClaims} from "../lib/token";
import UndrawSecureLogin from "../assets/undraw-secure-login.svg";
import FileUploader from "../lib/worker/file-uploader";

import "./upload.css";

type FileUpload = {
  file: File,
  internalFileId: string,
  uploadProgress: number,
  encryptionProgress: number,
};

type UploadViewState = {
  files: FileUpload[],
};

export default class UploadView extends React.Component<{}, UploadViewState> {
  state: UploadViewState = {
    files: [],
  };

  private token: string | null;
  private secret: string | null;
  private claims: UploadClaims | null;
  private fileUploader: FileUploader | null;

  constructor(props: {}) {
    super(props);

    let { token, secret } = parseFragments();
    this.token = token;
    this.secret = secret;
    this.claims = token === null ? null : parseUploadClaims(token);
    if (this.token && this.secret && this.claims) {
      this.fileUploader = new FileUploader(this.token, this.claims.archiveId, this.secret);
      this.fileUploader.addEventListener("upload", this.onUploadProgress.bind(this));
      this.fileUploader.addEventListener("encrypt", this.onEncryptionProgress.bind(this));
      this.fileUploader.addEventListener("done", this.onUploadDone.bind(this));
    } else {
      this.fileUploader = null;
    }

    this.filesChanged = this.filesChanged.bind(this);
  }

  private onUploadProgress(file: File, progress: number) {

  }

  private onEncryptionProgress(file: File, progress: number) {

  }

  private onUploadDone(file: File) {
    console.log("Done");
  }

  private filesChanged(files: File[]) {
    this.setState((state: UploadViewState, props: {}) => {
      for (let i = state.files.length; i < files.length; i++) {
        state.files[i] = {file: files[i], internalFileId: i.toString(), uploadProgress: 0, encryptionProgress: 0};
        this.fileUploader?.upload(files[i]);
      }

      return state;
    });
  }

  render() {
    if (this.claims) {
      const files = this.state.files.map(file => {
        return <DroppedFile key={file.internalFileId} title={file.file.name} uploadProgress={file.uploadProgress} encryptionProgress={file.encryptionProgress} />
      });

      // Allow 3.5 dropped files to be shown (makes it easier to see that the
      // content may be scrolled once it surpasses four files
      const height = 400 + 70 * Math.min(this.state.files.length, 3.5);

      return <main className="page upload-page centered authorized" style={{height: height}}>
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
      return <main className="page upload-page centered unauthorized">
        <img src={UndrawSecureLogin} />
        <h1><FormattedMessage id="errors.messages.unauthorized" /></h1>
        <h2><FormattedMessage id="errors.descriptions.unauthorized-upload" /></h2>
        <Link to="/"><button className="primary"><FormattedMessage id="actions.take-me-home" /></button></Link>
      </main>
    }
  }
}
