import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import { useApi } from "../lib/api";
import { FileResponse } from "drop-client";
import File from "../components/file";
import { useSnackbars } from "../components/snackbar";

const FilesView = (): JSX.Element => {
  const history = useHistory();

  const snackbars = useSnackbars();

  const [files, setFiles] = useState<FileResponse[]>([]);
  const api = useApi();
  useEffect(() => {
    api.files.filesList()
      .then(result => setFiles(result.data.files))
      .catch(error => {
        if (error.error)
          snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
        else
          snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
      });
  }, []);

  const fileContextMenu = useContextMenu({
    id: "file-context-menu"
  });

  function showArchive({ props }: ItemParams<FileResponse>) {
    history.push(`/archives/${props?.archiveId}`);
  }

  async function deleteFile({ props }: ItemParams<FileResponse>) {
    try {
      await api.archives.filesDelete(props!.archiveId, props!.id);
      setFiles(files.filter(x => x.id !== props!.id));
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
  }

  const fileElements = files.map(file => <File key={file.id} file={file} onMore={fileContextMenu.show} />);

  return <main className="container relative flex flex-col w-full">
    <div className="grid grid-cols-3 gap-5">
      {fileElements}
    </div>

    <Menu id="file-context-menu" animation={false}>
      <Item onClick={showArchive}>Download</Item>
      <Item onClick={showArchive}>Show archive</Item>
      <Item className="danger" onClick={deleteFile}>Delete</Item>
    </Menu>
  </main>
};

export default FilesView;
