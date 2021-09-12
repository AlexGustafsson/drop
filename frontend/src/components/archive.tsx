import { ArchiveResponse } from "drop-client";
import React from "react";

import { SVG as FileIcon } from "../assets/file-icon.svg";
import { SVG as MoreIcon } from "../assets/ion-more.svg";
import { Link } from "react-router-dom";
import { ContextMenuParams, TriggerEvent } from "react-contexify";

type ArchiveProps = {
  archive: ArchiveResponse
  onMore: (event: TriggerEvent, params?: Pick<ContextMenuParams, "id" | "props" | "position"> | undefined) => void
};

const Archive = ({ archive, onMore }: ArchiveProps): JSX.Element => {
  function handleOnMore(event: React.MouseEvent) {
    onMore(event, {props: archive});
  }

  return <Link to="/archives/archive">
    <div className="relative bg-white rounded-xl p-5">
      <MoreIcon className="absolute w-6 text-gray-500 top-2 right-2 cursor-pointer" onClick={handleOnMore} />
      <FileIcon className="w-8 text-primary" />
      <p className="text-lg text-gray">{archive.name}</p>
    </div>
  </Link>
};
export default Archive;
