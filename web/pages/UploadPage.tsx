import React, { useEffect, useState } from 'react'

import DroppedFile from '../components/DroppedFile'
import Dropper from '../components/Dropper'
import { useAuth } from '../lib/auth'
import FileUploader from '../lib/worker/file-uploader'

type FileUpload = {
  file: File
  internalFileId: string
  uploadProgress: number
  encryptionProgress: number
}

export default function (): JSX.Element {
  const auth = useAuth()

  const [fileUploader, setFileUploader] = useState<FileUploader | null>(null)
  const [files, setFiles] = useState<FileUpload[]>([])

  const maximumFileCount = auth.uploadToken!.maximumFileCount
  const maximumFileSize = auth.uploadToken!.maximumFileSize
  const maximumSize = auth.uploadToken!.maximumSize

  useEffect(() => {
    setFileUploader(
      new FileUploader(
        auth.uploadToken!.toString(),
        auth.uploadToken!.archiveId,
        auth.uploadSecret!
      )
    )
  }, [])

  function filesChanged(addedFiles: File[]) {
    setFiles((files) => {
      const newFiles = [...files]
      for (let i = newFiles.length; i < addedFiles.length; i++) {
        newFiles[i] = {
          file: addedFiles[i],
          internalFileId: i.toString(),
          uploadProgress: 0,
          encryptionProgress: 0,
        }
        fileUploader?.upload(addedFiles[i])
      }
      return newFiles
    })
  }

  const fileElements = files.map((file) => {
    return (
      <DroppedFile
        key={file.internalFileId}
        title={file.file.name}
        uploadProgress={file.uploadProgress}
        encryptionProgress={file.encryptionProgress}
      />
    )
  })

  return (
    <main className="flex flex-col flex-1 place-content-center items-center">
      <article className="bg-white py-10 px-8 rounded-xl">
        <h1 className="text-xl text-gray-800 text-center">Upload your files</h1>
        <h2 className="text-lg text-gray-500 text-center">
          Any files are supported, but large files may take longer to process
        </h2>
        <Dropper
          onChange={filesChanged}
          maximumFileCount={maximumFileCount}
          maximumFileSize={maximumFileSize}
          maximumSize={maximumSize}
        />
        <div className="max-h-60 overflow-y-scroll">
          <ul>{fileElements}</ul>
        </div>
      </article>
    </main>
  )
}
