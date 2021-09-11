import React, { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { useHistory } from "react-router";

import {useApi} from "../lib/api";

import {humanReadableBytes} from "../lib/utils";
import Fab from "../components/fab";
import { SVG as IonShare } from "../assets/ion-share.svg";
import { SVG as FileIcon } from "../assets/file-icon.svg";
import { SVG as MoreIcon } from "../assets/ion-more.svg";
import UndrawEmpty from "../assets/undraw-empty.svg";

import {
  Menu,
  Item,
  useContextMenu,
  animation,
  ItemParams
} from "react-contexify";

import "react-contexify/dist/ReactContexify.css";

import Modal from "../components/modal";
import { ArchiveResponse } from "drop-client";
import { useSnackbars } from "../components/snackbar";
import { Link } from "react-router-dom";

const MainView = (): JSX.Element => {
  const intl = useIntl();
  const api = useApi();
  const snackbars = useSnackbars();

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archives, setArchives] = useState<ArchiveResponse[]>([]);
  const [maximumSize, setMaximumSize] = useState(0);
  const [maximumFileCount, setMaximumFileCount] = useState(0);
  const [maximumFileSize, setMaximumFileSize] = useState(0);
  const [archiveName, setArchiveName] = useState("");

  const [showShareArchiveModal, setShowShareArchiveModal] = useState(false);
  const [archiveShareLink, setArchiveShareLink] = useState("");

  const history = useHistory();

  const archiveContextMenu = useContextMenu({
    id: "archive-context-menu"
  });

  const fileContextMenu = useContextMenu({
    id: "file-context-menu"
  });

  useEffect(() => {
    api.archives.archivesList()
      .then(result => setArchives(result.data.archives))
      .catch(error => {
        if (error.error)
          snackbars.show({title: "An error occured", body: error.error.error, type: "error"});
        else
          snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
      });
  }, []);

  function toggleCreateArchiveModal() {
    setShowArchiveModal(!showArchiveModal);
  }

  function toggleShareArchiveModal() {
    setShowShareArchiveModal(!showShareArchiveModal);
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
      toggleCreateArchiveModal();
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
  }

  async function createArchiveToken(archiveId: string, lifetime: number) {
    try {
      const result = await api.archives.tokensCreate(
        archiveId,
        {lifetime},
      )
      // TODO: Set actual link by using hosted path, how to treat secret?
      setArchiveShareLink(`http://localhost:3000/upload#token=${result.data.token}`);
      toggleShareArchiveModal();
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
  }

  function showArchive({ props }: ItemParams<ArchiveResponse>) {
    history.push(`/archives/${props?.id}`);
  }

  function shareArchive({ props }: ItemParams<ArchiveResponse>) {
    setShowShareArchiveModal(true)
  }

  async function deleteArchive({props}: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id);
      setArchives(archives.filter(x => x.id !== props!.id));
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
  }

  const archiveElements = archives.map(archive => <Link to="/archives/archive" key={archive.id}>
    <div className="relative bg-white rounded-xl p-5">
      <MoreIcon className="absolute w-6 text-gray-500 top-2 right-2 cursor-pointer" onClick={e => archiveContextMenu.show(e, {props: archive})} />
      <FileIcon className="w-8 text-primary" />
      <p className="text-lg text-gray">{archive.name}</p>
    </div>
  </Link>);

  return <main className="container relative flex flex-col w-full">
    {
      showArchiveModal
      &&
      <Modal className="flex items-center place-content-center" onClick={toggleCreateArchiveModal}>
        <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
          <input type="text" placeholder={intl.formatMessage({ id: "archive-name" })} onChange={(event) => setArchiveName(event.target.value)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-size" })} onChange={(event) => setMaximumSize(event.target.valueAsNumber)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-count" })} onChange={(event) => setMaximumFileCount(event.target.valueAsNumber)} />
          <input type="number" min="0" placeholder={intl.formatMessage({ id: "max-file-size" })} onChange={(event) => setMaximumFileSize(event.target.valueAsNumber)} />
          <button className="primary" onClick={createArchive}><FormattedMessage id="actions.create" /></button>
        </main>
      </Modal>
    }
    {
      showShareArchiveModal
      &&
      <Modal className="flex items-center place-content-center" onClick={toggleShareArchiveModal}>
        <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
          <a className="text-primary" href={archiveShareLink}><FormattedMessage id ="actions.copy" /></a>
        </main>
      </Modal>
    }

    {archives.length === 0 && <div className="flex flex-col flex-1 place-content-center items-center">
      <img src={UndrawEmpty} className="h-96 w-96" />
      <h1 className="text-xl text-gray-800">Nothing to see here</h1>
      <h2 className="text-lg text-gray-500">There are no uploaded files yet</h2>
      <button className="primary" onClick={toggleCreateArchiveModal}>Create an archive</button>
    </div>}

    <main className="mr-80 p-5">
      <header className="flex place-content-between items-center mb-2">
        <h1 className="text-lg text-gray-800">Recent Archives</h1>
        <Link to="/archives" className="text-base text-primary">See all</Link>
      </header>
      <div className="grid grid-cols-3 gap-5">
        {archiveElements}
      </div>

      <header className="flex place-content-between items-center mt-5 mb-2">
        <h1 className="text-lg text-gray-800">Recent Files</h1>
        <Link to="/files" className="text-base text-primary">See all</Link>
      </header>
      <div className="grid gap-y-2">
        <div className="grid grid-cols-table-5 text-sm text-gray-500 p-2">
          <p>Name</p>
          <p>File Format</p>
          <p>Uploaded</p>
          <p>Size</p>
        </div>
        <div className="grid grid-cols-table-5 bg-white items-center p-2 rounded-xl">
          <div className="flex flex-row items-center">
            <FileIcon className="w-6 mr-2 text-primary" />
            <p>The Design Guidelines</p>
          </div>
          <p>PDF</p>
          <p>5 minutes ago</p>
          <p>5 MB</p>
          <MoreIcon className="w-6 text-gray-500 top-2 right-2 cursor-pointer" onClick={e => fileContextMenu.show(e, { props: {} })}  />
        </div>
      </div>
    </main>

    <aside className="fixed container right-0 top-0 bottom-0 p-2 pt-5 bg-white w-80 bg-white">
      <ul className="flex flex-col items-center">
        <li className="grid grid-cols-triple-lg items-center w-64 mb-2">
          <FileIcon className="w-8 text-primary" />
          <div className="flex-grow">
            <p className="text-base text-gray-800">Images</p>
            <p className="text-base text-gray-500">12 files</p>
          </div>
          <p className="text-lg text-primary">17.5 GB</p>
        </li>
        <li className="grid grid-cols-triple-lg items-center w-64 mb-2">
          <FileIcon className="w-8 text-primary" />
          <div>
            <p className="text-base text-gray-800">Videos</p>
            <p className="text-base text-gray-500">2 files</p>
          </div>
          <p className="text-lg text-primary">1.2 GB</p>
        </li>
        <li className="grid grid-cols-triple-lg items-center w-64 mb-2">
          <FileIcon className="w-8 text-primary" />
          <div>
            <p className="text-base text-gray-800">Other</p>
            <p className="text-base text-gray-500">100 files</p>
          </div>
          <p className="text-lg text-primary">12 MB</p>
        </li>
      </ul>
    </aside>

    <div className="fixed container bottom-0">
      <Fab className="absolute bottom-10 right-10" onClick={toggleCreateArchiveModal}><IonShare /></Fab>
    </div>

    <Menu id="archive-context-menu" animation={false}>
      <Item onClick={showArchive}>Show archive</Item>
      <Item onClick={shareArchive}>Share</Item>
      <Item className="danger" onClick={deleteArchive}>Delete</Item>
    </Menu>

    <Menu id="file-context-menu" animation={false}>
      <Item>Download file</Item>
      <Item>Show archive</Item>
      <Item className="danger">Delete</Item>
    </Menu>
  </main>
};
export default MainView;
