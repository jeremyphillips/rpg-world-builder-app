import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentUsageBlocker } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { ContentDeletionBlockedDialog } from '@/features/content'

import type { CharacterDetailDeleteConfig } from '../../components/detail/character-detail-content'
import { useDeleteNpc } from './use-delete-npc'

type UseNpcDeleteFlowOptions = {
  campaignId: string
  npcId: string | undefined
  entityName: string
}

export function useNpcDeleteFlow({ campaignId, npcId, entityName }: UseNpcDeleteFlowOptions) {
  const navigate = useNavigate()
  const deleteNpc = useDeleteNpc()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteBlockersOpen, setDeleteBlockersOpen] = useState(false)
  const [deleteBlockers, setDeleteBlockers] = useState<ContentUsageBlocker[]>([])

  const handleDelete = useCallback(() => {
    if (!npcId) return

    deleteNpc.mutate(
      { campaignId, npcId },
      {
        onSuccess: (result) => {
          if (result.status === 'blocked') {
            setConfirmDeleteOpen(false)
            setDeleteBlockers(result.blockers)
            setDeleteBlockersOpen(true)
            return
          }

          setConfirmDeleteOpen(false)
          void navigate(ROUTES.campaign.npcs.list(campaignId))
        },
      },
    )
  }, [campaignId, deleteNpc, navigate, npcId])

  const deleteConfig: CharacterDetailDeleteConfig = {
    open: confirmDeleteOpen,
    onOpenChange: setConfirmDeleteOpen,
    onConfirm: handleDelete,
    isPending: deleteNpc.isPending,
    headline: 'Delete NPC?',
    description: (
      <>
        Permanently delete <strong>{entityName}</strong>? This cannot be undone.
      </>
    ),
  }

  const blockedDialog = (
    <ContentDeletionBlockedDialog
      open={deleteBlockersOpen}
      onOpenChange={setDeleteBlockersOpen}
      entityName={entityName}
      blockers={deleteBlockers}
    />
  )

  return { deleteConfig, blockedDialog }
}
