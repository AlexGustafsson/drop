import type { Message, ProgressMessage } from "./types";
import WorkerModule from "../../worker?worker";

export type FileUploadEventHandler = (file: File, parameter?: any) => void;
export default class FileUploader {
  private listeners: { [key: string]: FileUploadEventHandler[] };
  private files: { [internalFileId: string]: File };
  private worker: Worker;

  constructor(token: string, archiveId: string, key: string) {
    this.listeners = {};
    this.files = {};
    this.worker = new WorkerModule();
    this.worker.addEventListener("message", this.handleMessage.bind(this));
    this.worker.addEventListener("error", this.handleError.bind(this));
    this.worker.addEventListener("messageerror", this.handleMessageError.bind(this));
    this.sendInitializeMessage(token, archiveId, key);
  }

  private sendMessage(message: Message) {
    this.worker?.postMessage(message, []);
  }

  private sendInitializeMessage(token: string, archiveId: string, key: string) {
    this.sendMessage({
      type: "initialize",
      message: { token, archiveId, key },
    });
  }

  private sendUploadMessage(file: File, internalFileId: string) {
    this.sendMessage({
      type: "upload",
      message: {file, internalFileId},
    });
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as Message;
    if (message.type === "initialized") {
      console.log("Initialized");
    } else if (message.type === "progress") {
      const progressMessage = message.message as ProgressMessage;
      const file = this.files[progressMessage.internalFileId];
      this.dispatchEvent("encrypt", file, progressMessage.encryptionProgress);
      this.dispatchEvent("upload", file, progressMessage.uploadProgress);
      if (progressMessage.uploadProgress === 1)
        this.dispatchEvent("done", file);
    }
  }

  private handleError(event: Event) {
    console.error("An error occured", event);
  }

  private handleMessageError(event: MessageEvent) {
    console.error("Unable to deserialize message", event);
  }

  private dispatchEvent(event: string, file: File, parameter?: any) {
    for (const handler of this.listeners[event] || [])
      handler(file, parameter);
  }

  upload(file: File) {
    const internalFileId = Object.values(this.files).length.toString();
    this.files[internalFileId] = file;
    this.sendUploadMessage(file, internalFileId);
  }

  addEventListener(event: string, handler: FileUploadEventHandler) {
    if (!this.listeners[event])
      this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
}
