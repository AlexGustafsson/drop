import React from "react";

import {SVG as UploadIcon} from "../assets/upload-icon.svg";

import "./dropper.css";

type DropperProps = {
  maximumFileCount: number,
  maximumFileSize: number,
  maximumSize: number,
  onChange: (files: File[]) => void,
};

export default class Dropper extends React.Component<DropperProps> {
  private files: File[];

  constructor(props: DropperProps) {
    super(props);

    this.files = [];

    this.handleFileDrop = this.handleFileDrop.bind(this);
    this.handleFileDragOver = this.handleFileDragOver.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.addFiles = this.addFiles.bind(this);
  }

  render() {
    return <div className="dropper" onDrop={this.handleFileDrop} onDragOver={this.handleFileDragOver} onClick={this.handleClick}>
      <UploadIcon className="icon" />
      <p>Drag & Drop your files here</p>
    </div>
  }

  private addFiles(files: File[]) {
    if (this.props.maximumFileCount > 0) {
      if (this.files.length + files.length > this.props.maximumFileCount) {
        alert(`Too many files, may at most upload ${this.props.maximumFileCount}`);
        return;
      }
    }

    if (this.props.maximumSize > 0) {
      const currentSize = this.files.reduce((sum, file) => sum + file.size, 0);
      const droppedSize = files.reduce((sum, file) => sum + file.size, 0);
      if (currentSize + droppedSize > this.props.maximumSize) {
        alert(`Files are too large, may at most be ${this.props.maximumSize}B`);
        return;
      }
    }

    if (this.props.maximumFileSize > 0) {
      const largeFiles = files.filter(file => file.size > this.props.maximumFileSize);
      if (largeFiles.length > 0) {
        alert(`One or more files are too large: ${largeFiles.join(", ")}`);
        return;
      }
    }

    this.files.push(...files);
    if (this.props.onChange)
      this.props.onChange(this.files);
  }

  handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    // Prevent files from being opened
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);
    this.addFiles(droppedFiles);
  }

  handleFileDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.dropEffect = "copy";
  }

  handleClick(_: React.MouseEvent<HTMLDivElement>) {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", () => {
      if (input.files === null)
        return;

      const droppedFiles = Array.from(input.files);
      this.addFiles(droppedFiles);
    });
  }
}
