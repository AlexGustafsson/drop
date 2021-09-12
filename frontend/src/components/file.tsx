import { FileResponse } from "drop-client";
import React from "react";

import { SVG as FileIcon } from "../assets/file-icon.svg";
import { SVG as MoreIcon } from "../assets/ion-more.svg";
import { Link } from "react-router-dom";
import { ContextMenuParams, TriggerEvent } from "react-contexify";
import { humanReadableBytes, humanReadableDuration } from "../lib/utils";

type FileProps = {
  file: FileResponse
  onMore: (event: TriggerEvent, params?: Pick<ContextMenuParams, "id" | "props" | "position"> | undefined) => void
};

const File = ({ file, onMore }: FileProps): JSX.Element => {
  function handleOnMore(event: React.MouseEvent) {
    onMore(event, {props: file});
  }

  return <Link to={`/files/${file.id}`}>
    <div className="grid grid-cols-table-5 bg-white items-center p-2 rounded-xl">
      <div className="flex flex-row items-center">
        <FileIcon className="w-6 mr-2 text-primary" />
        <p>{file.name}</p>
      </div>
      <p>{file.mime}</p>
      <p>{humanReadableDuration(file.created)}</p>
      <p>{humanReadableBytes(file.size)}</p>
      <MoreIcon className="w-6 text-gray-500 top-2 right-2 cursor-pointer" onClick={handleOnMore} />
    </div>
  </Link>
};
export default File;
