import { ArchiveResponse, FileResponse } from 'drop-client'
import React, { useEffect, useState } from 'react'
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'

import { SVG as FileIcon } from '../assets/file-icon.svg'
import { SVG as IonShare } from '../assets/ion-share.svg'
import UndrawEmpty from '../assets/undraw-empty.svg'
import Archive from '../components/Archive'
import Fab from '../components/Fab'
import File from '../components/File'
import Modal from '../components/Modal'
import { useSnackbars } from '../components/Snackbar'
import { useApi } from '../lib/api'

export default function (): JSX.Element {
  const intl = useIntl()
  const api = useApi()
  const snackbars = useSnackbars()

  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archives, setArchives] = useState<ArchiveResponse[]>([])
  const [files, setFiles] = useState<FileResponse[]>([])
  const [maximumSize, setMaximumSize] = useState(0)
  const [maximumFileCount, setMaximumFileCount] = useState(0)
  const [maximumFileSize, setMaximumFileSize] = useState(0)
  const [archiveName, setArchiveName] = useState('')

  const [showShareArchiveModal, setShowShareArchiveModal] = useState(false)
  const [archiveShareLink, setArchiveShareLink] = useState('')

  const navigate = useNavigate()

  const archiveContextMenu = useContextMenu({
    id: 'archive-context-menu',
  })

  const fileContextMenu = useContextMenu({
    id: 'file-context-menu',
  })

  useEffect(() => {
    api.archives
      .archivesList()
      .then((result) => setArchives(result.data.archives))
      .catch((error) => {
        snackbars.show({
          title: 'An error occured',
          body: `${error}`,
          type: 'error',
        })
      })
  }, [])

  useEffect(() => {
    api.files
      .filesList()
      .then((result) => setFiles(result.data.files))
      .catch((error) => {
        snackbars.show({
          title: 'An error occured',
          body: `${error}`,
          type: 'error',
        })
      })
  }, [])

  function toggleCreateArchiveModal() {
    setShowArchiveModal(!showArchiveModal)
  }

  function toggleShareArchiveModal() {
    setShowShareArchiveModal(!showShareArchiveModal)
  }

  async function createArchive() {
    try {
      const result = await api.archives.archivesCreate({
        maximumFileCount: maximumFileCount,
        maximumFileSize: maximumFileSize,
        maximumSize: maximumSize,
        name: archiveName,
      })
      setArchives([...archives, result.data])
      toggleCreateArchiveModal()
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
    }
  }

  async function createArchiveToken(archiveId: string, lifetime: number) {
    try {
      const result = await api.archives.tokensCreate(archiveId, { lifetime })
      // TODO: Set actual link by using hosted path, how to treat secret?
      setArchiveShareLink(
        `http://localhost:3000/upload#token=${result.data.token}`
      )
      toggleShareArchiveModal()
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
    }
  }

  function showArchive({ props }: ItemParams<ArchiveResponse>) {
    navigate(`/archives/${props?.id}`)
  }

  async function shareArchive({ props }: ItemParams<ArchiveResponse>) {
    await createArchiveToken(props!.id, 3600)
    setShowShareArchiveModal(true)
  }

  async function deleteArchive({ props }: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id)
      setArchives(archives.filter((x) => x.id !== props!.id))
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
    }
  }

  function downloadFile({ props }: ItemParams<FileResponse>) {
    // TODO: https://reactjs.org/docs/hooks-custom.html
    const snackbar = snackbars.show({
      title: `Downloading ${props?.name}`,
      body: '',
      type: 'default',
    })
    let i = 0
    const interval = setInterval(() => {
      snackbar.setBody?.(i.toString())
      i++
    }, 100)
    snackbar.removed = () => {
      clearInterval(interval)
    }
  }

  async function deleteFile({ props }: ItemParams<FileResponse>) {
    try {
      await api.archives.filesDelete(props!.archiveId, props!.id)
      setFiles(files.filter((x) => x.id !== props!.id))
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
    }
  }

  const archiveElements = archives.map((archive) => (
    <Archive
      key={archive.id}
      archive={archive}
      onMore={archiveContextMenu.show}
    />
  ))
  const fileElements = files.map((file) => (
    <File key={file.id} file={file} onMore={fileContextMenu.show} />
  ))

  return (
    <main className="container relative flex flex-col w-full">
      {showArchiveModal && (
        <Modal
          className="flex items-center place-content-center"
          onClick={toggleCreateArchiveModal}
        >
          <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
            <input
              type="text"
              placeholder={intl.formatMessage({ id: 'archive-name' })}
              onChange={(event) => setArchiveName(event.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder={intl.formatMessage({ id: 'max-size' })}
              onChange={(event) => setMaximumSize(event.target.valueAsNumber)}
            />
            <input
              type="number"
              min="0"
              placeholder={intl.formatMessage({ id: 'max-file-count' })}
              onChange={(event) =>
                setMaximumFileCount(event.target.valueAsNumber)
              }
            />
            <input
              type="number"
              min="0"
              placeholder={intl.formatMessage({ id: 'max-file-size' })}
              onChange={(event) =>
                setMaximumFileSize(event.target.valueAsNumber)
              }
            />
            <button className="primary" onClick={createArchive}>
              <FormattedMessage id="actions.create" />
            </button>
          </main>
        </Modal>
      )}
      {showShareArchiveModal && (
        <Modal
          className="flex items-center place-content-center"
          onClick={toggleShareArchiveModal}
        >
          <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
            <a className="text-primary" href={archiveShareLink}>
              <FormattedMessage id="actions.copy" />
            </a>
          </main>
        </Modal>
      )}

      {archives.length === 0 && (
        <div className="flex flex-col flex-1 place-content-center items-center">
          <img src={UndrawEmpty} className="h-96 w-96" />
          <h1 className="text-xl text-gray-800">Nothing to see here</h1>
          <h2 className="text-lg text-gray-500">
            There are no uploaded files yet
          </h2>
          <button className="primary" onClick={toggleCreateArchiveModal}>
            Create an archive
          </button>
        </div>
      )}

      {archives.length > 0 && (
        <main className="mr-80 p-5">
          <header className="flex place-content-between items-center mb-2">
            <h1 className="text-lg text-gray-800">Recent Archives</h1>
            <Link to="/archives" className="text-base text-primary">
              See all
            </Link>
          </header>
          <div className="grid grid-cols-3 gap-5">{archiveElements}</div>

          <header className="flex place-content-between items-center mt-5 mb-2">
            <h1 className="text-lg text-gray-800">Recent Files</h1>
            <Link to="/files" className="text-base text-primary">
              See all
            </Link>
          </header>
          <div className="grid gap-y-2">
            <div className="grid grid-cols-table-5 text-sm text-gray-500 p-2">
              <p>Name</p>
              <p>File Format</p>
              <p>Uploaded</p>
              <p>Size</p>
            </div>
            {fileElements}
          </div>
        </main>
      )}

      {archives.length > 0 && (
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
      )}

      <div className="fixed container bottom-0">
        <Fab
          className="absolute bottom-10 right-10"
          onClick={toggleCreateArchiveModal}
        >
          <IonShare />
        </Fab>
      </div>

      <Menu id="archive-context-menu" animation={false}>
        <Item onClick={showArchive}>Show archive</Item>
        <Item onClick={shareArchive}>Share</Item>
        <Item className="danger" onClick={deleteArchive}>
          Delete
        </Item>
      </Menu>

      <Menu id="file-context-menu" animation={false}>
        <Item onClick={downloadFile}>Download file</Item>
        <Item onClick={showArchive}>Show archive</Item>
        <Item onClick={deleteFile} className="danger">
          Delete
        </Item>
      </Menu>
    </main>
  )
}
