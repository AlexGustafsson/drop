
import type {Message, UploadFileMessage} from "./types";
import { encryptFile } from "../crypto/chacha20";
import { bufferToHex, generateNonce } from "../crypto/utils";

export default class FileUploader {
  private token: string;
  private archiveId: string;
  private key: ArrayBuffer;

  constructor(token: string, archiveId: string, key: ArrayBuffer) {
    this.token = token;
    this.archiveId = archiveId;
    this.key = key;
  }

  private sendMessage(message: Message) {
    // Without this TypeScript complains about postMessage requiring a second parameter,
    // whilst in reality it does not
    const post = postMessage as (message: any) => void;
    post(message);
  }

  private sendProgressMessage(internalFileId: string, encryptionProgress: number, uploadProgress: number) {
    this.sendMessage({
      type: "progress",
      message: {internalFileId, encryptionProgress, uploadProgress},
    });
  }

  async createFile(file: File, nonce: ArrayBuffer): Promise<string> {
    const request = new Request(`${DROP_API_ROOT}/api/v1/archive/${this.archiveId}/file`, {
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
      if (error != null || chunk === null) {
        // TODO: handle
        return;
      }

      encryptionProgress += chunk.byteLength;
      this.sendProgressMessage(internalFileId, encryptionProgress / file.size, uploadProgress / file.size);

      const request = new XMLHttpRequest();
      request.open("POST", `${DROP_API_ROOT}/api/v1/archive/${this.archiveId}/file/${id}`, true);
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
    if (message.type === "upload") {
      const uploadMessage = message.message as UploadFileMessage;
      this.upload(uploadMessage.file, uploadMessage.internalFileId);
    }
  }
}
