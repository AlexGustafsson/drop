import React from "react";
import type { WrappedComponentProps } from "react-intl";
import { injectIntl, FormattedMessage } from "react-intl";

import api from "../lib/api";
import { ArchiveResponse, FileResponse } from "drop-api";

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
};

class MainView extends React.Component<WrappedComponentProps, MainViewState> {
  state: MainViewState = {
    showModal: false,
    archives: [],
  };

  constructor(props: WrappedComponentProps) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState((state, props) => {
      return {...state, showModal: !state.showModal};
    });
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

  render() {
    const {intl} = this.props;
    const archives = this.state.archives.map(archive => <article key={archive.id}>
      <h3>{archive.name}</h3>
      <ul>
        {/* {archive.files.map(file => <li>
          <FileIcon />
          <p>{file.name}</p>
          <p className="bubble">{humanReadableBytes(file.size)}</p>
        </li>)} */}
      </ul>
    </article>);

    return <main className="page main-page">
      {
        this.state.showModal
        &&
        <Modal onClick={this.toggleModal}>
          <main>
            <input type="text" placeholder={intl.formatMessage({id: "archive-name"})} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-size" })} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-count" })} />
            <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-size" })} />
            <button className="primary" onClick={this.toggleModal}><FormattedMessage id="actions.create" /></button>
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
