import { FileResponse } from 'drop-client'
import React, { useEffect, useState } from 'react'
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify'
import { useNavigate } from 'react-router-dom'

import File from '../components/File'
import { useSnackbars } from '../components/Snackbar'
import { useApi } from '../lib/api'

export default function (): JSX.Element {
  const navigate = useNavigate()

  const snackbars = useSnackbars()

  const [files, setFiles] = useState<FileResponse[]>([])
  const api = useApi()
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

  const fileContextMenu = useContextMenu({
    id: 'file-context-menu',
  })

  function showArchive({ props }: ItemParams<FileResponse>) {
    navigate(`/archives/${props?.archiveId}`)
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

  const fileElements = files.map((file) => (
    <File key={file.id} file={file} onMore={fileContextMenu.show} />
  ))

  return (
    <main className="container relative flex flex-col w-full">
      <div className="grid grid-cols-3 gap-5">{fileElements}</div>

      <Menu id="file-context-menu" animation={false}>
        <Item onClick={showArchive}>Download</Item>
        <Item onClick={showArchive}>Show archive</Item>
        <Item className="danger" onClick={deleteFile}>
          Delete
        </Item>
      </Menu>
    </main>
  )
}
