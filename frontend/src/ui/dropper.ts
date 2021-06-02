type DropperEventHandler = (Any?) => void;

export default class Dropper {
  private element: Element;
  private listeners: { [key: string]: DropperEventHandler[] };

  public files: File[];

  constructor(element: Element) {
    this.element = element;
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
