'use client'

import { useState } from 'react'
import { ConfirmDialog, RowActionsMenu } from '@rpg/ui'
import { Pencil, Trash2 } from 'lucide-react'
import type {
  CampaignAvailabilityFilter,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { ContentCampaignAvailabilityAction } from '@/features/content/lib/overview/content-campaign-availability-action.client'

import { useVocabularyAvailabilityToggle } from '../hooks/use-vocabulary-availability-toggle.client'
import { VocabularyAvailabilityBlockedDialog } from './vocabulary-availability-blocked-dialog.client'

type VocabularyRowActionsProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  canManage: boolean
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  onEdit: (entry: VocabularyOptionWithUsage) => void
  onDelete: (entry: VocabularyOptionWithUsage) => void
  onStatusChanged?: () => void
}

/** Row actions for vocabulary table — edit, availability toggle, delete custom entries. */
export function VocabularyRowActions({
  campaignId,
  setId,
  entry,
  canManage,
  campaignAvailabilityFilter,
  onEdit,
  onDelete,
  onStatusChanged,
}: VocabularyRowActionsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const { pending, blockedOpen, setBlockedOpen, blockers, handleAvailableChange } =
    useVocabularyAvailabilityToggle({
      campaignId,
      setId,
      entry,
      campaignAvailabilityFilter,
      onStatusChanged,
    })

  if (!canManage) return null

  const canDelete = entry.source === 'campaign'

  return (
    <>
      <RowActionsMenu
        triggerLabel={`Open actions for ${entry.label}`}
        contentClassName="w-72"
        items={[
          {
            kind: 'action',
            id: 'edit',
            label: 'Edit',
            icon: <Pencil />,
            onSelect: () => onEdit(entry),
          },
          ...(canDelete
            ? [
                {
                  kind: 'action' as const,
                  id: 'delete',
                  label: 'Delete',
                  icon: <Trash2 />,
                  destructive: true,
                  separatorBefore: true,
                  onSelect: () => setConfirmDeleteOpen(true),
                },
              ]
            : []),
        ]}
        footer={
          <ContentCampaignAvailabilityAction
            available={entry.status === 'active'}
            pending={pending}
            onAvailableChange={handleAvailableChange}
            sectionLegend="Availability"
          />
        }
      />

      <VocabularyAvailabilityBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        campaignId={campaignId}
        blockers={blockers}
      />

      {canDelete ? (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          headline="Delete vocabulary entry?"
          description={
            <>
              Permanently delete <strong>{entry.label}</strong>? This cannot be undone.
            </>
          }
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={() => {
            onDelete(entry)
            setConfirmDeleteOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
