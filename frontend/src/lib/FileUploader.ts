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
    const fileStream = new ReadableStream({
      start(controller) {
        encryptFile(key, nonce, file, (error, chunk, offset) => {
          if (error != null) {
            // TODO: handle
            return;
          }

          controller.enqueue(chunk);
        });
      }
    });

    const {readable, writable} = new TransformStream();

    fileStream.pipeTo(writable);

    const request = new Request(`/api/v1/archive/${this.archiveId}/file/${id}`, {
      method: "POST",
      headers: new Headers({
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      }),
      mode: "same-origin",
      body: readable,
    });

    await fetch(request, { mode: "same-origin", allowHTTP1ForStreamingUpload: true } as RequestInit);

    // TODO:
    // https://web.dev/fetch-upload-streaming/
    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    // Rewrite things to use the streaming API instead? That way
    // perhaps chunking becomes easier to handle...

    // await encryptFile(this.key, this.nonce, file, (error, chunk, offset) => {
    //   if (error !== null) {
    //     this.onError(file, error);
    //     return;
    //   }
    // });

    for (const handler of this.listeners["done"] || [])
      handler(file);
  }

  addEventListener(event: string, handler: FileUploadEventHandler) {
    if (!this.listeners[event])
      this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
}
