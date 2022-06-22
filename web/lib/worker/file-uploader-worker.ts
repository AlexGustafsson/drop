import {
  AES_GCM_IV_BYTES,
  CHUNK_SIZE,
  EncryptionStream,
  FileStream,
} from '../crypto/streams'
import { calculateEncryptedFileSize } from '../crypto/utils'
import type { Message, UploadFileMessage } from './types'

export default class FileUploader {
  private token: string
  private archiveId: string
  private key: CryptoKey

  constructor(token: string, archiveId: string, key: CryptoKey) {
    this.token = token
    this.archiveId = archiveId
    this.key = key
  }

  private sendMessage(message: Message) {
    // Without this TypeScript complains about postMessage requiring a second parameter,
    // whilst in reality it does not
    const post = postMessage as (message: any) => void
    post(message)
  }

  private sendProgressMessage(
    internalFileId: string,
    encryptionProgress: number,
    uploadProgress: number
  ) {
    this.sendMessage({
      type: 'progress',
      message: { internalFileId, encryptionProgress, uploadProgress },
    })
  }

  async createFile(file: File): Promise<string> {
    const encryptedFileSize = calculateEncryptedFileSize(file)
    const request = new Request(
      `${DROP_API_ROOT}/archives/${this.archiveId}/files`,
      {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          name: file.name,
          lastModified: file.lastModified,
          size: file.size,
          encryptedSize: encryptedFileSize,
          mime: file.type,
        }),
      }
    )

    const response = await fetch(request)
    const body = await response.json()
    return body['id'] as string
  }

  async upload(file: File, internalFileId: string) {
    const encryptedFileSize = calculateEncryptedFileSize(file)
    console.log('file size', file.size)
    console.log('encrypted size', encryptedFileSize)
    const id = await this.createFile(file)
    let uploadProgress = 0
    const encryptionProgress = 0
    const stream = new FileStream(file).pipeThrough(
      new EncryptionStream(this.key)
    )
    const reader = stream.getReader()

    let offset = 0
    const process = ({
      done,
      value,
    }: {
      done: boolean
      value?: ArrayBuffer
    }) => {
      if (done) {
        console.log('uploaded')
        return
      }

      if (!value) {
        console.log('got empty chunk')
        return
      }

      const request = new XMLHttpRequest()
      request.open(
        'POST',
        `${DROP_API_ROOT}/archives/${this.archiveId}/files/${id}/content`,
        true
      )
      request.setRequestHeader('Authorization', `Bearer ${this.token}`)
      request.setRequestHeader('Content-Type', 'application/json')
      request.setRequestHeader(
        'Content-Range',
        `bytes ${offset}-${offset + value.byteLength}/${encryptedFileSize}`
      )

      request.onreadystatechange = () => {
        if (
          request.readyState === XMLHttpRequest.DONE &&
          request.status === 200
        ) {
          uploadProgress += value.byteLength
          this.sendProgressMessage(
            internalFileId,
            encryptionProgress / encryptedFileSize,
            uploadProgress / encryptedFileSize
          )
        }
      }

      const view = new Uint8Array(value, 0, value.byteLength)
      request.send(view)
      offset += value.byteLength

      // Process next chunk
      reader.read().then(process)
    }

    // Kickstart the flow
    reader.read().then(process)
  }

  handleMessage(event: MessageEvent) {
    const message = event.data as Message
    if (message.type === 'upload') {
      const uploadMessage = message.message as UploadFileMessage
      this.upload(uploadMessage.file, uploadMessage.internalFileId)
    }
  }
}
