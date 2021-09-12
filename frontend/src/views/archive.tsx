import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import { useApi } from "../lib/api";
import { ArchiveResponse, FileResponse } from "drop-client";
import Archive from "../components/archive";
import File from "../components/file";
import { useSnackbars } from "../components/snackbar";

const ArchiveView = (): JSX.Element => {
  const history = useHistory();

  const snackbars = useSnackbars();

  const [archive, setArchive] = useState<ArchiveResponse|null>(null);

  const params = useParams<{archiveId: string}>();

  const api = useApi();
  useEffect(() => {
    api.archives.archivesDetail(params.archiveId)
      .then(result => setArchive(result.data))
      .catch(error => {
        if (error.error)
          snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
        else
          snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
      });
  }, []);

  const [files, setFiles] = useState<FileResponse[]>([]);
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

  async function deleteArchive({ props }: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id);
      history.push("/");
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
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


  const fileElements = files.map(file => <File key={file.id} file={file} onMore={() => { }} />);

  return <main className="container relative flex flex-col w-full">
    {
      archive !== null &&
      <Archive key={archive.id} archive={archive} onMore={() => {}} />
    }

    <main className="mr-80 p-5">
      <h1 className="text-lg text-gray-800 mt-5 mb-2">Files</h1>
      <div className="grid gap-y-2">
        <div className="grid grid-cols-table-5 text-sm text-gray-500 p-2">
          <p>Name</p>
          <p>File Format</p>
          <p>Uploaded</p>
          <p>Size</p>
        </div>
        {fileElements}
      </div>
    </main>
  </main>
};

export default ArchiveView;
