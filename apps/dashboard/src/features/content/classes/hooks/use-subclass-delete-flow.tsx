import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@rpg/ui'
import type { ContentUsageBlocker } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import { ContentDeletionBlockedDialog } from '../../lib/delete/content-deletion-blocked-dialog'
import { fetchSubclassDeletionAvailability } from '../api/subclasses-api'
import { useDeleteSubclass } from './use-subclass-mutations'
import { isDraftSubclassId } from '../lib/subclasses/subclass-editor-constants'

type UseSubclassDeleteFlowOptions = {
  campaignId: string
  classId: string
  onDeleted: (subclassId: string) => void
}

export function useSubclassDeleteFlow({
  campaignId,
  classId,
  onDeleted,
}: UseSubclassDeleteFlowOptions) {
  const deleteMutation = useDeleteSubclass(campaignId, classId)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  const handleDeleteClick = useCallback(
    async (subclassId: string, subclassName: string, source: 'system' | 'homebrew' | 'unsaved') => {
      if (source !== 'homebrew' || isDraftSubclassId(subclassId) || checkingAvailability) return

      setDeleteError(null)
      setCheckingAvailability(true)
      setPendingDelete({ id: subclassId, name: subclassName })
      try {
        const availability = await fetchSubclassDeletionAvailability(
          campaignId,
          classId,
          subclassId,
        )
        if (availability.status === 'blocked') {
          setBlockers(availability.blockers)
          setBlockedOpen(true)
          return
        }
        setConfirmOpen(true)
      } catch (err) {
        setDeleteError(
          getErrorMessage(err, 'Could not check whether this subclass can be deleted.'),
        )
      } finally {
        setCheckingAvailability(false)
      }
    },
    [campaignId, checkingAvailability, classId],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return

    setDeleteError(null)
    try {
      const result = await deleteMutation.mutateAsync(pendingDelete.id)
      if (result.status === 'blocked') {
        setConfirmOpen(false)
        setBlockers(result.blockers)
        setBlockedOpen(true)
        return
      }

      setConfirmOpen(false)
      onDeleted(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setConfirmOpen(false)
      setDeleteError(getErrorMessage(err, 'Could not delete this subclass.'))
    }
  }, [deleteMutation, onDeleted, pendingDelete])

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        headline="Delete subclass?"
        description={
          <>
            Permanently delete <strong>{pendingDelete?.name ?? 'this subclass'}</strong>? This
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
      <ContentDeletionBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        entityName={pendingDelete?.name ?? 'Subclass'}
        blockers={blockers}
      />
    </>
  )

  return {
    deletePending: checkingAvailability || deleteMutation.isPending,
    deleteError,
    handleDeleteClick,
    dialogs,
  }
}
