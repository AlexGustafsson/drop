import DroppedFile from "./ui/dropped-file";
import Dropper from "./ui/dropper";

function disableBodyDragAndDrop() {
  document.body.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
  });

  document.body.addEventListener("drop", (event: DragEvent) => {
    event.preventDefault();
  });
}

function parseParameters() {
  const fragments = location.hash.substr(1).split("&").reduce((fragments, fragment) => {
    const [key, value] = fragment.split("=");
    fragments[key] = value;
    return fragments;
  }, {})

  return {token: fragments["token"] || null, secret: fragments["secret"] || null};
}

function parseClaims(token: string) {
  const claims = JSON.parse(atob(token.split(".")[1]));
  return {
    maximumFileCount: claims["mfc"] || 0,
    maximumFileSize: claims["mfs"] || 0,
    maximumSize: claims["ms"] || 0,
    expiresAt: new Date(claims["exp"] * 1000),
    id: claims["jti"],
    issuer: claims["iss"],
  };
}

async function main() {
  let { token, secret } = parseParameters();
  if (token === null) {
    // TODO: Show a in-page notification instead
    alert("Unauthorized: No token present");
    return;
  }

  const claims = parseClaims(token);

  const main = document.getElementById("main");

  const dropper = new Dropper(document.getElementById("dropper"), {
    maximumFileCount: claims.maximumFileCount,
    maximumFileSize: claims.maximumFileSize,
    maximumSize: claims.maximumSize,
  });
  const fileList = document.getElementById("files");
  const fileScroller = document.getElementById("file-scroller");

  disableBodyDragAndDrop();

  dropper.addEventListener("drop", (files: File[]) => {
    if (secret === null)
      secret = prompt("Secret");

    // Allow 3.5 dropped files to be shown (makes it easier to see that the
    // content may be scrolled once it surpasses four files
    main.style.height = `${400 + 70 * Math.min(dropper.files.length, 3.5)}px`;
    for (const file of files) {
      const droppedFile = new DroppedFile(file);
      console.log(droppedFile);
      fileList.appendChild(droppedFile.element);
      if (dropper.files.length > 3)
        fileScroller.scrollTo(0, fileScroller.scrollHeight);
    }
  });
}

document.addEventListener("DOMContentLoaded", main);
