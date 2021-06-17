import React from "react";

import {SVG as FileIcon} from "../assets/file-icon.svg";

type DroppedFileProps = {
  title: string,
  uploadProgress: number,
  encryptionProgress: number,
};

const DroppedFile = ({title, uploadProgress}: DroppedFileProps): JSX.Element => {
  return <li className="grid grid-rows-2 grid-cols-triple h-16">
    <FileIcon className="w-14 row-span-full animate-move-in animation-delay-2 text-primary" />
    <p className="col-start-2 animate-move-in animation-delay-4">{title}</p>
    <p className="col-start-3 animate-move-in text-right animation-delay-6">{Math.round(uploadProgress * 100)}%</p>
    <div className="relative row-span-2 col-start-2 col-span-2 bg-gray-50 h-3 w-full rounded-md animate-fade-in animation-delay-8">
      <div className="absolute h-3 rounded-md bg-secondary transition-all" style={{ width: 0.5 * 100 }}></div>
      <div className="absolute h-3 rounded-md bg-primary transition-all" style={{ width: 0.2 * 100 }}></div>
    </div>
  </li>
};
export default DroppedFile;
