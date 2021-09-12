import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import { useApi } from "../lib/api";
import { ArchiveResponse } from "drop-client";
import Archive from "../components/archive";
import { useSnackbars } from "../components/snackbar";
import { FormattedMessage } from "react-intl";
import Modal from "../components/modal";

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

  const [showShareArchiveModal, setShowShareArchiveModal] = useState(false);

  const [archiveShareLink, setArchiveShareLink] = useState("");
  const archiveContextMenu = useContextMenu({
    id: "archive-context-menu"
  });

  function showArchive({ props }: ItemParams<ArchiveResponse>) {
    history.push(`/archives/${props?.id}`);
  }

  function shareArchive({ props }: ItemParams<ArchiveResponse>) {
    setShowShareArchiveModal(true)
  }

  function toggleShareArchiveModal() {
    setShowShareArchiveModal(!showShareArchiveModal);
  }

  async function deleteArchive({ props }: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id);
      setArchives(archives.filter(x => x.id !== props!.id));
    } catch (error) {
      if (error.error)
        snackbars.show({ title: "An error occured", body: error.error.error, type: "error" });
      else
        snackbars.show({ title: "An error occured", body: error.toString(), type: "error" });
    }
  }

  return <main className="container relative flex flex-col w-full">
    {
      archive !== null &&
      <Archive key={archive.id} archive={archive} onMore={archiveContextMenu.show} />
    }
  </main>
};

export default ArchiveView;
