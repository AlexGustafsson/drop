import { Endianness, getEndianness } from "./lib/endianness";
import {generateKey, generateNonce, hexToBuffer} from "./lib/crypto/utils";
import {encryptFile} from "./lib/crypto/chacha20";
import DroppedFile from "./ui/dropped-file";
import Dropper from "./ui/dropper";
import FileUploader from "./lib/FileUploader";

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
    archiveId: claims["arc"],
    expiresAt: new Date(claims["exp"] * 1000),
    id: claims["jti"],
    issuer: claims["iss"],
  };
}

async function main() {
  if (getEndianness() !== Endianness.Little) {
    alert("Currently, this application only supports little endian systems");
    return;
  }

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

  const fileUploader = new FileUploader(token, claims.archiveId, hexToBuffer(secret), new ArrayBuffer(10));

  // TODO: fix this ugly hack
  const filesList: File[] = [];
  const droppedFileList: DroppedFile[] = [];

  fileUploader.addEventListener("done", file => {
    console.log("Done", file);
    const index = filesList.indexOf(file);
    const droppedFile = droppedFileList[index];
    droppedFile.setProgress(1);
  });

  fileUploader.addEventListener("error", (file, error: Error) => {
    console.error("Error", file, error);
  });

  dropper.addEventListener("drop", (files: File[]) => {
    if (secret === null)
      secret = prompt("Secret");

    // Allow 3.5 dropped files to be shown (makes it easier to see that the
    // content may be scrolled once it surpasses four files
    main.style.height = `${400 + 70 * Math.min(dropper.files.length, 3.5)}px`;
    for (const file of files) {
      const droppedFile = new DroppedFile(file);
      fileList.appendChild(droppedFile.element);
      if (dropper.files.length > 3)
        fileScroller.scrollTo(0, fileScroller.scrollHeight);

      droppedFileList.push(droppedFile);
      filesList.push(file);
      fileUploader.upload(file);
    }
  });
}

document.addEventListener("DOMContentLoaded", main);
