type DropperEventHandler = (Any?) => void;

type DropperOptions = {
  maximumFileCount: number,
  maximumFileSize: number,
  maximumSize: number,
};

export default class Dropper {
  private element: Element;
  private options: DropperOptions
  private listeners: { [key: string]: DropperEventHandler[] };

  public files: File[];

  constructor(element: Element, options: DropperOptions) {
    this.element = element;
    this.options = options;
    this.listeners = {};

    this.files = [];

    this.element.addEventListener("drop", this.handleFileDrop.bind(this));
    this.element.addEventListener("dragover", this.handleFileDragOver.bind(this));
    this.element.addEventListener("click", this.handleClick.bind(this));
  }

  handleFileDrop(event: DragEvent) {
    // Prevent files from being opened
    event.preventDefault();
    event.cancelBubble = true;

    const droppedFiles = Array.from(event.dataTransfer.files);

    if (this.options.maximumFileCount > 0) {
      if (this.files.length + droppedFiles.length > this.options.maximumFileCount) {
        alert(`Too many files, may at most upload ${this.options.maximumFileCount}`);
        return;
      }
    }

    if (this.options.maximumSize > 0) {
      const currentSize = this.files.reduce((sum, file) => sum + file.size, 0);
      const droppedSize = droppedFiles.reduce((sum, file) => sum + file.size, 0);
      if (currentSize + droppedSize > this.options.maximumSize) {
        alert(`Files are too large, may at most be ${this.options.maximumSize}B`);
        return;
      }
    }

    if (this.options.maximumFileSize > 0) {
      const largeFiles = droppedFiles.filter(file => file.size > this.options.maximumFileSize);
      if (largeFiles.length > 0) {
        alert(`One or more files are too large: ${largeFiles.join(", ")}`);
        return;
      }
    }

    this.files.push(...droppedFiles);
    for (const handler of this.listeners["drop"] || [])
      handler(droppedFiles);
  }

  handleFileDragOver(event: DragEvent) {
    event.dataTransfer.dropEffect = "copy";
  }

  handleClick(_: MouseEvent) {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", () => {
      const droppedFiles = Array.from(input.files);
      this.files.push(...droppedFiles);
      for (const handler of this.listeners["drop"] || [])
        handler(droppedFiles);
    });
  }

  addEventListener(event: string, handler: DropperEventHandler) {
    if (!this.listeners[event])
      this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
}
