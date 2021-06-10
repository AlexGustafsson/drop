import React from "react";

import {SVG as FileIcon} from "../assets/file-icon.svg";

import "./dropped-file.css";

type DroppedFileProps = {
  title: string,
  uploadProgress: number,
  encryptionProgress: number,
};

export default class DroppedFile extends React.Component<DroppedFileProps> {
  render() {
    return <li className="dropped-file">
      <FileIcon className="icon" />
      <p className="title">{this.props.title}</p>
      <p className="status">{Math.round(this.props.uploadProgress * 100)}%</p>
      <div className="progress">
        <div className="upload" style={{width: this.props.uploadProgress * 100}}></div>
        <div className="encrypt" style={{ width: this.props.encryptionProgress * 100}}></div>
      </div>
    </li>
  }
}
