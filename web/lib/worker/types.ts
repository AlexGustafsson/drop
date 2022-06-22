export type InitializeMessage = {
  key: string
  archiveId: string
  token: string
}

export type UploadFileMessage = {
  file: File
  internalFileId: string
}

export type ProgressMessage = {
  internalFileId: string
  encryptionProgress: number
  uploadProgress: number
}

export type Message = {
  type: string
  message: InitializeMessage | UploadFileMessage | ProgressMessage | null
}
