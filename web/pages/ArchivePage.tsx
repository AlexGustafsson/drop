import { ArchiveResponse, FileResponse } from 'drop-client'
import React, { useEffect, useState } from 'react'
import { ItemParams } from 'react-contexify'
import { useNavigate, useParams } from 'react-router-dom'

import Archive from '../components/Archive'
import File from '../components/File'
import { useSnackbars } from '../components/Snackbar'
import { useApi } from '../lib/api'

export default function (): JSX.Element {
  const navigate = useNavigate()

  const snackbars = useSnackbars()

  const [archive, setArchive] = useState<ArchiveResponse | null>(null)

  const params = useParams<{ archiveId: string }>()

  const api = useApi()
  useEffect(() => {
    api.archives
      .archivesDetail(params.archiveId!)
      .then((result) => setArchive(result.data))
      .catch((error) => {
        snackbars.show({
          title: 'An error occured',
          body: `${error}`,
          type: 'error',
        })
      })
  }, [])

  const [files, setFiles] = useState<FileResponse[]>([])
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

  async function deleteArchive({ props }: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id)
      navigate('/')
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
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

  const fileElements = files.map((file) => (
    <File key={file.id} file={file} onMore={() => {}} />
  ))

  return (
    <main className="container relative flex flex-col w-full">
      {archive !== null && (
        <Archive key={archive.id} archive={archive} onMore={() => {}} />
      )}

      <main className="mr-80 p-5">
        <h1 className="text-lg text-gray-800 mt-5 mb-2">Files</h1>
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
    </main>
  )
}
