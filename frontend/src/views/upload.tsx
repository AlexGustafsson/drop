import React from "react";

import Dropper from "../components/dropper";
import DroppedFile from "../components/dropped-file";
import { auth } from "../lib/auth";
import FileUploader from "../lib/worker/file-uploader";

type FileUpload = {
  file: File,
  internalFileId: string,
  uploadProgress: number,
  encryptionProgress: number,
};

type UploadViewState = {
  files: FileUpload[],
};

export default class UploadView extends React.Component<{}, UploadViewState> {
  maximumFileCount: number;
  maximumFileSize: number;
  maximumSize: number;

  state: UploadViewState = {
    files: [],
  };

  private fileUploader: FileUploader | null;

  constructor(props: {}) {
    super(props);

    this.fileUploader = new FileUploader(auth.uploadToken!.toString(), auth.uploadToken!.archiveId, auth.uploadSecret!);
    this.fileUploader.addEventListener("upload", this.onUploadProgress.bind(this));
    this.fileUploader.addEventListener("encrypt", this.onEncryptionProgress.bind(this));
    this.fileUploader.addEventListener("done", this.onUploadDone.bind(this));
    this.maximumFileCount = auth.uploadToken!.maximumFileCount;
    this.maximumFileSize = auth.uploadToken!.maximumFileSize;
    this.maximumSize = auth.uploadToken!.maximumSize;

    this.filesChanged = this.filesChanged.bind(this);
  }

  private onUploadProgress(file: File, progress: number) {

  }

  private onEncryptionProgress(file: File, progress: number) {

  }

  private onUploadDone(file: File) {
    console.log("Done");
  }

  private filesChanged(files: File[]) {
    this.setState((state: UploadViewState, props: {}) => {
      for (let i = state.files.length; i < files.length; i++) {
        state.files[i] = {file: files[i], internalFileId: i.toString(), uploadProgress: 0, encryptionProgress: 0};
        this.fileUploader?.upload(files[i]);
      }

      return state;
    });
  }

  render() {
    const files = this.state.files.map(file => {
      return <DroppedFile key={file.internalFileId} title={file.file.name} uploadProgress={file.uploadProgress} encryptionProgress={file.encryptionProgress} />
    });

    return <main className="flex flex-col flex-1 place-content-center items-center">
      <article className="bg-white py-10 px-8 rounded-xl">
        <h1 className="text-xl text-gray-800 text-center">Upload your files</h1>
        <h2 className="text-lg text-gray-500 text-center">Any files are supported, but large files may take longer to process</h2>
        <Dropper onChange={this.filesChanged} maximumFileCount={this.maximumFileCount} maximumFileSize={this.maximumFileSize} maximumSize={this.maximumSize} />
        <div className="max-h-60 overflow-y-scroll">
          <ul>
            {files}
          </ul>
        </div>
      </article>
    </main>
  }
}
