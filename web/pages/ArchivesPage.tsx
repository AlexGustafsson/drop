import { ArchiveResponse } from 'drop-client'
import React, { useEffect, useState } from 'react'
import { Item, ItemParams, Menu, useContextMenu } from 'react-contexify'
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import Archive from '../components/Archive'
import Modal from '../components/Modal'
import { useSnackbars } from '../components/Snackbar'
import { useApi } from '../lib/api'

export default function (): JSX.Element {
  const navigate = useNavigate()

  const snackbars = useSnackbars()

  const [archives, setArchives] = useState<ArchiveResponse[]>([])
  const api = useApi()
  useEffect(() => {
    api.archives
      .archivesList()
      .then((result) => setArchives(result.data.archives))
      .catch((error) => {
        if (error.error)
          snackbars.show({
            title: 'An error occured',
            body: error.error.error,
            type: 'error',
          })
        else
          snackbars.show({
            title: 'An error occured',
            body: error.toString(),
            type: 'error',
          })
      })
  }, [])

  const [showShareArchiveModal, setShowShareArchiveModal] = useState(false)

  const [archiveShareLink, setArchiveShareLink] = useState('')
  const archiveContextMenu = useContextMenu({
    id: 'archive-context-menu',
  })

  function showArchive({ props }: ItemParams<ArchiveResponse>) {
    navigate(`/archives/${props?.id}`)
  }

  function shareArchive({ props }: ItemParams<ArchiveResponse>) {
    setShowShareArchiveModal(true)
  }

  function toggleShareArchiveModal() {
    setShowShareArchiveModal(!showShareArchiveModal)
  }

  async function deleteArchive({ props }: ItemParams<ArchiveResponse>) {
    try {
      await api.archives.archivesDelete(props!.id)
      setArchives(archives.filter((x) => x.id !== props!.id))
    } catch (error) {
      snackbars.show({
        title: 'An error occured',
        body: `${error}`,
        type: 'error',
      })
    }
  }

  const archiveElements = archives.map((archive) => (
    <Archive
      key={archive.id}
      archive={archive}
      onMore={archiveContextMenu.show}
    />
  ))

  return (
    <main className="container relative flex flex-col w-full">
      {showShareArchiveModal && (
        <Modal
          className="flex items-center place-content-center"
          onClick={toggleShareArchiveModal}
        >
          <main className="flex flex-col items-center w-72 justify-items-center py-3 bg-white rounded-xl">
            <a className="text-primary" href={archiveShareLink}>
              <FormattedMessage id="actions.copy" />
            </a>
          </main>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-5">{archiveElements}</div>

      <Menu id="archive-context-menu" animation={false}>
        <Item onClick={showArchive}>Show archive</Item>
        <Item onClick={shareArchive}>Share</Item>
        <Item className="danger" onClick={deleteArchive}>
          Delete
        </Item>
      </Menu>
    </main>
  )
}
