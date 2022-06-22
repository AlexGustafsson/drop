import React, { useRef, useState } from 'react'

import { SVG as UploadIcon } from '../assets/upload-icon.svg'

type DropperProps = {
  maximumFileCount: number
  maximumFileSize: number
  maximumSize: number
  onChange: (files: File[]) => void
}

const Dropper = ({
  maximumFileCount,
  maximumFileSize,
  maximumSize,
  onChange,
}: DropperProps): JSX.Element => {
  const [files, setFiles] = useState<File[]>([])
  const filesRef = useRef(files)

  function addFiles(addedFiles: File[]) {
    if (maximumFileCount > 0) {
      if (addedFiles.length + filesRef.current.length > maximumFileCount) {
        alert(`Too many files, may at most upload ${maximumFileCount}`)
        return filesRef.current
      }
    }

    if (maximumSize > 0) {
      const currentSize = filesRef.current.reduce(
        (sum, file) => sum + file.size,
        0
      )
      const addedSize = addedFiles.reduce((sum, file) => sum + file.size, 0)
      if (currentSize + addedSize > maximumSize) {
        alert(`Files are too large, may at most be ${maximumSize}B`)
        return filesRef.current
      }
    }

    if (maximumFileSize > 0) {
      const largeFiles = addedFiles.filter(
        (file) => file.size > maximumFileSize
      )
      if (largeFiles.length > 0) {
        alert(`One or more files are too large: ${largeFiles.join(', ')}`)
        return filesRef.current
      }
    }

    const newFiles = [...filesRef.current, ...addedFiles]
    filesRef.current = newFiles
    setFiles(filesRef.current)
    onChange(filesRef.current)
  }

  function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    // Prevent files from being opened
    event.preventDefault()
    event.stopPropagation()

    const droppedFiles = Array.from(event.dataTransfer.files)
    addFiles(droppedFiles)
  }

  function handleFileDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleClick(_: React.MouseEvent<HTMLDivElement>) {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    input.addEventListener('change', () => {
      if (input.files === null) return

      const droppedFiles = Array.from(input.files)
      addFiles(droppedFiles)
    })
  }

  return (
    <div
      className="flex flex-col items-center justify-content-center bg-gray-50 rounded-lg border-2 border-dashed border-primary border-primary-light py-7 my-5 cursor-pointer"
      onDrop={handleFileDrop}
      onDragOver={handleFileDragOver}
      onClick={handleClick}
    >
      <UploadIcon className="w-24 text-gray-400" />
      <p className="text-gray-400">Drag & Drop your files here</p>
    </div>
  )
}
export default Dropper
