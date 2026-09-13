import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@rpg/ui'
import type { ContentUsageBlocker } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import { ContentDeletionBlockedDialog } from '../../lib/delete/content-deletion-blocked-dialog'
import { fetchSpeciesHeritageRemovalAvailability } from '../api/species-api'
import { HERITAGE_GROUP_NAME_FALLBACK } from '../lib/species-heritage-form-labels'

type UseHeritageRemovalFlowOptions = {
  campaignId?: string
  speciesId?: string
  heritageName?: string
  onRemoved: () => void
}

export function useHeritageRemovalFlow({
  campaignId,
  speciesId,
  heritageName,
  onRemoved,
}: UseHeritageRemovalFlowOptions) {
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const [removeError, setRemoveError] = useState<string | null>(null)

  const displayName = heritageName?.trim() || HERITAGE_GROUP_NAME_FALLBACK

  const handleRemoveClick = useCallback(async () => {
    if (checkingAvailability) return

    setRemoveError(null)

    if (!campaignId || !speciesId) {
      setConfirmOpen(true)
      return
    }

    setCheckingAvailability(true)
    try {
      const availability = await fetchSpeciesHeritageRemovalAvailability(campaignId, speciesId)
      if (availability.status === 'blocked') {
        setBlockers(availability.blockers)
        setBlockedOpen(true)
        return
      }
      setConfirmOpen(true)
    } catch (err) {
      setRemoveError(getErrorMessage(err, 'Could not check whether heritage can be removed.'))
    } finally {
      setCheckingAvailability(false)
    }
  }, [campaignId, checkingAvailability, speciesId])

  const handleConfirmRemove = useCallback(() => {
    onRemoved()
    setConfirmOpen(false)
  }, [onRemoved])

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        headline="Remove heritage group?"
        description={
          <>
            Remove <strong>{displayName}</strong> and all of its options from this species?
          </>
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        onConfirm={handleConfirmRemove}
      />
      <ContentDeletionBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        entityName={displayName}
        blockers={blockers}
      />
    </>
  )

  return {
    removePending: checkingAvailability,
    removeError,
    handleRemoveClick,
    dialogs,
  }
}
