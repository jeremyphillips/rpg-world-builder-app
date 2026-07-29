'use client'

import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'

import { useDeleteCharacter } from '../../hooks/use-delete-character'
import type { CharacterDetailViewModel } from '../../lib/display/character-display'
import { CharacterDetailAbilitiesRow } from './character-detail-abilities-row.client'
import { CharacterDetailCombatRow } from './character-detail-combat-row.client'
import { CharacterDetailHeader } from './character-detail-header.client'
import {
  characterDetailAbilitiesStatsSectionClasses,
  characterDetailBodyGridClasses,
} from './character-detail-sheet.variants'
import { CharacterDetailStatsRow } from './character-detail-stats-row.client'
import { CharacterDetailTabs } from './character-detail-tabs.client'

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
  statusSummary?: ReactNode
  statusActions?: ReactNode
  identitySupplement?: ReactNode
}

/**
 * Read-only character sheet driven by the display registry view model.
 *
 * Shared by PC detail (`/characters/:id`) and NPC detail (`/campaigns/:id/npcs/:npcId`).
 *
 * Growth direction (phase 7 — detail polish):
 * - Keep sheet layout, tabs, and catalog rows kind-neutral here and in child `character-detail-*`
 *   components; both kinds use the same `CharacterDetailViewModel`.
 * - Route wrappers own kind-specific data loading and mutations (PC vs campaign NPC API).
 * - Hide user-ownership affordances on NPC surfaces: roster/submit-to-campaign links, PC delete
 *   defaults (`useDeleteCharacter`, `ROUTES.characters.list`), and copy that implies "your
 *   character". NPC routes should pass `deleteConfig` / `showDelete` instead of relying on PC
 *   defaults (see `npc-detail.tsx`).
 * - When adding PC-only actions (edit, campaign submission, transfer), gate with an explicit prop
 *   or `characterKind` — do not assume every detail view is user-owned.
 */
export function CharacterDetailContent({
  viewModel,
  showDelete = true,
  deleteConfig,
  statusSummary,
  statusActions,
  identitySupplement,
}: CharacterDetailContentProps) {
  useSetBreadcrumbLabel(viewModel.identity.name)
  const navigate = useNavigate()
  const deleteCharacter = useDeleteCharacter()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const deleteDialogOpen = deleteConfig?.open ?? confirmDeleteOpen
  const setDeleteDialogOpen = deleteConfig?.onOpenChange ?? setConfirmDeleteOpen

  const handleDelete = () => {
    if (deleteConfig) {
      deleteConfig.onConfirm()
      return
    }

    deleteCharacter.mutate(viewModel.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        void navigate(ROUTES.characters.list)
      },
    })
  }

  return (
    <div className="space-y-6">
      <CharacterDetailHeader
        name={viewModel.identity.name}
        summary={viewModel.identity.summary}
        xp={viewModel.identity.xp}
        statusSummary={statusSummary}
        statusActions={statusActions}
        identitySupplement={identitySupplement}
        showDelete={showDelete}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      <div className={characterDetailAbilitiesStatsSectionClasses}>
        <CharacterDetailAbilitiesRow abilities={viewModel.abilities} />
        <CharacterDetailStatsRow stats={viewModel.stats} hitPoints={viewModel.hitPoints} />
      </div>
      <div className={characterDetailBodyGridClasses}>
        <CharacterDetailCombatRow
          actions={viewModel.actions}
          savingThrows={viewModel.savingThrows}
          proficiencies={viewModel.proficiencies}
        />
        <CharacterDetailTabs
          spells={viewModel.spells}
          equipment={viewModel.equipment}
          wealth={viewModel.wealth}
          classFeatures={viewModel.classFeatures}
          speciesTraits={viewModel.speciesTraits}
          feats={viewModel.feats}
          connections={viewModel.connections}
          narrative={viewModel.narrative}
        />
      </div>

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
    </div>
  )
}
