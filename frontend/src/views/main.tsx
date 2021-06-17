import React, { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";

import {useApi} from "../lib/api";

import {humanReadableBytes} from "../lib/utils";
import Fab from "../components/fab";
import { SVG as IonShare } from "../assets/ion-share.svg";
import { SVG as FileIcon } from "../assets/file-icon.svg";
import UndrawEmpty from "../assets/undraw-empty.svg";

import Modal from "../components/modal";
import { ArchiveResponse } from "drop-client";

const MainView = (): JSX.Element => {
  const intl = useIntl();
  const api = useApi();

  const [showModal, setShowModal] = useState(false);
  const [archives, setArchives] = useState<ArchiveResponse[]>([]);
  const [maximumSize, setMaximumSize] = useState(0);
  const [maximumFileCount, setMaximumFileCount] = useState(0);
  const [maximumFileSize, setMaximumFileSize] = useState(0);
  const [archiveName, setArchiveName] = useState("");

  useEffect(() => {
    api.archives.archivesList()
      .then(result => setArchives(result.data.archives))
      .catch(error => console.error(error));
  }, []);

  function toggleModal() {
    setShowModal(!showModal);
  }

  async function createArchive() {
    try {
      const result = await api.archives.archivesCreate({
        maximumFileCount: maximumFileCount,
        maximumFileSize: maximumFileSize,
        maximumSize: maximumSize,
        name: archiveName,
      });
      setArchives([...archives, result.data]);
      toggleModal();
    } catch (error) {
      console.error(error);
    }
  }

  const archiveElements = archives.map(archive => <article key={archive.id} className="flex flex-col items-center bg-white rounded-xl p-5">
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
      showModal
      &&
      <Modal className="flex items-center place-content-center" onClick={toggleModal}>
        <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
          <input type="text" placeholder={intl.formatMessage({ id: "archive-name" })} onChange={(event) => setArchiveName(event.target.value)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-size" })} onChange={(event) => setMaximumSize(event.target.valueAsNumber)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-count" })} onChange={(event) => setMaximumFileCount(event.target.valueAsNumber)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-size" })} onChange={(event) => setMaximumFileSize(event.target.valueAsNumber)} />
          <button className="primary" onClick={createArchive}><FormattedMessage id="actions.create" /></button>
        </main>
      </Modal>
    }
    <Fab className="fixed bottom-10 right-10" onClick={toggleModal}><IonShare /></Fab>
    {archives.length === 0 && <div className="flex flex-col flex-1 place-content-center items-center">
      <img src={UndrawEmpty} className="h-96 w-96" />
      <h1 className="text-xl text-gray-800">Nothing to see here</h1>
      <h2 className="text-lg text-gray-500">There are no uploaded files yet</h2>
      <button className="primary" onClick={toggleModal}>Create an archive</button>
    </div>}
    <div className="grid grid-cols-3 gap-5 p-5">{archiveElements}</div>
  </main>
};
export default MainView;
