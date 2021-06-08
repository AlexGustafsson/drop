import { encryptFile } from "./crypto/chacha20";
import { hexToBuffer } from "./crypto/utils";

export type FileUploadEventHandler = (file: File, parameter?: any) => void;
export default class FileUploader {
  private listeners: { [key: string]: FileUploadEventHandler[] };
  private token: string;
  private archiveId: string;
  private key: ArrayBuffer;
  private nonce: ArrayBuffer;

  constructor(token: string, archiveId: string, key: ArrayBuffer, nonce: ArrayBuffer) {
    this.listeners = {}
    this.token = token;
    this.archiveId = archiveId;
    this.key = key;
    this.nonce = nonce;
  }

  private onError(file: File, error: Error) {
    for (const handler of this.listeners["error"] || [])
      handler(file, error);
  }

  async createFile(file: File): Promise<string> {
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
        type: file.type,
      }),
    });

    const response = await fetch(request);
    const body = await response.json();
    return body["id"] as string;
  }

  async upload(file: File) {
    const id = await this.createFile(file);
    const {key, nonce} = this;
    let uploadProgress = 0;
    let encryptProgress = 0;
    encryptFile(key, nonce, file, (error, chunk, offset) => {
      if (error != null) {
        // TODO: handle
        return;
      }
      encryptProgress += chunk.byteLength;
      for (const handler of this.listeners["encrypt"] || [])
        handler(file, encryptProgress / file.size);

      const request = new XMLHttpRequest();
      request.open("POST", `/api/v1/archive/${this.archiveId}/file/${id}`, true);
      request.setRequestHeader("Authorization", `Bearer ${this.token}`);
      request.setRequestHeader("Content-Type", "application/json");
      request.setRequestHeader("Content-Range", `bytes ${offset}-${offset + chunk.byteLength}/${file.size}`);

      // Doesn't seem to be supported for POST?
      // request.onprogress = event => {
      //   uploadProgress += event.loaded;
      //   for (const handler of this.listeners["uploadprogress"] || [])
      //     handler(file, uploadProgress / file.size);
      // };
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          uploadProgress += chunk.byteLength;
          if (uploadProgress === file.size) {
            for (const handler of this.listeners["done"] || [])
              handler(file);
          } else {
            for (const handler of this.listeners["upload"] || [])
              handler(file, uploadProgress / file.size);
          }
        }
      };

      const view = new Uint8Array(chunk, 0, chunk.byteLength);
      request.send(view);

      // TODO: Handle errors, report progress
    });
  }

  addEventListener(event: string, handler: FileUploadEventHandler) {
    if (!this.listeners[event])
      this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
}
