const FileIcon = `
<svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512">
  <path
    d="M312 155h91c2.8 0 5-2.2 5-5 0-8.9-3.9-17.3-10.7-22.9L321 63.5c-5.8-4.8-13-7.4-20.6-7.4-4.1 0-7.4 3.3-7.4 7.4V136c0 10.5 8.5 19 19 19z"
    fill="currentColor"></path>
  <path
    d="M267 136V56H136c-17.6 0-32 14.4-32 32v336c0 17.6 14.4 32 32 32h240c17.6 0 32-14.4 32-32V181h-96c-24.8 0-45-20.2-45-45z"
    fill="currentColor"></path>
</svg>
`;

function createIcon(icon: string): SVGElement {
  const template = document.createElement("template");
  template.innerHTML = icon.trim();
  return template.content.firstChild as SVGElement;
}

export default class DroppedFile {
  private titleElement: HTMLElement;
  private iconElement: SVGElement;
  private statusElement: HTMLElement;
  private progressElement: HTMLElement;
  private uploadProgressBarElement: HTMLElement;
  private encryptProgressBarElement: HTMLElement;

  public element: HTMLElement;
  public file: File;

  constructor(file: File) {
    this.element = document.createElement("li");
    this.element.classList.add("dropped-file");

    this.file = file;

    this.iconElement = createIcon(FileIcon);
    this.iconElement.classList.add("icon");
    this.element.appendChild(this.iconElement);

    this.titleElement = document.createElement("p");
    this.titleElement.classList.add("title");
    this.titleElement.textContent = file.name;
    this.element.appendChild(this.titleElement);

    this.statusElement = document.createElement("p");
    this.statusElement.classList.add("status");
    this.statusElement.textContent = "0%";
    this.element.appendChild(this.statusElement);

    this.progressElement = document.createElement("div");
    this.progressElement.classList.add("progress");
    this.element.appendChild(this.progressElement);

    this.uploadProgressBarElement = document.createElement("div");
    this.uploadProgressBarElement.classList.add("upload");
    this.progressElement.appendChild(this.uploadProgressBarElement);

    this.encryptProgressBarElement = document.createElement("div");
    this.encryptProgressBarElement.classList.add("encrypt");
    this.progressElement.appendChild(this.encryptProgressBarElement);
  }

  setUploadProgress(value: number) {
    this.uploadProgressBarElement.style.width = `${Math.round(value * 100)}%`;
    this.statusElement.innerText = `${Math.round(value * 100)}%`;
  }

  setEncryptProgress(value: number) {
    this.encryptProgressBarElement.style.width = `${Math.round(value * 100)}%`;
  }
}
