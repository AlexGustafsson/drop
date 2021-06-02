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

async function main() {
  disableBodyDragAndDrop();

  const main = document.getElementById("main");

  const dropper = new Dropper(document.getElementById("dropper"));
  const fileList = document.getElementById("files");
  const fileScroller = document.getElementById("file-scroller");

  dropper.addEventListener("drop", (files: File[]) => {
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
