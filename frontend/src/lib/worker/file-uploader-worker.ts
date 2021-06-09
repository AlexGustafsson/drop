
import type {InitializeMessage, Message, UploadFileMessage} from "./types";
import { encryptFile } from "../crypto/chacha20";
import { bufferToHex, hexToBuffer, generateNonce } from "../crypto/utils";

export default class FileUploader {
  private token: string;
  private archiveId: string;
  private key: ArrayBuffer;

  private sendMessage(message: Message) {
    postMessage(message);
  }

  private sendProgressMessage(internalFileId: string, encryptionProgress: number, uploadProgress: number) {
    this.sendMessage({
      type: "progress",
      message: {internalFileId, encryptionProgress, uploadProgress},
    });
  }

  async createFile(file: File, nonce: ArrayBuffer): Promise<string> {
    const request = new Request(`/api/v1/archive/${this.archiveId}/file`, {
      method: "POST",
      headers: new Headers({
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        mime: file.type,
        nonce: bufferToHex(nonce),
      }),
    });

    const response = await fetch(request);
    const body = await response.json();
    return body["id"] as string;
  }

  async upload(file: File, internalFileId: string) {
    const nonce = generateNonce();
    const id = await this.createFile(file, nonce);
    let uploadProgress = 0;
    let encryptionProgress = 0;
    encryptFile(this.key, nonce, file, (error, chunk, offset) => {
      if (error != null) {
        // TODO: handle
        return;
      }

      encryptionProgress += chunk.byteLength;
      this.sendProgressMessage(internalFileId, encryptionProgress / file.size, uploadProgress / file.size);

      const request = new XMLHttpRequest();
      request.open("POST", `/api/v1/archive/${this.archiveId}/file/${id}`, true);
      request.setRequestHeader("Authorization", `Bearer ${this.token}`);
      request.setRequestHeader("Content-Type", "application/json");
      request.setRequestHeader("Content-Range", `bytes ${offset}-${offset + chunk.byteLength}/${file.size}`);

      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          uploadProgress += chunk.byteLength;
          this.sendProgressMessage(internalFileId, encryptionProgress / file.size, uploadProgress / file.size);
        }
      };

      const view = new Uint8Array(chunk, 0, chunk.byteLength);
      request.send(view);

      // TODO: Handle errors
    });
  }

  handleMessage(event: MessageEvent) {
    const message = event.data as Message;
    if (message.type === "initialize") {
      const initializeMessage = message.message as InitializeMessage;
      this.key = hexToBuffer(initializeMessage.key);
      this.token = initializeMessage.token;
      this.archiveId = initializeMessage.archiveId;
    } else if (message.type === "upload") {
      const uploadMessage = message.message as UploadFileMessage;
      this.upload(uploadMessage.file, uploadMessage.internalFileId);
    }
  }
}
