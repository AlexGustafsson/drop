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
    const archives = this.state.archives.map(archive => <article key={archive.id} className="flex flex-col items-center bg-white rounded-xl p-5">
      <h2 className="text-lg">{archive.name}</h2>
      <div className="grid grid-cols-3 my-2 w-full">
        <p className="text-center text-sm text-gray-500">{`${archive.files.length}/${archive.maximumFileCount}`}<br />files</p>
        <p className="text-center text-sm text-gray-500">{`${archive.files.reduce((size, file) => size + file.size, 0)}/${archive.maximumSize}`}<br />size</p>
        <p className="text-center text-sm text-gray-500">{`${archive.maximumFileSize}`}<br />max file size</p>
      </div>
      <ul className="w-full">
        {archive.files.map(file => <li key={file.id} className="grid grid-cols-3 my-2 items-center justify-items-center">
          <FileIcon className="w-10 h-10 text-primary" />
          <p>{file.name}</p>
          <p className="">{humanReadableBytes(file.size)}</p>
        </li>)}
      </ul>
    </article>);

    return <main className="container relative flex flex-col">
      {
        this.state.showModal
        &&
        <Modal className="flex items-center place-content-center" onClick={this.toggleModal}>
          <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
            <input type="text" placeholder={intl.formatMessage({id: "archive-name"})} onChange={this.nameChanged} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-size" })} onChange={this.maxSizeChanged} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-count" })} onChange={this.maxFileCount} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-size" })} onChange={this.maxFileSize} />
            <button className="primary" onClick={this.createArchive}><FormattedMessage id="actions.create" /></button>
          </main>
        </Modal>
      }
      <Fab className="fixed bottom-10 right-10" onClick={this.toggleModal}><IonShare /></Fab>
      {this.state.archives.length === 0 && <div className="flex flex-col flex-1 place-content-center items-center">
        <img src={UndrawEmpty} className="h-96 w-96" />
        <h1 className="text-xl text-gray-800">Nothing to see here</h1>
        <h2 className="text-lg text-gray-500">There are no uploaded files yet</h2>
        <button className="primary" onClick={this.toggleModal}>Create an archive</button>
      </div>}
      <div className="grid grid-cols-3 gap-5 p-5">{archives}</div>
    </main>
  }
}

export default injectIntl(MainView);
