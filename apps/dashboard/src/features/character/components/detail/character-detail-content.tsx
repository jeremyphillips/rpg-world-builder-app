import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentUsageBlocker } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { ContentDeletionBlockedDialog } from '@/features/content'

import { useDeleteCharacter } from '../../hooks/use-delete-character'
import type { CharacterDetailViewModel } from '../../lib/display/character-display'
import { CharacterDetailSheet } from './character-detail-sheet'

export type CharacterDetailDeleteConfig = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
  headline?: string
  description?: ReactNode
}

export type CharacterDetailContentProps = {
  viewModel: CharacterDetailViewModel
  showDelete?: boolean
  deleteConfig?: CharacterDetailDeleteConfig
  identityMedia?: ReactNode
  statusSummary?: ReactNode
  statusActions?: ReactNode
  identitySupplement?: ReactNode
}

/**
 * Route controller for PC and NPC detail — breadcrumb, delete, and dialogs.
 * Sheet layout lives in {@link CharacterDetailSheet}.
 */
export function CharacterDetailContent({
  viewModel,
  showDelete = true,
  deleteConfig,
  identityMedia,
  statusSummary,
  statusActions,
  identitySupplement,
}: CharacterDetailContentProps) {
  useSetBreadcrumbLabel(viewModel.identity.name)
  const navigate = useNavigate()
  const deleteCharacter = useDeleteCharacter()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteBlockersOpen, setDeleteBlockersOpen] = useState(false)
  const [deleteBlockers, setDeleteBlockers] = useState<ContentUsageBlocker[]>([])

  const deleteDialogOpen = deleteConfig?.open ?? confirmDeleteOpen
  const setDeleteDialogOpen = deleteConfig?.onOpenChange ?? setConfirmDeleteOpen

  const handleDelete = () => {
    if (deleteConfig) {
      deleteConfig.onConfirm()
      return
    }

    deleteCharacter.mutate(viewModel.id, {
      onSuccess: (result) => {
        if (result.status === 'blocked') {
          setConfirmDeleteOpen(false)
          setDeleteBlockers(result.blockers)
          setDeleteBlockersOpen(true)
          return
        }

        setConfirmDeleteOpen(false)
        void navigate(ROUTES.characters.list)
      },
    })
  }

  return (
    <>
      <CharacterDetailSheet
        viewModel={viewModel}
        identityMedia={identityMedia}
        statusSummary={statusSummary}
        statusActions={statusActions}
        identitySupplement={identitySupplement}
        showDelete={showDelete}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        headline={deleteConfig?.headline ?? 'Delete character?'}
        description={
          deleteConfig?.description ?? (
            <>
              Permanently delete <strong>{viewModel.identity.name}</strong>? This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />

      <ContentDeletionBlockedDialog
        open={deleteBlockersOpen}
        onOpenChange={setDeleteBlockersOpen}
        entityName={viewModel.identity.name}
        blockers={deleteBlockers}
      />
    </>
  )
}
