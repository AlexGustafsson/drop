import React from "react";
import type { WrappedComponentProps } from "react-intl";
import { injectIntl, FormattedMessage } from "react-intl";

import api from "../lib/api";
import { ArchiveResponse } from "drop-api";

import {humanReadableBytes} from "../lib/utils";
import Fab from "../components/fab";
import { SVG as IonShare } from "../assets/ion-share.svg";
import { SVG as FileIcon } from "../assets/file-icon.svg";
import UndrawEmpty from "../assets/undraw-empty.svg";

import Modal from "../components/modal";

import "./main.css";

type MainViewState = {
  showModal: boolean,
  archives: ArchiveResponse[],
  maximumSize: number,
  maximumFileCount: number,
  maximumFileSize: number,
  name: string,
};

class MainView extends React.Component<WrappedComponentProps, MainViewState> {
  state: MainViewState = {
    showModal: false,
    archives: [],
    maximumSize: 0,
    maximumFileCount: 0,
    maximumFileSize: 0,
    name: "",
  };

  constructor(props: WrappedComponentProps) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.createArchive = this.createArchive.bind(this);
    this.nameChanged = this.nameChanged.bind(this);
    this.maxSizeChanged = this.maxSizeChanged.bind(this);
    this.maxFileCount = this.maxFileCount.bind(this);
    this.maxFileSize = this.maxFileSize.bind(this);
  }

  toggleModal() {
    this.setState((state, props) => {
      return {...state, showModal: !state.showModal};
    });
  }

  private nameChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(state => ({...state, name: event.target.value}))
  }

  private maxSizeChanged(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(state => ({ ...state, maximumSize: event.target.valueAsNumber }))
  }

  private maxFileCount(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(state => ({ ...state, maximumFileCount: event.target.valueAsNumber }))
  }

  private maxFileSize(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(state => ({ ...state, maximumSize: event.target.valueAsNumber }))
  }

  async componentDidMount() {
    try {
      const result = await api.archives.archivesList()
      this.setState({
        archives: result.data.archives!,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createArchive() {
    try {
      const result = await api.archives.archivesCreate({
        maximumFileCount: this.state.maximumFileCount,
        maximumFileSize: this.state.maximumFileSize,
        maximumSize: this.state.maximumSize,
        name: this.state.name,
      });
      this.setState((state, props) => {
        return {...state, archives: [...state.archives, result.data]};
      });
      this.toggleModal();
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const {intl} = this.props;
    const archives = this.state.archives.map(archive => <article key={archive.id}>
      <h3>{archive.name}</h3>
      <ul>
        {archive.files.map(file => <li key={file.id}>
          <FileIcon />
          <p>{file.name}</p>
          <p className="bubble">{humanReadableBytes(file.size)}</p>
        </li>)}
      </ul>
    </article>);

    return <main className="page main-page">
      {
        this.state.showModal
        &&
        <Modal onClick={this.toggleModal}>
          <main>
            <input type="text" placeholder={intl.formatMessage({id: "archive-name"})} onChange={this.nameChanged} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-size" })} onChange={this.maxSizeChanged} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-count" })} onChange={this.maxFileCount} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-size" })} onChange={this.maxFileSize} />
            <button className="primary" onClick={this.createArchive}><FormattedMessage id="actions.create" /></button>
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
      <div className="grid">{archives}</div>
    </main>
  }
}

export default injectIntl(MainView);
