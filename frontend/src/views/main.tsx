import React from "react";

import {humanReadableBytes} from "../lib/utils";
import Fab from "../components/fab";
import { SVG as IonShare } from "../assets/ion-share.svg";
import { SVG as FileIcon } from "../assets/file-icon.svg";
import UndrawEmpty from "../assets/undraw-empty.svg";

import Modal from "../components/modal";

import "./main.css";

type ArchiveFile = {
  name: string,
  mime: string,
  size: number,
};

// TODO: Move to client lib?
type Archive = {
  name: string,
  files: ArchiveFile[],
};

type MainViewState = {
  showModal: boolean,
  archives: Archive[],
};

export default class MainView extends React.Component<{}, MainViewState> {
  state: MainViewState = {
    showModal: false,
    archives: [{
      name: "test",
      files: [
        {
          name: "test file",
          mime: "application/pdf",
          size: 1204125,
        },
        {
          name: "test file",
          mime: "application/pdf",
          size: 1204125,
        },
      ]
    }]
  };

  constructor(props: {}) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState((state, props) => {
      return {...state, showModal: !state.showModal};
    });
  }

  readableFileSize(size: number): string {
    const kilo = size % 1024;
    const mega = (size - kilo * 1024) % 1024
  }

  render() {
    const archives = this.state.archives.map(archive => <article>
      <h3>{archive.name}</h3>
      <ul>
        {archive.files.map(file => <li>
          <FileIcon />
          <p>{file.name}</p>
          <p className="bubble">{humanReadableBytes(file.size)}</p>
        </li>)}
      </ul>
    </article>)

    return <main className="page main-page">
      {
        this.state.showModal
        &&
        <Modal onClick={this.toggleModal}>
          <main>
            <input type="text" placeholder="Archive name" />
            <input type="number" min="0" placeholder="Maximum size" />
            <input type="number" min="0" placeholder="Maximum file count" />
            <input type="number" min="0" placeholder="Maximum file size" />
            <button className="primary" onClick={this.toggleModal}>Create</button>
          </main>
        </Modal>
      }
      <Fab onClick={this.toggleModal}><IonShare /></Fab>
      {this.state.archives.length === 0 && <div className="error">
        <img src={UndrawEmpty} />
        <h1>Nothing to see here</h1>
        <h2>There are no uploaded files yet</h2>
        <button className="primary" onClick={this.toggleModal}>Create an archive</button>
      </div>}
      <div class="grid">{archives}</div>
    </main>
  }
}
