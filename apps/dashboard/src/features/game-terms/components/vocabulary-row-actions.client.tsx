'use client'

import { useState } from 'react'
import { ConfirmDialog, RowActionsMenu } from '@rpg/ui'
import { Trash2 } from 'lucide-react'
import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { getVocabularySetCapability } from '@rpg/contracts'

import { ContentCampaignAvailabilityAction } from '@/features/content/lib/overview/content-campaign-availability-action.client'

import {
  fetchVocabularyDeleteAvailability,
  VOCABULARY_DELETE_BLOCKED_DESCRIPTION,
  VOCABULARY_DELETE_BLOCKED_HEADLINE,
} from '@/features/vocabulary'

import { useVocabularyAvailabilityToggle } from '../hooks/use-vocabulary-availability-toggle.client'
import { VocabularyAvailabilityBlockedDialog } from './vocabulary-availability-blocked-dialog.client'

type VocabularyRowActionsProps = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  canManage: boolean
  onDelete: (entry: VocabularyOptionWithUsage) => void
}

/** Row actions for vocabulary table — availability toggle and delete custom entries. */
export function VocabularyRowActions({
  campaignId,
  setId,
  entry,
  canManage,
  onDelete,
}: VocabularyRowActionsProps) {
  const capabilities = getVocabularySetCapability(setId)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteBlockedOpen, setDeleteBlockedOpen] = useState(false)
  const [deleteBlockers, setDeleteBlockers] = useState<ContentUsageBlocker[]>([])
  const { pending, blockedOpen, setBlockedOpen, blockers, handleAvailableChange } =
    useVocabularyAvailabilityToggle({
      campaignId,
      setId,
      entry,
    })

  const canDeleteEntry = capabilities.delete && entry.source === 'campaign'
  const canToggleAvailability = capabilities.availability
  const hasMenuActions = canDeleteEntry || canToggleAvailability

  if (!canManage || !hasMenuActions) return null

  async function handleDeleteConfirm() {
    if (capabilities.deleteGuard) {
      const availability = await fetchVocabularyDeleteAvailability(campaignId, setId, entry.id)
      if (availability.status === 'blocked') {
        setDeleteBlockers(availability.blockers)
        setDeleteBlockedOpen(true)
        setConfirmDeleteOpen(false)
        return
      }
    }

    onDelete(entry)
    setConfirmDeleteOpen(false)
  }

  const menuItems = canDeleteEntry
    ? [
        {
          kind: 'action' as const,
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 />,
          destructive: true,
          onSelect: () => setConfirmDeleteOpen(true),
        },
      ]
    : []

  return (
    <>
      <RowActionsMenu
        triggerLabel={`Open actions for ${entry.label}`}
        contentClassName="w-72"
        items={menuItems}
        footer={
          canToggleAvailability ? (
            <ContentCampaignAvailabilityAction
              available={entry.status === 'active'}
              pending={pending}
              onAvailableChange={handleAvailableChange}
              sectionLegend="Availability"
            />
          ) : undefined
        }
      />

      <VocabularyAvailabilityBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        campaignId={campaignId}
        blockers={blockers}
      />

      <VocabularyAvailabilityBlockedDialog
        open={deleteBlockedOpen}
        onOpenChange={setDeleteBlockedOpen}
        campaignId={campaignId}
        blockers={deleteBlockers}
        headline={VOCABULARY_DELETE_BLOCKED_HEADLINE}
        description={VOCABULARY_DELETE_BLOCKED_DESCRIPTION}
      />

      {canDeleteEntry ? (
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
            void handleDeleteConfirm()
          }}
        />
      ) : null}
    </>
  )
}
